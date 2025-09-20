import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Building, Shield, DollarSign, BarChart3, Globe, Factory, Zap, Briefcase } from 'lucide-react';
import SourceBadge from '../SourceBadge';
import MethodologyCard from '../MethodologyCard';

type SourceBadgeMeta = {
  sourceName: string;
  sourceType: 'government' | 'international' | 'industry' | 'community' | 'academic';
  isLive?: boolean;
  lastUpdated?: string;
  cost?: 'free' | 'paid';
};

type FlowStage = {
  icon: LucideIcon;
  iconClassName: string;
  title: string;
  description: string;
};

const PIPELINE_SOURCES: SourceBadgeMeta[] = [
  { sourceName: 'SEC EDGAR', sourceType: 'government', isLive: true },
  { sourceName: 'USPTO', sourceType: 'government', isLive: true },
  { sourceName: 'Federal Reserve', sourceType: 'government', isLive: true },
  { sourceName: 'Census BFS', sourceType: 'government', lastUpdated: 'Weekly' },
  { sourceName: 'BEA', sourceType: 'government', lastUpdated: 'Monthly' },
  { sourceName: 'USAspending', sourceType: 'government', cost: 'free' },
  { sourceName: 'World Bank', sourceType: 'international', lastUpdated: 'Quarterly' },
  { sourceName: 'Product Hunt', sourceType: 'industry', lastUpdated: 'Real-time' }
];

const INTELLIGENCE_FLOW_STAGES: FlowStage[] = [
  { icon: Building, iconClassName: 'text-blue-600', title: 'SEC + FCC Filings', description: 'Real-time credentialing' },
  { icon: Shield, iconClassName: 'text-green-600', title: 'USPTO + Census', description: 'Innovation & formation data' },
  { icon: DollarSign, iconClassName: 'text-purple-600', title: 'BEA + FRED', description: 'Economic timing index' },
  { icon: Globe, iconClassName: 'text-indigo-600', title: 'World Bank/OECD', description: 'Global expansion signals' }
];

