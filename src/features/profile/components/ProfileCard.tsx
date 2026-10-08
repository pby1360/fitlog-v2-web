import type { ReactNode } from 'react';

// 아이콘 제목줄이 있는 프로필 카드
export function ProfileCard({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-indigo-500/10 flex items-center justify-center">
          <i className={`${icon} text-blue-600 dark:text-indigo-400`} />
        </div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}
