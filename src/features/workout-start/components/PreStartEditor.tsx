import { useState } from 'react';
import { ExercisePickerModal, type PendingSet, type WorkoutResponse } from '@/features/exercises';
import { useReorder } from '@/shared/hooks/useReorder';
import { Button } from '@/shared/ui/Button';
import { PageHeader } from '@/shared/ui/PageHeader';
import { copyExercises, countSets, toStartExercise } from '../lib/startProgram';
import type { StartExercise, StartProgram } from '../types';

interface PreStartEditorProps {
  program: StartProgram;
  allWorkouts: WorkoutResponse[];
  isStarting: boolean;
  onBack: () => void;
  onStart: (exercises: StartExercise[]) => void;
}

const arrowClass = (disabled: boolean) => `p-1 rounded ${
  disabled
    ? 'text-gray-200 dark:text-gray-800'
    : 'text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
}`;

// 운동 시작 전: 순서 변경·삭제·운동 추가
export function PreStartEditor({ program, allWorkouts, isStarting, onBack, onStart }: PreStartEditorProps) {
  const [exercises, setExercises] = useState<StartExercise[]>(() => copyExercises(program.exercises));
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const { draggedIndex, moveUp, moveDown, dragHandlers } = useReorder(exercises, setExercises);

  const removeExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const addExercise = (workout: WorkoutResponse, sets: PendingSet[]) => {
    setExercises(prev => [...prev, toStartExercise(workout, sets)]);
    setShowAddExerciseModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <PageHeader
        breadcrumbs={[{ label: '홈', to: '/' }, { label: '운동하기', onClick: onBack }, { label: '운동 편집' }]}
        title={program.name}
        description="운동 순서를 변경하거나 새로운 운동을 추가하세요"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              <i className="ri-arrow-left-line mr-1"></i>
              뒤로
            </Button>
            <Button onClick={() => onStart(exercises)} disabled={exercises.length === 0 || isStarting}>
              <i className="ri-play-line mr-1"></i>
              운동 시작
            </Button>
          </div>
        }
      />

      {/* 운동 목록 요약 */}
      <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <i className="ri-list-check-line text-blue-600 dark:text-indigo-400"></i>
            <span>{exercises.length}개 운동</span>
          </div>
          <div className="flex items-center gap-1">
            <i className="ri-repeat-line text-blue-600 dark:text-indigo-400"></i>
            <span>{countSets(exercises)}세트</span>
          </div>
          <div className="flex items-center gap-1 text-blue-600 dark:text-indigo-400">
            <i className="ri-information-line"></i>
            <span>드래그하여 순서 변경</span>
          </div>
        </div>
      </div>

      {/* 편집 가능한 운동 목록 */}
      <div className="space-y-3 mb-6">
        {exercises.map((exercise, index) => (
          <div
            key={exercise.id + '-' + index}
            {...dragHandlers(index)}
            className={`bg-white dark:bg-[#111] rounded-lg border-2 p-4 transition-all cursor-move ${
              draggedIndex === index
                ? 'opacity-50 border-indigo-400/40'
                : 'border-gray-200 dark:border-white/8 hover:border-gray-300 dark:hover:border-white/15'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* 드래그 핸들 */}
              <div className="text-gray-300 dark:text-gray-700 flex-shrink-0">
                <i className="ri-draggable text-xl"></i>
              </div>

              {/* 순서 번호 */}
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-indigo-500/15 text-blue-700 dark:text-indigo-300 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {index + 1}
              </div>

              {/* 운동 정보 */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-white truncate">{exercise.workoutName}</div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded text-xs">{exercise.workoutPartName}</span>
                  <span>{exercise.sets.length}세트</span>
                  {exercise.sets[0]?.weight ? (
                    <span>{exercise.sets[0].weight}kg</span>
                  ) : null}
                </div>
              </div>

              {/* 순서 변경 버튼 */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); moveUp(index); }}
                  disabled={index === 0}
                  className={arrowClass(index === 0)}
                >
                  <i className="ri-arrow-up-s-line text-lg"></i>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); moveDown(index); }}
                  disabled={index === exercises.length - 1}
                  className={arrowClass(index === exercises.length - 1)}
                >
                  <i className="ri-arrow-down-s-line text-lg"></i>
                </button>
              </div>

              {/* 삭제 버튼 */}
              <button
                onClick={(e) => { e.stopPropagation(); removeExercise(index); }}
                className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded flex-shrink-0"
                title="운동 삭제"
              >
                <i className="ri-delete-bin-line text-lg"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 운동 추가 버튼 */}
      <button
        onClick={() => setShowAddExerciseModal(true)}
        className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-lg text-gray-400 dark:text-gray-600 hover:border-blue-300 dark:hover:border-indigo-400/50 hover:text-blue-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
      >
        <i className="ri-add-line text-xl"></i>
        <span className="font-medium">운동 추가</span>
      </button>

      {/* 하단 시작 버튼 */}
      {exercises.length > 0 && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setExercises(copyExercises(program.exercises))}
            className="flex-1 flex items-center justify-center gap-1 py-2.5 px-4 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <i className="ri-refresh-line mr-1"></i>
            초기화
          </button>
          <button
            onClick={() => onStart(exercises)}
            disabled={isStarting}
            className="flex-1 flex items-center justify-center gap-1 py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            <i className="ri-play-line mr-1"></i>
            운동 시작 ({exercises.length}개 운동)
          </button>
        </div>
      )}

      {showAddExerciseModal && (
        <ExercisePickerModal
          workouts={allWorkouts}
          isAdded={(workoutId) => exercises.some(ex => ex.exerciseId === workoutId)}
          onConfirm={addExercise}
          onClose={() => setShowAddExerciseModal(false)}
        />
      )}
    </div>
  );
}
