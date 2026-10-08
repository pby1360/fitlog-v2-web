import { queryOptions } from '@tanstack/react-query';
import { getMyProfile } from './api';

export const profileKeys = {
  me: ['members', 'me'] as const,
};

export const profileQueries = {
  me: () => queryOptions({ queryKey: profileKeys.me, queryFn: getMyProfile }),
};
