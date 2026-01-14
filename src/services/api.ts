import { redirectToHome } from '../utils/navigationService';

const API_BASE_URL = 'http://localhost:8080/api'; // 백엔드 API 기본 URL

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

// Workout Session Types
interface SessionSetResponse {
    id: number;
    setNumber: number;
    weight: number;
    reps: number;
    restTime: number;
    memo: string;
    completed: boolean;
}

interface SessionExerciseResponse {
    id: number;
    workoutId: number;
    workoutName: string;
    order: number;
    sets: SessionSetResponse[];
}

export interface WorkoutSessionResponse {
    id: number;
    workoutProgramId: number;
    workoutProgramName: string;
    startTime: string; // LocalDateTime is serialized as string
    status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    exercises: SessionExerciseResponse[];
}

export const startWorkoutSession = async (workoutProgramId: number): Promise<WorkoutSessionResponse> => {
    return fetchWithAuth(`${API_BASE_URL}/workout-sessions`, {
        method: 'POST',
        body: JSON.stringify({ workoutProgramId }),
    });
};

export const getLatestWorkoutSession = async (): Promise<WorkoutSessionResponse | null> => {
    return fetchWithAuth(`${API_BASE_URL}/workout-sessions/latest`);
};