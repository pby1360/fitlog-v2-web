import { Link, useNavigate } from 'react-router-dom';
import type { WorkoutSessionResponse } from '@/features/session';
import { greetingFor } from '../lib/dashboardView';
import type { DashboardStatsResponse } from '../types';

interface DashboardHeroProps {
  now: Date;
  stats: DashboardStatsResponse | null;
  loading: boolean;
  error: string | null;
  // 진행 중이거나 일시정지된 세션이 있으면 이어서 하기 버튼을 보여준다
  activeSession: WorkoutSessionResponse | null;
}

export function DashboardHero({ now, stats, loading, error, activeSession }: DashboardHeroProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-100 dark:bg-[#0f0f0f] border-b border-gray-100 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-gray-500 dark:text-gray-500 text-sm font-medium mb-1">
              {now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {greetingFor(now)} 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {loading ? '' : stats
                ? `이번 주 ${stats.weeklyWorkouts}회 운동했어요`
                : '오늘도 파이팅하세요!'}
            </p>
          </div>

          {activeSession ? (
            <button
              onClick={() => navigate('/workout/session')}
              className="flex items-center gap-3 px-5 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/8 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white transition-colors"
            >
              <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${activeSession.status === 'PAUSED' ? 'bg-yellow-400' : 'bg-green-400'}`} />
              <div className="text-left">
                <p className="text-sm font-semibold">{activeSession.workoutProgramName}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{activeSession.status === 'PAUSED' ? '일시정지 중 — 이어서 운동하기' : '진행 중 — 돌아가기'}</p>
              </div>
              <i className="ri-arrow-right-line ml-1 text-gray-600 dark:text-gray-400" />
            </button>
          ) : (
            <Link
              to="/workout"
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm"
            >
              <i className="ri-play-circle-fill text-lg" />
              운동 시작하기
            </Link>
          )}
        </div>

        {error && (
          <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
            <i className="ri-error-warning-line" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
