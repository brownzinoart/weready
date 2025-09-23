export type SourceStatus = 'online' | 'degraded' | 'offline' | 'maintenance' | 'sunset';
export type ConsumerStatus = 'ON' | 'NOT RESPONDING' | 'OFFLINE' | 'SUNSET';
export type DataSourceIndicator = 'live' | 'cached' | 'mock';
export type HealthTrend = 'improving' | 'stable' | 'degrading';

export type SourceConnectionStatus =
  | 'initializing'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'degraded'
  | 'offline';

export interface SourceConnectionState {
  status: SourceConnectionStatus;
  usingMockData: boolean;
  consecutiveFailures: number;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  lastError?: string | null;
  lastLatencyMs?: number;
  streamConnected: boolean;
  reconnectScheduledAt?: string;
  reconnectAttempts: number;
}

export interface SourcePerformanceSnapshot {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  timeoutCount: number;
  averageLatencyMs: number | null;
  p95LatencyMs: number | null;
  lastRequestAt?: string;
  lastFailureReason?: string | null;
  streamEventCount: number;
  streamReconnects: number;
  lastHeartbeatAt?: string;
}

export interface SourceMonitoringSnapshot {
  connection: SourceConnectionState;
  performance: SourcePerformanceSnapshot;
}

export interface SourceHealthData {
  source_id: string;
  name: string;
  category: string;
  status: SourceStatus;
  uptime: number;
  responseTime: number;
  credibility: number;
  lastUpdate: string | Date | null;
  errorRate: number;
  dataFreshness: string | Date | null;
  apiQuotaRemaining?: number;
  apiQuotaLimit?: number;
  dependsOn?: string[];
  healthTrend: HealthTrend;
  slaCompliance?: string;
  ingestionRate?: number;
  dataPointsLast24h?: number;
  knowledgePoints?: number;
  maintenanceWindow?: string;
  healthHistory?: number[];
  description?: string;
}

export interface SourceInventoryItem {
  source_id: string;
  name: string;
  category: string;
  organization?: string;
  status: 'implemented' | 'mock' | 'planned' | 'missing';
  credibility_score?: number;
  connector_key?: string;
  implementation_notes?: string;
  api_endpoint?: string;
  documentation_url?: string;
  cost: 'free' | 'paid';
  rate_limit?: number;
}

export type ContradictionSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ContradictionStatus =
  | 'active'
  | 'resolved'
  | 'acceptable'
  | 'investigating';

export interface ContradictionData {
  id: string;
  topic: string;
  sources: string[];
  conflict: string;
  confidence: number;
  severity: ContradictionSeverity;
  detected_at: string;
  resolution?: string;
  resolved_at?: string;
  resolved_by?: string;
  status: ContradictionStatus;
  impact_score: number;
}

export interface SourceMetrics {
  total_sources: number;
  active_sources: number;
  average_uptime: number;
  average_response_time: number;
  total_data_points: number;
  system_health_score: number;
  last_updated: string;
  refresh_interval_seconds?: number;
  total_knowledge_points?: number;
  average_credibility?: number;
  sla_target_ms?: number;
}

export interface CategoryCoverage {
  category: string;
  implemented: number;
  total: number;
  coverage_percentage: number;
  health_score: number;
  summary: string;
}

export interface SourceStatusResponse {
  sources: Record<string, SourceHealthData>;
  metrics: SourceMetrics;
  last_updated: string;
}

export type CacheDataSource = 'network' | 'stream' | 'mock' | 'restore';

export interface CacheMetadata {
  lastUpdated: string;
  version: string;
  expiresAt: string;
  dataSource: CacheDataSource;
  refreshMode?: 'initial' | 'manual' | 'auto';
}

export interface CachedSourceData {
  data: SourceHealthData[];
  metadata: CacheMetadata;
  isExpired: boolean;
  ageMs: number | null;
  expiredForMs: number;
  expiresAtMs: number | null;
}

export interface CacheInfo {
  isAvailable: boolean;
  lastCacheTime: string | null;
  cacheSize: number;
  isExpired: boolean;
  ageMs: number | null;
  expiredForMs: number;
  refreshMode: CacheMetadata['refreshMode'] | null;
  recommendedRefreshIntervalMs: number;
  nextRefreshDueInMs: number | null;
  metadataVersion: string | null;
}

export interface SourceStatusStreamEvent {
  type: 'snapshot' | 'update' | 'metrics' | 'heartbeat' | 'error';
  timestamp: string;
  payload?: SourceStatusResponse | Partial<SourceStatusResponse>;
  message?: string;
}

export interface ContradictionStats {
  total: number;
  active: number;
  resolved: number;
  acceptable: number;
  high_severity_percentage?: number;
  median_resolution_time?: string;
  resolutions_last_24h?: number;
  average_credibility_impact?: number;
  last_checked?: string;
}

export interface ContradictionResponse {
  contradictions: ContradictionData[];
  stats: ContradictionStats;
  last_checked: string;
}

export interface UseSourceHealthReturn {
  sourceHealth: SourceHealthData[];
  loading: boolean;
  error: string | null;
  lastUpdated: string;
  refreshHealth: () => Promise<void>;
  refreshSource: (sourceId: string) => Promise<void>;
  isRefreshing: boolean;
  metrics?: SourceMetrics;
  lastUpdatedLabel: string;
  manualRefreshAllowed: boolean;
  manualRefreshMessage: string | null;
  nextAutoRefreshAt: number | null;
  nextAutoRefreshLabel: string;
  triggerSourceTest?: (sourceId: string) => Promise<void>;
  pauseMonitoring?: (sourceId: string) => Promise<void>;
  resumeMonitoring?: (sourceId: string) => Promise<void>;
  monitoring: SourceMonitoringSnapshot;
  connectionState: SourceConnectionState;
  usingMockData: boolean;
}

export interface UseContradictionDetectionReturn {
  contradictions: ContradictionData[];
  activeContradictions: ContradictionData[];
  resolvedContradictions: ContradictionData[];
  loading: boolean;
  error: string | null;
  refreshContradictions: () => Promise<void>;
  resolveContradiction: (id: string, resolution: string) => Promise<void>;
  markAsAcceptable: (id: string, reason: string) => Promise<void>;
  contradictionStats: ContradictionStats;
}

export interface SourceTestResult {
  source_id: string;
  status: SourceStatus;
  latency_ms: number;
  success: boolean;
  message?: string;
}

export interface ContradictionTimelineEntry {
  id: string;
  timestamp: string;
  message: string;
  severity: ContradictionSeverity;
}
