"use client";

import { signIn, signOut as nextAuthSignOut } from "next-auth/react";

export async function signInWithEmail(formData: {
  email: string;
  password: string;
}) {
  try {
    const { email, password } = formData;
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      return { error: result.error };
    }

    if (!result?.ok) {
      return { error: "An unexpected error occurred during sign in" };
    }

    return { success: true };
  } catch (error) {
    console.error("Sign in exception:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return {
      error: `An unexpected error occurred during sign in: ${errorMessage}`,
    };
  }
}

export async function signInWithGoogle() {
  try {
    await signIn("google", { callbackUrl: "/dashboard" });
    return { success: true };
  } catch (error) {
    console.error("Google sign in exception:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return {
      error: `An unexpected error occurred during Google sign in: ${errorMessage}`,
    };
  }
}

export async function signUp(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const fullName = formData.get("full_name") as string;

    // Validate required fields
    if (!email || !password || !role || !fullName) {
      return { error: "All fields are required" };
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, fullName, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || "Sign up failed" };
    }

    // Automatically sign in the user after successful registration
    const signInResult = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (signInResult?.error) {
      return {
        error: `Registration successful, but sign in failed: ${signInResult.error}`,
      };
    }

    return { user: data };
  } catch (error) {
    console.error("Sign up exception:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return {
      error: `An unexpected error occurred during sign up: ${errorMessage}`,
    };
  }
}

export async function signOut() {
  try {
    await nextAuthSignOut({ callbackUrl: "/" });
  } catch (error) {
    console.error("Sign out exception:", error);
    throw error;
  }
}