export default function BusinessIntelligenceTab(): JSX.Element {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span>Business Intelligence Hub</span>
        </h3>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="text-lg font-semibold flex items-center space-x-2">
              <Globe className="w-5 h-5 text-purple-600" />
              <span>Authoritative Data Pipeline</span>
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {PIPELINE_SOURCES.map((source) => (
                <SourceBadge key={source.sourceName} {...source} />
              ))}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h5 className="text-sm font-semibold mb-3 text-purple-800">Intelligence Flow</h5>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              {INTELLIGENCE_FLOW_STAGES.map(({ icon: Icon, iconClassName, title, description }) => (
                <div key={title} className="bg-white rounded border p-3 text-center">
                  <Icon className={`w-4 h-4 mx-auto mb-1 ${iconClassName}`} />
                  <div className="font-medium">{title}</div>
                  <div className="text-gray-600">{description}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-purple-700">
              <strong>Free-first principle:</strong> 95%+ of intelligence sourced directly from free government & international APIs. No paid intermediaries or resellers.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MethodologyCard
              title="Source Authentication"
              description="Bailey Intelligence validates each feed before it reaches downstream analysis."
              highlights={[
                'SEC EDGAR, FCC licensing, and USPTO records are cross-checked in bailey_intelligence ingest routines.',
                'API credentials and refresh cadences are logged to preserve provenance for every record.'
              ]}
              tone="sky"
            />
            <MethodologyCard
              title="Schema Harmonization"
              description="Core schemas normalize economic, regulatory, and innovation signals into a shared timeline."
              highlights={[
                'business_formation_tracker aligns weekly BFS filings with historic BDS cohorts.',
                'Economic releases from BEA and Federal Reserve endpoints are mapped to Bailey taxonomies.'
              ]}
              tone="purple"
            />
            <MethodologyCard
              title="Signal Scoring"
              description="Quantitative heuristics weight each observation for readiness, momentum, and risk."
              highlights={[
                'International, procurement, and technology analyzers publish comparable credibility scores.',
                'Anomaly detection flags outliers before insights move into analyst notebooks.'
              ]}
              tone="emerald"
            />
            <MethodologyCard
              title="Analyst Delivery"
              description="Insights render as evidence-backed briefs instead of single-point forecasts."
              highlights={[
                'Method cards link directly to source badges so teams can audit every claim.',
                'Playbooks combine structured data, qualitative notes, and recommended next actions.'
              ]}
              tone="blue"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold flex items-center space-x-2">
              <Factory className="w-5 h-5 text-sky-600" />
              <span>Census Business Formation Statistics</span>
            </h4>
            <SourceBadge sourceName="Census BFS" sourceType="government" lastUpdated="Weekly" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MethodologyCard
              title="Formation Velocity Modeling"
              description="business_formation_tracker treats Census BFS releases as a live indicator of founder momentum."
              highlights={[
                'Seasonal adjustment logic maps week-over-week swings onto historic BDS cohorts.',
                'State and NAICS level deltas trigger alerts pushed into Bailey decision briefings.'
              ]}
              tone="sky"
            />
            <MethodologyCard
              title="Founder Segmentation"
              description="Entity resolution blends BFS applications with licensing and patent data to profile builder types."
              highlights={[
                'USPTO and Secretary of State registries supply identity anchors for emerging teams.',
                'Segmented cohorts support localized GTM experimentation and capital matching.'
              ]}
              tone="blue"
            />
            <MethodologyCard
              title="Market Entry Readiness"
              description="Insights emphasize qualitative readiness narratives instead of synthetic forecasts."
              highlights={[
                'Analysts pair quantitative surges with policy and capital context before publishing guidance.',
                'Findings feed into Bailey playbooks that outline timing and risk mitigations.'
              ]}
              tone="purple"
            />
          </div>
          <p className="text-xs text-slate-600 mt-4">
            The Census BFS stream acts as the heartbeat for Bailey\'s formation coverage, grounding strategic recommendations in observable founder behavior rather than speculative projections.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold flex items-center space-x-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              <span>International Market Intelligence</span>
            </h4>
            <div className="flex items-center gap-2">
              <SourceBadge sourceName="World Bank" sourceType="international" lastUpdated="Quarterly" />
              <SourceBadge sourceName="OECD SDMX" sourceType="international" lastUpdated="Monthly" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MethodologyCard
              title="Opportunity Scoring Framework"
              description="international_market_intelligence synthesizes entrepreneurship, trade, and capital signals."
              highlights={[
                'World Bank, OECD SDMX, and IMF indicators harmonize into comparable readiness tiers.',
                'Local cost structures and digital infrastructure baselines shape weighting logic per market.'
              ]}
              tone="emerald"
            />
            <MethodologyCard
              title="Regulatory Patterning"
              description="Analysts map policy, procurement, and incentive regimes before greenlighting expansion hypotheses."
              highlights={[
                'Custom crawlers monitor export controls, privacy statutes, and incentive programs.',
                'Findings update Bailey risk registers shared across GTM and compliance leads.'
              ]}
              tone="green"
            />
            <MethodologyCard
              title="Scenario Narratives"
              description="Every briefing couples quantitative rankings with qualitative guidance."
              highlights={[
                'Comparative cases highlight talent pipelines, capital access, and distribution partners.',
                'Decision templates clarify trigger conditions for pilots, partnerships, or deferral.'
              ]}
              tone="blue"
            />
          </div>
          <p className="text-xs text-slate-600 mt-4">
            Global recommendations emerge from triangulating multilateral datasets with policy intelligence, ensuring Bailey clients understand the why behind every suggested market move.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-amber-600" />
              <span>Government Procurement Intelligence</span>
            </h4>
            <div className="flex items-center gap-2">
              <SourceBadge sourceName="USAspending" sourceType="government" isLive />
              <SourceBadge sourceName="SAM.gov" sourceType="government" lastUpdated="Daily" />
              <SourceBadge sourceName="SBIR/STTR" sourceType="government" lastUpdated="Weekly" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MethodologyCard
              title="Pipeline Mapping"
              description="procurement_intelligence fuses USAspending awards with SAM.gov solicitations to surface emerging demand windows."
              highlights={[
                'Entity resolution links contracting officers, NAICS codes, and obligation history.',
                'Temporal models surface renewal cycles and pre-solicitation chatter.'
              ]}
              tone="orange"
            />
            <MethodologyCard
              title="Capability Fit Scoring"
              description="Opportunity briefs emphasize fit criteria instead of top-line contract values."
              highlights={[
                'Bailey capability taxonomies map client offerings to requirement language.',
                'Risk signals flag compliance hurdles, set-asides, and teaming prerequisites.'
              ]}
              tone="blue"
            />
            <MethodologyCard
              title="Non-Dilutive Capital Playbooks"
              description="Analysts translate intelligence into actionable teaming and bidding guidance."
              highlights={[
                'SBIR/STTR trackers connect research agendas with transition pathways.',
                'Recommended actions span capture cadences, partner introductions, and grant prep.'
              ]}
              tone="purple"
            />
          </div>
          <p className="text-xs text-slate-600 mt-4">
            Procurement coverage focuses on how to earn placement, giving teams a repeatable methodology anchored in verifiable federal data rather than speculative revenue tallies.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold flex items-center space-x-2">
              <Zap className="w-5 h-5 text-violet-600" />
              <span>Technology Trend Monitoring</span>
            </h4>
            <div className="flex items-center gap-2">
              <SourceBadge sourceName="Product Hunt" sourceType="industry" lastUpdated="Real-time" />
              <SourceBadge sourceName="Stack Exchange" sourceType="community" lastUpdated="Daily" />
              <SourceBadge sourceName="OpenAlex" sourceType="academic" lastUpdated="Daily" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MethodologyCard
              title="Signal Fusion"
              description="technology_trend_analyzer unifies product, community, and research feeds into a single insight layer."
              highlights={[
                'Product Hunt launches, GitHub velocity, and Stack Exchange threads normalize into comparable momentum signals.',
                'Open source repositories tagged to Bailey themes feed longitudinal adoption curves.'
              ]}
              tone="purple"
            />
            <MethodologyCard
              title="Community Pulse Stories"
              description="Qualitative narratives describe why practitioners care about an emerging topic."
              highlights={[
                'Stack Exchange threads and developer blogs are summarized for plain-language briefs.',
                'Analysts annotate sentiment and friction themes to guide enablement content.'
              ]}
              tone="blue"
            />
            <MethodologyCard
              title="Research Translation"
              description="OpenAlex publications and grant data bridge academic work with commercialization signals."
              highlights={[
                'Topic modeling links research clusters to Bailey client problem statements.',
                'Early evidence flags when to pursue partnerships, build integrations, or monitor further.'
              ]}
              tone="emerald"
            />
          </div>
          <p className="text-xs text-slate-600 mt-4">
            Trend briefs emphasize the methodology behind emerging tech coverage, giving builders the evidence trail behind Bailey commentary instead of vanity adoption scores.
          </p>
        </div>
      </div>
    </div>
  );
}
