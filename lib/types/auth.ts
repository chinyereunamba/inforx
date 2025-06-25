/**
 * Authentication-related TypeScript types
 */

import type { User } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  profile: any | null;
  loading: boolean;
  error: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role: "patient" | "doctor";
}

export interface SignInData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface AuthError {
  message: string;
  status?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FormState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

export type AuthAction =
  | "signUp"
  | "signIn"
  | "signOut"
  | "googleSignIn"
  | "resetPassword"
  | "updateProfile";

export interface OAuthProvider {
  name: string;
  provider: "google" | "github" | "apple";
  icon: React.ComponentType<any>;
  bgColor: string;
  textColor: string;
}
