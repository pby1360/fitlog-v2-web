// Workout Session Types
export interface SessionSetResponse {
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

export interface SessionExerciseResponse {
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

export type SessionStatus = WorkoutSessionResponse['status'];

// 화면용 세션 모델. 시각은 ms 타임스탬프로 바꿔 둔다.
export interface SessionSet {
  id: number;
  reps: number;
  weight?: number;
  restTime: number;
  memo?: string;
  completed: boolean;
  actualReps?: number;
  actualWeight?: number;
  actualMemo?: string;
  completedAt?: number;
}

export interface SessionExercise {
  id: number;
  exerciseId: number;
  workoutName: string;
  workoutPartName: string;
  sets: SessionSet[];
  completed: boolean;
  skipped: boolean;
  startedAt?: number;
}

export interface WorkoutSession {
  id: number;
  programId: number;
  programName: string;
  startTime: number;
  // 첫 미완료 세트 위치 (건너뛴 운동 제외)
  currentExerciseIndex: number;
  currentSetIndex: number;
  status: SessionStatus;
  exercises: SessionExercise[];
  totalPausedSeconds: number;
  lastPausedAt?: number;
}
