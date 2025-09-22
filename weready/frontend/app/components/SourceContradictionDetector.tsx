'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  CircleDot,
  Flame,
  History,
  ListChecks,
  ShieldAlert,
} from 'lucide-react';
import type {
  ContradictionData,
  UseContradictionDetectionReturn,
} from '../types/sources';
import {
  formatRelativeTime,
  getSeverityBadgeClasses,
} from '../utils/sourceHealthUtils';

interface SourceContradictionDetectorProps {
  contradictionState: UseContradictionDetectionReturn;
}

const severityOrder: ContradictionData['severity'][] = [
  'critical',
  'high',
  'medium',
  'low',
];

export default function SourceContradictionDetector({
  contradictionState,
}: SourceContradictionDetectorProps) {
  const {
    contradictions,
    activeContradictions,
    resolvedContradictions,
    loading,
    error,
    refreshContradictions,
    resolveContradiction,
    markAsAcceptable,
    contradictionStats,
  } = contradictionState;

  const [selectedSeverity, setSelectedSeverity] = useState<
    ContradictionData['severity'] | 'all'
  >('all');
  const [selectedStatus, setSelectedStatus] = useState<
    ContradictionData['status'] | 'all'
  >('all');

  const filtered = useMemo(() => {
    return contradictions.filter((contradiction) => {
      const matchesSeverity =
        selectedSeverity === 'all' || contradiction.severity === selectedSeverity;
      const matchesStatus =
        selectedStatus === 'all' || contradiction.status === selectedStatus;
      return matchesSeverity && matchesStatus;
    });
  }, [contradictions, selectedSeverity, selectedStatus]);

  const priorityList = useMemo(
    () =>
      [...activeContradictions].sort((a, b) =>
        severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity),
      ),
    [activeContradictions],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Source Contradiction Monitoring
          </h3>
          <p className="text-sm text-slate-600">
            Real-time detection of conflicting signals across intelligence
            sources with audit trails, manual overrides, and escalation
            workflows.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <button
            type="button"
            onClick={refreshContradictions}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <History className="h-3.5 w-3.5" /> Refresh
          </button>
          <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-semibold text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            {activeContradictions.length} active alerts
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {resolvedContradictions.length} resolved
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total Contradictions
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {contradictionStats.total}
          </p>
          <p className="text-xs text-slate-500">
            {contradictionStats.last_checked &&
              `Last checked ${formatRelativeTime(contradictionStats.last_checked)}`}
          </p>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-purple-700">
          <p className="text-xs font-semibold uppercase tracking-wide">
            Median Resolution Time
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {contradictionStats.median_resolution_time ?? '—'}
          </p>
          <p className="text-xs">
            Based on the last {contradictionStats.resolutions_last_24h ?? 0} resolutions
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
          <p className="text-xs font-semibold uppercase tracking-wide">
            High Severity Rate
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {contradictionStats.high_severity_percentage?.toFixed(0) ?? 0}%
          </p>
          <p className="text-xs">
            Portion of contradictions requiring immediate escalation
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          <p className="text-xs font-semibold uppercase tracking-wide">
            Credibility Impact
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {contradictionStats.average_credibility_impact?.toFixed(1) ?? 0}%
          </p>
          <p className="text-xs">
            Weighted delta across conflicting sources
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedSeverity}
              onChange={(event) =>
                setSelectedSeverity(event.target.value as typeof selectedSeverity)
              }
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All severities</option>
              {severityOrder.map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value as typeof selectedStatus)
              }
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All statuses</option>
              {['active', 'resolved', 'acceptable', 'investigating'].map(
                (status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ),
              )}
            </select>
          </div>
          <div className="text-xs text-slate-500">
            Showing {filtered.length} of {contradictions.length} contradictions
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.topic}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Detected {formatRelativeTime(item.detected_at)}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${getSeverityBadgeClasses(item.severity)}`}>
                  {item.severity}
                </span>
              </div>

              <div className="mt-3 space-y-3 text-xs text-slate-600">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="font-medium text-slate-700">Conflict Summary</p>
                  <p className="mt-1 text-slate-600">{item.conflict}</p>
                  <p className="mt-2 text-[11px] text-slate-500">
                    Confidence {item.confidence}% • Impact score {item.impact_score}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-100 bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Sources in conflict
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.sources.map((source) => (
                      <span
                        key={source}
                        className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>

                {item.resolution && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-slate-600">
                    <p className="text-[11px] uppercase tracking-wide text-emerald-500">
                      Resolution
                    </p>
                    <p className="mt-1 text-emerald-700">{item.resolution}</p>
                    {item.resolved_at && (
                      <p className="mt-1 text-[11px]">
                        Cleared {formatRelativeTime(item.resolved_at)} by{' '}
                        {item.resolved_by ?? 'unknown'}
                      </p>
                    )}
                  </div>
                )}

                {item.status === 'acceptable' && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700">
                    <p>
                      Marked acceptable: methodology differences acknowledged.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                {item.status !== 'resolved' && (
                  <button
                    type="button"
                    onClick={() => resolveContradiction(item.id, 'Resolved via manual verification')}
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <ListChecks className="h-3.5 w-3.5" />
                    Resolve
                  </button>
                )}
                {item.status !== 'acceptable' && (
                  <button
                    type="button"
                    onClick={() =>
                      markAsAcceptable(
                        item.id,
                        'Acceptable divergence documented in methodology',
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <ShieldAlert className="h-3.5 w-3.5 text-slate-500" />
                    Mark acceptable
                  </button>
                )}
                <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-500">
                  <CircleDot className="h-3 w-3" />
                  Status: {item.status}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && !loading && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-sm text-blue-700">
            No contradictions match the selected filters.
          </div>
        )}

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            Syncing contradiction telemetry…
          </div>
        )}
      </div>

      {priorityList.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2 text-amber-700">
            <Flame className="h-4 w-4" />
            <h4 className="text-sm font-semibold">
              Escalation Queue ({priorityList.length})
            </h4>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {priorityList.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-amber-100 bg-white p-3 text-xs text-slate-600"
              >
                <div className="flex items-center justify-between text-amber-600">
                  <span className="font-semibold">{item.topic}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${getSeverityBadgeClasses(item.severity)}`}>
                    {item.severity}
                  </span>
                </div>
                <p className="mt-2 text-slate-600">{item.conflict}</p>
                <p className="mt-2 text-[11px] text-slate-500">
                  Impact score {item.impact_score} • confidence {item.confidence}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {resolvedContradictions.length > 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-2 text-emerald-700">
            <CircleAlert className="h-4 w-4" />
            <h4 className="text-sm font-semibold">
              Recently Resolved ({resolvedContradictions.length})
            </h4>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {resolvedContradictions.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-emerald-100 bg-white p-3 text-xs"
              >
                <p className="font-semibold text-slate-700">{item.topic}</p>
                <p className="mt-1 text-slate-500">{item.resolution}</p>
                {item.resolved_at && (
                  <p className="mt-2 text-[11px] text-slate-400">
                    Cleared {formatRelativeTime(item.resolved_at)} by{' '}
                    {item.resolved_by ?? 'analyst'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
