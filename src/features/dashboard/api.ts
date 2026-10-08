import { API_BASE_URL, fetchWithAuth } from '@/shared/api/client';
import type { DashboardStatsResponse } from './types';

export const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
    return fetchWithAuth(`${API_BASE_URL}/dashboard/stats`);
};
