import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExerciseCatalog } from '@/features/exercises';
import {
  ManageExercisesView,
  ProgramEditor,
  ProgramList,
  usePrograms,
  type ProgramResponse,
  type SaveProgramRequest,
} from '@/features/programs';

type View = 'list' | 'editor' | 'manage-workouts';

export default function ProgramsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('list');
  // 편집 중인 프로그램. null 이면 새 프로그램
  const [editingProgram, setEditingProgram] = useState<ProgramResponse | null>(null);
  const catalog = useExerciseCatalog();
  const { programs, isLoading, deleteProgram, saveProgram } = usePrograms();

  const openEditor = (program: ProgramResponse | null) => {
    setEditingProgram(program);
    setView('editor');
  };

  const handleSave = async (payload: SaveProgramRequest) => {
    if (await saveProgram(payload, editingProgram?.id)) setView('list');
  };

  if (view === 'manage-workouts') {
    return <ManageExercisesView catalog={catalog} onBack={() => setView('list')} />;
  }

  if (view === 'editor') {
    return (
      <ProgramEditor
        program={editingProgram}
        catalog={catalog}
        onSave={handleSave}
        onCancel={() => setView('list')}
      />
    );
  }

  return (
    <ProgramList
      programs={programs}
      isLoading={isLoading}
      onCreate={() => openEditor(null)}
      onEdit={openEditor}
      onDelete={deleteProgram}
      onStart={(programId) => navigate('/workout', { state: { selectedProgramId: programId } })}
      onManageExercises={() => setView('manage-workouts')}
    />
  );
}
