import { redirectToHome } from '../utils/navigationService';
import { toKstDateString, toKstTimeString } from '../utils/date';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api'; // 백엔드 API 기본 URL

interface WorkoutPartResponse {
  id: number;
  name: string;
  editable: boolean; // 본인이 만든 부위만 true (공용 부위는 수정/삭제 불가)
}

export interface WorkoutResponse {
  id: number;
  name: string;
  bodyPart: string;
  bodyPartId: number;
  editable: boolean; // 본인이 만든 운동만 true (공용 운동은 수정/삭제 불가)
}

// API 오류. 서버 오류 응답 형식 {code, message, requestId} 를 그대로 담는다.
// - status: HTTP 상태 (네트워크 오류·시간 초과는 0)
// - code: 서버 오류 코드 (NOT_FOUND, CONFLICT 등) 또는 NETWORK / TIMEOUT
// - requestId: 서버 로그와 같은 값. 사용자 문의 시 해당 요청을 찾는 데 사용
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly requestId?: string;

  constructor(message: string, status: number, code?: string, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

// Cloud Run 콜드스타트를 고려한 요청 제한 시간
const REQUEST_TIMEOUT_MS = 20_000;

const newRequestId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

// 제한 시간과 requestId 를 붙여 요청한다. 네트워크 오류·시간 초과는 status 0 의 ApiError 로 바꾼다.
const sendRequest = async (url: string, options: RequestInit | undefined, headers: Record<string, string>): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const requestId = newRequestId();
  try {
    return await fetch(url, { ...options, headers: { ...headers, 'X-Request-Id': requestId }, signal: controller.signal });
  } catch {
    if (controller.signal.aborted) {
      throw new ApiError('서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.', 0, 'TIMEOUT', requestId);
    }
    throw new ApiError('네트워크 연결을 확인해주세요.', 0, 'NETWORK', requestId);
  } finally {
    clearTimeout(timer);
  }
};

const toApiError = async (response: Response): Promise<ApiError> => {
  const body = await response.json().catch(() => null);
  return new ApiError(
    body?.message || 'API 요청 실패',
    response.status,
    body?.code,
    body?.requestId ?? response.headers.get('X-Request-Id') ?? undefined,
  );
};

let isRedirecting = false;
let refreshPromise: Promise<string | null> | null = null;

// Refresh 요청 1회.
// - 401/400: 로그인 세션이 끝난 것 → null (호출 측에서 로그아웃)
// - 네트워크 오류/5xx: 일시 장애 → 예외 (로그아웃하지 않고 해당 요청만 실패)
const requestTokenRefresh = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  // 네트워크 오류·시간 초과는 sendRequest 가 ApiError(status 0)로 던진다 → 로그아웃하지 않음
  const response = await sendRequest(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  }, { 'Content-Type': 'application/json' });

  if (response.status >= 500) {
    throw await toApiError(response);
  }
  if (!response.ok) return null;

  const data = await response.json();
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return data.accessToken;
};

// 여러 탭이 같은 Refresh 토큰으로 동시에 재발급하지 않도록 Web Locks 로 직렬화한다.
// 락을 얻었을 때 다른 탭이 이미 토큰을 갱신했다면(localStorage 값이 바뀜) 그 토큰을 그대로 쓴다.
const refreshAccessToken = async (staleAccessToken: string | null): Promise<string | null> => {
  const run = async () => {
    const current = localStorage.getItem('accessToken');
    if (current && current !== staleAccessToken) return current;
    return requestTokenRefresh();
  };
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request('fitlog-token-refresh', run);
  }
  return run();
};

export interface LoginTokens {
  accessToken: string;
  refreshToken: string;
  imageUrl: string;
  provider: string;
}

// OAuth 콜백으로 받은 일회용 코드를 토큰으로 교환한다 (코드는 60초, 1회용)
export const exchangeLoginCode = async (code: string): Promise<LoginTokens> => {
  const response = await sendRequest(`${API_BASE_URL}/auth/token`, {
    method: 'POST',
    body: JSON.stringify({ code }),
  }, { 'Content-Type': 'application/json' });
  if (!response.ok) {
    throw await toApiError(response);
  }
  return response.json();
};

// 서버에 저장된 Refresh Token을 폐기한다. 네트워크 실패여도 로컬 로그아웃은 계속 진행해야 하므로 예외를 던지지 않는다.
export const revokeRefreshToken = async (): Promise<void> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return;

  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // 무시: 토큰은 만료 시각이 지나면 어차피 무효화된다
  }
};

const logout = () => {
  if (!isRedirecting) {
    isRedirecting = true;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    redirectToHome();
  }
};

