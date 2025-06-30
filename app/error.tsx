"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw, AlertTriangle, HelpCircle } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate content
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" }
      );
    }, pageRef);

    // Log the error to console for debugging
    console.error('Application error:', error);

    return () => ctx.revert();
  }, [error]);

  return (
    <div 
      ref={pageRef}
      className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex items-center justify-center p-4"
    >
      <div 
        ref={contentRef}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        {/* Error Code */}
        <div className="mb-6">
          <div className="text-9xl font-bold text-emerald-500 opacity-20 mb-2">500</div>
          <div className="text-3xl font-bold text-slate-800">Something Went Wrong</div>
        </div>
        
        {/* Illustration */}
        <div className="w-24 h-24 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        
        {/* Message */}
        <p className="text-slate-600 mb-8">
          We apologize for the inconvenience. Our team has been notified and is working on resolving the issue.
          {error?.digest && (
            <span className="block mt-2 text-xs text-slate-500">
              Error ID: {error.digest}
            </span>
          )}
        </p>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="outline" 
            onClick={reset}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          
          <Button className="bg-emerald-500 hover:bg-emerald-600" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
        
        {/* Help link */}
        <div className="mt-8 text-sm">
          <Link href="/contact" className="text-emerald-600 hover:underline flex items-center justify-center gap-1">
            <HelpCircle className="h-3 w-3" />
            <span>Need help? Contact Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
}