import type { ReactNode } from 'react';
import { formatDurationKo } from '@/shared/lib/format';
import { DAY_LABELS, MONTHLY_GOAL, TODAY_DAY_KEY } from '../lib/dashboardView';
import type { DashboardStatsResponse, DashboardWeeklyProgress } from '../types';
import { WeeklyBars } from './WeeklyBars';

interface SectionCardProps {
  icon: string;
  iconClass: string;
  iconBgClass: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

// 아이콘 제목줄이 있는 카드
function SectionCard({ icon, iconClass, iconBgClass, title, action, children }: SectionCardProps) {
  return (
    <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${iconBgClass} flex items-center justify-center`}>
            <i className={`${icon} ${iconClass}`} />
          </div>
          <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// 이번 주 요일별 운동 현황
export function WeeklyCard({ weekRows }: { weekRows: DashboardWeeklyProgress[] }) {
  const activeDays = weekRows.filter(d => d.workoutCount > 0);

  return (
    <SectionCard icon="ri-calendar-line" iconClass="text-blue-600 dark:text-indigo-400" iconBgClass="bg-blue-50 dark:bg-indigo-500/10" title="이번 주 현황">
      <div className="px-5 py-5">
        <WeeklyBars rows={weekRows} height={80} maxBarHeight={72} className="gap-1.5 mb-2" barTransitionClass="transition-all duration-500" />
        <div className="flex gap-1.5">
          {weekRows.map(d => (
            <div key={d.dayOfWeek} className="flex-1 text-center">
              <span className={`text-xs font-medium ${d.dayOfWeek === TODAY_DAY_KEY ? 'text-blue-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-600'}`}>
                {DAY_LABELS[d.dayOfWeek]}
              </span>
            </div>
          ))}
        </div>

        {/* 상세 리스트 */}
        <div className="mt-4 space-y-2">
          {activeDays.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-600 text-center py-2">이번 주 운동 기록이 없습니다</p>
          ) : (
            activeDays.map(d => (
              <div key={d.dayOfWeek} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-indigo-500/10 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-indigo-400">
                    {DAY_LABELS[d.dayOfWeek]}
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">{DAY_LABELS[d.dayOfWeek]}요일</span>
                </div>
                <div className="text-right">
                  <span className="font-medium text-gray-900 dark:text-white">{d.workoutCount}회</span>
                  <span className="text-gray-400 dark:text-gray-600 ml-2">{formatDurationKo(d.totalDurationSeconds)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </SectionCard>
  );
}

interface AnalysisCardProps {
  stats: DashboardStatsResponse | null;
  loading: boolean;
  onShowDetail: () => void;
}

// 이번 달 목표 진행률과 개인 기록 요약
export function AnalysisCard({ stats, loading, onShowDetail }: AnalysisCardProps) {
  const monthlyProgress = Math.min(Math.round(((stats?.monthlyWorkouts ?? 0) / MONTHLY_GOAL) * 100), 100);
  const records = [
    { icon: 'ri-heart-pulse-line',     color: 'text-red-400',     value: stats?.favoriteBodyPart ?? '-',                                               label: '선호 부위' },
    { icon: 'ri-timer-flash-line',     color: 'text-amber-400',   value: loading ? '…' : formatDurationKo(stats?.longestWorkoutSeconds ?? 0),          label: '최장 운동' },
    { icon: 'ri-checkbox-circle-line', color: 'text-emerald-400', value: loading ? '…' : `${Math.round(stats?.averageCompletionRate ?? 0)}%`,          label: '완료율' },
  ];

  return (
    <SectionCard
      icon="ri-bar-chart-2-line"
      iconClass="text-violet-400"
      iconBgClass="bg-violet-500/10"
      title="통계 분석"
      action={
        <button
          onClick={onShowDetail}
          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-indigo-400 hover:text-blue-700 dark:hover:text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-indigo-500/10 transition-colors"
        >
          상세보기 <i className="ri-arrow-right-line" />
        </button>
      }
    >
      <div className="px-5 py-5 space-y-5">
        {/* 이번 달 목표 */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400 font-medium">이번 달 목표</span>
            <span className="font-semibold text-gray-900 dark:text-white">{stats?.monthlyWorkouts ?? 0} <span className="text-gray-400 dark:text-gray-600 font-normal">/ {MONTHLY_GOAL}회</span></span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
              style={{ width: `${monthlyProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-1 text-right">{monthlyProgress}% 달성</p>
        </div>

        {/* 개인 기록 3개 */}
        <div className="grid grid-cols-3 gap-3">
          {records.map(item => (
            <div key={item.label} className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3 text-center">
              <i className={`${item.icon} ${item.color} text-lg mb-1 block`} />
              <div className={`text-sm font-bold ${item.color}`}>{item.value}</div>
              <div className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
