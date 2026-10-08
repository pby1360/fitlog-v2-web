import { queryOptions } from '@tanstack/react-query';
import { getLatestWorkoutSession } from './api';

export const sessionKeys = {
  latest: ['workout-sessions', 'latest'] as const,
};

export const sessionQueries = {
  // 진행 중인 세션 여부로 화면을 이동하므로 캐시에 남기지 않고 항상 새로 조회한다
  latest: () => queryOptions({ queryKey: sessionKeys.latest, queryFn: getLatestWorkoutSession, gcTime: 0 }),
};
