import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoginModal } from '@/features/auth';
import {
  CtaSection,
  FeaturesSection,
  HeroSection,
  LandingFooter,
  LandingHeader,
  SessionExpiredNotice,
  WorkflowSection,
} from '@/features/landing';
import { hasAccessToken } from '@/shared/lib/authStorage';
import type { HomeRouteState } from '@/shared/lib/navigation';

// 비로그인 랜딩 페이지 (항상 다크). 로그인돼 있으면 대시보드로 보낸다
export default function HomePage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [showExpiredNotice, setShowExpiredNotice] = useState(
    () => (location.state as HomeRouteState | null)?.sessionExpired === true
  );

  useEffect(() => {
    if (hasAccessToken()) {
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
      {showExpiredNotice && <SessionExpiredNotice onClose={() => setShowExpiredNotice(false)} />}
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
