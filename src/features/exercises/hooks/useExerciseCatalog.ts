import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { describeError } from '@/shared/lib/errorMessage';
import {
  addWorkout,
  addWorkoutPart,
  deleteWorkout,
  deleteWorkoutPart,
  updateWorkout,
} from '../api';
import { exerciseKeys, exerciseQueries } from '../queries';

// 운동 부위·종목 목록과 CRUD. 변경 후에는 목록 캐시를 무효화해 다시 불러온다.
export function useExerciseCatalog() {
  const queryClient = useQueryClient();
  const partsQuery = useQuery(exerciseQueries.parts());
  const workoutsQuery = useQuery(exerciseQueries.workouts());
  // 마지막 변경 실패 메시지 (화면에 표시)
  const [error, setError] = useState<string | null>(null);

  const refreshParts = () => queryClient.invalidateQueries({ queryKey: exerciseKeys.parts });
  const refreshWorkouts = () => queryClient.invalidateQueries({ queryKey: exerciseKeys.workouts });

  // 실패하면 error 에 메시지를 남기고 false 를 돌려준다 (호출 측은 성공했을 때만 모달을 닫는다)
  const run = async (action: () => Promise<unknown>, actionName: string) => {
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
      await refreshParts();
    }, '운동 부위 추가');

  // 부위를 지우면 그 부위의 운동도 바뀌므로 둘 다 다시 불러온다
  const removeBodyPart = (id: number) =>
    run(async () => {
      await deleteWorkoutPart(id);
      await Promise.all([refreshParts(), refreshWorkouts()]);
    }, '운동 부위 삭제');

  const addExercise = (name: string, bodyPartId: number) =>
    run(async () => {
      await addWorkout(name, bodyPartId);
      await refreshWorkouts();
    }, '운동 추가');

  const updateExercise = (id: number, name: string, bodyPartId: number) =>
    run(async () => {
      await updateWorkout(id, name, bodyPartId);
      await refreshWorkouts();
    }, '운동 수정');

  const removeExercise = (id: number) =>
    run(async () => {
      await deleteWorkout(id);
      await refreshWorkouts();
    }, '운동 삭제');

  return {
    bodyParts: partsQuery.data ?? [],
    workouts: workoutsQuery.data ?? [],
    isLoading: partsQuery.isPending || workoutsQuery.isPending,
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
