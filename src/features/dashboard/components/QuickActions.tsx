import { Link } from 'react-router-dom';

const ACTIONS = [
  { to: '/workout',  icon: 'ri-play-circle-line',   label: '운동 시작',     bg: 'bg-gradient-to-br from-blue-500 to-blue-600',       sub: '프로그램 선택' },
  { to: '/programs', icon: 'ri-list-settings-line', label: '프로그램 관리', bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600', sub: '루틴 만들기' },
  { to: '/history',  icon: 'ri-history-line',       label: '운동일지',      bg: 'bg-gradient-to-br from-violet-500 to-violet-600',   sub: '기록 보기' },
  { to: '/profile',  icon: 'ri-trophy-line',        label: '내 정보',       bg: 'bg-gradient-to-br from-amber-400 to-orange-500',    sub: '프로필 관리' },
];

export function QuickActions() {
  return (
    <div>
      <h2 className="text-base font-semibold text-gray-600 dark:text-gray-400 mb-3">빠른 액션</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {ACTIONS.map(action => (
          <Link key={action.to} to={action.to}>
            <div className={`${action.bg} rounded-2xl p-5 hover:opacity-90 transition-opacity cursor-pointer shadow-sm`}>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <i className={`${action.icon} text-xl text-white`} />
              </div>
              <div className="font-semibold text-sm text-white">{action.label}</div>
              <div className="text-xs text-white/70 mt-0.5">{action.sub}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
