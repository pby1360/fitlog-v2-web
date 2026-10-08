import { useState } from 'react';
import type { WorkoutResponse } from '@/features/exercises';
import { toDraftExercises } from '../lib/programDraft';
import type { DraftExercise, DraftSet, ProgramResponse } from '../types';

const DEFAULT_REPS = 10;
const DEFAULT_REST_TIME = 60;

// 프로그램 생성·수정 위저드의 입력 상태. program 을 주면 그 값으로 시작한다.
export function useProgramDraft(program: ProgramResponse | null) {
  const [name, setName] = useState(program?.name ?? '');
  const [description, setDescription] = useState(program?.description ?? '');
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>(
    program ? program.parts.map(part => part.workoutPartName) : []
  );
  const [exercises, setExercises] = useState<DraftExercise[]>(program ? toDraftExercises(program) : []);

  const toggleBodyPart = (bodyPartName: string) => {
    setSelectedBodyParts(prev =>
      prev.includes(bodyPartName) ? prev.filter(bp => bp !== bodyPartName) : [...prev, bodyPartName]
    );
  };

  const addExercise = (workout: WorkoutResponse) => {
    const now = Date.now().toString();
    setExercises(prev => [
      ...prev,
      { id: now, exerciseId: workout.id, sets: [{ id: now + '_1', reps: DEFAULT_REPS, restTime: DEFAULT_REST_TIME }] },
    ]);
  };

  const removeExercise = (draftId: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== draftId));
  };

  const updateSets = (draftId: string, update: (sets: DraftSet[]) => DraftSet[]) => {
    setExercises(prev => prev.map(ex => (ex.id === draftId ? { ...ex, sets: update(ex.sets) } : ex)));
  };

  // 새 세트는 직전 세트의 값을 이어받는다
  const addSet = (draftId: string) =>
    updateSets(draftId, sets => {
      const lastSet = sets.length > 0 ? sets[sets.length - 1] : null;
      return [
        ...sets,
        {
          id: Date.now().toString() + '_' + (sets.length + 1),
          reps: lastSet ? lastSet.reps : DEFAULT_REPS,
          weight: lastSet ? lastSet.weight : undefined,
          restTime: lastSet ? lastSet.restTime : DEFAULT_REST_TIME,
        },
      ];
    });

  const removeSet = (draftId: string, setId: string) =>
    updateSets(draftId, sets => sets.filter(set => set.id !== setId));

  const updateSet = <K extends keyof DraftSet>(draftId: string, setId: string, field: K, value: DraftSet[K]) =>
    updateSets(draftId, sets => sets.map(set => (set.id === setId ? { ...set, [field]: value } : set)));

  return {
    name,
    setName,
    description,
    setDescription,
    selectedBodyParts,
    toggleBodyPart,
    exercises,
    setExercises,
    addExercise,
    removeExercise,
    addSet,
    removeSet,
    updateSet,
  };
}

export type ProgramDraft = ReturnType<typeof useProgramDraft>;
