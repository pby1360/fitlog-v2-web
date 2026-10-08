import { useEffect, useState } from 'react';
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

  // 실패하면 알리고 false 를 돌려준다 (호출 측은 성공했을 때만 모달을 닫는다)
  const run = async (action: () => Promise<void>, failMessage: string) => {
    try {
      await action();
      return true;
    } catch (error) {
      console.error(failMessage, error);
      alert(failMessage);
      return false;
    }
  };

  const addBodyPart = (name: string) =>
    run(async () => {
      await addWorkoutPart(name);
      await reloadBodyParts();
    }, '운동 부위 추가에 실패했습니다.');

  const removeBodyPart = (id: number) =>
    run(async () => {
      await deleteWorkoutPart(id);
      await reloadBodyParts();
      await reloadWorkouts();
    }, '운동 부위 삭제에 실패했습니다.');

  const addExercise = (name: string, bodyPartId: number) =>
    run(async () => {
      await addWorkout(name, bodyPartId);
      await reloadWorkouts();
    }, '운동 추가에 실패했습니다.');

  const updateExercise = (id: number, name: string, bodyPartId: number) =>
    run(async () => {
      await updateWorkout(id, name, bodyPartId);
      await reloadWorkouts();
    }, '운동 수정에 실패했습니다.');

  const removeExercise = (id: number) =>
    run(async () => {
      await deleteWorkout(id);
      await reloadWorkouts();
    }, '운동 삭제에 실패했습니다.');

  return {
    bodyParts,
    workouts,
    isLoading,
    addBodyPart,
    removeBodyPart,
    addExercise,
    updateExercise,
    removeExercise,
  };
}

export type ExerciseCatalog = ReturnType<typeof useExerciseCatalog>;