const fetchWithAuth = async (url: string, options?: RequestInit) => {
  const token = localStorage.getItem('accessToken');
  const extraHeaders = (options?.headers ?? {}) as Record<string, string>;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...extraHeaders,
  };

  const response = await sendRequest(url, options, headers);

  if (response.status === 401) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken(token).finally(() => { refreshPromise = null; });
    }

    const newToken = await refreshPromise;

    if (newToken) {
      const retryHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newToken}`,
        ...extraHeaders,
      };
      const retryResponse = await sendRequest(url, options, retryHeaders);

      if (retryResponse.status === 401) {
        logout();
        throw await toApiError(retryResponse);
      }

      if (!retryResponse.ok) {
        throw await toApiError(retryResponse);
      }

      const text = await retryResponse.text();
      return text ? JSON.parse(text) : null;
    }

    logout();
    throw await toApiError(response);
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const getWorkoutParts = async (): Promise<WorkoutPartResponse[]> => {
  return fetchWithAuth(`${API_BASE_URL}/workout/parts`);
};

export const addWorkoutPart = async (name: string): Promise<void> => {
  return fetchWithAuth(`${API_BASE_URL}/workout/parts`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
};

export const updateWorkoutPart = async (id: number, name: string): Promise<void> => {
  return fetchWithAuth(`${API_BASE_URL}/workout/parts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });
};

export const deleteWorkoutPart = async (id: number): Promise<void> => {
  return fetchWithAuth(`${API_BASE_URL}/workout/parts/${id}`, {
    method: 'DELETE',
  });
};

export const getWorkouts = async (): Promise<WorkoutResponse[]> => {
  return fetchWithAuth(`${API_BASE_URL}/workout/workouts`);
};

export const addWorkout = async (name: string, workoutPartId: number): Promise<void> => {
  return fetchWithAuth(`${API_BASE_URL}/workout/workouts`, {
    method: 'POST',
    body: JSON.stringify({ name, workoutPartId }),
  });
};

