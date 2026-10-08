import { Button } from '@/shared/ui/Button';
import { PageHeader } from '@/shared/ui/PageHeader';

export type HistoryMode = 'list' | 'calendar';

interface HistoryHeaderProps {
  mode: HistoryMode;
  onShowList: () => void;
  onShowCalendar: () => void;
}

const DESCRIPTION: Record<HistoryMode, string> = {
  list: '지금까지의 운동 기록을 확인하세요',
  calendar: '캘린더로 운동 기록을 확인하세요',
};

// 운동일지 제목 + 목록/캘린더 전환
export function HistoryHeader({ mode, onShowList, onShowCalendar }: HistoryHeaderProps) {
  return (
    <PageHeader
      breadcrumbs={[{ label: '홈', to: '/' }, { label: '운동일지' }]}
      title="운동일지"
      description={DESCRIPTION[mode]}
      actions={
        <div className="flex gap-2">
          <Button variant={mode === 'list' ? 'brand' : 'subtle'} size="sm" onClick={onShowList}>
            <i className="ri-list-unordered mr-2"></i>
            목록
          </Button>
          <Button variant={mode === 'calendar' ? 'brand' : 'subtle'} size="sm" onClick={onShowCalendar}>
            <i className="ri-calendar-line mr-2"></i>
            캘린더
          </Button>
        </div>
      }
    />
  );
}
