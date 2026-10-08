// 사용 방법 3단계와 운동 세션 미리보기
export function WorkflowSection({ onSignUp }: { onSignUp: () => void }) {
  return (
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
              onClick={onSignUp}
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
  );
}
