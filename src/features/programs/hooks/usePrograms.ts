import { useEffect, useState } from 'react';
import { describeError } from '@/shared/lib/errorMessage';
import { deleteWorkoutProgram, getWorkoutPrograms, saveWorkoutProgram, updateWorkoutProgram } from '../api';
import type { ProgramResponse, SaveProgramRequest } from '../types';

export function usePrograms() {
  const [programs, setPrograms] = useState<ProgramResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // 마지막 삭제·저장 실패 메시지 (화면에 표시)
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    try {
      setPrograms(await getWorkoutPrograms());
    } catch (error) {
      console.error('프로그램 목록을 불러오는 데 실패했습니다:', error);
      setPrograms([]);
    }
  };

  useEffect(() => {
    getWorkoutPrograms()
      .then(setPrograms)
      .catch((error) => console.error('초기 데이터를 불러오는 데 실패했습니다:', error))
      .finally(() => setIsLoading(false));
  }, []);

  const deleteProgram = async (programId: number) => {
    setError(null);
    try {
      await deleteWorkoutProgram(programId);
      await reload();
      return true;
    } catch (error) {
      console.error('프로그램 삭제 실패:', error);
      setError(describeError('프로그램 삭제', error));
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
      await reload();
      return true;
    } catch (error) {
      console.error('프로그램 저장/수정 실패:', error);
      setError(describeError(programId !== undefined ? '프로그램 수정' : '프로그램 저장', error));
      return false;
    }
  };

  return { programs, isLoading, error, clearError: () => setError(null), deleteProgram, saveProgram };
}
