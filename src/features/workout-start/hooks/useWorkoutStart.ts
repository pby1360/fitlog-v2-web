import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkouts, type WorkoutResponse } from '@/features/exercises';
import { getWorkoutPrograms } from '@/features/programs';
import { getLatestWorkoutSession, startWorkoutSession } from '@/features/session';
import { ApiError } from '@/shared/api/client';
import { describeError } from '@/shared/lib/errorMessage';
import { toCustomExercises, toStartPrograms } from '../lib/startProgram';
import type { StartExercise, StartProgram } from '../types';

// 운동 시작 화면 데이터. 진행 중인 세션이 있으면 세션 화면으로 보낸다.
// onLoaded 는 프로그램 목록을 받은 직후 한 번 호출된다 (특정 프로그램으로 바로 진입할 때 사용)
export function useWorkoutStart(onLoaded?: (programs: StartProgram[]) => void) {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<StartProgram[]>([]);
  const [allWorkouts, setAllWorkouts] = useState<WorkoutResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        const activeSession = await getLatestWorkoutSession();
        if (activeSession) {
          navigate('/workout/session');
          return;
        }

        const [fetchedPrograms, fetchedWorkouts] = await Promise.all([getWorkoutPrograms(), getWorkouts()]);
        const startPrograms = toStartPrograms(fetchedPrograms, fetchedWorkouts);
        setAllWorkouts(fetchedWorkouts);
        setPrograms(startPrograms);
        onLoaded?.(startPrograms);
      } catch (error) {
        console.error("Failed to initialize workout page:", error);
        setLoadError(describeError('운동 프로그램 불러오기', error));
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
    // onLoaded 는 첫 로딩 때만 쓰므로 의존성에서 제외한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const startWorkout = async (programId: number, exercises: StartExercise[]) => {
    setIsStarting(true);
    setStartError(null);
    try {
      await startWorkoutSession(programId, toCustomExercises(exercises));
      navigate('/workout/session');
    } catch (error) {
      // 이미 진행 중인 운동이 있으면(다른 탭/기기에서 시작) 그 운동으로 이동한다
      if (error instanceof ApiError && error.status === 409) {
        navigate('/workout/session');
        return;
      }
      console.error("Failed to start workout session:", error);
      setStartError(describeError('운동 시작', error));
    } finally {
      setIsStarting(false);
    }
  };

  return {
    programs,
    allWorkouts,
    isLoading,
    loadError,
    isStarting,
    startError,
    clearStartError: () => setStartError(null),
    startWorkout,
  };
}
