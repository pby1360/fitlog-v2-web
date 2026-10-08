import type { WorkoutResponse } from '../types';

// 이름 또는 부위로 검색한 뒤 부위별로 묶는다
export const filterAndGroupWorkouts = (workouts: WorkoutResponse[], keyword: string) => {
  const lower = keyword.toLowerCase();
  const filtered = workouts.filter(w =>
    w.name.toLowerCase().includes(lower) ||
    w.bodyPart.toLowerCase().includes(lower)
  );
  return filtered.reduce<Record<string, WorkoutResponse[]>>((acc, w) => {
    if (!acc[w.bodyPart]) acc[w.bodyPart] = [];
    acc[w.bodyPart].push(w);
    return acc;
  }, {});
};
