'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubmitButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
}

export default function SubmitButton({
  children,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'submit',
  className,
}: SubmitButtonProps) {
  const baseClasses = 'w-full font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed transform active:scale-[0.98]';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white hover:from-blue-600 hover:to-emerald-600 focus:ring-blue-200 disabled:opacity-50',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-200 disabled:bg-slate-50 disabled:text-slate-400',
    outline: 'border-2 border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-200 disabled:border-slate-300 disabled:text-slate-400'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      aria-label={loading ? 'Loading...' : undefined}
    >
      <div className="flex items-center justify-center gap-2">
        {loading && (
          <Loader2 className="h-5 w-5 animate-spin" />
        )}
        <span>{children}</span>
      </div>
    </button>
  );
}