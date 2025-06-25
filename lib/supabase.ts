/**
 * Supabase client configuration for InfoRx healthcare platform
 * This file contains essential database operations for user profiles
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types/database";
import type { Profile } from "./types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

/**
 * Creates a Supabase client for client components
 * This client handles authentication and real-time features
 */
export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

/**
 * Helper function to get user profile from database
 * @param userId - The user's ID
 * @returns Promise resolving to the user's profile or null
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch profile:", error);
    return null;
  }

  return data;
}

/**
 * Helper function to create or update user profile
 * @param profile - The profile data to insert/update
 * @returns Promise resolving to the operation result
 */
export async function upsertUserProfile(profile: {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: "patient" | "doctor" | "admin";
}) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error("Failed to upsert profile:", error);
    throw error;
  }

  return data;
}
