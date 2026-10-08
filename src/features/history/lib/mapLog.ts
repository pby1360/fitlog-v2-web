import { toKstDateString, toKstTimeString } from '@/shared/lib/date';
import type { WorkoutLogResponse } from '../types';

// Server response types (actual shape returned by API)
export interface ServerLogSummary {
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

export interface ServerSetResponse {
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

export interface ServerExerciseResponse {
    id: number;
    workoutName: string;
    bodyPart?: string;
    sets: ServerSetResponse[];
}

export interface ServerSessionDetail {
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

export const mapSummaryToLog = (s: ServerLogSummary): WorkoutLogResponse => ({
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

export const mapDetailToLog = (r: ServerSessionDetail): WorkoutLogResponse => {
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
