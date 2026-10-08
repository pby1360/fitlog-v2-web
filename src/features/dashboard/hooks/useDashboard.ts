import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sessionQueries } from '@/features/session';
import { dashboardQueries } from '../queries';

// 대시보드 통계와 진행 중인 세션 (세션 조회 실패는 무시한다)
export function useDashboard() {
  const statsQuery = useQuery(dashboardQueries.stats());
  const latestQuery = useQuery(sessionQueries.latest());

  return {
    stats: statsQuery.data ?? null,
    latestSession: latestQuery.data ?? null,
    loading: statsQuery.isPending,
    error: statsQuery.isError ? '데이터를 불러오는데 실패했습니다.' : null,
  };
}

// 1초마다 갱신되는 현재 시각
export function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}
