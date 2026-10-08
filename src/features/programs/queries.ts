import { queryOptions } from '@tanstack/react-query';
import { getWorkoutPrograms } from './api';

export const programKeys = {
  list: ['workout-programs'] as const,
};

export const programQueries = {
  list: () => queryOptions({ queryKey: programKeys.list, queryFn: getWorkoutPrograms }),
};
