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
    console.log("Initializing auth store..."); // Debug log
    const supabase = createClient();

    // Get initial session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    console.log("Initial session:", !!session?.user, session?.user?.id); // Debug log
    set({ user: session?.user || null, loading: false, initialized: true });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, !!session?.user, session?.user?.id); // Debug log
      set({ user: session?.user || null, loading: false });
    });
  },

  signOut: async () => {
    console.log("Auth store signOut called..."); // Debug log
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Auth store signOut error:", error);
      throw error;
    }
    set({ user: null });
    console.log("Auth store signOut successful"); // Debug log
  },
}));