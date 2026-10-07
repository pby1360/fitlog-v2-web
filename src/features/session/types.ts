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
