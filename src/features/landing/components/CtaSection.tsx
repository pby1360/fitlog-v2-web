// 하단 가입 유도
export function CtaSection({ onSignUp }: { onSignUp: () => void }) {
  return (
    <section className="py-24 border-t border-white/5">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          오늘부터 기록을 시작하세요
        </h2>
        <p className="text-gray-500 mb-8">무료로 가입하고 나의 운동을 체계적으로 관리해보세요.</p>
        <button
          onClick={onSignUp}
          className="px-10 py-4 text-base font-semibold rounded-xl text-white transition-all hover:opacity-90 hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}
        >
          무료로 시작하기
        </button>
        <p className="mt-4 text-xs text-gray-600">신용카드 불필요 · 소셜 계정으로 바로 시작</p>
      </div>
    </section>
  );
}
