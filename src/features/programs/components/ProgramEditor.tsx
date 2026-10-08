import { useState } from 'react';
import { BodyPartFormModal, ExerciseFormModal, type ExerciseCatalog, type WorkoutResponse } from '@/features/exercises';
import { Button } from '@/shared/ui/Button';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useProgramDraft } from '../hooks/useProgramDraft';
import { toSaveProgramRequest } from '../lib/programDraft';
import type { ProgramResponse, SaveProgramRequest } from '../types';
import { BodyPartStep } from './editor/BodyPartStep';
import { ExerciseStep } from './editor/ExerciseStep';
import { InfoStep } from './editor/InfoStep';
import { SetStep } from './editor/SetStep';
import { StepIndicator } from './editor/StepIndicator';

interface ProgramEditorProps {
  // 수정할 프로그램. null 이면 새로 만든다
  program: ProgramResponse | null;
  catalog: ExerciseCatalog;
  onSave: (payload: SaveProgramRequest) => Promise<void>;
  onCancel: () => void;
}

// 프로그램 생성·수정 4단계 위저드
export function ProgramEditor({ program, catalog, onSave, onCancel }: ProgramEditorProps) {
  const isEdit = program !== null;
  const { bodyParts, workouts } = catalog;
  const draft = useProgramDraft(program);
  const [currentStep, setCurrentStep] = useState(1);

  const [showAddBodyPartModal, setShowAddBodyPartModal] = useState(false);
  // undefined: 닫힘, null: 부위 미지정으로 열림, number: 해당 부위를 선택해 열림
  const [addExerciseBodyPartId, setAddExerciseBodyPartId] = useState<number | null | undefined>(undefined);
  const [editingExercise, setEditingExercise] = useState<WorkoutResponse | null>(null);

  const getExerciseName = (exerciseId: number) => workouts.find(ex => ex.id === exerciseId)?.name || '';
  const getExerciseBodyPart = (exerciseId: number) => workouts.find(ex => ex.id === exerciseId)?.bodyPart || '';

  const handleAddBodyPart = async (name: string) => {
    // 빈 이름·중복 이름은 무시한다
    if (!name || bodyParts.some(bp => bp.name === name)) return;
    if (await catalog.addBodyPart(name)) setShowAddBodyPartModal(false);
  };

  const handleAddExercise = async (name: string, bodyPartId: number) => {
    if (await catalog.addExercise(name, bodyPartId)) setAddExerciseBodyPartId(undefined);
  };

  const handleEditExercise = async (name: string, bodyPartId: number) => {
    if (!editingExercise) return;
    if (await catalog.updateExercise(editingExercise.id, name, bodyPartId)) setEditingExercise(null);
  };

  const handleSave = () => {
    if (!draft.name.trim() || draft.exercises.length === 0) {
      alert('프로그램 이름과 최소 하나 이상의 운동을 포함해야 합니다.');
      return;
    }
    onSave(toSaveProgramRequest(draft.name, draft.description, draft.exercises, workouts));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <PageHeader
        breadcrumbs={[{ label: '프로그램', onClick: onCancel }, { label: isEdit ? '프로그램 수정' : '프로그램 생성' }]}
        title={isEdit ? '프로그램 수정' : '운동 프로그램 생성'}
        description="나만의 운동 루틴을 만들어보세요"
        stackOnMobile={false}
        actions={
          <Button variant="subtle" onClick={onCancel}>
            <i className="ri-arrow-left-line mr-2"></i>
            목록으로
          </Button>
        }
      />

      <StepIndicator currentStep={currentStep} />

      <div className="p-6 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/8 rounded-2xl">
        {currentStep === 1 && <InfoStep draft={draft} onNext={() => setCurrentStep(2)} />}

        {currentStep === 2 && (
          <BodyPartStep
            draft={draft}
            bodyParts={bodyParts}
            onAddBodyPart={() => setShowAddBodyPartModal(true)}
            onDeleteBodyPart={catalog.removeBodyPart}
            onPrev={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <ExerciseStep
            draft={draft}
            bodyParts={bodyParts}
            workouts={workouts}
            onAddExercise={(bodyPartId) => setAddExerciseBodyPartId(bodyPartId ?? null)}
            onEditExercise={setEditingExercise}
            onDeleteExercise={catalog.removeExercise}
            getExerciseName={getExerciseName}
            getExerciseBodyPart={getExerciseBodyPart}
            onPrev={() => setCurrentStep(2)}
            onNext={() => setCurrentStep(4)}
          />
        )}

        {currentStep === 4 && (
          <SetStep
            draft={draft}
            isEdit={isEdit}
            getExerciseName={getExerciseName}
            getExerciseBodyPart={getExerciseBodyPart}
            onPrev={() => setCurrentStep(3)}
            onSave={handleSave}
          />
        )}
      </div>

      {showAddBodyPartModal && (
        <BodyPartFormModal onSubmit={handleAddBodyPart} onCancel={() => setShowAddBodyPartModal(false)} />
      )}

      {addExerciseBodyPartId !== undefined && (
        <ExerciseFormModal
          title="운동 추가"
          submitLabel="추가"
          bodyParts={bodyParts}
          initialBodyPartId={addExerciseBodyPartId ?? undefined}
          namePlaceholder="예: 체스트플라이"
          onSubmit={handleAddExercise}
          onCancel={() => setAddExerciseBodyPartId(undefined)}
        />
      )}

      {editingExercise && (
        <ExerciseFormModal
          title="운동 수정"
          submitLabel="수정"
          bodyParts={bodyParts}
          initialName={editingExercise.name}
          initialBodyPartId={editingExercise.bodyPartId}
          onSubmit={handleEditExercise}
          onCancel={() => setEditingExercise(null)}
        />
      )}
    </div>
  );
}
