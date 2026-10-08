import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkouts, type PendingSet, type WorkoutResponse } from '@/features/exercises';
import { describeError } from '@/shared/lib/errorMessage';
import {
  addExerciseToWorkoutSession,
  addSetToWorkoutSessionExercise,
  completeWorkoutSessionSet,
  endWorkoutSession,
  getLatestWorkoutSession,
  pauseWorkoutSession,
  reorderWorkoutSessionExercises,
  resumeWorkoutSession,
  skipWorkoutSessionExercise,
} from '../api';
import { getRemainingIndexes, toWorkoutSession } from '../lib/sessionModel';
import type { CustomExerciseDto, WorkoutSession, WorkoutSessionResponse } from '../types';
import { useRestTimer } from './useRestTimer';
import { useSessionClock } from './useSessionClock';

interface Options {
  soundEnabled: boolean;
  // 마지막 세트를 마치거나 "완료"를 눌러 세션이 끝났을 때
  onWorkoutCompleted: () => void;
}

// 진행 중인 운동 세션: 서버 상태, 타이머, 사용자 조작
export function useWorkoutSession({ soundEnabled, onWorkoutCompleted }: Options) {
  const navigate = useNavigate();
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession | null>(null);
  const [allExercises, setAllExercises] = useState<WorkoutResponse[]>([]);
  const [isCompletingSet, setIsCompletingSet] = useState(false);
  const [isAddingSet, setIsAddingSet] = useState(false);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  // 사용자 조작(저장·일시정지·종료 등) 실패를 화면에 알린다. 콘솔에만 남기면 기록이 저장되지 않은 걸 모른다.
  const [actionError, setActionError] = useState<string | null>(null);

  const clock = useSessionClock(workoutSession);
  const rest = useRestTimer(workoutSession?.status === 'PAUSED', soundEnabled);
  const { initialize } = clock;

  const reportActionError = (action: string, error: unknown) => {
    console.error(`Failed: ${action}`, error);
    setActionError(describeError(action, error));
  };

  const applyResponse = (response: WorkoutSessionResponse) => {
    setWorkoutSession(toWorkoutSession(response, allExercises));
  };

  // 진행 중인 세션이 없으면 운동 선택 화면으로 돌아간다
  useEffect(() => {
    const load = async () => {
      try {
        const [session, workouts] = await Promise.all([getLatestWorkoutSession(), getWorkouts()]);
        if (!session) {
          navigate('/workout');
          return;
        }
        setAllExercises(workouts);
        const loaded = toWorkoutSession(session, workouts);
        initialize(loaded, session);
        setWorkoutSession(loaded);
      } catch (error) {
        console.error("Failed to fetch session or workouts:", error);
        navigate('/workout');
      }
    };
    load();
  }, [navigate, initialize]);

  const pause = async () => {
    if (!workoutSession) return;
    clock.beginPause(workoutSession.id);
    try {
      applyResponse(await pauseWorkoutSession(workoutSession.id));
    } catch (error) {
      reportActionError('일시정지', error);
      clock.cancelPause();
    }
  };

  const resume = async () => {
    if (!workoutSession) return;
    try {
      const updated = await resumeWorkoutSession(workoutSession.id);
      clock.applyResume(workoutSession, updated);
      applyResponse(updated);
    } catch (error) {
      reportActionError('운동 재개', error);
    }
  };

  const complete = async () => {
    if (!workoutSession) return;
    try {
      applyResponse(await endWorkoutSession(workoutSession.id, 'COMPLETED'));
      onWorkoutCompleted();
    } catch (error) {
      reportActionError('운동 완료', error);
    }
  };

  // 기록을 남기지 않고 끝낸다
  const stop = async () => {
    if (!workoutSession) return;
    try {
      await endWorkoutSession(workoutSession.id, 'CANCELLED');
      navigate('/workout');
    } catch (error) {
      reportActionError('운동 종료', error);
    }
  };

  const completeSet = async (actualReps?: number, actualWeight?: number, actualMemo?: string) => {
    if (!workoutSession) return;
    const currentExercise = workoutSession.exercises[workoutSession.currentExerciseIndex];
    const currentSet = currentExercise.sets[workoutSession.currentSetIndex];
    if (!currentSet) return;

    setIsCompletingSet(true);
    try {
      const updated = await completeWorkoutSessionSet(
        workoutSession.id,
        currentExercise.id,
        currentSet.id,
        actualWeight,
        actualReps,
        actualMemo
      );
      applyResponse(updated);

      if (updated.status !== 'COMPLETED') {
        rest.startRest(currentSet.restTime);
      } else {
        onWorkoutCompleted();
      }
    } catch (error) {
      reportActionError('세트 기록 저장', error);
    } finally {
      setIsCompletingSet(false);
    }
  };

  // 현재 운동에 직전 세트와 같은 값으로 세트를 하나 더 붙인다
  const addSet = async () => {
    if (!workoutSession) return;
    const currentExercise = workoutSession.exercises[workoutSession.currentExerciseIndex];
    if (!currentExercise) return;

    const lastSet = currentExercise.sets.length > 0
      ? currentExercise.sets[currentExercise.sets.length - 1]
      : null;

    setIsAddingSet(true);
    try {
      applyResponse(await addSetToWorkoutSessionExercise(workoutSession.id, currentExercise.id, {
        weight: lastSet ? lastSet.weight : undefined,
        reps: lastSet ? lastSet.reps : 10,
        restTime: lastSet ? lastSet.restTime : 60,
      }));
    } catch (error) {
      reportActionError('세트 추가', error);
    } finally {
      setIsAddingSet(false);
    }
  };

  // 성공하면 true (호출 측은 그때 모달을 닫는다)
  const addExercise = async (workout: WorkoutResponse, sets: PendingSet[]) => {
    if (!workoutSession) return false;
    setIsAddingExercise(true);
    try {
      const exercise: CustomExerciseDto = {
        workoutId: workout.id,
        order: workoutSession.exercises.length + 1,
        sets: sets.map((s, i) => ({
          setNumber: i + 1,
          weight: s.weight || undefined,
          reps: s.reps,
          restTime: s.restTime,
        })),
      };
      applyResponse(await addExerciseToWorkoutSession(workoutSession.id, exercise));
      return true;
    } catch (error) {
      reportActionError('운동 추가', error);
      return false;
    } finally {
      setIsAddingExercise(false);
    }
  };

  // 남은 운동끼리만 자리를 바꾼다. 현재 운동의 위치는 그대로라 진행 중인 운동·타이머에 영향이 없다.
  const moveRemainingExercise = async (exerciseIndex: number, direction: -1 | 1) => {
    if (!workoutSession || isReordering) return;
    const remaining = getRemainingIndexes(workoutSession);
    const pos = remaining.indexOf(exerciseIndex);
    const targetPos = pos + direction;
    if (pos === -1 || targetPos < 0 || targetPos >= remaining.length) return;

    const reordered = [...workoutSession.exercises];
    const targetIndex = remaining[targetPos];
    [reordered[exerciseIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[exerciseIndex]];

    setIsReordering(true);
    try {
      applyResponse(await reorderWorkoutSessionExercises(
        workoutSession.id,
        reordered.map((ex, i) => ({ workoutSessionExerciseId: ex.id, order: i + 1 }))
      ));
    } catch (error) {
      reportActionError('운동 순서 변경', error);
    } finally {
      setIsReordering(false);
    }
  };

  const skipExercise = async () => {
    if (!workoutSession) return;
    const currentExercise = workoutSession.exercises[workoutSession.currentExerciseIndex];
    if (!currentExercise) return;

    try {
      const updated = await skipWorkoutSessionExercise(workoutSession.id, currentExercise.id, true);
      rest.stopRest();
      applyResponse(updated);
    } catch (error) {
      reportActionError('운동 건너뛰기', error);
    }
  };

  return {
    workoutSession,
    allExercises,
    totalTime: clock.totalTime,
    elapsedExerciseTime: clock.elapsedExerciseTime,
    isResting: rest.isResting,
    restTimeLeft: rest.restTimeLeft,
    stopRest: rest.stopRest,
    isCompletingSet,
    isAddingSet,
    isAddingExercise,
    isReordering,
    actionError,
    clearActionError: () => setActionError(null),
    pause,
    resume,
    complete,
    stop,
    completeSet,
    addSet,
    addExercise,
    moveRemainingExercise,
    skipExercise,
  };
}
