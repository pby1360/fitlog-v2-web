import { completionRate, formatDurationKo } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { PageHeader } from '@/shared/ui/PageHeader';
import { formatLogDate } from '../lib/logView';
import type { WorkoutLogResponse } from '../types';
import { ExerciseLogCard } from './ExerciseLogCard';

interface WorkoutLogDetailProps {
  record: WorkoutLogResponse;
  onBackToList: () => void;
  onBackToCalendar: () => void;
}

const cardClass = 'bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5';

export function WorkoutLogDetail({ record, onBackToList, onBackToCalendar }: WorkoutLogDetailProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <PageHeader
        breadcrumbs={[{ label: '홈', to: '/' }, { label: '운동일지', to: '/history' }, { label: '상세 기록' }]}
        title={record.programName}
        description={`${formatLogDate(record.date)} • ${record.startTime} - ${record.endTime}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="subtle" onClick={onBackToList} className="text-sm">
              <i className="ri-list-unordered mr-2"></i>
              목록으로
            </Button>
            <Button variant="subtle" onClick={onBackToCalendar} className="text-sm">
              <i className="ri-calendar-line mr-2"></i>
              캘린더로
            </Button>
          </div>
        }
      />

      {/* 운동 요약 정보 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryTile value={formatDurationKo(record.totalTime)} label="총 운동시간" valueClass="text-blue-600 dark:text-indigo-400" />
        <SummaryTile value={record.completedExercises} label="완료한 운동" valueClass="text-emerald-400" />
        <SummaryTile value={record.completedSets} label="완료한 세트" valueClass="text-violet-400" />
        <SummaryTile value={`${completionRate(record.completedSets, record.totalSets)}%`} label="완료율" valueClass="text-amber-400" />
      </div>

      {/* 운동 부위 */}
      <Card className={`p-4 sm:p-6 mb-6 ${cardClass}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">운동 부위</h3>
        <div className="flex flex-wrap gap-2">
          {record.bodyParts.map((bodyPart, index) => (
            <span key={index} className="px-3 py-2 bg-blue-50 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-400 text-sm rounded-lg font-medium">
              {bodyPart}
            </span>
          ))}
        </div>
      </Card>

      {/* 운동별 상세 기록 */}
      <div className="space-y-6">
        {record.exercises.map((exercise, index) => (
          <ExerciseLogCard key={exercise.id} exercise={exercise} order={index + 1} />
        ))}
      </div>
    </div>
  );
}

function SummaryTile({ value, label, valueClass }: { value: string | number; label: string; valueClass: string }) {
  return (
    <Card className={`p-4 text-center ${cardClass}`}>
      <div className={`text-xl sm:text-2xl font-bold mb-1 ${valueClass}`}>{value}</div>
      <div className="text-xs sm:text-sm text-gray-500">{label}</div>
    </Card>
  );
}
