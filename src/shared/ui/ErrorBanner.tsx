import type { ReactNode } from 'react';

interface ErrorBannerProps {
  children: ReactNode;
  // 오른쪽 동작 (닫기·다시 시도 등)
  action?: ReactNode;
  className?: string;
}

export function ErrorBanner({ children, action, className = 'mb-4' }: ErrorBannerProps) {
  return (
    <div role="alert" className={`${className} flex items-start justify-between gap-3 rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400`}>
      <span>{children}</span>
      {action}
    </div>
  );
}

// 닫기 버튼이 붙은 오류 표시
export function DismissibleError({ message, onDismiss, className }: { message: string; onDismiss: () => void; className?: string }) {
  return (
    <ErrorBanner
      className={className}
      action={
        <button onClick={onDismiss} className="shrink-0 font-medium" aria-label="오류 닫기">
          <i className="ri-close-line" />
        </button>
      }
    >
      {message}
    </ErrorBanner>
  );
}
