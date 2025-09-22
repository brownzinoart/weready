"use client";

import { useMemo, type ComponentProps } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Brain,
  Briefcase,
  Building,
  Bug,
  CheckCircle,
  Clock,
  Eye,
  Github,
  Globe,
  PieChart,
  Shield,
  Target,
  TrendingUp,
  Users,
  Zap,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import SourceBadge from "./SourceBadge";

type PillarId = "code" | "business" | "investment" | "design";

type SourceBadgeProps = ComponentProps<typeof SourceBadge>;

interface PillarOverviewProps {
  healthData: {
    intelligence?: {
      government_sources?: number;
      academic_papers_analyzed?: number;
      github_repositories_analyzed?: number;
      credible_sources?: number;
    };
  } | null;
  activeTab: string;
  onPillarClick: (pillar: PillarId) => void;
}

interface Capability {
  label: string;
  icon: LucideIcon;
  accentClass: string;
}

interface PillarCardConfig {
  id: PillarId;
  name: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  borderClass: string;
  activeClass: string;
  iconAccent: string;
  metricSummary: string;
  progress: number;
  progressBarClass: string;
  capabilities: Capability[];
  sources: SourceBadgeProps[];
}

const pillarIds: PillarId[] = ["code", "business", "investment", "design"];

const progressWithFallback = (value: number, denominator: number, fallback: number) => {
  if (Number.isFinite(value) && value > 0 && denominator > 0) {
    const ratio = Math.round((value / denominator) * 100);
    return Math.min(100, Math.max(32, ratio));
  }
  return fallback;
};

