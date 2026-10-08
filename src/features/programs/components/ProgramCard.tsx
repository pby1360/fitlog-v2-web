import { Button } from '@/shared/ui/Button';
import { countExercises, countSets } from '../lib/programDraft';
import type { ProgramResponse } from '../types';

interface ProgramCardProps {
  program: ProgramResponse;
  onEdit: () => void;
  onDelete: () => void;
  onStart: () => void;
}

export function ProgramCard({ program, onEdit, onDelete, onStart }: ProgramCardProps) {
  return (
    <div className="p-6 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/8 rounded-2xl hover:border-gray-300 dark:hover:border-white/15 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{program.name}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{program.description}</p>
        </div>
        <div className="flex gap-1 ml-4">
          <button
            onClick={onEdit}
            className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <i className="ri-edit-line text-sm"></i>
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <i className="ri-delete-bin-line text-sm"></i>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <div className="flex items-center gap-1">
          <i className="ri-list-check-line"></i>
          <span>{countExercises(program)}개 운동</span>
        </div>
        <div className="flex items-center gap-1">
          <i className="ri-repeat-line"></i>
          <span>{countSets(program)}세트</span>
        </div>
        <div className="flex items-center gap-1">
          <i className="ri-calendar-line"></i>
          <span>{program.createdAt}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="subtle" size="sm" className="flex-1" onClick={onEdit}>
          수정
        </Button>
        <Button variant="brand" size="sm" className="flex-1" onClick={onStart}>
          운동 시작
        </Button>
      </div>
    </div>
  );
}
