import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginModal } from '@/features/auth';
import {
  CtaSection,
  FeaturesSection,
  HeroSection,
  LandingFooter,
  LandingHeader,
  WorkflowSection,
} from '@/features/landing';

// 비로그인 랜딩 페이지 (항상 다크). 로그인돼 있으면 대시보드로 보낸다
export default function HomePage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const openLogin = () => {
    setIsSignUpMode(false);
    setIsLoginModalOpen(true);
  };

  const openSignUp = () => {
    setIsSignUpMode(true);
    setIsLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <LandingHeader onLogin={openLogin} onSignUp={openSignUp} />
      <HeroSection onLogin={openLogin} onSignUp={openSignUp} />
      <FeaturesSection />
      <WorkflowSection onSignUp={openSignUp} />
      <CtaSection onSignUp={openSignUp} />
      <LandingFooter />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        isSignUp={isSignUpMode}
      />
    </div>
  );
}
