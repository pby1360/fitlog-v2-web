import { completionRate, formatDurationKo } from '@/shared/lib/format';
import { Card } from '@/shared/ui/Card';
import { countGoalMetExercises, formatLogDate } from '../lib/logView';
import type { WorkoutLogResponse } from '../types';

interface WorkoutLogCardProps {
  record: WorkoutLogResponse;
  onOpen: () => void;
}

// 기록 목록의 한 줄 (누르면 상세로 이동)
export function WorkoutLogCard({ record, onOpen }: WorkoutLogCardProps) {
  return (
    <Card className="p-4 sm:p-6 transition-all duration-200 cursor-pointer bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10">
      <div className="flex flex-col gap-3 sm:gap-4" onClick={onOpen}>
        {/* 헤더 정보 */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{record.programName}</h3>
              <span className="text-sm text-gray-500 font-medium">{formatLogDate(record.date)}</span>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
              <Meta icon="ri-time-line">{record.startTime} - {record.endTime}</Meta>
              <Meta icon="ri-timer-line">{formatDurationKo(record.totalTime)}</Meta>
              <Meta icon="ri-list-check-line">{record.completedExercises}/{record.totalExercises} 운동</Meta>
              <Meta icon="ri-repeat-line">{record.completedSets}/{record.totalSets} 세트</Meta>
            </div>
          </div>

          {/* 완료율 표시 */}
          <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
            <div className="text-xl sm:text-2xl font-bold text-emerald-400">{completionRate(record.completedSets, record.totalSets)}%</div>
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
              {countGoalMetExercises(record.exercises)}/{record.exercises.length} 운동
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="flex items-center gap-1 text-blue-600 dark:text-indigo-400 hover:text-blue-700 dark:hover:text-indigo-300 transition-colors"
          >
            <span className="text-sm font-medium">상세보기</span>
            <i className="ri-arrow-right-s-line"></i>
          </button>
        </div>
      </div>
    </Card>
  );
}

function Meta({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1">
      <i className={`${icon} text-xs`}></i>
      <span className="text-xs sm:text-sm">{children}</span>
    </div>
  );
}
