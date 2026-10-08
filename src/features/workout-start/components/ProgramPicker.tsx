import { Link } from 'react-router-dom';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorBanner } from '@/shared/ui/ErrorBanner';
import { PageHeader } from '@/shared/ui/PageHeader';
import { LoadingState } from '@/shared/ui/Spinner';
import { countSets, estimateMinutes } from '../lib/startProgram';
import type { StartProgram } from '../types';

interface ProgramPickerProps {
  programs: StartProgram[];
  isLoading: boolean;
  // 목록을 불러오지 못했을 때 메시지 (빈 목록과 구분해 보여준다)
  loadError: string | null;
  onSelect: (program: StartProgram) => void;
}

// 운동할 프로그램 선택
export function ProgramPicker({ programs, isLoading, loadError, onSelect }: ProgramPickerProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <PageHeader
        breadcrumbs={[{ label: '홈', to: '/' }, { label: '운동하기' }]}
        title="운동하기"
        description="프로그램을 선택하여 운동을 시작하세요"
      />

      {isLoading ? (
        <LoadingState />
      ) : loadError ? (
        <ErrorBanner action={<button onClick={() => window.location.reload()} className="shrink-0 font-medium underline">다시 시도</button>}>
          {loadError}
        </ErrorBanner>
      ) : programs.length === 0 ? (
        <EmptyState
          icon="ri-fitness-line"
          title="운동 프로그램이 없습니다"
          description="먼저 운동 프로그램을 만들어주세요"
          action={
            <Link to="/programs">
              <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity text-sm">
                <i className="ri-add-line"></i>
                프로그램 만들기
              </button>
            </Link>
          }
        />
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
                      <span>{countSets(program.exercises)}세트</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <i className="ri-time-line"></i>
                      <span>약 {estimateMinutes(program.exercises)}분</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 sm:flex-col sm:w-auto w-full">
                  <button
                    onClick={() => onSelect(program)}
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
  );
}
