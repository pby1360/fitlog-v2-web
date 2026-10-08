import type { DashboardStatsResponse } from '../types';

interface StatCardsProps {
  stats: DashboardStatsResponse | null;
  loading: boolean;
}

// 히어로 아래에 겹쳐 놓는 핵심 지표 4개
export function StatCards({ stats, loading }: StatCardsProps) {
  const value = (v: number | string) => (loading ? '…' : v);
  const cards = [
    { icon: 'ri-fire-line',           value: value(stats?.currentStreak ?? 0),                          unit: '일', label: '연속 운동',   color: 'text-orange-400',                     bg: 'bg-orange-500/10' },
    { icon: 'ri-calendar-check-line', value: value(stats?.weeklyWorkouts ?? 0),                         unit: '회', label: '이번 주',     color: 'text-blue-600 dark:text-indigo-400',  bg: 'bg-blue-50 dark:bg-indigo-500/10' },
    { icon: 'ri-bar-chart-fill',      value: value(stats?.totalWorkouts ?? 0),                          unit: '회', label: '총 운동',     color: 'text-violet-400',                     bg: 'bg-violet-500/10' },
    { icon: 'ri-percent-line',        value: value(`${Math.round(stats?.averageCompletionRate ?? 0)}`), unit: '%',  label: '평균 완료율', color: 'text-emerald-400',                    bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 mb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map(s => (
          <div key={s.label} className="bg-white dark:bg-[#111] rounded-xl border border-gray-100 dark:border-white/5 p-4">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <i className={`${s.icon} ${s.color} text-lg`} />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {s.value}<span className="text-sm font-medium ml-0.5 text-gray-600 dark:text-gray-400">{s.unit}</span>
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
