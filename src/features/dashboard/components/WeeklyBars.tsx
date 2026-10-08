import { TODAY_DAY_KEY } from '../lib/dashboardView';
import type { DashboardWeeklyProgress } from '../types';

interface WeeklyBarsProps {
  rows: DashboardWeeklyProgress[];
  // 영역 높이와 막대 최대 높이(px)
  height: number;
  maxBarHeight: number;
  className: string;
  barTransitionClass: string;
}

// 요일별 운동 횟수 막대. 오늘은 밝은 색, 기록 없는 날은 낮은 회색 막대
export function WeeklyBars({ rows, height, maxBarHeight, className, barTransitionClass }: WeeklyBarsProps) {
  const maxCount = Math.max(...rows.map(d => d.workoutCount), 1);

  return (
    <div className={`flex items-end ${className}`} style={{ height: `${height}px` }}>
      {rows.map(d => {
        const isToday = d.dayOfWeek === TODAY_DAY_KEY;
        const hasWorkout = d.workoutCount > 0;
        const barH = hasWorkout ? Math.max(Math.round((d.workoutCount / maxCount) * maxBarHeight), 12) : 4;
        return (
          <div
            key={d.dayOfWeek}
            className={`flex-1 rounded-md ${barTransitionClass} ${
              hasWorkout
                ? isToday ? 'bg-blue-400 dark:bg-indigo-400' : 'bg-blue-500 dark:bg-indigo-500'
                : 'bg-gray-100 dark:bg-white/5'
            }`}
            style={{ height: `${barH}px` }}
          />
        );
      })}
    </div>
  );
}
