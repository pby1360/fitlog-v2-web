import { Spinner } from '@/shared/ui/Spinner';

export function StartingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-[100] flex flex-col items-center justify-center text-white">
      <Spinner size="lg" className="mb-4" />
      <p className="text-lg font-medium">운동을 시작하는 중...</p>
    </div>
  );
}
