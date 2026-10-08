import { useState } from 'react';
import type { PendingSet } from '../types';

const DEFAULT_SET: PendingSet = { reps: 10, weight: 0, restTime: 60 };

// 운동을 추가하기 전에 세트 구성을 편집하는 상태
export function usePendingSets() {
  const [pendingSets, setPendingSets] = useState<PendingSet[]>([]);

  const resetSets = () => setPendingSets([DEFAULT_SET]);
  const clearSets = () => setPendingSets([]);

  // 두 번째 세트부터는 직전 세트 값을 그대로 가져온다
  const addSet = () => {
    setPendingSets(prev => [...prev, prev.length > 0 ? { ...prev[prev.length - 1] } : DEFAULT_SET]);
  };

  const removeSet = (index: number) => {
    setPendingSets(prev => prev.filter((_, i) => i !== index));
  };

  const updateSet = (index: number, field: keyof PendingSet, value: number) => {
    setPendingSets(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  return { pendingSets, resetSets, clearSets, addSet, removeSet, updateSet };
}
