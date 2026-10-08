import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

// 로그인 후 화면 공통 셸: 배경 + 상단 내비게이션. 본문 폭은 각 페이지가 정한다.
export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <Header />
      {/* 페이지 코드를 불러오는 동안에도 헤더는 유지한다 */}
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </div>
  );
}
