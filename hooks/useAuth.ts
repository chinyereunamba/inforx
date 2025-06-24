'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getUserProfile } from '@/lib/supabase';
import type { AuthState, SignUpData, SignInData, Profile } from '@/lib/types/auth';

const AuthContext = createContext<AuthState & {
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}>({
  user: null,
  profile: null,
  loading: true,
  error: null,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {},
  resetPassword: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
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

  useEffect(() => {
  let unsubscribed = false;

  const init = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (unsubscribed) return;

    if (error || !session) {
      setState({ user: null, profile: null, loading: false, error: error?.message || null });
      return;
    }

    const profile = await getUserProfile(session.user.id);
    if (unsubscribed) return;

    setState({ user: session.user, profile, loading: false, error: null });
  };

  init();

  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (!session?.user) {
      setState({ user: null, profile: null, loading: false, error: null });
      return;
    }

    const profile = await getUserProfile(session.user.id);
    setState({ user: session.user, profile, loading: false, error: null });
  });

  return () => {
    unsubscribed = true;
    subscription.unsubscribe();
  };
}, []);

  const signUp = async (data: SignUpData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: data.email,
            full_name: data.fullName,
            role: data.role,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('Sign up error:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Sign up failed' 
      }));
      throw error;
    }
  };

  const signIn = async (data: SignInData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;
      
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('Sign in error:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Sign in failed' 
      }));
      throw error;
    }
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setState({
        user: null,
        profile: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Sign out error:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Sign out failed' 
      }));
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (data.user) {
        // Create profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: data.email,
            full_name: data.fullName,
            role: data.role,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      if (error) throw error;
    } catch (error) {
      console.error('Google sign in error:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Google sign in failed' 
      }));
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('Reset password error:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Reset password failed' 
      }));
      throw error;
    }
  };

  return {
    ...state,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    resetPassword,
  };
};

export { AuthContext };