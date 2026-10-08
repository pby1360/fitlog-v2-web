import type { WorkoutResponse } from '@/features/exercises';
import { completionRate } from '@/shared/lib/format';
import { loadPauseSnapshot } from './timerStorage';
import type { WorkoutSession, WorkoutSessionResponse } from '../types';

// 건너뛴 운동을 제외하고 첫 미완료 세트를 찾는다. 모두 끝났으면 마지막 운동의 마지막 세트
const findFirstIncomplete = (session: WorkoutSessionResponse) => {
  if (!session.exercises || session.exercises.length === 0) {
    return { exerciseIndex: 0, setIndex: 0 };
  }

  for (let i = 0; i < session.exercises.length; i++) {
    const exercise = session.exercises[i];
    if (exercise.skipped) continue;
    if (exercise.sets && exercise.sets.length > 0) {
      const setIndex = exercise.sets.findIndex(s => !s.completed);
      if (setIndex !== -1) {
        return { exerciseIndex: i, setIndex };
      }
    }
  }

  const lastExIndex = session.exercises.length - 1;
  const lastExercise = session.exercises[lastExIndex];
  const lastSetIndex = (lastExercise?.sets?.length ?? 0) > 0 ? lastExercise.sets.length - 1 : 0;
  return { exerciseIndex: lastExIndex, setIndex: lastSetIndex };
};

// API 응답을 화면 모델로 바꾼다. 부위 이름이 없으면 운동 카탈로그에서 찾는다
export const toWorkoutSession = (session: WorkoutSessionResponse, allWorkouts: WorkoutResponse[]): WorkoutSession => {
  const { exerciseIndex, setIndex } = findFirstIncomplete(session);

  return {
    id: session.id,
    programId: session.workoutProgramId,
    programName: session.workoutProgramName,
    startTime: new Date(session.startTime).getTime(),
    currentExerciseIndex: exerciseIndex,
    currentSetIndex: setIndex,
    status: session.status,
    exercises: session.exercises.map(ex => ({
      id: ex.id,
      exerciseId: ex.workoutId,
      workoutName: ex.workoutName,
      workoutPartName: ex.bodyPart || allWorkouts.find(w => w.id === ex.workoutId)?.bodyPart || '',
      skipped: ex.skipped ?? false,
      startedAt: ex.startedAt ? new Date(ex.startedAt).getTime() : undefined,
      sets: ex.sets.map(set => ({
        id: set.id,
        reps: set.reps,
        weight: set.weight,
        restTime: set.restTime,
        memo: set.memo,
        completed: set.completed,
        actualReps: set.actualReps,
        actualWeight: set.actualWeight,
        actualMemo: set.actualMemo,
        completedAt: set.completedAt ? new Date(set.completedAt).getTime() : undefined,
      })),
      completed: ex.sets.every(s => s.completed),
    })),
    totalPausedSeconds: session.totalPausedSeconds || 0,
    lastPausedAt: session.lastPausedAt ? new Date(session.lastPausedAt).getTime() : undefined,
  };
};

// 화면을 처음 열 때의 전체 운동 시간(초). 일시정지 중이면 멈춘 시점 기준
export const initialTotalTime = (session: WorkoutSessionResponse) => {
  const sessionStartMs = new Date(session.startTime).getTime();
  const totalPausedMs = (session.totalPausedSeconds || 0) * 1000;
  if (session.status === 'PAUSED') {
    // 1순위: 서버의 lastPausedAt
    if (session.lastPausedAt) {
      const pauseStartMs = new Date(session.lastPausedAt).getTime();
      return Math.max(0, Math.floor((pauseStartMs - sessionStartMs - totalPausedMs) / 1000));
    }
    // 2순위: 일시정지 직전 저장한 localStorage 스냅샷
    const snapshot = loadPauseSnapshot(session.id);
    if (snapshot !== null) return snapshot;
  }
  return Math.max(0, Math.floor((Date.now() - sessionStartMs - totalPausedMs) / 1000));
};

// 남은 운동: 현재 운동·완료·건너뛴 운동을 제외한 것. 현재 운동이 첫 미완료 운동이므로 모두 현재 운동 뒤에 있다.
export const getRemainingIndexes = (session: WorkoutSession) =>
  session.exercises
    .map((ex, i) => ({ ex, i }))
    .filter(({ ex, i }) => i !== session.currentExerciseIndex && !ex.completed && !ex.skipped)
    .map(({ i }) => i);

export const getSessionProgress = (session: WorkoutSession) => {
  const totalSets = session.exercises.reduce((total, ex) => total + ex.sets.length, 0);
  const completedSets = session.exercises.reduce((total, ex) =>
    total + ex.sets.filter(set => set.completed).length, 0);
  return completionRate(completedSets, totalSets);
};

// 진행 중·일시정지 상태에서만 남은 운동 순서를 바꿀 수 있다
export const isActiveStatus = (status: WorkoutSession['status']) => status === 'IN_PROGRESS' || status === 'PAUSED';
