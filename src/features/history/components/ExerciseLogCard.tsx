import { formatDurationKo } from '@/shared/lib/format';
import { Card } from '@/shared/ui/Card';
import { isSetGoalMet, restMinutes } from '../lib/logView';
import type { WorkoutLogExerciseResponse, WorkoutLogSetResponse } from '../types';

interface ExerciseLogCardProps {
  exercise: WorkoutLogExerciseResponse;
  order: number;
}

const goalClass = (met: boolean) => (met ? 'text-emerald-400 font-medium' : 'text-amber-400');
const mutedClass = 'text-gray-400 dark:text-gray-600';

// 운동 하나의 세트별 기록과 요약
export function ExerciseLogCard({ exercise, order }: ExerciseLogCardProps) {
  const completedSets = exercise.sets.filter(s => s.completed);
  const weightedSets = completedSets.filter(s => s.actualWeight);
  const exerciseTime = exercise.exerciseTime > 0 ? formatDurationKo(exercise.exerciseTime) : '-';

  return (
    <Card className="p-4 sm:p-6 bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{exercise.name}</h3>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
            <span className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded text-xs text-gray-600 dark:text-gray-400">{exercise.bodyPart}</span>
            <span className="text-xs sm:text-sm">운동시간: {exerciseTime}</span>
            <span className="text-xs sm:text-sm">{completedSets.length}/{exercise.sets.length}세트 완료</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-600 dark:text-gray-400">#{order}</div>
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
          <SetResultRow key={set.id} set={set} setNumber={setIndex + 1} />
        ))}
      </div>

      {/* 운동별 통계 */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <Stat value={completedSets.reduce((total, set) => total + set.actualReps, 0)} label="총 횟수" valueClass="text-blue-600 dark:text-indigo-400" />
          <Stat
            value={weightedSets.length > 0 ? `${Math.max(...weightedSets.map(s => s.actualWeight!))}kg` : '-'}
            label="최대 무게"
            valueClass="text-emerald-400"
          />
          <Stat value={`${completedSets.length}/${exercise.sets.length}`} label="완료 세트" valueClass="text-violet-400" />
          <Stat value={exerciseTime} label="운동 시간" valueClass="text-amber-400" />
        </div>
      </div>
    </Card>
  );
}

function Stat({ value, label, valueClass }: { value: string | number; label: string; valueClass: string }) {
  return (
    <div>
      <div className={`text-lg font-bold ${valueClass}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function StatusBadge({ set }: { set: WorkoutLogSetResponse }) {
  const met = isSetGoalMet(set);
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${
      !set.completed
        ? 'bg-gray-100 dark:bg-white/5 text-gray-500'
        : met
          ? 'bg-emerald-500/10 text-emerald-400'
          : 'bg-amber-400/10 text-amber-400'
    }`}>
      {!set.completed ? '미완료' : met ? '완료' : '미달'}
    </span>
  );
}

// 실제 무게 / 목표 무게. 목표 무게가 없으면 "-"
function WeightResult({ set }: { set: WorkoutLogSetResponse }) {
  if (!set.targetWeight) return <span className={mutedClass}>-</span>;
  const met = !!set.actualWeight && set.actualWeight >= set.targetWeight;
  return (
    <>
      <span className={goalClass(met)}>{set.actualWeight || set.targetWeight}</span>
      <span className={mutedClass}>/{set.targetWeight}kg</span>
    </>
  );
}

// 세트 한 줄: 모바일은 카드형, 데스크톱은 표 형태
function SetResultRow({ set, setNumber }: { set: WorkoutLogSetResponse; setNumber: number }) {
  const repsMet = isSetGoalMet(set);

  return (
    <div className="border-b border-gray-100 dark:border-white/5 last:border-b-0 pb-3 last:pb-0">
      {/* 모바일 뷰 */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-900 dark:text-white">세트 {setNumber}</span>
          <StatusBadge set={set} />
        </div>
        {set.completed && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">횟수: </span>
              <span className={goalClass(repsMet)}>{set.actualReps}</span>
              <span className={mutedClass}>/{set.targetReps}</span>
            </div>
            <div>
              <span className="text-gray-500">무게: </span>
              <WeightResult set={set} />
            </div>
            <div>
              <span className="text-gray-500">휴식: </span>
              <span className="text-gray-700 dark:text-gray-300">{restMinutes(set.restTime)}</span>
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
        <div className="font-medium text-gray-700 dark:text-gray-300">{setNumber}</div>
        <div className="text-gray-700 dark:text-gray-300">
          {set.completed ? (
            <>
              <span className={goalClass(repsMet)}>{set.actualReps}</span>
              <span className={mutedClass}>/{set.targetReps}</span>
            </>
          ) : (
            <span className={mutedClass}>-/{set.targetReps}</span>
          )}
        </div>
        <div className="text-gray-700 dark:text-gray-300">
          {set.completed ? <WeightResult set={set} /> : <span className={mutedClass}>-</span>}
        </div>
        <div className="text-gray-700 dark:text-gray-300">{restMinutes(set.restTime)}</div>
        <div className="text-gray-700 dark:text-gray-300 text-xs">
          {set.completed ? (set.memo || '-') : '-'}
        </div>
        <div>
          <StatusBadge set={set} />
        </div>
      </div>
    </div>
  );
}
