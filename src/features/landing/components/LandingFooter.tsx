import { Link } from 'react-router-dom';

// 저작권과 약관 링크
export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <i className="ri-fire-fill text-white text-[10px]"></i>
          </div>
          <span className="text-sm font-semibold text-gray-400">Fitlog</span>
        </div>
        <p className="text-xs text-gray-600">&copy; 2025 Fitlog. All rights reserved.</p>
        <div className="flex gap-5 text-xs text-gray-600">
          <Link to="/privacy" className="hover:text-gray-400 transition-colors">개인정보처리방침</Link>
          <Link to="/terms" className="hover:text-gray-400 transition-colors">이용약관</Link>
        </div>
      </div>
    </footer>
  );
}
