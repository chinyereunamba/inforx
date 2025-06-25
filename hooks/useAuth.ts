"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { supabase, getUserProfile, upsertUserProfile } from "@/lib/supabase";
import type { AuthState, SignUpData, SignInData } from "@/lib/types/auth";
import type { Profile } from "@/lib/types/database";

const AuthContext = createContext<
  AuthState & {
    signUp: (data: SignUpData) => Promise<void>;
    signIn: (data: SignInData) => Promise<void>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateProfile: (updates: Partial<Profile>) => Promise<void>;
  }
>({
  user: null,
  profile: null,
  loading: true,
  error: null,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useAuthState = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  // Cache for profile data to avoid repeated database calls
  const profileCache = useMemo(() => new Map<string, Profile | null>(), []);

  // Initialize auth state with optimizations
  useEffect(() => {
    let mounted = true;
    let initializationTimeout: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        // Set a timeout to prevent infinite loading
        initializationTimeout = setTimeout(() => {
          if (mounted) {
            console.warn(
              "Auth initialization timeout - setting loading to false"
            );
            setState((prev) => ({ ...prev, loading: false }));
          }
        }, 5000); // 5 second timeout

        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error("Error getting session:", error);
          setState({
            user: null,
            profile: null,
            loading: false,
            error: error.message,
          });
          return;
        }

        if (session?.user) {
          // Check cache first
          const cachedProfile = profileCache.get(session.user.id);

          if (cachedProfile) {
            setState({
              user: session.user,
              profile: cachedProfile,
              loading: false,
              error: null,
            });
          } else {
            // Get user profile only if not cached
            const profile = await getUserProfile(session.user.id);

            if (profile) {
              profileCache.set(session.user.id, profile);
            }

            if (mounted) {
              setState({
                user: session.user,
                profile,
                loading: false,
                error: null,
              });
            }
          }
        } else {
          if (mounted) {
            setState({
              user: null,
              profile: null,
              loading: false,
              error: null,
            });
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setState({
            user: null,
            profile: null,
            loading: false,
            error: "Failed to initialize authentication",
          });
        }
      } finally {
        clearTimeout(initializationTimeout);
      }
    };

    // Start initialization immediately
    initializeAuth();

    // Listen for auth state changes with optimizations
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state changed:", event, session?.user?.id);

      if (event === "SIGNED_IN" && session?.user) {
        try {
          // Check cache first
          let profile = profileCache.get(session.user.id);

          if (!profile) {
            // Get or create user profile
            profile = await getUserProfile(session.user.id);

            if (!profile) {
              // Create profile for new user
              const { email, user_metadata } = session.user;
              profile = await upsertUserProfile({
                id: session.user.id,
                email: email || "",
                full_name:
                  user_metadata?.full_name || user_metadata?.name || "",
                avatar_url: user_metadata?.avatar_url || null,
                role: user_metadata?.role || "patient",
              });
            }

            // Cache the profile
            if (profile) {
              profileCache.set(session.user.id, profile);
            }
          }

          setState({
            user: session.user,
            profile,
            loading: false,
            error: null,
          });
        } catch (error) {
          console.error("Error handling sign in:", error);
          setState({
            user: session.user,
            profile: null,
            loading: false,
            error: "Failed to load user profile",
          });
        }
      } else if (event === "SIGNED_OUT") {
        // Clear cache on sign out
        if (state.user) {
          profileCache.delete(state.user.id);
        }

        setState({
          user: null,
          profile: null,
          loading: false,
          error: null,
        });
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        // Update user data on token refresh
        setState((prev) => ({
          ...prev,
          user: session.user,
        }));
      }
    });

    return () => {
      mounted = false;
      clearTimeout(initializationTimeout);
      subscription.unsubscribe();
    };
  }, [profileCache]);

  const signUp = useCallback(
    async (data: SignUpData) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              role: data.role,
            },
          },
        });

        if (error) throw error;

        if (authData.user) {
          // Create profile record
          const profile = await upsertUserProfile({
            id: authData.user.id,
            email: data.email,
            full_name: data.fullName,
            role: data.role,
          });

          // Cache the profile
          if (profile) {
            profileCache.set(authData.user.id, profile);
          }
        }

        setState((prev) => ({ ...prev, loading: false }));
      } catch (error) {
        console.error("Sign up error:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Sign up failed",
        }));
        throw error;
      }
    },
    [profileCache]
  );

  const signIn = useCallback(async (data: SignInData) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;
      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      console.error("Sign in error:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Sign in failed",
      }));
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await supabase.auth.signOut();

      // Clear cache
      if (state.user) {
        profileCache.delete(state.user.id);
      }

      setState({
        user: null,
        profile: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Sign out error:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Sign out failed",
      }));
      throw error;
    }
  }, [state.user, profileCache]);

  const signInWithGoogle = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Google sign in error:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Google sign in failed",
      }));
      throw error;
    }
  }, []);

  const handleResetPassword = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      console.error("Reset password error:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Reset password failed",
      }));
      throw error;
    }
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!state.user) {
        throw new Error("No user logged in");
      }

      try {
        const updatedProfile = await upsertUserProfile({
          id: state.user.id,
          email: state.user.email || "",
          full_name: updates.full_name || undefined,
          avatar_url: updates.avatar_url || undefined,
          role: updates.role,
        });

        // Update cache
        if (updatedProfile) {
          profileCache.set(state.user.id, updatedProfile);
        }

        setState((prev) => ({
          ...prev,
          profile: updatedProfile,
        }));

        return updatedProfile;
      } catch (error) {
        console.error("Update profile error:", error);
        throw error;
      }
    },
    [state.user, profileCache]
  );

  return {
    ...state,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    resetPassword: handleResetPassword,
    updateProfile,
  };
};

export { AuthContext };
