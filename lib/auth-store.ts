import { create } from "zustand";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set: any, get: any) => ({
  user: null,
  loading: true,
  initialized: false,

  setUser: (user: User | null) => set({ user }),
  setLoading: (loading: boolean) => set({ loading }),
  setInitialized: (initialized: boolean) => set({ initialized }),

  initialize: async () => {
    const supabase = createClient();

    // Get initial session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    set({ user: session?.user || null, loading: false, initialized: true });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      set({ user: session?.user || null, loading: false });
    });
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
