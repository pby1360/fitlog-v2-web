// 주요 기능 소개
export function FeaturesSection() {
  return (
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
  );
}
