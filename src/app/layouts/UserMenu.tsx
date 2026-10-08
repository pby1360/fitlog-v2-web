import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// 데스크톱 프로필 버튼과 드롭다운 (바깥을 누르면 닫힌다)
export function UserMenu({ onLogout }: { onLogout: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const imageUrl = localStorage.getItem('imageUrl');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-md flex items-center justify-center transition-colors"
      >
        {imageUrl ? (
          <img src={imageUrl} alt="User Profile" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <i className="ri-user-line text-xl"></i>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#111] rounded-md shadow-2xl border border-gray-200 dark:border-white/10 py-1 z-50">
          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <i className="ri-user-settings-line mr-2"></i>
            내정보
          </Link>
          <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-red-400 transition-colors"
          >
            <i className="ri-logout-box-line mr-2"></i>
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
