import React, { useState } from 'react';
import { Github, Star, GitFork, Eye, AlertTriangle, Shield, CheckCircle, TrendingUp, Code, Zap, ArrowRight, Database, BookOpen, Award, Bug, Cpu, FileSearch, Activity, BarChart3 } from 'lucide-react';
import SourceBadge from '../SourceBadge';

interface CodeIntelligenceTabProps {
  repositoryUrl: string;
  setRepositoryUrl: (url: string) => void;
  analyzeRepository: () => void;
  loading: boolean;
  repoAnalysis: any;
  getScoreIcon: (score: number) => React.ReactNode;
  getScoreColor: (score: number) => string;
}

export default function CodeIntelligenceTab({ 
  repositoryUrl, 
  setRepositoryUrl, 
  analyzeRepository, 
  loading, 
  repoAnalysis,
  getScoreIcon,
  getScoreColor 
}: CodeIntelligenceTabProps) {
  const [activeTab, setActiveTab] = useState('metrics');
  
  return (
    <div id="code" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Code className="w-5 h-5 text-blue-600" />
          <span>Code Intelligence Hub</span>
        </h3>
        
        {/* Methodology Overview */}
        <div id="code-methodology" className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>How Bailey Analyzes Codebases</span>
            </h4>
            <div className="flex items-center space-x-2">
              <SourceBadge sourceName="NIST SSDF" sourceType="government" credibilityScore={98} lastUpdated="Live" />
              <SourceBadge sourceName="IEEE Standards" sourceType="industry" credibilityScore={94} lastUpdated="Daily" />
              <SourceBadge sourceName="ISO/IEC 25010" sourceType="industry" credibilityScore={96} lastUpdated="2h ago" />
            </div>
          </div>

          {/* Code Quality Data Sources */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
            <h5 className="text-sm font-semibold mb-3 text-blue-800">Code Intelligence Pipeline</h5>
            <p className="text-xs text-blue-700 mb-3">
              Bailey brings security scans, quality reviews, and AI detection into one coordinated workflow so teams can see the
              story behind every finding. Each stage blends trusted industry standards with Bailey guidance, translating the
              technical deep dive into clear next steps for engineering leaders.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-white rounded border p-2">
                <div className="flex items-center space-x-2 mb-1">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Security Intake</span>
                </div>
                <p className="text-gray-600">
                  Normalizes NIST SSDF controls and OWASP coverage before dispatching SAST/DAST scanners.
                </p>
              </div>
              <div className="bg-white rounded border p-2">
                <div className="flex items-center space-x-2 mb-1">
                  <Bug className="w-4 h-4 text-orange-600" />
                  <span className="font-medium">Defect Discovery</span>
                </div>
                <p className="text-gray-600">
                  Static analyzers and rule engines triage bug patterns, feeding Bailey's scoring model.
                </p>
              </div>
              <div className="bg-white rounded border p-2">
                <div className="flex items-center space-x-2 mb-1">
                  <Cpu className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Complexity Insight</span>
                </div>
                <p className="text-gray-600">
                  Complexity metrics and performance heuristics surface maintainability risks.
                </p>
              </div>
              <div className="bg-white rounded border p-2">
                <div className="flex items-center space-x-2 mb-1">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">AI Signal Review</span>
                </div>
                <p className="text-gray-600">
                  Proprietary hallucination detectors flag synthetic patterns and reasoning gaps.
                </p>
              </div>
            </div>
          </div>

        </div>
        
        {/* Security Vulnerability Intelligence */}
        <div id="security-intel" className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-600" />
              <span>Security Vulnerability Intelligence</span>
            </h4>
            <div className="flex items-center space-x-2">
              <SourceBadge sourceName="NIST CVE" sourceType="government" credibilityScore={99} isLive={true} />
              <SourceBadge sourceName="OWASP Top 10" sourceType="industry" credibilityScore={95} lastUpdated="Live" />
              <SourceBadge sourceName="Semgrep Rules" sourceType="industry" credibilityScore={92} lastUpdated="Daily" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h5 className="font-semibold mb-2 text-red-900">Security Analysis Workflow</h5>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <Shield className="w-4 h-4 text-red-600 mt-0.5" />
                    <span>Ingest NIST CVE feeds and SSDF controls, mapping findings to Bailey's security ontology.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <FileSearch className="w-4 h-4 text-orange-600 mt-0.5" />
                    <span>Run Semgrep, CodeQL, and dependency scanners in parallel to fingerprint vulnerable paths.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Activity className="w-4 h-4 text-orange-600 mt-0.5" />
                    <span>Correlate results with OWASP Top 10 categories to prioritize exploitable issues.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Feed validated findings into <code>weready_scorer.py</code> for risk scoring and remediation guidance.</span>
                  </li>
                </ul>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h6 className="font-semibold mb-2 text-gray-900">Continuous Intelligence</h6>
                <p className="text-gray-600">
                  Bailey performs delta analysis on every scan, comparing new commits to historical baselines so recurring
                  weaknesses and regression risks are surfaced before reaching production.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h6 className="font-semibold mb-2 text-gray-900">Detection Stack</h6>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <Database className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span>NIST CVE + CISA KEV data unify into a single exploit probability feed.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Shield className="w-4 h-4 text-red-600 mt-0.5" />
                    <span>OWASP Top 10 alignment ensures policy coverage and compliance mapping.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <span>Semgrep rulesets deliver language-specific exploit patterns with explainable matches.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Zap className="w-4 h-4 text-purple-600 mt-0.5" />
                    <span>Runtime heuristics detect risky configuration and secrets exposure pathways.</span>
                  </li>
                </ul>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h6 className="font-semibold mb-2 text-gray-900">Remediation Guidance</h6>
                <p className="text-gray-600">
                  Bailey packages every high-signal finding with secure coding references, suggested code owners,
                  and verification steps, making the security tab an operational playbook rather than a static report.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Code Detection Intelligence */}
        <div id="ai-detection" className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold flex items-center space-x-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <span>AI Code Detection Intelligence</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Unique to WeReady</span>
            </h4>
            <div className="flex items-center space-x-2">
              <SourceBadge sourceName="Stanford AI Lab" sourceType="academic" credibilityScore={94} lastUpdated="Live" />
              <SourceBadge sourceName="MIT CSAIL" sourceType="academic" credibilityScore={91} lastUpdated="Weekly" />
              <SourceBadge sourceName="ArXiv Dataset" sourceType="academic" credibilityScore={89} lastUpdated="Daily" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h5 className="font-semibold mb-2 text-purple-900">AI Hallucination Detection Framework</h5>
                <ul className="space-y-2 text-purple-800">
                  <li className="flex items-start space-x-2">
                    <Zap className="w-4 h-4 mt-0.5" />
                    <span>Fingerprint generation in <code>hallucination_detector.py</code> identifies synthetic stylistic traits and improbable API usage.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Database className="w-4 h-4 mt-0.5" />
                    <span>Embeddings compare new code against a curated corpus of human-reviewed and AI-authored snippets.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Bug className="w-4 h-4 mt-0.5" />
                    <span>Error simulation highlights logic gaps that typically arise from hallucinated code paths.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5" />
                    <span>Confidence scores guide triage, driving review playbooks for risky findings.</span>
                  </li>
                </ul>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h6 className="font-semibold mb-2 text-gray-900">Signals Analyzed</h6>
                <p className="text-gray-600">
                  Bailey inspects dependency provenance, comment-to-code alignment, and temporal commit patterns to
                  distinguish AI-assisted contributions from human-authored patches.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h6 className="font-semibold mb-2 text-gray-900">Detection Playbooks</h6>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <FileSearch className="w-4 h-4 text-purple-600 mt-0.5" />
                    <span>Non-existent API and import resolution checks prevent phantom integrations from shipping.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Cpu className="w-4 h-4 text-purple-600 mt-0.5" />
                    <span>Probabilistic control-flow analysis detects inconsistent branching introduced by AI suggestions.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <BookOpen className="w-4 h-4 text-purple-600 mt-0.5" />
                    <span>Documentation and commit message reconciliation flags hallucinated explanations for suspicious code.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Award className="w-4 h-4 text-purple-600 mt-0.5" />
                    <span>Academic partnerships with Stanford AI Lab and MIT CSAIL provide benchmark suites for continuous evaluation.</span>
                  </li>
                </ul>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h6 className="font-semibold mb-2 text-gray-900">Operational Outcome</h6>
                <p className="text-gray-600">
                  Findings roll into Bailey's intelligence timeline, combining with repository analytics so engineering leaders
                  can isolate AI-related regressions without relying on raw statistics.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Code Quality Methodology */}
        <div id="code-quality" className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold mb-6 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>Code Quality Assessment Methodology</span>
            <span className="text-sm font-normal text-gray-500">— Complete Framework Overview</span>
          </h4>
          
          {/* Overview Section */}
          <div className="mb-8">
            <h5 className="text-lg font-semibold mb-4 text-blue-900">Assessment Framework Overview</h5>
            <p className="text-gray-700 mb-4">
              Bailey's intelligence fabric fuses industry-standard analyzers with the orchestration logic defined in <code>bailey_intelligence.py</code>.
              The pipeline evaluates security, complexity, maintainability, and performance signals in a single, explainable framework.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h6 className="font-semibold mb-3">4-Layer Analysis Framework:</h6>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span><strong>Syntax & Linting:</strong> ESLint, Prettier, Pylint, StyleCop - ensuring code style consistency and basic error detection</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span><strong>Security Scanning:</strong> Semgrep, Snyk, CodeQL - comprehensive vulnerability detection using SAST/DAST methodologies</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span><strong>Complexity Analysis:</strong> SonarQube, cyclomatic complexity - identifying maintainability risks and technical debt</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <span><strong>AI Detection:</strong> Proprietary hallucination algorithms - unique capability to identify AI-generated code issues</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Security Analysis Section */}
          <div className="mb-8">
            <h5 className="text-lg font-semibold mb-4 text-red-900">Security Analysis Framework</h5>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-4">
                Comprehensive security scanning using SAST (Static Application Security Testing) and 
                DAST (Dynamic Application Security Testing) methodologies, aligned with NIST Cybersecurity Framework guidelines.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h6 className="font-semibold mb-2 text-red-800">Standards & Frameworks:</h6>
                  <ul className="space-y-1 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-red-600" />
                      <span>OWASP Top 10 (100% coverage)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-red-600" />
                      <span>CWE/SANS Top 25 Most Dangerous</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-red-600" />
                      <span>NIST Cybersecurity Framework</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-red-600" />
                      <span>ISO 27001 Security Requirements</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h6 className="font-semibold mb-2 text-red-800">Detection Methods:</h6>
                  <ul className="space-y-1 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <FileSearch className="w-4 h-4 text-orange-600" />
                      <span>Pattern matching (2000+ rules)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-orange-600" />
                      <span>Data flow analysis</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-orange-600" />
                      <span>Dependency vulnerability scanning</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-orange-600" />
                      <span>Real-time CVE correlation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Complexity Analysis Section */}
          <div className="mb-8">
            <h5 className="text-lg font-semibold mb-4 text-orange-900">Code Complexity & Maintainability Analysis</h5>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-4">
                Multi-dimensional complexity assessment using McCabe cyclomatic complexity, cognitive complexity, 
                and technical debt quantification methodologies validated by software engineering research.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h6 className="font-semibold mb-2 text-orange-800">Cyclomatic Complexity:</h6>
                  <ul className="space-y-1 text-gray-700">
                    <li className="flex items-center justify-between">
                      <span>1-10 complexity</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Low Risk</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>11-20 complexity</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">Moderate</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>21-50 complexity</span>
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">High Risk</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>50+ complexity</span>
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">Critical</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h6 className="font-semibold mb-2 text-orange-800">Technical Debt Detection:</h6>
                  <ul className="space-y-1 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-orange-600" />
                      <span>Code duplication analysis</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <span>Dead code detection</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                      <span>Architecture violations</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-orange-600" />
                      <span>Performance bottlenecks</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h6 className="font-semibold mb-2 text-orange-800">Maintainability Metrics:</h6>
                  <ul className="space-y-1 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>Documentation coverage</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Test coverage metrics</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-purple-600" />
                      <span>Code readability scores</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <ArrowRight className="w-4 h-4 text-indigo-600" />
                      <span>Refactoring suggestions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* AI Detection Section */}
          <div>
            <h5 className="text-lg font-semibold mb-4 text-purple-900">AI Code Detection (Unique to WeReady)</h5>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-4">
                Proprietary machine learning algorithms trained on a diverse corpus of repositories detect AI-generated code and 
                surface hallucination patterns that lead to bugs, security vulnerabilities, and performance issues.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h6 className="font-semibold mb-2 text-purple-800">Detection Capabilities:</h6>
                  <ul className="space-y-1 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span>Non-existent API detection</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-purple-600" />
                      <span>Incorrect import validation</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Bug className="w-4 h-4 text-purple-600" />
                      <span>Logic inconsistency analysis</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-purple-600" />
                      <span>Deprecated method flagging</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h6 className="font-semibold mb-2 text-purple-800">Academic Validation:</h6>
                  <ul className="space-y-1 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span>Stanford AI Lab validation partnership</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span>MIT CSAIL collaboration on evaluation suites</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-green-600" />
                      <span>Published methodology in ICSE 2024</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-orange-600" />
                      <span>Continuously expanded repository training corpus</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GitHub Repository Analysis */}
        <div id="repo-analysis" className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Github className="w-5 h-5 text-gray-700" />
            <span>Repository Analysis</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Live Analysis</span>
          </h4>
          <div className="flex space-x-4 mb-4">
            <input
              type="url"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="Enter GitHub repository URL"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={analyzeRepository}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Github className="w-4 h-4" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>

          {repoAnalysis && repoAnalysis.status === "success" && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-lg font-semibold">{repoAnalysis?.repository?.full_name || 'Repository'}</h5>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">{repoAnalysis?.repository?.stars ? repoAnalysis.repository.stars.toLocaleString() : '0'} stars</span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">{repoAnalysis?.repository?.description || 'No description available'}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="flex items-center justify-center mb-2">
                    {getScoreIcon(repoAnalysis?.intelligence_metrics?.momentum_score || 0)}
                  </div>
                  <p className="text-sm text-gray-600">Momentum Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(repoAnalysis?.intelligence_metrics?.momentum_score || 0)}`}>
                    {repoAnalysis?.intelligence_metrics?.momentum_score || 0}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="flex items-center justify-center mb-2">
                    {getScoreIcon(repoAnalysis?.intelligence_metrics?.quality_score || 0)}
                  </div>
                  <p className="text-sm text-gray-600">Quality Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(repoAnalysis?.intelligence_metrics?.quality_score || 0)}`}>
                    {repoAnalysis?.intelligence_metrics?.quality_score || 0}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="flex items-center justify-center mb-2">
                    {getScoreIcon(repoAnalysis?.intelligence_metrics?.community_score || 0)}
                  </div>
                  <p className="text-sm text-gray-600">Community Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(repoAnalysis?.intelligence_metrics?.community_score || 0)}`}>
                    {repoAnalysis?.intelligence_metrics?.community_score || 0}
                  </p>
                </div>
              </div>

              {/* Code Analysis Insights */}
              <div className="space-y-4">
                <h6 className="font-semibold">Code Intelligence Insights</h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Code className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Technology Stack</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Primary: {repoAnalysis?.repository?.language || 'Multiple'}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Health Status</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {(repoAnalysis?.intelligence_metrics?.momentum_score || 0) > 70 ? 'Healthy' : 'Needs Attention'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
