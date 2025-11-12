
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import Header from '../../components/feature/Header';

interface WorkoutStats {
  totalWorkouts: number;
  totalTime: number;
  totalSets: number;
  averageCompletion: number;
  weeklyWorkouts: number;
  monthlyWorkouts: number;
  favoriteBodyPart: string;
  longestWorkout: number;
  currentStreak: number;
  weeklyProgress: { day: string; workouts: number; time: number }[];
  bodyPartStats: { bodyPart: string; count: number; percentage: number }[];
  monthlyStats: { month: string; workouts: number; time: number }[];
}

// 샘플 통계 데이터
const sampleStats: WorkoutStats = {
  totalWorkouts: 24,
  totalTime: 1800, // 30시간 (초 단위)
  totalSets: 156,
  averageCompletion: 87,
  weeklyWorkouts: 4,
  monthlyWorkouts: 16,
  favoriteBodyPart: '상체',
  longestWorkout: 5400, // 90분
  currentStreak: 7,
  weeklyProgress: [
    { day: '월', workouts: 1, time: 4500 },
    { day: '화', workouts: 0, time: 0 },
    { day: '수', workouts: 1, time: 3600 },
    { day: '목', workouts: 1, time: 4200 },
    { day: '금', workouts: 0, time: 0 },
    { day: '토', workouts: 1, time: 5400 },
    { day: '일', workouts: 0, time: 0 }
  ],
  bodyPartStats: [
    { bodyPart: '상체', count: 10, percentage: 42 },
    { bodyPart: '하체', count: 8, percentage: 33 },
    { bodyPart: '전신', count: 4, percentage: 17 },
    { bodyPart: '유산소', count: 2, percentage: 8 }
  ],
  monthlyStats: [
    { month: '11월', workouts: 12, time: 14400 },
    { month: '12월', workouts: 16, time: 19800 },
    { month: '1월', workouts: 24, time: 28800 }
  ]
};

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [stats] = useState<WorkoutStats>(sampleStats);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분`;
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '좋은 아침입니다';
    if (hour < 18) return '좋은 오후입니다';
    return '좋은 저녁입니다';
  };

  const getTodayDate = () => {
    return currentTime.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

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

        {/* 오늘의 운동 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">오늘의 운동</h2>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">상체 집중 루틴</h3>
                <p className="text-gray-600 text-sm">3개 운동 • 9세트 • 약 75분</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">14:30</div>
                <div className="text-sm text-gray-600">예정 시간</div>
              </div>
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
                  수정
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* 주요 통계 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">7</div>
            <div className="text-sm text-gray-600">연속 운동일</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">4</div>
            <div className="text-sm text-gray-600">이번 주 운동</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">24</div>
            <div className="text-sm text-gray-600">총 운동 횟수</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">87%</div>
            <div className="text-sm text-gray-600">평균 완료율</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 이번 주 운동 현황 */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">이번 주 운동 현황</h3>
            <div className="space-y-3">
              {['월', '화', '수', '목', '금', '토', '일'].map((day, index) => {
                const dayData = stats.weeklyProgress[index];
                const isToday = index === new Date().getDay() - 1;
                return (
                  <div key={day} className="flex items-center justify-between">
                    <div className={`flex items-center gap-3 ${isToday ? 'font-medium text-blue-600' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        dayData.workouts > 0 
                          ? 'bg-green-100 text-green-600' 
                          : isToday 
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-400'
                      }`}>
                        {day}
                      </div>
                      <span className="text-sm">{day}요일</span>
                    </div>
                    <div className="text-right">
                      {dayData.workouts > 0 ? (
                        <>
                          <div className="text-sm font-medium text-gray-900">{dayData.workouts}회</div>
                          <div className="text-xs text-gray-500">{formatTime(dayData.time)}</div>
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowStatsModal(true)}
              >
                <i className="ri-bar-chart-line mr-1"></i>
                상세보기
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>이번 달 목표</span>
                  <span>16/20회</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">상체</div>
                  <div className="text-xs text-gray-600">선호 부위</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">90분</div>
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
            {[
              { id: '1', name: '상체 집중 루틴', date: '오늘', time: '75분', completion: 100 },
              { id: '2', name: '하체 강화 프로그램', date: '어제', time: '80분', completion: 95 },
              { id: '3', name: '전신 운동 루틴', date: '1월 23일', time: '90분', completion: 88 }
            ].map((workout) => (
              <Card key={workout.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{workout.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>{workout.date}</span>
                      <span>{workout.time}</span>
                      <span className="text-green-600 font-medium">{workout.completion}% 완료</span>
                    </div>
                  </div>
                  <Link to={`/history/${workout.id}`}>
                    <Button variant="outline" size="sm">
                      상세보기
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* 상세 통계 모달 */}
      {showStatsModal && (
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
                  <div className="text-2xl font-bold text-green-600 mb-1">{formatTime(stats.totalTime)}</div>
                  <div className="text-sm text-gray-600">총 운동 시간</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{stats.totalSets}</div>
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
                </div>

                {/* 월별 운동 추이 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">월별 운동 추이</h3>
                  <div className="space-y-3">
                    {stats.monthlyStats.map((stat, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{stat.month}</div>
                          <div className="text-sm text-gray-600">{stat.workouts}회 운동</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">{formatTime(stat.time)}</div>
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
                  {stats.weeklyProgress.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-gray-600 mb-2">{day.day}</div>
                      <div className={`h-20 rounded-lg flex items-end justify-center p-2 ${
                        day.workouts > 0 ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <div 
                          className={`w-full rounded ${
                            day.workouts > 0 ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                          style={{ height: `${Math.max(day.workouts * 30, 4)}px` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {day.workouts > 0 ? `${day.workouts}회` : '휴식'}
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
                    <div className="text-2xl font-bold text-yellow-600 mb-1">{formatTime(stats.longestWorkout)}</div>
                    <div className="text-sm text-gray-600">최장 운동 시간</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">{stats.averageCompletion}%</div>
                    <div className="text-sm text-gray-600">평균 완료율</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">{stats.favoriteBodyPart}</div>
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
