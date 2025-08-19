"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Award, 
  Brain, 
  TrendingUp, 
  Target, 
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

  // Handle body scroll lock when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

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
                <div className="absolute top-full left-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50">
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
            className="md:hidden p-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-900 z-50 md:hidden overflow-y-auto">
            <div className="min-h-full w-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                    WeReady v2.0
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

              {/* Menu Content */}
              <div className="py-8 px-6 space-y-6">
                {/* WeReady Analysis */}
                <button
                  onClick={() => {
                    router.push('/');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-6 py-4 rounded-xl font-medium transition-all flex items-center space-x-3 ${
                    isActive('/') 
                      ? 'bg-violet-600 text-white border-2 border-violet-500' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white border-2 border-transparent'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span className="text-lg">WeReady Analysis</span>
                </button>

                {/* Bailey Intelligence */}
                <button
                  onClick={() => {
                    router.push('/bailey-intelligence');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-6 py-4 rounded-xl font-medium transition-all flex items-center space-x-3 ${
                    isActive('/bailey-intelligence') 
                      ? 'bg-blue-600 text-white border-2 border-blue-500' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white border-2 border-transparent'
                  }`}
                >
                  <Brain className="w-5 h-5" />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-lg">Bailey Intelligence</span>
                    {!isActive('/bailey-intelligence') && (
                      <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">NEW</span>
                    )}
                  </div>
                </button>

                {/* Tools Section */}
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <p className="text-sm font-bold text-slate-200 mb-4 flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-violet-400" />
                    <span>Intelligence Tools</span>
                  </p>
                  <div className="space-y-3">
                    {tools.map((tool) => (
                      <button
                        key={tool.href}
                        onClick={() => {
                          router.push(tool.href);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all flex items-center space-x-3 ${
                          isActive(tool.href) 
                            ? 'bg-violet-600 text-white border border-violet-500' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white border border-slate-600'
                        }`}
                      >
                        <tool.icon className="w-5 h-5" />
                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-base">{tool.name}</span>
                          {tool.badge && (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                              {tool.badge}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="border-t border-slate-700 pt-6 space-y-4">
                  <button className="w-full text-left px-6 py-3 text-slate-400 font-medium hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
                    Login
                  </button>
                  <button 
                    onClick={() => {
                      router.push('/');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold px-6 py-4 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg text-center text-lg"
                  >
                    Get WeReady Score
                  </button>
                </div>
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