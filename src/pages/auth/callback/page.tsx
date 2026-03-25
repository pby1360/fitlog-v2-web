import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams.get('error');
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const imageUrl = searchParams.get('imageUrl');
    const provider = searchParams.get('provider');

    if (error) {
      const message = searchParams.get('message');
      setErrorMessage(message || '로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      return;
    }

    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('imageUrl', imageUrl || '');
      if (provider) {
        localStorage.setItem('provider', provider);
      }
      navigate('/dashboard');
    } else {
      setErrorMessage('로그인 정보를 받아오지 못했습니다. 다시 시도해주세요.');
    }
  }, [searchParams, navigate]);

  if (errorMessage) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-2xl text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">로그인 실패</h2>
          <p className="text-sm text-gray-600 mb-6">{errorMessage}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-base font-semibold text-gray-900">로그인 중...</p>
        <p className="text-sm text-gray-500 mt-1">잠시만 기다려주세요</p>
      </div>
    </div>
  );
}
