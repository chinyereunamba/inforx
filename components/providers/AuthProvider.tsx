"use client";

import { ReactNode, Suspense } from "react";
import { AuthContext, useAuthState } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface AuthProviderProps {
  children: ReactNode;
}

// Loading fallback component
const AuthLoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
      <p className="text-slate-600">Initializing...</p>
    </div>
  </div>
);

// Auth provider component with optimizations
const AuthProviderContent = ({ children }: { children: ReactNode }) => {
  const authState = useAuthState();

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <AuthProviderContent>{children}</AuthProviderContent>
    </Suspense>
  );
};
