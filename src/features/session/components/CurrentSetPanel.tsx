import { useState } from 'react';
import { formatClock } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import type { SessionSet } from '../types';

interface CurrentSetPanelProps {
  set: SessionSet;
  setNumber: number;
  setCount: number;
  isResting: boolean;
  isCompletingSet: boolean;
  isAddingSet: boolean;
  onComplete: (actualReps: number, actualWeight: number | undefined, actualMemo: string) => void;
  onSkip: () => void;
  onAddSet: () => void;
}

const inputClass = 'w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500';
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
const targetTileClass = 'text-center p-4 bg-gray-50 dark:bg-white/[0.02] rounded-lg';

// 현재 세트의 목표와 실제 수행 입력. 세트가 바뀌면 key 로 다시 그려 입력값을 목표값으로 되돌린다.
export function CurrentSetPanel({
  set,
  setNumber,
  setCount,
  isResting,
  isCompletingSet,
  isAddingSet,
  onComplete,
  onSkip,
  onAddSet,
}: CurrentSetPanelProps) {
  const [reps, setReps] = useState(String(set.reps));
  const [weight, setWeight] = useState(String(set.weight || 0));
  const [memo, setMemo] = useState(set.memo || '');

  // 횟수를 비우면 목표 횟수로 기록한다
  const handleComplete = () => {
    const actualReps = parseInt(reps || set.reps.toString());
    const actualWeight = parseFloat(weight);
    onComplete(actualReps, actualWeight, memo);
  };

  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/8 rounded-xl p-6 mb-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={targetTileClass}>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{set.reps}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">목표 횟수</div>
        </div>
        {set.weight != null && (
          <div className={targetTileClass}>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{set.weight}kg</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">목표 무게</div>
          </div>
        )}
        <div className={targetTileClass}>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{formatClock(set.restTime)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">휴식 시간</div>
        </div>
        <div className="text-center p-4 bg-green-50 dark:bg-emerald-500/10 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-emerald-400 mb-1">
            {setNumber} / {setCount}
          </div>
          <div className="text-sm text-green-700 dark:text-emerald-500">세트</div>
        </div>
      </div>

      {!isResting && (
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">실제 수행</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>실제 횟수</label>
              <input type="number" min="1" value={reps} onChange={(e) => setReps(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>실제 무게(kg)</label>
              <input type="number" min="0" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>메모</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className={`${inputClass} placeholder:text-gray-400 dark:placeholder:text-gray-600`}
              placeholder="메모 (선택사항)"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {!isResting && (
          <>
            <Button onClick={handleComplete} className="flex-1" disabled={isCompletingSet}>
              {isCompletingSet ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  처리중...
                </div>
              ) : (
                <>
                  <i className="ri-check-line mr-2"></i>
                  세트 완료
                </>
              )}
            </Button>
            <Button onClick={onSkip} variant="outline" className="text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10">
              <i className="ri-skip-forward-line mr-2"></i>
              건너뛰기
            </Button>
          </>
        )}
        <Button
          onClick={onAddSet}
          variant="outline"
          disabled={isAddingSet}
          className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10"
        >
          {isAddingSet ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              처리중...
            </div>
          ) : (
            <>
              <i className="ri-add-line mr-2"></i>
              세트 추가
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
