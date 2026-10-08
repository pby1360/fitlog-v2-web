// 시간·비율 표시 형식. 화면마다 쓰는 형식이 달라 용도별로 나눠 둔다.

// "1시간 5분" / "5분" (대시보드·운동일지)
export const formatDurationKo = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}시간 ${minutes}분`;
  return `${minutes}분`;
};

// "1h 5m" / "5m" (프로필 통계)
export const formatDurationShort = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

// "1:05:09" / "5:09" (운동 세션 타이머)
export const formatClock = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// 완료 비율(%). 전체가 0이면 0
export const completionRate = (completed: number, total: number) =>
  total > 0 ? Math.round((completed / total) * 100) : 0;
