import {
  CategoryCoverage,
  ContradictionSeverity,
  SourceHealthData,
  SourceStatus,
} from '@/app/types/sources';

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
});

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

export function formatResponseTime(value: number): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  if (value < 1000) {
    return `${Math.round(value)} ms`;
  }
  return `${(value / 1000).toFixed(2)} s`;
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
    default:
      return 'slate';
  }
}

export function getLatencyColor(latency: number): string {
  if (!Number.isFinite(latency)) {
    return 'text-slate-500';
  }
  if (latency < 250) return 'text-emerald-600';
  if (latency < 600) return 'text-amber-600';
  return 'text-rose-600';
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
    if (source.status !== 'offline') {
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

  const body = sources.map((source) => [
    source.source_id,
    source.name,
    source.category,
    source.status,
    source.uptime,
    source.responseTime,
    source.credibility,
    source.lastUpdate,
    source.dataFreshness,
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
