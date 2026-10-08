import { kstDateDaysAgo } from '@/shared/lib/date';
import type { DashboardStatsResponse, DashboardWeeklyProgress } from '../types';

type DayOfWeek = DashboardWeeklyProgress['dayOfWeek'];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MON: '월', TUE: '화', WED: '수',
  THU: '목', FRI: '금', SAT: '토', SUN: '일',
};

const DAY_ORDER: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export const TODAY_DAY_KEY = DAY_ORDER[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

// 이번 달 목표 운동 횟수
export const MONTHLY_GOAL = 20;

// 월~일 순서로 맞추고 기록이 없는 요일은 0으로 채운다
export const toWeekRows = (stats: DashboardStatsResponse | null): DashboardWeeklyProgress[] =>
  DAY_ORDER.map(key => stats?.weeklyProgress.find(d => d.dayOfWeek === key) ?? {
    dayOfWeek: key,
    workoutCount: 0,
    totalDurationSeconds: 0,
  });

// "오늘" / "어제" / "5월 3일". 한국 날짜 기준으로 판단한다 (toISOString 은 UTC 라 새벽에 하루 밀림)
export const formatRecentDate = (dateStr: string) => {
  if (dateStr === kstDateDaysAgo(0)) return '오늘';
  if (dateStr === kstDateDaysAgo(1)) return '어제';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};

export const greetingFor = (date: Date) => {
  const h = date.getHours();
  if (h < 12) return '좋은 아침이에요';
  if (h < 18) return '좋은 오후예요';
  return '좋은 저녁이에요';
};
