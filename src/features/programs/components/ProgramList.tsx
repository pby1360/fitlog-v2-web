import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { EmptyState } from '@/shared/ui/EmptyState';
import { DismissibleError } from '@/shared/ui/ErrorBanner';
import { PageHeader } from '@/shared/ui/PageHeader';
import { LoadingState } from '@/shared/ui/Spinner';
import { ProgramCard } from './ProgramCard';
import type { ProgramResponse } from '../types';

interface ProgramListProps {
  programs: ProgramResponse[];
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
  onCreate: () => void;
  onEdit: (program: ProgramResponse) => void;
  onDelete: (programId: number) => Promise<boolean>;
  onStart: (programId: number) => void;
  onManageExercises: () => void;
}

export function ProgramList({ programs, isLoading, error, onClearError, onCreate, onEdit, onDelete, onStart, onManageExercises }: ProgramListProps) {
  const [deletingProgramId, setDeletingProgramId] = useState<number | null>(null);

  const confirmDelete = async () => {
    if (deletingProgramId === null) return;
    // 실패해도 대화상자는 닫고 목록 위에 오류를 보여준다
    await onDelete(deletingProgramId);
    setDeletingProgramId(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <PageHeader
        breadcrumbs={[{ label: '홈', to: '/' }, { label: '프로그램' }]}
        title="운동 프로그램"
        description="나만의 운동 루틴을 관리하세요"
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button variant="subtle" onClick={onManageExercises}>
              <i className="ri-list-settings-line mr-2"></i>
              운동 관리
            </Button>
            <Button variant="brand" onClick={onCreate}>
              <i className="ri-add-line mr-2"></i>
              새 프로그램 만들기
            </Button>
          </div>
        }
      />

      {error && <DismissibleError message={error} onDismiss={onClearError} />}

      {isLoading ? (
        <LoadingState />
      ) : programs.length === 0 ? (
        <EmptyState
          icon="ri-fitness-line"
          title="아직 프로그램이 없습니다"
          description="첫 번째 운동 프로그램을 만들어보세요"
          action={
            <Button variant="brand" onClick={onCreate}>
              <i className="ri-add-line mr-2"></i>
              프로그램 만들기
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              onEdit={() => onEdit(program)}
              onDelete={() => setDeletingProgramId(program.id)}
              onStart={() => onStart(program.id)}
            />
          ))}
        </div>
      )}

      {deletingProgramId !== null && (
        <ConfirmDialog
          title="프로그램 삭제"
          message="정말로 이 프로그램을 삭제하시겠습니까? 삭제된 프로그램은 복구할 수 없습니다."
          confirmLabel="삭제"
          onConfirm={confirmDelete}
          onCancel={() => setDeletingProgramId(null)}
        />
      )}
    </div>
  );
}
