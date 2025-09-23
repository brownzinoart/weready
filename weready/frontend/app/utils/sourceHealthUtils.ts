import {
  CacheMetadata,
  CategoryCoverage,
  ConsumerStatus,
  ContradictionSeverity,
  DataSourceIndicator,
  SourceHealthData,
  SourceStatus,
  SourceInventoryItem,
} from '@/app/types/sources';

export type { ConsumerStatus, DataSourceIndicator } from '@/app/types/sources';

export type ConnectionQuality = 'good' | 'fair' | 'poor' | 'unknown';

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
});

const MS_IN_SECOND = 1000;
const MS_IN_MINUTE = 60 * MS_IN_SECOND;
const MS_IN_HOUR = 60 * MS_IN_MINUTE;
const DEFAULT_RECOMMENDED_REFRESH_MS = 30 * MS_IN_MINUTE;
export const DEFAULT_MANUAL_REFRESH_COOLDOWN_MS = 2 * MS_IN_MINUTE;

const refreshModeLabels: Record<NonNullable<CacheMetadata['refreshMode']>, string> = {
  auto: 'auto-refresh',
  manual: 'manual refresh',
  initial: 'initial sync',
};

const clampNumber = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return value;
};

const formatDurationFromMs = (durationMs: number): string => {
  const safeDuration = clampNumber(durationMs);
  if (safeDuration <= 0) {
    return 'moments';
  }
  if (safeDuration < MS_IN_MINUTE) {
    const seconds = Math.max(1, Math.round(safeDuration / MS_IN_SECOND));
    return `${seconds} second${seconds === 1 ? '' : 's'}`;
  }
  if (safeDuration < MS_IN_HOUR) {
    const minutes = Math.max(1, Math.round(safeDuration / MS_IN_MINUTE));
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
  const hours = Math.max(1, Math.round(safeDuration / MS_IN_HOUR));
  return `${hours} hour${hours === 1 ? '' : 's'}`;
};

export function formatRelativeTime(value: string | number | Date | null | undefined): string {
  if (value === null || typeof value === 'undefined') {
    return 'unknown';
  }

  let parsed: Date;
  if (value instanceof Date) {
    parsed = value;
  } else if (typeof value === 'number') {
    parsed = new Date(value);
  } else {
    parsed = new Date(value);
  }

  if (Number.isNaN(parsed.getTime())) {
    return typeof value === 'string' ? value : 'unknown';
  }

  const now = new Date();
  const diffSeconds = Math.round((parsed.getTime() - now.getTime()) / 1000);

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
    ['second', 1],
  ];

  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(diffSeconds) >= secondsInUnit || unit === 'second') {
      const valueRounded = Math.round(diffSeconds / secondsInUnit);
      return relativeTimeFormatter.format(valueRounded, unit);
    }
  }

  return 'just now';
}

export function evaluateManualRefreshCooldown(
  lastManualRefreshAt: number | null | undefined,
  cooldownMs: number,
  nowMs: number = Date.now(),
): { allowed: boolean; remainingMs: number } {
  if (!Number.isFinite(cooldownMs) || cooldownMs <= 0) {
    return { allowed: true, remainingMs: 0 };
  }
  if (lastManualRefreshAt == null || !Number.isFinite(lastManualRefreshAt)) {
    return { allowed: true, remainingMs: 0 };
  }

  const elapsed = nowMs - lastManualRefreshAt;
  if (elapsed >= cooldownMs) {
    return { allowed: true, remainingMs: 0 };
  }

  const remainingMs = Math.max(0, cooldownMs - elapsed);
  return { allowed: false, remainingMs };
}

export function formatRefreshCooldownMessage(remainingMs: number): string {
  if (remainingMs <= 0) {
    return 'Refresh is available now.';
  }
  if (remainingMs < MS_IN_MINUTE) {
    const seconds = Math.max(1, Math.ceil(remainingMs / MS_IN_SECOND));
    return `Please wait ${seconds} second${seconds === 1 ? '' : 's'} before refreshing again.`;
  }
  const minutes = Math.ceil(remainingMs / MS_IN_MINUTE);
  if (minutes === 1) {
    const seconds = Math.ceil((remainingMs % MS_IN_MINUTE) / MS_IN_SECOND);
    if (seconds > 0 && seconds < 30) {
      return `Please wait about 1 minute before refreshing again.`;
    }
    return 'Please wait about 1 minute before refreshing again.';
  }
  return `Please wait ${minutes} minutes before refreshing again.`;
}

