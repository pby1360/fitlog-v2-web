import { Button } from '@/shared/ui/Button';
import { PageHeader } from '@/shared/ui/PageHeader';
import type { SessionStatus } from '../types';

interface SessionHeaderProps {
  programName: string;
  status: SessionStatus;
  isResting: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onComplete: () => void;
}

const statusText = (status: SessionStatus, isResting: boolean) => {
  if (status === 'PAUSED') return '일시정지됨';
  if (status === 'COMPLETED') return '운동 완료!';
  return isResting ? '휴식 중' : '운동 중';
};

export function SessionHeader({
  programName,
  status,
  isResting,
  soundEnabled,
  onToggleSound,
  onPause,
  onResume,
  onStop,
  onComplete,
}: SessionHeaderProps) {
  const isOngoing = status !== 'COMPLETED' && status !== 'CANCELLED';

  return (
    <PageHeader
      breadcrumbs={[{ label: '홈', to: '/' }, { label: '운동하기', to: '/workout' }, { label: '운동 세션' }]}
      title={programName}
      description={statusText(status, isResting)}
      actions={
        <div className="flex gap-2 items-center">
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg transition-colors ${
              soundEnabled
                ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/20'
                : 'bg-gray-100 dark:bg-white/5 text-gray-400 hover:bg-gray-200 dark:hover:bg-white/8'
            }`}
            title={soundEnabled ? '알림음 끄기' : '알림음 켜기'}
          >
            <i className={`text-xl ${soundEnabled ? 'ri-volume-up-line' : 'ri-volume-mute-line'}`}></i>
          </button>

          {isOngoing && (
            <>
              {status === 'PAUSED' ? (
                <Button variant="outline" size="sm" onClick={onResume} className="text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10">
                  <i className="ri-play-line mr-1"></i>
                  재개
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={onPause} className="text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10">
                  <i className="ri-pause-line mr-1"></i>
                  일시정지
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onStop} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                <i className="ri-stop-line mr-1"></i>
                종료
              </Button>
              <Button variant="outline" size="sm" onClick={onComplete} className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10">
                <i className="ri-check-line mr-1"></i>
                완료
              </Button>
            </>
          )}
        </div>
      }
    />
  );
}
