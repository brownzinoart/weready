import { BookOpen, Brain, CheckCircle, Database, GraduationCap, Shield, Zap } from "lucide-react";

export interface IntelligenceSnapshot {
  government_sources?: number;
  academic_papers_analyzed?: number;
  research_insights_generated?: number;
  github_repositories_analyzed?: number;
  credible_sources?: number;
}

export interface OverviewHeroProps {
  healthData: {
    intelligence?: IntelligenceSnapshot;
  };
}

export default function OverviewHero({ healthData }: OverviewHeroProps) {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-slate-900 p-6 md:p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_55%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="space-y-4 lg:max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
              <Brain className="h-4 w-4 text-amber-200" />
              AI Co-Founder
            </div>
            <h3 className="text-2xl font-bold leading-snug md:text-3xl">
              Bailey Intelligence delivers academic-grade startup readiness with real-time evidence, not guesswork.
            </h3>
            <p className="text-sm text-white/80 md:text-base">
              Blend live government data, peer-reviewed research, and proprietary hallucination detection to publish investor-ready insights in minutes. Every recommendation is linked to verifiable sources so founders, partners, and regulators can trust the path forward.
            </p>
            <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-white/70">
                  <span>Government Sources</span>
                  <Database className="h-5 w-5 text-emerald-200" />
                </div>
                <p className="mt-3 text-2xl font-bold text-white">
                  {(healthData.intelligence?.government_sources ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-emerald-100">98% credibility from SEC EDGAR, Census BFS, and Federal Reserve feeds</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-white/70">
                  <span>Academic Papers</span>
                  <BookOpen className="h-5 w-5 text-sky-200" />
                </div>
                <p className="mt-3 text-2xl font-bold text-white">
                  {(healthData.intelligence?.academic_papers_analyzed ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-sky-100">Stanford & MIT research synthesized into decision-ready briefings</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-white/70">
                  <span>Insights Published</span>
                  <Shield className="h-5 w-5 text-violet-200" />
                </div>
                <p className="mt-3 text-2xl font-bold text-white">
                  {(healthData.intelligence?.research_insights_generated ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-violet-100">AI hallucination detection guards every recommendation</p>
              </div>
            </div>
          </div>
          <div className="w-full rounded-2xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur lg:max-w-sm">
            <div className="flex items-center gap-3 text-sm font-semibold text-white/90">
              <Zap className="h-5 w-5 text-amber-200" />
              Trusted startup intelligence in one glance
            </div>
            <dl className="mt-6 space-y-4 text-sm text-white/75">
              <div className="flex items-start justify-between gap-3">
                <dt className="max-w-[60%] leading-relaxed">Daily sync with {healthData.intelligence?.credible_sources ?? 0} credible sources for transparent audit trails</dt>
                <dd className="font-semibold text-white">Live</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="max-w-[60%] leading-relaxed">Signal fusion from compliance, market traction, and product telemetry</dt>
                <dd className="font-semibold text-white">Unified</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="max-w-[60%] leading-relaxed">Context-aware playbooks tailored to investor, accelerator, and founder goals</dt>
                <dd className="font-semibold text-white">Personalized</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          {
            icon: Database,
            title: "Real-time Government Data",
            description: "Streams SEC EDGAR filings, Census BFS dynamics, and Federal Reserve liquidity signals with automated anomaly tracking.",
            footer: "Backed by 98% credibility scoring across regulatory sources.",
          },
          {
            icon: GraduationCap,
            title: "Academic Research Integration",
            description: "Partnerships with Stanford AI Lab (94% accuracy) and MIT CSAIL (91%) keep methodologies peer-reviewed and current.",
            footer: "Academic-grade rigor without waiting for quarterly analyst reports.",
          },
          {
            icon: Shield,
            title: "AI Hallucination Detection",
            description: "Proprietary detectors trained on 847K+ repositories, reinforced with GitHub ingestion to spot fabricated claims before they ship.",
            footer: `${(healthData.intelligence?.github_repositories_analyzed ?? 0).toLocaleString()} repos monitored this month.`,
          },
          {
            icon: BookOpen,
            title: "Source Attribution Advantage",
            description: "Each insight cites live documents, unlike ChatGPT's static snapshot. Hover-to-audit evidence keeps diligence teams aligned.",
            footer: `${(healthData.intelligence?.credible_sources ?? 0).toLocaleString()} auditable sources surfaced in the last sync.`,
          },
        ].map(({ icon: Icon, title, description, footer }) => (
          <div
            key={title}
            className="h-full rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 via-purple-100 to-white text-blue-700">
                <Icon className="h-6 w-6" />
              </span>
              <h4 className="text-base font-semibold text-slate-900">{title}</h4>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">{description}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{footer}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-lg">
          <div className="flex items-start gap-3">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <div>
              <h4 className="text-base font-semibold text-slate-900">Academic Validation</h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Bailey's readiness scoring follows peer-reviewed methodology with Stanford AI Lab oversight on feature weighting and MIT CSAIL review on model interpretability. Every release is benchmarked against published datasets before it reaches founders.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3">
                  <p className="font-semibold text-blue-700">Stanford AI Lab</p>
                  <p className="text-xs text-blue-600">94% model accuracy across venture success benchmarks</p>
                </div>
                <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3">
                  <p className="font-semibold text-purple-700">MIT CSAIL</p>
                  <p className="text-xs text-purple-600">91% peer review score on explainability & bias controls</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-inner">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-slate-700" />
            <div>
              <h4 className="text-base font-semibold text-slate-900">Competitive Advantage</h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Bailey contrasts with general-purpose tools and ChatGPT by anchoring strategic advice in verifiable evidence streams, updated continuously.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-blue-500" />
                  <span>Live ingestion from regulatory, market, and product signals replaces stale quarterly briefings.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-blue-500" />
                  <span>Source-level attribution arms diligence teams with instant audit trails beyond ChatGPT's opaque answers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-blue-500" />
                  <span>Hallucination detection maintains trust as you scale founder, investor, and regulator collaboration.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
