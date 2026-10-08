import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@/app/providers/useTheme';
import { revokeRefreshToken } from '@/features/auth';
import { UserMenu } from './UserMenu';

const NAV_ITEMS = [
  { to: '/dashboard', label: '대시보드' },
  { to: '/programs', label: '프로그램' },
  { to: '/workout', label: '운동하기' },
  { to: '/history', label: '운동일지' },
];

const navLinkClass = (active: boolean) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
  active
    ? 'text-blue-600 bg-blue-50 dark:text-indigo-300 dark:bg-indigo-500/15'
    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
}`;

const iconButtonClass = 'p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors';
const mobileItemClass = 'flex items-center w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 rounded-md transition-colors';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    await revokeRefreshToken();
    localStorage.clear();
    navigate('/');
  };

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
            {NAV_ITEMS.map(item => (
              <Link key={item.to} to={item.to} className={`${navLinkClass(location.pathname === item.to)} whitespace-nowrap`}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 사용자 메뉴 */}
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={toggleTheme} className={iconButtonClass}>
              <i className={`text-xl ${theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line'}`}></i>
            </button>

            {/* TODO: 알림 기능 미구현 */}
            <button className={iconButtonClass}>
              <i className="ri-notification-line text-xl"></i>
            </button>

            <UserMenu onLogout={handleLogout} />
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`md:hidden ${iconButtonClass} focus:outline-none`}>
            <i className={`text-xl ${isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'}`}></i>
          </button>
        </div>

        {/* 모바일 네비게이션 메뉴 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#0a0a0a] py-2">
            <nav className="flex flex-col space-y-1">
              {NAV_ITEMS.map(item => (
                <Link key={item.to} to={item.to} onClick={closeMobileMenu} className={navLinkClass(location.pathname === item.to)}>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* 모바일 사용자 메뉴 */}
            <div className="border-t border-gray-100 dark:border-white/5 mt-2 pt-2">
              <div className="flex flex-col space-y-1 px-3">
                <Link to="/profile" onClick={closeMobileMenu} className={`${mobileItemClass} hover:text-gray-900 dark:hover:text-white`}>
                  <i className="ri-user-settings-line mr-2"></i>
                  내정보
                </Link>
                <button onClick={toggleTheme} className={`${mobileItemClass} hover:text-gray-900 dark:hover:text-white`}>
                  <i className={`mr-2 ${theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line'}`}></i>
                  {theme === 'dark' ? '라이트 모드' : '다크 모드'}
                </button>
                <button onClick={handleLogout} className={`${mobileItemClass} hover:text-red-400`}>
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
