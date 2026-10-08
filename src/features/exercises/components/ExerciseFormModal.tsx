import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';
import type { WorkoutPartResponse } from '../types';

interface ExerciseFormModalProps {
  title: string;
  submitLabel: string;
  bodyParts: WorkoutPartResponse[];
  initialName?: string;
  // 지정하지 않으면 첫 번째 부위를 선택한다
  initialBodyPartId?: number;
  namePlaceholder?: string;
  onSubmit: (name: string, bodyPartId: number) => void;
  onCancel: () => void;
}

// 운동 종목 추가·수정 폼
export function ExerciseFormModal({
  title,
  submitLabel,
  bodyParts,
  initialName = '',
  initialBodyPartId,
  namePlaceholder,
  onSubmit,
  onCancel,
}: ExerciseFormModalProps) {
  const [name, setName] = useState(initialName);
  const [bodyPartId, setBodyPartId] = useState<number | ''>(initialBodyPartId ?? bodyParts[0]?.id ?? '');

  const handleSubmit = () => {
    if (!name.trim() || bodyPartId === '') return;
    onSubmit(name.trim(), bodyPartId);
  };

  return (
    <Modal>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="space-y-4">
        <Input
          label="운동 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={namePlaceholder}
        />
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">운동 부위</label>
          <select
            value={bodyPartId}
            onChange={(e) => setBodyPartId(parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-8"
          >
            {bodyParts.map((bodyPart) => (
              <option key={bodyPart.id} value={bodyPart.id}>{bodyPart.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="subtle" onClick={onCancel}>
          취소
        </Button>
        <Button variant="brand" onClick={handleSubmit}>{submitLabel}</Button>
      </div>
    </Modal>
  );
}
