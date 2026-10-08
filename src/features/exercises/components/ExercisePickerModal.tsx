import { useState } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { usePendingSets } from '../hooks/usePendingSets';
import { filterAndGroupWorkouts } from '../lib/groupByBodyPart';
import type { PendingSet, WorkoutResponse } from '../types';

interface ExercisePickerModalProps {
  workouts: WorkoutResponse[];
  // 이미 목록에 있는 운동이면 "추가됨"으로 표시한다 (다시 추가하는 것은 허용)
  isAdded: (workoutId: number) => boolean;
  onConfirm: (workout: WorkoutResponse, sets: PendingSet[]) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

const setInputClass = 'w-full px-2 py-1.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded text-sm text-gray-900 dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-indigo-500';

// 운동 추가: 1) 카탈로그에서 운동 선택 → 2) 세트 구성 후 추가
export function ExercisePickerModal({ workouts, isAdded, onConfirm, onClose, isSubmitting = false }: ExercisePickerModalProps) {
  const [filter, setFilter] = useState('');
  const [pendingWorkout, setPendingWorkout] = useState<WorkoutResponse | null>(null);
  const { pendingSets, resetSets, clearSets, addSet, removeSet, updateSet } = usePendingSets();

  const groupedWorkouts = filterAndGroupWorkouts(workouts, filter);

  const selectWorkout = (workout: WorkoutResponse) => {
    setPendingWorkout(workout);
    resetSets();
  };

  const backToList = () => {
    setPendingWorkout(null);
    clearSets();
  };

  return (
    <Modal className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
      <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {pendingWorkout && (
            <button
              onClick={backToList}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded"
            >
              <i className="ri-arrow-left-line text-lg"></i>
            </button>
          )}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {pendingWorkout ? pendingWorkout.name : '운동 추가'}
          </h3>
        </div>
        <button onClick={onClose} className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded">
          <i className="ri-close-line text-xl"></i>
        </button>
      </div>

      {!pendingWorkout ? (
        <>
          <div className="p-4 border-b border-gray-100 dark:border-white/5">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="운동 이름 또는 부위로 검색..."
              className="w-full px-3 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {Object.keys(groupedWorkouts).length === 0 ? (
              <p className="text-center text-gray-500 py-8">검색 결과가 없습니다</p>
            ) : (
              Object.entries(groupedWorkouts).map(([bodyPart, partWorkouts]) => (
                <div key={bodyPart} className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2 px-1">{bodyPart}</h4>
                  <div className="space-y-1">
                    {partWorkouts.map(workout => {
                      const alreadyAdded = isAdded(workout.id);
                      return (
                        <button
                          key={workout.id}
                          onClick={() => selectWorkout(workout)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            alreadyAdded
                              ? 'bg-blue-50 dark:bg-indigo-500/10 text-blue-700 dark:text-indigo-300'
                              : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{workout.name}</span>
                            {alreadyAdded
                              ? <span className="text-xs text-blue-600 dark:text-indigo-400">추가됨</span>
                              : <i className="ri-arrow-right-s-line text-gray-400 dark:text-gray-600"></i>
                            }
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-sm text-gray-500 mb-4">
              <span className="bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded text-xs mr-2">{pendingWorkout.bodyPart}</span>
              세트 구성을 설정하세요
            </p>

            {/* 세트 헤더 */}
            <div className="grid grid-cols-[2rem_1fr_1fr_1fr_2rem] gap-2 text-xs font-medium text-gray-400 dark:text-gray-600 mb-2 px-1">
              <div className="text-center">세트</div>
              <div className="text-center">횟수</div>
              <div className="text-center">무게(kg)</div>
              <div className="text-center">휴식(초)</div>
              <div></div>
            </div>

            <div className="space-y-2">
              {pendingSets.map((set, index) => (
                <div key={index} className="grid grid-cols-[2rem_1fr_1fr_1fr_2rem] gap-2 items-center">
                  <div className="text-center text-sm font-medium text-gray-500">{index + 1}</div>
                  <input
                    type="number"
                    min={1}
                    value={set.reps}
                    onChange={(e) => updateSet(index, 'reps', Math.max(1, Number(e.target.value)))}
                    className={setInputClass}
                  />
                  <input
                    type="number"
                    min={0}
                    step={2.5}
                    value={set.weight}
                    onChange={(e) => updateSet(index, 'weight', Math.max(0, Number(e.target.value)))}
                    className={setInputClass}
                  />
                  <input
                    type="number"
                    min={0}
                    step={15}
                    value={set.restTime}
                    onChange={(e) => updateSet(index, 'restTime', Math.max(0, Number(e.target.value)))}
                    className={setInputClass}
                  />
                  <button
                    onClick={() => removeSet(index)}
                    disabled={pendingSets.length === 1}
                    className={`flex items-center justify-center rounded ${
                      pendingSets.length === 1 ? 'text-gray-300 dark:text-gray-700' : 'text-red-400 hover:text-red-300'
                    }`}
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addSet}
              className="mt-3 w-full py-2 border border-dashed border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-400 dark:text-gray-600 hover:border-blue-300 dark:hover:border-indigo-400/50 hover:text-blue-600 dark:hover:text-indigo-400 transition-colors"
            >
              <i className="ri-add-line mr-1"></i>세트 추가
            </button>
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-white/5">
            <button
              onClick={() => onConfirm(pendingWorkout, pendingSets)}
              disabled={isSubmitting}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {isSubmitting ? '추가 중...' : `${pendingSets.length}세트로 추가`}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
