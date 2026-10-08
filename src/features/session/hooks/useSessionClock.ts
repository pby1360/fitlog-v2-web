import { useCallback, useEffect, useRef, useState } from 'react';
import { markExerciseStarted } from '../api';
import { initialTotalTime } from '../lib/sessionModel';
import {
  clearPauseSnapshot,
  loadExerciseStartTime,
  saveExerciseStartTime,
  savePauseSnapshot,
} from '../lib/timerStorage';
import type { WorkoutSession, WorkoutSessionResponse } from '../types';

// 현재 운동의 시작 시각. 우선순위: localStorage(보정값, 같은 기기) > 서버 startedAt(다른 기기) > 세션 시작 시각
const resolveExerciseStart = (session: WorkoutSession, exerciseIndex: number) =>
  loadExerciseStartTime(session.id, exerciseIndex)
  ?? session.exercises[exerciseIndex]?.startedAt
  ?? session.startTime;

// 전체 운동 시간과 현재 운동 시간을 1초마다 계산한다. 일시정지 시간은 빼고 센다.
export function useSessionClock(session: WorkoutSession | null) {
  const [totalTime, setTotalTime] = useState(0);
  const [elapsedExerciseTime, setElapsedExerciseTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const exerciseStartTimeRef = useRef(0);
  const prevExerciseIndexRef = useRef<number | undefined>(undefined);
  const pauseStartMsRef = useRef<number | null>(null);
  const localTotalPausedMsRef = useRef(0);

  // 상태(진행·일시정지)나 현재 운동이 바뀔 때만 다시 설정한다
  useEffect(() => {
    if (!session || session.status !== 'IN_PROGRESS') {
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }

    const { currentExerciseIndex, startTime } = session;
    const prevIndex = prevExerciseIndexRef.current;

    if (prevIndex === undefined) {
      // 초기 페이지 로드
      const saved = loadExerciseStartTime(session.id, currentExerciseIndex);
      const serverStartedAt = session.exercises[currentExerciseIndex]?.startedAt;
      if (saved !== null) {
        exerciseStartTimeRef.current = saved;
      } else if (serverStartedAt) {
        exerciseStartTimeRef.current = serverStartedAt;
      } else {
        exerciseStartTimeRef.current = startTime;
        // 서버에 운동 시작 시각 최초 기록
        const exercise = session.exercises[currentExerciseIndex];
        if (exercise) {
          markExerciseStarted(session.id, exercise.id, startTime)
            .catch(err => console.error('Failed to mark exercise started:', err));
        }
      }
    } else if (prevIndex !== currentExerciseIndex) {
      // 운동 전환(건너뛰기 or 세트 완료 후 다음 운동): 현재 시각으로 초기화 후 저장
      const now = Date.now();
      exerciseStartTimeRef.current = now;
      saveExerciseStartTime(session.id, currentExerciseIndex, now);
      setElapsedExerciseTime(0);
      // 서버에 운동 시작 시각 기록 (다른 기기 접속 시 복원용)
      const exercise = session.exercises[currentExerciseIndex];
      if (exercise) {
        markExerciseStarted(session.id, exercise.id, now)
          .catch(err => console.error('Failed to mark exercise started:', err));
      }
    }
    // status만 변경(일시정지 후 재개 등): exerciseStartTimeRef 유지

    prevExerciseIndexRef.current = currentExerciseIndex;

    const tick = () => {
      const now = Date.now();
      setTotalTime(Math.max(0, Math.floor((now - startTime - localTotalPausedMsRef.current) / 1000)));
      setElapsedExerciseTime(Math.max(0, Math.floor((now - exerciseStartTimeRef.current) / 1000)));
    };
    tick(); // 첫 tick까지 1초 대기로 인한 점프 방지: 즉시 한 번 갱신
    timerRef.current = setInterval(tick, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.status, session?.currentExerciseIndex]);

  // 서버에서 세션을 처음 불러왔을 때
  const initialize = useCallback((loaded: WorkoutSession, response: WorkoutSessionResponse) => {
    localTotalPausedMsRef.current = (response.totalPausedSeconds || 0) * 1000;
    setTotalTime(initialTotalTime(response));

    // 일시정지 상태로 새로고침: 타이머가 안 돌아 운동 시간이 0으로 보이는 문제 보정
    if (loaded.status === 'PAUSED' && loaded.lastPausedAt) {
      const exStart = resolveExerciseStart(loaded, loaded.currentExerciseIndex);
      exerciseStartTimeRef.current = exStart;
      setElapsedExerciseTime(Math.max(0, Math.floor((loaded.lastPausedAt - exStart) / 1000)));
    }
  }, []);

  // 일시정지 요청 직전. 새로고침 후 lastPausedAt 이 없을 때를 대비해 현재 시간을 저장한다
  const beginPause = (sessionId: number) => {
    pauseStartMsRef.current = Date.now();
    savePauseSnapshot(sessionId, totalTime);
  };

  const cancelPause = () => {
    pauseStartMsRef.current = null;
  };

  // 재개 성공 후: 멈춰 있던 시간만큼 기준 시각을 뒤로 민다
  const applyResume = (before: WorkoutSession, resumed: WorkoutSessionResponse) => {
    // 일시정지 시간 계산: 서버 diff 우선, 클라이언트 타임스탬프 fallback
    const serverPauseDurationMs =
      ((resumed.totalPausedSeconds || 0) - (before.totalPausedSeconds || 0)) * 1000;
    const pauseDurationMs =
      serverPauseDurationMs > 0
        ? serverPauseDurationMs
        : pauseStartMsRef.current !== null
          ? Date.now() - pauseStartMsRef.current
          : before.lastPausedAt !== undefined
            ? Date.now() - before.lastPausedAt
            : 0;

    // 새로고침 후 exerciseStartTimeRef가 0(미초기화)이면 올바른 기준 시각으로 복원
    if (exerciseStartTimeRef.current === 0) {
      exerciseStartTimeRef.current = resolveExerciseStart(before, before.currentExerciseIndex);
    }

    exerciseStartTimeRef.current += pauseDurationMs;
    saveExerciseStartTime(before.id, before.currentExerciseIndex, exerciseStartTimeRef.current);
    const exercise = before.exercises[before.currentExerciseIndex];
    if (exercise) {
      markExerciseStarted(before.id, exercise.id, exerciseStartTimeRef.current)
        .catch(err => console.error('Failed to sync exercise start time:', err));
    }
    localTotalPausedMsRef.current += pauseDurationMs;
    pauseStartMsRef.current = null;
    clearPauseSnapshot();
  };

  return { totalTime, elapsedExerciseTime, initialize, beginPause, cancelPause, applyResume };
}
