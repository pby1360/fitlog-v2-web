import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LegalLayoutProps {
  title: string;
  effectiveDate: string;
  children: ReactNode;
}

// 개인정보처리방침·이용약관 공통 레이아웃 (로그인 없이 볼 수 있는 공개 페이지)
export default function LegalLayout({ title, effectiveDate, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <i className="ri-arrow-left-line mr-1" />
          홈으로
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">시행일: {effectiveDate}</p>
        <div className="mt-8 space-y-8 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{children}</div>
      </div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
