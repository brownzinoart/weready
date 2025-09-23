'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Loader2,
  RefreshCcw,
  Search,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  getCategoryServiceValue,
  getKeyboardNavigationHint,
  getSourceServiceValue,
  handleKeyboardActivation,
} from '../utils/sourceHealthUtils';

export type SourceStatusValue = 'implemented' | 'mock' | 'planned' | 'missing';

interface SourceInventoryItem {
  source_id: string;
  name: string;
  category: string;
  organization?: string | null;
  status: SourceStatusValue;
  credibility_score?: number | null;
  connector_key?: string | null;
  implementation_notes?: string | null;
}

interface SourceStatusItem {
  name: string;
  category: string;
  status: SourceStatusValue;
  knowledge_points: number;
}

interface CoverageItem {
  implemented: number;
  total: number;
  coverage_pct: number;
}

interface GapAnalysisItem {
  source_id: string;
  name: string;
  status: SourceStatusValue;
}

const FILTER_HELP_ID = 'source-inventory-filter-help';

const formatCategoryLabel = (category: string): string => category.replace(/_/g, ' ');

type StatusTone = 'success' | 'info' | 'caution' | 'critical';

interface InventoryStatusConfig {
  label: string;
  callout: string;
  badgeClass: string;
  tone: StatusTone;
  icon: LucideIcon;
  description: string;
  nextSteps: string[];
}

const STATUS_CONFIG: Record<SourceStatusValue, InventoryStatusConfig> = {
  implemented: {
    label: 'Live for customers',
    callout: 'Operational',
    badgeClass: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
    tone: 'success',
    icon: CheckCircle2,
    description: 'Real-time data is flowing and ready for decision-makers.',
    nextSteps: [
      'Promote the new insights to stakeholders.',
      'Monitor adoption and uptime metrics to protect value delivery.',
    ],
  },
  mock: {
    label: 'Simulated experience',
    callout: 'Mocked data',
    badgeClass: 'border border-blue-200 bg-blue-50 text-blue-700',
    tone: 'info',
    icon: Clock,
    description: 'Representative data keeps the experience interactive while integration finalises.',
    nextSteps: [
      'Validate user journeys with sample data.',
      'Coordinate production credential rollout.',
    ],
  },
  planned: {
    label: 'Coming soon',
    callout: 'On roadmap',
    badgeClass: 'border border-amber-200 bg-amber-50 text-amber-700',
    tone: 'caution',
    icon: RefreshCcw,
    description: 'Integration is prioritised and sequencing is underway.',
    nextSteps: [
      'Confirm launch timelines with delivery teams.',
      'Prepare enablement messaging for rollout.',
    ],
  },
  missing: {
    label: 'Coverage gap',
    callout: 'Action needed',
    badgeClass: 'border border-rose-200 bg-rose-50 text-rose-700',
    tone: 'critical',
    icon: ShieldAlert,
    description: 'UI references exist but backend integration is not yet scheduled.',
    nextSteps: [
      'Evaluate demand and prioritise the integration.',
      'Communicate expected timelines to stakeholders.',
    ],
  },
};

const toneCardAccent: Record<StatusTone, string> = {
  success: 'hover:border-emerald-200 focus-visible:ring-emerald-300/70',
  info: 'hover:border-blue-200 focus-visible:ring-blue-300/70',
  caution: 'hover:border-amber-200 focus-visible:ring-amber-300/70',
  critical: 'hover:border-rose-200 focus-visible:ring-rose-300/70',
};

const toneIconWrapper: Record<StatusTone, string> = {
  success: 'bg-emerald-100 text-emerald-600',
  info: 'bg-blue-100 text-blue-600',
  caution: 'bg-amber-100 text-amber-600',
  critical: 'bg-rose-100 text-rose-600',
};

const normaliseBaseUrl = (raw?: string): string | undefined => {
  if (!raw) return undefined;

  const trimmed = raw.trim().replace(/\/$/, '');
  if (!trimmed) return undefined;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}${trimmed}`.replace(/\/$/, '');
    }
    return `http:${trimmed}`.replace(/\/$/, '');
  }

  if (trimmed.startsWith(':')) {
    if (typeof window !== 'undefined') {
      const { protocol, hostname } = window.location;
      return `${protocol}//${hostname}${trimmed}`.replace(/\/$/, '');
    }
    return `http://localhost${trimmed}`.replace(/\/$/, '');
  }

  if (!trimmed.includes('://')) {
    return `http://${trimmed}`.replace(/\/$/, '');
  }

  return trimmed;
};

const ENV_API_BASE = normaliseBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

const resolveUrl = (path: string): string => {
  if (path.startsWith('http')) return path;

  const defaultBase = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : 'http://localhost:8000';

  const base = (ENV_API_BASE ?? defaultBase).replace(/\/$/, '');

  return base ? `${base}${path.startsWith('/') ? path : `/${path}`}` : path;
};

