/**
 * Supabase client configuration for InfoRx healthcare platform
 * This file contains only client-side Supabase utilities
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Creates a Supabase client for client components
 * This client handles authentication and real-time features
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

/**
 * Helper function to get the current user's session
 * @returns Promise resolving to the current session or null
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
}

/**
 * Helper function to get the current user
 * @returns Promise resolving to the current user or null
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Failed to fetch profile:', error);
    return null;
  }

  return data;
}

/**
 * Helper function to sign out the current user
 * @returns Promise resolving to sign out result
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
  return { success: true };
}

/**
 * Helper function to check if user is authenticated
 * @returns Promise resolving to boolean indicating auth status
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

export default supabase;