export function formatLastUpdatedLabel(value: string | Date | null | undefined): string {
  if (!value) {
    return 'Last updated: fetching latest telemetry…';
  }
  const relative = formatRelativeTime(value);
  if (relative === 'unknown') {
    return 'Last updated: unknown';
  }
  if (relative === 'just now') {
    return 'Last updated just now';
  }
  return `Last updated ${relative}`;
}

export function formatNextAutoRefreshLabel(
  nextAutoRefreshAt: number | null | undefined,
  nowMs: number = Date.now(),
): string {
  if (!nextAutoRefreshAt || !Number.isFinite(nextAutoRefreshAt)) {
    return 'Auto-refresh scheduling…';
  }

  const remainingMs = nextAutoRefreshAt - nowMs;
  if (remainingMs <= 0) {
    return 'Auto-refresh in progress';
  }

  const durationLabel = formatDurationFromMs(remainingMs);
  return `Next auto-refresh in ${durationLabel}`;
}

export interface CacheFreshnessDescription {
  status: 'fresh' | 'stale' | 'expired' | 'unknown';
  description: string;
  ageMs: number | null;
  expiredForMs: number;
  refreshMode: CacheMetadata['refreshMode'] | null | undefined;
}

export function describeCacheFreshness(
  metadata: CacheMetadata | null | undefined,
  ageMs: number | null | undefined,
  expiredForMs: number | null | undefined,
  recommendedRefreshMs: number = DEFAULT_RECOMMENDED_REFRESH_MS,
): CacheFreshnessDescription {
  if (!metadata) {
    return {
      status: 'unknown',
      description: 'No cached telemetry is available yet.',
      ageMs: null,
      expiredForMs: 0,
      refreshMode: null,
    };
  }

  const safeAgeMs = ageMs ?? null;
  const safeExpiredMs = expiredForMs ?? 0;
  const lastUpdatedRelative = formatRelativeTime(metadata.lastUpdated);
  const refreshModeLabel = metadata.refreshMode ? refreshModeLabels[metadata.refreshMode] : 'network fetch';

  if (safeExpiredMs > 0) {
    const expiredForLabel = formatDurationFromMs(safeExpiredMs);
    return {
      status: 'expired',
      description: `Cached telemetry expired ${expiredForLabel} ago (from ${refreshModeLabel}).`,
      ageMs: safeAgeMs,
      expiredForMs: safeExpiredMs,
      refreshMode: metadata.refreshMode,
    };
  }

  if (safeAgeMs != null && safeAgeMs > recommendedRefreshMs) {
    const staleByLabel = formatDurationFromMs(safeAgeMs - recommendedRefreshMs);
    return {
      status: 'stale',
      description: `Cached telemetry last updated ${lastUpdatedRelative} via ${refreshModeLabel}. Refresh recommended (stale by ${staleByLabel}).`,
      ageMs: safeAgeMs,
      expiredForMs: 0,
      refreshMode: metadata.refreshMode,
    };
  }

  return {
    status: 'fresh',
    description: `Cached telemetry updated ${lastUpdatedRelative} via ${refreshModeLabel}.`,
    ageMs: safeAgeMs,
    expiredForMs: 0,
    refreshMode: metadata.refreshMode,
  };
}

export function formatResponseTime(value: number): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  if (value < 1000) {
    return `${Math.round(value)} ms`;
  }
  return `${(value / 1000).toFixed(2)} s`;
}

export function getConnectionQuality(value: number | null | undefined): ConnectionQuality {
  if (value == null || !Number.isFinite(value) || value <= 0) {
    return 'unknown';
  }
  if (value < 350) {
    return 'good';
  }
  if (value < 800) {
    return 'fair';
  }
  return 'poor';
}

export function formatConnectionQuality(quality: ConnectionQuality): string {
  switch (quality) {
    case 'good':
      return 'Good';
    case 'fair':
      return 'Fair';
    case 'poor':
      return 'Poor';
    default:
      return 'Unknown';
  }
}

export function formatLargeNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }
  return Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatUptime(value: number): string {
  if (!Number.isFinite(value)) {
    return '0%';
  }
  return `${value.toFixed(1)}%`;
}

