"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const isNewUser = searchParams.get('is_new_user') === 'true';
        const trialDays = searchParams.get('trial_days');

        if (accessToken && refreshToken) {
          // Store tokens
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);

          setStatus('success');
          
          if (isNewUser) {
            setMessage(`Welcome to WeReady! You have ${trialDays} days of free trial.`);
          } else {
            setMessage('Welcome back to WeReady!');
          }

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          throw new Error('No authentication tokens received');
        }
      } catch (error) {
        console.error('Authentication callback error:', error);
        setStatus('error');
        setMessage('Authentication failed. Please try again.');
        
        // Redirect to home after error
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    };

    // Check for error from backend
    const error = searchParams.get('message');
    if (error) {
      setStatus('error');
      setMessage(error);
      setTimeout(() => {
        router.push('/');
      }, 3000);
      return;
    }

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Completing Authentication
              </h2>
              <p className="text-slate-600">
                Please wait while we set up your account...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Authentication Successful!
              </h2>
              <p className="text-slate-600 mb-4">
                {message}
              </p>
              <p className="text-sm text-slate-500">
                Redirecting to your dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Authentication Failed
              </h2>
              <p className="text-slate-600 mb-4">
                {message}
              </p>
              <p className="text-sm text-slate-500">
                Redirecting to home page...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}