import { formatClock } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';

interface RestPanelProps {
  restTimeLeft: number;
  onSkipRest: () => void;
  onSkipExercise: () => void;
}

export function RestPanel({ restTimeLeft, onSkipRest, onSkipExercise }: RestPanelProps) {
  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/8 rounded-xl p-6 mb-6">
      <div className="text-center">
        <div className="text-4xl font-bold text-orange-600 mb-2">{formatClock(restTimeLeft)}</div>
        <div className="text-lg text-orange-700 dark:text-orange-400 mb-2">휴식 시간</div>
        <div className="flex gap-2 justify-center">
          <Button
            onClick={onSkipRest}
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-500/30 dark:text-orange-400 dark:hover:bg-orange-500/10"
          >
            휴식 건너뛰기
          </Button>
          <Button
            onClick={onSkipExercise}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            <i className="ri-skip-forward-line mr-1"></i>
            운동 건너뛰기
          </Button>
        </div>
      </div>
    </div>
  );
}
