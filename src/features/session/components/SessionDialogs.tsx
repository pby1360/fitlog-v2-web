import type { ReactNode } from 'react';
import { formatClock } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';

const overlayClass = 'bg-black/30 dark:bg-black/50';
const panelClass = 'bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-xl p-6 w-full max-w-md';

export function CompleteDialog({ totalTime, onConfirm }: { totalTime: number; onConfirm: () => void }) {
  return (
    <Modal overlayClassName={overlayClass} className={`${panelClass} text-center`}>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">운동 완료!</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">총 운동시간: {formatClock(totalTime)}</p>
      <Button onClick={onConfirm} className="w-full">기록 보러가기</Button>
    </Modal>
  );
}

interface SessionConfirmDialogProps {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  // 확인 버튼 색
  confirmClassName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// 운동 종료·건너뛰기 확인
export function SessionConfirmDialog({ title, message, confirmLabel, confirmClassName, onConfirm, onCancel }: SessionConfirmDialogProps) {
  return (
    <Modal overlayClassName={overlayClass} className={panelClass}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">취소</Button>
        <Button onClick={onConfirm} className={`flex-1 ${confirmClassName}`}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
