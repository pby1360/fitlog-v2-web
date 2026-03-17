import { redirectToHome } from '../utils/navigationService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api'; // 백엔드 API 기본 URL

interface WorkoutPartResponse {
  id: number;
  name: string;
}

interface WorkoutResponse {
  id: number;
  name: string;
  bodyPart: string;
  bodyPartId: number;
}

let isRedirecting = false;

const fetchWithAuth = async (url: string, options?: RequestInit) => {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options?.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    if (!isRedirecting) {
      isRedirecting = true;
      localStorage.removeItem('accessToken');
      redirectToHome();
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    // 에러 처리 로직
    const errorData = await response.json().catch(() => ({ message: 'API 요청 실패' }));
    throw new Error(errorData.message || 'API 요청 실패');
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
  return fetchWithAuth(`${API_BASE_URL}/workout/list/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, workoutPartId }),
  });
};

export const deleteWorkout = async (id: number): Promise<void> => {
  return fetchWithAuth(`${API_BASE_URL}/workout/list/${id}`, {
    method: 'DELETE',
  });
};

// 프로그램 저장을 위한 타입 정의
interface WorkoutSetDto {
  setNumber: number;
  weight?: number;
  reps: number;
  restTime: number;
  memo?: string;
}

interface WorkoutExerciseDto {
  workoutId: number;
  workoutSets: WorkoutSetDto[];
}

interface WorkoutPartDto {
  workoutPartId: number;
  workoutExercises: WorkoutExerciseDto[];
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

export const getMyInfo = async (): Promise<any> => {
  return fetchWithAuth(`${API_BASE_URL}/members/me`);
};

export interface MemberProfile {
  id: number;
  email: string;
  nickname: string;
  imageUrl: string | null;
  provider: string;
  phone: string | null;
  birthDate: string | null;  // "YYYY-MM-DD"
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
  phone: string;
  birthDate: string;
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

export const endWorkoutSession = async (
    sessionId: number,
    status: 'COMPLETED' | 'CANCELLED'
): Promise<WorkoutSessionResponse> => {
    return fetchWithAuth(`${API_BASE_URL}/workout-sessions/${sessionId}/end`, {
        method: 'PATCH',
        body: JSON.stringify({ endTime: new Date().toISOString(), status }),
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
    exercises: ServerExerciseResponse[];
}

const parseIsoDate = (iso: string): string => (iso ? iso.substring(0, 10) : '');

const parseIsoTime = (iso: string): string => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
};

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
    const totalSeconds = r.startTime && r.endTime
        ? Math.round((new Date(r.endTime).getTime() - new Date(r.startTime).getTime()) / 1000)
        : 0;
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