import { useEffect, useState } from 'react';
import { getLatestWorkoutSession, type WorkoutSessionResponse } from '@/features/session';
import { getDashboardStats } from '../api';
import type { DashboardStatsResponse } from '../types';

// 대시보드 통계와 진행 중인 세션 (세션 조회 실패는 무시한다)
export function useDashboard() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [latestSession, setLatestSession] = useState<WorkoutSessionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [dashboardStats, session] = await Promise.all([
          getDashboardStats(),
          getLatestWorkoutSession().catch(() => null),
        ]);
        setStats(dashboardStats);
        setLatestSession(session);
      } catch {
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { stats, latestSession, loading, error };
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
