"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  subscription_tier: string;
  trial_days_remaining: number;
  is_trial_active: boolean;
  created_at: string;
  role?: 'founder' | 'developer' | 'investor' | 'other';
  company?: string;
  position?: string;
  full_name?: string;
}

interface UserProfile {
  userType: 'new' | 'returning';
  hasAnalyses: boolean;
  analysisCount: number;
  onboardingCompleted: boolean;
  lastAnalysisDate?: string;
  preferredView: 'technical' | 'business' | 'auto';
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (provider: string, analysisId?: string) => void;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  getViewMode: () => 'technical' | 'business';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await fetch('http://localhost:8000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token might be expired, try to refresh
            const refreshed = await refreshToken();
            if (!refreshed) {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
            }
          }
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = (provider: string, analysisId?: string) => {
    const baseUrl = `http://localhost:8000/api/auth/${provider}`;
    const url = analysisId ? `${baseUrl}?analysis_id=${analysisId}` : baseUrl;
    window.location.href = url;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    
    // Call logout endpoint
    fetch('http://localhost:8000/api/auth/logout', {
      method: 'POST'
    }).catch(console.error);
  };

  const refreshToken = async (): Promise<boolean> => {
    const refreshTokenValue = localStorage.getItem('refresh_token');
    if (!refreshTokenValue) return false;

    try {
      const response = await fetch('http://localhost:8000/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refresh_token: refreshTokenValue
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        
        // Reload user data
        const userResponse = await fetch('http://localhost:8000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  // User classification and profile management
  const classifyUser = async (userData: User): Promise<UserProfile> => {
    // Check if user has analyses (would need backend endpoint)
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/user/analyses/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      let analysisCount = 0;
      let lastAnalysisDate = undefined;
      let hasAnalyses = false;

      if (response.ok) {
        const data = await response.json();
        analysisCount = data.total_analyses || 0;
        lastAnalysisDate = data.last_analysis_date;
        hasAnalyses = analysisCount > 0;
      }

      // Determine user type based on account age and analysis history
      const accountAge = new Date().getTime() - new Date(userData.created_at).getTime();
      const isNewAccount = accountAge < (7 * 24 * 60 * 60 * 1000); // 7 days
      const userType = (isNewAccount || analysisCount === 0) ? 'new' : 'returning';

      // Determine preferred view based on role
      let preferredView: 'technical' | 'business' | 'auto' = 'auto';
      if (userData.role === 'developer') preferredView = 'technical';
      if (userData.role === 'investor') preferredView = 'business';

      // Check onboarding completion from localStorage
      const onboardingCompleted = localStorage.getItem(`onboarding_completed_${userData.id}`) === 'true';

      return {
        userType,
        hasAnalyses,
        analysisCount,
        onboardingCompleted,
        lastAnalysisDate,
        preferredView
      };
    } catch (error) {
      console.error('Failed to classify user:', error);
      return {
        userType: 'new',
        hasAnalyses: false,
        analysisCount: 0,
        onboardingCompleted: false,
        preferredView: 'auto'
      };
    }
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (userProfile) {
      const newProfile = { ...userProfile, ...updates };
      setUserProfile(newProfile);
      
      // Persist onboarding completion
      if (updates.onboardingCompleted && user) {
        localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
      }
    }
  };

  const getViewMode = (): 'technical' | 'business' => {
    if (!userProfile || userProfile.preferredView === 'auto') {
      // Auto-detect based on user role
      if (user?.role === 'investor') return 'business';
      if (user?.role === 'developer') return 'technical';
      // Default to business for founders (more accessible)
      return 'business';
    }
    return userProfile.preferredView === 'business' ? 'business' : 'technical';
  };

  // Load user profile when user changes
  useEffect(() => {
    if (user && !userProfile) {
      classifyUser(user).then(setUserProfile);
    }
  }, [user, userProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshToken,
        updateUserProfile,
        getViewMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}