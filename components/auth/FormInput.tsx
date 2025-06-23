'use client';

import { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormInputProps {
  label: string;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
}

export default function FormInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  autoComplete,
  className,
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;
  const hasError = !!error;
  const hasValue = !!value;

  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${label}-error` : undefined}
          className={cn(
            'w-full px-4 py-3 border rounded-lg transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            'placeholder:text-slate-400',
            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
            hasError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : focused
              ? 'border-blue-400 focus:border-blue-500 focus:ring-blue-200'
              : hasValue
              ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-200'
              : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
          )}
        />

        {/* Password visibility toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}

        {/* Status icons */}
        {!hasError && hasValue && type !== 'password' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <div
          id={`${label}-error`}
          className="flex items-center gap-2 text-sm text-red-600"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}