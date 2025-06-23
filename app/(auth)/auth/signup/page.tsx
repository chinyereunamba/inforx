'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Stethoscope } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import FormContainer from '@/components/auth/FormContainer';
import FormInput from '@/components/auth/FormInput';
import SubmitButton from '@/components/auth/SubmitButton';
import OAuthButton from '@/components/auth/OAuthButton';
import ErrorMessage from '@/components/auth/ErrorMessage';
import { validateSignUpForm } from '@/lib/utils/validation';
import type { SignUpData } from '@/lib/types/auth';

interface FormData extends SignUpData {
  confirmPassword: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle, loading, error } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'patient',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateSignUpForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
      });

      setShowSuccess(true);
      // Redirect to email verification page
      setTimeout(() => {
        router.push('/auth/verify-email');
      }, 2000);
    } catch (error) {
      console.error('Sign up failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign up failed:', error);
    }
  };

  if (showSuccess) {
    return (
      <FormContainer
        title="Welcome to InfoRx!"
        subtitle="Please check your email to verify your account"
        showTrustIndicators={false}
      >
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="text-slate-600 mb-6">
            We've sent a verification email to <strong>{formData.email}</strong>
          </p>
          <Link
            href="/auth/verify-email"
            className="text-blue-600 hover:underline font-medium"
          >
            Continue to verification →
          </Link>
        </div>
      </FormContainer>
    );
  }

  return (
    <FormContainer
      title="Create your InfoRx account"
      subtitle="Join thousands of Nigerians improving their healthcare experience"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Global error */}
        {error && (
          <ErrorMessage message={error} type="error" />
        )}

        {/* Full Name */}
        <FormInput
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={(value) => handleInputChange('fullName', value)}
          error={formErrors.fullName}
          required
          autoComplete="name"
        />

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

        {/* Role Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            I am a <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleInputChange('role', 'patient')}
              className={`p-4 border-2 rounded-lg transition-all duration-200 text-left ${
                formData.role === 'patient'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <User className="h-6 w-6 mb-2" />
              <div className="font-medium">Patient</div>
              <div className="text-sm text-slate-600">Seeking healthcare guidance</div>
            </button>
            
            <button
              type="button"
              onClick={() => handleInputChange('role', 'doctor')}
              className={`p-4 border-2 rounded-lg transition-all duration-200 text-left ${
                formData.role === 'doctor'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Stethoscope className="h-6 w-6 mb-2" />
              <div className="font-medium">Doctor</div>
              <div className="text-sm text-slate-600">Providing medical care</div>
            </button>
          </div>
          {formErrors.role && (
            <p className="text-sm text-red-600">{formErrors.role}</p>
          )}
        </div>

        {/* Password */}
        <FormInput
          label="Password"
          type="password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={(value) => handleInputChange('password', value)}
          error={formErrors.password}
          required
          autoComplete="new-password"
        />

        {/* Confirm Password */}
        <FormInput
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(value) => handleInputChange('confirmPassword', value)}
          error={formErrors.confirmPassword}
          required
          autoComplete="new-password"
        />

        {/* Submit Button */}
        <SubmitButton
          loading={isSubmitting || loading}
          disabled={isSubmitting || loading}
        >
          Create Account
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
          onClick={handleGoogleSignUp}
          loading={loading}
          disabled={isSubmitting || loading}
        />

        {/* Sign In Link */}
        <div className="text-center text-sm">
          <span className="text-slate-600">Already have an account? </span>
          <Link
            href="/auth/signin"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign in
          </Link>
        </div>
      </form>
    </FormContainer>
  );
}