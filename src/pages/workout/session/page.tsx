import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import Header from '@/components/feature/Header';
import {
  getLatestWorkoutSession,
  WorkoutSessionResponse,
  getWorkouts,
  WorkoutResponse,
  completeWorkoutSessionSet,
  pauseWorkoutSession,
  resumeWorkoutSession,
  endWorkoutSession,
  skipWorkoutSessionExercise,
  markExerciseStarted,
  addSetToWorkoutSessionExercise,
  addExerciseToWorkoutSession,
  reorderWorkoutSessionExercises,
  CustomExerciseDto
} from '@/services/api';

// UI에 맞는 상태 인터페이스 정의
interface ExerciseSetDetail {
  id: number;
  reps: number;
  weight?: number;
  restTime: number;
  memo?: string;
  completed: boolean;
  actualReps?: number;
  actualWeight?: number;
  actualMemo?: string;
  completedAt?: number; // ISO string from server, converted to timestamp
}

interface ExerciseSet {
  id: number;
  exerciseId: number;
  workoutName: string;
  workoutPartName: string;
  sets: ExerciseSetDetail[];
  completed: boolean;
  skipped: boolean;
  startedAt?: number;
}

interface WorkoutSession {
  id: number;
  programId: number;
  programName: string;
  startTime: number;
  currentExerciseIndex: number;
  currentSetIndex: number;
  totalTime: number;
  status: 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  exercises: ExerciseSet[];
  totalPausedSeconds: number;
  lastPausedAt?: number;
}