export const updateWorkout = async (id: number, name: string, workoutPartId: number): Promise<void> => {
  return fetchWithAuth(`${API_BASE_URL}/workout/workouts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, workoutPartId }),
  });
};

export const deleteWorkout = async (id: number): Promise<void> => {
  return fetchWithAuth(`${API_BASE_URL}/workout/workouts/${id}`, {
    method: 'DELETE',
  });
};

// 프로그램 저장을 위한 타입 정의 (BE WorkoutProgramDto.Request 와 동일한 구조)
interface WorkoutSetDto {
  setNumber: number;
  weight?: number;
  reps: number;
  restTime: number;
  memo?: string;
}

export interface WorkoutExerciseDto {
  workoutId: number;
  sets: WorkoutSetDto[];
}

export interface WorkoutPartDto {
  workoutPartId: number;
  exercises: WorkoutExerciseDto[];
}

export interface SaveProgramRequest {
  name: string;
  description: string;
  parts: WorkoutPartDto[];
}

export const saveWorkoutProgram = async (programData: SaveProgramRequest): Promise<void> => {
  return fetchWithAuth(`${API_BASE_URL}/workout-programs`, {
    method: 'POST',
    body: JSON.stringify(programData),
  });
};

export const updateWorkoutProgram = async (programId: number, programData: SaveProgramRequest): Promise<void> => {
  return fetchWithAuth(`${API_BASE_URL}/workout-programs/${programId}`, {
    method: 'PUT',
    body: JSON.stringify(programData),
  });
};

export const deleteWorkoutProgram = async (programId: number): Promise<void> => {
  return fetchWithAuth(`${API_BASE_URL}/workout-programs/${programId}`, {
    method: 'DELETE',
  });
};

// 프로그램 조회 응답을 위한 타입 정의
interface ProgramSetResponse {
  id: number;
  setNumber: number;
  weight?: number;
  reps: number;
  restTime: number;
  memo?: string;
}

interface ProgramExerciseResponse {
  id: number;
  workoutId: number;
  workoutName: string;
  workoutPartName: string;
  order: number;
  sets: ProgramSetResponse[];
}

interface ProgramPartResponse {
  id: number;
  workoutPartId: number;
  workoutPartName: string;
  order: number;
  exercises: ProgramExerciseResponse[];
}

export interface ProgramResponse {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  parts: ProgramPartResponse[];
}

export const getWorkoutPrograms = async (): Promise<ProgramResponse[]> => {
  return fetchWithAuth(`${API_BASE_URL}/workout-programs`);
};

export const getMyInfo = async (): Promise<MemberProfile> => {
  return fetchWithAuth(`${API_BASE_URL}/members/me`);
};

export interface MemberProfile {
  id: number;
  email: string;
  nickname: string;
  imageUrl: string | null;
  provider: string;
  height: number | null;
  weight: number | null;
  goal: string | null;
  experience: string | null;
  createdAt: string;  // "YYYY-MM-DD"
  totalWorkoutDays: number;
  totalCompletedSets: number;
  totalDurationSeconds: number;
}

export interface MemberUpdateRequest {
  nickname: string;
  height: number | null;
  weight: number | null;
  goal: string;
  experience: string;
}

export const getMyProfile = async (): Promise<MemberProfile> => {
  return fetchWithAuth(`${API_BASE_URL}/members/me`);
};

export const updateMyProfile = async (data: MemberUpdateRequest): Promise<MemberProfile> => {
  return fetchWithAuth(`${API_BASE_URL}/members/me`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

// 회원 탈퇴: 서버에서 개인정보·운동 기록·로그인 세션을 모두 파기한다
export const deleteMyAccount = async (): Promise<void> => {
  await fetchWithAuth(`${API_BASE_URL}/members/me`, { method: 'DELETE' });
};

// Workout Session Types
interface SessionSetResponse {
    id: number;
    setNumber: number;
    weight: number;
    reps: number;
    restTime: number;
    memo: string;
    completed: boolean;
    actualWeight?: number;
    actualReps?: number;
    actualMemo?: string;
    completedAt?: string;
}

interface SessionExerciseResponse {
    id: number;
    workoutId: number;
    workoutName: string;
    bodyPart?: string;
    order: number;
    skipped: boolean;
    startedAt?: string;
    sets: SessionSetResponse[];
}

export interface WorkoutSessionResponse {
    id: number;
    workoutProgramId: number;
    workoutProgramName: string;
    startTime: string; // LocalDateTime is serialized as string
    status: 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
    exercises: SessionExerciseResponse[];
    totalPausedSeconds?: number;
    lastPausedAt?: string;
}

export interface CustomExerciseDto {
    workoutId: number;
    order: number;
    sets: {
        setNumber: number;
        weight?: number;
        reps: number;
        restTime: number;
        memo?: string;
    }[];
}

export const startWorkoutSession = async (
    workoutProgramId: number,
    customExercises?: CustomExerciseDto[]
): Promise<WorkoutSessionResponse> => {
    const body: Record<string, unknown> = { workoutProgramId };
    if (customExercises) {
        body.customExercises = customExercises;
    }
    return fetchWithAuth(`${API_BASE_URL}/workout-sessions`, {
        method: 'POST',
        body: JSON.stringify(body),
    });
};

export const getLatestWorkoutSession = async (): Promise<WorkoutSessionResponse | null> => {
    return fetchWithAuth(`${API_BASE_URL}/workout-sessions/latest`);
};

export const completeWorkoutSessionSet = async (
    sessionId: number,
    workoutSessionExerciseId: number,
    workoutSessionSetId: number,
    actualWeight: number | undefined,
    actualReps: number | undefined,
    memo: string | undefined
): Promise<WorkoutSessionResponse> => {
    return fetchWithAuth(`${API_BASE_URL}/workout-sessions/${sessionId}/complete-set`, {
        method: 'PATCH',
        body: JSON.stringify({
            workoutSessionExerciseId,
            workoutSessionSetId,
            actualWeight,
            actualReps,
            memo,
        }),
    });
};

export const pauseWorkoutSession = async (sessionId: number): Promise<WorkoutSessionResponse> => {
    return fetchWithAuth(`${API_BASE_URL}/workout-sessions/${sessionId}/pause`, {
        method: 'PATCH',
    });
};

export const resumeWorkoutSession = async (sessionId: number): Promise<WorkoutSessionResponse> => {
    return fetchWithAuth(`${API_BASE_URL}/workout-sessions/${sessionId}/resume`, {
        method: 'PATCH',
    });
};

export const markExerciseStarted = async (
    sessionId: number,
    exerciseId: number,
    startedAt: number
): Promise<void> => {
    await fetchWithAuth(`${API_BASE_URL}/workout-sessions/${sessionId}/exercises/${exerciseId}/start`, {
        method: 'PATCH',
        body: JSON.stringify({ startedAt: new Date(startedAt).toISOString() }),
    });
};

export const skipWorkoutSessionExercise = async (
    sessionId: number,
    workoutSessionExerciseId: number,
    skipped: boolean
): Promise<WorkoutSessionResponse> => {
    return fetchWithAuth(`${API_BASE_URL}/workout-sessions/${sessionId}/skip-exercise`, {
        method: 'PATCH',
        body: JSON.stringify({ workoutSessionExerciseId, skipped }),
    });
};

export const addSetToWorkoutSessionExercise = async (
    sessionId: number,
    workoutSessionExerciseId: number,
    set: { weight?: number; reps: number; restTime: number; memo?: string }
): Promise<WorkoutSessionResponse> => {
    return fetchWithAuth(
        `${API_BASE_URL}/workout-sessions/${sessionId}/exercises/${workoutSessionExerciseId}/sets`,
        {
            method: 'POST',
            body: JSON.stringify(set),
        }
    );
};

export const addExerciseToWorkoutSession = async (
    sessionId: number,
    exercise: CustomExerciseDto
): Promise<WorkoutSessionResponse> => {
    return fetchWithAuth(`${API_BASE_URL}/workout-sessions/${sessionId}/exercises`, {
        method: 'POST',
        body: JSON.stringify(exercise),
    });
};

export const endWorkoutSession = async (
    sessionId: number,
    status: 'COMPLETED' | 'CANCELLED'
): Promise<WorkoutSessionResponse> => {
    return fetchWithAuth(`${API_BASE_URL}/workout-sessions/${sessionId}/end`, {
        method: 'PATCH',
        body: JSON.stringify({ status }), // 종료 시각은 서버가 기록한다
    });
};

// Workout Log Types
export interface WorkoutLogSetResponse {
    id: number;
    targetReps: number;
    actualReps: number;
    targetWeight?: number;
    actualWeight?: number;
    restTime: number;
    memo?: string;
    completed: boolean;
}

export interface WorkoutLogExerciseResponse {
    id: number;
    name: string;
    bodyPart: string;
    exerciseTime: number;
    sets: WorkoutLogSetResponse[];
}

export interface WorkoutLogResponse {
    id: number;
    programName: string;
    date: string;
    startTime: string;
    endTime: string;
    totalTime: number;
    completedExercises: number;
    totalExercises: number;
    completedSets: number;
    totalSets: number;
    bodyParts: string[];
    exercises: WorkoutLogExerciseResponse[];
}

// Server response types (actual shape returned by API)
interface ServerLogSummary {
    id: number;
    workoutProgramName: string;
    startTime: string;
    endTime: string;
    durationSeconds: number;
    totalExercises: number;
    completedExercises: number;
    totalSets: number;
    completedSets: number;
    bodyParts: string[];
}

interface ServerSetResponse {
    id: number;
    reps: number;
    weight?: number;
    restTime: number;
    completed: boolean;
    actualReps?: number;
    actualWeight?: number;
    actualMemo?: string;
    completedAt?: string;
}

interface ServerExerciseResponse {
    id: number;
    workoutName: string;
    bodyPart?: string;
    sets: ServerSetResponse[];
}

interface ServerSessionDetail {
    id: number;
    workoutProgramName: string;
    startTime: string;
    endTime: string;
    durationSeconds?: number | null; // 서버가 계산한 실제 운동 시간 (일시정지 제외)
    exercises: ServerExerciseResponse[];
}

// 서버 시각(ISO, 오프셋 포함)을 한국 날짜/시간으로 변환한다
const parseIsoDate = (iso: string): string => (iso ? toKstDateString(new Date(iso)) : '');

const parseIsoTime = (iso: string): string => (iso ? toKstTimeString(new Date(iso)) : '');

const mapSummaryToLog = (s: ServerLogSummary): WorkoutLogResponse => ({
    id: s.id,
    programName: s.workoutProgramName ?? '',
    date: parseIsoDate(s.startTime),
    startTime: parseIsoTime(s.startTime),
    endTime: parseIsoTime(s.endTime),
    totalTime: s.durationSeconds ?? 0,
    completedExercises: s.completedExercises ?? 0,
    totalExercises: s.totalExercises ?? 0,
    completedSets: s.completedSets ?? 0,
    totalSets: s.totalSets ?? 0,
    bodyParts: s.bodyParts ?? [],
    exercises: [],
});

const mapDetailToLog = (r: ServerSessionDetail): WorkoutLogResponse => {
    const exercises = r.exercises ?? [];
    const allSets = exercises.flatMap(e => e.sets ?? []);
    // 서버 계산값(일시정지 제외)을 우선 사용하고, 구버전 응답일 때만 시작~종료 차이로 대체한다
    const totalSeconds = r.durationSeconds ?? (r.startTime && r.endTime
        ? Math.round((new Date(r.endTime).getTime() - new Date(r.startTime).getTime()) / 1000)
        : 0);
    return {
        id: r.id,
        programName: r.workoutProgramName ?? '',
        date: parseIsoDate(r.startTime),
        startTime: parseIsoTime(r.startTime),
        endTime: parseIsoTime(r.endTime),
        totalTime: totalSeconds,
        completedExercises: exercises.filter(e => (e.sets ?? []).every(s => s.completed)).length,
        totalExercises: exercises.length,
        completedSets: allSets.filter(s => s.completed).length,
        totalSets: allSets.length,
        bodyParts: [...new Set(exercises.map(e => e.bodyPart ?? '').filter(Boolean))],
        exercises: exercises.map(e => {
            const completedSets = (e.sets ?? []).filter(s => s.completed && s.completedAt);
            const exerciseTime = completedSets.length >= 2
                ? Math.round((new Date(completedSets[completedSets.length - 1].completedAt!).getTime()
                    - new Date(completedSets[0].completedAt!).getTime()) / 1000)
                : 0;
            return {
            id: e.id,
            name: e.workoutName ?? '',
            bodyPart: e.bodyPart ?? '',
            exerciseTime,
            sets: (e.sets ?? []).map(s => ({
                id: s.id,
                targetReps: s.reps ?? 0,
                actualReps: s.actualReps ?? 0,
                targetWeight: s.weight,
                actualWeight: s.actualWeight,
                restTime: s.restTime ?? 0,
                memo: s.actualMemo ?? '',
                completed: s.completed,
            })),
            };
        }),
    };
};

export interface WorkoutLogPage {
    logs: WorkoutLogResponse[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrev: boolean;
    totalDurationSeconds: number;
    totalCompletedSets: number;
    totalSets: number;
    averageCompletionRate: number;
}

export const getWorkoutLogs = async (page = 0, size = 10, startDate?: string, endDate?: string): Promise<WorkoutLogPage> => {
    let url = `${API_BASE_URL}/workout-sessions/logs?page=${page}&size=${size}&sort=startTime,desc`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    const result = await fetchWithAuth(url);
    if (result?.content && Array.isArray(result.content)) {
        return {
            logs: (result.content as ServerLogSummary[]).map(mapSummaryToLog),
            currentPage: result.currentPage ?? result.number ?? 0,
            totalPages: result.totalPages ?? 1,
            totalElements: result.totalElements ?? result.content.length,
            hasNext: result.last === false,
            hasPrev: result.first === false,
            totalDurationSeconds: result.totalDurationSeconds ?? 0,
            totalCompletedSets: result.totalCompletedSets ?? 0,
            totalSets: result.totalSets ?? 0,
            averageCompletionRate: result.averageCompletionRate ?? 0,
        };
    }
    const arr: ServerLogSummary[] = Array.isArray(result) ? result : [];
    return {
        logs: arr.map(mapSummaryToLog),
        currentPage: 0,
        totalPages: 1,
        totalElements: arr.length,
        hasNext: false,
        hasPrev: false,
        totalDurationSeconds: 0,
        totalCompletedSets: 0,
        totalSets: 0,
        averageCompletionRate: 0,
    };
};

export const getWorkoutLog = async (id: number): Promise<WorkoutLogResponse> => {
    const result: ServerSessionDetail = await fetchWithAuth(`${API_BASE_URL}/workout-sessions/logs/${id}`);
    return mapDetailToLog(result);
};

// Dashboard Stats Types
export interface DashboardWeeklyProgress {
    dayOfWeek: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
    workoutCount: number;
    totalDurationSeconds: number;
}

export interface DashboardBodyPartStat {
    bodyPart: string;
    count: number;
    percentage: number;
}

export interface DashboardMonthlyStat {
    year: number;
    month: number;
    workoutCount: number;
    totalDurationSeconds: number;
}

export interface DashboardRecentWorkout {
    id: number;
    programName: string;
    date: string; // "YYYY-MM-DD"
    totalDurationSeconds: number;
    completedSets: number;
    totalSets: number;
}

export interface DashboardStatsResponse {
    totalWorkouts: number;
    totalDurationSeconds: number;
    totalCompletedSets: number;
    averageCompletionRate: number;
    currentStreak: number;
    weeklyWorkouts: number;
    monthlyWorkouts: number;
    longestWorkoutSeconds: number;
    favoriteBodyPart: string | null;
    weeklyProgress: DashboardWeeklyProgress[];
    bodyPartStats: DashboardBodyPartStat[];
    monthlyStats: DashboardMonthlyStat[];
    recentWorkouts: DashboardRecentWorkout[];
}

export const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
    return fetchWithAuth(`${API_BASE_URL}/dashboard/stats`);
};