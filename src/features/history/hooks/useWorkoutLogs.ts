import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { monthRange } from '@/shared/lib/date';
import { periodToDateRange, type Period } from '../lib/logView';
import { historyQueries } from '../queries';
import type { WorkoutLogPage } from '../types';

const EMPTY_PAGE: WorkoutLogPage = {
  logs: [],
  currentPage: 0,
  totalPages: 1,
  totalElements: 0,
  hasNext: false,
  hasPrev: false,
  totalDurationSeconds: 0,
  totalCompletedSets: 0,
  totalSets: 0,
  averageCompletionRate: 0,
};

// 기간별 기록 목록 (페이지 단위). 기간을 바꾸면 첫 페이지로 돌아간다
export function useWorkoutLogList() {
  const [period, setPeriodState] = useState<Period>('1m');
  const [pageNumber, setPageNumber] = useState(0);
  const { startDate, endDate } = periodToDateRange(period);
  const query = useQuery(historyQueries.list(pageNumber, startDate, endDate));

  const setPeriod = (next: Period) => {
    setPeriodState(next);
    setPageNumber(0);
  };

  return {
    period,
    setPeriod,
    page: query.data ?? EMPTY_PAGE,
    loading: query.isPending,
    error: query.isError ? '운동 기록을 불러오는데 실패했습니다.' : null,
    fetchPage: setPageNumber,
  };
}

// 캘린더: 보고 있는 달의 기록만 기간 조회한다 (오래된 달도 표시되도록). enabled 일 때만 조회한다
export function useCalendarLogs(enabled: boolean) {
  const [month, setMonth] = useState(new Date());
  const { startDate, endDate } = monthRange(month.getFullYear(), month.getMonth() + 1);
  const query = useQuery({ ...historyQueries.range(startDate, endDate), enabled });

  const moveMonth = (offset: -1 | 1) => {
    // 일자를 1일로 고정해 31일에서 이동할 때 짧은 달을 건너뛰지 않게 한다
    setMonth(new Date(month.getFullYear(), month.getMonth() + offset, 1));
  };

  return {
    month,
    logs: query.data?.logs ?? [],
    // 실패를 빈 달(운동 안 함)과 구분해 보여준다
    error: query.isError ? '이 달의 운동 기록을 불러오지 못했습니다.' : null,
    reload: () => query.refetch(),
    moveMonth,
  };
}

// 기록 상세. 불러오지 못하면 목록으로 돌아간다
export function useWorkoutLogDetail(id: string | undefined) {
  const navigate = useNavigate();
  const query = useQuery({ ...historyQueries.detail(Number(id)), enabled: !!id });

  useEffect(() => {
    if (id && query.isError) navigate('/history');
  }, [id, query.isError, navigate]);

  return id ? query.data ?? null : null;
}
