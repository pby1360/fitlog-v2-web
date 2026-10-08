interface SpinnerProps {
  size?: 'md' | 'lg';
  className?: string;
}

const sizes = {
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div className={`${sizes[size]} border-4 border-blue-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin ${className}`} />
  );
}

// 목록 영역을 채우는 로딩 표시
export function LoadingState() {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <Spinner />
    </div>
  );
}
