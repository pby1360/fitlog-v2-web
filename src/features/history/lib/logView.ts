import { kstDateDaysAgo } from '@/shared/lib/date';
import type { WorkoutLogExerciseResponse, WorkoutLogSetResponse } from '../types';

export type Period = '1w' | '1m' | '3m' | '6m' | 'all';

export const PERIOD_OPTIONS: { value: Period; label: string; days?: number }[] = [
  { value: '1w', label: '1주일', days: 7 },
  { value: '1m', label: '1개월', days: 30 },
  { value: '3m', label: '3개월', days: 90 },
  { value: '6m', label: '6개월', days: 180 },
  { value: 'all', label: '전체' },
];

// 조회 기간 → 날짜 범위. 한국 날짜 기준 (서버도 KST 날짜 경계로 해석한다)
export const periodToDateRange = (period: Period): { startDate?: string; endDate?: string } => {
  const days = PERIOD_OPTIONS.find(o => o.value === period)?.days;
  if (days === undefined) return {};
  return { startDate: kstDateDaysAgo(days), endDate: kstDateDaysAgo(0) };
};

// "오늘" / "어제" / "5월 3일 (토)"
// TODO: 브라우저 시간대 기준이라 대시보드(KST 기준)와 결과가 다를 수 있다
export const formatLogDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return '오늘';
  if (date.toDateString() === yesterday.toDateString()) return '어제';
  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
};

export const isSetGoalMet = (set: WorkoutLogSetResponse) => set.actualReps >= set.targetReps;

// 모든 세트에서 목표 횟수를 채운 운동 수
export const countGoalMetExercises = (exercises: WorkoutLogExerciseResponse[]) =>
  exercises.filter(ex => ex.sets.every(isSetGoalMet)).length;

export const restMinutes = (restTime: number) => `${Math.floor(restTime / 60)}분`;
