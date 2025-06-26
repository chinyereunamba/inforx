"use client";

import { useState } from "react";
import { signInWithEmail, signInWithGoogle } from "../auth";
import FormContainer from "@/components/auth/FormContainer";
import FormInput from "@/components/auth/FormInput";
import SubmitButton from "@/components/auth/SubmitButton";
import OAuthButton from "@/components/auth/OAuthButton";
import ErrorMessage from "@/components/auth/ErrorMessage";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<null | string>(null);
  const router = useRouter();

  
  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field as string]) {
      setFormErrors((prev) => ({ ...prev, [field as string]: "" }));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmail(formData);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <FormContainer
      title="Welcome back to InfoRx"
      subtitle="Sign in to access your healthcare dashboard"
    >
      {/* Email/password login */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <ErrorMessage message={error} type="error" />}

        <FormInput
          name="email"
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(value) => handleInputChange("email", value)}
          error={formErrors.email}
          required
          autoComplete="email"
        />

        <FormInput
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(value) => handleInputChange("password", value)}
          error={formErrors.password}
          required
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={(e) => handleInputChange("remember", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <span className="ml-2 text-sm text-slate-600">Remember me</span>
          </label>

          <Link
            href="/auth/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <SubmitButton>Sign In</SubmitButton>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-slate-500">Or continue with</span>
        </div>
      </div>

      {/* OAuth Google login */}
      <form action={signInWithGoogle} className="pb-4">
        <OAuthButton provider="google" />
      </form>

      {/* Demo link */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-3">
        <h4 className="font-medium text-emerald-800 mb-2">Try InfoRx Demo</h4>
        <p className="text-sm text-emerald-700 mb-3">
          Experience our AI healthcare interpreter without creating an account
        </p>
        <Link
          href="/demo"
          className="text-sm font-medium text-emerald-600 hover:underline"
        >
          Explore Demo →
        </Link>
      </div>

      {/* Sign Up Link */}
      <div className="text-center text-sm">
        <span className="text-slate-600">Don&apos;t have an account? </span>
        <Link
          href="/auth/signup"
          className="text-blue-600 hover:underline font-medium"
        >
          Sign up here
        </Link>
      </div>
    </FormContainer>
  );
}
