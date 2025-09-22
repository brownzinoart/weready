'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Loader2,
  RefreshCcw,
  Search,
  XCircle,
  Clock,
} from 'lucide-react';

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

const STATUS_CONFIG: Record<SourceStatusValue, { label: string; badgeClass: string; cardClass: string; icon: JSX.Element }> = {
  implemented: {
    label: 'Fully Implemented & Active',
    badgeClass: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
    cardClass: 'border border-emerald-200 bg-emerald-50',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  mock: {
    label: 'Implemented with Mock / Simulated Data',
    badgeClass: 'border border-blue-200 bg-blue-50 text-blue-700',
    cardClass: 'border border-blue-200 bg-blue-50',
    icon: <Clock className="h-4 w-4" />,
  },
  planned: {
    label: 'Planned / In Progress',
    badgeClass: 'border border-amber-200 bg-amber-50 text-amber-700',
    cardClass: 'border border-amber-200 bg-amber-50',
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  missing: {
    label: 'Missing Backend Implementation',
    badgeClass: 'border border-rose-200 bg-rose-50 text-rose-700',
    cardClass: 'border border-rose-200 bg-rose-50',
    icon: <XCircle className="h-4 w-4" />,
  },
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

  const implementedSources = useMemo(
    () => filteredInventory.filter((item) => item.status === 'implemented'),
    [filteredInventory]
  );

  const plannedSources = useMemo(
    () => filteredInventory.filter((item) => item.status !== 'implemented'),
    [filteredInventory]
  );

  const totalImplemented = inventory.filter((item) => item.status === 'implemented').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600">Loading source inventory…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Unable to load source inventory</p>
            <p className="text-sm">{error}</p>
            {authError && (
              <p className="mt-2 text-xs text-rose-600">
                Please sign in via the WeReady login modal; once authenticated the dashboard will refresh automatically.
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="mt-4 inline-flex items-center rounded-md border border-rose-300 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 shadow-sm hover:bg-rose-100"
        >
          <RefreshCcw className="mr-2 h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Live Source Inventory</h2>
          <p className="text-sm text-slate-600">
            {totalImplemented} sources fully implemented • {inventory.length} total tracked sources across {Object.keys(coverage).length}{' '}
            categories.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Filter sources by name, category, or organization"
              className="w-full rounded-md border border-slate-200 pl-9 pr-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-80"
            />
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Coverage summary */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(coverage).map(([category, stats]) => (
          <div
            key={category}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{category.replace(/_/g, ' ')}</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {stats.implemented}/{stats.total} implemented
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <ClipboardList className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${Math.min(stats.coverage_pct, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">{stats.coverage_pct}% coverage</p>
          </div>
        ))}
      </div>

      {/* Implemented sources */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Live Sources</h3>
          <span className="text-sm text-slate-500">
            Showing {implementedSources.length} of {filteredInventory.length} filtered sources
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {implementedSources.map((item) => {
            const health = statusSnapshot[item.source_id];
            const statusMeta = STATUS_CONFIG[item.status];
            return (
              <div
                key={item.source_id}
                className={`rounded-xl p-5 shadow-sm ${statusMeta.cardClass}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-emerald-700">{item.category.replace(/_/g, ' ')}</p>
                    <h4 className="mt-1 text-lg font-semibold text-slate-900">{item.name}</h4>
                    {item.organization && (
                      <p className="text-sm text-slate-600">{item.organization}</p>
                    )}
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusMeta.badgeClass}`}>
                    {statusMeta.icon}
                    <span>{statusMeta.label}</span>
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Connector</p>
                    <p className="font-medium text-slate-800">{item.connector_key?.split(':').pop()}</p>
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
                    <span className="text-xs uppercase tracking-wide text-slate-500">Source ID</span>
                    <p className="text-sm font-medium text-slate-700">{item.source_id}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {implementedSources.length === 0 && (
            <div className="col-span-full rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">
              No implemented sources match your filters.
            </div>
          )}
        </div>
      </div>

      {/* Planned or missing sources */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Planned & Upcoming Sources</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plannedSources.map((item) => {
            const statusMeta = STATUS_CONFIG[item.status];
            return (
              <div
                key={item.source_id}
                className={`rounded-xl p-5 shadow-sm ${statusMeta.cardClass}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{item.category.replace(/_/g, ' ')}</p>
                    <h4 className="mt-1 text-lg font-semibold text-slate-900">{item.name}</h4>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusMeta.badgeClass}`}>
                    {statusMeta.icon}
                    <span>{statusMeta.label}</span>
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  {item.implementation_notes || 'Backend implementation in progress. Displayed on the frontend roadmap.'}
                </p>
              </div>
            );
          })}
          {plannedSources.length === 0 && (
            <div className="col-span-full rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">
              All filtered sources are fully implemented.
            </div>
          )}
        </div>
      </div>

      {/* Gap analysis */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Frontend vs Backend Gap Analysis</h3>
          <span className="text-xs font-medium text-slate-500">Identifies sources displayed in the UI without backend coverage</span>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(gaps).map(([category, gapItems]) => (
            <div key={category} className="rounded-lg border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-semibold text-rose-700">{category.replace(/_/g, ' ')}</p>
              <ul className="mt-3 space-y-2 text-sm text-rose-600">
                {gapItems.map((gap) => (
                  <li key={gap.source_id} className="flex items-center justify-between">
                    <span>{gap.name}</span>
                    <span className="text-xs">{STATUS_CONFIG[gap.status].label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {Object.keys(gaps).length === 0 && (
            <div className="col-span-full rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center text-emerald-600">
              All displayed sources have active backend implementations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
