import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { ErrorBanner } from '@/shared/ui/ErrorBanner';
import type { WorkoutLogResponse } from '../types';

interface HistoryCalendarProps {
  month: Date;
  logs: WorkoutLogResponse[];
  error: string | null;
  onRetry: () => void;
  onMoveMonth: (offset: -1 | 1) => void;
  onOpen: (record: WorkoutLogResponse) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 달력 칸: 앞쪽 빈 칸(null) + 1일~말일
const buildCalendarDays = (month: Date) => {
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  return [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
};

const toDateString = (month: Date, day: number) =>
  `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

// 월간 캘린더. 하루에 기록은 2개까지 보여주고 나머지는 개수로 표시한다
export function HistoryCalendar({ month, logs, error, onRetry, onMoveMonth, onOpen }: HistoryCalendarProps) {
  const monthYear = month.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });

  return (
    <Card className="p-4 sm:p-6 bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5">
      {/* 캘린더 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{monthYear}</h2>
        <div className="flex gap-2">
          <Button variant="subtle" size="sm" onClick={() => onMoveMonth(-1)}>
            <i className="ri-arrow-left-s-line"></i>
          </Button>
          <Button variant="subtle" size="sm" onClick={() => onMoveMonth(1)}>
            <i className="ri-arrow-right-s-line"></i>
          </Button>
        </div>
      </div>

      {error && (
        <ErrorBanner action={<button onClick={onRetry} className="shrink-0 font-medium underline">다시 시도</button>}>
          {error}
        </ErrorBanner>
      )}

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day, index) => (
          <div key={day} className={`p-2 sm:p-3 text-center text-xs sm:text-sm font-medium ${
            index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-600 dark:text-indigo-400' : 'text-gray-500'
          }`}>
            {day}
          </div>
        ))}
      </div>

      {/* 캘린더 날짜 */}
      <div className="grid grid-cols-7 gap-1">
        {buildCalendarDays(month).map((day, index) => {
          if (day === null) {
            return <div key={index} className="p-2 h-20 sm:h-24"></div>;
          }

          const dateString = toDateString(month, day);
          const workoutsForDay = logs.filter(record => record.date === dateString);
          const isToday = new Date().toDateString() === new Date(dateString).toDateString();

          return (
            <div
              key={index}
              className={`p-1 sm:p-2 h-20 sm:h-24 border rounded-lg ${
                isToday ? 'bg-blue-50 dark:bg-indigo-500/10 border-blue-300 dark:border-indigo-500/30' : 'bg-gray-50 dark:bg-white/[0.02] border-gray-100 dark:border-white/5'
              }`}
            >
              <div className={`text-xs sm:text-sm font-medium mb-1 ${
                isToday ? 'text-blue-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {day}
              </div>
              <div className="space-y-1">
                {workoutsForDay.slice(0, 2).map((workout) => (
                  <button
                    key={workout.id}
                    onClick={() => onOpen(workout)}
                    className="w-full text-left text-xs bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded truncate hover:bg-emerald-500/20 cursor-pointer transition-colors"
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
  );
}
