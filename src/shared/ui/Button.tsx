import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'brand' | 'subtle' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const primary = 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500';
const outline = 'border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-300';

const variants: Record<ButtonVariant, string> = {
  primary,
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-300 disabled:text-gray-500',
  outline,
  ghost: 'text-blue-600 hover:bg-blue-50 disabled:text-gray-300',
  // 주요 동작: 브랜드 그라디언트
  brand: `${primary} bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 border-0`,
  // 보조 동작: 회색 테두리
  subtle: `${outline} border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white`,
  // 삭제·제거
  danger: `${outline} text-red-400/60 hover:text-red-400 hover:bg-red-400/10 border-gray-200 dark:border-white/10`,
};

const sizes = {
  sm: 'px-3 py-2 text-sm min-h-[36px]',
  md: 'px-4 py-2.5 text-base min-h-[40px]',
  lg: 'px-6 py-3 text-lg min-h-[44px]'
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer touch-manipulation select-none';

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
