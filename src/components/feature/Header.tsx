
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const closeUserMenu = () => {
    setIsUserMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    closeUserMenu();
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 홈페이지에서는 헤더를 표시하지 않음
  if (location.pathname === '/') {
    return null;
  }

  return (
    <header className="bg-gray-50/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-gray-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link to="/dashboard" className="flex items-center gap-2" onClick={closeMobileMenu}>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <i className="ri-fire-fill text-white text-sm"></i>
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">Fitlog</div>
          </Link>

          {/* 데스크톱 네비게이션 메뉴 */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/dashboard')
                  ? 'text-blue-600 bg-blue-50 dark:text-indigo-300 dark:bg-indigo-500/15'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              대시보드
            </Link>
            <Link
              to="/programs"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/programs')
                  ? 'text-blue-600 bg-blue-50 dark:text-indigo-300 dark:bg-indigo-500/15'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              프로그램
            </Link>
            <Link
              to="/workout"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/workout')
                  ? 'text-blue-600 bg-blue-50 dark:text-indigo-300 dark:bg-indigo-500/15'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              운동하기
            </Link>
            <Link
              to="/history"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/history')
                  ? 'text-blue-600 bg-blue-50 dark:text-indigo-300 dark:bg-indigo-500/15'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              운동일지
            </Link>
          </nav>

          {/* 사용자 메뉴 */}
          <div className="hidden md:flex items-center space-x-4">
            {/* 테마 토글 버튼 */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <i className={`text-xl ${theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line'}`}></i>
            </button>

            <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-md transition-colors">
              <i className="ri-notification-line text-xl"></i>
            </button>

            {/* 사용자 드롭다운 메뉴 */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={toggleUserMenu}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-md flex items-center justify-center transition-colors"
              >
                {localStorage.getItem('imageUrl') ? (
                  <img src={localStorage.getItem('imageUrl') || undefined} alt="User Profile" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <i className="ri-user-line text-xl"></i>
                )}
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#111] rounded-md shadow-2xl border border-gray-200 dark:border-white/10 py-1 z-50">
                  <Link
                    to="/profile"
                    onClick={closeUserMenu}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <i className="ri-user-settings-line mr-2"></i>
                    내정보
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-red-400 transition-colors"
                  >
                    <i className="ri-logout-box-line mr-2"></i>
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 focus:outline-none transition-colors"
          >
            <i className={`text-xl ${isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'}`}></i>
          </button>
        </div>

        {/* 모바일 네비게이션 메뉴 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#0a0a0a] py-2">
            <nav className="flex flex-col space-y-1">
              <Link
                to="/dashboard"
                onClick={closeMobileMenu}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'text-blue-600 bg-blue-50 dark:text-indigo-300 dark:bg-indigo-500/15'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                대시보드
              </Link>
              <Link
                to="/programs"
                onClick={closeMobileMenu}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/programs')
                    ? 'text-blue-600 bg-blue-50 dark:text-indigo-300 dark:bg-indigo-500/15'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                프로그램
              </Link>
              <Link
                to="/workout"
                onClick={closeMobileMenu}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/workout')
                    ? 'text-blue-600 bg-blue-50 dark:text-indigo-300 dark:bg-indigo-500/15'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                운동하기
              </Link>
              <Link
                to="/history"
                onClick={closeMobileMenu}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/history')
                    ? 'text-blue-600 bg-blue-50 dark:text-indigo-300 dark:bg-indigo-500/15'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                운동일지
              </Link>
            </nav>

            {/* 모바일 사용자 메뉴 */}
            <div className="border-t border-gray-100 dark:border-white/5 mt-2 pt-2">
              <div className="flex flex-col space-y-1 px-3">
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white rounded-md transition-colors"
                >
                  <i className="ri-user-settings-line mr-2"></i>
                  내정보
                </Link>
                {/* 테마 토글 버튼 (모바일) */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white rounded-md transition-colors"
                >
                  <i className={`mr-2 ${theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line'}`}></i>
                  {theme === 'dark' ? '라이트 모드' : '다크 모드'}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-red-400 rounded-md transition-colors"
                >
                  <i className="ri-logout-box-line mr-2"></i>
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
