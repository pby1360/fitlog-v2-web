import { queryOptions } from '@tanstack/react-query';
import { getWorkoutLog, getWorkoutLogs } from './api';

const PAGE_SIZE = 10;
// 한 달 기록을 한 번에 가져오기 위한 페이지 크기
const CALENDAR_PAGE_SIZE = 200;

export const historyKeys = {
  all: ['workout-logs'] as const,
};

export const historyQueries = {
  list: (page: number, startDate?: string, endDate?: string) => queryOptions({
    queryKey: [...historyKeys.all, 'list', { page, startDate, endDate }] as const,
    queryFn: () => getWorkoutLogs(page, PAGE_SIZE, startDate, endDate),
  }),
  range: (startDate: string, endDate: string) => queryOptions({
    queryKey: [...historyKeys.all, 'range', { startDate, endDate }] as const,
    queryFn: () => getWorkoutLogs(0, CALENDAR_PAGE_SIZE, startDate, endDate),
  }),
  detail: (id: number) => queryOptions({
    queryKey: [...historyKeys.all, 'detail', id] as const,
    queryFn: () => getWorkoutLog(id),
  }),
};
