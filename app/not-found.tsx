"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, HelpCircle, FileSearch } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFoundPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter()

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate content
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

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
          <div className="text-9xl font-bold text-sky-500 opacity-20 mb-2">404</div>
          <div className="text-3xl font-bold text-slate-800">Page Not Found</div>
        </div>
        
        {/* Illustration */}
        <div className="w-24 h-24 bg-sky-100 rounded-full mx-auto mb-6 flex items-center justify-center">
          <FileSearch className="h-12 w-12 text-sky-600" />
        </div>
        
        {/* Message */}
        <p className="text-slate-600 mb-8">
          The page you're looking for doesn't exist or has been moved. 
          Please check the URL or navigate back to the dashboard.
        </p>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link href="javascript:history.back()">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Link>
          </Button>
          
          <Button className="bg-sky-500 hover:bg-sky-600" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
        
        {/* Help link */}
        <div className="mt-8 text-sm">
          <Link href="/contact" className="text-sky-600 hover:underline flex items-center justify-center gap-1">
            <HelpCircle className="h-3 w-3" />
            <span>Need help? Contact Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
}