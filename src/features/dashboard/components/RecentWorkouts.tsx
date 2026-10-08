import { Link } from 'react-router-dom';
import { completionRate, formatDurationKo } from '@/shared/lib/format';
import { formatRecentDate } from '../lib/dashboardView';
import type { DashboardRecentWorkout } from '../types';

interface RecentWorkoutsProps {
  workouts: DashboardRecentWorkout[];
  loading: boolean;
}

const cardClass = 'bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/5';

// 완료율 80% 이상 초록, 50% 이상 노랑, 그 아래는 빨강
const completionTextClass = (completion: number) =>
  completion >= 80 ? 'text-emerald-400' : completion >= 50 ? 'text-amber-400' : 'text-red-400';
const completionBarClass = (completion: number) =>
  completion >= 80 ? 'bg-emerald-500' : completion >= 50 ? 'bg-amber-400' : 'bg-red-400';

export function RecentWorkouts({ workouts, loading }: RecentWorkoutsProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-600 dark:text-gray-400">최근 운동 기록</h2>
        <Link
          to="/history"
          className="flex items-center gap-1 text-sm text-blue-600 dark:text-indigo-400 hover:text-blue-700 dark:hover:text-indigo-300 font-medium"
        >
          전체보기 <i className="ri-arrow-right-s-line" />
        </Link>
      </div>

      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className={`${cardClass} p-4 animate-pulse`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-xl flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 dark:bg-white/5 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : workouts.length === 0 ? (
          <div className={`${cardClass} p-8 text-center`}>
            <div className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-run-line text-2xl text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-500 text-sm">아직 운동 기록이 없습니다</p>
            <Link to="/workout">
              <button className="mt-3 px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
                첫 운동 시작하기
              </button>
            </Link>
          </div>
        ) : (
          workouts.map(workout => {
            const completion = completionRate(workout.completedSets, workout.totalSets);
            return (
              <div key={workout.id} className={`${cardClass} hover:border-gray-200 dark:hover:border-white/10 p-4 transition-colors`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                    <i className="ri-dumbbell-line text-blue-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{workout.programName}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                      <span>{formatRecentDate(workout.date)}</span>
                      <span>·</span>
                      <span>{formatDurationKo(workout.totalDurationSeconds)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className={`text-sm font-bold ${completionTextClass(completion)}`}>
                        {completion}%
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-600">완료율</div>
                    </div>
                    <Link to={`/history/${workout.id}`}>
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/8 flex items-center justify-center transition-colors">
                        <i className="ri-arrow-right-s-line text-gray-600 dark:text-gray-400" />
                      </div>
                    </Link>
                  </div>
                </div>
                {/* Completion bar */}
                <div className="mt-3 h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${completionBarClass(completion)}`}
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
