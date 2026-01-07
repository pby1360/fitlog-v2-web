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

// TODO: 실제 인증 토큰을 전달하도록 수정해야 함
const fetchWithAuth = async (url: string, options?: RequestInit) => {
  const token = localStorage.getItem('accessToken'); // 여기에 실제 JWT 토큰을 넣어야 합니다.
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options?.headers,
  };

  const response = await fetch(url, { ...options, headers });
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

export const getWorkouts = async (): Promise<WorkoutResponse[]> => {
  return fetchWithAuth(`${API_BASE_URL}/workout/list`);
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
