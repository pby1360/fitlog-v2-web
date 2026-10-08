import { API_BASE_URL, fetchWithAuth } from '@/shared/api/client';
import type { CustomExerciseDto, WorkoutSessionResponse } from './types';

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

export const reorderWorkoutSessionExercises = async (
    sessionId: number,
    exercises: { workoutSessionExerciseId: number; order: number }[]
): Promise<WorkoutSessionResponse> => {
    return fetchWithAuth(`${API_BASE_URL}/workout-sessions/${sessionId}/reorder-exercises`, {
        method: 'PATCH',
        body: JSON.stringify({ exercises }),
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
