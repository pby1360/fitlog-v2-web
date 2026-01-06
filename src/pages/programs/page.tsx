import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import Input from '../../components/base/Input';
import Header from '../../components/feature/Header';

import { getWorkoutParts, getWorkouts } from '../../services/api';

interface WorkoutPart {
  id: number;
  name: string;
}

interface Exercise {
  id: number;
  name: string;
  bodyPart: string;
  bodyPartId: number;
}

interface ExerciseSetDetail {
  id: string;
  reps: number;
  weight?: number;
  restTime: number;
  memo?: string;
}

interface ExerciseSet {
  id: string;
  exerciseId: number;
  sets: ExerciseSetDetail[];
}

interface Program {
  id: string;
  name: string;
  description: string;
  exercises: ExerciseSet[];
  createdAt: string;
}

const samplePrograms: Program[] = [
  {
    id: '1',
    name: '상체 집중 루틴',
    description: '가슴, 등, 어깨를 중심으로 한 상체 강화 프로그램',
    exercises: [
      {
        id: 'ex1',
        exerciseId: 1,
        sets: [
          { id: 'set1', reps: 12, weight: 60, restTime: 90 },
          { id: 'set2', reps: 10, weight: 65, restTime: 90 },
          { id: 'set3', reps: 8, weight: 70, restTime: 120 }
        ]
      },
      {
        id: 'ex2',
        exerciseId: 6,
        sets: [
          { id: 'set4', reps: 8, restTime: 120 },
          { id: 'set5', reps: 6, restTime: 120 },
          { id: 'set6', reps: 5, restTime: 180 }
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
        id: 'ex3',
        exerciseId: 18,
        sets: [
          { id: 'set7', reps: 15, weight: 80, restTime: 120 },
          { id: 'set8', reps: 12, weight: 90, restTime: 120 },
          { id: 'set9', reps: 10, weight: 100, restTime: 150 }
        ]
      }
    ],
    createdAt: '2024-01-10'
  }
];


export default function ProgramsPage() {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [programs, setPrograms] = useState<Program[]>(samplePrograms);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [bodyParts, setBodyParts] = useState<WorkoutPart[]>([]);
  const [programExercises, setProgramExercises] = useState<ExerciseSet[]>([]);
  const [programName, setProgramName] = useState('');
  const [programDescription, setProgramDescription] = useState('');
  
  // 모달 상태
  const [showAddBodyPartModal, setShowAddBodyPartModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showEditExerciseModal, setShowEditExerciseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProgramId, setDeletingProgramId] = useState<string | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [newBodyPart, setNewBodyPart] = useState('');
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseBodyPart, setNewExerciseBodyPart] = useState<number | ''>('');

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedBodyParts([]);
    setProgramExercises([]);
    setProgramName('');
    setProgramDescription('');
    setEditingProgram(null);
  };

  const startCreateProgram = () => {
    resetForm();
    setView('create');
  };

  const startEditProgram = (program: Program) => {
    setEditingProgram(program);
    setProgramName(program.name);
    setProgramDescription(program.description);
    setProgramExercises(program.exercises);
    setView('edit');
    setCurrentStep(1);
  };

  const deleteProgram = (programId: string) => {
    setPrograms(programs.filter(p => p.id !== programId));
    setShowDeleteModal(false);
    setDeletingProgramId(null);
  };

  const addBodyPart = () => {
    if (newBodyPart.trim() && !bodyParts.some(bp => bp.name === newBodyPart.trim())) {
      const newBodyPartObj: WorkoutPart = {
        id: Date.now(), // 임시 ID, 실제로는 백엔드에서 생성된 ID를 사용해야 함
        name: newBodyPart.trim()
      };
      setBodyParts([...bodyParts, newBodyPartObj]);
      setNewBodyPart('');
      setShowAddBodyPartModal(false);
    }
  };

  const deleteBodyPart = (bodyPartName: string) => {
    setBodyParts(bodyParts.filter(bp => bp.name !== bodyPartName));
    setExercises(exercises.filter(ex => ex.bodyPart !== bodyPartName));
    setSelectedBodyParts(selectedBodyParts.filter(bp => bp !== bodyPartName));
  };

  const toggleBodyPart = (bodyPartName: string) => {
    if (selectedBodyParts.includes(bodyPartName)) {
      setSelectedBodyParts(selectedBodyParts.filter(bp => bp !== bodyPartName));
    } else {
      setSelectedBodyParts([...selectedBodyParts, bodyPartName]);
    }
  };

  const addExercise = () => {
    if (newExerciseName.trim() && newExerciseBodyPart) {
      const bodyPartObj = bodyParts.find(bp => bp.id === newExerciseBodyPart);
      if (!bodyPartObj) return;

      const newExercise: Exercise = {
        id: Date.now(), // 임시 ID, 실제로는 백엔드에서 생성된 ID를 사용해야 함
        name: newExerciseName.trim(),
        bodyPart: bodyPartObj.name,
        bodyPartId: bodyPartObj.id
      };
      setExercises([...exercises, newExercise]);
      setNewExerciseName('');
      setNewExerciseBodyPart('');
      setShowAddExerciseModal(false);
    }
  };

  const deleteExercise = (exerciseId: number) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
    setProgramExercises(programExercises.filter(pe => pe.exerciseId !== exerciseId));
  };

  const editExercise = () => {
    if (editingExercise && newExerciseName.trim()) {
      const bodyPartObj = bodyParts.find(bp => bp.id === newExerciseBodyPart);
      if (!bodyPartObj) return;

      setExercises(exercises.map(ex => 
        ex.id === editingExercise.id 
          ? { ...ex, name: newExerciseName.trim(), bodyPart: bodyPartObj.name, bodyPartId: bodyPartObj.id }
          : ex
      ));
      setEditingExercise(null);
      setNewExerciseName('');
      setNewExerciseBodyPart('');
      setShowEditExerciseModal(false);
    }
  };

  const addExerciseToProgram = (exercise: Exercise) => {
    const newProgramExercise: ExerciseSet = {
      id: Date.now().toString(),
      exerciseId: exercise.id,
      sets: [
        {
          id: Date.now().toString() + '_1',
          reps: 10,
          restTime: 60
        }
      ]
    };
    setProgramExercises([...programExercises, newProgramExercise]);
  };

  const addSetToExercise = (exerciseSetId: string) => {
    setProgramExercises(programExercises.map(pe => 
      pe.id === exerciseSetId 
        ? {
            ...pe,
            sets: [
              ...pe.sets,
              {
                id: Date.now().toString() + '_' + (pe.sets.length + 1),
                reps: 10,
                restTime: 60
              }
            ]
          }
        : pe
    ));
  };

  const removeSetFromExercise = (exerciseSetId: string, setId: string) => {
    setProgramExercises(programExercises.map(pe => 
      pe.id === exerciseSetId 
        ? { ...pe, sets: pe.sets.filter(set => set.id !== setId) }
        : pe
    ));
  };

  const updateSet = (exerciseSetId: string, setId: string, field: keyof ExerciseSetDetail, value: number | string) => {
    setProgramExercises(programExercises.map(pe => 
      pe.id === exerciseSetId 
        ? {
            ...pe,
            sets: pe.sets.map(set => 
              set.id === setId ? { ...set, [field]: value } : set
            )
          }
        : pe
    ));
  };

  const removeExerciseFromProgram = (id: string) => {
    setProgramExercises(programExercises.filter(pe => pe.id !== id));
  };

  const getExerciseName = (exerciseId: number) => {
    return exercises.find(ex => ex.id === exerciseId)?.name || '';
  };

  const getExerciseBodyPart = (exerciseId: number) => {
    return exercises.find(ex => ex.id === exerciseId)?.bodyPart || '';
  };

  const saveProgram = () => {
    if (programName.trim() && programExercises.length > 0) {
      const newProgram: Program = {
        id: editingProgram?.id || Date.now().toString(),
        name: programName.trim(),
        description: programDescription.trim(),
        exercises: programExercises,
        createdAt: editingProgram?.createdAt || new Date().toISOString().split('T')[0]
      };

      if (editingProgram) {
        setPrograms(programs.map(p => p.id === editingProgram.id ? newProgram : p));
      } else {
        setPrograms([...programs, newProgram]);
      }

      resetForm();
      setView('list');
    }
  };

  const getExerciseCount = (program: Program) => {
    return program.exercises.length;
  };

  const getTotalSets = (program: Program) => {
    return program.exercises.reduce((total, ex) => total + ex.sets.length, 0);
  };

  const [draggedExerciseId, setDraggedExerciseId] = useState<number | null>(null);

  useEffect(() => {
    const fetchWorkoutData = async () => {
      try {
        const fetchedBodyParts = await getWorkoutParts();
        const fetchedExercises = await getWorkouts();
        setBodyParts(fetchedBodyParts);
        setExercises(fetchedExercises);
      } catch (error) {
        console.error("운동 데이터를 불러오는 데 실패했습니다:", error);
        // 사용자에게 에러 메시지를 표시하는 로직 추가
      }
    };

    fetchWorkoutData();
  }, []);

  const handleDragStart = (e: React.DragEvent, exerciseId: number) => {
    setDraggedExerciseId(exerciseId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetExerciseId: number) => {
    e.preventDefault();
    
    if (!draggedExerciseId || draggedExerciseId === targetExerciseId) {
      setDraggedExerciseId(null);
      return;
    }

    const draggedIndex = programExercises.findIndex(ex => ex.exerciseId === draggedExerciseId);
    const targetIndex = programExercises.findIndex(ex => ex.exerciseId === targetExerciseId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedExerciseId(null);
      return;
    }

    const newExercises = [...programExercises];
    const [draggedItem] = newExercises.splice(draggedIndex, 1);
    newExercises.splice(targetIndex, 0, draggedItem);

    setProgramExercises(newExercises);
    setDraggedExerciseId(null);
  };

  const moveExerciseUp = (index: number) => {
    if (index === 0) return;
    const newExercises = [...programExercises];
    [newExercises[index - 1], newExercises[index]] = [newExercises[index], newExercises[index - 1]];
    setProgramExercises(newExercises);
  };

  const moveExerciseDown = (index: number) => {
    if (index === programExercises.length - 1) return;
    const newExercises = [...programExercises];
    [newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]];
    setProgramExercises(newExercises);
  };

  // 프로그램 목록 화면
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* 헤더 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Link to="/" className="hover:text-blue-600">홈</Link>
              <i className="ri-arrow-right-s-line"></i>
              <span>프로그램</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">운동 프로그램</h1>
                <p className="text-gray-600 mt-1">나만의 운동 루틴을 관리하세요</p>
              </div>
              <Button onClick={startCreateProgram} className="whitespace-nowrap">
                <i className="ri-add-line mr-2"></i>
                새 프로그램 만들기
              </Button>
            </div>
          </div>

          {/* 프로그램 목록 */}
          {programs.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-fitness-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">아직 프로그램이 없습니다</h3>
              <p className="text-gray-600 mb-4">첫 번째 운동 프로그램을 만들어보세요</p>
              <Button onClick={startCreateProgram}>
                <i className="ri-add-line mr-2"></i>
                프로그램 만들기
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {programs.map((program) => (
                <Card key={program.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{program.name}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{program.description}</p>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <button
                        onClick={() => startEditProgram(program)}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <i className="ri-edit-line text-sm"></i>
                      </button>
                      <button
                        onClick={() => {
                          setDeletingProgramId(program.id);
                          setShowDeleteModal(true);
                        }}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <i className="ri-delete-bin-line text-sm"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <i className="ri-list-check-line"></i>
                      <span>{getExerciseCount(program)}개 운동</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <i className="ri-repeat-line"></i>
                      <span>{getTotalSets(program)}세트</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <i className="ri-calendar-line"></i>
                      <span>{program.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => startEditProgram(program)}
                    >
                      수정
                    </Button>
                    <Button size="sm" className="flex-1">
                      운동 시작
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 삭제 확인 모달 */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">프로그램 삭제</h3>
              <p className="text-gray-600 mb-6">정말로 이 프로그램을 삭제하시겠습니까? 삭제된 프로그램은 복구할 수 없습니다.</p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button 
                  onClick={() => deletingProgramId && deleteProgram(deletingProgramId)}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  삭제
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 프로그램 생성/수정 화면
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <button 
              onClick={() => setView('list')}
              className="hover:text-blue-600"
            >
              프로그램
            </button>
            <i className="ri-arrow-right-s-line"></i>
            <span>{view === 'edit' ? '프로그램 수정' : '프로그램 생성'}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {view === 'edit' ? '프로그램 수정' : '운동 프로그램 생성'}
              </h1>
              <p className="text-gray-600 mt-1">나만의 운동 루틴을 만들어보세요</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setView('list')}
              className="whitespace-nowrap"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              목록으로
            </Button>
          </div>
        </div>

        {/* 단계 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                <div className={`ml-2 text-sm ${currentStep >= step ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                  {step === 1 && '프로그램 정보'}
                  {step === 2 && '운동 부위'}
                  {step === 3 && '운동 항목'}
                  {step === 4 && '세트 설정'}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-0.5 mx-4 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 단계별 컨텐츠 */}
        <Card className="p-6">
          {/* 1단계: 프로그램 정보 */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">프로그램 기본 정보</h2>
              <div className="space-y-4">
                <Input
                  label="프로그램 이름"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  placeholder="예: 상체 집중 루틴"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    프로그램 설명
                  </label>
                  <textarea
                    value={programDescription}
                    onChange={(e) => setProgramDescription(e.target.value)}
                    placeholder="프로그램에 대한 간단한 설명을 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={() => setCurrentStep(2)}
                  disabled={!programName.trim()}
                >
                  다음 단계
                  <i className="ri-arrow-right-line ml-2"></i>
                </Button>
              </div>
            </div>
          )}

          {/* 2단계: 운동 부위 선택 (다중 선택) */}
          {currentStep === 2 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">운동 부위 선택</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAddBodyPartModal(true)}
                >
                  <i className="ri-add-line mr-1"></i>
                  부위 추가
                </Button>
              </div>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <i className="ri-information-line mr-1"></i>
                  여러 운동 부위를 선택할 수 있습니다. 선택된 부위: 
                  <span className="font-medium ml-1">
                    {selectedBodyParts.length > 0 ? selectedBodyParts.join(', ') : '없음'}
                  </span>
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {bodyParts.map((bodyPart) => (
                  <div key={bodyPart.id} className="relative group">
                    <button
                      onClick={() => toggleBodyPart(bodyPart.name)}
                      className={`w-full p-3 rounded-lg border-2 transition-colors ${
                        selectedBodyParts.includes(bodyPart.name)
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {selectedBodyParts.includes(bodyPart.name) && (
                          <i className="ri-check-line text-sm"></i>
                        )}
                        <span>{bodyPart.name}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => deleteBodyPart(bodyPart.name)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i className="ri-close-line text-xs"></i>
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <i className="ri-arrow-left-line mr-2"></i>
                  이전 단계
                </Button>
                <Button 
                  onClick={() => setCurrentStep(3)}
                  disabled={selectedBodyParts.length === 0}
                >
                  다음 단계
                  <i className="ri-arrow-right-line ml-2"></i>
                </Button>
              </div>
            </div>
          )}

          {/* 3단계: 운동 항목 선택 (부위별) */}
          {currentStep === 3 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">운동 항목 선택</h2>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddExerciseModal(true)}
                  >
                    <i className="ri-add-line mr-1"></i>
                    운동 추가
                  </Button>
                </div>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  선택된 부위별로 운동을 추가하세요: <span className="font-medium">{selectedBodyParts.join(', ')}</span>
                </p>
              </div>

              {/* 부위별 운동 목록 */}
              <div className="space-y-6 mb-6">
                {selectedBodyParts.map((bodyPart) => {
                  const bodyPartExercises = exercises.filter(ex => ex.bodyPart === bodyPart);
                  return (
                    <div key={bodyPart} className="border rounded-lg p-4 bg-white">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                        {bodyPart} 운동
                      </h3>
                      
                      {bodyPartExercises.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">이 부위에 등록된 운동이 없습니다.</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => {
                              const part = bodyParts.find(p => p.name === bodyPart);
                              if (part) {
                                setNewExerciseBodyPart(part.id);
                                setShowAddExerciseModal(true);
                              }
                            }}
                          >
                            운동 추가하기
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {bodyPartExercises.map((exercise) => (
                            <div key={exercise.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                              <span className="font-medium">{exercise.name}</span>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => addExerciseToProgram(exercise)}
                                  disabled={programExercises.some(pe => pe.exerciseId === exercise.id)}
                                  className="whitespace-nowrap"
                                >
                                  {programExercises.some(pe => pe.exerciseId === exercise.id) ? (
                                    <>
                                      <i className="ri-check-line mr-1"></i>
                                      추가됨
                                    </>
                                  ) : (
                                    <>
                                      <i className="ri-add-line mr-1"></i>
                                      추가
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingExercise(exercise);
                                    setNewExerciseName(exercise.name);
                                    setNewExerciseBodyPart(exercise.bodyPartId);
                                    setShowEditExerciseModal(true);
                                  }}
                                  className="whitespace-nowrap"
                                >
                                  <i className="ri-edit-line"></i>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteExercise(exercise.id)}
                                  className="text-red-600 hover:bg-red-50 whitespace-nowrap"
                                >
                                  <i className="ri-delete-bin-line"></i>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 선택된 운동 목록 */}
              {programExercises.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">선택된 운동 ({programExercises.length}개)</h3>
                    <p className="text-sm text-gray-600">
                      <i className="ri-drag-move-line mr-1"></i>
                      드래그하여 순서 변경
                    </p>
                  </div>
                  <div className="space-y-2">
                    {programExercises.map((programExercise, index) => (
                      <div 
                        key={programExercise.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, programExercise.exerciseId)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, programExercise.exerciseId)}
                        className={`flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg cursor-move hover:shadow-md transition-all ${
                          draggedExerciseId === programExercise.exerciseId ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => moveExerciseUp(index)}
                              disabled={index === 0}
                              className={`w-6 h-6 flex items-center justify-center rounded ${
                                index === 0 
                                  ? 'text-gray-300 cursor-not-allowed' 
                                  : 'text-gray-600 hover:bg-green-200 cursor-pointer'
                              }`}
                            >
                              <i className="ri-arrow-up-s-line text-sm"></i>
                            </button>
                            <button
                              onClick={() => moveExerciseDown(index)}
                              disabled={index === programExercises.length - 1}
                              className={`w-6 h-6 flex items-center justify-center rounded ${
                                index === programExercises.length - 1
                                  ? 'text-gray-300 cursor-not-allowed' 
                                  : 'text-gray-600 hover:bg-green-200 cursor-pointer'
                              }`}
                            >
                              <i className="ri-arrow-down-s-line text-sm"></i>
                            </button>
                          </div>
                          <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-medium text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <span className="font-medium text-green-800">{getExerciseName(programExercise.exerciseId)}</span>
                            <span className="text-sm text-green-600 ml-2">({getExerciseBodyPart(programExercise.exerciseId)})</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <i className="ri-draggable text-gray-400"></i>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeExerciseFromProgram(programExercise.id)}
                            className="text-red-600 hover:bg-red-50 whitespace-nowrap"
                          >
                            <i className="ri-close-line mr-1"></i>
                            제거
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <i className="ri-arrow-left-line mr-2"></i>
                  이전 단계
                </Button>
                <Button 
                  onClick={() => setCurrentStep(4)}
                  disabled={programExercises.length === 0}
                >
                  다음 단계
                  <i className="ri-arrow-right-line ml-2"></i>
                </Button>
              </div>
            </div>
          )}

          {/* 4단계: 세트 설정 */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">세트별 상세 설정</h2>
              
              <div className="space-y-6 mb-6">
                {programExercises.map((programExercise) => (
                  <div key={programExercise.id} className="p-4 border rounded-lg bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-lg">{getExerciseName(programExercise.exerciseId)}</h3>
                        <span className="text-sm text-gray-600">({getExerciseBodyPart(programExercise.exerciseId)})</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addSetToExercise(programExercise.id)}
                          className="whitespace-nowrap"
                        >
                          <i className="ri-add-line mr-1"></i>
                          세트 추가
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeExerciseFromProgram(programExercise.id)}
                          className="text-red-600 hover:bg-red-50 whitespace-nowrap"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {programExercise.sets.map((set, index) => (
                        <div key={set.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-sm text-gray-700">세트 {index + 1}</span>
                            {programExercise.sets.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeSetFromExercise(programExercise.id, set.id)}
                                className="text-red-600 hover:bg-red-50 whitespace-nowrap"
                              >
                                <i className="ri-close-line"></i>
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">횟수</label>
                              <input
                                type="number"
                                min="1"
                                value={set.reps}
                                onChange={(e) => updateSet(programExercise.id, set.id, 'reps', parseInt(e.target.value) || 1)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">무게(kg)</label>
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={set.weight || ''}
                                onChange={(e) => updateSet(programExercise.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                                placeholder="선택사항"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">휴식시간(초)</label>
                              <input
                                type="number"
                                min="0"
                                step="30"
                                value={set.restTime}
                                onChange={(e) => updateSet(programExercise.id, set.id, 'restTime', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-1">
                              <label className="block text-xs font-medium text-gray-700 mb-1">메모</label>
                              <input
                                type="text"
                                value={set.memo || ''}
                                onChange={(e) => updateSet(programExercise.id, set.id, 'memo', e.target.value)}
                                placeholder="메모 입력"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  <i className="ri-arrow-left-line mr-2"></i>
                  이전 단계
                </Button>
                <Button onClick={saveProgram}>
                  <i className="ri-save-line mr-2"></i>
                  {view === 'edit' ? '프로그램 수정' : '프로그램 저장'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 운동 부위 추가 모달 */}
      {showAddBodyPartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">운동 부위 추가</h3>
            <Input
              label="부위 이름"
              value={newBodyPart}
              onChange={(e) => setNewBodyPart(e.target.value)}
              placeholder="예: 전신"
            />
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddBodyPartModal(false)}>
                취소
              </Button>
              <Button onClick={addBodyPart}>추가</Button>
            </div>
          </div>
        </div>
      )}

      {/* 운동 추가 모달 */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">운동 추가</h3>
            <div className="space-y-4">
              <Input
                label="운동 이름"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                placeholder="예: 체스트플라이"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">운동 부위</label>
                <select
                  value={newExerciseBodyPart}
                  onChange={(e) => setNewExerciseBodyPart(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  {bodyParts.map((bodyPart) => (
                    <option key={bodyPart.id} value={bodyPart.id}>{bodyPart.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddExerciseModal(false)}>
                취소
              </Button>
              <Button onClick={addExercise}>추가</Button>
            </div>
          </div>
        </div>
      )}

      {/* 운동 수정 모달 */}
      {showEditExerciseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">운동 수정</h3>
            <div className="space-y-4">
              <Input
                label="운동 이름"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">운동 부위</label>
                <select
                  value={newExerciseBodyPart}
                  onChange={(e) => setNewExerciseBodyPart(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  {bodyParts.map((bodyPart) => (
                    <option key={bodyPart.id} value={bodyPart.id}>{bodyPart.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowEditExerciseModal(false)}>
                취소
              </Button>
              <Button onClick={editExercise}>수정</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
