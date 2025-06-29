"use client";

import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import EnhancedDashboardLayout from "@/components/dashboard/EnhancedDashboardLayout";
import ModernDashboardLayout from "@/components/dashboard/ModernDashboardLayout";

type DashboardProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardProps) {
  const { user, loading, initialized, initialize } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  useEffect(() => {
    if (!loading && !user && initialized) {
      console.log("Redirecting unauthenticated user to auth");
      router.replace("/auth/signin");
    }
  }, [user, loading, router, initialized]);

  // Show loading while checking auth
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

  return <EnhancedDashboardLayout>{children}</EnhancedDashboardLayout>;
}
