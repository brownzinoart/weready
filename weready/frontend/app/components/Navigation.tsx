"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Award, 
  Brain, 
  TrendingUp, 
  Target, 
  FileText, 
  Menu, 
  X, 
  ChevronDown,
  Home,
  Zap,
  Shield
} from "lucide-react";

interface NavigationProps {
  transparent?: boolean;
}

export default function Navigation({ transparent = false }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const tools = [
    {
      name: "Live Trends",
      href: "/momentum",
      icon: TrendingUp,
      description: "Real-time GitHub intelligence",
      badge: "LIVE"
    },
    {
      name: "Market Timing", 
      href: "/market-timing",
      icon: Target,
      description: "Strategic timing advisor",
      badge: "REAL-TIME"
    },
    {
      name: "Evidence Demo",
      href: "/evidence-demo", 
      icon: FileText,
      description: "Credibility showcase",
      badge: null
    }
  ];

  const navBgClass = transparent 
    ? "bg-transparent" 
    : "bg-white/80 backdrop-blur-sm border-b border-slate-200";

  return (
    <nav className={`sticky top-0 z-50 ${navBgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                WeReady v2.0
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Home */}
            <button
              onClick={() => router.push('/')}
              className={`font-medium transition-colors flex items-center space-x-1 ${
                isActive('/') 
                  ? 'text-violet-600' 
                  : 'text-slate-600 hover:text-violet-600'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>WeReady Analysis</span>
            </button>

            {/* Bailey Intelligence */}
            <button
              onClick={() => router.push('/bailey-intelligence')}
              className={`font-medium transition-colors flex items-center space-x-1 ${
                isActive('/bailey-intelligence') 
                  ? 'text-blue-600' 
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>Bailey Intelligence</span>
              {!isActive('/bailey-intelligence') && (
                <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">NEW</span>
              )}
            </button>

            {/* Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                className="font-medium text-slate-600 hover:text-violet-600 transition-colors flex items-center space-x-1"
              >
                <Zap className="w-4 h-4" />
                <span>Intelligence Tools</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {toolsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                  {tools.map((tool) => (
                    <button
                      key={tool.href}
                      onClick={() => {
                        router.push(tool.href);
                        setToolsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${
                        isActive(tool.href) ? 'bg-violet-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <tool.icon className={`w-5 h-5 mt-0.5 ${
                          isActive(tool.href) ? 'text-violet-600' : 'text-slate-400'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${
                              isActive(tool.href) ? 'text-violet-600' : 'text-slate-900'
                            }`}>
                              {tool.name}
                            </span>
                            {tool.badge && (
                              <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                                {tool.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{tool.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {/* Powered by Bailey footer */}
                  <div className="border-t border-slate-200 mt-2 pt-2 px-4">
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <Shield className="w-3 h-3" />
                      <span>Powered by Bailey Intelligence</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Login
            </button>
            <button 
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium px-6 py-2 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg"
            >
              Get WeReady Score
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="py-4 space-y-4">
              {/* WeReady Analysis */}
              <button
                onClick={() => {
                  router.push('/');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  isActive('/') 
                    ? 'bg-violet-50 text-violet-600' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>WeReady Analysis</span>
              </button>

              {/* Bailey Intelligence */}
              <button
                onClick={() => {
                  router.push('/bailey-intelligence');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  isActive('/bailey-intelligence') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>Bailey Intelligence</span>
                {!isActive('/bailey-intelligence') && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">NEW</span>
                )}
              </button>

              {/* Tools Section */}
              <div className="pl-4 border-l-2 border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Intelligence Tools
                </p>
                {tools.map((tool) => (
                  <button
                    key={tool.href}
                    onClick={() => {
                      router.push(tool.href);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 mb-1 ${
                      isActive(tool.href) 
                        ? 'bg-violet-50 text-violet-600' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <tool.icon className="w-4 h-4" />
                    <span>{tool.name}</span>
                    {tool.badge && (
                      <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                        {tool.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Mobile Actions */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <button className="w-full text-left px-4 py-2 text-slate-600 font-medium">
                  Login
                </button>
                <button 
                  onClick={() => {
                    router.push('/');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium px-6 py-3 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  Get WeReady Score
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {toolsDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setToolsDropdownOpen(false)}
        />
      )}
    </nav>
  );
}