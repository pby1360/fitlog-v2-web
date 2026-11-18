import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import Header from '../../components/feature/Header';
import { getWorkoutLogs, getWorkoutLog, type WorkoutLogResponse, type WorkoutLogPage } from '../../services/api';
import { kstDateDaysAgo, monthRange, toKstDateString } from '../../utils/date';

const CALENDAR_PAGE_SIZE = 200;
const PERIOD_OPTIONS = [
  { value: '1w', label: '1주일', days: 7 },
  { value: '1m', label: '1개월', days: 30 },
  { value: '3m', label: '3개월', days: 90 },
  { value: '6m', label: '6개월', days: 180 },
  { value: 'all', label: '전체', days: undefined },
] as const;

type WorkoutRecord = WorkoutLogResponse;
type Period = typeof PERIOD_OPTIONS[number]['value'];
type LoadResult<T> = { key: string; value: T | null };

function listSearchParams(period: Period, page = 0) {
  const params = new URLSearchParams();
  if (period !== '1m') params.set('period', period);
  if (page > 0) params.set('page', String(page));
  return params.size ? '?' + params.toString() : '';
}

function calendarSearchParams(month: string, listSearch: string) {
  const params = new URLSearchParams(listSearch);
  params.set('view', 'calendar');
  params.set('month', month);
  return '?' + params.toString();
}

