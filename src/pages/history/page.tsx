import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HistoryCalendar,
  HistoryHeader,
  HistoryList,
  WorkoutLogDetail,
  useCalendarLogs,
  useWorkoutLogDetail,
  useWorkoutLogList,
  type HistoryMode,
  type WorkoutLogResponse,
} from '@/features/history';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

// /history: 목록·캘린더, /history/:id: 기록 상세
export default function HistoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<HistoryMode>('list');
  const list = useWorkoutLogList();
  const calendar = useCalendarLogs();
  const detail = useWorkoutLogDetail(id);

  const openDetail = (record: WorkoutLogResponse) => navigate(`/history/${record.id}`);

  const showList = () => {
    setMode('list');
    if (id) navigate('/history');
  };

  const showCalendar = () => {
    setMode('calendar');
    calendar.load();
    if (id) navigate('/history');
  };

  if (id) {
    if (!detail) return <LoadingView />;
    return <WorkoutLogDetail record={detail} onBackToList={showList} onBackToCalendar={showCalendar} />;
  }

  if (list.loading) return <LoadingView />;

  if (list.error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card className="p-8 text-center bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 mb-4">{list.error}</p>
          <Button onClick={() => window.location.reload()}>다시 시도</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${mode === 'calendar' ? 'max-w-6xl' : 'max-w-4xl'} mx-auto px-4 py-6`}>
      <HistoryHeader mode={mode} onShowList={showList} onShowCalendar={showCalendar} />
      {mode === 'calendar' ? (
        <HistoryCalendar
          month={calendar.month}
          logs={calendar.logs}
          error={calendar.error}
          onRetry={() => calendar.load()}
          onMoveMonth={calendar.moveMonth}
          onOpen={openDetail}
        />
      ) : (
        <HistoryList
          period={list.period}
          onPeriodChange={list.setPeriod}
          page={list.page}
          onPageChange={list.fetchPage}
          onOpen={openDetail}
        />
      )}
    </div>
  );
}

function LoadingView() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-center h-64">
      <div className="text-gray-500">불러오는 중...</div>
    </div>
  );
}
