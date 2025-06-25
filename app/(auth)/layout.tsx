"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { Loader2 } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { user, loading, initialized, initialize } = useAuthStore();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  useEffect(() => {
    // Only redirect if we're not already redirecting and user is authenticated
    if (!loading && user && !isRedirecting && initialized) {
      console.log("Redirecting authenticated user to dashboard");
      setIsRedirecting(true);
      router.replace("/dashboard");
    }
  }, [user, loading, router, isRedirecting, initialized]);

  // Show loading state while initializing
  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and redirecting, show minimal loading
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-slate-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, don't render auth pages
  if (user) {
    return null;
  }

  return <>{children}</>;
}
