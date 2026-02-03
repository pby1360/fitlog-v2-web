import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import Header from '../../components/feature/Header';
import { getWorkoutPrograms, ProgramResponse, startWorkoutSession, getLatestWorkoutSession, getWorkouts, WorkoutResponse } from '../../services/api';

interface ExerciseSet {
  id: string;
  exerciseId: number;
  workoutName: string;
  workoutPartName: string;
  sets: {
    id: string;
    reps: number;
    weight?: number;
    restTime: number;
    memo?: string;
  }[];
}

interface Program {
  id: number;
  name: string;
  description: string;
  exercises: ExerciseSet[];
  createdAt: string;
}

export default function WorkoutPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializePage = async () => {
      setIsLoading(true);
      try {
        const activeSession = await getLatestWorkoutSession();
        if (activeSession) {
          navigate('/workout/session');
          return;
        }

        const [fetchedPrograms, allWorkouts]: [ProgramResponse[], WorkoutResponse[]] = await Promise.all([
          getWorkoutPrograms(),
          getWorkouts()
        ]);

        const transformedPrograms: Program[] = fetchedPrograms.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          createdAt: p.createdAt,
          exercises: p.parts.flatMap(part =>
            part.exercises.map(ex => ({
              id: `ex-${ex.id}`,
              exerciseId: ex.workoutId,
              workoutName: ex.workoutName,
              workoutPartName: allWorkouts.find(w => w.id === ex.workoutId)?.bodyPart || '',
              sets: ex.sets.map(set => ({
                id: `set-${set.id}`,
                reps: set.reps,
                weight: set.weight,
                restTime: set.restTime,
                memo: set.memo,
              })),
            }))
          ),
        }));
        setPrograms(transformedPrograms);
      } catch (error) {
        console.error("Failed to initialize workout page:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [navigate]);

  const handleStartWorkout = async (programId: number) => {
    try {
      await startWorkoutSession(programId);
      navigate('/workout/session');
    } catch (error) {
      console.error("Failed to start workout session:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
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

        {isLoading ? (
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          </div>
        ) : programs.length === 0 ? (
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
                      onClick={() => handleStartWorkout(program.id)}
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