
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link to="/dashboard" className="flex items-center" onClick={closeMobileMenu}>
            <div className="text-xl font-bold text-blue-600">FitTracker</div>
          </Link>

          {/* 데스크톱 네비게이션 메뉴 */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/dashboard') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              대시보드
            </Link>
            <Link
              to="/programs"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/programs') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              프로그램
            </Link>
            <Link
              to="/workout"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/workout') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              운동하기
            </Link>
            <Link
              to="/history"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/history') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              운동일지
            </Link>
          </nav>

          {/* 사용자 메뉴 */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md">
              <i className="ri-notification-line text-xl"></i>
            </button>
            
            {/* 사용자 드롭다운 메뉴 */}
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={toggleUserMenu}
                className="p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              >
                <i className="ri-user-line text-xl"></i>
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    to="/profile"
                    onClick={closeUserMenu}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                  >
                    <i className="ri-user-settings-line mr-2"></i>
                    내정보
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
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
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <i className={`text-xl ${isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'}`}></i>
          </button>
        </div>

        {/* 모바일 네비게이션 메뉴 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <nav className="flex flex-col space-y-1">
              <Link
                to="/dashboard"
                onClick={closeMobileMenu}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard') 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                대시보드
              </Link>
              <Link
                to="/programs"
                onClick={closeMobileMenu}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/programs') 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                프로그램
              </Link>
              <Link
                to="/workout"
                onClick={closeMobileMenu}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/workout') 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                운동하기
              </Link>
              <Link
                to="/history"
                onClick={closeMobileMenu}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/history') 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                운동일지
              </Link>
            </nav>
            
            {/* 모바일 사용자 메뉴 */}
            <div className="border-t border-gray-200 mt-2 pt-2">
              <div className="flex flex-col space-y-1 px-3">
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-md transition-colors"
                >
                  <i className="ri-user-settings-line mr-2"></i>
                  내정보
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 rounded-md transition-colors"
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
