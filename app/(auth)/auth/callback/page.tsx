'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import FormContainer from '@/components/auth/FormContainer';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          throw new Error(errorDescription || 'Authentication failed');
        }

        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            throw exchangeError;
          }

          if (data.session) {
            setStatus('success');
            
            // Check if user has a profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            // If no profile exists, create one
            if (!profile) {
              await supabase
                .from('profiles')
                .insert({
                  id: data.user.id,
                  email: data.user.email!,
                  full_name: data.user.user_metadata.full_name || data.user.user_metadata.name,
                  avatar_url: data.user.user_metadata.avatar_url,
                  role: 'patient', // Default role for OAuth users
                });
            }

            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
          }
        } else {
          throw new Error('No authorization code received');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setError(error instanceof Error ? error.message : 'Authentication failed');
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Completing sign in...
            </h3>
            <p className="text-slate-600">
              Please wait while we set up your account
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Welcome to InfoRx!
            </h3>
            <p className="text-slate-600 mb-4">
              Your account has been set up successfully
            </p>
            <div className="w-48 bg-slate-200 rounded-full h-2 mx-auto">
              <div className="bg-emerald-500 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Redirecting to dashboard...
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Authentication Failed
            </h3>
            <p className="text-slate-600 mb-6">
              {error || 'Something went wrong during sign in'}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/auth/signin')}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full text-slate-600 py-2 hover:text-slate-800 transition-colors"
              >
                Return Home
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <FormContainer
      title="Authentication"
      subtitle="Processing your sign in request"
      showTrustIndicators={false}
    >
      {renderContent()}
    </FormContainer>
  );
}