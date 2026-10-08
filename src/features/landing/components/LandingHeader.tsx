import { useEffect, useState } from 'react';

// 상단 고정 헤더. 스크롤하면 배경이 생긴다
export function LandingHeader({ onLogin, onSignUp }: { onLogin: () => void; onSignUp: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <i className="ri-fire-fill text-white text-sm"></i>
            </div>
            <span className="text-lg font-bold tracking-tight">Fitlog</span>
          </a>
          <div className="flex items-center gap-3">
            <button
              onClick={onLogin}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              로그인
            </button>
            <button
              onClick={onSignUp}
              className="px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
            >
              시작하기
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
