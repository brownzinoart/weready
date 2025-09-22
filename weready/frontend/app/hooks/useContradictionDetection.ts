'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiCall } from '@/lib/api-config';
import type {
  ContradictionData,
  ContradictionResponse,
  ContradictionStats,
  UseContradictionDetectionReturn,
} from '../types/sources';

const DEFAULT_POLL_INTERVAL = 45_000;

const MOCK_CONTRADICTIONS: ContradictionData[] = [
  {
    id: 'mock-1',
    topic: 'AI Startup Funding Growth Rate',
    sources: ['MIT Research', 'CB Insights'],
    conflict: 'MIT reports 34% YoY growth while CB Insights shows 28% for the same cohort.',
    confidence: 85,
    severity: 'high',
    detected_at: new Date(Date.now() - 15 * 60_000).toISOString(),
    resolution: undefined,
    resolved_at: undefined,
    resolved_by: undefined,
    status: 'active',
    impact_score: 78,
  },
  {
    id: 'mock-2',
    topic: 'Time-to-Hire Benchmarks',
    sources: ['LinkedIn Talent', 'First Round Review'],
    conflict: 'LinkedIn indicates 46 days median while First Round cites 58 days.',
    confidence: 72,
    severity: 'medium',
    detected_at: new Date(Date.now() - 50 * 60_000).toISOString(),
    resolution: 'Variance explained by differing startup stage cohorts.',
    resolved_at: new Date(Date.now() - 20 * 60_000).toISOString(),
    resolved_by: 'bailey.ops',
    status: 'resolved',
    impact_score: 44,
  },
  {
    id: 'mock-3',
    topic: 'Security Breach Frequency',
    sources: ['GitGuardian', 'Semgrep'],
    conflict: 'GitGuardian flagged 12 incidents this week; Semgrep recorded 4 critical findings.',
    confidence: 68,
    severity: 'medium',
    detected_at: new Date(Date.now() - 90 * 60_000).toISOString(),
    resolution: undefined,
    resolved_at: undefined,
    resolved_by: undefined,
    status: 'acceptable',
    impact_score: 38,
  },
  {
    id: 'mock-4',
    topic: 'Accessibility Compliance Score',
    sources: ['WebAIM', 'Internal Audit'],
    conflict: 'WebAIM shows 94% compliance while internal audit indicates 86%.',
    confidence: 76,
    severity: 'high',
    detected_at: new Date(Date.now() - 5 * 60_000).toISOString(),
    resolution: undefined,
    resolved_at: undefined,
    resolved_by: undefined,
    status: 'investigating',
    impact_score: 64,
  },
];

const MOCK_STATS: ContradictionStats = {
  total: MOCK_CONTRADICTIONS.length,
  active: MOCK_CONTRADICTIONS.filter((item) => item.status === 'active').length,
  resolved: MOCK_CONTRADICTIONS.filter((item) => item.status === 'resolved').length,
  acceptable: MOCK_CONTRADICTIONS.filter((item) => item.status === 'acceptable').length,
  high_severity_percentage:
    (MOCK_CONTRADICTIONS.filter((item) => item.severity === 'high' || item.severity === 'critical').length /
      MOCK_CONTRADICTIONS.length) *
    100,
  median_resolution_time: '2h 14m',
  resolutions_last_24h: 3,
  average_credibility_impact: 3.6,
  last_checked: new Date().toISOString(),
};

export function useContradictionDetection(): UseContradictionDetectionReturn {
  const [contradictions, setContradictions] = useState<ContradictionData[]>([]);
  const [stats, setStats] = useState<ContradictionStats>(MOCK_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollTimerRef = useRef<number | null>(null);

  const applyPayload = useCallback((payload: ContradictionResponse) => {
    setContradictions(payload.contradictions ?? []);
    setStats({
      ...payload.stats,
      last_checked: payload.last_checked ?? new Date().toISOString(),
    });
    setError(null);
  }, []);

  const applyMockData = useCallback(() => {
    setContradictions(MOCK_CONTRADICTIONS);
    setStats({ ...MOCK_STATS, last_checked: new Date().toISOString() });
  }, []);

  const fetchContradictions = useCallback(async () => {
    try {
      const response = await apiCall('/sources/contradictions');
      if (!response.ok) {
        throw new Error(`status ${response.status}`);
      }
      const payload = (await response.json()) as ContradictionResponse;
      applyPayload(payload);
    } catch (err) {
      console.error('Failed to load contradictions, using mock data:', err);
      if (contradictions.length === 0) {
        applyMockData();
      }
      setError('Unable to refresh contradiction telemetry. Showing cached data.');
    } finally {
      setLoading(false);
    }
  }, [applyMockData, applyPayload, contradictions.length]);

  useEffect(() => {
    fetchContradictions();
  }, [fetchContradictions]);

  useEffect(() => {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
    }
    pollTimerRef.current = window.setInterval(fetchContradictions, DEFAULT_POLL_INTERVAL);
    return () => {
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current);
      }
    };
  }, [fetchContradictions]);

  const refreshContradictions = useCallback(async () => {
    setLoading(true);
    await fetchContradictions();
  }, [fetchContradictions]);

  const resolveContradiction = useCallback(
    async (id: string, resolution: string) => {
      try {
        await apiCall(`/sources/contradictions/${id}/resolve`, {
          method: 'POST',
          body: JSON.stringify({ resolution }),
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        console.error('Failed to resolve contradiction:', err);
        setError('Resolution failed. Please retry or escalate.');
      } finally {
        fetchContradictions();
      }
    },
    [fetchContradictions],
  );

  const markAsAcceptable = useCallback(
    async (id: string, reason: string) => {
      try {
        await apiCall(`/sources/contradictions/${id}/acceptable`, {
          method: 'POST',
          body: JSON.stringify({ reason }),
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        console.error('Failed to mark contradiction acceptable:', err);
        setError('Could not mark as acceptable.');
      } finally {
        fetchContradictions();
      }
    },
    [fetchContradictions],
  );

  const activeContradictions = useMemo(
    () => contradictions.filter((item) => item.status === 'active' || item.status === 'investigating'),
    [contradictions],
  );

  const resolvedContradictions = useMemo(
    () => contradictions.filter((item) => item.status === 'resolved'),
    [contradictions],
  );

  return {
    contradictions,
    activeContradictions,
    resolvedContradictions,
    loading,
    error,
    refreshContradictions,
    resolveContradiction,
    markAsAcceptable,
    contradictionStats: stats,
  };
}
