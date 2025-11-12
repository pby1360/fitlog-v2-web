
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginModal from '../../components/feature/LoginModal';

export default function HomePage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLoginClick = () => {
    setIsSignUpMode(false);
    setIsLoginModalOpen(true);
  };

  const handleSignUpClick = () => {
    setIsSignUpMode(true);
    setIsLoginModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center">
              <div className="text-xl font-bold text-blue-600">FitTracker</div>
            </a>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLoginClick}
                className="inline-flex items-center justify-center font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer touch-manipulation select-none border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-300 px-4 py-2.5 text-base min-h-[40px] border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                로그인
              </button>
              <button
                onClick={handleSignUpClick}
                className="inline-flex items-center justify-center font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer touch-manipulation select-none bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 px-4 py-2.5 text-base min-h-[40px] bg-blue-600 text-white hover:bg-blue-700"
              >
                회원가입
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section 
        className="relative bg-cover bg-center bg-no-repeat min-h-[600px] flex items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://readdy.ai/api/search-image?query=Modern%20fitness%20gym%20interior%20with%20professional%20equipment%2C%20bright%20lighting%2C%20clean%20minimalist%20design%2C%20people%20exercising%20in%20background%2C%20motivational%20atmosphere%2C%20high-tech%20fitness%20environment%2C%20contemporary%20workout%20space&width=1200&height=600&seq=hero-fitness&orientation=landscape')`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              당신의 피트니스 여정을<br />
              <span className="text-blue-400">스마트하게</span> 관리하세요
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              운동 계획부터 기록까지, 모든 것을 한 곳에서
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSignUpClick}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                무료로 시작하기
              </button>
              <button
                onClick={handleLoginClick}
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
              >
                로그인하기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 기능 소개 섹션 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              왜 FitTracker를 선택해야 할까요?
            </h2>
            <p className="text-xl text-gray-600">
              효과적인 운동 관리를 위한 모든 기능을 제공합니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-calendar-line text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">스마트 운동 계획</h3>
              <p className="text-gray-600">
                개인 맞춤형 운동 프로그램을 생성하고 체계적으로 관리하세요
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-bar-chart-line text-2xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">상세한 운동 기록</h3>
              <p className="text-gray-600">
                모든 운동을 기록하고 진행 상황을 시각적으로 확인하세요
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-trophy-line text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">목표 달성 추적</h3>
              <p className="text-gray-600">
                운동 목표를 설정하고 달성 과정을 체계적으로 추적하세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            지금 바로 시작하세요!
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            무료로 가입하고 스마트한 운동 관리를 경험해보세요
          </p>
          <button
            onClick={handleSignUpClick}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            무료 회원가입
          </button>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-xl font-bold text-blue-400 mb-4">FitTracker</div>
              <p className="text-gray-400">
                스마트한 운동 관리로 건강한 라이프스타일을 만들어보세요
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">제품</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">운동 계획</a></li>
                <li><a href="#" className="hover:text-white">운동 기록</a></li>
                <li><a href="#" className="hover:text-white">진행 추적</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">지원</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">도움말</a></li>
                <li><a href="#" className="hover:text-white">문의하기</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">회사</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">소개</a></li>
                <li><a href="#" className="hover:text-white">블로그</a></li>
                <li><a href="#" className="hover:text-white">채용</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FitTracker. All rights reserved. | 
              <a href="https://readdy.ai/?origin=logo" className="hover:text-white ml-1">Powered by Readdy</a>
            </p>
          </div>
        </div>
      </footer>

      {/* 로그인 모달 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseModal}
        isSignUp={isSignUpMode}
      />
    </div>
  );
}
