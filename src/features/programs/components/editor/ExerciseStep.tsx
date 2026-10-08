import type { WorkoutPartResponse, WorkoutResponse } from '@/features/exercises';
import { Button } from '@/shared/ui/Button';
import type { ProgramDraft } from '../../hooks/useProgramDraft';
import { SelectedExerciseList } from './SelectedExerciseList';
import { NextStepButton, PrevStepButton } from './StepButtons';

interface ExerciseStepProps {
  draft: ProgramDraft;
  bodyParts: WorkoutPartResponse[];
  workouts: WorkoutResponse[];
  // bodyPartId 를 주면 그 부위를 미리 선택해 운동 추가 폼을 연다
  onAddExercise: (bodyPartId?: number) => void;
  onEditExercise: (exercise: WorkoutResponse) => void;
  onDeleteExercise: (exerciseId: number) => void;
  getExerciseName: (exerciseId: number) => string;
  getExerciseBodyPart: (exerciseId: number) => string;
  onPrev: () => void;
  onNext: () => void;
}

// 3단계: 선택한 부위별로 운동 항목 선택
export function ExerciseStep({
  draft,
  bodyParts,
  workouts,
  onAddExercise,
  onEditExercise,
  onDeleteExercise,
  getExerciseName,
  getExerciseBodyPart,
  onPrev,
  onNext,
}: ExerciseStepProps) {
  const { selectedBodyParts, exercises } = draft;
  const isInProgram = (exerciseId: number) => exercises.some(pe => pe.exerciseId === exerciseId);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">운동 항목 선택</h2>
        <div className="flex gap-2">
          <Button variant="subtle" size="sm" onClick={() => onAddExercise()}>
            <i className="ri-add-line mr-1"></i>
            운동 추가
          </Button>
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 dark:bg-indigo-500/10 border border-blue-200 dark:border-indigo-500/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-indigo-300">
          선택된 부위별로 운동을 추가하세요: <span className="font-medium">{selectedBodyParts.join(', ')}</span>
        </p>
      </div>

      {/* 부위별 운동 목록 */}
      <div className="space-y-6 mb-6">
        {selectedBodyParts.map((bodyPart) => {
          const bodyPartExercises = workouts.filter(ex => ex.bodyPart === bodyPart);
          return (
            <div key={bodyPart} className="border border-gray-200 dark:border-white/8 rounded-lg p-4 bg-gray-50 dark:bg-[#0a0a0a]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full"></span>
                {bodyPart} 운동
              </h3>

              {bodyPartExercises.length === 0 ? (
                <div className="text-center py-4 text-gray-400 dark:text-gray-600">
                  <p className="text-sm">이 부위에 등록된 운동이 없습니다.</p>
                  <Button
                    variant="subtle"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      const part = bodyParts.find(p => p.name === bodyPart);
                      if (part) onAddExercise(part.id);
                    }}
                  >
                    운동 추가하기
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {bodyPartExercises.map((exercise) => (
                    <div key={exercise.id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-white/5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <span className="font-medium text-gray-900 dark:text-white">{exercise.name}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="brand"
                          size="sm"
                          onClick={() => draft.addExercise(exercise)}
                          disabled={isInProgram(exercise.id)}
                          className="disabled:opacity-40"
                        >
                          {isInProgram(exercise.id) ? (
                            <>
                              <i className="ri-check-line mr-1"></i>
                              추가됨
                            </>
                          ) : (
                            <>
                              <i className="ri-add-line mr-1"></i>
                              추가
                            </>
                          )}
                        </Button>
                        {exercise.editable && (
                          <>
                            <Button variant="subtle" size="sm" onClick={() => onEditExercise(exercise)}>
                              <i className="ri-edit-line"></i>
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => onDeleteExercise(exercise.id)}>
                              <i className="ri-delete-bin-line"></i>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {exercises.length > 0 && (
        <SelectedExerciseList
          draft={draft}
          getExerciseName={getExerciseName}
          getExerciseBodyPart={getExerciseBodyPart}
        />
      )}

      <div className="flex justify-between">
        <PrevStepButton onClick={onPrev} />
        <NextStepButton onClick={onNext} disabled={exercises.length === 0} />
      </div>
    </div>
  );
}
