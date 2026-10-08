import type { ReactNode } from 'react';

interface ErrorBannerProps {
  children: ReactNode;
  // 오른쪽 동작 (닫기·다시 시도 등)
  action?: ReactNode;
}

export function ErrorBanner({ children, action }: ErrorBannerProps) {
  return (
    <div role="alert" className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
      <span>{children}</span>
      {action}
    </div>
  );
}
