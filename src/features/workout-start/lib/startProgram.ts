import type { PendingSet, WorkoutResponse } from '@/features/exercises';
import type { ProgramResponse } from '@/features/programs';
import type { CustomExerciseDto } from '@/features/session';
import type { StartExercise, StartProgram } from '../types';

// 프로그램 응답을 시작 전 편집용 평탄한 목록으로 바꾼다
export const toStartPrograms = (programs: ProgramResponse[], workouts: WorkoutResponse[]): StartProgram[] =>
  programs.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    createdAt: p.createdAt,
    exercises: p.parts.flatMap(part =>
      part.exercises.map(ex => ({
        id: `ex-${ex.id}`,
        exerciseId: ex.workoutId,
        workoutName: ex.workoutName,
        workoutPartName: workouts.find(w => w.id === ex.workoutId)?.bodyPart || '',
        sets: ex.sets.map(set => ({
          id: `set-${set.id}`,
          reps: set.reps,
          weight: set.weight,
          restTime: set.restTime,
          memo: set.memo,
        })),
      }))
    ),
  }));

// 편집 화면에서 원본을 바꾸지 않도록 세트 배열까지 복사한다
export const copyExercises = (exercises: StartExercise[]): StartExercise[] =>
  exercises.map(ex => ({ ...ex, sets: [...ex.sets] }));

// 운동 추가 모달에서 구성한 세트로 새 운동을 만든다 (무게 0 = 미입력)
export const toStartExercise = (workout: WorkoutResponse, sets: PendingSet[]): StartExercise => ({
  id: `ex-new-${Date.now()}`,
  exerciseId: workout.id,
  workoutName: workout.name,
  workoutPartName: workout.bodyPart,
  sets: sets.map((s, i) => ({
    id: `set-new-${Date.now()}-${i}`,
    reps: s.reps,
    weight: s.weight || undefined,
    restTime: s.restTime,
  })),
});

export const toCustomExercises = (exercises: StartExercise[]): CustomExerciseDto[] =>
  exercises.map((ex, index) => ({
    workoutId: ex.exerciseId,
    order: index + 1,
    sets: ex.sets.map((set, setIndex) => ({
      setNumber: setIndex + 1,
      weight: set.weight,
      reps: set.reps,
      restTime: set.restTime,
      memo: set.memo,
    })),
  }));

export const countSets = (exercises: StartExercise[]) =>
  exercises.reduce((total, ex) => total + ex.sets.length, 0);

// 세트 사이 휴식 시간 합계(분). 대략적인 소요 시간으로 보여준다
export const estimateMinutes = (exercises: StartExercise[]) =>
  Math.round(exercises.reduce((total, ex) =>
    total + ex.sets.reduce((setTotal, set) => setTotal + set.restTime, 0), 0) / 60);
