'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { AlertTriangle, X, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export default function ErrorMessage({
  message,
  type = 'error',
  dismissible = false,
  onDismiss,
  className,
}: ErrorMessageProps) {
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        messageRef.current,
        { opacity: 0, y: -10, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.3, 
          ease: 'back.out(1.7)' 
        }
      );
    }, messageRef);

    return () => ctx.revert();
  }, []);

  const config = {
    error: {
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      iconColor: 'text-red-500'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      iconColor: 'text-yellow-500'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-500'
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      iconColor: 'text-emerald-500'
    }
  };

  const { icon: IconComponent, bgColor, borderColor, textColor, iconColor } = config[type];

  return (
    <div
      ref={messageRef}
      className={cn(
        'flex items-center gap-3 p-4 rounded-lg border',
        bgColor,
        borderColor,
        textColor,
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <IconComponent className={cn('h-5 w-5 flex-shrink-0', iconColor)} />
      
      <div className="flex-1 text-sm font-medium">
        {message}
      </div>

      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            'p-1 rounded-md transition-colors hover:bg-black hover:bg-opacity-10',
            iconColor
          )}
          aria-label="Dismiss message"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}