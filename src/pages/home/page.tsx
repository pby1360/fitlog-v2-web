import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginModal from '../../components/feature/LoginModal';

export default function HomePage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoginClick = () => {
    setIsSignUpMode(false);
    setIsLoginModalOpen(true);
  };

  const handleSignUpClick = () => {
    setIsSignUpMode(true);
    setIsLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* 헤더 */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <i className="ri-fire-fill text-white text-sm"></i>
              </div>
              <span className="text-lg font-bold tracking-tight">Fitlog</span>
            </a>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLoginClick}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                로그인
              </button>
              <button
                onClick={handleSignUpClick}
                className="px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
              >
                시작하기
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* 배경 그라디언트 */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.25) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }}
          />
        </div>

        {/* 그리드 패턴 */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative max-w-4xl mx-auto px-6 text-center pt-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-gray-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            지금 무료로 시작할 수 있어요
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            운동 기록을
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              스마트하게
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
            운동 프로그램 설계부터 세트 기록, 히스토리 분석까지
            <br className="hidden md:block" />
            모든 것을 한 곳에서 관리하세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleSignUpClick}
              className="px-8 py-3.5 text-base font-semibold rounded-xl text-white transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}
            >
              무료로 시작하기
            </button>
            <button
              onClick={handleLoginClick}
              className="px-8 py-3.5 text-base font-medium rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white transition-all"
            >
              로그인하기
            </button>
          </div>

          {/* 통계 */}
          <div className="mt-20 flex items-center justify-center gap-10 text-center">
            {[
              { value: '100%', label: '무료' },
              { value: '∞', label: '운동 기록' },
              { value: '실시간', label: '세션 추적' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 페이드 */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #0a0a0a)' }}
        />
      </section>

      {/* 기능 소개 섹션 */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest text-indigo-400 uppercase mb-4">기능</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              운동에만 집중하세요
            </h2>
            <p className="text-gray-500 mt-4 max-w-md mx-auto">
              복잡한 기록 앱은 그만. 빠르고 직관적인 운동 관리 경험
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: 'ri-list-check-3',
                color: 'from-blue-500/20 to-indigo-500/20',
                iconColor: 'text-blue-400',
                title: '프로그램 관리',
                desc: '나만의 운동 루틴을 만들고 언제든 불러와 바로 시작하세요.',
              },
              {
                icon: 'ri-timer-2-line',
                color: 'from-violet-500/20 to-purple-500/20',
                iconColor: 'text-violet-400',
                title: '실시간 세션 추적',
                desc: '세트, 무게, 횟수를 실시간으로 기록하며 운동 흐름을 유지하세요.',
              },
              {
                icon: 'ri-bar-chart-grouped-line',
                color: 'from-pink-500/20 to-rose-500/20',
                iconColor: 'text-pink-400',
                title: '운동 히스토리',
                desc: '지난 운동 기록을 한눈에 보고 나의 성장을 확인하세요.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5`}
                >
                  <i className={`${feature.icon} text-xl ${feature.iconColor}`}></i>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 워크플로우 섹션 */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-semibold tracking-widest text-indigo-400 uppercase mb-4">
                어떻게 사용하나요
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                3단계로
                <br />
                운동을 시작하세요
              </h2>
              <div className="space-y-6">
                {[
                  { step: '01', title: '프로그램 만들기', desc: '원하는 운동 종목과 세트 구성으로 나만의 루틴을 설계합니다.' },
                  { step: '02', title: '운동 시작', desc: '저장된 프로그램을 선택하고 세션을 시작하면 타이머가 자동으로 작동합니다.' },
                  { step: '03', title: '기록 확인', desc: '완료된 운동은 히스토리에 저장되고 대시보드에서 통계를 확인할 수 있습니다.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="text-xs font-mono text-indigo-400 w-6 pt-0.5 flex-shrink-0">{item.step}</div>
                    <div>
                      <div className="text-sm font-semibold text-white mb-1">{item.title}</div>
                      <div className="text-sm text-gray-500 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleSignUpClick}
                className="mt-10 px-6 py-3 text-sm font-medium rounded-xl text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}
              >
                지금 무료로 시작하기 →
              </button>
            </div>

            {/* 미니 UI 카드 */}
            <div className="relative">
              <div className="rounded-2xl border border-white/10 bg-[#111] p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">오늘의 운동</div>
                    <div className="text-base font-semibold">풀바디 루틴 A</div>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                    진행 중
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  {[
                    { name: '벤치프레스', sets: '4 세트', status: 'done' },
                    { name: '스쿼트', sets: '3 세트', status: 'active' },
                    { name: '데드리프트', sets: '3 세트', status: 'pending' },
                  ].map((exercise) => (
                    <div
                      key={exercise.name}
                      className={`flex items-center justify-between p-3 rounded-xl ${
                        exercise.status === 'active'
                          ? 'bg-indigo-500/10 border border-indigo-500/20'
                          : exercise.status === 'done'
                          ? 'bg-white/[0.03]'
                          : 'bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            exercise.status === 'done'
                              ? 'bg-green-400'
                              : exercise.status === 'active'
                              ? 'bg-indigo-400 animate-pulse'
                              : 'bg-gray-600'
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            exercise.status === 'pending' ? 'text-gray-600' : 'text-gray-200'
                          }`}
                        >
                          {exercise.name}
                        </span>
                      </div>
                      <span
                        className={`text-xs ${
                          exercise.status === 'pending' ? 'text-gray-700' : 'text-gray-500'
                        }`}
                      >
                        {exercise.sets}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <i className="ri-time-line"></i>
                    <span>32:14 경과</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <i className="ri-fire-line text-orange-400"></i>
                    <span>2 / 3 완료</span>
                  </div>
                </div>
              </div>

              {/* 플로팅 배지 */}
              <div className="absolute -top-3 -right-3 px-3 py-1.5 rounded-full bg-[#111] border border-white/10 text-xs text-gray-300 shadow-lg">
                세트 완료 ✓
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            오늘부터 기록을 시작하세요
          </h2>
          <p className="text-gray-500 mb-8">무료로 가입하고 나의 운동을 체계적으로 관리해보세요.</p>
          <button
            onClick={handleSignUpClick}
            className="px-10 py-4 text-base font-semibold rounded-xl text-white transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}
          >
            무료로 시작하기
          </button>
          <p className="mt-4 text-xs text-gray-600">신용카드 불필요 · 소셜 계정으로 바로 시작</p>
        </div>
      </section>

      {/* 푸터 */}
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
            <a href="#" className="hover:text-gray-400 transition-colors">개인정보처리방침</a>
            <a href="#" className="hover:text-gray-400 transition-colors">이용약관</a>
          </div>
        </div>
      </footer>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        isSignUp={isSignUpMode}
      />
    </div>
  );
}
