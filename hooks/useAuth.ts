"use client";

import { useAuthStore } from "@/lib/stores/auth-store";

export function useAuth() {
  const { user, loading, initialized, signOut } = useAuthStore();

  return {
    user,
    loading,
    initialized,
    signOut,
    isAuthenticated: !!user,
  };
}
