import { useState } from 'react';
import { ExerciseFormModal, type ExerciseCatalog, type WorkoutResponse } from '@/features/exercises';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { PageHeader } from '@/shared/ui/PageHeader';
import { LoadingState } from '@/shared/ui/Spinner';

interface ManageExercisesViewProps {
  catalog: ExerciseCatalog;
  onBack: () => void;
}

// 운동 종목 관리: 부위별 목록과 추가·수정·삭제
export function ManageExercisesView({ catalog, onBack }: ManageExercisesViewProps) {
  const { bodyParts, workouts, isLoading } = catalog;
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<WorkoutResponse | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleAdd = async (name: string, bodyPartId: number) => {
    if (await catalog.addExercise(name, bodyPartId)) setShowAddModal(false);
  };

  const handleEdit = async (name: string, bodyPartId: number) => {
    if (!editingExercise) return;
    if (await catalog.updateExercise(editingExercise.id, name, bodyPartId)) setEditingExercise(null);
  };

  const handleDelete = async () => {
    if (deletingId === null) return;
    await catalog.removeExercise(deletingId);
    setDeletingId(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <PageHeader
        breadcrumbs={[{ label: '홈', to: '/' }, { label: '프로그램', onClick: onBack }, { label: '운동 관리' }]}
        title="운동 관리"
        description="운동 항목을 추가하고 관리하세요"
        actions={
          <div className="flex gap-2">
            <Button variant="subtle" onClick={onBack}>
              <i className="ri-arrow-left-line mr-2"></i>
              프로그램 목록
            </Button>
            <Button variant="brand" onClick={() => setShowAddModal(true)}>
              <i className="ri-add-line mr-2"></i>
              운동 추가
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : bodyParts.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl">
          <p className="text-gray-600 dark:text-gray-400">등록된 운동 부위가 없습니다. 프로그램 생성에서 먼저 운동 부위를 추가해주세요.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bodyParts.map((part) => {
            const partExercises = workouts.filter((ex) => ex.bodyPart === part.name);
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
                        {exercise.editable ? (
                          <div className="flex gap-2">
                            <Button variant="subtle" size="sm" onClick={() => setEditingExercise(exercise)}>
                              <i className="ri-edit-line"></i>
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => setDeletingId(exercise.id)}>
                              <i className="ri-delete-bin-line"></i>
                            </Button>
                          </div>
                        ) : (
                          // 공용 운동은 수정/삭제할 수 없다
                          <span className="text-xs text-gray-400 dark:text-gray-600">기본 운동</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <ExerciseFormModal
          title="운동 추가"
          submitLabel="추가"
          bodyParts={bodyParts}
          namePlaceholder="예: 체스트플라이"
          onSubmit={handleAdd}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {editingExercise && (
        <ExerciseFormModal
          title="운동 수정"
          submitLabel="수정"
          bodyParts={bodyParts}
          initialName={editingExercise.name}
          initialBodyPartId={editingExercise.bodyPartId}
          onSubmit={handleEdit}
          onCancel={() => setEditingExercise(null)}
        />
      )}

      {deletingId !== null && (
        <ConfirmDialog
          title="운동 삭제"
          message="정말로 이 운동을 삭제하시겠습니까? 해당 운동이 포함된 프로그램에도 영향을 줄 수 있습니다."
          confirmLabel="삭제"
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
