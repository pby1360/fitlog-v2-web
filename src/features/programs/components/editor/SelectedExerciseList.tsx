import { useReorder } from '@/shared/hooks/useReorder';
import { Button } from '@/shared/ui/Button';
import type { ProgramDraft } from '../../hooks/useProgramDraft';

interface SelectedExerciseListProps {
  draft: ProgramDraft;
  getExerciseName: (exerciseId: number) => string;
  getExerciseBodyPart: (exerciseId: number) => string;
}

const arrowClass = (disabled: boolean) => `w-6 h-6 flex items-center justify-center rounded ${
  disabled
    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white cursor-pointer'
}`;

// 프로그램에 담긴 운동 (위/아래 버튼·드래그로 순서 변경)
export function SelectedExerciseList({ draft, getExerciseName, getExerciseBodyPart }: SelectedExerciseListProps) {
  const { exercises } = draft;
  const { draggedIndex, moveUp, moveDown, dragHandlers } = useReorder(exercises, draft.setExercises);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">선택된 운동 ({exercises.length}개)</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <i className="ri-drag-move-line mr-1"></i>
          드래그하여 순서 변경
        </p>
      </div>
      <div className="space-y-2">
        {exercises.map((programExercise, index) => (
          <div
            key={programExercise.id}
            {...dragHandlers(index)}
            className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-[#0a0a0a] border rounded-lg cursor-move transition-all hover:border-gray-300 dark:hover:border-white/15 ${
              draggedIndex === index
                ? 'border-blue-400/50 dark:border-indigo-400/50 opacity-50'
                : 'border-gray-200 dark:border-white/8'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="flex flex-col gap-1">
                <button onClick={() => moveUp(index)} disabled={index === 0} className={arrowClass(index === 0)}>
                  <i className="ri-arrow-up-s-line text-sm"></i>
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === exercises.length - 1}
                  className={arrowClass(index === exercises.length - 1)}
                >
                  <i className="ri-arrow-down-s-line text-sm"></i>
                </button>
              </div>
              <div className="w-8 h-8 bg-blue-50 dark:bg-indigo-500/20 text-blue-700 dark:text-indigo-300 rounded-full flex items-center justify-center font-medium text-sm">
                {index + 1}
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">{getExerciseName(programExercise.exerciseId)}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">({getExerciseBodyPart(programExercise.exerciseId)})</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <i className="ri-draggable text-gray-400 dark:text-gray-600"></i>
              <Button variant="danger" size="sm" onClick={() => draft.removeExercise(programExercise.id)}>
                <i className="ri-close-line mr-1"></i>
                제거
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
