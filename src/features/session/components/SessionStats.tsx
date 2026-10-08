import { formatClock } from '@/shared/lib/format';

interface SessionStatsProps {
  totalTime: number;
  exerciseTime: number;
  bodyPart: string;
  exerciseName: string;
}

const tileClass = 'bg-white dark:bg-[#111] border border-gray-100 dark:border-white/8 rounded-xl p-4 text-center';
const labelClass = 'text-sm text-gray-600 dark:text-gray-400';

// 전체·현재 운동 시간과 현재 운동 정보
export function SessionStats({ totalTime, exerciseTime, bodyPart, exerciseName }: SessionStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className={tileClass}>
        <div className="text-2xl font-bold text-blue-600 dark:text-indigo-400 mb-1">{formatClock(totalTime)}</div>
        <div className={labelClass}>전체 운동시간</div>
      </div>
      <div className={tileClass}>
        <div className="text-2xl font-bold text-blue-600 dark:text-indigo-400 mb-1">{formatClock(exerciseTime)}</div>
        <div className={labelClass}>운동 시간</div>
      </div>
      <div className={tileClass}>
        <div className="text-lg font-bold text-orange-600 mb-1">{bodyPart}</div>
        <div className={labelClass}>운동 부위</div>
      </div>
      <div className={tileClass}>
        <div className="text-lg font-bold text-blue-600 dark:text-indigo-400 mb-1">{exerciseName}</div>
        <div className={labelClass}>현재 운동</div>
      </div>
    </div>
  );
}

export function SessionProgress({ progress }: { progress: number }) {
  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/8 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">운동 진행률</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">{progress}%</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2">
        <div
          className="bg-blue-500 dark:bg-indigo-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
