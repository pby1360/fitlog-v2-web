
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import Input from '../../components/base/Input';
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
}

interface ExerciseSet {
  id: string;
  exerciseId: string;
  sets: ExerciseSetDetail[];
}

interface Program {
  id: string;
  name: string;
  description: string;
  exercises: ExerciseSet[];
  createdAt: string;
}

const defaultBodyParts = [
  '가슴', '등', '어깨', '팔', '복근', '하체', '유산소'
];

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
        exerciseId: '18',
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
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>(defaultExercises);
  const [bodyParts, setBodyParts] = useState<string[]>(defaultBodyParts);
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
  const [newExerciseBodyPart, setNewExerciseBodyPart] = useState('');

  const filteredExercises = selectedBodyPart 
    ? exercises.filter(ex => ex.bodyPart === selectedBodyPart)
    : exercises;

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedBodyPart('');
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
    if (newBodyPart.trim() && !bodyParts.includes(newBodyPart.trim())) {
      setBodyParts([...bodyParts, newBodyPart.trim()]);
      setNewBodyPart('');
      setShowAddBodyPartModal(false);
    }
  };

  const deleteBodyPart = (bodyPart: string) => {
    setBodyParts(bodyParts.filter(bp => bp !== bodyPart));
    setExercises(exercises.filter(ex => ex.bodyPart !== bodyPart));
    if (selectedBodyPart === bodyPart) {
      setSelectedBodyPart('');
    }
  };

  const addExercise = () => {
    if (newExerciseName.trim() && newExerciseBodyPart) {
      const newExercise: Exercise = {
        id: Date.now().toString(),
        name: newExerciseName.trim(),
        bodyPart: newExerciseBodyPart
      };
      setExercises([...exercises, newExercise]);
      setNewExerciseName('');
      setNewExerciseBodyPart('');
      setShowAddExerciseModal(false);
    }
  };

  const deleteExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
    setProgramExercises(programExercises.filter(pe => pe.exerciseId !== exerciseId));
  };

  const editExercise = () => {
    if (editingExercise && newExerciseName.trim()) {
      setExercises(exercises.map(ex => 
        ex.id === editingExercise.id 
          ? { ...ex, name: newExerciseName.trim(), bodyPart: newExerciseBodyPart }
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

  const getExerciseName = (exerciseId: string) => {
    return exercises.find(ex => ex.id === exerciseId)?.name || '';
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

          {/* 2단계: 운동 부위 선택 */}
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
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {bodyParts.map((bodyPart) => (
                  <div key={bodyPart} className="relative group">
                    <button
                      onClick={() => setSelectedBodyPart(selectedBodyPart === bodyPart ? '' : bodyPart)}
                      className={`w-full p-3 rounded-lg border-2 transition-colors ${
                        selectedBodyPart === bodyPart
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {bodyPart}
                    </button>
                    <button
                      onClick={() => deleteBodyPart(bodyPart)}
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
                  disabled={!selectedBodyPart}
                >
                  다음 단계
                  <i className="ri-arrow-right-line ml-2"></i>
                </Button>
              </div>
            </div>
          )}

          {/* 3단계: 운동 항목 선택 */}
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
                  선택된 부위: <span className="font-medium">{selectedBodyPart}</span>
                </p>
              </div>

              <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                {filteredExercises.map((exercise) => (
                  <div key={exercise.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <span className="font-medium">{exercise.name}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => addExerciseToProgram(exercise)}
                        disabled={programExercises.some(pe => pe.exerciseId === exercise.id)}
                      >
                        {programExercises.some(pe => pe.exerciseId === exercise.id) ? '추가됨' : '추가'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingExercise(exercise);
                          setNewExerciseName(exercise.name);
                          setNewExerciseBodyPart(exercise.bodyPart);
                          setShowEditExerciseModal(true);
                        }}
                      >
                        <i className="ri-edit-line"></i>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteExercise(exercise.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

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
                      <h3 className="font-medium text-lg">{getExerciseName(programExercise.exerciseId)}</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addSetToExercise(programExercise.id)}
                        >
                          <i className="ri-add-line mr-1"></i>
                          세트 추가
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeExerciseFromProgram(programExercise.id)}
                          className="text-red-600 hover:bg-red-50"
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
                                className="text-red-600 hover:bg-red-50"
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
                  onChange={(e) => setNewExerciseBodyPart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  <option value="">부위 선택</option>
                  {bodyParts.map((bodyPart) => (
                    <option key={bodyPart} value={bodyPart}>{bodyPart}</option>
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
                  onChange={(e) => setNewExerciseBodyPart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  {bodyParts.map((bodyPart) => (
                    <option key={bodyPart} value={bodyPart}>{bodyPart}</option>
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
