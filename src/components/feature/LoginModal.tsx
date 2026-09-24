import { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSignUp?: boolean;
}

export default function LoginModal({ isOpen, onClose, isSignUp = false }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const BASE_AUTH_URL = import.meta.env.VITE_API_BASE_URL + '/oauth2/authorization';
  if (!isOpen) return null;

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    
    // 백엔드 서버의 OAuth2 로그인 시작 URL
    window.location.href = BASE_AUTH_URL + `/${provider}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isSignUp ? '회원가입' : '로그인'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i className="ri-close-line text-xl text-gray-500"></i>
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-600">
              {isSignUp 
                ? '소셜 계정으로 간편하게 가입하세요' 
                : '소셜 계정으로 간편하게 로그인하세요'
              }
            </p>
          </div>

          {/* 소셜 로그인 버튼들 */}
          <div className="space-y-3">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              style={{ border: '1px solid #DADCE0' }}
              className="w-full min-h-[40px] px-4 py-2.5 bg-white hover:bg-[#F2F2F2] text-[#1F1F1F] font-medium rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg className="mr-3 w-[18px] h-[18px] flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              Google로 {isSignUp ? '가입하기' : '로그인'}
            </button>

            <button
              onClick={() => handleSocialLogin('kakao')}
              disabled={isLoading}
              className="w-full min-h-[40px] px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium"
              style={{ backgroundColor: '#FEE500', color: '#000000' }}
              onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#E6CE00'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FEE500'; }}
            >
              <svg className="mr-3 w-[18px] h-[18px] flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.74 1.61 5.15 4.04 6.58l-1.03 3.83a.3.3 0 0 0 .46.32l4.45-2.97c.68.1 1.37.14 2.08.14 5.523 0 10-3.477 10-7.8S17.523 3 12 3z" fill="#000000"/>
              </svg>
              카카오로 {isSignUp ? '가입하기' : '로그인'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}