import { formatDurationShort } from '@/shared/lib/format';
import type { MemberProfile } from '../types';

// 누적 운동 통계 (히어로 아래에 겹쳐 놓는다)
export function ProfileStats({ profile }: { profile: MemberProfile }) {
  const stats = [
    { icon: 'ri-calendar-check-line', value: profile.totalWorkoutDays,                          unit: '일',   label: '총 운동일',   color: 'text-blue-400',    bg: 'bg-blue-500/10' },
    { icon: 'ri-repeat-line',         value: profile.totalCompletedSets,                        unit: '세트', label: '완료 세트',   color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: 'ri-timer-flash-line',    value: formatDurationShort(profile.totalDurationSeconds), unit: '',     label: '총 운동시간', color: 'text-violet-400',  bg: 'bg-violet-500/10' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 mb-8">
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white dark:bg-[#111] rounded-xl border border-gray-100 dark:border-white/5 p-4 flex flex-col items-center text-center">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
              <i className={`${stat.icon} ${stat.color} text-lg`} />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}<span className="text-sm font-medium ml-0.5">{stat.unit}</span>
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
