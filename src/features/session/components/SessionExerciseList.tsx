import type { SessionExercise, SessionSet, WorkoutSession } from '../types';

interface SessionExerciseListProps {
  session: WorkoutSession;
  // 순서를 바꿀 수 있는 남은 운동의 원래 위치 (빈 배열이면 순서 변경 불가)
  remainingIndexes: number[];
  isReordering: boolean;
  getExerciseName: (exercise: SessionExercise) => string;
  onMove: (exerciseIndex: number, direction: -1 | 1) => void;
  onAddExercise: () => void;
}

const arrowClass = (disabled: boolean) => `p-1 rounded ${
  disabled
    ? 'text-gray-200 dark:text-gray-800'
    : 'text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
}`;

// 현재 운동 → 남은 운동 → 건너뛴 운동 → 완료한 운동 순으로 보여준다. 같은 그룹 안에서는 원래 순서를 지킨다.
const sortForDisplay = (session: WorkoutSession) => {
  const priority = (ex: SessionExercise, i: number) => {
    if (i === session.currentExerciseIndex && session.status === 'IN_PROGRESS') return 0;
    if (!ex.completed && !ex.skipped) return 1;
    if (ex.skipped) return 2;
    return 3;
  };
  return session.exercises
    .map((ex, i) => ({ ex, i }))
    .sort((a, b) => priority(a.ex, a.i) - priority(b.ex, b.i) || a.i - b.i);
};

// 완료한 세트는 실제 기록, 아니면 목표값을 보여준다
const setSummary = (set: SessionSet) => {
  const hasActualWeight = set.actualWeight !== undefined && set.actualWeight !== null && set.actualWeight !== 0;
  const reps = set.completed && set.actualReps !== undefined && set.actualReps !== null ? set.actualReps : set.reps;
  const showWeight = (set.weight !== undefined && set.weight !== null) || hasActualWeight;
  const weight = set.completed && hasActualWeight ? set.actualWeight : set.weight;
  return `${reps}회${showWeight ? ` × ${weight}kg` : ''}`;
};

export function SessionExerciseList({
  session,
  remainingIndexes,
  isReordering,
  getExerciseName,
  onMove,
  onAddExercise,
}: SessionExerciseListProps) {
  const isCurrent = (index: number) => index === session.currentExerciseIndex && session.status === 'IN_PROGRESS';
  const isOngoing = session.status !== 'COMPLETED' && session.status !== 'CANCELLED';

  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/8 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">운동 목록</h3>
        {remainingIndexes.length > 1 && (
          <span className="text-xs text-gray-400 dark:text-gray-600">
            <i className="ri-arrow-up-down-line mr-1"></i>남은 운동은 순서를 바꿀 수 있어요
          </span>
        )}
      </div>
      <div className="space-y-3">
        {sortForDisplay(session).map(({ ex: exercise, i: exerciseIndex }) => {
          const remainingPos = remainingIndexes.indexOf(exerciseIndex);
          const isFirst = remainingPos === 0;
          const isLast = remainingPos === remainingIndexes.length - 1;
          return (
            <div
              key={exercise.id}
              className={`p-4 rounded-lg border-2 transition-colors ${
                isCurrent(exerciseIndex)
                  ? 'border-blue-200 bg-blue-50 dark:border-indigo-500/30 dark:bg-indigo-500/5'
                  : exercise.skipped
                    ? 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] opacity-60'
                    : exercise.completed
                      ? 'border-green-500 bg-green-50 dark:border-green-500/30 dark:bg-green-500/5'
                      : 'border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="font-medium text-gray-900 dark:text-white min-w-0 truncate">{getExerciseName(exercise)}</div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-sm text-gray-600 dark:text-gray-400">{exercise.sets.filter(set => set.completed).length} / {exercise.sets.length} 세트</div>
                  {remainingPos !== -1 && remainingIndexes.length > 1 && (
                    <div className="flex items-center">
                      <button
                        onClick={() => onMove(exerciseIndex, -1)}
                        disabled={isFirst || isReordering}
                        title="위로 이동"
                        className={arrowClass(isFirst || isReordering)}
                      >
                        <i className="ri-arrow-up-s-line text-lg"></i>
                      </button>
                      <button
                        onClick={() => onMove(exerciseIndex, 1)}
                        disabled={isLast || isReordering}
                        title="아래로 이동"
                        className={arrowClass(isLast || isReordering)}
                      >
                        <i className="ri-arrow-down-s-line text-lg"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {exercise.sets.map((set, setIndex) => (
                  <div
                    key={set.id}
                    className={`p-2 rounded text-xs ${
                      isCurrent(exerciseIndex) && setIndex === session.currentSetIndex
                        ? 'bg-blue-100 dark:bg-blue-500/10 border border-blue-300 dark:border-blue-500/30'
                        : set.completed
                          ? 'bg-green-100 dark:bg-green-500/10 border border-green-300 dark:border-green-500/30'
                          : 'bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10'
                    }`}
                  >
                    <div className="font-medium text-gray-400 dark:text-gray-600">세트 {setIndex + 1}</div>
                    <div className="text-gray-600 dark:text-gray-400">{setSummary(set)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {isOngoing && (
        <button
          onClick={onAddExercise}
          className="w-full mt-3 py-3 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-lg text-gray-400 dark:text-gray-600 hover:border-blue-300 dark:hover:border-indigo-400/50 hover:text-blue-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
        >
          <i className="ri-add-line text-xl"></i>
          <span className="font-medium">운동 추가</span>
        </button>
      )}
    </div>
  );
}
