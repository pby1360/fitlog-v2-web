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
