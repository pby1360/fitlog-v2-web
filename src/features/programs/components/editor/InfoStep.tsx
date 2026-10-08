import { Input } from '@/shared/ui/Input';
import type { ProgramDraft } from '../../hooks/useProgramDraft';
import { NextStepButton } from './StepButtons';

interface InfoStepProps {
  draft: ProgramDraft;
  onNext: () => void;
}

// 1단계: 프로그램 이름·설명
export function InfoStep({ draft, onNext }: InfoStepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">프로그램 기본 정보</h2>
      <div className="space-y-4">
        <Input
          label="프로그램 이름"
          value={draft.name}
          onChange={(e) => draft.setName(e.target.value)}
          placeholder="예: 상체 집중 루틴"
        />
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            프로그램 설명
          </label>
          <textarea
            value={draft.description}
            onChange={(e) => draft.setDescription(e.target.value)}
            placeholder="프로그램에 대한 간단한 설명을 입력하세요"
            className="w-full px-3 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
          />
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <NextStepButton onClick={onNext} disabled={!draft.name.trim()} />
      </div>
    </div>
  );
}
