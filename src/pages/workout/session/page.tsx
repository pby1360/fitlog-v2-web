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
  skipWorkoutSessionExercise
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

  const [elapsedExerciseTime, setElapsedExerciseTime] = useState(0);

  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 모든 타이머 로직을 통합 관리하는 useEffect
  useEffect(() => {
    if (!workoutSession || workoutSession.status !== 'IN_PROGRESS') {
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }

    const { exercises, currentExerciseIndex, startTime } = workoutSession;

    // 타이머 설정
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const currentTotalPausedSeconds = workoutSession.totalPausedSeconds || 0;
      const effectiveSessionStartTimeForTotal = startTime + (currentTotalPausedSeconds * 1000);

      setWorkoutSession(prev => prev ? {
        ...prev,
        totalTime: Math.max(0, Math.floor((now - effectiveSessionStartTimeForTotal) / 1000))
      } : null);

      let exerciseStartTime = startTime;
      if (currentExerciseIndex > 0) {
        const prevExercise = exercises[currentExerciseIndex - 1];
        const lastCompletedSet = [...prevExercise.sets].reverse().find(s => s.completed && s.completedAt);
        if (lastCompletedSet?.completedAt) {
          exerciseStartTime = lastCompletedSet.completedAt;
        }
      }

      setElapsedExerciseTime(Math.max(0, Math.floor((now - (exerciseStartTime + currentTotalPausedSeconds * 1000)) / 1000)));
    }, 1000);

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
      totalTime: Math.max(0, Math.floor((Date.now() - (new Date(session.startTime).getTime() + (session.totalPausedSeconds || 0) * 1000)) / 1000)),
      status: session.status,
      exercises: session.exercises.map(ex => ({
        id: ex.id,
        exerciseId: ex.workoutId,
        workoutName: ex.workoutName,
        workoutPartName: ex.bodyPart || allWorkouts.find(w => w.id === ex.workoutId)?.bodyPart || '',
        skipped: ex.skipped ?? false,
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
    setWorkoutSession(transformed);
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
    try {
      const updatedSession = await pauseWorkoutSession(workoutSession.id);
      updateSessionState(updatedSession);
    } catch (error) {
      console.error("Failed to pause workout:", error);
    }
  };

  const resumeWorkout = async () => {
    if (!workoutSession) return;
    try {
      const updatedSession = await resumeWorkoutSession(workoutSession.id);
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
            </div>
          </div>
        )}

        {/* 운동 목록 */}
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/8 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">운동 목록</h3>
          <div className="space-y-3">
            {[...workoutSession.exercises]
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
              .map(({ ex: exercise, i: exerciseIndex }) => (
              <div
                key={exercise.id}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  exerciseIndex === workoutSession.currentExerciseIndex && workoutSession.status === 'IN_PROGRESS'
                    ? 'border-blue-200 bg-blue-50 dark:border-indigo-500/30 dark:bg-indigo-500/5'
                    : exercise.skipped
                      ? 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] opacity-60'
                      : exercise.completed
                        ? 'border-green-500 bg-green-50 dark:border-green-500/30 dark:bg-green-500/5'
                        : 'border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900 dark:text-white">{getExerciseProperty(exercise.exerciseId, 'name')}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{exercise.sets.filter(set => set.completed).length} / {exercise.sets.length} 세트</div>
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
            ))}
          </div>
        </div>
      </div>

      {/* 모달들 */}
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
