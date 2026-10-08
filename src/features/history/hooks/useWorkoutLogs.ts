import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { monthRange } from '@/shared/lib/date';
import { getWorkoutLog, getWorkoutLogs } from '../api';
import { periodToDateRange, type Period } from '../lib/logView';
import type { WorkoutLogPage, WorkoutLogResponse } from '../types';

const PAGE_SIZE = 10;
// 한 달 기록을 한 번에 가져오기 위한 페이지 크기
const CALENDAR_PAGE_SIZE = 200;

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

// 기간별 기록 목록 (페이지 단위)
export function useWorkoutLogList() {
  const [period, setPeriod] = useState<Period>('1m');
  const [page, setPage] = useState<WorkoutLogPage>(EMPTY_PAGE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = async (pageNumber: number, targetPeriod: Period = period) => {
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate } = periodToDateRange(targetPeriod);
      setPage(await getWorkoutLogs(pageNumber, PAGE_SIZE, startDate, endDate));
    } catch {
      setError('운동 기록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(0, period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  return { period, setPeriod, page, loading, error, fetchPage };
}

// 캘린더: 보고 있는 달의 기록만 기간 조회한다 (오래된 달도 표시되도록)
export function useCalendarLogs() {
  const [month, setMonth] = useState(new Date());
  const [logs, setLogs] = useState<WorkoutLogResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async (target: Date = month) => {
    setError(null);
    try {
      const { startDate, endDate } = monthRange(target.getFullYear(), target.getMonth() + 1);
      const result = await getWorkoutLogs(0, CALENDAR_PAGE_SIZE, startDate, endDate);
      setLogs(result.logs);
    } catch {
      // 실패를 빈 달(운동 안 함)과 구분해 보여준다
      setError('이 달의 운동 기록을 불러오지 못했습니다.');
    }
  };

  const moveMonth = (offset: -1 | 1) => {
    // 일자를 1일로 고정해 31일에서 이동할 때 짧은 달을 건너뛰지 않게 한다
    const next = new Date(month.getFullYear(), month.getMonth() + offset, 1);
    setMonth(next);
    load(next);
  };

  return { month, logs, error, load, moveMonth };
}

// 기록 상세. 불러오지 못하면 목록으로 돌아간다
export function useWorkoutLogDetail(id: string | undefined) {
  const navigate = useNavigate();
  const [record, setRecord] = useState<WorkoutLogResponse | null>(null);

  useEffect(() => {
    setRecord(null);
    if (!id) return;

    let cancelled = false;
    getWorkoutLog(Number(id))
      .then((log) => {
        if (!cancelled) setRecord(log);
      })
      .catch(() => {
        if (!cancelled) navigate('/history');
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  return record;
}
