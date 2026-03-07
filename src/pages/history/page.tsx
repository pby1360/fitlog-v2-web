import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import Header from '../../components/feature/Header';
import { getWorkoutLogs, getWorkoutLog, WorkoutLogResponse } from '../../services/api';

type WorkoutRecord = WorkoutLogResponse;

export default function HistoryPage() {
  const [workoutRecords, setWorkoutRecords] = useState<WorkoutRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<WorkoutRecord | null>(null);
  const [view, setView] = useState<'list' | 'calendar' | 'detail'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const logs = await getWorkoutLogs();
        setWorkoutRecords(logs);
      } catch (err) {
        setError('운동 기록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // URL 파라미터에 따라 상세 화면 표시
  useEffect(() => {
    if (!id) {
      setSelectedRecord(null);
      setView('list');
      return;
    }

    const numericId = Number(id);
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const log = await getWorkoutLog(numericId);
        setSelectedRecord(log);
        setView('detail');
      } catch {
        navigate('/history');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '어제';
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      });
    }
  };

  const getCompletionRate = (record: WorkoutRecord) => {
    if (record.totalSets === 0) return 0;
    return Math.round((record.completedSets / record.totalSets) * 100);
  };

  const viewDetail = (record: WorkoutRecord) => {
    navigate(`/history/${record.id}`);
  };

  const backToList = () => {
    navigate('/history');
  };

  const backToCalendar = () => {
    setView('calendar');
    navigate('/history');
  };

  // 캘린더 관련 함수들
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getWorkoutForDate = (date: string) => {
    return workoutRecords.filter(record => record.date === date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  if (loading && view !== 'detail') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-center h-64">
          <div className="text-gray-500">불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error && view !== 'detail') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Card className="p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>다시 시도</Button>
          </Card>
        </div>
      </div>
    );
  }

  // 캘린더 뷰
  if (view === 'calendar') {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const monthYear = currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });

    const calendarDays = [];

    // 빈 칸 추가 (이전 달 마지막 날들)
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(null);
    }

    // 현재 달의 날짜들 추가
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* 헤더 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Link to="/" className="hover:text-blue-600">홈</Link>
              <i className="ri-arrow-right-s-line"></i>
              <span>운동일지</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">운동일지</h1>
                <p className="text-gray-600 mt-1">캘린더로 운동 기록을 확인하세요</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={view === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setView('list');
                    navigate('/history');
                  }}
                  className="whitespace-nowrap"
                >
                  <i className="ri-list-unordered mr-2"></i>
                  목록
                </Button>
                <Button
                  variant={view === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('calendar')}
                  className="whitespace-nowrap"
                >
                  <i className="ri-calendar-line mr-2"></i>
                  캘린더
                </Button>
              </div>
            </div>
          </div>

          {/* 캘린더 */}
          <Card className="p-4 sm:p-6">
            {/* 캘린더 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{monthYear}</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')} className="whitespace-nowrap">
                  <i className="ri-arrow-left-s-line"></i>
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')} className="whitespace-nowrap">
                  <i className="ri-arrow-right-s-line"></i>
                </Button>
              </div>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                <div key={day} className={`p-2 sm:p-3 text-center text-xs sm:text-sm font-medium ${
                  index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  {day}
                </div>
              ))}
            </div>

            {/* 캘린더 날짜 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={index} className="p-2 h-20 sm:h-24"></div>;
                }

                const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const workoutsForDay = getWorkoutForDate(dateString);
                const isToday = new Date().toDateString() === new Date(dateString).toDateString();

                return (
                  <div
                    key={day}
                    className={`p-1 sm:p-2 h-20 sm:h-24 border border-gray-200 rounded-lg ${
                      isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
                    }`}
                  >
                    <div className={`text-xs sm:text-sm font-medium mb-1 ${
                      isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {workoutsForDay.slice(0, 2).map((workout) => (
                        <button
                          key={workout.id}
                          onClick={() => viewDetail(workout)}
                          className="w-full text-left text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded truncate hover:bg-green-200 cursor-pointer transition-colors"
                        >
                          {workout.programName}
                        </button>
                      ))}
                      {workoutsForDay.length > 2 && (
                        <div className="text-xs text-gray-500 px-1">
                          +{workoutsForDay.length - 2}개 더
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // 운동 기록 목록 화면
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* 헤더 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Link to="/" className="hover:text-blue-600">홈</Link>
              <i className="ri-arrow-right-s-line"></i>
              <span>운동일지</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">운동일지</h1>
                <p className="text-gray-600 mt-1">지금까지의 운동 기록을 확인하세요</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={view === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('list')}
                  className="whitespace-nowrap"
                >
                  <i className="ri-list-unordered mr-2"></i>
                  목록
                </Button>
                <Button
                  variant={view === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('calendar')}
                  className="whitespace-nowrap"
                >
                  <i className="ri-calendar-line mr-2"></i>
                  캘린더
                </Button>
              </div>
            </div>
          </div>

          {/* 통계 요약 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <Card className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-600 mb-1">
                {workoutRecords.length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">총 운동 횟수</div>
            </Card>

            <Card className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-600 mb-1">
                {formatTime(workoutRecords.reduce((total, record) => total + record.totalTime, 0))}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">총 운동 시간</div>
            </Card>

            <Card className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-purple-600 mb-1">
                {workoutRecords.reduce((total, record) => total + record.completedSets, 0)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">완료한 세트</div>
            </Card>

            <Card className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-orange-600 mb-1">
                {workoutRecords.length > 0
                  ? Math.round(workoutRecords.reduce((total, record) => total + getCompletionRate(record), 0) / workoutRecords.length)
                  : 0}%
              </div>
              <div className="text-xs sm:text-sm text-gray-600">평균 완료율</div>
            </Card>
          </div>

          {/* 운동 기록 목록 */}
          {workoutRecords.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-history-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">운동 기록이 없습니다</h3>
              <p className="text-gray-600 mb-4">첫 번째 운동을 완료하면 기록이 여기에 표시됩니다</p>
              <Link to="/workout">
                <Button className="whitespace-nowrap">
                  <i className="ri-play-line mr-2"></i>
                  운동 시작하기
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {workoutRecords.map((record) => (
                <Card
                  key={record.id}
                  className="p-4 sm:p-6 hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-3 sm:gap-4" onClick={() => viewDetail(record)}>
                    {/* 헤더 정보 */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{record.programName}</h3>
                          <span className="text-sm text-gray-500 font-medium">{formatDate(record.date)}</span>
                        </div>

                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <i className="ri-time-line text-xs"></i>
                            <span className="text-xs sm:text-sm">{record.startTime} - {record.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <i className="ri-timer-line text-xs"></i>
                            <span className="text-xs sm:text-sm">{formatTime(record.totalTime)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <i className="ri-list-check-line text-xs"></i>
                            <span className="text-xs sm:text-sm">{record.completedExercises}/{record.totalExercises} 운동</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <i className="ri-repeat-line text-xs"></i>
                            <span className="text-xs sm:text-sm">{record.completedSets}/{record.totalSets} 세트</span>
                          </div>
                        </div>
                      </div>

                      {/* 완료율 표시 */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
                        <div className="text-xl sm:text-2xl font-bold text-green-600">{getCompletionRate(record)}%</div>
                        <div className="text-xs text-gray-600">완료율</div>
                      </div>
                    </div>

                    {/* 운동 부위 */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-sm text-gray-600 font-medium">운동 부위:</span>
                      <div className="flex flex-wrap gap-1">
                        {record.bodyParts.map((bodyPart, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                            {bodyPart}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 하단 액션 영역 */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <i className="ri-trophy-line text-yellow-500"></i>
                          <span>목표 달성</span>
                        </div>
                        <div className="text-xs">
                          {record.exercises.filter(ex =>
                            ex.sets.every(set => set.actualReps >= set.targetReps)
                          ).length}/{record.exercises.length} 운동
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          viewDetail(record);
                        }}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <span className="text-sm font-medium">상세보기</span>
                        <i className="ri-arrow-right-s-line"></i>
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 운동 기록 상세 화면
  if (view === 'detail' && selectedRecord) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* 헤더 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Link to="/" className="hover:text-blue-600">홈</Link>
              <i className="ri-arrow-right-s-line"></i>
              <Link to="/history" className="hover:text-blue-600">운동일지</Link>
              <i className="ri-arrow-right-s-line"></i>
              <span>상세 기록</span>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedRecord.programName}</h1>
                <p className="text-gray-600 mt-1">
                  {formatDate(selectedRecord.date)} • {selectedRecord.startTime} - {selectedRecord.endTime}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={backToList} className="whitespace-nowrap text-sm">
                  <i className="ri-list-unordered mr-2"></i>
                  목록으로
                </Button>
                <Button variant="outline" onClick={backToCalendar} className="whitespace-nowrap text-sm">
                  <i className="ri-calendar-line mr-2"></i>
                  캘린더로
                </Button>
              </div>
            </div>
          </div>

          {/* 운동 요약 정보 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
                {formatTime(selectedRecord.totalTime)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">총 운동시간</div>
            </Card>

            <Card className="p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                {selectedRecord.completedExercises}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">완료한 운동</div>
            </Card>

            <Card className="p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">
                {selectedRecord.completedSets}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">완료한 세트</div>
            </Card>

            <Card className="p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-orange-600 mb-1">
                {getCompletionRate(selectedRecord)}%
              </div>
              <div className="text-xs sm:text-sm text-gray-600">완료율</div>
            </Card>
          </div>

          {/* 운동 부위별 정보 */}
          <Card className="p-4 sm:p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">운동 부위</h3>
            <div className="flex flex-wrap gap-2">
              {selectedRecord.bodyParts.map((bodyPart, index) => (
                <span key={index} className="px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded-lg font-medium">
                  {bodyPart}
                </span>
              ))}
            </div>
          </Card>

          {/* 운동별 상세 기록 */}
          <div className="space-y-6">
            {selectedRecord.exercises.map((exercise, exerciseIndex) => (
              <Card key={exercise.id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{exercise.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600 mt-1">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">{exercise.bodyPart}</span>
                      <span className="text-xs sm:text-sm">운동시간: {formatTime(exercise.exerciseTime)}</span>
                      <span className="text-xs sm:text-sm">{exercise.sets.length}세트 완료</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">#{exerciseIndex + 1}</div>
                  </div>
                </div>

                {/* 세트별 상세 정보 - 모바일 최적화 */}
                <div className="space-y-3">
                  <div className="hidden sm:grid sm:grid-cols-6 gap-2 text-xs font-medium text-gray-600 pb-2 border-b">
                    <div>세트</div>
                    <div>횟수</div>
                    <div>무게</div>
                    <div>휴식</div>
                    <div>메모</div>
                    <div>달성률</div>
                  </div>

                  {exercise.sets.map((set, setIndex) => (
                    <div key={set.id} className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
                      {/* 모바일 뷰 */}
                      <div className="sm:hidden">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">세트 {setIndex + 1}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            set.actualReps >= set.targetReps
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {set.actualReps >= set.targetReps ? '완료' : '미달'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">횟수: </span>
                            <span className={set.actualReps >= set.targetReps ? 'text-green-600 font-medium' : 'text-orange-600'}>
                              {set.actualReps}
                            </span>
                            <span className="text-gray-400">/{set.targetReps}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">무게: </span>
                            {set.targetWeight ? (
                              <>
                                <span className={set.actualWeight && set.actualWeight >= set.targetWeight ? 'text-green-600 font-medium' : 'text-orange-600'}>
                                  {set.actualWeight || set.targetWeight}
                                </span>
                                {set.targetWeight && <span className="text-gray-400">/{set.targetWeight}kg</span>}
                              </>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                          <div>
                            <span className="text-gray-600">휴식: </span>
                            <span>{Math.floor(set.restTime / 60)}분</span>
                          </div>
                          <div>
                            <span className="text-gray-600">메모: </span>
                            <span className="text-xs">{set.memo || '-'}</span>
                          </div>
                        </div>
                      </div>

                      {/* 데스크톱 뷰 */}
                      <div className="hidden sm:grid sm:grid-cols-6 gap-2 text-sm py-2">
                        <div className="font-medium text-gray-900">{setIndex + 1}</div>
                        <div className="text-gray-700">
                          <span className={set.actualReps >= set.targetReps ? 'text-green-600 font-medium' : 'text-orange-600'}>
                            {set.actualReps}
                          </span>
                          <span className="text-gray-400">/{set.targetReps}</span>
                        </div>
                        <div className="text-gray-700">
                          {set.targetWeight ? (
                            <>
                              <span className={set.actualWeight && set.actualWeight >= set.targetWeight ? 'text-green-600 font-medium' : 'text-orange-600'}>
                                {set.actualWeight || set.targetWeight}
                              </span>
                              {set.targetWeight && <span className="text-gray-400">/{set.targetWeight}kg</span>}
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                        <div className="text-gray-600">{Math.floor(set.restTime / 60)}분</div>
                        <div className="text-gray-600 text-xs">
                          {set.memo || '-'}
                        </div>
                        <div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            set.actualReps >= set.targetReps
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {set.actualReps >= set.targetReps ? '완료' : '미달'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 운동별 통계 */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {exercise.sets.reduce((total, set) => total + set.actualReps, 0)}
                      </div>
                      <div className="text-xs text-gray-600">총 횟수</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {exercise.sets.filter(set => set.actualWeight).length > 0
                          ? Math.max(...exercise.sets.filter(set => set.actualWeight).map(set => set.actualWeight!))
                          : '-'
                        }
                        {exercise.sets.filter(set => set.actualWeight).length > 0 && 'kg'}
                      </div>
                      <div className="text-xs text-gray-600">최대 무게</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">
                        {exercise.sets.length}
                      </div>
                      <div className="text-xs text-gray-600">완료 세트</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-600">
                        {formatTime(exercise.exerciseTime)}
                      </div>
                      <div className="text-xs text-gray-600">운동 시간</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
