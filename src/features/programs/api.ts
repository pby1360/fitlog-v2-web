import { API_BASE_URL, fetchWithAuth } from '@/shared/api/client';
import type { ProgramResponse, SaveProgramRequest } from './types';

export const saveWorkoutProgram = async (programData: SaveProgramRequest): Promise<void> => {
  return fetchWithAuth(`${API_BASE_URL}/workout-programs`, {
    method: 'POST',
    body: JSON.stringify(programData),
  });
};

export const updateWorkoutProgram = async (programId: number, programData: SaveProgramRequest): Promise<void> => {
  return fetchWithAuth(`${API_BASE_URL}/workout-programs/${programId}`, {
    method: 'PUT',
    body: JSON.stringify(programData),
  });
};

export const deleteWorkoutProgram = async (programId: number): Promise<void> => {
  return fetchWithAuth(`${API_BASE_URL}/workout-programs/${programId}`, {
    method: 'DELETE',
  });
};

export const getWorkoutPrograms = async (): Promise<ProgramResponse[]> => {
  return fetchWithAuth(`${API_BASE_URL}/workout-programs`);
};
