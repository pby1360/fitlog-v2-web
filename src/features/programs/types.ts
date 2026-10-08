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

// 프로그램 생성·수정 중인 운동. 화면에서는 평탄한 목록으로 다루고 저장할 때 부위별 parts 로 묶는다.
export interface DraftSet {
  id: string; // 클라이언트 임시 ID
  reps: number;
  weight?: number;
  restTime: number;
  memo?: string;
}

export interface DraftExercise {
  id: string; // 클라이언트 임시 ID
  exerciseId: number; // 운동 종목 ID
  sets: DraftSet[];
}
