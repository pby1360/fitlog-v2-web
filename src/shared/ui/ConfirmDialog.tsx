import type { ReactNode } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// 삭제처럼 되돌릴 수 없는 동작을 확인받는 대화상자
export function ConfirmDialog({ title, message, confirmLabel, cancelLabel = '취소', onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
      <div className="flex gap-2">
        <Button variant="subtle" onClick={onCancel} className="flex-1">
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} className="flex-1 border border-red-500/20 text-red-400 hover:bg-red-500/10 bg-transparent">
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
