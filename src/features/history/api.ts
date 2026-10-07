import { API_BASE_URL, fetchWithAuth } from '@/shared/api/client';
import { mapDetailToLog, mapSummaryToLog, type ServerLogSummary, type ServerSessionDetail } from './lib/mapLog';
import type { WorkoutLogPage, WorkoutLogResponse } from './types';

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
