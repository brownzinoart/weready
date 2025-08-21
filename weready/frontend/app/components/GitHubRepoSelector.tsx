'use client';

import { useState, useEffect } from 'react';
import { Github, Star, Lock, Globe, Calendar, ArrowRight, CheckCircle } from 'lucide-react';

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

interface GitHubRepoSelectorProps {
  onSelectRepo: (repo: Repository) => void;
  onSkip?: () => void;
  isLoading?: boolean;
}

export default function GitHubRepoSelector({ onSelectRepo, onSkip, isLoading = false }: GitHubRepoSelectorProps) {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch('http://localhost:8000/api/auth/github/repos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const data = await response.json();
      setRepositories(data.repositories);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRepo = (repo: Repository) => {
    setSelectedRepo(repo);
  };

  const handleAnalyzeRepo = () => {
    if (selectedRepo) {
      onSelectRepo(selectedRepo);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getLanguageColor = (language: string | null) => {
    const colors: { [key: string]: string } = {
      'JavaScript': 'bg-yellow-500',
      'TypeScript': 'bg-blue-500',
      'Python': 'bg-green-500',
      'Java': 'bg-orange-500',
      'React': 'bg-cyan-500',
      'Vue': 'bg-emerald-500',
      'Go': 'bg-cyan-600',
      'Rust': 'bg-orange-600',
      'PHP': 'bg-purple-500'
    };
    return colors[language || ''] || 'bg-slate-400';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your GitHub repositories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Github className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Unable to Load Repositories</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={fetchRepositories}
              className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors"
            >
              Try Again
            </button>
            {onSkip && (
              <button 
                onClick={onSkip}
                className="block w-full text-slate-600 hover:text-slate-900 transition-colors"
              >
                Skip for now
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Github className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Choose a Repository to Analyze
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Select one of your GitHub repositories to get your first WeReady analysis. 
          We'll analyze code quality, security, and architecture patterns.
        </p>
      </div>

      {/* Repository List */}
      <div className="space-y-4 mb-8">
        {repositories.map((repo) => (
          <div
            key={repo.id}
            onClick={() => handleSelectRepo(repo)}
            className={`border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
              selectedRepo?.id === repo.id
                ? 'border-violet-500 bg-violet-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {repo.private ? (
                    <Lock className="w-4 h-4 text-slate-500" />
                  ) : (
                    <Globe className="w-4 h-4 text-slate-500" />
                  )}
                  <h3 className="text-lg font-semibold text-slate-900">{repo.name}</h3>
                  {repo.language && (
                    <span className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`}></span>
                  )}
                  {repo.language && (
                    <span className="text-sm text-slate-600">{repo.language}</span>
                  )}
                </div>
                
                {repo.description && (
                  <p className="text-slate-600 mb-3">{repo.description}</p>
                )}
                
                <div className="flex items-center space-x-6 text-sm text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>{repo.stargazers_count}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Updated {formatDate(repo.updated_at)}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    repo.private ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {repo.private ? 'Private' : 'Public'}
                  </span>
                </div>
              </div>
              
              {selectedRepo?.id === repo.id && (
                <CheckCircle className="w-6 h-6 text-violet-600 flex-shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div>
          {onSkip && (
            <button 
              onClick={onSkip}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Skip for now, I'll add a repository later
            </button>
          )}
        </div>
        
        <div className="space-x-3">
          <button
            onClick={handleAnalyzeRepo}
            disabled={!selectedRepo || isLoading}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              selectedRepo && !isLoading
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-lg'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>Analyze Repository</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Selected Repository Summary */}
      {selectedRepo && (
        <div className="mt-6 p-4 bg-violet-50 border border-violet-200 rounded-xl">
          <h4 className="font-semibold text-slate-900 mb-2">Ready to analyze:</h4>
          <p className="text-slate-700">
            <strong>{selectedRepo.name}</strong> - {selectedRepo.description || 'No description'}
          </p>
          <p className="text-sm text-slate-600 mt-1">
            We'll analyze code quality, security vulnerabilities, architecture patterns, 
            and provide actionable recommendations for improvement.
          </p>
        </div>
      )}
    </div>
  );
}