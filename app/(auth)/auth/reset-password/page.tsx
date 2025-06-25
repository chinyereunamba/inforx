"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, CheckCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import FormContainer from "@/components/auth/FormContainer";
import FormInput from "@/components/auth/FormInput";
import SubmitButton from "@/components/auth/SubmitButton";
import ErrorMessage from "@/components/auth/ErrorMessage";
import {
  validatePassword,
  validatePasswordConfirmation,
} from "@/lib/utils/validation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) {
      setPasswordError("");
    }
    if (confirmPasswordError) {
      setConfirmPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (confirmPasswordError) {
      setConfirmPasswordError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error!);
      return;
    }

    const confirmPasswordValidation = validatePasswordConfirmation(
      password,
      confirmPassword
    );
    if (!confirmPasswordValidation.isValid) {
      setConfirmPasswordError(confirmPasswordValidation.error!);
      return;
    }

    setIsSubmitting(true);
    setPasswordError("");
    setConfirmPasswordError("");
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setShowSuccess(true);

      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    } catch (error) {
      console.error("Password reset failed:", error);
      setError(
        error instanceof Error ? error.message : "Failed to reset password"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <FormContainer
        title="Password updated successfully"
        subtitle="Your password has been reset and you can now sign in"
        showTrustIndicators={false}
      >
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="text-slate-600 mb-6">
            Your password has been successfully updated!
          </p>
          <p className="text-sm text-slate-500 mb-6">
            You will be redirected to the sign in page shortly...
          </p>
          <Link
            href="/auth/signin"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign in now →
          </Link>
        </div>
      </FormContainer>
    );
  }

  return (
    <FormContainer
      title="Set new password"
      subtitle="Enter your new password below"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Global error */}
        {error && <ErrorMessage message={error} type="error" />}

        {/* Password */}
        <FormInput
          label="New Password"
          type="password"
          placeholder="Enter your new password"
          value={password}
          onChange={handlePasswordChange}
          error={passwordError}
          required
          autoComplete="new-password"
        />

        {/* Confirm Password */}
        <FormInput
          label="Confirm New Password"
          type="password"
          placeholder="Confirm your new password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          error={confirmPasswordError}
          required
          autoComplete="new-password"
        />

        {/* Password requirements */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-700 mb-2">
            Password requirements:
          </h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• At least 8 characters long</li>
            <li>• Contains at least one uppercase letter</li>
            <li>• Contains at least one lowercase letter</li>
            <li>• Contains at least one number</li>
            <li>• Contains at least one special character</li>
          </ul>
        </div>

        {/* Submit Button */}
        <SubmitButton loading={isSubmitting} disabled={isSubmitting}>
          Update password
        </SubmitButton>

        {/* Back to sign in */}
        <div className="text-center">
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </form>
    </FormContainer>
  );
}
