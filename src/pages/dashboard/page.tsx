
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
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

// JS getDay(): 0=일,1=월,...,6=토 → 오늘 요일을 MON~SUN 키로 변환
const TODAY_DAY_KEY = DAY_ORDER[
  new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
];

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
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
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
    };
    fetchDashboardData();
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}시간 ${minutes}분`;
    return `${minutes}분`;
  };

  const formatDate = (dateStr: string): string => {
    const todayStr = new Date().toISOString().substring(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().substring(0, 10);
    if (dateStr === todayStr) return '오늘';
    if (dateStr === yesterdayStr) return '어제';
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '좋은 아침입니다';
    if (hour < 18) return '좋은 오후입니다';
    return '좋은 저녁입니다';
  };

  const getTodayDate = () =>
    currentTime.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

  const isActiveSession =
    latestSession &&
    (latestSession.status === 'IN_PROGRESS' || latestSession.status === 'PAUSED');

  const monthlyGoal = 20;
  const monthlyProgress = Math.min(
    Math.round(((stats?.monthlyWorkouts ?? 0) / monthlyGoal) * 100),
    100,
  );

  // weeklyProgress를 MON~SUN 순으로 정렬 (서버 응답 순서 보장)
  const sortedWeeklyProgress = DAY_ORDER.map(
    key => stats?.weeklyProgress.find(d => d.dayOfWeek === key) ?? {
      dayOfWeek: key as DashboardStatsResponse['weeklyProgress'][number]['dayOfWeek'],
      workoutCount: 0,
      totalDurationSeconds: 0,
    },
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 환영 메시지 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}, 운동러님! 💪
          </h1>
          <p className="text-gray-600">{getTodayDate()}</p>
        </div>

        {/* 에러 배너 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <i className="ri-error-warning-line mr-2"></i>
            {error}
          </div>
        )}

        {/* 오늘의 운동 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">오늘의 운동</h2>
          <Card className="p-6">
            {isActiveSession ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {latestSession.workoutProgramName}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {latestSession.status === 'PAUSED' ? '일시정지 중' : '진행 중'}
                    </p>
                  </div>
                  <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                    latestSession.status === 'PAUSED'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {latestSession.status === 'PAUSED' ? '일시정지' : '진행 중'}
                  </div>
                </div>
                <Button className="w-full" onClick={() => navigate('/workout/session')}>
                  <i className="ri-play-line mr-2"></i>
                  이어서 운동
                </Button>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">운동을 시작해볼까요?</h3>
                  <p className="text-gray-600 text-sm">
                    프로그램을 선택하거나 새로 만들어 운동을 시작하세요
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link to="/workout" className="flex-1">
                    <Button className="w-full">
                      <i className="ri-play-line mr-2"></i>
                      운동 시작
                    </Button>
                  </Link>
                  <Link to="/programs">
                    <Button variant="outline">
                      <i className="ri-edit-line mr-2"></i>
                      프로그램 관리
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* 주요 통계 카드 4개 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {loading ? '…' : (stats?.currentStreak ?? 0)}
            </div>
            <div className="text-sm text-gray-600">연속 운동일</div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {loading ? '…' : (stats?.weeklyWorkouts ?? 0)}
            </div>
            <div className="text-sm text-gray-600">이번 주 운동</div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {loading ? '…' : (stats?.totalWorkouts ?? 0)}
            </div>
            <div className="text-sm text-gray-600">총 운동 횟수</div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {loading ? '…' : `${Math.round(stats?.averageCompletionRate ?? 0)}%`}
            </div>
            <div className="text-sm text-gray-600">평균 완료율</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 이번 주 운동 현황 */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">이번 주 운동 현황</h3>
            <div className="space-y-3">
              {sortedWeeklyProgress.map(dayData => {
                const label = DAY_LABELS[dayData.dayOfWeek];
                const isToday = dayData.dayOfWeek === TODAY_DAY_KEY;
                return (
                  <div key={dayData.dayOfWeek} className="flex items-center justify-between">
                    <div className={`flex items-center gap-3 ${isToday ? 'font-medium text-blue-600' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        dayData.workoutCount > 0
                          ? 'bg-green-100 text-green-600'
                          : isToday
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-400'
                      }`}>
                        {label}
                      </div>
                      <span className="text-sm">{label}요일</span>
                    </div>
                    <div className="text-right">
                      {dayData.workoutCount > 0 ? (
                        <>
                          <div className="text-sm font-medium text-gray-900">{dayData.workoutCount}회</div>
                          <div className="text-xs text-gray-500">{formatTime(dayData.totalDurationSeconds)}</div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-400">휴식</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* 통계 분석 */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">통계 분석</h3>
              <Button variant="outline" size="sm" onClick={() => setShowStatsModal(true)}>
                <i className="ri-bar-chart-line mr-1"></i>
                상세보기
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>이번 달 목표</span>
                  <span>{stats?.monthlyWorkouts ?? 0}/{monthlyGoal}회</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${monthlyProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {loading ? '…' : (stats?.favoriteBodyPart ?? '-')}
                  </div>
                  <div className="text-xs text-gray-600">선호 부위</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {loading ? '…' : formatTime(stats?.longestWorkoutSeconds ?? 0)}
                  </div>
                  <div className="text-xs text-gray-600">최장 운동</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 빠른 액션 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">빠른 액션</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/workout">
              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-play-line text-xl text-blue-600"></i>
                </div>
                <div className="font-medium text-gray-900">운동 시작</div>
              </Card>
            </Link>

            <Link to="/programs">
              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-settings-line text-xl text-green-600"></i>
                </div>
                <div className="font-medium text-gray-900">프로그램 관리</div>
              </Card>
            </Link>

            <Link to="/history">
              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-history-line text-xl text-purple-600"></i>
                </div>
                <div className="font-medium text-gray-900">운동일지</div>
              </Card>
            </Link>

            <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-trophy-line text-xl text-orange-600"></i>
              </div>
              <div className="font-medium text-gray-900">목표 설정</div>
            </Card>
          </div>
        </div>

        {/* 최근 운동 기록 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">최근 운동 기록</h2>
            <Link to="/history">
              <Button variant="outline" size="sm">
                전체보기
                <i className="ri-arrow-right-s-line ml-1"></i>
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              [1, 2, 3].map(i => (
                <Card key={i} className="p-4">
                  <div className="animate-pulse flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  </div>
                </Card>
              ))
            ) : !stats || stats.recentWorkouts.length === 0 ? (
              <Card className="p-6 text-center text-gray-500">
                아직 운동 기록이 없습니다. 첫 번째 운동을 시작해보세요!
              </Card>
            ) : (
              stats.recentWorkouts.map(workout => {
                const completion =
                  workout.totalSets > 0
                    ? Math.round((workout.completedSets / workout.totalSets) * 100)
                    : 0;
                return (
                  <Card key={workout.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{workout.programName}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{formatDate(workout.date)}</span>
                          <span>{formatTime(workout.totalDurationSeconds)}</span>
                          <span className="text-green-600 font-medium">{completion}% 완료</span>
                        </div>
                      </div>
                      <Link to={`/history/${workout.id}`}>
                        <Button variant="outline" size="sm">
                          상세보기
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 상세 통계 모달 */}
      {showStatsModal && stats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">상세 통계 분석</h2>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* 전체 통계 요약 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalWorkouts}</div>
                  <div className="text-sm text-gray-600">총 운동 횟수</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">{formatTime(stats.totalDurationSeconds)}</div>
                  <div className="text-sm text-gray-600">총 운동 시간</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{stats.totalCompletedSets}</div>
                  <div className="text-sm text-gray-600">총 완료 세트</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 mb-1">{stats.currentStreak}일</div>
                  <div className="text-sm text-gray-600">연속 운동일</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* 운동 부위별 통계 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">운동 부위별 분석</h3>
                  {stats.bodyPartStats.length === 0 ? (
                    <p className="text-sm text-gray-500">운동 부위 데이터가 없습니다.</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.bodyPartStats.map((stat, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${
                              index === 0 ? 'bg-blue-500' :
                              index === 1 ? 'bg-green-500' :
                              index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                            }`}></div>
                            <span className="text-sm font-medium text-gray-900">{stat.bodyPart}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  index === 0 ? 'bg-blue-500' :
                                  index === 1 ? 'bg-green-500' :
                                  index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                                }`}
                                style={{ width: `${stat.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">{stat.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 월별 운동 추이 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">월별 운동 추이</h3>
                  <div className="space-y-3">
                    {stats.monthlyStats.map((stat, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{stat.month}월</div>
                          <div className="text-sm text-gray-600">{stat.workoutCount}회 운동</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">{formatTime(stat.totalDurationSeconds)}</div>
                          <div className="text-sm text-gray-600">총 시간</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 주간 운동 패턴 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">주간 운동 패턴</h3>
                <div className="grid grid-cols-7 gap-2">
                  {sortedWeeklyProgress.map(dayData => (
                    <div key={dayData.dayOfWeek} className="text-center">
                      <div className="text-xs text-gray-600 mb-2">{DAY_LABELS[dayData.dayOfWeek]}</div>
                      <div className={`h-20 rounded-lg flex items-end justify-center p-2 ${
                        dayData.workoutCount > 0 ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <div
                          className={`w-full rounded ${
                            dayData.workoutCount > 0 ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                          style={{ height: `${Math.max(dayData.workoutCount * 30, 4)}px` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {dayData.workoutCount > 0 ? `${dayData.workoutCount}회` : '휴식'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 개인 기록 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">개인 기록</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-yellow-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600 mb-1">{formatTime(stats.longestWorkoutSeconds)}</div>
                    <div className="text-sm text-gray-600">최장 운동 시간</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">{Math.round(stats.averageCompletionRate)}%</div>
                    <div className="text-sm text-gray-600">평균 완료율</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">{stats.favoriteBodyPart ?? '-'}</div>
                    <div className="text-sm text-gray-600">선호 운동 부위</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