async function fetchJson<T>(path: string): Promise<T> {
  const url = resolveUrl(path);

  const headers: HeadersInit = {};
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    credentials: 'include',
    headers,
  });
  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`) as Error & {
      status?: number;
    };
    error.status = response.status;
    throw error;
  }
  return response.json();
}

const buildCardAriaLabel = (
  item: SourceInventoryItem,
  statusMeta: InventoryStatusConfig,
): string => {
  const organisation = item.organization ? `Partner ${item.organization}.` : '';
  return `${item.name}. ${statusMeta.label}. ${statusMeta.description} ${organisation} Category ${formatCategoryLabel(item.category)}.`;
};

export default function SourceInventoryDashboard() {
  const [inventory, setInventory] = useState<SourceInventoryItem[]>([]);
  const [statusSnapshot, setStatusSnapshot] = useState<Record<string, SourceStatusItem>>({});
  const [coverage, setCoverage] = useState<Record<string, CoverageItem>>({});
  const [gaps, setGaps] = useState<Record<string, GapAnalysisItem[]>>({});
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [filterAnnouncement, setFilterAnnouncement] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAuthError(false);
    try {
      const [inventoryData, statusData, coverageData, gapsData] = await Promise.all([
        fetchJson<SourceInventoryItem[]>('/api/sources/inventory'),
        fetchJson<Record<string, SourceStatusItem>>('/api/sources/status'),
        fetchJson<Record<string, CoverageItem>>('/api/sources/coverage'),
        fetchJson<Record<string, GapAnalysisItem[]>>('/api/sources/gaps'),
      ]);
      setInventory(inventoryData);
      setStatusSnapshot(statusData);
      setCoverage(coverageData);
      setGaps(gapsData);
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 401 || status === 403) {
        setAuthError(true);
        setError('Authentication required to view source inventory.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load source inventory.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  const filteredInventory = useMemo(() => {
    if (!filter) {
      return inventory;
    }
    const query = filter.toLowerCase();
    return inventory.filter((item) =>
      [item.name, item.source_id, item.category, item.organization]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    );
  }, [inventory, filter]);

  useEffect(() => {
    if (filter) {
      setFilterAnnouncement(`${filteredInventory.length} sources match “${filter}”.`);
    } else {
      setFilterAnnouncement(`Showing all ${filteredInventory.length} sources.`);
    }
  }, [filter, filteredInventory.length]);

  const implementedSources = useMemo(
    () => filteredInventory.filter((item) => item.status === 'implemented'),
    [filteredInventory],
  );

  const plannedSources = useMemo(
    () => filteredInventory.filter((item) => item.status !== 'implemented'),
    [filteredInventory],
  );

  const totalImplemented = inventory.filter((item) => item.status === 'implemented').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16" role="status" aria-live="polite">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" aria-hidden="true" />
        <span className="ml-3 text-slate-600">Loading your source inventory…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm"
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5" aria-hidden="true" />
          <div>
            <p className="text-base font-semibold">We couldn’t load the source inventory.</p>
            <p className="mt-1 text-sm">{error}</p>
            {authError && (
              <p className="mt-2 text-xs text-rose-700">
                Please sign in through the WeReady login modal. The dashboard will refresh automatically once authenticated.
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="mt-4 inline-flex items-center rounded-md border border-rose-300 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 shadow-sm transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
        >
          <RefreshCcw className="mr-2 h-4 w-4" aria-hidden="true" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Live Source Inventory</h2>
          <p className="text-sm text-slate-600" aria-live="polite">
            {totalImplemented} sources live • {inventory.length} total tracked • {Object.keys(coverage).length} categories monitored.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Filter sources by name, category, or organization"
              aria-label="Filter sources"
              aria-describedby={FILTER_HELP_ID}
              className="w-full rounded-md border border-slate-200 py-1.5 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-80"
            />
            <p id={FILTER_HELP_ID} className="sr-only">
              Start typing to filter sources. Search matches name, identifier, category, and organization.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2"
            aria-live="polite"
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        {filterAnnouncement}
      </span>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" role="list">
        {Object.entries(coverage).map(([category, stats]) => {
          const serviceValue = getCategoryServiceValue(category);
          return (
            <div
              key={category}
              role="listitem"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{formatCategoryLabel(category)}</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {stats.implemented}/{stats.total} implemented
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <ClipboardList className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${Math.min(stats.coverage_pct, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-500">{Math.round(stats.coverage_pct)}% coverage</p>
              <p className="mt-2 text-xs text-slate-500">{serviceValue}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Live Sources</h3>
          <span className="text-sm text-slate-500">
            Showing {implementedSources.length} of {filteredInventory.length} filtered sources
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {implementedSources.map((item, index) => {
            const statusMeta = STATUS_CONFIG[item.status];
            const cardToneClass = toneCardAccent[statusMeta.tone];
            const iconWrapperClass = toneIconWrapper[statusMeta.tone];
            const StatusIcon = statusMeta.icon;
            const health = statusSnapshot[item.source_id];
            const descriptionId = `${item.source_id}-details`;
            const navHint = getKeyboardNavigationHint(index, implementedSources.length);

            return (
              <article
                key={item.source_id}
                role="article"
                tabIndex={0}
                aria-label={buildCardAriaLabel(item, statusMeta)}
                aria-describedby={descriptionId}
                onKeyDown={(event) => handleKeyboardActivation(event, () => setFilter(item.name))}
                className={`group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${cardToneClass}`}
              >
                <span className="sr-only">{navHint}</span>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconWrapperClass}`}>
                      <StatusIcon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {statusMeta.label}
                      </p>
                      <h4 className="mt-1 text-lg font-semibold text-slate-900">{item.name}</h4>
                      {item.organization && (
                        <p className="text-sm text-slate-600">Partner: {item.organization}</p>
                      )}
                      <p className="mt-1 text-xs text-slate-500">Category · {formatCategoryLabel(item.category)}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}>
                    {statusMeta.callout}
                  </span>
                </div>

                <p className="mt-3 text-sm text-slate-600">{statusMeta.description}</p>

                <div id={descriptionId} className="mt-3 space-y-3 text-sm text-slate-600">
                  <p>{getSourceServiceValue(item.name, item.category, item.implementation_notes)}</p>
                  <ul className="space-y-1 text-xs text-slate-500" role="list">
                    {statusMeta.nextSteps.map((step) => (
                      <li key={`${item.source_id}-${step}`} role="listitem" className="flex items-start gap-2">
                        <Sparkles className="mt-0.5 h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Connector</p>
                    <p className="font-medium text-slate-800">{item.connector_key?.split(':').pop() ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Knowledge Points</p>
                    <p className="font-medium text-slate-800">{health?.knowledge_points ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Credibility Score</p>
                    <p className="font-medium text-slate-800">{item.credibility_score ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Source ID</p>
                    <p className="font-medium text-slate-800">{item.source_id}</p>
                  </div>
                </div>
              </article>
            );
          })}
          {implementedSources.length === 0 && (
            <div className="col-span-full rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">
              No implemented sources match your filters.
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Planned & Upcoming Sources</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plannedSources.map((item, index) => {
            const statusMeta = STATUS_CONFIG[item.status];
            const cardToneClass = toneCardAccent[statusMeta.tone];
            const iconWrapperClass = toneIconWrapper[statusMeta.tone];
            const StatusIcon = statusMeta.icon;
            const descriptionId = `${item.source_id}-planned-details`;
            const navHint = getKeyboardNavigationHint(index, plannedSources.length);

            return (
              <article
                key={item.source_id}
                role="article"
                tabIndex={0}
                aria-label={buildCardAriaLabel(item, statusMeta)}
                aria-describedby={descriptionId}
                onKeyDown={(event) => handleKeyboardActivation(event, () => setFilter(item.name))}
                className={`group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${cardToneClass}`}
              >
                <span className="sr-only">{navHint}</span>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconWrapperClass}`}>
                      <StatusIcon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {statusMeta.label}
                      </p>
                      <h4 className="mt-1 text-lg font-semibold text-slate-900">{item.name}</h4>
                      <p className="mt-1 text-xs text-slate-500">Category · {formatCategoryLabel(item.category)}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}>
                    {statusMeta.callout}
                  </span>
                </div>

                <div id={descriptionId} className="mt-3 space-y-3 text-sm text-slate-600">
                  <p>{item.implementation_notes || statusMeta.description}</p>
                  <ul className="space-y-1 text-xs text-slate-500" role="list">
                    {statusMeta.nextSteps.map((step) => (
                      <li key={`${item.source_id}-${step}`} role="listitem" className="flex items-start gap-2">
                        <Sparkles className="mt-0.5 h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
          {plannedSources.length === 0 && (
            <div className="col-span-full rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">
              All filtered sources are fully implemented.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Frontend vs Backend Gap Analysis</h3>
          <span className="text-xs font-medium text-slate-500">
            Highlights UI coverage that needs backend support
          </span>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3" role="list">
          {Object.entries(gaps).map(([category, gapItems]) => (
            <div
              key={category}
              role="listitem"
              className="rounded-xl border border-rose-200 bg-rose-50 p-4"
            >
              <p className="text-sm font-semibold text-rose-700">{formatCategoryLabel(category)}</p>
              <p className="mt-1 text-xs text-rose-600">
                {getCategoryServiceValue(category)} Missing sources reduce coverage until backend work is complete.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-rose-600" role="list">
                {gapItems.map((gap) => {
                  const statusMeta = STATUS_CONFIG[gap.status];
                  return (
                    <li key={gap.source_id} className="flex items-start justify-between gap-2" role="listitem">
                      <span>{gap.name}</span>
                      <span className="text-xs font-semibold">{statusMeta.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {Object.keys(gaps).length === 0 && (
            <div
              className="col-span-full rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center text-emerald-700"
              role="status"
              aria-live="polite"
            >
              All displayed sources have active backend coverage. No gaps to address.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
