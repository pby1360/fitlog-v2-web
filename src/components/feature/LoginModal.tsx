import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../base/Button';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSignUp?: boolean;
}

export default function LoginModal({ isOpen, onClose, isSignUp = false }: LoginModalProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const BASE_AUTH_URL = 'http://localhost:8080/oauth2/authorization'

  if (!isOpen) return null;

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    
    // 백엔드 서버의 OAuth2 로그인 시작 URL
    window.location.href = BASE_AUTH_URL + `/${provider}`;
  };

  const handleEmailLogin = () => {
    // 이메일 로그인 처리
    onClose();
    navigate('/dashboard');
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
          <div className="space-y-3 mb-6">
            <Button
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center"
            >
              <i className="ri-google-fill text-red-500 mr-3 text-lg"></i>
              Google로 {isSignUp ? '가입하기' : '로그인'}
            </Button>

            <Button
              onClick={() => handleSocialLogin('kakao')}
              disabled={isLoading}
              className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500 flex items-center justify-center"
            >
              <i className="ri-kakao-talk-fill mr-3 text-lg"></i>
              카카오로 {isSignUp ? '가입하기' : '로그인'}
            </Button>


          </div>

          {/* 구분선 */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          {/* 이메일 로그인 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                placeholder="이메일을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <Button
              onClick={handleEmailLogin}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  처리중...
                </div>
              ) : (
                isSignUp ? '회원가입' : '로그인'
              )}
            </Button>
          </div>

          {/* 하단 링크 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isSignUp ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}
              <button
                onClick={() => {
                  // 모달 타입 변경 로직은 부모 컴포넌트에서 처리
                }}
                className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
              >
                {isSignUp ? '로그인하기' : '회원가입하기'}
              </button>
            </p>
          </div>

          {!isSignUp && (
            <div className="mt-4 text-center">
              <button className="text-sm text-gray-600 hover:text-gray-700">
                비밀번호를 잊으셨나요?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}