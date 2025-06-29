"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Heart, Shield } from "lucide-react";
import Link from "next/link";

interface FormContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showTrustIndicators?: boolean;
}

export default function FormContainer({
  children,
  title,
  subtitle,
  showTrustIndicators = true,
}: FormContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div ref={containerRef} className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">InfoRx</span>
          </Link>

          <h1 className="text-2xl font-bold font-noto text-slate-900 mb-2">
            {title}
          </h1>
          <p className="text-slate-600">{subtitle}</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          {children}
        </div>

        {/* Trust Indicators */}
        {showTrustIndicators && (
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full"></div>
              <span>Nigerian Certified</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-sky-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-sky-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