export default function PillarOverview({ healthData, activeTab, onPillarClick }: PillarOverviewProps) {
  const metrics = {
    governmentSources: healthData?.intelligence?.government_sources ?? 0,
    academicPapers: healthData?.intelligence?.academic_papers_analyzed ?? 0,
    githubRepos: healthData?.intelligence?.github_repositories_analyzed ?? 0,
    credibleSources: healthData?.intelligence?.credible_sources ?? 0,
  };

  const highlightedPillar: PillarId | null = pillarIds.includes(activeTab as PillarId)
    ? (activeTab as PillarId)
    : null;

  const { governmentSources, academicPapers, githubRepos, credibleSources } = metrics;

  const pillars: PillarCardConfig[] = useMemo(() => {
    const codeProgress = progressWithFallback(githubRepos, 200000, 84);
    const businessProgress = progressWithFallback(governmentSources, 120, 78);
    const investmentProgress = progressWithFallback(credibleSources, 120, 72);
    const designProgress = progressWithFallback(academicPapers, 5000, 76);

    return [
      {
        id: "code",
        name: "Code Intelligence",
        description:
          "Security-grade engineering intelligence that fuses vulnerability detection, hallucination monitoring, and live GitHub telemetry.",
        icon: Shield,
        gradient: "from-blue-600/15 via-blue-500/5 to-slate-50",
        borderClass: "border-blue-200/70",
        activeClass: "border-blue-500 shadow-xl ring-2 ring-blue-300/60 ring-offset-2",
        iconAccent: "text-blue-600",
        metricSummary: `${githubRepos.toLocaleString()} repositories monitored`,
        progress: codeProgress,
        progressBarClass: "from-blue-500 via-blue-500 to-indigo-500",
        capabilities: [
          { label: "Security detection", icon: Shield, accentClass: "text-blue-600" },
          { label: "AI hallucination guard", icon: Zap, accentClass: "text-purple-600" },
          { label: "Technical debt radar", icon: Bug, accentClass: "text-orange-600" },
          { label: "Live GitHub sync", icon: Github, accentClass: "text-slate-800" },
        ],
        sources: [
          { sourceName: "NIST CVE Feed", sourceType: "government", credibilityScore: 98, isLive: true, className: "bg-white/70" },
          { sourceName: "OWASP Top 10", sourceType: "industry", credibilityScore: 95, lastUpdated: "Daily", className: "bg-white/70" },
          {
            sourceName: `${githubRepos.toLocaleString()} GitHub repos`,
            sourceType: "community",
            credibilityScore: 92,
            lastUpdated: "Rolling",
            className: "bg-white/70",
          },
        ],
      },
      {
        id: "business",
        name: "Business Intelligence",
        description:
          "Evidence-backed market, regulatory, and procurement insights that validate traction across domestic and international arenas.",
        icon: BarChart3,
        gradient: "from-purple-600/15 via-purple-500/5 to-white",
        borderClass: "border-purple-200/70",
        activeClass: "border-purple-500 shadow-xl ring-2 ring-purple-300/60 ring-offset-2",
        iconAccent: "text-purple-600",
        metricSummary: `${governmentSources.toLocaleString()} government feeds tracked`,
        progress: businessProgress,
        progressBarClass: "from-purple-500 via-violet-500 to-fuchsia-500",
        capabilities: [
          { label: "Market validation", icon: Building, accentClass: "text-indigo-600" },
          { label: "Procurement intelligence", icon: Briefcase, accentClass: "text-purple-600" },
          { label: "Global expansion insight", icon: Globe, accentClass: "text-cyan-600" },
          { label: "Trend surveillance", icon: Activity, accentClass: "text-amber-600" },
        ],
        sources: [
          { sourceName: "SEC EDGAR", sourceType: "government", credibilityScore: 97, lastUpdated: "Live", className: "bg-white/70" },
          { sourceName: "USAspending", sourceType: "government", credibilityScore: 95, lastUpdated: "Daily", className: "bg-white/70" },
          { sourceName: "World Bank", sourceType: "international", credibilityScore: 93, lastUpdated: "Weekly", className: "bg-white/70" },
        ],
      },
      {
        id: "investment",
        name: "Investment Intelligence",
        description:
          "Continuous fundraising readiness models blending venture benchmarks, real-time funding alerts, and economic timing signals.",
        icon: TrendingUp,
        gradient: "from-emerald-600/15 via-emerald-500/5 to-white",
        borderClass: "border-emerald-200/70",
        activeClass: "border-emerald-500 shadow-xl ring-2 ring-emerald-300/60 ring-offset-2",
        iconAccent: "text-emerald-600",
        metricSummary: `${credibleSources.toLocaleString()} credible sources scored`,
        progress: investmentProgress,
        progressBarClass: "from-emerald-500 via-teal-500 to-lime-500",
        capabilities: [
          { label: "Funding readiness", icon: Target, accentClass: "text-emerald-600" },
          { label: "Live funding surveillance", icon: Eye, accentClass: "text-teal-600" },
          { label: "Economic timing", icon: Clock, accentClass: "text-lime-600" },
          { label: "Probabilistic scoring", icon: PieChart, accentClass: "text-emerald-700" },
        ],
        sources: [
          { sourceName: "YC Library", sourceType: "industry", credibilityScore: 91, lastUpdated: "Weekly", className: "bg-white/70" },
          { sourceName: "NVCA Benchmarks", sourceType: "industry", credibilityScore: 94, lastUpdated: "Monthly", className: "bg-white/70" },
          { sourceName: "Federal Reserve FRED", sourceType: "government", credibilityScore: 96, lastUpdated: "Live", className: "bg-white/70" },
        ],
      },
      {
        id: "design",
        name: "Design Intelligence",
        description:
          "Evidence-based UX and product design evaluations that boost conversion, usability, and accessibility with academic rigor.",
        icon: Brain,
        gradient: "from-violet-600/15 via-violet-500/5 to-white",
        borderClass: "border-violet-200/70",
        activeClass: "border-violet-500 shadow-xl ring-2 ring-violet-300/60 ring-offset-2",
        iconAccent: "text-violet-600",
        metricSummary: `${academicPapers.toLocaleString()} papers synthesized`,
        progress: designProgress,
        progressBarClass: "from-violet-500 via-purple-500 to-pink-500",
        capabilities: [
          { label: "Evidence-based audits", icon: BookOpen, accentClass: "text-violet-600" },
          { label: "UX quality scoring", icon: Users, accentClass: "text-fuchsia-600" },
          { label: "Conversion optimization", icon: ArrowUpRight, accentClass: "text-rose-600" },
          { label: "Accessibility compliance", icon: CheckCircle, accentClass: "text-emerald-600" },
        ],
        sources: [
          { sourceName: "Nielsen Norman Group", sourceType: "industry", credibilityScore: 93, lastUpdated: "Monthly", className: "bg-white/70" },
          { sourceName: "Baymard Research", sourceType: "academic", credibilityScore: 92, lastUpdated: "Weekly", className: "bg-white/70" },
          { sourceName: "W3C Accessibility", sourceType: "community", credibilityScore: 95, lastUpdated: "Live", className: "bg-white/70" },
        ],
      },
    ];
  }, [academicPapers, credibleSources, githubRepos, governmentSources]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-slate-900">Bailey's four-pillar intelligence framework</h3>
          <p className="text-sm text-slate-600">
            Hover to preview each capability stack and click a pillar to launch the detailed intelligence workspace.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold shadow-sm">
            <Brain className="h-4 w-4 text-purple-500" />
            <span>{metrics.credibleSources.toLocaleString()} verified sources</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold shadow-sm">
            <Shield className="h-4 w-4 text-blue-500" />
            <span>{metrics.governmentSources.toLocaleString()} government feeds</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          const isActive = highlightedPillar === pillar.id;

          return (
            <button
              key={pillar.id}
              type="button"
              onClick={() => onPillarClick(pillar.id)}
              className={`group relative overflow-hidden rounded-2xl border ${pillar.borderClass} bg-gradient-to-br ${pillar.gradient} p-6 text-left shadow-sm transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 ${
                isActive ? pillar.activeClass : "hover:-translate-y-1 hover:shadow-xl"
              }`}
              aria-pressed={isActive}
              aria-label={`Explore ${pillar.name}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/80 p-3 shadow-sm backdrop-blur">
                    <Icon className={`h-6 w-6 ${pillar.iconAccent}`} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Bailey Pillar</p>
                    <h4 className="text-lg font-semibold text-slate-900">{pillar.name}</h4>
                  </div>
                </div>
                <div className="hidden rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm md:flex">
                  {pillar.metricSummary}
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">{pillar.description}</p>

              <div className="mt-5 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                {pillar.capabilities.map((capability) => {
                  const CapabilityIcon = capability.icon;
                  return (
                    <div
                      key={`${pillar.id}-${capability.label}`}
                      className="flex items-center gap-2 rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-slate-700 shadow-sm transition-colors duration-200 group-hover:border-white/80"
                    >
                      <CapabilityIcon className={`h-4 w-4 ${capability.accentClass}`} />
                      <span className="font-medium">{capability.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {pillar.sources.map((source) => (
                  <SourceBadge key={`${pillar.id}-${source.sourceName}`} {...source} />
                ))}
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span>Analysis completion</span>
                  <span className="text-slate-800">{pillar.progress}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/50">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${pillar.progressBarClass}`}
                    style={{ width: `${pillar.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-700 transition-opacity duration-200 group-hover:opacity-100">
                <span>Explore</span>
                <ArrowRight className="h-4 w-4" />
              </div>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
