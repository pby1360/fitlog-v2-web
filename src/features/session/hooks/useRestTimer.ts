import { useEffect, useRef, useState } from 'react';
import { useBeep } from './useBeep';

// 세트 사이 휴식 타이머
// 매 tick 마다 1초씩 빼는 대신 종료 시각(deadline)과의 차이로 계산한다.
// 백그라운드 탭에서 interval 이 지연돼도 복귀 시 정확한 남은 시간을 보여준다.
// 운동이 일시정지되면 남은 시간을 고정하고, 재개하면 그 시점부터 다시 센다.
export function useRestTimer(isSessionPaused: boolean, soundEnabled: boolean) {
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restEndsAtRef = useRef<number | null>(null); // 휴식 종료 예정 시각(ms)
  const restRemainingRef = useRef(0); // 일시정지 시 보존할 남은 휴식 시간(초)
  const beepRef = useBeep(soundEnabled);

  const startRest = (seconds: number) => {
    restEndsAtRef.current = Date.now() + seconds * 1000;
    restRemainingRef.current = seconds;
    setRestTimeLeft(seconds);
    setIsResting(seconds > 0);
  };

  const stopRest = () => {
    restEndsAtRef.current = null;
    restRemainingRef.current = 0;
    setIsResting(false);
    setRestTimeLeft(0);
  };

  useEffect(() => {
    if (!isResting) return;

    if (isSessionPaused) {
      // 일시정지: 현재 남은 시간을 보존하고 deadline 을 해제한다
      restEndsAtRef.current = null;
      return;
    }
    if (restEndsAtRef.current === null) {
      // 일시정지 후 재개: 보존한 남은 시간으로 deadline 을 다시 잡는다
      restEndsAtRef.current = Date.now() + restRemainingRef.current * 1000;
    }

    const tick = () => {
      if (restEndsAtRef.current === null) return;
      const remaining = Math.max(0, Math.ceil((restEndsAtRef.current - Date.now()) / 1000));
      restRemainingRef.current = remaining;
      setRestTimeLeft(remaining);
      if (remaining === 0) {
        restEndsAtRef.current = null;
        setIsResting(false);
        if (soundEnabled && beepRef.current) {
          beepRef.current.play();
          setTimeout(() => beepRef.current?.play(), 300);
          setTimeout(() => beepRef.current?.play(), 600);
        }
      }
    };

    tick();
    restTimerRef.current = setInterval(tick, 500);
    document.addEventListener('visibilitychange', tick);
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [isResting, isSessionPaused, soundEnabled, beepRef]);

  return { isResting, restTimeLeft, startRest, stopRest };
}
