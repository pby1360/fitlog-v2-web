import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';
import Header from '../../components/feature/Header';
import { getWorkouts, getWorkoutParts, addWorkout, updateWorkout, deleteWorkout } from '../../services/api';

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

interface Props {
  onBack: () => void;
}

export default function ManageWorkoutsView({ onBack }: Props) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [bodyParts, setBodyParts] = useState<WorkoutPart[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBodyPartId, setNewBodyPartId] = useState<number | ''>('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editName, setEditName] = useState('');
  const [editBodyPartId, setEditBodyPartId] = useState<number | ''>('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [parts, workouts] = await Promise.all([getWorkoutParts(), getWorkouts()]);
      setBodyParts(parts);
      setExercises(workouts);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setNewName('');
    setNewBodyPartId(bodyParts[0]?.id ?? '');
    setShowAddModal(true);
  };

  const handleAdd = async () => {
    if (!newName.trim() || newBodyPartId === '') return;
    try {
      await addWorkout(newName.trim(), newBodyPartId as number);
      await fetchData();
      setShowAddModal(false);
    } catch {
      alert('운동 추가에 실패했습니다.');
    }
  };

  const openEditModal = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setEditName(exercise.name);
    setEditBodyPartId(exercise.bodyPartId);
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!editingExercise || !editName.trim() || editBodyPartId === '') return;
    try {
      await updateWorkout(editingExercise.id, editName.trim(), editBodyPartId as number);
      await fetchData();
      setShowEditModal(false);
    } catch {
      alert('운동 수정에 실패했습니다.');
    }
  };

  const openDeleteModal = (id: number) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (deletingId === null) return;
    try {
      await deleteWorkout(deletingId);
      await fetchData();
    } catch {
      alert('운동 삭제에 실패했습니다.');
    } finally {
      setShowDeleteModal(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-600 mb-2">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-indigo-400">홈</Link>
            <i className="ri-arrow-right-s-line"></i>
            <button onClick={onBack} className="hover:text-blue-600 dark:hover:text-indigo-400">프로그램</button>
            <i className="ri-arrow-right-s-line"></i>
            <span>운동 관리</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">운동 관리</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">운동 항목을 추가하고 관리하세요</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onBack}
                className="whitespace-nowrap border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                프로그램 목록
              </Button>
              <Button
                onClick={openAddModal}
                className="whitespace-nowrap bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 border-0"
              >
                <i className="ri-add-line mr-2"></i>
                운동 추가
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : bodyParts.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl">
            <p className="text-gray-600 dark:text-gray-400">등록된 운동 부위가 없습니다. 프로그램 생성에서 먼저 운동 부위를 추가해주세요.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bodyParts.map((part) => {
              const partExercises = exercises.filter((ex) => ex.bodyPart === part.name);
              return (
                <div key={part.id} className="border border-gray-200 dark:border-white/8 rounded-lg p-4 bg-white dark:bg-[#111]">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full"></span>
                    {part.name}
                    <span className="text-sm font-normal text-gray-400 dark:text-gray-600">({partExercises.length}개)</span>
                  </h3>

                  {partExercises.length === 0 ? (
                    <p className="text-sm text-center py-3 text-gray-400 dark:text-gray-600">이 부위에 등록된 운동이 없습니다.</p>
                  ) : (
                    <div className="space-y-2">
                      {partExercises.map((exercise) => (
                        <div
                          key={exercise.id}
                          className="flex items-center justify-between p-3 border border-gray-100 dark:border-white/5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">{exercise.name}</span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(exercise)}
                              className="whitespace-nowrap border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                            >
                              <i className="ri-edit-line"></i>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteModal(exercise.id)}
                              className="text-red-400/60 hover:text-red-400 hover:bg-red-400/10 border border-gray-200 dark:border-white/10 whitespace-nowrap"
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
        )}
      </div>

      {/* 운동 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">운동 추가</h3>
            <div className="space-y-4">
              <Input
                label="운동 이름"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="예: 체스트플라이"
              />
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">운동 부위</label>
                <select
                  value={newBodyPartId}
                  onChange={(e) => setNewBodyPartId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-8"
                >
                  {bodyParts.map((bp) => (
                    <option key={bp.id} value={bp.id}>{bp.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
              >
                취소
              </Button>
              <Button
                onClick={handleAdd}
                className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 border-0"
              >
                추가
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 운동 수정 모달 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">운동 수정</h3>
            <div className="space-y-4">
              <Input
                label="운동 이름"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">운동 부위</label>
                <select
                  value={editBodyPartId}
                  onChange={(e) => setEditBodyPartId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-8"
                >
                  {bodyParts.map((bp) => (
                    <option key={bp.id} value={bp.id}>{bp.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
              >
                취소
              </Button>
              <Button
                onClick={handleEdit}
                className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 border-0"
              >
                수정
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 운동 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">운동 삭제</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              정말로 이 운동을 삭제하시겠습니까? 해당 운동이 포함된 프로그램에도 영향을 줄 수 있습니다.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
              >
                취소
              </Button>
              <Button
                onClick={handleDelete}
                className="flex-1 border border-red-500/20 text-red-400 hover:bg-red-500/10 bg-transparent"
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
