'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import FormContainer from '@/components/auth/FormContainer';
import FormInput from '@/components/auth/FormInput';
import SubmitButton from '@/components/auth/SubmitButton';
import OAuthButton from '@/components/auth/OAuthButton';
import ErrorMessage from '@/components/auth/ErrorMessage';
import { validateSignInForm } from '@/lib/utils/validation';
import type { SignInData } from '@/lib/types/auth';

export default function SignInPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, loading, error } = useAuth();
  
  const [formData, setFormData] = useState<SignInData>({
    email: '',
    password: '',
    remember: false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof SignInData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[field as string]) {
      setFormErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateSignInForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      await signIn(formData);
      router.push('/dashboard');
    } catch (error) {
      console.error('Sign in failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in failed:', error);
    }
  };

  return (
    <FormContainer
      title="Welcome back to InfoRx"
      subtitle="Sign in to access your healthcare dashboard"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Global error */}
        {error && (
          <ErrorMessage message={error} type="error" />
        )}

        {/* Email */}
        <FormInput
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(value) => handleInputChange('email', value)}
          error={formErrors.email}
          required
          autoComplete="email"
        />

        {/* Password */}
        <FormInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(value) => handleInputChange('password', value)}
          error={formErrors.password}
          required
          autoComplete="current-password"
        />

        {/* Remember me and Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.remember}
              onChange={(e) => handleInputChange('remember', e.target.checked)}
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

        {/* Submit Button */}
        <SubmitButton
          loading={isSubmitting || loading}
          disabled={isSubmitting || loading}
        >
          Sign In
        </SubmitButton>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500">Or continue with</span>
          </div>
        </div>

        {/* OAuth Button */}
        <OAuthButton
          provider="google"
          onClick={handleGoogleSignIn}
          loading={loading}
          disabled={isSubmitting || loading}
        />

        {/* Demo access */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
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
          <span className="text-slate-600">Don't have an account? </span>
          <Link
            href="/auth/signup"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign up
          </Link>
        </div>
      </form>
    </FormContainer>
  );
}