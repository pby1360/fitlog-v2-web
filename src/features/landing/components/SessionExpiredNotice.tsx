// 로그인이 만료돼 홈으로 돌아왔을 때 상단에 띄우는 안내
export function SessionExpiredNotice({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="alert"
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-amber-500/30 bg-[#111] text-sm text-amber-300 shadow-2xl"
    >
      <span className="flex items-center gap-2">
        <i className="ri-time-line" />
        인증이 만료되었습니다. 다시 로그인해주세요.
      </span>
      <button onClick={onClose} className="shrink-0 text-amber-300/70 hover:text-amber-200" aria-label="안내 닫기">
        <i className="ri-close-line" />
      </button>
    </div>
  );
}
