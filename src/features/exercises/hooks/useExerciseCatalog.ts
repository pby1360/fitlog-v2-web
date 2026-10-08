import { useEffect, useState } from 'react';
import { describeError } from '@/shared/lib/errorMessage';
import {
  addWorkout,
  addWorkoutPart,
  deleteWorkout,
  deleteWorkoutPart,
  getWorkoutParts,
  getWorkouts,
  updateWorkout,
} from '../api';
import type { WorkoutPartResponse, WorkoutResponse } from '../types';

// 운동 부위·종목 목록과 CRUD. 변경 후에는 목록을 다시 불러온다.
export function useExerciseCatalog() {
  const [bodyParts, setBodyParts] = useState<WorkoutPartResponse[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // 마지막 변경 실패 메시지 (화면에 표시)
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getWorkoutParts(), getWorkouts()])
      .then(([parts, list]) => {
        setBodyParts(parts);
        setWorkouts(list);
      })
      .catch((error) => console.error('운동 목록을 불러오는 데 실패했습니다:', error))
      .finally(() => setIsLoading(false));
  }, []);

  const reloadBodyParts = async () => {
    try {
      setBodyParts(await getWorkoutParts());
    } catch (error) {
      console.error('운동 부위를 불러오는 데 실패했습니다:', error);
    }
  };

  const reloadWorkouts = async () => {
    try {
      setWorkouts(await getWorkouts());
    } catch (error) {
      console.error('운동 목록을 불러오는 데 실패했습니다:', error);
    }
  };

  // 실패하면 error 에 메시지를 남기고 false 를 돌려준다 (호출 측은 성공했을 때만 모달을 닫는다)
  const run = async (action: () => Promise<void>, actionName: string) => {
    setError(null);
    try {
      await action();
      return true;
    } catch (err) {
      console.error(`Failed: ${actionName}`, err);
      setError(describeError(actionName, err));
      return false;
    }
  };

  const addBodyPart = (name: string) =>
    run(async () => {
      await addWorkoutPart(name);
      await reloadBodyParts();
    }, '운동 부위 추가');

  const removeBodyPart = (id: number) =>
    run(async () => {
      await deleteWorkoutPart(id);
      await reloadBodyParts();
      await reloadWorkouts();
    }, '운동 부위 삭제');

  const addExercise = (name: string, bodyPartId: number) =>
    run(async () => {
      await addWorkout(name, bodyPartId);
      await reloadWorkouts();
    }, '운동 추가');

  const updateExercise = (id: number, name: string, bodyPartId: number) =>
    run(async () => {
      await updateWorkout(id, name, bodyPartId);
      await reloadWorkouts();
    }, '운동 수정');

  const removeExercise = (id: number) =>
    run(async () => {
      await deleteWorkout(id);
      await reloadWorkouts();
    }, '운동 삭제');

  return {
    bodyParts,
    workouts,
    isLoading,
    error,
    clearError: () => setError(null),
    addBodyPart,
    removeBodyPart,
    addExercise,
    updateExercise,
    removeExercise,
  };
}

export type ExerciseCatalog = ReturnType<typeof useExerciseCatalog>;
