import { Link } from 'react-router-dom';
import { formatDurationKo } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { PERIOD_OPTIONS, type Period } from '../lib/logView';
import type { WorkoutLogPage, WorkoutLogResponse } from '../types';
import { WorkoutLogCard } from './WorkoutLogCard';

interface HistoryListProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
  page: WorkoutLogPage;
  onPageChange: (page: number) => void;
  onOpen: (record: WorkoutLogResponse) => void;
}

const cardClass = 'bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5';

// 기간 필터 + 요약 통계 + 기록 목록 + 페이지 이동
export function HistoryList({ period, onPeriodChange, page, onPageChange, onOpen }: HistoryListProps) {
  return (
    <>
      <PeriodFilter value={period} onChange={onPeriodChange} />

      {/* 통계 요약 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <SummaryTile value={page.totalElements} label="총 운동 횟수" valueClass="text-blue-600 dark:text-indigo-400" />
        <SummaryTile value={formatDurationKo(page.totalDurationSeconds)} label="총 운동 시간" valueClass="text-emerald-400" />
        <SummaryTile value={page.totalCompletedSets} label="완료 세트" valueClass="text-violet-400" />
        <SummaryTile value={`${Math.round(page.averageCompletionRate)}%`} label="평균 완료율" valueClass="text-amber-400" />
      </div>

      {page.logs.length === 0 ? (
        <Card className={`p-8 text-center ${cardClass}`}>
          <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-history-line text-2xl text-gray-400 dark:text-gray-600"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">운동 기록이 없습니다</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">첫 번째 운동을 완료하면 기록이 여기에 표시됩니다</p>
          <Link to="/workout">
            <Button variant="brand">
              <i className="ri-play-line mr-2"></i>
              운동 시작하기
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {page.logs.map((record) => (
            <WorkoutLogCard key={record.id} record={record} onOpen={() => onOpen(record)} />
          ))}
        </div>
      )}

      {page.totalPages > 1 && (
        <Pagination currentPage={page.currentPage} totalPages={page.totalPages} onChange={onPageChange} />
      )}
    </>
  );
}

function PeriodFilter({ value, onChange }: { value: Period; onChange: (period: Period) => void }) {
  return (
    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">조회 기간</span>
      <div className="flex gap-1">
        {PERIOD_OPTIONS.map(option => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap border ${
              value === option.value
                ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30'
                : 'bg-gray-100 dark:bg-white/5 text-gray-500 border-gray-200 dark:border-white/8 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryTile({ value, label, valueClass }: { value: string | number; label: string; valueClass: string }) {
  return (
    <Card className={`p-3 sm:p-4 text-center ${cardClass}`}>
      <div className={`text-lg sm:text-2xl font-bold mb-1 ${valueClass}`}>{value}</div>
      <div className="text-xs sm:text-sm text-gray-500">{label}</div>
    </Card>
  );
}

function Pagination({ currentPage, totalPages, onChange }: { currentPage: number; totalPages: number; onChange: (page: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button variant="subtle" size="sm" onClick={() => onChange(currentPage - 1)} disabled={currentPage === 0}>
        <i className="ri-arrow-left-s-line mr-1"></i>
        이전
      </Button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i).map(page => (
          <button
            key={page}
            onClick={() => onChange(page)}
            className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white'
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {page + 1}
          </button>
        ))}
      </div>

      <Button variant="subtle" size="sm" onClick={() => onChange(currentPage + 1)} disabled={currentPage >= totalPages - 1}>
        다음
        <i className="ri-arrow-right-s-line ml-1"></i>
      </Button>
    </div>
  );
}
