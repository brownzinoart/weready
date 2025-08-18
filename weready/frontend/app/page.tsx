"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertTriangle, XCircle, Github, Award, TrendingUp, Users, Star, ArrowRight } from "lucide-react";
import Navigation from "./components/Navigation";
import HowItWorks from "./components/HowItWorks";
import Footer from "./components/Footer";

export default function Home() {
  const router = useRouter();
  const [inputMode, setInputMode] = useState<"code" | "repo">("repo");
  const [code, setCode] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [scanning, setScanning] = useState(false);

  // Mock data scenarios
  const mockScenarios = [
    {
      // Scenario A: High-Performing Startup (87/100 - WeReady Stamp Eligible)
      overall_score: 87,
      verdict: "ready_to_ship",
      weready_stamp_eligible: true,
      breakdown: {
        code_quality: { score: 92, status: "excellent", weight: 40, issues: [], recommendations: ["Continue excellent practices"] },
        business_model: { score: 85, status: "good", weight: 30, issues: ["Consider adding more detailed cohort analysis"], recommendations: ["Strengthen unit economics documentation"] },
        investment_ready: { score: 83, status: "good", weight: 30, issues: ["Prepare for due diligence documentation"], recommendations: ["Prepare Series A pitch deck"] }
      },
      success_probability: 0.85,
      funding_timeline: "3-6 months ready",
      credibility_score: 98,
      market_percentile: 95,
      brain_recommendations: [
        {
          id: "rec1",
          priority: "high",
          category: "code_quality",
          title: "Implement comprehensive test coverage",
          description: "Current test coverage is good but could be enhanced with integration tests for core business logic",
          action: "Add integration tests for payment processing and user authentication flows",
          timeline: "2-3 weeks",
          evidence_source: "Y Combinator - Startup Playbook",
          organization: "Y Combinator",
          confidence: 94,
          similar_cases: 127,
          impact: "Reduces deployment risk by 40%"
        },
        {
          id: "rec2",
          priority: "medium",
          category: "business_model",
          title: "Strengthen unit economics documentation",
          description: "Your CAC/LTV ratio is excellent, but detailed documentation will help with investor presentations",
          action: "Create detailed unit economics dashboard with cohort analysis",
          timeline: "1-2 weeks",
          evidence_source: "Bessemer Venture Partners - CAC/LTV Best Practices",
          organization: "Bessemer VC",
          confidence: 91,
          similar_cases: 89,
          impact: "Increases investor confidence by 25%"
        },
        {
          id: "rec3",
          priority: "medium",
          category: "investment_readiness",
          title: "Prepare Series A pitch deck",
          description: "Your metrics are strong enough for Series A, focus on growth strategy and market expansion",
          action: "Develop 15-slide Series A deck emphasizing scalability and market opportunity",
          timeline: "3-4 weeks",
          evidence_source: "MIT Entrepreneurship - Fundraising Guide",
          organization: "MIT",
          confidence: 88,
          similar_cases: 156,
          impact: "Optimal timing for Series A fundraising"
        },
        {
          id: "rec4",
          priority: "low",
          category: "code_quality",
          title: "Optimize database queries",
          description: "Performance is good but optimization will support rapid scaling",
          action: "Implement database indexing and query optimization for user search",
          timeline: "1 week",
          evidence_source: "Sequoia Capital - Scaling Playbook",
          organization: "Sequoia Capital",
          confidence: 85,
          similar_cases: 203,
          impact: "Supports 10x user growth"
        },
        {
          id: "rec5",
          priority: "low",
          category: "business_model",
          title: "Expand customer success metrics",
          description: "Track additional retention and expansion metrics for investor updates",
          action: "Implement NPS, expansion revenue, and churn cohort tracking",
          timeline: "2 weeks",
          evidence_source: "Andreessen Horowitz - SaaS Metrics",
          organization: "a16z",
          confidence: 82,
          similar_cases: 174,
          impact: "Enhanced investor reporting"
        }
      ],
      category_issues: {
        code_quality: [],
        business_model: ["Consider adding more detailed cohort analysis"],
        investment_readiness: ["Prepare for due diligence documentation"]
      },
      moats: ["Network effects", "Proprietary data", "Strong team expertise"],
      improvement_roadmap: {
        immediate: ["Finalize test coverage", "Update pitch deck"],
        short_term: ["Implement analytics dashboard", "Prepare due diligence room"],
        long_term: ["Series A fundraising", "International expansion planning"]
      },
      market_context: {
        percentile: "Top 5%",
        comparison: "Better than most YC startups at Demo Day"
      },
      competitive_moats: ["Network effects", "Proprietary data", "Strong team expertise"],
      next_steps: ["Continue excellent execution", "Prepare for Series A"],
      files_analyzed: 1
    },
    {
      // Scenario B: Medium Startup (68/100 - Promising)
      overall_score: 68,
      verdict: "needs_work",
      weready_stamp_eligible: false,
      breakdown: {
        code_quality: { score: 75, status: "good", weight: 40, issues: ["Test coverage could be improved"], recommendations: ["Add unit tests for core modules"] },
        business_model: { score: 62, status: "needs_work", weight: 30, issues: ["Weak product-market fit signals", "Unclear revenue scaling"], recommendations: ["Validate product-market fit", "Refine pricing strategy"] },
        investment_ready: { score: 65, status: "needs_work", weight: 30, issues: ["Limited traction metrics", "No clear growth strategy"], recommendations: ["Implement key metrics tracking", "Develop scalable growth plan"] }
      },
      success_probability: 0.72,
      funding_timeline: "6-12 months of development needed",
      credibility_score: 78,
      market_percentile: 68,
      brain_recommendations: [
        {
          id: "rec1",
          priority: "critical",
          category: "business_model",
          title: "Validate product-market fit",
          description: "Customer interviews show mixed signals. Need stronger validation before scaling",
          action: "Conduct 50+ customer interviews and analyze usage patterns",
          timeline: "4-6 weeks",
          evidence_source: "First Round - PMF Framework",
          organization: "First Round Capital",
          confidence: 92,
          similar_cases: 234,
          impact: "Critical for sustainable growth"
        },
        {
          id: "rec2",
          priority: "high",
          category: "code_quality",
          title: "Improve error handling and monitoring",
          description: "Current error rates are manageable but monitoring needs enhancement",
          action: "Implement comprehensive logging and error tracking system",
          timeline: "3-4 weeks",
          evidence_source: "Google SRE Handbook",
          organization: "Google",
          confidence: 89,
          similar_cases: 145,
          impact: "Reduces customer support burden by 60%"
        },
        {
          id: "rec3",
          priority: "high",
          category: "investment_readiness",
          title: "Establish clear revenue model",
          description: "Multiple pricing experiments needed to optimize revenue per customer",
          action: "A/B test 3 pricing strategies with current user base",
          timeline: "6-8 weeks",
          evidence_source: "Price Intelligently - SaaS Pricing",
          organization: "ProfitWell",
          confidence: 87,
          similar_cases: 178,
          impact: "Could increase ARPU by 40-60%"
        }
      ],
      category_issues: {
        code_quality: ["Inconsistent error handling", "Limited monitoring"],
        business_model: ["Unclear value proposition", "Mixed customer feedback", "Pricing strategy needs work"],
        investment_readiness: ["Financial projections need validation", "Market size assumptions unclear"]
      },
      moats: ["First-mover advantage", "Growing user base"],
      improvement_roadmap: {
        immediate: ["Customer interview program", "Error monitoring setup"],
        short_term: ["Pricing optimization", "Product-market fit validation"],
        long_term: ["Seed extension or Series A prep", "Feature expansion"]
      },
      market_context: {
        percentile: "Top 40%",
        comparison: "Typical early-stage startup score"
      },
      competitive_moats: ["First-mover advantage", "Growing user base"],
      next_steps: ["Focus on product-market fit validation", "Improve error monitoring"],
      files_analyzed: 1
    },
    {
      // Scenario C: Low-Performing Startup (43/100 - Critical Issues)
      overall_score: 43,
      verdict: "critical_issues",
      weready_stamp_eligible: false,
      breakdown: {
        code_quality: { score: 35, status: "critical", weight: 40, issues: ["Critical security vulnerabilities", "Poor code structure", "No testing"], recommendations: ["Address security vulnerabilities", "Implement proper testing framework", "Refactor core architecture"] },
        business_model: { score: 45, status: "needs_work", weight: 30, issues: ["No clear value proposition", "Unclear target market", "No revenue model"], recommendations: ["Define clear value proposition", "Identify target customer segments", "Develop sustainable revenue model"] },
        investment_ready: { score: 55, status: "needs_work", weight: 30, issues: ["No metrics tracking", "Weak team", "No traction"], recommendations: ["Establish key performance metrics", "Build credible team", "Focus on user acquisition"] }
      },
      success_probability: 0.45,
      funding_timeline: "12+ months significant work needed",
      credibility_score: 52,
      market_percentile: 25,
      brain_recommendations: [
        {
          id: "rec1",
          priority: "critical",
          category: "code_quality",
          title: "Address critical security vulnerabilities",
          description: "Multiple high-severity security issues detected that must be resolved immediately",
          action: "Conduct full security audit and implement fixes for all critical vulnerabilities",
          timeline: "2-3 weeks",
          evidence_source: "OWASP Security Guidelines",
          organization: "OWASP",
          confidence: 98,
          similar_cases: 89,
          impact: "Prevents potential data breaches"
        },
        {
          id: "rec2",
          priority: "critical",
          category: "business_model",
          title: "Pivot or validate core assumptions",
          description: "Current business model shows weak unit economics and limited market traction",
          action: "Reassess target market and consider pivoting core value proposition",
          timeline: "8-12 weeks",
          evidence_source: "Lean Startup Methodology",
          organization: "Eric Ries",
          confidence: 91,
          similar_cases: 267,
          impact: "Fundamental to business viability"
        },
        {
          id: "rec3",
          priority: "critical",
          category: "code_quality",
          title: "Implement basic testing framework",
          description: "No automated testing detected. This is preventing safe feature development",
          action: "Set up unit and integration testing with minimum 60% coverage",
          timeline: "4-6 weeks",
          evidence_source: "Test-Driven Development Best Practices",
          organization: "Kent Beck",
          confidence: 95,
          similar_cases: 312,
          impact: "Enables safe feature development"
        }
      ],
      category_issues: {
        code_quality: ["Critical security vulnerabilities", "No automated testing", "Poor code organization", "Performance issues"],
        business_model: ["Weak unit economics", "Unclear target market", "Limited customer validation", "No clear monetization strategy"],
        investment_readiness: ["Insufficient traction metrics", "Weak financial projections", "Team gaps in key areas"]
      },
      moats: [],
      improvement_roadmap: {
        immediate: ["Security vulnerability fixes", "Basic testing setup"],
        short_term: ["Customer validation study", "Business model reassessment"],
        long_term: ["Product pivot consideration", "Team strengthening"]
      },
      market_context: {
        percentile: "Bottom 40%",
        comparison: "Far below investment threshold"
      },
      competitive_moats: [],
      next_steps: ["Address critical security issues", "Validate business model fundamentals"],
      files_analyzed: 1
    }
  ];

  const generateMockData = () => {
    const randomScenario = mockScenarios[Math.floor(Math.random() * mockScenarios.length)];
    return randomScenario;
  };

  const navigateToResults = (resultData: any, isMock: boolean = false) => {
    console.log("=== NAVIGATION DEBUG ===");
    console.log("navigateToResults called with:", { resultData: !!resultData, isMock });
    
    try {
      // Store data in sessionStorage to avoid URL length limits
      const dataId = `weready_result_${Date.now()}`;
      sessionStorage.setItem(dataId, JSON.stringify(resultData));
      sessionStorage.setItem('weready_current_result', dataId);
      sessionStorage.setItem('weready_is_mock', isMock.toString());
      
      console.log("Data stored in sessionStorage with ID:", dataId);
      
      // Navigate with simple URL
      const url = `/results?id=${dataId}`;
      console.log("Navigating to URL:", url);
      
      router.push(url);
      console.log("router.push executed successfully");
      
    } catch (error) {
      console.error("Navigation failed:", error);
      console.log("Attempting fallback navigation...");
      
      // Fallback: try direct window navigation
      try {
        const dataId = `weready_result_${Date.now()}`;
        sessionStorage.setItem(dataId, JSON.stringify(resultData));
        sessionStorage.setItem('weready_current_result', dataId);
        sessionStorage.setItem('weready_is_mock', isMock.toString());
        
        window.location.href = `/results?id=${dataId}`;
      } catch (fallbackError) {
        console.error("Fallback navigation also failed:", fallbackError);
        alert("Navigation failed. Please try refreshing the page.");
      }
    }
    
    console.log("=== END NAVIGATION DEBUG ===");
  };

  const scanCode = async () => {
    console.log("scanCode called", { inputMode, code, repoUrl });
    if (inputMode === "code" && !code) return;
    if (inputMode === "repo" && !repoUrl) return;

    setScanning(true);
    
    // Check if user typed "mock" to trigger mock data
    const isMockTrigger = (inputMode === "code" && code.toLowerCase().trim() === "mock") || 
                         (inputMode === "repo" && repoUrl.toLowerCase().trim() === "mock");
    
    console.log("Mock trigger check:", { isMockTrigger, inputMode, code, repoUrl });
    
    if (isMockTrigger) {
      console.log("Mock path triggered - using API for real free analysis");
      // Use the real API instead of mock data to test the full flow
      try {
        const response = await fetch("http://localhost:8000/api/analyze/free", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code_snippet: "mock test for demo", language: "python" }),
        });
        
        if (!response.ok) {
          throw new Error(`Analysis failed: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Real API data received:", data);
        setScanning(false);
        navigateToResults(data, false); // Use real API data, not mock
        console.log("Navigated to results page with real API data");
        return;
      } catch (error) {
        console.error("Mock API call failed, falling back to frontend mock:", error);
        // Fallback to frontend mock if API fails
        setTimeout(() => {
          console.log("Mock timeout completed - generating data");
          const mockData = generateMockData();
          console.log("Mock data generated:", mockData);
          setScanning(false);
          navigateToResults(mockData, true);
          console.log("Navigated to results page");
        }, 2000);
        return;
      }
    }
    
    try {
      const requestBody = inputMode === "code" 
        ? { code_snippet: code, language: "python" }
        : { repository_url: repoUrl, language: "python" };
        
      const response = await fetch("http://localhost:8000/api/analyze/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }
      
      const data = await response.json();
      setScanning(false);
      navigateToResults(data, false);
    } catch (error) {
      console.error("Scan failed:", error);
      const errorResult = {
        overall_score: 0,
        verdict: "ERROR",
        breakdown: {
          code_quality: { score: 0, status: "error", weight: 40, issues: ["Analysis failed"], recommendations: [] },
          business_model: { score: 0, status: "error", weight: 30, issues: ["Analysis failed"], recommendations: [] },
          investment_ready: { score: 0, status: "error", weight: 30, issues: ["Analysis failed"], recommendations: [] }
        },
        brain_recommendations: [],
        improvement_roadmap: { immediate: [], short_term: [], long_term: [] },
        competitive_moats: [],
        action_required: "Analysis failed. Please try again or use manual code input.",
        files_analyzed: 0
      };
      setScanning(false);
      navigateToResults(errorResult, false);
    }
  };


  const isValidInput = inputMode === "code" ? code.trim() : repoUrl.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navigation />

      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-3">
        <div className="max-w-6xl mx-auto px-4">
          <p className="font-semibold">
            🚀 <span className="text-blue-100">Live Demo:</span> This is a fully functional demo showing WeReady's complete analysis capabilities
            <span className="ml-2 text-blue-200">• Try "Mock Demo" for comprehensive results •</span>
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center py-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Get Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              WeReady Score
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-4 max-w-3xl mx-auto leading-relaxed">
            Don't let technical hiccups kill your startup. Get actionable guidance to ship confidently.
          </p>
          
          <div className="flex justify-center mb-8">
            <div 
              onClick={() => router.push('/bailey-intelligence')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            >
              <span className="font-semibold">🧠 NEW: Bailey Intelligence Dashboard</span>
              <span className="text-blue-100">→</span>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="relative bg-gradient-to-br from-violet-50 via-white to-purple-50 rounded-3xl shadow-2xl border-2 border-violet-200 p-10 mb-12">
          <div className="relative text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-900 to-purple-900 bg-clip-text text-transparent mb-3">
              Analyze Your Startup
            </h2>
            <p className="text-lg text-slate-600 max-w-lg mx-auto">
              Get your comprehensive readiness score across code quality, business model, and investment potential
            </p>
          </div>

          {/* Input Mode Toggle */}
          <div className="relative flex justify-center mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 flex shadow-lg border border-violet-200">
              <button
                onClick={() => setInputMode("repo")}
                className={`px-8 py-4 rounded-xl font-semibold transition-all flex items-center space-x-3 ${
                  inputMode === "repo"
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg transform scale-105"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Github className="w-5 h-5" />
                <span>GitHub Repository</span>
              </button>
              <button
                onClick={() => setInputMode("code")}
                className={`px-8 py-4 rounded-xl font-semibold transition-all flex items-center space-x-3 ${
                  inputMode === "code"
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg transform scale-105"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>Manual Code</span>
              </button>
            </div>
          </div>

          {inputMode === "repo" ? (
            <div className="relative max-w-2xl mx-auto">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                Repository URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  className="w-full bg-white/80 backdrop-blur-sm border-2 border-violet-200 rounded-2xl px-6 py-5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400 transition-all text-lg shadow-lg"
                  placeholder="https://github.com/username/repository (or include 'mock' to see demo)"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                />
                <Github className="absolute right-6 top-5 w-6 h-6 text-violet-400" />
              </div>
            </div>
          ) : (
            <div className="relative max-w-2xl mx-auto">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                Paste Your Code
              </label>
              <textarea
                className="w-full h-48 bg-white/80 backdrop-blur-sm border-2 border-violet-200 rounded-2xl px-6 py-5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400 transition-all font-mono text-sm shadow-lg"
                placeholder="Paste your AI-generated code here...\n\nTip: Type 'mock' to see a comprehensive demo report!"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          )}

          <div className="relative max-w-2xl mx-auto mt-10">
            <button
              onClick={scanCode}
              disabled={!isValidInput || scanning}
              className="relative w-full bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 hover:from-violet-700 hover:via-purple-700 hover:to-violet-800 text-white font-bold py-6 px-8 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl hover:shadow-violet-500/25 flex items-center justify-center space-x-3"
            >
              {scanning ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span className="text-lg">Running WeReady Analysis...</span>
                </>
              ) : (
                <>
                  <span className="text-lg">🚀 FREE WeReady Analysis</span>
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
            
            <p className="text-center text-slate-600 text-sm mt-4">
              🎁 Your first analysis is completely free - no signup required
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <HowItWorks />

      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}