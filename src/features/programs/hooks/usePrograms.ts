import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { describeError } from '@/shared/lib/errorMessage';
import { deleteWorkoutProgram, saveWorkoutProgram, updateWorkoutProgram } from '../api';
import { programKeys, programQueries } from '../queries';
import type { SaveProgramRequest } from '../types';

export function usePrograms() {
  const queryClient = useQueryClient();
  const programsQuery = useQuery(programQueries.list());
  // 마지막 삭제·저장 실패 메시지 (화면에 표시)
  const [error, setError] = useState<string | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: programKeys.list });

  const deleteProgram = async (programId: number) => {
    setError(null);
    try {
      await deleteWorkoutProgram(programId);
      await refresh();
      return true;
    } catch (err) {
      console.error('프로그램 삭제 실패:', err);
      setError(describeError('프로그램 삭제', err));
      return false;
    }
  };

  // programId 가 있으면 수정, 없으면 새로 저장
  const saveProgram = async (payload: SaveProgramRequest, programId?: number) => {
    setError(null);
    try {
      if (programId !== undefined) {
        await updateWorkoutProgram(programId, payload);
      } else {
        await saveWorkoutProgram(payload);
      }
      await refresh();
      return true;
    } catch (err) {
      console.error('프로그램 저장/수정 실패:', err);
      setError(describeError(programId !== undefined ? '프로그램 수정' : '프로그램 저장', err));
      return false;
    }
  };

  const loadError = programsQuery.error ? describeError('프로그램 목록 불러오기', programsQuery.error) : null;

  return {
    programs: programsQuery.data ?? [],
    isLoading: programsQuery.isPending,
    loadError,
    error,
    clearError: () => setError(null),
    deleteProgram,
    saveProgram,
  };
}
