import { API_BASE_URL, fetchWithAuth } from '@/shared/api/client';
import type { WorkoutPartResponse, WorkoutResponse } from './types';

export const getWorkoutParts = async (): Promise<WorkoutPartResponse[]> => {
  return fetchWithAuth(`${API_BASE_URL}/workout/parts`);
};

export const addWorkoutPart = async (name: string): Promise<void> => {
  return fetchWithAuth(`${API_BASE_URL}/workout/parts`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
};

export const updateWorkoutPart = async (id: number, name: string): Promise<void> => {
  return fetchWithAuth(`${API_BASE_URL}/workout/parts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });
};

export const deleteWorkoutPart = async (id: number): Promise<void> => {
  return fetchWithAuth(`${API_BASE_URL}/workout/parts/${id}`, {
    method: 'DELETE',
  });
};

export const getWorkouts = async (): Promise<WorkoutResponse[]> => {
  return fetchWithAuth(`${API_BASE_URL}/workout/workouts`);
};

export const addWorkout = async (name: string, workoutPartId: number): Promise<void> => {
  return fetchWithAuth(`${API_BASE_URL}/workout/workouts`, {
    method: 'POST',
    body: JSON.stringify({ name, workoutPartId }),
  });
};

export const updateWorkout = async (id: number, name: string, workoutPartId: number): Promise<void> => {
  return fetchWithAuth(`${API_BASE_URL}/workout/workouts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, workoutPartId }),
  });
};

export const deleteWorkout = async (id: number): Promise<void> => {
  return fetchWithAuth(`${API_BASE_URL}/workout/workouts/${id}`, {
    method: 'DELETE',
  });
};
