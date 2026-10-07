// 프로그램 저장을 위한 타입 정의 (BE WorkoutProgramDto.Request 와 동일한 구조)
export interface WorkoutSetDto {
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

// 프로그램 조회 응답을 위한 타입 정의
export interface ProgramSetResponse {
  id: number;
  setNumber: number;
  weight?: number;
  reps: number;
  restTime: number;
  memo?: string;
}

export interface ProgramExerciseResponse {
  id: number;
  workoutId: number;
  workoutName: string;
  workoutPartName: string;
  order: number;
  sets: ProgramSetResponse[];
}

export interface ProgramPartResponse {
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
