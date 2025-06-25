"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import FormContainer from "@/components/auth/FormContainer";
import FormInput from "@/components/auth/FormInput";
import SubmitButton from "@/components/auth/SubmitButton";
import ErrorMessage from "@/components/auth/ErrorMessage";
import { validateEmail } from "@/lib/utils/validation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { resetPassword, loading, error } = useAuth();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      setEmailError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error!);
      return;
    }

    setIsSubmitting(true);
    setEmailError("");

    try {
      await resetPassword(email);
      setShowSuccess(true);
    } catch (error) {
      console.error("Password reset failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <FormContainer
        title="Check your email"
        subtitle="We've sent password reset instructions to your email"
        showTrustIndicators={false}
      >
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-slate-600 mb-6">
            We&apos;ve sent password reset instructions to{" "}
            <strong>{email}</strong>
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Please check your email and follow the link to reset your password.
            The link will expire in 1 hour.
          </p>
          <Link
            href="/auth/signin"
            className="text-blue-600 hover:underline font-medium"
          >
            ← Back to sign in
          </Link>
        </div>
      </FormContainer>
    );
  }

  return (
    <FormContainer
      title="Reset your password"
      subtitle="Enter your email address and we'll send you a link to reset your password"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Global error */}
        {error && <ErrorMessage message={error} type="error" />}

        {/* Email */}
        <FormInput
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={handleEmailChange}
          error={emailError}
          required
          autoComplete="email"
        />

        {/* Submit Button */}
        <SubmitButton
          loading={isSubmitting || loading}
          disabled={isSubmitting || loading}
        >
          Send reset instructions
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
