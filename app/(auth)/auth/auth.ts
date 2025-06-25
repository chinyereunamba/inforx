"use client";
import { createClient } from "@/utils/supabase/client";
import { upsertUserProfile } from "@/lib/supabase";

export async function signInWithEmail(formData: {
  email: string;
  password: string;
}) {
  const supabase = createClient();
  const { email, password } = formData;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { user: data.user };
}

export async function signInWithGoogle() {
  const supabase = createClient();

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) {
    return { error: error.message };
  }
  return { url: data?.url };
}

export async function signUp(formData: FormData) {
  const supabase = createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const name = formData.get("full_name") as string;

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

  if (error) throw error;

  if (data.user) {
    const profile = await upsertUserProfile({
      id: data.user.id,
      email: data?.user?.email || "",
      full_name: name || data.user.user_metadata?.full_name || "",
      role: role as "patient" | "doctor" | "admin",
    });
  }

  return { user: data.user };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}
