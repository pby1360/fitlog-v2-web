
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/feature/Header';
import {
  getDashboardStats,
  getLatestWorkoutSession,
  type DashboardStatsResponse,
  type WorkoutSessionResponse,
} from '../../services/api';

const DAY_LABELS: Record<string, string> = {
  MON: '월', TUE: '화', WED: '수',
  THU: '목', FRI: '금', SAT: '토', SUN: '일',
};
const DAY_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const TODAY_DAY_KEY = DAY_ORDER[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [latestSession, setLatestSession] = useState<WorkoutSessionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [dashboardStats, session] = await Promise.all([
          getDashboardStats(),
          getLatestWorkoutSession().catch(() => null),
        ]);
        setStats(dashboardStats);
        setLatestSession(session);
      } catch {
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}시간 ${m}분`;
    return `${m}분`;
  };

  const formatDate = (dateStr: string) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);
    if (dateStr === todayStr) return '오늘';
    if (dateStr === yStr) return '어제';
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return '좋은 아침이에요';
    if (h < 18) return '좋은 오후예요';
    return '좋은 저녁이에요';
  };

  const isActiveSession =
    latestSession &&
    (latestSession.status === 'IN_PROGRESS' || latestSession.status === 'PAUSED');

  const monthlyGoal = 20;
  const monthlyProgress = Math.min(
    Math.round(((stats?.monthlyWorkouts ?? 0) / monthlyGoal) * 100),
    100,
  );

  const sortedWeeklyProgress = DAY_ORDER.map(
    key => stats?.weeklyProgress.find(d => d.dayOfWeek === key) ?? {
      dayOfWeek: key as DashboardStatsResponse['weeklyProgress'][number]['dayOfWeek'],
      workoutCount: 0,
      totalDurationSeconds: 0,
    },
  );

  const maxWorkoutCount = Math.max(...sortedWeeklyProgress.map(d => d.workoutCount), 1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <Header />

      {/* ── Hero ── */}
      <div className="bg-gray-100 dark:bg-[#0f0f0f] border-b border-gray-100 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-gray-500 dark:text-gray-500 text-sm font-medium mb-1">
                {currentTime.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {getGreeting()} 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {loading ? '' : stats
                  ? `이번 주 ${stats.weeklyWorkouts}회 운동했어요`
                  : '오늘도 파이팅하세요!'}
              </p>
            </div>

            {/* Today's workout CTA */}
            {isActiveSession ? (
              <button
                onClick={() => navigate('/workout/session')}
                className="flex items-center gap-3 px-5 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/8 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white transition-colors"
              >
                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${latestSession?.status === 'PAUSED' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                <div className="text-left">
                  <p className="text-sm font-semibold">{latestSession?.workoutProgramName}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{latestSession?.status === 'PAUSED' ? '일시정지 중 — 이어서 운동하기' : '진행 중 — 돌아가기'}</p>
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

      {/* ── Stat Cards (float over hero) ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { icon: 'ri-fire-line',          value: loading ? '…' : stats?.currentStreak ?? 0,                          unit: '일',  label: '연속 운동',   color: 'text-orange-400',  bg: 'bg-orange-500/10'  },
            { icon: 'ri-calendar-check-line', value: loading ? '…' : stats?.weeklyWorkouts ?? 0,                         unit: '회',  label: '이번 주',     color: 'text-blue-600 dark:text-indigo-400',  bg: 'bg-blue-50 dark:bg-indigo-500/10'  },
            { icon: 'ri-bar-chart-fill',      value: loading ? '…' : stats?.totalWorkouts ?? 0,                          unit: '회',  label: '총 운동',     color: 'text-violet-400',  bg: 'bg-violet-500/10'  },
            { icon: 'ri-percent-line',        value: loading ? '…' : `${Math.round(stats?.averageCompletionRate ?? 0)}`, unit: '%',   label: '평균 완료율', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          ].map(s => (
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-6">

        {/* ── Row: Weekly + Stats ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* 이번 주 운동 현황 */}
          <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-indigo-500/10 flex items-center justify-center">
                <i className="ri-calendar-line text-blue-600 dark:text-indigo-400" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white">이번 주 현황</h2>
            </div>
            <div className="px-5 py-5">
              {/* Bar chart */}
              <div className="flex items-end gap-1.5 mb-2" style={{ height: '80px' }}>
                {sortedWeeklyProgress.map(d => {
                  const isToday = d.dayOfWeek === TODAY_DAY_KEY;
                  const hasWorkout = d.workoutCount > 0;
                  const barH = hasWorkout
                    ? Math.max(Math.round((d.workoutCount / maxWorkoutCount) * 72), 12)
                    : 4;
                  return (
                    <div
                      key={d.dayOfWeek}
                      className={`flex-1 rounded-md transition-all duration-500 ${
                        hasWorkout
                          ? isToday ? 'bg-blue-400 dark:bg-indigo-400' : 'bg-blue-500 dark:bg-indigo-500'
                          : 'bg-gray-100 dark:bg-white/5'
                      }`}
                      style={{ height: `${barH}px` }}
                    />
                  );
                })}
              </div>
              <div className="flex gap-1.5">
                {sortedWeeklyProgress.map(d => (
                  <div key={d.dayOfWeek} className="flex-1 text-center">
                    <span className={`text-xs font-medium ${d.dayOfWeek === TODAY_DAY_KEY ? 'text-blue-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-600'}`}>
                      {DAY_LABELS[d.dayOfWeek]}
                    </span>
                  </div>
                ))}
              </div>

              {/* 상세 리스트 */}
              <div className="mt-4 space-y-2">
                {sortedWeeklyProgress.filter(d => d.workoutCount > 0).length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-600 text-center py-2">이번 주 운동 기록이 없습니다</p>
                ) : (
                  sortedWeeklyProgress.filter(d => d.workoutCount > 0).map(d => (
                    <div key={d.dayOfWeek} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-indigo-500/10 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-indigo-400">
                          {DAY_LABELS[d.dayOfWeek]}
                        </div>
                        <span className="text-gray-600 dark:text-gray-400">{DAY_LABELS[d.dayOfWeek]}요일</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-gray-900 dark:text-white">{d.workoutCount}회</span>
                        <span className="text-gray-400 dark:text-gray-600 ml-2">{formatTime(d.totalDurationSeconds)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 통계 분석 */}
          <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <i className="ri-bar-chart-2-line text-violet-400" />
                </div>
                <h2 className="font-semibold text-gray-900 dark:text-white">통계 분석</h2>
              </div>
              <button
                onClick={() => setShowStatsModal(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-indigo-400 hover:text-blue-700 dark:hover:text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-indigo-500/10 transition-colors"
              >
                상세보기 <i className="ri-arrow-right-line" />
              </button>
            </div>
            <div className="px-5 py-5 space-y-5">
              {/* 이번 달 목표 */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">이번 달 목표</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stats?.monthlyWorkouts ?? 0} <span className="text-gray-400 dark:text-gray-600 font-normal">/ {monthlyGoal}회</span></span>
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
                {[
                  { icon: 'ri-heart-pulse-line', color: 'text-red-400',     value: stats?.favoriteBodyPart ?? '-',                                    label: '선호 부위' },
                  { icon: 'ri-timer-flash-line', color: 'text-amber-400',   value: loading ? '…' : formatTime(stats?.longestWorkoutSeconds ?? 0),    label: '최장 운동' },
                  { icon: 'ri-checkbox-circle-line', color: 'text-emerald-400', value: loading ? '…' : `${Math.round(stats?.averageCompletionRate ?? 0)}%`, label: '완료율' },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3 text-center">
                    <i className={`${item.icon} ${item.color} text-lg mb-1 block`} />
                    <div className={`text-sm font-bold ${item.color}`}>{item.value}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <h2 className="text-base font-semibold text-gray-600 dark:text-gray-400 mb-3">빠른 액션</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { to: '/workout',  icon: 'ri-play-circle-line',  label: '운동 시작',    bg: 'bg-gradient-to-br from-blue-500 to-blue-600',     text: 'text-white', sub: '프로그램 선택' },
              { to: '/programs', icon: 'ri-list-settings-line', label: '프로그램 관리', bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600', text: 'text-white', sub: '루틴 만들기' },
              { to: '/history',  icon: 'ri-history-line',       label: '운동일지',     bg: 'bg-gradient-to-br from-violet-500 to-violet-600',   text: 'text-white', sub: '기록 보기' },
              { to: '/profile',  icon: 'ri-trophy-line',        label: '내 정보',      bg: 'bg-gradient-to-br from-amber-400 to-orange-500',    text: 'text-white', sub: '프로필 관리' },
            ].map(action => (
              <Link key={action.to} to={action.to}>
                <div className={`${action.bg} rounded-2xl p-5 hover:opacity-90 transition-opacity cursor-pointer shadow-sm`}>
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                    <i className={`${action.icon} text-xl ${action.text}`} />
                  </div>
                  <div className={`font-semibold text-sm ${action.text}`}>{action.label}</div>
                  <div className="text-xs text-white/70 mt-0.5">{action.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Recent Workouts ── */}
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
                <div key={i} className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/5 p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-xl flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-100 dark:bg-white/5 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))
            ) : !stats || stats.recentWorkouts.length === 0 ? (
              <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/5 p-8 text-center">
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
              stats.recentWorkouts.map(workout => {
                const completion = workout.totalSets > 0
                  ? Math.round((workout.completedSets / workout.totalSets) * 100)
                  : 0;
                return (
                  <div key={workout.id} className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 p-4 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                        <i className="ri-dumbbell-line text-blue-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{workout.programName}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                          <span>{formatDate(workout.date)}</span>
                          <span>·</span>
                          <span>{formatTime(workout.totalDurationSeconds)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className={`text-sm font-bold ${completion >= 80 ? 'text-emerald-400' : completion >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
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
                        className={`h-full rounded-full transition-all duration-500 ${completion >= 80 ? 'bg-emerald-500' : completion >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Modal ── */}
      {showStatsModal && stats && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/8 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-[#111] rounded-t-2xl px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <i className="ri-bar-chart-line text-violet-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">상세 통계 분석</h2>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
              >
                <i className="ri-close-line text-lg" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* 전체 통계 요약 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { icon: 'ri-bar-chart-fill',  color: 'text-blue-600 dark:text-indigo-400',  bg: 'bg-blue-50 dark:bg-indigo-500/10',  value: stats.totalWorkouts,                   unit: '회',   label: '총 운동 횟수' },
                  { icon: 'ri-timer-line',       color: 'text-emerald-400', bg: 'bg-emerald-500/10', value: formatTime(stats.totalDurationSeconds), unit: '',     label: '총 운동 시간' },
                  { icon: 'ri-repeat-line',      color: 'text-violet-400',  bg: 'bg-violet-500/10',  value: stats.totalCompletedSets,              unit: '세트', label: '총 완료 세트' },
                  { icon: 'ri-fire-line',        color: 'text-orange-400',  bg: 'bg-orange-500/10',  value: stats.currentStreak,                   unit: '일',   label: '연속 운동일' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-4 text-center">
                    <i className={`${s.icon} ${s.color} text-xl mb-2 block`} />
                    <div className={`text-xl font-bold ${s.color}`}>{s.value}<span className="text-sm ml-0.5">{s.unit}</span></div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 운동 부위별 */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">운동 부위별 분석</h3>
                  {stats.bodyPartStats.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-600">운동 부위 데이터가 없습니다.</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.bodyPartStats.map((stat, i) => {
                        const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-red-500'];
                        const textColors = ['text-blue-400', 'text-emerald-400', 'text-violet-400', 'text-amber-400', 'text-red-400'];
                        return (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className={`font-medium ${textColors[i % textColors.length]}`}>{stat.bodyPart}</span>
                              <span className="text-gray-600 dark:text-gray-400">{stat.percentage}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${colors[i % colors.length]}`} style={{ width: `${stat.percentage}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 월별 운동 추이 */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">월별 운동 추이</h3>
                  <div className="space-y-2">
                    {stats.monthlyStats.map((stat, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl">
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white">{stat.month}월</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">{stat.workoutCount}회</span>
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{formatTime(stat.totalDurationSeconds)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 주간 패턴 바 */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">주간 운동 패턴</h3>
                <div className="flex items-end gap-2 mb-2" style={{ height: '88px' }}>
                  {sortedWeeklyProgress.map(d => {
                    const isToday = d.dayOfWeek === TODAY_DAY_KEY;
                    const barH = d.workoutCount > 0
                      ? Math.max(Math.round((d.workoutCount / maxWorkoutCount) * 80), 12)
                      : 4;
                    return (
                      <div
                        key={d.dayOfWeek}
                        className={`flex-1 rounded-md transition-all duration-700 ${
                          d.workoutCount > 0
                            ? isToday ? 'bg-blue-400 dark:bg-indigo-400' : 'bg-blue-500 dark:bg-indigo-500'
                            : 'bg-gray-100 dark:bg-white/5'
                        }`}
                        style={{ height: `${barH}px` }}
                      />
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  {sortedWeeklyProgress.map(d => (
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
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">개인 기록</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: 'ri-timer-flash-line',     color: 'text-amber-400',   bg: 'bg-amber-500/10',   value: formatTime(stats.longestWorkoutSeconds),          label: '최장 운동 시간' },
                    { icon: 'ri-checkbox-circle-line', color: 'text-emerald-400', bg: 'bg-emerald-500/10', value: `${Math.round(stats.averageCompletionRate)}%`,     label: '평균 완료율' },
                    { icon: 'ri-heart-pulse-line',     color: 'text-violet-400',  bg: 'bg-violet-500/10',  value: stats.favoriteBodyPart ?? '-',                    label: '선호 운동 부위' },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-4 text-center">
                      <i className={`${item.icon} ${item.color} text-2xl mb-2 block`} />
                      <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
