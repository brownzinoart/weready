import React from 'react';
import { Shield, Database, GraduationCap, Users, CheckCircle, Clock, AlertTriangle, Globe } from 'lucide-react';

interface SourceBadgeProps {
  sourceName: string;
  sourceType: 'government' | 'academic' | 'industry' | 'community' | 'international';
  credibilityScore?: number;
  lastUpdated?: string;
  isLive?: boolean;
  cost?: 'free' | 'paid';
  className?: string;
}

export default function SourceBadge({ 
  sourceName, 
  sourceType, 
  credibilityScore, 
  lastUpdated, 
  isLive = false,
  cost = 'free',
  className = '' 
}: SourceBadgeProps) {
  const getSourceIcon = () => {
    switch (sourceType) {
      case 'government':
        return <Shield className="w-3 h-3" />;
      case 'academic':
        return <GraduationCap className="w-3 h-3" />;
      case 'industry':
        return <Database className="w-3 h-3" />;
      case 'community':
        return <Users className="w-3 h-3" />;
      case 'international':
        return <Globe className="w-3 h-3" />;
      default:
        return <Database className="w-3 h-3" />;
    }
  };

  const getSourceColor = () => {
    switch (sourceType) {
      case 'government':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'academic':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'industry':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'community':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'international':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCredibilityColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs border ${getSourceColor()} ${className}`}>
      {getSourceIcon()}
      <span className="font-medium">{sourceName}</span>
      
      {credibilityScore && (
        <span className={`font-bold ${getCredibilityColor(credibilityScore)}`}>
          {credibilityScore}%
        </span>
      )}
      
      {isLive && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-600 font-medium">LIVE</span>
        </div>
      )}
      
      {lastUpdated && !isLive && (
        <div className="flex items-center space-x-1 text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{lastUpdated}</span>
        </div>
      )}
      
      {cost === 'free' && (
        <CheckCircle className="w-3 h-3 text-green-600" />
      )}
    </div>
  );
}