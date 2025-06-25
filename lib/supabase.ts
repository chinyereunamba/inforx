import { createClient } from "@/utils/supabase/client";

/**
 * Helper function to get user profile from database
 * @param userId - The user's ID
 * @returns Promise resolving to the user's profile or null
 */

export async function getUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) return null;
  return profile;
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
  const supabase = await createClient();
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
