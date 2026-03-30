import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import Header from '../../components/feature/Header';
import { getWorkoutPrograms, ProgramResponse, startWorkoutSession, getLatestWorkoutSession, getWorkouts, WorkoutResponse, CustomExerciseDto } from '../../services/api';

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
  const [allWorkouts, setAllWorkouts] = useState<WorkoutResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [view, setView] = useState<'select' | 'edit'>('select');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [editableExercises, setEditableExercises] = useState<ExerciseSet[]>([]);
  const [draggedExerciseIndex, setDraggedExerciseIndex] = useState<number | null>(null);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [addExerciseFilter, setAddExerciseFilter] = useState('');
  const [pendingWorkout, setPendingWorkout] = useState<WorkoutResponse | null>(null);
  const [pendingSets, setPendingSets] = useState<{ reps: number; weight: number; restTime: number }[]>([]);
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

        const [fetchedPrograms, fetchedWorkouts]: [ProgramResponse[], WorkoutResponse[]] = await Promise.all([
          getWorkoutPrograms(),
          getWorkouts()
        ]);

        setAllWorkouts(fetchedWorkouts);

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
              workoutPartName: fetchedWorkouts.find(w => w.id === ex.workoutId)?.bodyPart || '',
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
        alert("데이터를 불러오는데 실패했습니다.");
        console.error("Failed to initialize workout page:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [navigate]);

  // 프로그램 선택 → 편집 화면으로 전환
  const handleSelectProgram = (program: Program) => {
    setSelectedProgram(program);
    setEditableExercises([...program.exercises.map(ex => ({ ...ex, sets: [...ex.sets] }))]);
    setView('edit');
  };

  // 편집 화면에서 운동 시작
  const handleConfirmStart = async () => {
    if (!selectedProgram) return;
    setIsStarting(true);
    try {
      const customExercises: CustomExerciseDto[] = editableExercises.map((ex, index) => ({
        workoutId: ex.exerciseId,
        order: index + 1,
        sets: ex.sets.map((set, setIndex) => ({
          setNumber: setIndex + 1,
          weight: set.weight,
          reps: set.reps,
          restTime: set.restTime,
          memo: set.memo,
        })),
      }));

      await startWorkoutSession(selectedProgram.id, customExercises);
      navigate('/workout/session');
    } catch (error) {
      alert("운동을 시작하는 중 오류가 발생했습니다.");
      console.error("Failed to start workout session:", error);
    } finally {
      setIsStarting(false);
    }
  };

  // 드래그앤드롭 핸들러
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedExerciseIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedExerciseIndex === null || draggedExerciseIndex === targetIndex) return;

    const updated = [...editableExercises];
    const [moved] = updated.splice(draggedExerciseIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setEditableExercises(updated);
    setDraggedExerciseIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedExerciseIndex(null);
  };

  const moveExerciseUp = (index: number) => {
    if (index === 0) return;
    const updated = [...editableExercises];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setEditableExercises(updated);
  };

  const moveExerciseDown = (index: number) => {
    if (index >= editableExercises.length - 1) return;
    const updated = [...editableExercises];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setEditableExercises(updated);
  };

  const removeExercise = (index: number) => {
    setEditableExercises(prev => prev.filter((_, i) => i !== index));
  };

  // 운동 선택 → 세트 구성 화면으로
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

  // 세트 구성 확정 후 운동 추가
  const confirmAddExercise = () => {
    if (!pendingWorkout) return;
    const newExercise: ExerciseSet = {
      id: `ex-new-${Date.now()}`,
      exerciseId: pendingWorkout.id,
      workoutName: pendingWorkout.name,
      workoutPartName: pendingWorkout.bodyPart,
      sets: pendingSets.map((s, i) => ({
        id: `set-new-${Date.now()}-${i}`,
        reps: s.reps,
        weight: s.weight || undefined,
        restTime: s.restTime,
      })),
    };
    setEditableExercises(prev => [...prev, newExercise]);
    setPendingWorkout(null);
    setPendingSets([]);
    setShowAddExerciseModal(false);
    setAddExerciseFilter('');
  };

  const closeAddExerciseModal = () => {
    setShowAddExerciseModal(false);
    setPendingWorkout(null);
    setPendingSets([]);
    setAddExerciseFilter('');
  };

  // 필터링된 운동 목록
  const filteredWorkouts = allWorkouts.filter(w =>
    w.name.toLowerCase().includes(addExerciseFilter.toLowerCase()) ||
    w.bodyPart.toLowerCase().includes(addExerciseFilter.toLowerCase())
  );

  // 부위별 그룹핑
  const groupedWorkouts = filteredWorkouts.reduce<Record<string, WorkoutResponse[]>>((acc, w) => {
    if (!acc[w.bodyPart]) acc[w.bodyPart] = [];
    acc[w.bodyPart].push(w);
    return acc;
  }, {});

  // 편집 화면
  if (view === 'edit' && selectedProgram) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        <Header />

        {isStarting && (
          <div className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-[100] flex flex-col items-center justify-center text-white">
            <div className="w-12 h-12 border-4 border-blue-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium">운동을 시작하는 중...</p>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* 헤더 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-600 mb-2">
              <Link to="/" className="hover:text-gray-700 dark:hover:text-gray-300">홈</Link>
              <i className="ri-arrow-right-s-line"></i>
              <button onClick={() => setView('select')} className="hover:text-gray-700 dark:hover:text-gray-300">운동하기</button>
              <i className="ri-arrow-right-s-line"></i>
              <span>운동 편집</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedProgram.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">운동 순서를 변경하거나 새로운 운동을 추가하세요</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setView('select')}>
                  <i className="ri-arrow-left-line mr-1"></i>
                  뒤로
                </Button>
                <Button
                  onClick={handleConfirmStart}
                  disabled={editableExercises.length === 0 || isStarting}
                >
                  <i className="ri-play-line mr-1"></i>
                  운동 시작
                </Button>
              </div>
            </div>
          </div>

          {/* 운동 목록 요약 */}
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-xl p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <i className="ri-list-check-line text-blue-600 dark:text-indigo-400"></i>
                <span>{editableExercises.length}개 운동</span>
              </div>
              <div className="flex items-center gap-1">
                <i className="ri-repeat-line text-blue-600 dark:text-indigo-400"></i>
                <span>{editableExercises.reduce((t, ex) => t + ex.sets.length, 0)}세트</span>
              </div>
              <div className="flex items-center gap-1 text-blue-600 dark:text-indigo-400">
                <i className="ri-information-line"></i>
                <span>드래그하여 순서 변경</span>
              </div>
            </div>
          </div>

          {/* 편집 가능한 운동 목록 */}
          <div className="space-y-3 mb-6">
            {editableExercises.map((exercise, index) => (
              <div
                key={exercise.id + '-' + index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`bg-white dark:bg-[#111] rounded-lg border-2 p-4 transition-all cursor-move ${
                  draggedExerciseIndex === index
                    ? 'opacity-50 border-indigo-400/40'
                    : 'border-gray-200 dark:border-white/8 hover:border-gray-300 dark:hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* 드래그 핸들 */}
                  <div className="text-gray-300 dark:text-gray-700 flex-shrink-0">
                    <i className="ri-draggable text-xl"></i>
                  </div>

                  {/* 순서 번호 */}
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-indigo-500/15 text-blue-700 dark:text-indigo-300 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>

                  {/* 운동 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">{exercise.workoutName}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded text-xs">{exercise.workoutPartName}</span>
                      <span>{exercise.sets.length}세트</span>
                      {exercise.sets[0]?.weight ? (
                        <span>{exercise.sets[0].weight}kg</span>
                      ) : null}
                    </div>
                  </div>

                  {/* 순서 변경 버튼 */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveExerciseUp(index); }}
                      disabled={index === 0}
                      className={`p-1 rounded ${index === 0 ? 'text-gray-200 dark:text-gray-800' : 'text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}`}
                    >
                      <i className="ri-arrow-up-s-line text-lg"></i>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveExerciseDown(index); }}
                      disabled={index === editableExercises.length - 1}
                      className={`p-1 rounded ${index === editableExercises.length - 1 ? 'text-gray-200 dark:text-gray-800' : 'text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}`}
                    >
                      <i className="ri-arrow-down-s-line text-lg"></i>
                    </button>
                  </div>

                  {/* 삭제 버튼 */}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeExercise(index); }}
                    className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded flex-shrink-0"
                    title="운동 삭제"
                  >
                    <i className="ri-delete-bin-line text-lg"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 운동 추가 버튼 */}
          <button
            onClick={() => setShowAddExerciseModal(true)}
            className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-lg text-gray-400 dark:text-gray-600 hover:border-blue-300 dark:hover:border-indigo-400/50 hover:text-blue-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
          >
            <i className="ri-add-line text-xl"></i>
            <span className="font-medium">운동 추가</span>
          </button>

          {/* 하단 시작 버튼 */}
          {editableExercises.length > 0 && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setEditableExercises([...selectedProgram.exercises.map(ex => ({ ...ex, sets: [...ex.sets] }))]);
                }}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 px-4 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <i className="ri-refresh-line mr-1"></i>
                초기화
              </button>
              <button
                onClick={handleConfirmStart}
                disabled={isStarting}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                <i className="ri-play-line mr-1"></i>
                운동 시작 ({editableExercises.length}개 운동)
              </button>
            </div>
          )}
        </div>

        {/* 운동 추가 모달 */}
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
                              const alreadyAdded = editableExercises.some(ex => ex.exerciseId === workout.id);
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
                      className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                    >
                      {pendingSets.length}세트로 추가
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 프로그램 선택 화면 (기존)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <Header />

      {isStarting && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-[100] flex flex-col items-center justify-center text-white">
          <div className="w-12 h-12 border-4 border-blue-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium">운동을 시작하는 중...</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-600 mb-2">
            <Link to="/" className="hover:text-gray-700 dark:hover:text-gray-300">홈</Link>
            <i className="ri-arrow-right-s-line"></i>
            <span>운동하기</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">운동하기</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">프로그램을 선택하여 운동을 시작하세요</p>
          </div>
        </div>

        {isLoading ? (
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : programs.length === 0 ? (
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-fitness-line text-2xl text-gray-400 dark:text-gray-600"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">운동 프로그램이 없습니다</h3>
            <p className="text-gray-500 mb-4">먼저 운동 프로그램을 만들어주세요</p>
            <Link to="/programs">
              <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity text-sm">
                <i className="ri-add-line"></i>
                프로그램 만들기
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {programs.map((program) => (
              <div key={program.id} className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 rounded-2xl p-6 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{program.name}</h3>
                    <p className="text-gray-500 text-sm mb-3">{program.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 dark:text-gray-600">
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
                    <button
                      onClick={() => handleSelectProgram(program)}
                      className="flex-1 sm:flex-none sm:w-32 flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity text-sm"
                    >
                      <i className="ri-play-line"></i>
                      운동 시작
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