export function getSimpleStatus(status: SourceStatus): 'Online' | 'Offline' | 'Maintenance' {
  switch (status) {
    case 'online':
    case 'degraded':
      return 'Online';
    case 'maintenance':
      return 'Maintenance';
    case 'sunset':
      return 'Offline';
    case 'offline':
    default:
      return 'Offline';
  }
}

export function getStatusBadgeClasses(status: SourceStatus): string {
  switch (status) {
    case 'online':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'degraded':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'offline':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'maintenance':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'sunset':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function getStatusPulseClasses(status: SourceStatus): string {
  switch (status) {
    case 'online':
      return 'bg-emerald-500 animate-pulse shadow-emerald-300';
    case 'degraded':
      return 'bg-amber-500 animate-pulse';
    case 'offline':
      return 'bg-rose-500';
    case 'maintenance':
      return 'bg-purple-500 animate-pulse';
    case 'sunset':
      return 'bg-purple-500';
    default:
      return 'bg-slate-400';
  }
}

export function getStatusColor(status: SourceStatus): string {
  switch (status) {
    case 'online':
      return 'emerald';
    case 'degraded':
      return 'amber';
    case 'offline':
      return 'rose';
    case 'maintenance':
      return 'purple';
    case 'sunset':
      return 'purple';
    default:
      return 'slate';
  }
}

export function getQualityColor(quality: ConnectionQuality): string {
  switch (quality) {
    case 'good':
      return 'text-emerald-600';
    case 'fair':
      return 'text-amber-600';
    case 'poor':
      return 'text-rose-600';
    default:
      return 'text-slate-500';
  }
}

export function getSimpleStatusBadgeClasses(status: SourceStatus): string {
  const simple = getSimpleStatus(status);
  switch (simple) {
    case 'Online':
      return 'border border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'Maintenance':
      return 'border border-slate-200 bg-slate-100 text-slate-700';
    case 'Offline':
    default:
      return 'border border-rose-200 bg-rose-50 text-rose-700';
  }
}

export function calculateOverallHealthScore(
  sources: SourceHealthData[],
): number {
  if (sources.length === 0) {
    return 0;
  }
  const statusWeight: Record<SourceStatus, number> = {
    online: 1,
    degraded: 0.7,
    maintenance: 0.6,
    offline: 0.2,
    sunset: 0.1,
  };
  const total = sources.reduce((accumulator, source) => {
    const uptimeScore = source.uptime / 100;
    const credibilityScore = source.credibility / 100;
    const statusScore = statusWeight[source.status] ?? 0.5;
    return accumulator + (uptimeScore * 0.4 + credibilityScore * 0.4 + statusScore * 0.2);
  }, 0);
  return Math.round((total / sources.length) * 1000) / 10;
}

export function calculateCategorySummary(
  sources: SourceHealthData[],
): Record<string, CategoryCoverage> {
  const summary: Record<string, CategoryCoverage> = {};

  for (const source of sources) {
    if (!summary[source.category]) {
      summary[source.category] = {
        category: source.category,
        implemented: 0,
        total: 0,
        coverage_percentage: 0,
        health_score: 0,
        summary: '',
      };
    }

    summary[source.category].total += 1;
    if (source.status !== 'offline' && source.status !== 'sunset') {
      summary[source.category].implemented += 1;
    }
    summary[source.category].health_score += source.credibility;
  }

  Object.values(summary).forEach((item) => {
    item.coverage_percentage =
      item.total === 0 ? 0 : (item.implemented / item.total) * 100;
    item.health_score =
      item.total === 0 ? 0 : item.health_score / item.total;
    if (item.coverage_percentage >= 90) {
      item.summary = 'Excellent coverage with resilient redundancy';
    } else if (item.coverage_percentage >= 70) {
      item.summary = 'Strong coverage; continue credential rotation checks';
    } else {
      item.summary = 'Coverage gap identified; track roadmap for completion';
    }
  });

  return summary;
}

export function calculateCategoryHealthDistribution(sources: SourceHealthData[]) {
  const buckets = [
    { label: 'Healthy (≥ 95%)', status: 'online' as SourceStatus, count: 0 },
    { label: 'Watchlist (90-95%)', status: 'degraded' as SourceStatus, count: 0 },
    { label: 'At Risk (< 90%)', status: 'offline' as SourceStatus, count: 0 },
  ];

  sources.forEach((source) => {
    if (source.uptime >= 95 && source.errorRate < 5) {
      buckets[0].count += 1;
    } else if (source.uptime >= 90) {
      buckets[1].count += 1;
    } else {
      buckets[2].count += 1;
    }
  });

  const total = Math.max(sources.length, 1);
  return buckets.map((bucket) => ({
    ...bucket,
    percentage: Math.round((bucket.count / total) * 100),
  }));
}

export function calculateKnowledgePoints(sources: SourceHealthData[]): number {
  return sources.reduce(
    (accumulator, source) =>
      accumulator + (source.knowledgePoints ?? source.dataPointsLast24h ?? 0),
    0,
  );
}

export function exportSourceHealthToCsv(sources: SourceHealthData[]): void {
  const header = [
    'Source ID',
    'Name',
    'Category',
    'Status',
    'Uptime',
    'Response Time',
    'Credibility',
    'Last Update',
    'Data Freshness',
    'Error Rate',
    'API Quota Remaining',
    'API Quota Limit',
  ];

  const normaliseTemporal = (
    value: SourceHealthData['lastUpdate'] | SourceHealthData['dataFreshness'],
  ): string => {
    if (value == null) {
      return '';
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === 'number') {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
    }

    return value;
  };

  const body = sources.map((source) => [
    source.source_id,
    source.name,
    source.category,
    source.status,
    source.uptime,
    source.responseTime,
    source.credibility,
    normaliseTemporal(source.lastUpdate),
    normaliseTemporal(source.dataFreshness),
    source.errorRate,
    source.apiQuotaRemaining ?? '',
    source.apiQuotaLimit ?? '',
  ]);

  const csvContent = [header, ...body]
    .map((row) =>
      row
        .map((value) =>
          typeof value === 'string' && value.includes(',')
            ? `"${value.replace(/"/g, '""')}"`
            : value,
        )
        .join(','),
    )
    .join('\n');

  if (typeof window === 'undefined') {
    return;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `weready-source-health-${Date.now()}.csv`;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function getSeverityBadgeClasses(
  severity: ContradictionSeverity,
): string {
  switch (severity) {
    case 'critical':
      return 'bg-rose-100 text-rose-700';
    case 'high':
      return 'bg-amber-100 text-amber-700';
    case 'medium':
      return 'bg-blue-100 text-blue-700';
    case 'low':
      return 'bg-slate-100 text-slate-600';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

// Consumer-friendly status mapping functions
export function getConsumerStatus(status: SourceStatus): ConsumerStatus {
  switch (status) {
    case 'online':
    case 'degraded':
      return 'ON';
    case 'maintenance':
      return 'NOT RESPONDING';
    case 'offline':
      return 'OFFLINE';
    case 'sunset':
      return 'SUNSET';
    default:
      return 'OFFLINE';
  }
}

export function getConsumerStatusBadgeClasses(status: ConsumerStatus): string {
  switch (status) {
    case 'ON':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'NOT RESPONDING':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'OFFLINE':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'SUNSET':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function getConsumerStatusDescription(status: ConsumerStatus): string {
  switch (status) {
    case 'ON':
      return 'Actively providing real-time insights for your business intelligence';
    case 'NOT RESPONDING':
      return 'Temporarily unavailable - your historical data remains accessible';
    case 'OFFLINE':
      return 'Currently offline - we\'re working to restore service';
    case 'SUNSET':
      return 'This source is being deprecated - consider alternative sources';
    default:
      return 'Status information unavailable';
  }
}

// Data source indicator functions
export function getDataSourceIndicator(
  isLoading: boolean,
  hasError: boolean,
  data: SourceHealthData[] | null | undefined,
): DataSourceIndicator {
  if (isLoading) {
    return 'cached';
  }
  if (hasError) {
    return data && data.length > 0 ? 'cached' : 'mock';
  }
  if (!data || data.length === 0) {
    return 'mock';
  }
  return 'live';
}

export function getServiceContinuityMessage(indicator: DataSourceIndicator): string {
  switch (indicator) {
    case 'live':
      return 'All systems operational - receiving real-time updates';
    case 'cached':
      return 'Using recent cached data while we restore full connectivity';
    case 'mock':
      return 'Displaying sample data to demonstrate platform capabilities';
    default:
      return 'Service information being updated';
  }
}

// Consumer-friendly formatting functions
export function formatServiceReliability(uptime: number): string {
  if (!Number.isFinite(uptime)) {
    return 'Reliability data pending';
  }
  if (uptime >= 99.9) {
    return 'Enterprise-grade reliability';
  }
  if (uptime >= 99) {
    return 'Highly reliable service';
  }
  if (uptime >= 95) {
    return 'Standard reliability';
  }
  if (uptime >= 90) {
    return 'Fair reliability';
  }
  return 'Service experiencing issues';
}

function parseDateInput(value: string | number | Date | null | undefined): Date | null {
  if (value == null) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDataFreshness(
  dataFreshness: SourceHealthData['dataFreshness'] | Date | null | undefined,
): string {
  const parsed = parseDateInput(dataFreshness ?? null);

  if (!parsed) {
    return 'Data freshness unknown';
  }

  const now = new Date();
  const diffMinutes = Math.round((now.getTime() - parsed.getTime()) / 60000);

  if (diffMinutes < 5) {
    return 'Real-time data';
  }
  if (diffMinutes < 60) {
    return 'Near real-time data';
  }
  if (diffMinutes < 240) {
    return 'Recent data';
  }
  if (diffMinutes < 1440) {
    return 'Data from today';
  }
  return 'Historical data';
}

export function getBusinessImpactDescription(status: ConsumerStatus): string {
  switch (status) {
    case 'ON':
      return 'Operating normally — receive the freshest insights from this source in real time.';
    case 'NOT RESPONDING':
      return 'Live updates are delayed, but your historical dashboards and saved insights remain available.';
    case 'OFFLINE':
      return 'Source offline right now — lean on recent exports or backup sources while we restore connectivity.';
    case 'SUNSET':
      return 'This source is being retired — review the recommended migration path to stay ahead.';
    default:
      return 'Impact assessment unavailable';
  }
}

export type ConsumerStatusTone = 'positive' | 'caution' | 'warning' | 'info' | 'neutral';

export interface ConsumerStatusVisualConfig {
  status: ConsumerStatus;
  icon: string;
  tone: ConsumerStatusTone;
  badgeClasses: string;
  indicatorRingClasses: string;
  emphasisText: string;
}

const CONSUMER_STATUS_VISUALS: Record<ConsumerStatus, ConsumerStatusVisualConfig> = {
  'ON': {
    status: 'ON',
    icon: 'CheckCircle2',
    tone: 'positive',
    badgeClasses: getConsumerStatusBadgeClasses('ON'),
    indicatorRingClasses: 'ring-emerald-300/60 bg-emerald-50 text-emerald-700',
    emphasisText: 'Real-time feed live',
  },
  'NOT RESPONDING': {
    status: 'NOT RESPONDING',
    icon: 'AlertTriangle',
    tone: 'caution',
    badgeClasses: getConsumerStatusBadgeClasses('NOT RESPONDING'),
    indicatorRingClasses: 'ring-amber-300/60 bg-amber-50 text-amber-700',
    emphasisText: 'Signal delayed — historical data active',
  },
  'OFFLINE': {
    status: 'OFFLINE',
    icon: 'OctagonAlert',
    tone: 'warning',
    badgeClasses: getConsumerStatusBadgeClasses('OFFLINE'),
    indicatorRingClasses: 'ring-rose-300/60 bg-rose-50 text-rose-700',
    emphasisText: 'Service offline — action recommended',
  },
  'SUNSET': {
    status: 'SUNSET',
    icon: 'Clock',
    tone: 'info',
    badgeClasses: getConsumerStatusBadgeClasses('SUNSET'),
    indicatorRingClasses: 'ring-purple-300/60 bg-purple-50 text-purple-700',
    emphasisText: 'Legacy connector nearing retirement',
  },
};

export interface ConsumerStatusDetails {
  status: ConsumerStatus;
  headline: string;
  summary: string;
  businessImpact: string;
  recommendedAction: string;
  tone: ConsumerStatusTone;
  icon: string;
  badgeClasses: string;
  indicatorRingClasses: string;
}

const CONSUMER_STATUS_DETAILS: Record<ConsumerStatus, ConsumerStatusDetails> = {
  'ON': {
    status: 'ON',
    headline: 'Online and delivering insights',
    summary: 'We are ingesting fresh data without delay.',
    businessImpact: getBusinessImpactDescription('ON'),
    recommendedAction: 'Keep an eye on performance trends to spot emerging opportunities.',
    tone: 'positive',
    icon: CONSUMER_STATUS_VISUALS['ON'].icon,
    badgeClasses: CONSUMER_STATUS_VISUALS['ON'].badgeClasses,
    indicatorRingClasses: CONSUMER_STATUS_VISUALS['ON'].indicatorRingClasses,
  },
  'NOT RESPONDING': {
    status: 'NOT RESPONDING',
    headline: 'Temporarily delayed',
    summary: 'We are retrying the connection while keeping cached insights available.',
    businessImpact: getBusinessImpactDescription('NOT RESPONDING'),
    recommendedAction: 'Stay informed with historical dashboards and enable alerts for reconnect updates.',
    tone: 'caution',
    icon: CONSUMER_STATUS_VISUALS['NOT RESPONDING'].icon,
    badgeClasses: CONSUMER_STATUS_VISUALS['NOT RESPONDING'].badgeClasses,
    indicatorRingClasses: CONSUMER_STATUS_VISUALS['NOT RESPONDING'].indicatorRingClasses,
  },
  'OFFLINE': {
    status: 'OFFLINE',
    headline: 'Offline — attention needed',
    summary: 'Live data is not flowing from this connector.',
    businessImpact: getBusinessImpactDescription('OFFLINE'),
    recommendedAction: 'Review contingency insights and subscribe to outage notifications.',
    tone: 'warning',
    icon: CONSUMER_STATUS_VISUALS['OFFLINE'].icon,
    badgeClasses: CONSUMER_STATUS_VISUALS['OFFLINE'].badgeClasses,
    indicatorRingClasses: CONSUMER_STATUS_VISUALS['OFFLINE'].indicatorRingClasses,
  },
  'SUNSET': {
    status: 'SUNSET',
    headline: 'Sunsetting — plan migration',
    summary: 'We are wrapping up this connector with a guided replacement path.',
    businessImpact: getBusinessImpactDescription('SUNSET'),
    recommendedAction: 'Follow the migration guide to adopt the recommended successor connector.',
    tone: 'info',
    icon: CONSUMER_STATUS_VISUALS['SUNSET'].icon,
    badgeClasses: CONSUMER_STATUS_VISUALS['SUNSET'].badgeClasses,
    indicatorRingClasses: CONSUMER_STATUS_VISUALS['SUNSET'].indicatorRingClasses,
  },
};

export function getConsumerStatusVisual(status: ConsumerStatus): ConsumerStatusVisualConfig {
  return CONSUMER_STATUS_VISUALS[status] ?? CONSUMER_STATUS_VISUALS['OFFLINE'];
}

export function getConsumerStatusDetails(status: ConsumerStatus): ConsumerStatusDetails {
  return CONSUMER_STATUS_DETAILS[status] ?? CONSUMER_STATUS_DETAILS['OFFLINE'];
}

export interface StatusActionGuidance {
  label: string;
  description: string;
  href?: string;
}

const STATUS_ACTION_GUIDANCE: Record<ConsumerStatus, StatusActionGuidance[]> = {
  'ON': [
    {
      label: 'View live dashboards',
      description: 'Open the analytics workspace to act on the newest insights.',
    },
    {
      label: 'Schedule summary export',
      description: 'Deliver recurring updates to your stakeholders automatically.',
    },
  ],
  'NOT RESPONDING': [
    {
      label: 'Enable reconnect alerts',
      description: 'Get notified as soon as the connector resumes live updates.',
    },
    {
      label: 'Review cached insights',
      description: 'Stay aligned using the latest successful pull while we restore service.',
    },
  ],
  'OFFLINE': [
    {
      label: 'View historical data',
      description: 'Explore recent exports and identify any coverage gaps.',
    },
    {
      label: 'Contact support',
      description: 'Work with our team to accelerate restoration and discuss alternatives.',
    },
  ],
  'SUNSET': [
    {
      label: 'Open migration guide',
      description: 'Follow the recommended replacement path to maintain coverage.',
    },
    {
      label: 'Review successor roadmap',
      description: 'Understand upcoming enhancements and plan adoption with confidence.',
    },
  ],
};

export function getStatusActionGuidance(status: ConsumerStatus): StatusActionGuidance[] {
  return STATUS_ACTION_GUIDANCE[status] ?? STATUS_ACTION_GUIDANCE['OFFLINE'];
}

const CATEGORY_VALUE_MATCHERS: Array<{ matcher: RegExp; description: string }> = [
  {
    matcher: /market|pricing|trading/i,
    description: 'Delivers up-to-the-minute market intelligence to guide pricing and portfolio moves.',
  },
  {
    matcher: /sales|revenue|crm/i,
    description: 'Keeps your revenue teams aligned with live deal, pipeline, and retention signals.',
  },
  {
    matcher: /support|service|ticket/i,
    description: 'Shows customer health and responsiveness so you can protect satisfaction scores.',
  },
  {
    matcher: /marketing|campaign/i,
    description: 'Tracks campaign performance and audience engagement to optimise spend.',
  },
  {
    matcher: /finance|billing|expense/i,
    description: 'Highlights cash flow, billing accuracy, and spend controls for finance leaders.',
  },
];

export function getCategoryServiceValue(category: string): string {
  if (!category) {
    return 'Helps your team stay informed with the latest operational insights.';
  }

  const matched = CATEGORY_VALUE_MATCHERS.find(({ matcher }) => matcher.test(category));
  if (matched) {
    return matched.description;
  }

  return `Keeps your ${category.toLowerCase()} intelligence current for faster decisions.`;
}

export function getSourceServiceValue(
  sourceName: string,
  category: string,
  implementationNotes?: string | null,
): string {
  if (implementationNotes && implementationNotes.trim().length > 0) {
    return implementationNotes.trim();
  }

  const categoryValue = getCategoryServiceValue(category);
  return `${sourceName} keeps ${categoryValue.replace(/^Helps |^Keeps /, '').replace(/^Delivers /, '').replace(/^Tracks /, '').replace(/^Highlights /, '')}`.trim();
}

export interface ManualRefreshFeedback {
  allowed: boolean;
  primaryMessage: string;
  secondaryMessage: string;
  countdownLabel: string;
  emphasis: 'ready' | 'cooldown' | 'waiting';
}

const RATE_LIMITING_EXPLANATION =
  'We space out manual refreshes to protect partner rate limits and keep service reliable for everyone.';

export function getManualRefreshFeedback(
  lastManualRefreshAt: number | null | undefined,
  cooldownMs: number,
  nowMs: number = Date.now(),
  manualMessage?: string | null,
): ManualRefreshFeedback {
  const { allowed, remainingMs } = evaluateManualRefreshCooldown(
    lastManualRefreshAt,
    cooldownMs,
    nowMs,
  );

  if (allowed) {
    return {
      allowed: true,
      primaryMessage: manualMessage ?? 'Refresh ready now',
      secondaryMessage: 'Pull the latest insights on demand or let auto-refresh keep things updated.',
      countdownLabel: 'Ready',
      emphasis: 'ready',
    };
  }

  const durationLabel = formatDurationFromMs(remainingMs);
  return {
    allowed: false,
    primaryMessage:
      manualMessage ?? `Please wait ${durationLabel} before refreshing again`,
    secondaryMessage: RATE_LIMITING_EXPLANATION,
    countdownLabel: `${durationLabel} remaining`,
    emphasis: remainingMs <= MS_IN_MINUTE ? 'waiting' : 'cooldown',
  };
}

export function getManualRefreshExplainer(): string {
  return RATE_LIMITING_EXPLANATION;
}

export interface SourceAccessibilityMetadata {
  role: 'group';
  tabIndex: number;
  ariaLabel: string;
  ariaDescription: string;
  statusAnnouncement: string;
}

export function buildSourceAccessibilityMetadata(args: {
  sourceName: string;
  status: ConsumerStatus;
  category: string;
  lastUpdatedLabel?: string;
  businessImpact?: string;
}): SourceAccessibilityMetadata {
  const { sourceName, status, category, lastUpdatedLabel, businessImpact } = args;
  const details = getConsumerStatusDetails(status);
  const lastUpdated = lastUpdatedLabel ? `. ${lastUpdatedLabel}.` : '';
  const impact = businessImpact ?? details.businessImpact;

  return {
    role: 'group',
    tabIndex: 0,
    ariaLabel: `${sourceName} — ${details.headline}`,
    ariaDescription: `${impact} ${lastUpdated} Category: ${category}. Recommended action: ${details.recommendedAction}.`,
    statusAnnouncement: `${sourceName} status ${status}. ${impact}`,
  };
}

export type NotificationTone = 'positive' | 'caution' | 'warning' | 'info';

export interface StatusNotification {
  tone: NotificationTone;
  headline: string;
  body: string;
}

export function createStatusNotification(
  sourceName: string,
  status: ConsumerStatus,
): StatusNotification {
  const details = getConsumerStatusDetails(status);
  return {
    tone: details.tone,
    headline: `${sourceName} is ${status}`,
    body: `${details.summary} ${details.businessImpact}`,
  };
}

export interface KeyboardEventLike {
  key: string;
  preventDefault: () => void;
  shiftKey?: boolean;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
}

export function isPrimaryActionKey(event: KeyboardEventLike): boolean {
  const { key } = event;
  return key === 'Enter' || key === ' ' || key === 'Spacebar';
}

export function handleKeyboardActivation(
  event: KeyboardEventLike,
  callback: () => void,
): void {
  if (isPrimaryActionKey(event)) {
    event.preventDefault();
    callback();
  }
}

export function getKeyboardNavigationHint(index: number, total: number): string {
  if (total <= 0) {
    return 'Press tab to explore source details.';
  }
  return `Source ${index + 1} of ${total}. Use arrow keys or tab to navigate.`;
}

export function mergeInventoryWithHealth(
  inventory: SourceInventoryItem[],
  healthData: SourceHealthData[],
): SourceHealthData[] {
  const healthMap = new Map(healthData.map((record) => [record.source_id, record]));

  return inventory.map((item) => {
    const health = healthMap.get(item.source_id);
    if (health) {
      return health;
    }

    const isAvailable = item.status === 'implemented' || item.status === 'mock';

    // Create placeholder health data for inventory items without health data
    return {
      source_id: item.source_id,
      name: item.name,
      category: item.category,
      status: isAvailable ? 'maintenance' : 'sunset',
      uptime: isAvailable ? 90 : 0,
      responseTime: 0,
      credibility: isAvailable ? 80 : 0,
      lastUpdate: null,
      dataFreshness: null,
      errorRate: 0,
      dataPointsLast24h: 0,
      knowledgePoints: 0,
      healthTrend: 'stable',
      healthHistory: [],
      maintenanceWindow: isAvailable ? undefined : 'Activation pending',
      description: item.implementation_notes ?? undefined,
    } satisfies SourceHealthData;
  });
}

export function getCompleteSourceList(
  inventory: SourceInventoryItem[],
  healthData: SourceHealthData[],
): SourceHealthData[] {
  const merged = mergeInventoryWithHealth(inventory, healthData);

  // Sort by status priority: ON > NOT RESPONDING > OFFLINE > SUNSET
  const statusPriority: Record<ConsumerStatus, number> = {
    'ON': 1,
    'NOT RESPONDING': 2,
    'OFFLINE': 3,
    'SUNSET': 4,
  };

  return merged.sort((a, b) => {
    const aStatus = getConsumerStatus(a.status);
    const bStatus = getConsumerStatus(b.status);
    return statusPriority[aStatus] - statusPriority[bStatus];
  });
}

// Enhanced calculation functions for consumer focus
export function calculateConsumerHealthScore(sources: SourceHealthData[]): {
  score: number;
  description: string;
} {
  if (sources.length === 0) {
    return { score: 0, description: 'No data sources configured' };
  }

  const score = calculateOverallHealthScore(sources);

  let description: string;
  if (score >= 95) {
    description = 'Excellent - All sources providing optimal insights';
  } else if (score >= 85) {
    description = 'Good - Most sources operating normally';
  } else if (score >= 70) {
    description = 'Fair - Some sources need attention';
  } else {
    description = 'Needs Attention - Multiple sources experiencing issues';
  }

  return { score, description };
}

export function calculateConsumerCategorySummary(
  sources: SourceHealthData[]
): Record<string, CategoryCoverage> {
  const summary = calculateCategorySummary(sources);

  // Update summaries to be more consumer-friendly
  Object.values(summary).forEach((item) => {
    if (item.coverage_percentage >= 90) {
      item.summary = 'Comprehensive coverage providing full business insights';
    } else if (item.coverage_percentage >= 70) {
      item.summary = 'Good coverage with most key insights available';
    } else {
      item.summary = 'Limited coverage - consider adding more sources';
    }
  });

  return summary;
}
