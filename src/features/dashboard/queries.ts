import { queryOptions } from '@tanstack/react-query';
import { getDashboardStats } from './api';

export const dashboardKeys = {
  stats: ['dashboard', 'stats'] as const,
};

export const dashboardQueries = {
  stats: () => queryOptions({ queryKey: dashboardKeys.stats, queryFn: getDashboardStats }),
};