export default function WorkoutSessionPage() {
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession | null>(null);
  const [allExercises, setAllExercises] = useState<WorkoutResponse[]>([]);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isCompletingSet, setIsCompletingSet] = useState(false);
  const [isAddingSet, setIsAddingSet] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [addExerciseFilter, setAddExerciseFilter] = useState('');
  const [pendingWorkout, setPendingWorkout] = useState<WorkoutResponse | null>(null);
  const [pendingSets, setPendingSets] = useState<{ reps: number; weight: number; restTime: number }[]>([]);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  // 순서 편집 모드: reorderDraft가 null이 아니면 편집 중
  const [reorderDraft, setReorderDraft] = useState<ExerciseSet[] | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [draggedExerciseIndex, setDraggedExerciseIndex] = useState<number | null>(null);

  const [elapsedExerciseTime, setElapsedExerciseTime] = useState(0);

  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const exerciseStartTimeRef = useRef<number>(0);
  const prevExerciseIndexRef = useRef<number | undefined>(undefined);
  const pauseStartMsRef = useRef<number | null>(null);
  const localTotalPausedMsRef = useRef(0);

  const EXERCISE_START_KEY = 'exercise_start_time';
  const PAUSE_SNAPSHOT_KEY = 'pause_snapshot';

  const saveExerciseStartTime = (sessionId: number, exerciseIndex: number, time: number) => {
    localStorage.setItem(EXERCISE_START_KEY, JSON.stringify({ sessionId, exerciseIndex, time }));
  };

  const loadExerciseStartTime = (sessionId: number, exerciseIndex: number): number | null => {
    try {
      const stored = localStorage.getItem(EXERCISE_START_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (parsed.sessionId === sessionId && parsed.exerciseIndex === exerciseIndex) {
        return parsed.time;
      }
    } catch {}
    return null;
  };

  const savePauseSnapshot = (sessionId: number, totalTime: number) => {
    localStorage.setItem(PAUSE_SNAPSHOT_KEY, JSON.stringify({ sessionId, totalTime }));
  };

  const loadPauseSnapshot = (sessionId: number): number | null => {
    try {
      const stored = localStorage.getItem(PAUSE_SNAPSHOT_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (parsed.sessionId === sessionId) return parsed.totalTime;
    } catch {}
    return null;
  };

  const clearPauseSnapshot = () => {
    localStorage.removeItem(PAUSE_SNAPSHOT_KEY);
  };

  // 모든 타이머 로직을 통합 관리하는 useEffect
  useEffect(() => {
    if (!workoutSession || workoutSession.status !== 'IN_PROGRESS') {
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }

    const { currentExerciseIndex, startTime } = workoutSession;
    const prevIndex = prevExerciseIndexRef.current;

    if (prevIndex === undefined) {
      // 초기 페이지 로드
      // 우선순위: localStorage(보정값, 같은 기기) > 서버 startedAt(다른 기기) > 세션 시작 시각
      const saved = loadExerciseStartTime(workoutSession.id, currentExerciseIndex);
      const serverStartedAt = workoutSession.exercises[currentExerciseIndex]?.startedAt;
      if (saved !== null) {
        exerciseStartTimeRef.current = saved;
      } else if (serverStartedAt) {
        exerciseStartTimeRef.current = serverStartedAt;
      } else {
        exerciseStartTimeRef.current = startTime;
        // 서버에 운동 시작 시각 최초 기록
        const exercise = workoutSession.exercises[currentExerciseIndex];
        if (exercise) {
          markExerciseStarted(workoutSession.id, exercise.id, startTime)
            .catch(err => console.error('Failed to mark exercise started:', err));
        }
      }
    } else if (prevIndex !== currentExerciseIndex) {
      // 운동 전환(건너뛰기 or 세트 완료 후 다음 운동): 현재 시각으로 초기화 후 저장
      const now = Date.now();
      exerciseStartTimeRef.current = now;
      saveExerciseStartTime(workoutSession.id, currentExerciseIndex, now);
      setElapsedExerciseTime(0);
      // 서버에 운동 시작 시각 기록 (다른 기기 접속 시 복원용)
      const exercise = workoutSession.exercises[currentExerciseIndex];
      if (exercise) {
        markExerciseStarted(workoutSession.id, exercise.id, now)
          .catch(err => console.error('Failed to mark exercise started:', err));
      }
    }
    // status만 변경(일시정지 후 재개 등): exerciseStartTimeRef 유지

    prevExerciseIndexRef.current = currentExerciseIndex;

    // 타이머 설정
    const tick = () => {
      const now = Date.now();
      const totalTime = Math.max(0, Math.floor((now - startTime - localTotalPausedMsRef.current) / 1000));
      setWorkoutSession(prev => prev ? { ...prev, totalTime } : null);
      setElapsedExerciseTime(Math.max(0, Math.floor((now - exerciseStartTimeRef.current) / 1000)));
    };
    tick(); // 첫 tick까지 1초 대기로 인한 점프 방지: 즉시 한 번 갱신
    timerRef.current = setInterval(tick, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [workoutSession?.status, workoutSession?.currentExerciseIndex]);


  // API 응답을 UI 상태로 변환하는 헬퍼 함수
  const transformSessionResponse = (session: WorkoutSessionResponse, allWorkouts: WorkoutResponse[]): WorkoutSession => {
    const findFirstIncomplete = () => {
      if (!session.exercises || session.exercises.length === 0) {
        return { exerciseIndex: 0, setIndex: 0 };
      }

      // skipped 운동은 제외하고 미완료 세트 탐색
      for (let i = 0; i < session.exercises.length; i++) {
        const exercise = session.exercises[i];
        if (exercise.skipped) continue;
        if (exercise.sets && exercise.sets.length > 0) {
          const setIndex = exercise.sets.findIndex(s => !s.completed);
          if (setIndex !== -1) {
            return { exerciseIndex: i, setIndex };
          }
        }
      }

      // 모든 세트가 완료된 경우 마지막 운동의 마지막 세트
      const lastExIndex = session.exercises.length - 1;
      const lastExercise = session.exercises[lastExIndex];
      const lastSetIndex = (lastExercise?.sets?.length ?? 0) > 0 ? lastExercise.sets.length - 1 : 0;
      return { exerciseIndex: lastExIndex, setIndex: lastSetIndex };
    };

    const { exerciseIndex, setIndex } = findFirstIncomplete();

    return {
      id: session.id,
      programId: session.workoutProgramId,
      programName: session.workoutProgramName,
      startTime: new Date(session.startTime).getTime(),
      currentExerciseIndex: exerciseIndex,
      currentSetIndex: setIndex,
      totalTime: (() => {
        const sessionStartMs = new Date(session.startTime).getTime();
        const totalPausedMs = (session.totalPausedSeconds || 0) * 1000;
        if (session.status === 'PAUSED') {
          // 1순위: 서버의 lastPausedAt
          if (session.lastPausedAt) {
            const pauseStartMs = new Date(session.lastPausedAt).getTime();
            return Math.max(0, Math.floor((pauseStartMs - sessionStartMs - totalPausedMs) / 1000));
          }
          // 2순위: 일시정지 직전 저장한 localStorage 스냅샷
          const snapshot = loadPauseSnapshot(session.id);
          if (snapshot !== null) return snapshot;
        }
        return Math.max(0, Math.floor((Date.now() - sessionStartMs - totalPausedMs) / 1000));
      })(),
      status: session.status,
      exercises: session.exercises.map(ex => ({
        id: ex.id,
        exerciseId: ex.workoutId,
        workoutName: ex.workoutName,
        workoutPartName: ex.bodyPart || allWorkouts.find(w => w.id === ex.workoutId)?.bodyPart || '',
        skipped: ex.skipped ?? false,
        startedAt: ex.startedAt ? new Date(ex.startedAt).getTime() : undefined,
        sets: ex.sets.map(set => ({
          id: set.id,
          reps: set.reps,
          weight: set.weight,
          restTime: set.restTime,
          memo: set.memo,
          completed: set.completed,
          actualReps: set.actualReps,
          actualWeight: set.actualWeight,
          actualMemo: set.actualMemo,
          completedAt: set.completedAt ? new Date(set.completedAt).getTime() : undefined,
        })),
        completed: ex.sets.every(s => s.completed),
      })),
      totalPausedSeconds: session.totalPausedSeconds || 0,
      lastPausedAt: session.lastPausedAt ? new Date(session.lastPausedAt).getTime() : undefined,
    };
  };

  const updateSessionState = (sessionResponse: WorkoutSessionResponse) => {
    const transformed = transformSessionResponse(sessionResponse, allExercises);
    // totalTime은 타이머(localTotalPausedMsRef 기반)가 정확히 관리하므로 API 응답으로 덮어쓰지 않음
    setWorkoutSession(prev => prev ? { ...transformed, totalTime: prev.totalTime } : transformed);
    // 세션이 갱신되면 편집 중이던 순서 작업본은 무효 -> 편집 모드 종료
    setReorderDraft(null);
    setDraggedExerciseIndex(null);
  };

  // 데이터 로딩
  useEffect(() => {
    const fetchSessionAndWorkouts = async () => {
      try {
        const [session, workouts] = await Promise.all([
          getLatestWorkoutSession(),
          getWorkouts()
        ]);

        if (session) {
          setAllExercises(workouts); // 운동 목록을 먼저 설정
          const transformedSession = transformSessionResponse(session, workouts);
          localTotalPausedMsRef.current = (session.totalPausedSeconds || 0) * 1000;

          // 일시정지 상태로 새로고침: 타이머가 안 돌아 운동 시간이 0으로 보이는 문제 보정
          if (transformedSession.status === 'PAUSED' && transformedSession.lastPausedAt) {
            const exIdx = transformedSession.currentExerciseIndex;
            const saved = loadExerciseStartTime(transformedSession.id, exIdx);
            const serverStartedAt = transformedSession.exercises[exIdx]?.startedAt;
            const exStart = saved ?? serverStartedAt ?? transformedSession.startTime;
            exerciseStartTimeRef.current = exStart;
            setElapsedExerciseTime(Math.max(0, Math.floor((transformedSession.lastPausedAt - exStart) / 1000)));
          }

          setWorkoutSession(transformedSession);
        } else {
          navigate('/workout');
        }
      } catch (error) {
        console.error("Failed to fetch session or workouts:", error);
        navigate('/workout');
      }
    };

    fetchSessionAndWorkouts();
  }, [navigate]);

  // 오디오 초기화
  useEffect(() => {
    // 간단한 비프음 생성
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);

    audioRef.current = {
      play: () => {
        if (!soundEnabled) return;

        const newOscillator = audioContext.createOscillator();
        const newGainNode = audioContext.createGain();

        newOscillator.connect(newGainNode);
        newGainNode.connect(audioContext.destination);

        newOscillator.frequency.value = 800;
        newOscillator.type = 'sine';

        newGainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        newGainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        newOscillator.start(audioContext.currentTime);
        newOscillator.stop(audioContext.currentTime + 0.5);
      }
    } as any;

    return () => {
      audioContext.close();
    };
  }, [soundEnabled]);

  // 휴식 시간 타이머
  useEffect(() => {
    if (isResting && restTimeLeft > 0) {
      restTimerRef.current = setInterval(() => {
        setRestTimeLeft(prev => {
          if (prev <= 1) {
            setIsResting(false);
            if (soundEnabled && audioRef.current) {
              audioRef.current.play();
              setTimeout(() => audioRef.current?.play(), 300);
              setTimeout(() => audioRef.current?.play(), 600);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    }
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, [isResting, restTimeLeft, soundEnabled]);

  // API 연동 핸들러
  const pauseWorkout = async () => {
    if (!workoutSession) return;
    pauseStartMsRef.current = Date.now();
    // 새로고침 후 lastPausedAt이 없을 때를 대비해 현재 totalTime 저장
    savePauseSnapshot(workoutSession.id, workoutSession.totalTime);
    try {
      const updatedSession = await pauseWorkoutSession(workoutSession.id);
      updateSessionState(updatedSession);
    } catch (error) {
      console.error("Failed to pause workout:", error);
      pauseStartMsRef.current = null;
    }
  };

  const resumeWorkout = async () => {
    if (!workoutSession) return;
    try {
      const updatedSession = await resumeWorkoutSession(workoutSession.id);
      // 일시정지 시간 계산: 서버 diff 우선, 클라이언트 타임스탬프 fallback
      const serverPauseDurationMs =
        ((updatedSession.totalPausedSeconds || 0) - (workoutSession.totalPausedSeconds || 0)) * 1000;
      const pauseDurationMs =
        serverPauseDurationMs > 0
          ? serverPauseDurationMs
          : pauseStartMsRef.current !== null
            ? Date.now() - pauseStartMsRef.current
            : workoutSession.lastPausedAt !== undefined
              ? Date.now() - workoutSession.lastPausedAt
              : 0;

      // 새로고침 후 exerciseStartTimeRef가 0(미초기화)이면 올바른 기준 시각으로 복원
      if (exerciseStartTimeRef.current === 0) {
        const exIdx = workoutSession.currentExerciseIndex;
        const saved = loadExerciseStartTime(workoutSession.id, exIdx);
        const serverStartedAt = workoutSession.exercises[exIdx]?.startedAt;
        exerciseStartTimeRef.current = saved ?? serverStartedAt ?? workoutSession.startTime;
      }

      exerciseStartTimeRef.current += pauseDurationMs;
      saveExerciseStartTime(workoutSession.id, workoutSession.currentExerciseIndex, exerciseStartTimeRef.current);
      const exercise = workoutSession.exercises[workoutSession.currentExerciseIndex];
      if (exercise) {
        markExerciseStarted(workoutSession.id, exercise.id, exerciseStartTimeRef.current)
          .catch(err => console.error('Failed to sync exercise start time:', err));
      }
      localTotalPausedMsRef.current += pauseDurationMs;
      pauseStartMsRef.current = null;
      clearPauseSnapshot();
      updateSessionState(updatedSession);
    } catch (error) {
      console.error("Failed to resume workout:", error);
    }
  };

  const completeWorkout = async () => {
    if (!workoutSession) return;
    try {
      const updatedSession = await endWorkoutSession(workoutSession.id, 'COMPLETED');
      updateSessionState(updatedSession);
      setShowCompleteModal(true);
    } catch (error) {
      console.error("Failed to complete workout:", error);
    }
  };

  const stopWorkout = async () => {
    if (!workoutSession) return;
    try {
      await endWorkoutSession(workoutSession.id, 'CANCELLED');
      navigate('/workout');
    } catch (error) {
      console.error("Failed to stop workout:", error);
    } finally {
      setShowStopModal(false);
    }
  };

  const completeSet = async (actualReps?: number, actualWeight?: number, actualMemo?: string) => {
    if (!workoutSession) return;
    const currentExercise = workoutSession.exercises[workoutSession.currentExerciseIndex];
    const currentSet = currentExercise.sets[workoutSession.currentSetIndex];
    if (!currentSet) return;

    setIsCompletingSet(true); // API 호출 시작 시 로딩 상태로 설정

    try {
      const updatedSession = await completeWorkoutSessionSet(
        workoutSession.id,
        currentExercise.id,
        currentSet.id,
        actualWeight,
        actualReps,
        actualMemo
      );

      updateSessionState(updatedSession);

      if (updatedSession.status !== 'COMPLETED') {
        setRestTimeLeft(currentSet.restTime);
        setIsResting(true);
      } else {
        setShowCompleteModal(true);
      }
    } catch (error) {
      console.error("Failed to complete set:", error);
    } finally {
      setIsCompletingSet(false); // API 호출 완료 시 로딩 상태 해제
    }
  };

  const addSetToCurrentExercise = async () => {
    if (!workoutSession) return;
    const currentExercise = workoutSession.exercises[workoutSession.currentExerciseIndex];
    if (!currentExercise) return;

    const lastSet = currentExercise.sets.length > 0
      ? currentExercise.sets[currentExercise.sets.length - 1]
      : null;

    setIsAddingSet(true);
    try {
      const updatedSession = await addSetToWorkoutSessionExercise(
        workoutSession.id,
        currentExercise.id,
        {
          weight: lastSet ? lastSet.weight : undefined,
          reps: lastSet ? lastSet.reps : 10,
          restTime: lastSet ? lastSet.restTime : 60,
        }
      );
      updateSessionState(updatedSession);
    } catch (error) {
      console.error("Failed to add set:", error);
    } finally {
      setIsAddingSet(false);
    }
  };

  // 운동 중 운동 추가 모달 핸들러
  const selectWorkoutForAdd = (workout: WorkoutResponse) => {
    setPendingWorkout(workout);
    setPendingSets([{ reps: 10, weight: 0, restTime: 60 }]);
  };

  const addPendingSet = () => {
    setPendingSets(prev => [...prev, { reps: 10, weight: 0, restTime: 60 }]);
  };

  const removePendingSet = (index: number) => {
    setPendingSets(prev => prev.filter((_, i) => i !== index));
  };

  const updatePendingSet = (index: number, field: 'reps' | 'weight' | 'restTime', value: number) => {
    setPendingSets(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const closeAddExerciseModal = () => {
    setShowAddExerciseModal(false);
    setPendingWorkout(null);
    setPendingSets([]);
    setAddExerciseFilter('');
  };

  const confirmAddExercise = async () => {
    if (!pendingWorkout || !workoutSession) return;
    setIsAddingExercise(true);
    try {
      const exercise: CustomExerciseDto = {
        workoutId: pendingWorkout.id,
        order: workoutSession.exercises.length + 1,
        sets: pendingSets.map((s, i) => ({
          setNumber: i + 1,
          weight: s.weight || undefined,
          reps: s.reps,
          restTime: s.restTime,
        })),
      };
      const updatedSession = await addExerciseToWorkoutSession(workoutSession.id, exercise);
      updateSessionState(updatedSession);
      closeAddExerciseModal();
    } catch (error) {
      console.error('Failed to add exercise:', error);
      alert('운동을 추가하는 중 오류가 발생했습니다.');
    } finally {
      setIsAddingExercise(false);
    }
  };

  const resetWorkout = () => {
    if (workoutSession) {
      const resetSession: WorkoutSession = {
        ...workoutSession,
        status: 'IN_PROGRESS',
        currentExerciseIndex: 0,
        currentSetIndex: 0,
        totalTime: 0,
        bodyPartTime: 0,
        exercises: workoutSession.exercises.map(ex => ({
          ...ex,
          sets: ex.sets.map(set => ({ ...set, completed: false, actualReps: undefined, actualWeight: undefined, actualMemo: undefined })),
          completed: false
        }))
      };
      setWorkoutSession(resetSession);
      setIsResting(false);
      setRestTimeLeft(0);
      setShowResetModal(false);
    }
  };

  const skipExercise = async () => {
    if (!workoutSession) return;
    const currentExercise = workoutSession.exercises[workoutSession.currentExerciseIndex];
    if (!currentExercise) return;

    setShowSkipModal(false);

    try {
      const updatedSession = await skipWorkoutSessionExercise(
        workoutSession.id,
        currentExercise.id,
        true
      );
      setIsResting(false);
      setRestTimeLeft(0);
      updateSessionState(updatedSession);
    } catch (error) {
      console.error('Failed to skip exercise:', error);
    }
  };

  // 운동 순서 편집: 현재 진행 중인 운동 이후의 미완료 운동만 대상
  const getReorderableIndices = (exercises: ExerciseSet[]) => {
    if (!workoutSession) return [];
    return exercises
      .map((ex, i) => ({ ex, i }))
      .filter(({ ex, i }) => i > workoutSession.currentExerciseIndex && !ex.skipped && !ex.completed)
      .map(({ i }) => i);
  };

  const startReorder = () => {
    if (!workoutSession) return;
    setReorderDraft([...workoutSession.exercises]);
  };

  const cancelReorder = () => {
    setReorderDraft(null);
    setDraggedExerciseIndex(null);
  };

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    if (!reorderDraft) return;
    const indices = getReorderableIndices(reorderDraft);
    const pos = indices.indexOf(index);
    const targetPos = direction === 'up' ? pos - 1 : pos + 1;
    if (pos === -1 || targetPos < 0 || targetPos >= indices.length) return;

    const targetIndex = indices[targetPos];
    const updated = [...reorderDraft];
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    setReorderDraft(updated);
  };

  const handleExerciseDragStart = (e: React.DragEvent, index: number) => {
    setDraggedExerciseIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleExerciseDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleExerciseDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDraggedExerciseIndex(null);
    if (!reorderDraft || draggedExerciseIndex === null || draggedExerciseIndex === targetIndex) return;

    // 출발/목표가 모두 순서 변경 가능한 운동일 때만 이동
    const indices = getReorderableIndices(reorderDraft);
    if (!indices.includes(draggedExerciseIndex) || !indices.includes(targetIndex)) return;

    const updated = [...reorderDraft];
    const [moved] = updated.splice(draggedExerciseIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setReorderDraft(updated);
  };

  const handleExerciseDragEnd = () => {
    setDraggedExerciseIndex(null);
  };

  const saveReorder = async () => {
    if (!workoutSession || !reorderDraft) return;
    setIsSavingOrder(true);
    try {
      const updatedSession = await reorderWorkoutSessionExercises(
        workoutSession.id,
        reorderDraft.map((ex, i) => ({ workoutSessionExerciseId: ex.id, order: i + 1 }))
      );
      // 성공 시 updateSessionState가 편집 모드까지 종료시킴
      updateSessionState(updatedSession);
    } catch (error) {
      console.error('Failed to reorder exercises:', error);
      alert('운동 순서를 변경하는 중 오류가 발생했습니다.');
    } finally {
      setIsSavingOrder(false);
    }
  };

  // 헬퍼 함수
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getExerciseProperty = (exerciseId: number, property: keyof WorkoutResponse) => {
    return allExercises.find(ex => ex.id === exerciseId)?.[property] || '';
  };

  const getWorkoutProgress = () => {
    if (!workoutSession) return 0;
    const totalSets = workoutSession.exercises.reduce((total, ex) => total + ex.sets.length, 0);
    if (totalSets === 0) return 0;
    const completedSets = workoutSession.exercises.reduce((total, ex) =>
      total + ex.sets.filter(set => set.completed).length, 0);
    return Math.round((completedSets / totalSets) * 100);
  };

  // 현재 상태 가져오는 함수들
  const getCurrentExercise = () => {
    if (!workoutSession) return null;
    return workoutSession.exercises[workoutSession.currentExerciseIndex];
  };

  const getCurrentSet = () => {
    const currentExercise = getCurrentExercise();
    if (!currentExercise || !workoutSession) return null;
    return currentExercise.sets[workoutSession.currentSetIndex];
  };

  if (!workoutSession) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 dark:border-indigo-500 border-dashed rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">운동 세션을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // ... (기존 운동 진행 화면 JSX)
    // 운동 진행 화면
  const currentSet = getCurrentSet();
  const currentExercise = getCurrentExercise();
  const currentBodyPart = currentExercise ? getExerciseProperty(currentExercise.exerciseId, 'bodyPart') : '';
  const currentExerciseName = currentExercise ? getExerciseProperty(currentExercise.exerciseId, 'name') : '';
  const progress = getWorkoutProgress();

  // 운동 순서 편집용 파생 값
  const isSessionEditable = workoutSession.status !== 'COMPLETED' && workoutSession.status !== 'CANCELLED';
  const isReorderMode = reorderDraft !== null;
  const listExercises = reorderDraft ?? workoutSession.exercises;
  const reorderableIndices = getReorderableIndices(listExercises);
  const orderChanged = reorderDraft
    ? reorderDraft.some((ex, i) => ex.id !== workoutSession.exercises[i]?.id)
    : false;

  // 운동 추가 모달용: 카탈로그 필터링 및 부위별 그룹핑
  const filteredWorkouts = allExercises.filter(w =>
    w.name.toLowerCase().includes(addExerciseFilter.toLowerCase()) ||
    w.bodyPart.toLowerCase().includes(addExerciseFilter.toLowerCase())
  );
  const groupedWorkouts = filteredWorkouts.reduce<Record<string, WorkoutResponse[]>>((acc, w) => {
    if (!acc[w.bodyPart]) acc[w.bodyPart] = [];
    acc[w.bodyPart].push(w);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-indigo-400">홈</Link>
            <i className="ri-arrow-right-s-line"></i>
            <Link to="/workout" className="hover:text-blue-600 dark:hover:text-indigo-400">운동하기</Link>
            <i className="ri-arrow-right-s-line"></i>
            <span>운동 세션</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{workoutSession.programName}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {workoutSession.status === 'PAUSED' ? '일시정지됨' :
                 workoutSession.status === 'COMPLETED' ? '운동 완료!' :
                 isResting ? '휴식 중' : '운동 중'}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  soundEnabled
                    ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/20'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-400 hover:bg-gray-200 dark:hover:bg-white/8'
                }`}
                title={soundEnabled ? '알림음 끄기' : '알림음 켜기'}
              >
                <i className={`text-xl ${soundEnabled ? 'ri-volume-up-line' : 'ri-volume-mute-line'}`}></i>
              </button>

              {workoutSession.status !== 'COMPLETED' && workoutSession.status !== 'CANCELLED' && (
                <>
                  {workoutSession.status === 'PAUSED' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resumeWorkout}
                      className="text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10"
                    >
                      <i className="ri-play-line mr-1"></i>
                      재개
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={pauseWorkout}
                      className="text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                    >
                      <i className="ri-pause-line mr-1"></i>
                      일시정지
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowStopModal(true)}
                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <i className="ri-stop-line mr-1"></i>
                    종료
                  </Button>
                   <Button
                    variant="outline"
                    size="sm"
                    onClick={completeWorkout}
                    className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                  >
                    <i className="ri-check-line mr-1"></i>
                    완료
                  </Button>
                </>
              )}
              {/* <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetModal(true)}
              >
                <i className="ri-refresh-line mr-1"></i>
                초기화
              </Button> */}
            </div>
          </div>
        </div>

        {/* 운동 정보 대시보드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/8 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-indigo-400 mb-1">
              {formatTime(workoutSession.totalTime)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">전체 운동시간</div>
          </div>

          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/8 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-indigo-400 mb-1">
              {formatTime(elapsedExerciseTime)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">운동 시간</div>
          </div>

          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/8 rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-orange-600 mb-1">
              {currentBodyPart}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">운동 부위</div>
          </div>

          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/8 rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-indigo-400 mb-1">
              {currentExerciseName}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">현재 운동</div>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/8 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">운동 진행률</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2">
            <div
              className="bg-blue-500 dark:bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* 휴식 시간 표시 */}
        {isResting && (
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/8 rounded-xl p-6 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {formatTime(restTimeLeft)}
              </div>
              <div className="text-lg text-orange-700 dark:text-orange-400 mb-2">휴식 시간</div>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => {
                    setIsResting(false);
                    setRestTimeLeft(0);
                  }}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-500/30 dark:text-orange-400 dark:hover:bg-orange-500/10"
                >
                  휴식 건너뛰기
                </Button>
                <Button
                  onClick={() => setShowSkipModal(true)}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <i className="ri-skip-forward-line mr-1"></i>
                  운동 건너뛰기
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 현재 운동 정보 */}
        {workoutSession.status === 'IN_PROGRESS' && currentSet && (
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/8 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-white/[0.02] rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{currentSet.reps}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">목표 횟수</div>
              </div>
              {currentSet.weight != null && (
                <div className="text-center p-4 bg-gray-50 dark:bg-white/[0.02] rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{currentSet.weight}kg</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">목표 무게</div>
                </div>
              )}
              <div className="text-center p-4 bg-gray-50 dark:bg-white/[0.02] rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{formatTime(currentSet.restTime)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">휴식 시간</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-emerald-500/10 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-emerald-400 mb-1">
                  {workoutSession.currentSetIndex + 1} / {currentExercise.sets.length}
                </div>
                <div className="text-sm text-green-700 dark:text-emerald-500">세트</div>
              </div>
            </div>

            {!isResting && (
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">실제 수행</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">실제 횟수</label>
                    <input
                      type="number"
                      min="1"
                      defaultValue={currentSet.reps}
                      id="actual-reps"
                      className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">실제 무게(kg)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      defaultValue={currentSet.weight || 0}
                      id="actual-weight"
                      className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">메모</label>
                  <input
                    type="text"
                    id="actual-memo"
                    defaultValue={currentSet.memo || ''}
                    className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    placeholder="메모 (선택사항)"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {!isResting && (
                <>
                  <Button
                    onClick={() => {
                      const actualReps = parseInt((document.getElementById('actual-reps') as HTMLInputElement)?.value || currentSet.reps.toString());
                      const actualWeightInput = document.getElementById('actual-weight') as HTMLInputElement;
                      const actualWeight = actualWeightInput ? parseFloat(actualWeightInput.value) : undefined;
                      const actualMemo = (document.getElementById('actual-memo') as HTMLInputElement)?.value;
                      completeSet(actualReps, actualWeight, actualMemo);
                    }}
                    className="flex-1"
                    disabled={isCompletingSet}
                  >
                    {isCompletingSet ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        처리중...
                      </div>
                    ) : (
                      <>
                        <i className="ri-check-line mr-2"></i>
                        세트 완료
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowSkipModal(true)}
                    variant="outline"
                    className="text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                  >
                    <i className="ri-skip-forward-line mr-2"></i>
                    건너뛰기
                  </Button>
                </>
              )}
              <Button
                onClick={addSetToCurrentExercise}
                variant="outline"
                disabled={isAddingSet}
                className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10"
              >
                {isAddingSet ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    처리중...
                  </div>
                ) : (
                  <>
                    <i className="ri-add-line mr-2"></i>
                    세트 추가
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* 운동 목록 */}
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/8 rounded-xl p-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">운동 목록</h3>
            {isSessionEditable && (
              isReorderMode ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={cancelReorder} disabled={isSavingOrder}>
                    취소
                  </Button>
                  <Button size="sm" onClick={saveReorder} disabled={isSavingOrder || !orderChanged}>
                    {isSavingOrder ? '저장 중...' : '저장'}
                  </Button>
                </div>
              ) : reorderableIndices.length >= 2 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startReorder}
                  className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                >
                  <i className="ri-drag-move-line mr-1"></i>
                  순서 편집
                </Button>
              ) : null
            )}
          </div>

          {isReorderMode && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              <i className="ri-information-line mr-1"></i>
              남은 운동만 순서를 바꿀 수 있습니다. 드래그하거나 화살표를 사용하세요.
            </p>
          )}

          <div className="space-y-3">
            {[...listExercises]
              .map((ex, i) => ({ ex, i }))
              .sort((a, b) => {
                const priority = (item: { ex: ExerciseSet; i: number }) => {
                  if (item.i === workoutSession.currentExerciseIndex && workoutSession.status === 'IN_PROGRESS') return 0;
                  if (!item.ex.completed && !item.ex.skipped) return 1;
                  if (item.ex.skipped) return 2;
                  return 3; // completed
                };
                const pa = priority(a);
                const pb = priority(b);
                if (pa !== pb) return pa - pb;
                return a.i - b.i; // 같은 그룹 내에서는 원래 순서 유지
              })
              .map(({ ex: exercise, i: exerciseIndex }) => {
                const reorderPos = reorderableIndices.indexOf(exerciseIndex);
                const canReorder = isReorderMode && reorderPos !== -1;
                return (
              <div
                key={exercise.id}
                draggable={canReorder}
                onDragStart={canReorder ? (e) => handleExerciseDragStart(e, exerciseIndex) : undefined}
                onDragOver={canReorder ? handleExerciseDragOver : undefined}
                onDrop={canReorder ? (e) => handleExerciseDrop(e, exerciseIndex) : undefined}
                onDragEnd={canReorder ? handleExerciseDragEnd : undefined}
                className={`p-4 rounded-lg border-2 transition-colors ${canReorder ? 'cursor-move ' : ''}${
                  draggedExerciseIndex === exerciseIndex ? 'opacity-50 ' : ''
                }${
                  exerciseIndex === workoutSession.currentExerciseIndex && workoutSession.status === 'IN_PROGRESS'
                    ? 'border-blue-200 bg-blue-50 dark:border-indigo-500/30 dark:bg-indigo-500/5'
                    : exercise.skipped
                      ? 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] opacity-60'
                      : exercise.completed
                        ? 'border-green-500 bg-green-50 dark:border-green-500/30 dark:bg-green-500/5'
                        : 'border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {canReorder && (
                        <i className="ri-draggable text-lg text-gray-300 dark:text-gray-700 flex-shrink-0"></i>
                      )}
                      <div className="font-medium text-gray-900 dark:text-white truncate">{getExerciseProperty(exercise.exerciseId, 'name')}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{exercise.sets.filter(set => set.completed).length} / {exercise.sets.length} 세트</div>
                      {canReorder && (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); moveExercise(exerciseIndex, 'up'); }}
                            disabled={reorderPos === 0}
                            className={`w-6 h-6 flex items-center justify-center rounded ${
                              reorderPos === 0
                                ? 'text-gray-200 dark:text-gray-800 cursor-not-allowed'
                                : 'text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                            }`}
                            title="위로"
                          >
                            <i className="ri-arrow-up-s-line text-lg"></i>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); moveExercise(exerciseIndex, 'down'); }}
                            disabled={reorderPos === reorderableIndices.length - 1}
                            className={`w-6 h-6 flex items-center justify-center rounded ${
                              reorderPos === reorderableIndices.length - 1
                                ? 'text-gray-200 dark:text-gray-800 cursor-not-allowed'
                                : 'text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                            }`}
                            title="아래로"
                          >
                            <i className="ri-arrow-down-s-line text-lg"></i>
                          </button>
                        </div>
                      )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {exercise.sets.map((set, setIndex) => (
                    <div
                      key={set.id}
                      className={`p-2 rounded text-xs ${
                        exerciseIndex === workoutSession.currentExerciseIndex && setIndex === workoutSession.currentSetIndex && workoutSession.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 dark:bg-blue-500/10 border border-blue-300 dark:border-blue-500/30'
                          : set.completed
                            ? 'bg-green-100 dark:bg-green-500/10 border border-green-300 dark:border-green-500/30'
                            : 'bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10'
                      }`}
                    >
                      <div className="font-medium text-gray-400 dark:text-gray-600">세트 {setIndex + 1}</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {set.completed && set.actualReps !== undefined && set.actualReps !== null ? set.actualReps : set.reps}회
                        {((set.weight !== undefined && set.weight !== null) || (set.actualWeight !== undefined && set.actualWeight !== null && set.actualWeight !== 0)) &&
                          ` × ${set.completed && set.actualWeight !== undefined && set.actualWeight !== null && set.actualWeight !== 0 ? set.actualWeight : set.weight}kg`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
                );
              })}
          </div>

          {isSessionEditable && !isReorderMode && (
            <button
              onClick={() => setShowAddExerciseModal(true)}
              className="w-full mt-3 py-3 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-lg text-gray-400 dark:text-gray-600 hover:border-blue-300 dark:hover:border-indigo-400/50 hover:text-blue-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
            >
              <i className="ri-add-line text-xl"></i>
              <span className="font-medium">운동 추가</span>
            </button>
          )}
        </div>
      </div>

      {/* 모달들 */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {pendingWorkout && (
                  <button
                    onClick={() => { setPendingWorkout(null); setPendingSets([]); }}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded"
                  >
                    <i className="ri-arrow-left-line text-lg"></i>
                  </button>
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {pendingWorkout ? pendingWorkout.name : '운동 추가'}
                </h3>
              </div>
              <button onClick={closeAddExerciseModal} className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {!pendingWorkout ? (
              <>
                <div className="p-4 border-b border-gray-100 dark:border-white/5">
                  <input
                    type="text"
                    value={addExerciseFilter}
                    onChange={(e) => setAddExerciseFilter(e.target.value)}
                    placeholder="운동 이름 또는 부위로 검색..."
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {Object.keys(groupedWorkouts).length === 0 ? (
                    <p className="text-center text-gray-500 py-8">검색 결과가 없습니다</p>
                  ) : (
                    Object.entries(groupedWorkouts).map(([bodyPart, workouts]) => (
                      <div key={bodyPart} className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-500 mb-2 px-1">{bodyPart}</h4>
                        <div className="space-y-1">
                          {workouts.map(workout => {
                            const alreadyAdded = workoutSession.exercises.some(ex => ex.exerciseId === workout.id);
                            return (
                              <button
                                key={workout.id}
                                onClick={() => selectWorkoutForAdd(workout)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                  alreadyAdded
                                    ? 'bg-blue-50 dark:bg-indigo-500/10 text-blue-700 dark:text-indigo-300'
                                    : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{workout.name}</span>
                                  {alreadyAdded
                                    ? <span className="text-xs text-blue-600 dark:text-indigo-400">추가됨</span>
                                    : <i className="ri-arrow-right-s-line text-gray-400 dark:text-gray-600"></i>
                                  }
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4">
                  <p className="text-sm text-gray-500 mb-4">
                    <span className="bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded text-xs mr-2">{pendingWorkout.bodyPart}</span>
                    세트 구성을 설정하세요
                  </p>

                  {/* 세트 헤더 */}
                  <div className="grid grid-cols-[2rem_1fr_1fr_1fr_2rem] gap-2 text-xs font-medium text-gray-400 dark:text-gray-600 mb-2 px-1">
                    <div className="text-center">세트</div>
                    <div className="text-center">횟수</div>
                    <div className="text-center">무게(kg)</div>
                    <div className="text-center">휴식(초)</div>
                    <div></div>
                  </div>

                  <div className="space-y-2">
                    {pendingSets.map((set, index) => (
                      <div key={index} className="grid grid-cols-[2rem_1fr_1fr_1fr_2rem] gap-2 items-center">
                        <div className="text-center text-sm font-medium text-gray-500">{index + 1}</div>
                        <input
                          type="number"
                          min={1}
                          value={set.reps}
                          onChange={(e) => updatePendingSet(index, 'reps', Math.max(1, Number(e.target.value)))}
                          className="w-full px-2 py-1.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded text-sm text-gray-900 dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <input
                          type="number"
                          min={0}
                          step={2.5}
                          value={set.weight}
                          onChange={(e) => updatePendingSet(index, 'weight', Math.max(0, Number(e.target.value)))}
                          className="w-full px-2 py-1.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded text-sm text-gray-900 dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <input
                          type="number"
                          min={0}
                          step={15}
                          value={set.restTime}
                          onChange={(e) => updatePendingSet(index, 'restTime', Math.max(0, Number(e.target.value)))}
                          className="w-full px-2 py-1.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded text-sm text-gray-900 dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => removePendingSet(index)}
                          disabled={pendingSets.length === 1}
                          className={`flex items-center justify-center rounded ${
                            pendingSets.length === 1 ? 'text-gray-300 dark:text-gray-700' : 'text-red-400 hover:text-red-300'
                          }`}
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addPendingSet}
                    className="mt-3 w-full py-2 border border-dashed border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-400 dark:text-gray-600 hover:border-blue-300 dark:hover:border-indigo-400/50 hover:text-blue-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <i className="ri-add-line mr-1"></i>세트 추가
                  </button>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-white/5">
                  <button
                    onClick={confirmAddExercise}
                    disabled={isAddingExercise}
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {isAddingExercise ? '추가 중...' : `${pendingSets.length}세트로 추가`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-xl p-6 w-full max-w-md text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">운동 완료!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">총 운동시간: {formatTime(workoutSession.totalTime)}</p>
            <Button onClick={() => navigate('/history')} className="w-full">기록 보러가기</Button>
          </div>
        </div>
      )}
      {showStopModal && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">운동 종료</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">정말로 운동을 종료하시겠습니까? 지금까지의 기록은 저장되지 않습니다.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowStopModal(false)} className="flex-1">취소</Button>
              <Button onClick={stopWorkout} className="flex-1 bg-red-600 hover:bg-red-700">종료</Button>
            </div>
          </div>
        </div>
      )}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center p-4 z-50">
           <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">운동 초기화</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">운동을 처음부터 다시 시작하시겠습니까? 현재까지의 진행상황이 초기화됩니다.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowResetModal(false)} className="flex-1">취소</Button>
              <Button onClick={resetWorkout} className="flex-1">초기화</Button>
            </div>
          </div>
        </div>
      )}
      {showSkipModal && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">운동 건너뛰기</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              현재 운동({currentExerciseName})을 건너뛰고 다음 운동으로 이동하시겠습니까?
              남은 세트는 미완료 상태로 유지됩니다.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowSkipModal(false)} className="flex-1">취소</Button>
              <Button onClick={skipExercise} className="flex-1 bg-orange-600 hover:bg-orange-700">건너뛰기</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
