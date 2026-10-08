import { queryOptions } from '@tanstack/react-query';
import { getWorkoutParts, getWorkouts } from './api';

export const exerciseKeys = {
  parts: ['workout-parts'] as const,
  workouts: ['workouts'] as const,
};

export const exerciseQueries = {
  parts: () => queryOptions({ queryKey: exerciseKeys.parts, queryFn: getWorkoutParts }),
  workouts: () => queryOptions({ queryKey: exerciseKeys.workouts, queryFn: getWorkouts }),
};
