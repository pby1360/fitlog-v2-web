// 새로고침해도 타이머를 복원할 수 있도록 같은 기기에 보정값을 저장한다

const EXERCISE_START_KEY = 'exercise_start_time';
const PAUSE_SNAPSHOT_KEY = 'pause_snapshot';

export const saveExerciseStartTime = (sessionId: number, exerciseIndex: number, time: number) => {
  localStorage.setItem(EXERCISE_START_KEY, JSON.stringify({ sessionId, exerciseIndex, time }));
};

export const loadExerciseStartTime = (sessionId: number, exerciseIndex: number): number | null => {
  try {
    const stored = localStorage.getItem(EXERCISE_START_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed.sessionId === sessionId && parsed.exerciseIndex === exerciseIndex) {
      return parsed.time;
    }
  } catch {
    // 저장된 값이 손상됐으면 무시하고 서버 값 기준으로 계산한다
  }
  return null;
};

// 일시정지 직전의 전체 운동 시간. 서버 응답에 lastPausedAt 이 없을 때 쓴다
export const savePauseSnapshot = (sessionId: number, totalTime: number) => {
  localStorage.setItem(PAUSE_SNAPSHOT_KEY, JSON.stringify({ sessionId, totalTime }));
};

export const loadPauseSnapshot = (sessionId: number): number | null => {
  try {
    const stored = localStorage.getItem(PAUSE_SNAPSHOT_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed.sessionId === sessionId) return parsed.totalTime;
  } catch {
    // 저장된 값이 손상됐으면 무시하고 서버 값 기준으로 계산한다
  }
  return null;
};

export const clearPauseSnapshot = () => {
  localStorage.removeItem(PAUSE_SNAPSHOT_KEY);
};
