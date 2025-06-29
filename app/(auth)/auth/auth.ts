"use client";
import { createClient } from "@/utils/supabase/client";
import { upsertUserProfile } from "@/lib/supabase";

export async function signInWithEmail(formData: {
  email: string;
  password: string;
}) {
  try {
    const supabase = createClient();
    const { email, password } = formData;

    // console.log("Attempting sign in with:", { email }); // Debug log

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // console.log("Sign in response:", { data: !!data.user, error }); // Debug log

    if (error) {
      // console.error("Sign in error:", error);
      return { error: error.message };
    }

    if (!data.user) {
      return { error: "No user returned from authentication" };
    }

    // console.log("Sign in successful:", data.user.id); // Debug log
    return { user: data.user };
  } catch (error) {
    // console.error("Sign in exception:", error);
    return { error: "An unexpected error occurred during sign in" };
  }
}

export async function signInWithGoogle() {
  try {
    const supabase = createClient();
    
    const origin = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_SITE_URL;

    // console.log("Google sign in attempt, origin:", origin); // Debug log

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    // console.log("Google sign in response:", { data: !!data.url, error }); // Debug log

    if (error) {
      // console.error("Google sign in error:", error);
      return { error: error.message };
    }

    // For OAuth, we need to redirect to the returned URL
    if (data.url) {
      window.location.href = data.url;
      return { success: true };
    }

    return { error: "No authorization URL returned" };
  } catch (error) {
    // console.error("Google sign in exception:", error);
    return { error: "An unexpected error occurred during Google sign in" };
  }
}

export async function signUp(formData: FormData) {
  try {
    const supabase = createClient();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const name = formData.get("full_name") as string;

    // console.log("Attempting sign up with:", { email, role, name }); // Debug log

    // Validate required fields
    if (!email || !password || !role || !name) {
      throw new Error("All fields are required");
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role,
        },
      },
    });

    // console.log("Sign up response:", { data: !!data.user, error }); // Debug log

    if (error) {
      // console.error("Sign up error:", error);
      throw error;
    }

    if (!data.user) {
      throw new Error("No user returned from sign up");
    }

    // Create user profile
    try {
      // console.log("Creating user profile..."); // Debug log
      const profile = await upsertUserProfile({
        id: data.user.id,
        email: data.user.email || email,
        full_name: name || data.user.user_metadata?.full_name || "",
        role: role as "patient" | "doctor" | "admin",
      });
      // console.log("Profile created successfully:", profile?.id); // Debug log
    } catch (profileError) {
      // console.error("Profile creation error:", profileError);
      // Don't fail the signup if profile creation fails
      throw profileError
    }

    console.log("Sign up successful:", data.user.id); // Debug log
    return { user: data.user };
  } catch (error) {
    console.error("Sign up exception:", error);
    throw error;
  }
}

export async function signOut() {
  try {
    const supabase = createClient();
    // console.log("Attempting sign out..."); // Debug log
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      // console.error("Sign out error:", error);
      throw error;
    }
    
    // console.log("Sign out successful"); // Debug log
  } catch (error) {
    // console.error("Sign out exception:", error);
    throw error;
  }
}