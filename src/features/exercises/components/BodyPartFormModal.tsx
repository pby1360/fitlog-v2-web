import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';

interface BodyPartFormModalProps {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

// 운동 부위 추가 폼
export function BodyPartFormModal({ onSubmit, onCancel }: BodyPartFormModalProps) {
  const [name, setName] = useState('');

  return (
    <Modal>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">운동 부위 추가</h3>
      <Input
        label="부위 이름"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="예: 전신"
      />
      <div className="flex gap-2 mt-4">
        <Button variant="subtle" onClick={onCancel}>
          취소
        </Button>
        <Button variant="brand" onClick={() => onSubmit(name.trim())}>추가</Button>
      </div>
    </Modal>
  );
}
