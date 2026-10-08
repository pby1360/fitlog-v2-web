import type { WorkoutResponse } from '@/features/exercises';
import type { DraftExercise, ProgramResponse, SaveProgramRequest, WorkoutPartDto } from '../types';

// 서버의 부위별 구조를 편집용 평탄한 목록으로 바꾼다 (서버 ID를 임시 ID로 사용)
export const toDraftExercises = (program: ProgramResponse): DraftExercise[] =>
  program.parts.flatMap(part =>
    part.exercises.map(exercise => ({
      id: exercise.id.toString(),
      exerciseId: exercise.workoutId,
      sets: exercise.sets.map(set => ({
        id: set.id.toString(),
        reps: set.reps,
        weight: set.weight,
        restTime: set.restTime,
        memo: set.memo,
      })),
    }))
  );

// 편집 목록을 저장 요청(부위별 parts)으로 묶는다. 카탈로그에 없는 운동은 제외한다.
export const toSaveProgramRequest = (
  name: string,
  description: string,
  exercises: DraftExercise[],
  catalog: WorkoutResponse[],
): SaveProgramRequest => {
  const partsMap = new Map<number, WorkoutPartDto>();

  exercises.forEach((draft) => {
    const exerciseInfo = catalog.find(ex => ex.id === draft.exerciseId);
    if (!exerciseInfo) return;

    const partId = exerciseInfo.bodyPartId;
    if (!partsMap.has(partId)) {
      partsMap.set(partId, { workoutPartId: partId, exercises: [] });
    }

    partsMap.get(partId)!.exercises.push({
      workoutId: exerciseInfo.id,
      sets: draft.sets.map((set, setIndex) => ({
        setNumber: setIndex + 1,
        reps: set.reps,
        weight: set.weight,
        restTime: set.restTime,
        memo: set.memo,
      })),
    });
  });

  return {
    name: name.trim(),
    description: description.trim(),
    parts: Array.from(partsMap.values()),
  };
};

export const countExercises = (program: ProgramResponse) =>
  program.parts.reduce((total, part) => total + part.exercises.length, 0);

export const countSets = (program: ProgramResponse) =>
  program.parts.reduce((total, part) =>
    total + part.exercises.reduce((exTotal, ex) => exTotal + ex.sets.length, 0)
  , 0);
