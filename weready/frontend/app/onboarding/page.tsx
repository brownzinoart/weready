'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Github, ArrowRight, CheckCircle, Skip } from 'lucide-react';
import GitHubRepoSelector from '../components/GitHubRepoSelector';
import { useAuth } from '../contexts/AuthContext';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  html_url: string;
}

export default function OnboardingPage() {
  const [step, setStep] = useState<'welcome' | 'github' | 'analyzing' | 'complete'>('welcome');
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, router]);

  const handleStartOnboarding = () => {
    setStep('github');
  };

  const handleSelectRepo = async (repo: Repository) => {
    setSelectedRepo(repo);
    setIsAnalyzing(true);
    setStep('analyzing');

    try {
      // Link the repository
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/auth/github/link-repo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(repo)
      });

      if (!response.ok) {
        throw new Error('Failed to link repository');
      }

      // Simulate analysis time
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Redirect to analysis with the repo URL
      const repoUrl = repo.html_url;
      
      // Start analysis with the selected repository
      const analysisResponse = await fetch('http://localhost:8000/api/analyze/free', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          repository_url: repoUrl,
          language: repo.language || 'javascript'
        })
      });

      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        
        // Store analysis data and navigate to results
        const dataId = `weready_result_${Date.now()}`;
        sessionStorage.setItem(dataId, JSON.stringify(analysisData));
        sessionStorage.setItem('weready_current_result', dataId);
        sessionStorage.setItem('weready_is_mock', 'false');
        
        router.push(`/results?id=${dataId}`);
      } else {
        // Fallback: redirect to dashboard
        setStep('complete');
      }

    } catch (error) {
      console.error('Error during repo analysis:', error);
      setStep('complete');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSkipGitHub = () => {
    setStep('complete');
  };

  const handleCompleteToDashboard = () => {
    router.push('/dashboard');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Step */}
        {step === 'welcome' && (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Welcome to WeReady, {user?.name?.split(' ')[0] || 'there'}! 🎉
            </h1>
            
            <p className="text-lg text-slate-600 mb-8">
              Your account is ready! Let's get you started by analyzing one of your GitHub repositories 
              to show you the power of WeReady's comprehensive startup analysis.
            </p>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">What you'll get:</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-slate-700">Code quality analysis with AI hallucination detection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-slate-700">Security vulnerability scanning</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-slate-700">Architecture and best practices review</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-slate-700">Actionable recommendations for improvement</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartOnboarding}
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold px-8 py-4 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg flex items-center space-x-2 mx-auto"
            >
              <Github className="w-5 h-5" />
              <span>Connect GitHub & Analyze Repository</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleSkipGitHub}
              className="block text-slate-600 hover:text-slate-900 transition-colors mt-4 mx-auto"
            >
              Skip for now, go to dashboard
            </button>
          </div>
        )}

        {/* GitHub Repository Selection Step */}
        {step === 'github' && (
          <GitHubRepoSelector 
            onSelectRepo={handleSelectRepo}
            onSkip={handleSkipGitHub}
            isLoading={isAnalyzing}
          />
        )}

        {/* Analyzing Step */}
        {step === 'analyzing' && (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Analyzing {selectedRepo?.name}...
            </h2>
            
            <p className="text-slate-600 mb-8">
              WeReady is performing a comprehensive analysis of your repository. 
              This includes code quality, security, architecture, and business readiness assessment.
            </p>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-slate-700">Repository linked</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-slate-700">Analyzing code quality...</span>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Security scan pending</span>
                  <div className="w-4 h-4 bg-slate-300 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Business analysis pending</span>
                  <div className="w-4 h-4 bg-slate-300 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              You're all set! 🚀
            </h2>
            
            <p className="text-slate-600 mb-8">
              Your WeReady account is ready to use. You can now analyze repositories, 
              track your startup's progress, and get insights to improve your readiness for funding.
            </p>

            <button
              onClick={handleCompleteToDashboard}
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold px-8 py-4 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg flex items-center space-x-2 mx-auto"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}