export default function HistoryPage() {
  const [listResult, setListResult] = useState<LoadResult<WorkoutLogPage>>();
  const [monthResult, setMonthResult] = useState<LoadResult<WorkoutRecord[]>>();
  const [detail, setDetail] = useState<WorkoutRecord>();
  const [expandedDate, setExpandedDate] = useState<string>();
  const dayDialog = useRef<HTMLDialogElement>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const now = new Date();
  const today = toKstDateString(now);
  const yesterday = kstDateDaysAgo(1, now);
  const requestedMonth = searchParams.get('month') ?? '';
  const monthKey = /^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(requestedMonth) ? requestedMonth : today.slice(0, 7);
  const [year, month] = monthKey.split('-').map(Number);
  const fromCalendar = searchParams.get('view') === 'calendar';
  const view = id ? 'detail' : fromCalendar ? 'calendar' : 'list';

  const period = PERIOD_OPTIONS.find(option => option.value === searchParams.get('period')) ?? PERIOD_OPTIONS[1];
  const requestedPage = Number(searchParams.get('page'));
  const page = Number.isSafeInteger(requestedPage) && requestedPage >= 0 ? requestedPage : 0;
  const listSearch = listSearchParams(period.value, page);
  const listPath = '/history' + listSearch;
  const calendarSearch = calendarSearchParams(monthKey, listSearch);
  const calendarPath = '/history' + calendarSearch;
  const returnPath = fromCalendar ? calendarPath : listPath;

  const list = listResult?.key === listSearch ? listResult.value : undefined;
  const calendarRecords = monthResult?.key === monthKey ? monthResult.value : undefined;
  const selectedRecord = detail?.id === Number(id) ? detail : undefined;

  useEffect(() => {
    if (view !== 'list' || list !== undefined) return;
    let active = true;

    async function loadList() {
      // Strict Mode가 즉시 정리하는 초기 effect는 요청을 보내지 않는다.
      await Promise.resolve();
      if (!active) return;
      const now = new Date();
      const start = period.days === undefined ? undefined : kstDateDaysAgo(period.days, now);
      const end = period.days === undefined ? undefined : toKstDateString(now);
      try {
        const value = await getWorkoutLogs(page, 10, start, end);
        if (active) setListResult({ key: listSearch, value });
      } catch {
        if (active) setListResult({ key: listSearch, value: null });
      }
    }

    void loadList();
    return () => { active = false; };
  }, [view, list, listSearch, page, period.days]);

  useEffect(() => {
    if (view !== 'calendar' || calendarRecords !== undefined) return;
    let active = true;

    async function loadMonth() {
      await Promise.resolve();
      if (!active) return;
      const { startDate, endDate } = monthRange(year, month);
      try {
        const first = await getWorkoutLogs(0, CALENDAR_PAGE_SIZE, startDate, endDate);
        if (!active) return;
        const records = new Map(first.logs.map(log => [log.id, log]));
        // 최초 응답의 페이지 수로 조회 범위를 제한한다.
        for (let next = 1; next < first.totalPages; next++) {
          const result = await getWorkoutLogs(next, CALENDAR_PAGE_SIZE, startDate, endDate);
          if (!active) return;
          for (const log of result.logs) records.set(log.id, log);
          if (!result.hasNext) break;
        }
        setMonthResult({ key: monthKey, value: [...records.values()] });
      } catch {
        if (active) setMonthResult({ key: monthKey, value: null });
      }
    }

    void loadMonth();
    return () => { active = false; };
  }, [view, calendarRecords, monthKey, year, month]);

  useEffect(() => {
    if (!id) return;
    let active = true;

    async function loadDetail() {
      await Promise.resolve();
      if (!active) return;
      try {
        const log = await getWorkoutLog(Number(id));
        if (active) setDetail(log);
      } catch {
        if (active) navigate(returnPath, { replace: true });
      }
    }

    void loadDetail();
    return () => { active = false; };
  }, [id, navigate, returnPath]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분`;
  };

  const formatDate = (dateString: string) => {
    if (dateString === today) return '오늘';
    if (dateString === yesterday) return '어제';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      timeZone: 'UTC',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const getCompletionRate = (record: WorkoutRecord) => {
    if (record.totalSets === 0) return 0;
    return Math.round((record.completedSets / record.totalSets) * 100);
  };

  const viewDetail = (record: WorkoutRecord) => {
    navigate('/history/' + record.id + (fromCalendar ? calendarSearch : listSearch));
  };

  const navigateMonth = (offset: number) => {
    const next = new Date(Date.UTC(year, month - 1 + offset, 1));
    navigate('/history' + calendarSearchParams(next.toISOString().slice(0, 7), listSearch), { replace: true });
  };

  if ((view === 'list' && list === undefined) || (view === 'detail' && !selectedRecord)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-center h-64">
          <div className="text-gray-500">불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (view === 'list' && list === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Card className="p-8 text-center bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 mb-4">운동 기록을 불러오는데 실패했습니다.</p>
            <Button onClick={() => setListResult(undefined)}>다시 시도</Button>
          </Card>
        </div>
      </div>
    );
  }

  // 캘린더 뷰
  if (view === 'calendar') {
    const firstDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    const { endDate } = monthRange(year, month);
    const daysInMonth = Number(endDate.slice(-2));
    const calendarDays = Array.from({ length: firstDay + daysInMonth },
      (_, index) => index < firstDay ? null : index - firstDay + 1);
    const recordsByDate = new Map<string, WorkoutRecord[]>();
    for (const record of calendarRecords ?? []) {
      const records = recordsByDate.get(record.date);
      if (records) records.push(record);
      else recordsByDate.set(record.date, [record]);
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        <Header />

        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* 헤더 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">홈</Link>
              <i className="ri-arrow-right-s-line"></i>
              <span>운동일지</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">운동일지</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">캘린더로 운동 기록을 확인하세요</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(listPath)}
                  className="whitespace-nowrap border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <i className="ri-list-unordered mr-2"></i>
                  목록
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  aria-pressed="true"
                  className="whitespace-nowrap bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 border-0"
                >
                  <i className="ri-calendar-line mr-2"></i>
                  캘린더
                </Button>
              </div>
            </div>
          </div>

          {/* 캘린더 */}
          <Card className="p-4 sm:p-6 bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5">
            {/* 캘린더 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{year}년 {month}월</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" aria-label="이전 달" onClick={() => navigateMonth(-1)} className="whitespace-nowrap border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                  <i className="ri-arrow-left-s-line"></i>
                </Button>
                <Button variant="outline" size="sm" aria-label="다음 달" onClick={() => navigateMonth(1)} className="whitespace-nowrap border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                  <i className="ri-arrow-right-s-line"></i>
                </Button>
              </div>
            </div>

            {calendarRecords === null && (
              <div className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
                <span>이 달의 운동 기록을 불러오지 못했습니다.</span>
                <button onClick={() => setMonthResult(undefined)} className="font-medium underline">다시 시도</button>
              </div>
            )}

            {calendarRecords === undefined && (
              <p role="status" className="mb-4 text-sm text-gray-500">이 달의 운동 기록을 불러오는 중...</p>
            )}
            {calendarRecords?.length === 0 && (
              <p className="mb-4 text-sm text-gray-500">이 달의 운동 기록이 없습니다.</p>
            )}

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                <div key={day} className={`p-2 sm:p-3 text-center text-xs sm:text-sm font-medium ${
                  index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-600 dark:text-indigo-400' : 'text-gray-500'
                }`}>
                  {day}
                </div>
              ))}
            </div>

            {/* 캘린더 날짜 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={'empty-' + index} className="p-2 min-h-20 sm:min-h-24"></div>;
                }

                const dateString = monthKey + '-' + String(day).padStart(2, '0');
                const workoutsForDay = recordsByDate.get(dateString) ?? [];
                const isToday = dateString === today;

                return (
                  <div
                    key={day}
                    className={`p-1 sm:p-2 min-h-20 sm:min-h-24 border rounded-lg ${
                      isToday ? 'bg-blue-50 dark:bg-indigo-500/10 border-blue-300 dark:border-indigo-500/30' : 'bg-gray-50 dark:bg-white/[0.02] border-gray-100 dark:border-white/5'
                    }`}
                  >
                    <div aria-current={isToday ? 'date' : undefined} className={`text-xs sm:text-sm font-medium mb-1 ${
                      isToday ? 'text-blue-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {day}
                    </div>
                    <div className="grid gap-1">
                      {workoutsForDay.slice(0, 2).map((workout) => (
                        <button
                          key={workout.id}
                          onClick={() => viewDetail(workout)}
                          className="w-full text-left text-xs bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded truncate hover:bg-emerald-500/20 cursor-pointer transition-colors"
                        >
                          {workout.programName}
                        </button>
                      ))}
                      {workoutsForDay.length > 2 && (
                        <button
                          type="button"
                          aria-haspopup="dialog"
                          aria-label={day + '일 +' + (workoutsForDay.length - 2) + '개 더'}
                          onClick={() => {
                            setExpandedDate(dateString);
                            dayDialog.current?.showModal();
                          }}
                          className="w-full truncate px-1 text-left text-xs text-indigo-600 underline dark:text-indigo-300"
                        >
                          +{workoutsForDay.length - 2}개 더
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <dialog
            ref={dayDialog}
            onClose={() => setExpandedDate(undefined)}
            aria-labelledby="calendar-day-title"
            className="m-auto max-h-[80vh] w-11/12 max-w-md overflow-y-auto rounded-xl bg-white p-4 text-gray-900 backdrop:bg-black/50 dark:bg-[#111] dark:text-white"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 id="calendar-day-title" className="font-semibold">
                {expandedDate ? formatDate(expandedDate) + ' 운동 기록' : '운동 기록'}
              </h3>
              <Button variant="outline" size="sm" onClick={() => dayDialog.current?.close()}>닫기</Button>
            </div>
            {expandedDate && (
              <ul className="space-y-1">
                {recordsByDate.get(expandedDate)?.map(record => (
                  <li key={record.id}>
                    <button type="button" onClick={() => { dayDialog.current?.close(); viewDetail(record); }}
                      className="w-full break-words rounded bg-emerald-500/10 px-3 py-2 text-left text-sm text-emerald-700 dark:text-emerald-300">
                      <span className="mr-2 text-xs">{record.startTime}</span>
                      {record.programName}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </dialog>
        </div>
      </div>
    );
  }

  // 운동 기록 목록 화면
  if (view === 'list' && list) {
    const {
      logs: workoutRecords, currentPage, totalPages, totalElements,
      totalDurationSeconds, totalCompletedSets, averageCompletionRate,
    } = list;
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        <Header />

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* 헤더 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">홈</Link>
              <i className="ri-arrow-right-s-line"></i>
              <span>운동일지</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">운동일지</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">지금까지의 운동 기록을 확인하세요</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  aria-pressed="true"
                  className="whitespace-nowrap bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 border-0"
                >
                  <i className="ri-list-unordered mr-2"></i>
                  목록
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(calendarPath)}
                  className="whitespace-nowrap border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <i className="ri-calendar-line mr-2"></i>
                  캘린더
                </Button>
              </div>
            </div>
          </div>

          {/* 조회 기간 선택 */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">조회 기간</span>
            <div className="flex gap-1">
              {PERIOD_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => navigate('/history' + listSearchParams(option.value))}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap border ${
                    period.value === option.value
                      ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 border-gray-200 dark:border-white/8 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 통계 요약 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <Card className="p-3 sm:p-4 text-center bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5">
              <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-indigo-400 mb-1">
                {totalElements}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">총 운동 횟수</div>
            </Card>

            <Card className="p-3 sm:p-4 text-center bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5">
              <div className="text-lg sm:text-2xl font-bold text-emerald-400 mb-1">
                {formatTime(totalDurationSeconds)}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">총 운동 시간</div>
            </Card>

            <Card className="p-3 sm:p-4 text-center bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5">
              <div className="text-lg sm:text-2xl font-bold text-violet-400 mb-1">
                {totalCompletedSets}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">완료 세트</div>
            </Card>

            <Card className="p-3 sm:p-4 text-center bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5">
              <div className="text-lg sm:text-2xl font-bold text-amber-400 mb-1">
                {Math.round(averageCompletionRate)}%
              </div>
              <div className="text-xs sm:text-sm text-gray-500">평균 완료율</div>
            </Card>
          </div>

          {/* 운동 기록 목록 */}
          {workoutRecords.length === 0 ? (
            <Card className="p-8 text-center bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5">
              <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-history-line text-2xl text-gray-400 dark:text-gray-600"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">운동 기록이 없습니다</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">첫 번째 운동을 완료하면 기록이 여기에 표시됩니다</p>
              <Link to="/workout">
                <Button className="whitespace-nowrap bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 border-0">
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
                  className="p-4 sm:p-6 transition-all duration-200 cursor-pointer bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10"
                >
                  <div className="flex flex-col gap-3 sm:gap-4" onClick={() => viewDetail(record)}>
                    {/* 헤더 정보 */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{record.programName}</h3>
                          <span className="text-sm text-gray-500 font-medium">{formatDate(record.date)}</span>
                        </div>

                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
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
                        <div className="text-xl sm:text-2xl font-bold text-emerald-400">{getCompletionRate(record)}%</div>
                        <div className="text-xs text-gray-500">완료율</div>
                      </div>
                    </div>

                    {/* 운동 부위 */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">운동 부위:</span>
                      <div className="flex flex-wrap gap-1">
                        {record.bodyParts.map((bodyPart, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-50 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-400 text-xs rounded-full font-medium">
                            {bodyPart}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 하단 액션 영역 */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <i className="ri-trophy-line text-amber-400"></i>
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
                        className="flex items-center gap-1 text-blue-600 dark:text-indigo-400 hover:text-blue-700 dark:hover:text-indigo-300 transition-colors"
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

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/history' + listSearchParams(period.value, currentPage - 1))}
                disabled={currentPage === 0}
                className="whitespace-nowrap border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <i className="ri-arrow-left-s-line mr-1"></i>
                이전
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i).map(page => (
                  <button
                    key={page}
                    onClick={() => navigate('/history' + listSearchParams(period.value, page))}
                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white'
                        : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {page + 1}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/history' + listSearchParams(period.value, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
                className="whitespace-nowrap border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                다음
                <i className="ri-arrow-right-s-line ml-1"></i>
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 운동 기록 상세 화면
  if (view === 'detail' && selectedRecord) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        <Header />

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* 헤더 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">홈</Link>
              <i className="ri-arrow-right-s-line"></i>
              <Link to="/history" className="hover:text-gray-900 dark:hover:text-white transition-colors">운동일지</Link>
              <i className="ri-arrow-right-s-line"></i>
              <span>상세 기록</span>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{selectedRecord.programName}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {formatDate(selectedRecord.date)} • {selectedRecord.startTime} - {selectedRecord.endTime}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => navigate(listPath)} className="whitespace-nowrap text-sm border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                  <i className="ri-list-unordered mr-2"></i>
                  목록으로
                </Button>
                <Button variant="outline" onClick={() => navigate(calendarPath)} className="whitespace-nowrap text-sm border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                  <i className="ri-calendar-line mr-2"></i>
                  캘린더로
                </Button>
              </div>
            </div>
          </div>

          {/* 운동 요약 정보 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 text-center bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-indigo-400 mb-1">
                {formatTime(selectedRecord.totalTime)}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">총 운동시간</div>
            </Card>

            <Card className="p-4 text-center bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5">
              <div className="text-xl sm:text-2xl font-bold text-emerald-400 mb-1">
                {selectedRecord.completedExercises}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">완료한 운동</div>
            </Card>

            <Card className="p-4 text-center bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5">
              <div className="text-xl sm:text-2xl font-bold text-violet-400 mb-1">
                {selectedRecord.completedSets}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">완료한 세트</div>
            </Card>

            <Card className="p-4 text-center bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5">
              <div className="text-xl sm:text-2xl font-bold text-amber-400 mb-1">
                {getCompletionRate(selectedRecord)}%
              </div>
              <div className="text-xs sm:text-sm text-gray-500">완료율</div>
            </Card>
          </div>

          {/* 운동 부위별 정보 */}
          <Card className="p-4 sm:p-6 mb-6 bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">운동 부위</h3>
            <div className="flex flex-wrap gap-2">
              {selectedRecord.bodyParts.map((bodyPart, index) => (
                <span key={index} className="px-3 py-2 bg-blue-50 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-400 text-sm rounded-lg font-medium">
                  {bodyPart}
                </span>
              ))}
            </div>
          </Card>

          {/* 운동별 상세 기록 */}
          <div className="space-y-6">
            {selectedRecord.exercises.map((exercise, exerciseIndex) => (
              <Card key={exercise.id} className="p-4 sm:p-6 bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{exercise.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded text-xs text-gray-600 dark:text-gray-400">{exercise.bodyPart}</span>
                      <span className="text-xs sm:text-sm">운동시간: {exercise.exerciseTime > 0 ? formatTime(exercise.exerciseTime) : '-'}</span>
                      <span className="text-xs sm:text-sm">{exercise.sets.filter(s => s.completed).length}/{exercise.sets.length}세트 완료</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-600 dark:text-gray-400">#{exerciseIndex + 1}</div>
                  </div>
                </div>

                {/* 세트별 상세 정보 - 모바일 최적화 */}
                <div className="space-y-3">
                  <div className="hidden sm:grid sm:grid-cols-6 gap-2 text-xs font-medium text-gray-400 dark:text-gray-600 pb-2 border-b border-gray-100 dark:border-white/5">
                    <div>세트</div>
                    <div>횟수</div>
                    <div>무게</div>
                    <div>휴식</div>
                    <div>메모</div>
                    <div>달성률</div>
                  </div>

                  {exercise.sets.map((set, setIndex) => (
                    <div key={set.id} className="border-b border-gray-100 dark:border-white/5 last:border-b-0 pb-3 last:pb-0">
                      {/* 모바일 뷰 */}
                      <div className="sm:hidden">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">세트 {setIndex + 1}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            !set.completed
                              ? 'bg-gray-100 dark:bg-white/5 text-gray-500'
                              : set.actualReps >= set.targetReps
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-amber-400/10 text-amber-400'
                          }`}>
                            {!set.completed ? '미완료' : set.actualReps >= set.targetReps ? '완료' : '미달'}
                          </span>
                        </div>
                        {set.completed && (
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">횟수: </span>
                              <span className={set.actualReps >= set.targetReps ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
                                {set.actualReps}
                              </span>
                              <span className="text-gray-400 dark:text-gray-600">/{set.targetReps}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">무게: </span>
                              {set.targetWeight ? (
                                <>
                                  <span className={set.actualWeight && set.actualWeight >= set.targetWeight ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
                                    {set.actualWeight || set.targetWeight}
                                  </span>
                                  {set.targetWeight && <span className="text-gray-400 dark:text-gray-600">/{set.targetWeight}kg</span>}
                                </>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-600">-</span>
                              )}
                            </div>
                            <div>
                              <span className="text-gray-500">휴식: </span>
                              <span className="text-gray-700 dark:text-gray-300">{Math.floor(set.restTime / 60)}분</span>
                            </div>
                            <div>
                              <span className="text-gray-500">메모: </span>
                              <span className="text-xs text-gray-700 dark:text-gray-300">{set.memo || '-'}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 데스크톱 뷰 */}
                      <div className="hidden sm:grid sm:grid-cols-6 gap-2 text-sm py-2">
                        <div className="font-medium text-gray-700 dark:text-gray-300">{setIndex + 1}</div>
                        <div className="text-gray-700 dark:text-gray-300">
                          {set.completed ? (
                            <>
                              <span className={set.actualReps >= set.targetReps ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
                                {set.actualReps}
                              </span>
                              <span className="text-gray-400 dark:text-gray-600">/{set.targetReps}</span>
                            </>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600">-/{set.targetReps}</span>
                          )}
                        </div>
                        <div className="text-gray-700 dark:text-gray-300">
                          {set.completed && set.targetWeight ? (
                            <>
                              <span className={set.actualWeight && set.actualWeight >= set.targetWeight ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
                                {set.actualWeight || set.targetWeight}
                              </span>
                              {set.targetWeight && <span className="text-gray-400 dark:text-gray-600">/{set.targetWeight}kg</span>}
                            </>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600">-</span>
                          )}
                        </div>
                        <div className="text-gray-700 dark:text-gray-300">{Math.floor(set.restTime / 60)}분</div>
                        <div className="text-gray-700 dark:text-gray-300 text-xs">
                          {set.completed ? (set.memo || '-') : '-'}
                        </div>
                        <div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            !set.completed
                              ? 'bg-gray-100 dark:bg-white/5 text-gray-500'
                              : set.actualReps >= set.targetReps
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-amber-400/10 text-amber-400'
                          }`}>
                            {!set.completed ? '미완료' : set.actualReps >= set.targetReps ? '완료' : '미달'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 운동별 통계 */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600 dark:text-indigo-400">
                        {exercise.sets.filter(s => s.completed).reduce((total, set) => total + set.actualReps, 0)}
                      </div>
                      <div className="text-xs text-gray-500">총 횟수</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-emerald-400">
                        {exercise.sets.filter(s => s.completed && s.actualWeight).length > 0
                          ? Math.max(...exercise.sets.filter(s => s.completed && s.actualWeight).map(s => s.actualWeight!))
                          : '-'
                        }
                        {exercise.sets.filter(s => s.completed && s.actualWeight).length > 0 && 'kg'}
                      </div>
                      <div className="text-xs text-gray-500">최대 무게</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-violet-400">
                        {exercise.sets.filter(s => s.completed).length}/{exercise.sets.length}
                      </div>
                      <div className="text-xs text-gray-500">완료 세트</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-amber-400">
                        {exercise.exerciseTime > 0 ? formatTime(exercise.exerciseTime) : '-'}
                      </div>
                      <div className="text-xs text-gray-500">운동 시간</div>
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
