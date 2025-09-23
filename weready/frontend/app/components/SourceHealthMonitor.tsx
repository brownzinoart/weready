'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, RefreshCw, Wifi } from 'lucide-react';
import type {
  SourceHealthData,
  UseSourceHealthReturn,
} from '../types/sources';
import {
  DEFAULT_MANUAL_REFRESH_COOLDOWN_MS,
  getManualRefreshExplainer,
  getManualRefreshFeedback,
} from '../utils/sourceHealthUtils';
import SimplifiedSourceCard from './SimplifiedSourceCard';

interface SourceHealthMonitorProps {
  sourceHealthState: UseSourceHealthReturn;
  sources: SourceHealthData[];
  selectedCategory: string | null;
  onCategoryChange?: (category: string | null) => void;
}

export default function SourceHealthMonitor({
  sourceHealthState,
  sources,
  selectedCategory,
  onCategoryChange,
}: SourceHealthMonitorProps) {
  const {
    refreshHealth,
    refreshSource,
    triggerSourceTest,
    pauseMonitoring,
    resumeMonitoring,
    isRefreshing,
    manualRefreshAllowed,
    manualRefreshMessage,
    nextAutoRefreshLabel,
    lastUpdatedLabel,
    usingMockData,
    connectionState,
  } = sourceHealthState;
  const isLiveConnection = connectionState.status === 'connected' && !usingMockData;
  const [localPaused, setLocalPaused] = useState<Record<string, boolean>>({});
  const [manualCooldownStart, setManualCooldownStart] = useState<number | null>(null);
  const [cooldownTick, setCooldownTick] = useState(() => Date.now());
  const manualExplainer = useMemo(() => getManualRefreshExplainer(), []);

  useEffect(() => {
    const pausedState = sources.reduce<Record<string, boolean>>((accumulator, currentSource) => {
      accumulator[currentSource.source_id] = !!currentSource.paused;
      return accumulator;
    }, {});
    setLocalPaused(pausedState);
  }, [sources]);

  useEffect(() => {
    if (!manualRefreshAllowed) {
      setManualCooldownStart((previous) => previous ?? Date.now());
      const interval = window.setInterval(() => setCooldownTick(Date.now()), 1000);
      return () => window.clearInterval(interval);
    }

    setManualCooldownStart(null);
    return undefined;
  }, [manualRefreshAllowed]);

  const manualNow = manualRefreshAllowed ? Date.now() : cooldownTick;
  const manualFeedback = useMemo(
    () =>
      getManualRefreshFeedback(
        manualCooldownStart,
        manualRefreshAllowed ? 0 : DEFAULT_MANUAL_REFRESH_COOLDOWN_MS,
        manualNow,
        manualRefreshMessage,
      ),
    [manualCooldownStart, manualRefreshAllowed, manualRefreshMessage, manualNow],
  );

  const manualFeedbackToneClass = manualFeedback.allowed
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : manualFeedback.emphasis === 'waiting'
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : 'border-rose-200 bg-rose-50 text-rose-700';

  const degradedSources = useMemo(
    () =>
      sources.filter(
        (source) => source.status === 'degraded' || source.status === 'offline',
      ),
    [sources],
  );

  const handlePause = async (sourceId: string) => {
    if (pauseMonitoring) {
      await pauseMonitoring(sourceId);
    }
    setLocalPaused((prev) => ({ ...prev, [sourceId]: true }));
  };

  const handleResume = async (sourceId: string) => {
    if (resumeMonitoring) {
      await resumeMonitoring(sourceId);
    }
    setLocalPaused((prev) => ({ ...prev, [sourceId]: false }));
  };

  const handleCardTogglePause = (sourceId: string, shouldPause: boolean) => {
    if (shouldPause) {
      void handlePause(sourceId);
    } else {
      void handleResume(sourceId);
    }
  };

  const handleCardRefresh = (sourceId: string) => {
    void refreshSource(sourceId);
  };

  const handleCardTest = triggerSourceTest
    ? (sourceId: string) => {
        void triggerSourceTest(sourceId);
      }
    : undefined;

  return (
    <div className="space-y-6">
      {(degradedSources.length > 0 || usingMockData) && (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5" aria-hidden="true" />
            <div>
              <p className="font-semibold">
                {degradedSources.length > 0
                  ? `${degradedSources.length} source${
                      degradedSources.length === 1 ? '' : 's'
                    } temporarily experiencing degraded performance`
                  : 'Displaying cached telemetry while live data reconnects'}
              </p>
              {degradedSources.length > 0 && (
                <p className="mt-1 text-xs">
                  Historical dashboards remain available. We are retrying connections automatically and will alert you when live updates resume.
                </p>
              )}
              {usingMockData && (
                <p className="mt-1 text-xs">
                  Live telemetry will refresh automatically. In the meantime, cached insights remain available and monitoring continues.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-stretch gap-3 text-xs text-slate-600">
        <button
          type="button"
          onClick={refreshHealth}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
          disabled={isRefreshing || !manualRefreshAllowed}
          aria-disabled={isRefreshing || !manualRefreshAllowed}
          aria-label="Refresh all live source telemetry"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-blue-500' : 'text-slate-500'}`}
            aria-hidden="true"
          />
          Refresh All
        </button>

        <div
          className={`flex min-w-[260px] flex-1 flex-col justify-center gap-1 rounded-2xl border px-4 py-3 text-left shadow-sm ${manualFeedbackToneClass}`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold">{manualFeedback.primaryMessage}</p>
            {!manualFeedback.allowed && (
              <span className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                {manualFeedback.countdownLabel}
              </span>
            )}
          </div>
          <p className="text-[11px] leading-relaxed text-slate-600">
            {manualFeedback.secondaryMessage || manualExplainer}
          </p>
        </div>

        <div
          className={`flex items-center gap-2 rounded-full px-4 py-2 font-semibold ${
            isLiveConnection
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border border-amber-200 bg-amber-50 text-amber-700'
          }`}
          role="status"
          aria-live="polite"
        >
          <Wifi className="h-4 w-4" aria-hidden="true" />
          {isLiveConnection
            ? nextAutoRefreshLabel
            : `Cached telemetry • ${nextAutoRefreshLabel}`}
        </div>

        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-700">
          {lastUpdatedLabel}
        </div>

        {selectedCategory && (
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-700">
            <span>{selectedCategory}</span>
            <button
              type="button"
              onClick={() => onCategoryChange?.(null)}
              className="text-xs text-blue-500 underline-offset-2 hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {sources.map((source, index) => {
          const paused = localPaused[source.source_id] ?? !!source.paused;

          return (
            <SimplifiedSourceCard
              key={source.source_id}
              source={source}
              index={index}
              totalSources={sources.length}
              paused={paused}
              onRefresh={handleCardRefresh}
              onTogglePause={handleCardTogglePause}
              onTest={handleCardTest}
              manualRefreshAllowed={manualRefreshAllowed}
            />
          );
        })}
      </div>
    </div>
  );
}
