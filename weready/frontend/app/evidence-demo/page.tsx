'use client';

import { useState, useEffect } from 'react';
import { Shield, CheckCircle, ExternalLink, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navigation from "../components/Navigation";

export default function EvidenceDemo() {
  const [evidenceData, setEvidenceData] = useState<any>(null);
  const [methodology, setMethodology] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = async () => {
    try {
      // Load evidence for hallucination detection
      const evidenceResponse = await fetch('http://localhost:8000/evidence/hallucination_detection');
      const methodologyResponse = await fetch('http://localhost:8000/methodology');
      
      if (evidenceResponse.ok && methodologyResponse.ok) {
        const evidenceData = await evidenceResponse.json();
        const methodologyData = await methodologyResponse.json();
        
        setEvidenceData(evidenceData);
        setMethodology(methodologyData);
      }
    } catch (error) {
      console.error('Failed to load demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading evidence system demo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Why WeReady is <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Unbeatable</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Every WeReady score is backed by authoritative sources that ChatGPT and Claude cannot access. 
            See the evidence that makes our recommendations credible and actionable.
          </p>
        </div>

        {/* Methodology Overview */}
        {methodology && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
              <Shield className="w-6 h-6 text-violet-600" />
              <span>Our Credibility Advantage</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {methodology.methodology.evidence_based_scoring.total_sources}
                </div>
                <div className="text-slate-700 font-medium">Authoritative Sources</div>
                <div className="text-sm text-slate-500 mt-1">Government, Academic, VC</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {methodology.methodology.evidence_based_scoring.average_credibility.toFixed(1)}
                </div>
                <div className="text-slate-700 font-medium">Average Credibility</div>
                <div className="text-sm text-slate-500 mt-1">Out of 100</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border-2 border-violet-200">
                <div className="text-3xl font-bold text-violet-600 mb-2">
                  {methodology.methodology.real_time_intelligence.knowledge_points}
                </div>
                <div className="text-slate-700 font-medium">Knowledge Points</div>
                <div className="text-sm text-slate-500 mt-1">Real-time data</div>
              </div>
            </div>

            {/* What ChatGPT Cannot Do */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">What ChatGPT Cannot Provide</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <ul className="space-y-2">
                    {methodology.methodology.chatgpt_cannot_provide.slice(0, 3).map((limitation: string, idx: number) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-slate-700">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <ul className="space-y-2">
                    {methodology.methodology.chatgpt_cannot_provide.slice(3).map((limitation: string, idx: number) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-slate-700">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Evidence Example */}
        {evidenceData && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Evidence in Action: AI Code Hallucination Detection</h2>
            
            {/* ChatGPT vs WeReady */}
            <div className="mb-6 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl">
              <h3 className="text-lg font-bold text-amber-800 mb-3">ChatGPT vs WeReady</h3>
              <div className="text-slate-700 text-lg leading-relaxed">
                {evidenceData.chatgpt_comparison}
              </div>
            </div>

            {/* Threshold Information */}
            <div className="mb-6 p-6 bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-200 rounded-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Our Specific Threshold</h3>
              <div className="text-2xl font-bold text-violet-600 mb-2">
                {(evidenceData.threshold.value * 100).toFixed(0)}% Hallucination Rate
              </div>
              <div className="text-slate-700">{evidenceData.threshold.description}</div>
            </div>

            {/* Evidence Sources */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Supporting Evidence Sources</h3>
              <div className="space-y-4">
                {evidenceData.evidence_points.map((evidence: any, idx: number) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-6 hover:border-violet-200 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">{evidence.source_name}</h4>
                        <div className="text-slate-600">{evidence.organization}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-violet-600">
                          {evidence.credibility_score}/100
                        </div>
                        <div className="text-sm text-slate-500">credibility</div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-slate-700 mb-2">{evidence.context}</div>
                      <div className="text-sm text-slate-500">
                        <strong>Methodology:</strong> {evidence.methodology}
                      </div>
                      <div className="text-sm text-slate-500">
                        <strong>Last Updated:</strong> {evidence.last_updated}
                      </div>
                    </div>
                    
                    <a 
                      href={evidence.evidence_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-violet-600 hover:text-violet-800 font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View Original Source</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-8 p-6 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white text-center">
              <h3 className="text-xl font-bold mb-2">See WeReady in Action</h3>
              <p className="mb-4 text-violet-100">
                Experience evidence-backed startup analysis that ChatGPT simply cannot provide.
              </p>
              <button 
                onClick={() => router.push('/')}
                className="bg-white text-violet-600 font-bold px-6 py-3 rounded-lg hover:bg-violet-50 transition-colors"
              >
                Analyze Your Startup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}