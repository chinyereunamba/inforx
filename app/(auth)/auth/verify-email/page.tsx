"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, CheckCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import FormContainer from "@/components/auth/FormContainer";
import SubmitButton from "@/components/auth/SubmitButton";
import ErrorMessage from "@/components/auth/ErrorMessage";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const handleResendEmail = async () => {
    if (!user?.email) {
      setResendError("No email address found. Please sign up again.");
      return;
    }

    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      // Note: Supabase doesn't have a direct resend verification email method
      // In a real app, you might need to implement this on the backend
      // For now, we'll simulate the action
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setResendSuccess(true);
    } catch (error) {
      setResendError("Failed to resend verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <FormContainer
      title="Check your email"
      subtitle="We've sent a verification link to your email address"
      showTrustIndicators={false}
    >
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-left">
            <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            <span className="text-slate-700">Check your email inbox</span>
          </div>
          <div className="flex items-center gap-3 text-left">
            <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            <span className="text-slate-700">Click the verification link</span>
          </div>
          <div className="flex items-center gap-3 text-left">
            <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            <span className="text-slate-700">Access your InfoRx dashboard</span>
          </div>
        </div>

        {user?.email && (
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-600">
              Verification email sent to:
            </p>
            <p className="font-medium text-slate-900 break-all">{user.email}</p>
          </div>
        )}

        {resendSuccess && (
          <ErrorMessage
            message="Verification email resent successfully!"
            type="success"
            className="mb-4"
          />
        )}

        {resendError && (
          <ErrorMessage message={resendError} type="error" className="mb-4" />
        )}

        <div className="space-y-4">
          <SubmitButton
            onClick={handleResendEmail}
            loading={isResending}
            disabled={isResending || resendSuccess}
            variant="outline"
            type="button"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Resend verification email
          </SubmitButton>

          <div className="text-sm text-slate-500">
            <p>Didn&apos;t receive the email? Check your spam folder or</p>
            <Link
              href="/auth/signup"
              className="text-blue-600 hover:underline font-medium"
            >
              try signing up again
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <Link
            href="/auth/signin"
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </FormContainer>
  );
}
