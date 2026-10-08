import type { ReactNode } from 'react';

interface ModalProps {
  children: ReactNode;
  // 패널(흰 카드) 클래스
  className?: string;
  // 배경 오버레이 색·블러
  overlayClassName?: string;
}

export const MODAL_PANEL_CLASS =
  'bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-md';

// 화면 중앙에 띄우는 모달 셸. 열림 여부는 호출하는 쪽에서 조건부 렌더링으로 정한다.
export function Modal({
  children,
  className = MODAL_PANEL_CLASS,
  overlayClassName = 'bg-black/40 dark:bg-black/70 backdrop-blur-sm',
}: ModalProps) {
  return (
    <div className={`fixed inset-0 ${overlayClassName} flex items-center justify-center p-4 z-50`}>
      <div className={className}>{children}</div>
    </div>
  );
}
