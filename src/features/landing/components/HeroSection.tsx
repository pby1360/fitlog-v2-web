// 첫 화면: 소개 문구와 시작·로그인 버튼
export function HeroSection({ onLogin, onSignUp }: { onLogin: () => void; onSignUp: () => void }) {
  return (
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
            onClick={onSignUp}
            className="px-8 py-3.5 text-base font-semibold rounded-xl text-white transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}
          >
            무료로 시작하기
          </button>
          <button
            onClick={onLogin}
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
  );
}
