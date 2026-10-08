import { Button } from '@/shared/ui/Button';
import type { ProgramDraft } from '../../hooks/useProgramDraft';
import { PrevStepButton } from './StepButtons';

interface SetStepProps {
  draft: ProgramDraft;
  isEdit: boolean;
  getExerciseName: (exerciseId: number) => string;
  getExerciseBodyPart: (exerciseId: number) => string;
  onPrev: () => void;
  onSave: () => void;
}

const inputClass = 'w-full px-3 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
const labelClass = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1';

// 4단계: 운동별 세트 설정 후 저장
export function SetStep({ draft, isEdit, getExerciseName, getExerciseBodyPart, onPrev, onSave }: SetStepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">세트별 상세 설정</h2>

      <div className="space-y-6 mb-6">
        {draft.exercises.map((programExercise) => (
          <div key={programExercise.id} className="p-4 border border-gray-200 dark:border-white/8 rounded-lg bg-gray-50 dark:bg-[#0a0a0a]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-lg text-gray-900 dark:text-white">{getExerciseName(programExercise.exerciseId)}</h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">({getExerciseBodyPart(programExercise.exerciseId)})</span>
              </div>
              <div className="flex gap-2">
                <Button variant="subtle" size="sm" onClick={() => draft.addSet(programExercise.id)}>
                  <i className="ri-add-line mr-1"></i>
                  세트 추가
                </Button>
                <Button variant="danger" size="sm" onClick={() => draft.removeExercise(programExercise.id)}>
                  <i className="ri-delete-bin-line"></i>
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {programExercise.sets.map((set, index) => (
                <div key={set.id} className="p-3 bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-sm text-gray-600 dark:text-gray-400">세트 {index + 1}</span>
                    {programExercise.sets.length > 1 && (
                      <Button variant="danger" size="sm" onClick={() => draft.removeSet(programExercise.id, set.id)}>
                        <i className="ri-close-line"></i>
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className={labelClass}>횟수</label>
                      <input
                        type="number"
                        min="1"
                        value={set.reps}
                        onChange={(e) => draft.updateSet(programExercise.id, set.id, 'reps', parseInt(e.target.value) || 1)}
                        className={`${inputClass} text-center`}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>무게(kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={set.weight || ''}
                        onChange={(e) => draft.updateSet(programExercise.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                        placeholder="선택사항"
                        className={`${inputClass} text-center`}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>휴식시간(초)</label>
                      <input
                        type="number"
                        min="0"
                        step="30"
                        value={set.restTime}
                        onChange={(e) => draft.updateSet(programExercise.id, set.id, 'restTime', parseInt(e.target.value) || 0)}
                        className={`${inputClass} text-center`}
                      />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className={labelClass}>메모</label>
                      <input
                        type="text"
                        value={set.memo || ''}
                        onChange={(e) => draft.updateSet(programExercise.id, set.id, 'memo', e.target.value)}
                        placeholder="메모 입력"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <PrevStepButton onClick={onPrev} />
        <Button variant="brand" onClick={onSave}>
          <i className="ri-save-line mr-2"></i>
          {isEdit ? '프로그램 수정' : '프로그램 저장'}
        </Button>
      </div>
    </div>
  );
}
