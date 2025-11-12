import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import Header from '../../components/feature/Header';

interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
}

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
  exerciseId: string;
  sets: ExerciseSetDetail[];
  completed?: boolean;
}

interface Program {
  id: string;
  name: string;
  description: string;
  exercises: ExerciseSet[];
  createdAt: string;
}

interface WorkoutSession {
  id: string;
  programId: string;
  programName: string;
  startTime: number;
  currentExerciseIndex: number;
  currentSetIndex: number;
  totalTime: number;
  bodyPartTime: number;
  isPaused: boolean;
  isCompleted: boolean;
  isStarted: boolean; // 새로 추가
  exercises: ExerciseSet[];
}

const defaultExercises: Exercise[] = [
  // 가슴
  { id: '1', name: '벤치프레스', bodyPart: '가슴' },
  { id: '2', name: '인클라인 벤치프레스', bodyPart: '가슴' },
  { id: '3', name: '딥스', bodyPart: '가슴' },
  { id: '4', name: '푸시업', bodyPart: '가슴' },
  // 등
  { id: '5', name: '데드리프트', bodyPart: '등' },
  { id: '6', name: '풀업', bodyPart: '등' },
  { id: '7', name: '바벨로우', bodyPart: '등' },
  { id: '8', name: '랫풀다운', bodyPart: '등' },
  // 어깨
  { id: '9', name: '숄더프레스', bodyPart: '어깨' },
  { id: '10', name: '사이드레터럴레이즈', bodyPart: '어깨' },
  { id: '11', name: '리어델트플라이', bodyPart: '어깨' },
  // 팔
  { id: '12', name: '바이셉컬', bodyPart: '팔' },
  { id: '13', name: '트라이셉딥스', bodyPart: '팔' },
  { id: '14', name: '해머컬', bodyPart: '팔' },
  // 복근
  { id: '15', name: '크런치', bodyPart: '복근' },
  { id: '16', name: '플랭크', bodyPart: '복근' },
  { id: '17', name: '러시안트위스트', bodyPart: '복근' },
  // 하체
  { id: '18', name: '스쿼트', bodyPart: '하체' },
  { id: '19', name: '런지', bodyPart: '하체' },
  { id: '20', name: '레그프레스', bodyPart: '하체' },
  // 유산소
  { id: '21', name: '러닝머신', bodyPart: '유산소' },
  { id: '22', name: '사이클', bodyPart: '유산소' },
  { id: '23', name: '로잉머신', bodyPart: '유산소' }
];

// 샘플 프로그램 데이터
const samplePrograms: Program[] = [
  {
    id: '1',
    name: '상체 집중 루틴',
    description: '가슴, 등, 어깨를 중심으로 한 상체 강화 프로그램',
    exercises: [
      {
        id: 'ex1',
        exerciseId: '1',
        sets: [
          { id: 'set1', reps: 12, weight: 60, restTime: 90 },
          { id: 'set2', reps: 10, weight: 65, restTime: 90 },
          { id: 'set3', reps: 8, weight: 70, restTime: 120 }
        ]
      },
      {
        id: 'ex2',
        exerciseId: '6',
        sets: [
          { id: 'set4', reps: 8, restTime: 120 },
          { id: 'set5', reps: 6, restTime: 120 },
          { id: 'set6', reps: 5, restTime: 180 }
        ]
      },
      {
        id: 'ex3',
        exerciseId: '9',
        sets: [
          { id: 'set7', reps: 12, weight: 20, restTime: 60 },
          { id: 'set8', reps: 10, weight: 22, restTime: 60 },
          { id: 'set9', reps: 8, weight: 25, restTime: 90 }
        ]
      }
    ],
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: '하체 강화 프로그램',
    description: '스쿼트와 런지를 중심으로 한 하체 근력 향상',
    exercises: [
      {
        id: 'ex4',
        exerciseId: '18',
        sets: [
          { id: 'set10', reps: 15, weight: 80, restTime: 120 },
          { id: 'set11', reps: 12, weight: 90, restTime: 120 },
          { id: 'set12', reps: 10, weight: 100, restTime: 150 }
        ]
      },
      {
        id: 'ex5',
        exerciseId: '19',
        sets: [
          { id: 'set13', reps: 12, restTime: 90 },
          { id: 'set14', reps: 10, restTime: 90 },
          { id: 'set15', reps: 8, restTime: 120 }
        ]
      }
    ],
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    name: '전신 운동 루틴',
    description: '상체와 하체를 골고루 단련하는 전신 운동',
    exercises: [
      {
        id: 'ex6',
        exerciseId: '5',
        sets: [
          { id: 'set16', reps: 8, weight: 100, restTime: 180 },
          { id: 'set17', reps: 6, weight: 110, restTime: 180 },
          { id: 'set18', reps: 5, weight: 120, restTime: 240 }
        ]
      },
      {
        id: 'ex7',
        exerciseId: '4',
        sets: [
          { id: 'set19', reps: 20, restTime: 60 },
          { id: 'set20', reps: 15, restTime: 60 },
          { id: 'set21', reps: 12, restTime: 90 }
        ]
      }
    ],
    createdAt: '2024-01-12'
  }
];

export default function WorkoutPage() {
  const [programs] = useState<Program[]>(samplePrograms);
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession | null>(null);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const getExerciseName = (exerciseId: string) => {
    return defaultExercises.find(ex => ex.id === exerciseId)?.name || '';
  };

  const getExerciseBodyPart = (exerciseId: string) => {
    return defaultExercises.find(ex => ex.id === exerciseId)?.bodyPart || '';
  };

  const startWorkout = (program: Program) => {
    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      programId: program.id,
      programName: program.name,
      startTime: Date.now(),
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      totalTime: 0,
      bodyPartTime: 0,
      isPaused: false,
      isCompleted: false,
      isStarted: false, // 처음에는 시작되지 않은 상태
      exercises: program.exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(set => ({ ...set, completed: false })),
        completed: false
      }))
    };
    setWorkoutSession(newSession);
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

  // 프로그램 선택 화면
  if (!workoutSession) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* 헤더 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Link to="/" className="hover:text-blue-600">홈</Link>
              <i className="ri-arrow-right-s-line"></i>
              <span>운동하기</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">운동하기</h1>
              <p className="text-gray-600 mt-1">프로그램을 선택하여 운동을 시작하세요</p>
            </div>
          </div>

          {/* 프로그램 목록 */}
          {programs.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-fitness-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">운동 프로그램이 없습니다</h3>
              <p className="text-gray-600 mb-4">먼저 운동 프로그램을 만들어주세요</p>
              <Link to="/programs">
                <Button>
                  <i className="ri-add-line mr-2"></i>
                  프로그램 만들기
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {programs.map((program) => (
                <Card key={program.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{program.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{program.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <i className="ri-list-check-line"></i>
                          <span>{program.exercises.length}개 운동</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <i className="ri-repeat-line"></i>
                          <span>{program.exercises.reduce((total, ex) => total + ex.sets.length, 0)}세트</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <i className="ri-time-line"></i>
                          <span>약 {Math.round(program.exercises.reduce((total, ex) => 
                            total + ex.sets.reduce((setTotal, set) => setTotal + set.restTime, 0), 0) / 60)}분</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 sm:flex-col sm:w-auto w-full">
                      <Button 
                        onClick={() => startWorkout(program)}
                        className="flex-1 sm:flex-none sm:w-32"
                      >
                        <i className="ri-play-line mr-2"></i>
                        운동 시작
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

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
            <span>운동하기</span>
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