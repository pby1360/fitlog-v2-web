import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import Header from '@/components/feature/Header';
import { getLatestWorkoutSession, WorkoutSessionResponse, getWorkouts, WorkoutResponse } from '@/services/api';

// ... (기존 인터페이스들: ExerciseSetDetail, ExerciseSet, WorkoutSession)
interface ExerciseSetDetail {
  id: string;
  reps: number;
  weight?: number;
  restTime: number;
  memo?: string;
  completed?: boolean;
  actualReps?: number;
  actualWeight?: number;
}

interface ExerciseSet {
  id: string;
  exerciseId: number;
  workoutName: string;
  workoutPartName: string; // 이 부분은 API 응답에 없으므로 getWorkouts로 채워야 합니다.
  sets: ExerciseSetDetail[];
  completed?: boolean;
}

interface WorkoutSession {
  id: string;
  programId: number;
  programName: string;
  startTime: number;
  currentExerciseIndex: number;
  currentSetIndex: number;
  totalTime: number;
  bodyPartTime: number;
  isPaused: boolean;
  isCompleted: boolean;
  isStarted: boolean;
  exercises: ExerciseSet[];
}


export default function WorkoutSessionPage() {
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession | null>(null);
  const [allExercises, setAllExercises] = useState<WorkoutResponse[]>([]);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchSessionAndWorkouts = async () => {
      try {
        const [session, workouts] = await Promise.all([
          getLatestWorkoutSession(),
          getWorkouts()
        ]);

        if (session) {
          setAllExercises(workouts);
          // API 응답(WorkoutSessionResponse)을 UI 상태(WorkoutSession)로 변환
          const transformedSession: WorkoutSession = {
            id: session.id.toString(),
            programId: session.workoutProgramId,
            programName: session.workoutProgramName,
            startTime: new Date(session.startTime).getTime(),
            currentExerciseIndex: 0, // 기본값, 추후 서버에서 받을 수 있음
            currentSetIndex: 0, // 기본값, 추후 서버에서 받을 수 있음
            totalTime: Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000),
            bodyPartTime: 0, // 이 값은 클라이언트에서 계산해야 함
            isPaused: false,
            isCompleted: session.status === 'COMPLETED',
            isStarted: true,
            exercises: session.exercises.map(ex => ({
              id: `ex-${ex.id}`,
              exerciseId: ex.workoutId,
              workoutName: ex.workoutName,
              workoutPartName: workouts.find(w => w.id === ex.workoutId)?.bodyPart || '',
              sets: ex.sets.map(set => ({
                id: `set-${set.id}`,
                reps: set.reps,
                weight: set.weight,
                restTime: set.restTime,
                memo: set.memo,
                completed: set.completed,
              })),
              completed: ex.sets.every(s => s.completed),
            })),
          };
          setWorkoutSession(transformedSession);
        } else {
          // 진행 중인 세션이 없으면 프로그램 선택 페이지로 리디렉션
          navigate('/workout');
        }
      } catch (error) {
        console.error("Failed to fetch session or workouts:", error);
        navigate('/workout');
      }
    };

    fetchSessionAndWorkouts();
  }, [navigate]);
  
    // ... (기존의 모든 useEffect 훅 및 헬퍼 함수들: 오디오, 타이머, 포맷팅, 세트 완료 등)
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

  // 운동 시간 타이머
  useEffect(() => {
    if (workoutSession && workoutSession.isStarted && !workoutSession.isPaused && !workoutSession.isCompleted && !isResting) {
      timerRef.current = setInterval(() => {
        setWorkoutSession(prev => {
          if (!prev) return null;
          return {
            ...prev,
            totalTime: prev.totalTime + 1,
            bodyPartTime: prev.bodyPartTime + 1
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [workoutSession?.isStarted, workoutSession?.isPaused, workoutSession?.isCompleted, isResting]);

  // 휴식 시간 타이머
  useEffect(() => {
    if (isResting && restTimeLeft > 0) {
      restTimerRef.current = setInterval(() => {
        setRestTimeLeft(prev => {
          if (prev <= 1) {
            setIsResting(false);
            // 휴식 종료 시 알림음 재생
            if (soundEnabled && audioRef.current) {
              audioRef.current.play();
              // 3번 반복
              setTimeout(() => audioRef.current?.play(), 300);
              setTimeout(() => audioRef.current?.play(), 600);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
        restTimerRef.current = null;
      }
    }

    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }
    };
  }, [isResting, restTimeLeft, soundEnabled]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getExerciseName = (exerciseId: number) => {
    return allExercises.find(ex => ex.id === exerciseId)?.name || '';
  };

  const getExerciseBodyPart = (exerciseId: number) => {
    return allExercises.find(ex => ex.id === exerciseId)?.bodyPart || '';
  };

  const startTimer = () => {
    if (workoutSession) {
      setWorkoutSession({ ...workoutSession, isStarted: true });
    }
  };

  const stopTimer = () => {
    if (workoutSession) {
      setWorkoutSession({ ...workoutSession, isStarted: false });
    }
  };

  const pauseWorkout = () => {
    if (workoutSession) {
      setWorkoutSession({ ...workoutSession, isPaused: true });
    }
  };

  const resumeWorkout = () => {
    if (workoutSession) {
      setWorkoutSession({ ...workoutSession, isPaused: false });
    }
  };

  const stopWorkout = () => {
    setWorkoutSession(null);
    setIsResting(false);
    setRestTimeLeft(0);
    setShowStopModal(false);
  };

  const resetWorkout = () => {
    if (workoutSession) {
      const resetSession: WorkoutSession = {
        ...workoutSession,
        currentExerciseIndex: 0,
        currentSetIndex: 0,
        totalTime: 0,
        bodyPartTime: 0,
        isPaused: false,
        isStarted: false, // 초기화 시 시작 상태도 리셋
        exercises: workoutSession.exercises.map(ex => ({
          ...ex,
          sets: ex.sets.map(set => ({ ...set, completed: false, actualReps: undefined, actualWeight: undefined })),
          completed: false
        }))
      };
      setWorkoutSession(resetSession);
      setIsResting(false);
      setRestTimeLeft(0);
      setShowResetModal(false);
    }
  };

  const completeSet = (actualReps?: number, actualWeight?: number) => {
    if (!workoutSession) return;

    const updatedSession = { ...workoutSession };
    const currentExercise = updatedSession.exercises[workoutSession.currentExerciseIndex];
    const currentSet = currentExercise.sets[workoutSession.currentSetIndex];
    
    // 현재 세트 완료 처리
    currentSet.completed = true;
    currentSet.actualReps = actualReps || currentSet.reps;
    currentSet.actualWeight = actualWeight || currentSet.weight;

    // 다음 세트로 이동
    if (workoutSession.currentSetIndex < currentExercise.sets.length - 1) {
      updatedSession.currentSetIndex = workoutSession.currentSetIndex + 1;
      
      // 휴식 시간 시작
      setRestTimeLeft(currentSet.restTime);
      setIsResting(true);
    } else {
      // 현재 운동 완료
      currentExercise.completed = true;
      
      // 다음 운동으로 이동
      if (workoutSession.currentExerciseIndex < updatedSession.exercises.length - 1) {
        updatedSession.currentExerciseIndex = workoutSession.currentExerciseIndex + 1;
        updatedSession.currentSetIndex = 0;
        updatedSession.bodyPartTime = 0; // 새로운 부위 시작시 시간 리셋
      } else {
        // 모든 운동 완료
        updatedSession.isCompleted = true;
        setShowCompleteModal(true);
      }
    }

    setWorkoutSession(updatedSession);
  };

  const skipToNextExercise = () => {
    if (!workoutSession) return;

    if (workoutSession.currentExerciseIndex < workoutSession.exercises.length - 1) {
      const updatedSession = {
        ...workoutSession,
        currentExerciseIndex: workoutSession.currentExerciseIndex + 1,
        currentSetIndex: 0,
        bodyPartTime: 0
      };
      setWorkoutSession(updatedSession);
      setIsResting(false);
      setRestTimeLeft(0);
    }
  };

  const skipToPreviousExercise = () => {
    if (!workoutSession) return;

    if (workoutSession.currentExerciseIndex > 0) {
      const updatedSession = {
        ...workoutSession,
        currentExerciseIndex: workoutSession.currentExerciseIndex - 1,
        currentSetIndex: 0,
        bodyPartTime: 0
      };
      setWorkoutSession(updatedSession);
      setIsResting(false);
      setRestTimeLeft(0);
    }
  };

  const getWorkoutProgress = () => {
    if (!workoutSession) return 0;
    
    const totalSets = workoutSession.exercises.reduce((total, ex) => total + ex.sets.length, 0);
    const completedSets = workoutSession.exercises.reduce((total, ex) => 
      total + ex.sets.filter(set => set.completed).length, 0
    );
    
    return Math.round((completedSets / totalSets) * 100);
  };

  const getCurrentBodyPart = () => {
    if (!workoutSession) return '';
    const currentExercise = workoutSession.exercises[workoutSession.currentExerciseIndex];
    return getExerciseBodyPart(currentExercise.exerciseId);
  };

  const getCurrentExerciseName = () => {
    if (!workoutSession) return '';
    const currentExercise = workoutSession.exercises[workoutSession.currentExerciseIndex];
    return getExerciseName(currentExercise.exerciseId);
  };

  const getCurrentSet = () => {
    if (!workoutSession) return null;
    const currentExercise = workoutSession.exercises[workoutSession.currentExerciseIndex];
    return currentExercise.sets[workoutSession.currentSetIndex];
  };

  if (!workoutSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">운동 세션을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // ... (기존 운동 진행 화면 JSX)
    // 운동 진행 화면
  const currentSet = getCurrentSet();
  const currentBodyPart = getCurrentBodyPart();
  const currentExerciseName = getCurrentExerciseName();
  const progress = getWorkoutProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link to="/" className="hover:text-blue-600">홈</Link>
            <i className="ri-arrow-right-s-line"></i>
            <Link to="/workout" className="hover:text-blue-600">운동하기</Link>
            <i className="ri-arrow-right-s-line"></i>
            <span>운동 세션</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{workoutSession.programName}</h1>
              <p className="text-gray-600 mt-1">
                {!workoutSession.isStarted ? '시작 대기 중' :
                 workoutSession.isPaused ? '일시정지됨' : 
                 workoutSession.isCompleted ? '운동 완료!' : 
                 isResting ? '휴식 중' : '운동 중'}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              {/* 알림 토글 버튼 */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  soundEnabled 
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
                title={soundEnabled ? '알림음 끄기' : '알림음 켜기'}
              >
                <i className={`text-xl ${soundEnabled ? 'ri-volume-up-line' : 'ri-volume-mute-line'}`}></i>
              </button>
              
              {!workoutSession.isCompleted && (
                <>
                  {!workoutSession.isStarted ? (
                    <Button 
                      onClick={startTimer}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <i className="ri-play-line mr-1"></i>
                      시작
                    </Button>
                  ) : (
                    <>
                      {workoutSession.isPaused ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={resumeWorkout}
                          className="text-green-600 hover:bg-green-50"
                        >
                          <i className="ri-play-line mr-1"></i>
                          재시작
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={pauseWorkout}
                          className="text-orange-600 hover:bg-orange-50"
                        >
                          <i className="ri-pause-line mr-1"></i>
                          일시정지
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={stopTimer}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <i className="ri-stop-line mr-1"></i>
                        정지
                      </Button>
                    </>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setWorkoutSession({ ...workoutSession, isCompleted: true });
                      setShowCompleteModal(true);
                    }}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    <i className="ri-check-line mr-1"></i>
                    완료
                  </Button>
                </>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowResetModal(true)}
              >
                <i className="ri-refresh-line mr-1"></i>
                초기화
              </Button>
            </div>
          </div>
        </div>

        {/* 운동 정보 대시보드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {formatTime(workoutSession.totalTime)}
            </div>
            <div className="text-sm text-gray-600">전체 운동시간</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatTime(workoutSession.bodyPartTime)}
            </div>
            <div className="text-sm text-gray-600">현재 부위 시간</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {progress}%
            </div>
            <div className="text-sm text-gray-600">진행률</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-lg font-bold text-orange-600 mb-1">
              {currentBodyPart}
            </div>
            <div className="text-sm text-gray-600">운동 부위</div>
          </Card>
        </div>

        {/* 시작 전 안내 메시지 */}
        {!workoutSession.isStarted && !workoutSession.isCompleted && (
          <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-timer-line text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">운동 준비 완료</h3>
              <p className="text-blue-700 mb-4">
                시작 버튼을 눌러 운동을 시작하세요. 운동 시간이 자동으로 기록됩니다.
              </p>
            </div>
          </Card>
        )}

        {/* 진행률 바 */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">운동 진행률</span>
            <span className="text-sm text-gray-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </Card>

        {/* 휴식 시간 표시 */}
        {isResting && (
          <Card className="p-6 mb-6 bg-orange-50 border-orange-200">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {formatTime(restTimeLeft)}
              </div>
              <div className="text-lg text-orange-700 mb-2">휴식 시간</div>
              <div className="flex items-center justify-center gap-2 text-sm text-orange-600 mb-4">
                <i className={`text-lg ${soundEnabled ? 'ri-volume-up-line' : 'ri-volume-mute-line'}`}></i>
                <span>{soundEnabled ? '휴식 종료 시 알림음이 울립니다' : '알림음이 꺼져있습니다'}</span>
              </div>
              <Button 
                onClick={() => {
                  setIsResting(false);
                  setRestTimeLeft(0);
                }}
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                휴식 건너뛰기
              </Button>
            </div>
          </Card>
        )}

        {/* 현재 운동 정보 */}
        {!workoutSession.isCompleted && currentSet && workoutSession.isStarted && (
          <Card className="p-6 mb-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentExerciseName}</h2>
              <div className="text-lg text-gray-600">
                세트 {workoutSession.currentSetIndex + 1} / {workoutSession.exercises[workoutSession.currentExerciseIndex].sets.length}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1">{currentSet.reps}</div>
                <div className="text-sm text-gray-600">목표 횟수</div>
              </div>
              
              {currentSet.weight && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{currentSet.weight}kg</div>
                  <div className="text-sm text-gray-600">목표 무게</div>
                </div>
              )}
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1">{formatTime(currentSet.restTime)}</div>
                <div className="text-sm text-gray-600">휴식 시간</div>
              </div>
              
              {currentSet.memo && (
                <div className="text-center p-4 bg-gray-50 rounded-lg lg:col-span-1 col-span-2">
                  <div className="text-sm text-gray-900 font-medium mb-1">메모</div>
                  <div className="text-sm text-gray-600">{currentSet.memo}</div>
                </div>
              )}
            </div>

            {/* 실제 수행 입력 */}
            {!isResting && !workoutSession.isPaused && (
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900">실제 수행</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">실제 횟수</label>
                    <input
                      type="number"
                      min="1"
                      defaultValue={currentSet.reps}
                      id="actual-reps"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {currentSet.weight && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">실제 무게(kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        defaultValue={currentSet.weight}
                        id="actual-weight"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 운동 컨트롤 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!isResting && !workoutSession.isPaused && (
                <Button 
                  onClick={() => {
                    const actualReps = parseInt((document.getElementById('actual-reps') as HTMLInputElement)?.value || currentSet.reps.toString());
                    const actualWeight = currentSet.weight ? parseFloat((document.getElementById('actual-weight') as HTMLInputElement)?.value || currentSet.weight.toString()) : undefined;
                    completeSet(actualReps, actualWeight);
                  }}
                  className="flex-1"
                >
                  <i className="ri-check-line mr-2"></i>
                  세트 완료
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* 운동 네비게이션 */}
        {!workoutSession.isCompleted && workoutSession.isStarted && (
          <Card className="p-4 mb-6">
            <div className="flex justify-between items-center">
              <Button 
                variant="outline" 
                onClick={skipToPreviousExercise}
                disabled={workoutSession.currentExerciseIndex === 0}
                className="flex-1 mr-2"
              >
                <i className="ri-skip-back-line mr-2"></i>
                이전 운동
              </Button>
              
              <div className="text-center px-4">
                <div className="text-sm text-gray-600">
                  {workoutSession.currentExerciseIndex + 1} / {workoutSession.exercises.length}
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={skipToNextExercise}
                disabled={workoutSession.currentExerciseIndex === workoutSession.exercises.length - 1}
                className="flex-1 ml-2"
              >
                다음 운동
                <i className="ri-skip-forward-line ml-2"></i>
              </Button>
            </div>
          </Card>
        )}

        {/* 운동 목록 */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">운동 목록</h3>
          <div className="space-y-3">
            {workoutSession.exercises.map((exercise, exerciseIndex) => (
              <div 
                key={exercise.id} 
                className={`p-4 rounded-lg border-2 transition-colors ${
                  exerciseIndex === workoutSession.currentExerciseIndex 
                    ? 'border-blue-500 bg-blue-50' 
                    : exercise.completed 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      exerciseIndex === workoutSession.currentExerciseIndex 
                        ? 'bg-blue-600 text-white' 
                        : exercise.completed 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-200 text-gray-600'
                    }`}>
                      {exercise.completed ? (
                        <i className="ri-check-line"></i>
                      ) : (
                        exerciseIndex + 1
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{getExerciseName(exercise.exerciseId)}</div>
                      <div className="text-sm text-gray-600">{getExerciseBodyPart(exercise.exerciseId)}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {exercise.sets.filter(set => set.completed).length} / {exercise.sets.length} 세트
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {exercise.sets.map((set, setIndex) => (
                    <div 
                      key={set.id} 
                      className={`p-2 rounded text-xs ${
                        exerciseIndex === workoutSession.currentExerciseIndex && setIndex === workoutSession.currentSetIndex
                          ? 'bg-blue-100 border border-blue-300'
                          : set.completed 
                            ? 'bg-green-100 border border-green-300' 
                            : 'bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <div className="font-medium">세트 {setIndex + 1}</div>
                      <div className="text-gray-600">
                        {set.completed && set.actualReps ? set.actualReps : set.reps}회
                        {(set.weight || set.actualWeight) && ` × ${set.completed && set.actualWeight ? set.actualWeight : set.weight}kg`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 운동 완료 모달 */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-trophy-line text-2xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">운동 완료!</h3>
              <p className="text-gray-600 mb-4">
                총 운동시간: {formatTime(workoutSession.totalTime)}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCompleteModal(false);
                    setWorkoutSession(null);
                  }}
                  className="flex-1"
                >
                  확인
                </Button>
                <Button 
                  onClick={() => {
                    setShowCompleteModal(false);
                    // 운동 기록 저장 로직 추가 가능
                    setWorkoutSession(null);
                  }}
                  className="flex-1"
                >
                  기록 저장
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 운동 중지 확인 모달 */}
      {showStopModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">운동 중지</h3>
            <p className="text-gray-600 mb-6">정말로 운동을 중지하시겠습니까? 현재까지의 진행상황이 사라집니다.</p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowStopModal(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button 
                onClick={stopWorkout}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                중지
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 운동 초기화 확인 모달 */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">운동 초기화</h3>
            <p className="text-gray-600 mb-6">운동을 처음부터 다시 시작하시겠습니까? 현재까지의 진행상황이 초기화됩니다.</p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowResetModal(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button 
                onClick={resetWorkout}
                className="flex-1"
              >
                초기화
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
