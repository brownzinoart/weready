"use client";

import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Github, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
  analysisId?: string; // To link analysis after signup
}

export default function LoginModal({ isOpen, onClose, defaultTab = 'login', analysisId }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Password strength
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    strength: string;
    feedback: string[];
  } | null>(null);

  const { login } = useAuth();

  // Reset form when modal opens/closes or tab changes
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMessage('');
      setPasswordStrength(null);
    } else {
      // Reset form when modal closes
      setEmail('');
      setPassword('');
      setFullName('');
      setConfirmPassword('');
      setShowPassword(false);
    }
  }, [isOpen, activeTab]);

  // Password strength checker
  useEffect(() => {
    if (activeTab === 'signup' && password.length > 0) {
      checkPasswordStrength(password);
    } else {
      setPasswordStrength(null);
    }
  }, [password, activeTab]);

  const checkPasswordStrength = async (pwd: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/password-strength', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd })
      });
      
      if (response.ok) {
        const data = await response.json();
        setPasswordStrength(data);
      }
    } catch (error) {
      // Fallback client-side validation
      const score = calculatePasswordScore(pwd);
      setPasswordStrength({
        score,
        strength: score <= 3 ? 'weak' : score <= 6 ? 'medium' : 'strong',
        feedback: []
      });
    }
  };

  const calculatePasswordScore = (pwd: string): number => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score += 1;
    return score;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (activeTab === 'signup') {
        // Validation
        if (!fullName.trim()) {
          throw new Error('Full name is required');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (passwordStrength && passwordStrength.strength === 'weak') {
          throw new Error('Please choose a stronger password');
        }

        // Signup
        const response = await fetch('http://localhost:8000/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            full_name: fullName
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Signup failed');
        }

        // Store tokens
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        setSuccessMessage(`Welcome to WeReady! You have ${data.trial_days_remaining} days of free trial.`);
        
        // Close modal and redirect after success - let AuthContext update first
        setTimeout(() => {
          onClose();
          // Force a full page refresh to ensure AuthContext loads properly
          window.location.href = '/dashboard';
        }, 1500);

      } else {
        // Login
        const response = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Login failed');
        }

        // Store tokens
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        setSuccessMessage('Welcome back to WeReady!');
        
        // Close modal and redirect after success - let AuthContext update first
        setTimeout(() => {
          onClose();
          // Force a full page refresh to ensure AuthContext loads properly
          window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: string) => {
    const url = analysisId 
      ? `http://localhost:8000/api/auth/${provider}?analysis_id=${analysisId}`
      : `http://localhost:8000/api/auth/${provider}`;
    window.location.href = url;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {activeTab === 'login' ? 'Welcome Back' : 'Join WeReady'}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {activeTab === 'login' 
                ? 'Sign in to your account' 
                : 'Start your free 7-day trial'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'login'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'signup'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="p-6">
          {/* Success Message */}
          {successMessage && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-800">{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuthLogin('github')}
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Github className="w-5 h-5" />
              <span>Continue with GitHub</span>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Signup only) */}
            {activeTab === 'signup' && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  placeholder={activeTab === 'signup' ? "Create a strong password" : "Enter your password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator (Signup only) */}
              {activeTab === 'signup' && passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          passwordStrength.strength === 'weak' ? 'bg-red-500 w-1/3' :
                          passwordStrength.strength === 'medium' ? 'bg-yellow-500 w-2/3' :
                          'bg-green-500 w-full'
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-medium capitalize ${
                      passwordStrength.strength === 'weak' ? 'text-red-600' :
                      passwordStrength.strength === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength.strength}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password (Signup only) */}
            {activeTab === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{activeTab === 'signup' ? 'Creating Account...' : 'Signing In...'}</span>
                </div>
              ) : (
                activeTab === 'signup' ? 'Start Free Trial' : 'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            {activeTab === 'login' ? (
              <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <button
                  onClick={() => setActiveTab('signup')}
                  className="text-violet-600 hover:text-violet-700 font-medium"
                >
                  Sign up for free
                </button>
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
                <p className="text-sm text-slate-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => setActiveTab('login')}
                    className="text-violet-600 hover:text-violet-700 font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}