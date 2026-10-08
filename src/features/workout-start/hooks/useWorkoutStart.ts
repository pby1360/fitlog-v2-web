import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { exerciseQueries } from '@/features/exercises';
import { programQueries } from '@/features/programs';
import { sessionQueries, startWorkoutSession } from '@/features/session';
import { ApiError } from '@/shared/api/client';
import { describeError } from '@/shared/lib/errorMessage';
import { toCustomExercises, toStartPrograms } from '../lib/startProgram';
import type { StartExercise, StartProgram } from '../types';

// 운동 시작 화면 데이터. 진행 중인 세션이 있으면 세션 화면으로 보낸다.
// onLoaded 는 프로그램 목록을 처음 받았을 때 한 번 호출된다 (특정 프로그램으로 바로 진입할 때 사용)
export function useWorkoutStart(onLoaded?: (programs: StartProgram[]) => void) {
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  // 진행 중인 세션이 없을 때만 프로그램·운동 목록을 불러온다
  const latestQuery = useQuery(sessionQueries.latest());
  const noActiveSession = latestQuery.isSuccess && !latestQuery.data;
  const programsQuery = useQuery({ ...programQueries.list(), enabled: noActiveSession });
  const workoutsQuery = useQuery({ ...exerciseQueries.workouts(), enabled: noActiveSession });

  useEffect(() => {
    if (latestQuery.data) navigate('/workout/session');
  }, [latestQuery.data, navigate]);

  const loadFailure = latestQuery.error ?? programsQuery.error ?? workoutsQuery.error;
  useEffect(() => {
    if (loadFailure) console.error('Failed to initialize workout page:', loadFailure);
  }, [loadFailure]);
  const loadError = loadFailure ? describeError('운동 프로그램 불러오기', loadFailure) : null;

  const programs = useMemo(
    () => (programsQuery.data && workoutsQuery.data ? toStartPrograms(programsQuery.data, workoutsQuery.data) : []),
    [programsQuery.data, workoutsQuery.data],
  );
  const isLoading = !loadError && (!noActiveSession || programsQuery.isPending || workoutsQuery.isPending);

  const loadedRef = useRef(false);
  useEffect(() => {
    if (isLoading || loadError || loadedRef.current) return;
    loadedRef.current = true;
    onLoaded?.(programs);
    // onLoaded 는 첫 로딩 때만 쓰므로 의존성에서 제외한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, loadError, programs]);

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
    allWorkouts: workoutsQuery.data ?? [],
    isLoading,
    loadError,
    isStarting,
    startError,
    clearStartError: () => setStartError(null),
    startWorkout,
  };
}
