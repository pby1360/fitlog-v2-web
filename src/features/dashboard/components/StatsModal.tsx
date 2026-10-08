import { formatDurationKo } from '@/shared/lib/format';
import { Modal } from '@/shared/ui/Modal';
import { DAY_LABELS, TODAY_DAY_KEY } from '../lib/dashboardView';
import type { DashboardStatsResponse, DashboardWeeklyProgress } from '../types';
import { WeeklyBars } from './WeeklyBars';

interface StatsModalProps {
  stats: DashboardStatsResponse;
  weekRows: DashboardWeeklyProgress[];
  onClose: () => void;
}

const BAR_COLORS = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-red-500'];
const TEXT_COLORS = ['text-blue-400', 'text-emerald-400', 'text-violet-400', 'text-amber-400', 'text-red-400'];
const tileClass = 'bg-gray-50 dark:bg-white/[0.03] rounded-xl';
const sectionTitleClass = 'font-semibold text-gray-900 dark:text-white mb-4';

// 상세 통계: 전체 요약, 부위별 비율, 월별 추이, 주간 패턴, 개인 기록
export function StatsModal({ stats, weekRows, onClose }: StatsModalProps) {
  const totals = [
    { icon: 'ri-bar-chart-fill', color: 'text-blue-600 dark:text-indigo-400', value: stats.totalWorkouts,                          unit: '회',   label: '총 운동 횟수' },
    { icon: 'ri-timer-line',     color: 'text-emerald-400',                   value: formatDurationKo(stats.totalDurationSeconds), unit: '',     label: '총 운동 시간' },
    { icon: 'ri-repeat-line',    color: 'text-violet-400',                    value: stats.totalCompletedSets,                     unit: '세트', label: '총 완료 세트' },
    { icon: 'ri-fire-line',      color: 'text-orange-400',                    value: stats.currentStreak,                          unit: '일',   label: '연속 운동일' },
  ];
  const records = [
    { icon: 'ri-timer-flash-line',     color: 'text-amber-400',   value: formatDurationKo(stats.longestWorkoutSeconds),     label: '최장 운동 시간' },
    { icon: 'ri-checkbox-circle-line', color: 'text-emerald-400', value: `${Math.round(stats.averageCompletionRate)}%`,     label: '평균 완료율' },
    { icon: 'ri-heart-pulse-line',     color: 'text-violet-400',  value: stats.favoriteBodyPart ?? '-',                     label: '선호 운동 부위' },
  ];

  return (
    <Modal
      overlayClassName="bg-black/40 dark:bg-black/50 backdrop-blur-sm"
      className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/8 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
    >
      {/* Modal Header */}
      <div className="sticky top-0 bg-white dark:bg-[#111] rounded-t-2xl px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <i className="ri-bar-chart-line text-violet-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">상세 통계 분석</h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
        >
          <i className="ri-close-line text-lg" />
        </button>
      </div>

      <div className="p-6 space-y-8">
        {/* 전체 통계 요약 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {totals.map(s => (
            <div key={s.label} className={`${tileClass} p-4 text-center`}>
              <i className={`${s.icon} ${s.color} text-xl mb-2 block`} />
              <div className={`text-xl font-bold ${s.color}`}>{s.value}<span className="text-sm ml-0.5">{s.unit}</span></div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 운동 부위별 */}
          <div>
            <h3 className={sectionTitleClass}>운동 부위별 분석</h3>
            {stats.bodyPartStats.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-600">운동 부위 데이터가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {stats.bodyPartStats.map((stat, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`font-medium ${TEXT_COLORS[i % TEXT_COLORS.length]}`}>{stat.bodyPart}</span>
                      <span className="text-gray-600 dark:text-gray-400">{stat.percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`} style={{ width: `${stat.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 월별 운동 추이 */}
          <div>
            <h3 className={sectionTitleClass}>월별 운동 추이</h3>
            <div className="space-y-2">
              {stats.monthlyStats.map((stat, i) => (
                <div key={i} className={`flex items-center justify-between p-3 ${tileClass}`}>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">{stat.month}월</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">{stat.workoutCount}회</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{formatDurationKo(stat.totalDurationSeconds)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 주간 패턴 바 */}
        <div>
          <h3 className={sectionTitleClass}>주간 운동 패턴</h3>
          <WeeklyBars rows={weekRows} height={88} maxBarHeight={80} className="gap-2 mb-2" barTransitionClass="transition-all duration-700" />
          <div className="flex gap-2">
            {weekRows.map(d => (
              <div key={d.dayOfWeek} className="flex-1 text-center">
                <div className={`text-xs font-medium ${d.dayOfWeek === TODAY_DAY_KEY ? 'text-blue-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-600'}`}>
                  {DAY_LABELS[d.dayOfWeek]}
                </div>
                {d.workoutCount > 0 && (
                  <div className="text-xs text-gray-400 dark:text-gray-600">{d.workoutCount}회</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 개인 기록 */}
        <div>
          <h3 className={sectionTitleClass}>개인 기록</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {records.map(item => (
              <div key={item.label} className={`${tileClass} p-4 text-center`}>
                <i className={`${item.icon} ${item.color} text-2xl mb-2 block`} />
                <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
