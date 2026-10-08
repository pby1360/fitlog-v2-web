import type { WorkoutPartResponse } from '@/features/exercises';
import { Button } from '@/shared/ui/Button';
import type { ProgramDraft } from '../../hooks/useProgramDraft';
import { NextStepButton, PrevStepButton } from './StepButtons';

interface BodyPartStepProps {
  draft: ProgramDraft;
  bodyParts: WorkoutPartResponse[];
  onAddBodyPart: () => void;
  onDeleteBodyPart: (bodyPartId: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

// 2단계: 운동 부위 선택 (다중 선택)
export function BodyPartStep({ draft, bodyParts, onAddBodyPart, onDeleteBodyPart, onPrev, onNext }: BodyPartStepProps) {
  const { selectedBodyParts } = draft;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">운동 부위 선택</h2>
        <Button variant="subtle" size="sm" onClick={onAddBodyPart}>
          <i className="ri-add-line mr-1"></i>
          부위 추가
        </Button>
      </div>

      <div className="mb-4 p-3 bg-blue-50 dark:bg-indigo-500/10 border border-blue-200 dark:border-indigo-500/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-indigo-300">
          <i className="ri-information-line mr-1"></i>
          여러 운동 부위를 선택할 수 있습니다. 선택된 부위:
          <span className="font-medium ml-1">
            {selectedBodyParts.length > 0 ? selectedBodyParts.join(', ') : '없음'}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {bodyParts.map((bodyPart) => {
          const isSelected = selectedBodyParts.includes(bodyPart.name);
          return (
            <div key={bodyPart.id} className="relative group">
              <button
                onClick={() => draft.toggleBodyPart(bodyPart.name)}
                className={`w-full p-3 rounded-lg border-2 transition-colors ${
                  isSelected
                    ? 'border-blue-500 dark:border-indigo-500 bg-blue-50 dark:bg-indigo-500/10 text-blue-700 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-white/8 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/15 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {isSelected && <i className="ri-check-line text-sm"></i>}
                  <span>{bodyPart.name}</span>
                </div>
              </button>
              {bodyPart.editable && (
                <button
                  onClick={() => onDeleteBodyPart(bodyPart.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <i className="ri-close-line text-xs"></i>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between">
        <PrevStepButton onClick={onPrev} />
        <NextStepButton onClick={onNext} disabled={selectedBodyParts.length === 0} />
      </div>
    </div>
  );
}
