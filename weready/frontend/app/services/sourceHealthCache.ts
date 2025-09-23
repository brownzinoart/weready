import type {
  CacheInfo,
  CacheMetadata,
  CachedSourceData,
  SourceHealthData,
  SourceMetrics,
} from '@/app/types/sources';
import { CACHE_TTL_MS } from '@/app/constants/cache';

const DB_NAME = 'source-health-cache';
const DB_VERSION = 1;
const HEALTH_STORE = 'health';
const METRICS_STORE = 'metrics';
const META_STORE = 'metadata';
const HEALTH_KEY = 'sources';
const METRICS_KEY = 'metrics';
type MetadataStoreKey = 'health' | 'metrics';
const HEALTH_META_KEY: MetadataStoreKey = 'health';
const METRICS_META_KEY: MetadataStoreKey = 'metrics';

const CACHE_VERSION = '1.0.0';
const RECOMMENDED_REFRESH_MS = 30 * 60 * 1000;

declare global {
  interface Window {
    indexedDB: IDBFactory;
  }
}

const isBrowser = () => typeof window !== 'undefined';
const isIndexedDBSupported = () => isBrowser() && typeof window.indexedDB !== 'undefined';

let dbPromise: Promise<IDBDatabase> | null = null;

function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
  });
}

function waitForTransaction(tx: IDBTransaction): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'));
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'));
  });
}

async function openDatabase(): Promise<IDBDatabase | null> {
  if (!isIndexedDBSupported()) {
    return null;
  }

  if (!dbPromise) {
    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(HEALTH_STORE)) {
          db.createObjectStore(HEALTH_STORE);
        }
        if (!db.objectStoreNames.contains(METRICS_STORE)) {
          db.createObjectStore(METRICS_STORE);
        }
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        dbPromise = null;
        reject(request.error ?? new Error('Failed to open source health cache database'));
      };
    });
  }

  try {
    return await dbPromise;
  } catch (error) {
    console.warn('Source health cache unavailable – IndexedDB open failed.', error);
    return null;
  }
}

function buildMetadata(
  dataSource: CacheMetadata['dataSource'],
  overrides?: Partial<Omit<CacheMetadata, 'dataSource'>>,
  ttlMs: number = CACHE_TTL_MS,
): CacheMetadata {
  const now = Date.now();
  const lastUpdated = overrides?.lastUpdated ?? new Date(now).toISOString();
  const expiresAt = overrides?.expiresAt ?? new Date(now + ttlMs).toISOString();
  const version = overrides?.version ?? CACHE_VERSION;
  const refreshMode = overrides?.refreshMode ?? 'initial';
  return {
    dataSource,
    lastUpdated,
    expiresAt,
    version,
    refreshMode,
  };
}

function isExpired(expiresAt: string | undefined): boolean {
  if (!expiresAt) {
    return false;
  }
  const expiry = Number(new Date(expiresAt).getTime());
  if (Number.isNaN(expiry)) {
    return false;
  }
  return expiry < Date.now();
}

export async function storeSourceHealth(
  data: SourceHealthData[],
  options: {
    dataSource: CacheMetadata['dataSource'];
    lastUpdated?: string;
    expiresAt?: string;
    expiresInMs?: number;
    version?: string;
    refreshMode?: CacheMetadata['refreshMode'];
  },
): Promise<CacheMetadata | null> {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }
  const db = await openDatabase();
  if (!db) {
    return null;
  }
  try {
    const ttl = options.expiresInMs ?? CACHE_TTL_MS;
    const metadata = buildMetadata(options.dataSource, {
      lastUpdated: options.lastUpdated,
      expiresAt: options.expiresAt,
      version: options.version,
      refreshMode: options.refreshMode,
    }, ttl);
    const tx = db.transaction([HEALTH_STORE, META_STORE], 'readwrite');
    tx.objectStore(HEALTH_STORE).put(data, HEALTH_KEY);
    tx.objectStore(META_STORE).put(metadata, HEALTH_META_KEY);
    await waitForTransaction(tx);
    return metadata;
  } catch (error) {
    console.warn('Failed to persist source health cache payload.', error);
    return null;
  }
}

export async function getSourceHealth(): Promise<CachedSourceData | null> {
  const db = await openDatabase();
  if (!db) {
    return null;
  }
  try {
    const tx = db.transaction([HEALTH_STORE, META_STORE], 'readonly');
    const healthRequest = tx.objectStore(HEALTH_STORE).get(HEALTH_KEY);
    const metadataRequest = tx.objectStore(META_STORE).get(HEALTH_META_KEY);
    const [data, metadata] = await Promise.all([
      promisifyRequest<SourceHealthData[] | undefined>(healthRequest),
      promisifyRequest<CacheMetadata | undefined>(metadataRequest),
    ]);
    await waitForTransaction(tx);
    if (!data || !Array.isArray(data) || !metadata) {
      return null;
    }
    const now = Date.now();
    const lastUpdatedMs = Number(new Date(metadata.lastUpdated).getTime());
    const expiresAtMs = metadata.expiresAt ? Number(new Date(metadata.expiresAt).getTime()) : null;
    const ageMs = Number.isNaN(lastUpdatedMs) ? null : Math.max(0, now - lastUpdatedMs);
    const expiredForMs =
      expiresAtMs && Number.isFinite(expiresAtMs) && now > expiresAtMs ? now - expiresAtMs : 0;
    return {
      data,
      metadata,
      isExpired: isExpired(metadata.expiresAt),
      ageMs,
      expiredForMs,
      expiresAtMs,
    };
  } catch (error) {
    console.warn('Failed to read source health cache payload.', error);
    return null;
  }
}

export async function storeMetrics(
  metrics: SourceMetrics,
  options: {
    dataSource: CacheMetadata['dataSource'];
    lastUpdated?: string;
    expiresAt?: string;
    expiresInMs?: number;
    version?: string;
    refreshMode?: CacheMetadata['refreshMode'];
  },
): Promise<CacheMetadata | null> {
  if (!metrics) {
    return null;
  }
  const db = await openDatabase();
  if (!db) {
    return null;
  }
  try {
    const ttl = options.expiresInMs ?? CACHE_TTL_MS;
    const metadata = buildMetadata(options.dataSource, {
      lastUpdated: options.lastUpdated,
      expiresAt: options.expiresAt,
      version: options.version,
      refreshMode: options.refreshMode,
    }, ttl);
    const tx = db.transaction([METRICS_STORE, META_STORE], 'readwrite');
    tx.objectStore(METRICS_STORE).put(metrics, METRICS_KEY);
    tx.objectStore(META_STORE).put(metadata, METRICS_META_KEY);
    await waitForTransaction(tx);
    return metadata;
  } catch (error) {
    console.warn('Failed to persist source metrics cache payload.', error);
    return null;
  }
}

interface CachedMetricsData {
  data: SourceMetrics;
  metadata: CacheMetadata;
  isExpired: boolean;
  ageMs: number | null;
  expiredForMs: number;
  expiresAtMs: number | null;
}

export async function getMetrics(): Promise<CachedMetricsData | null> {
  const db = await openDatabase();
  if (!db) {
    return null;
  }
  try {
    const tx = db.transaction([METRICS_STORE, META_STORE], 'readonly');
    const metricsRequest = tx.objectStore(METRICS_STORE).get(METRICS_KEY);
    const metadataRequest = tx.objectStore(META_STORE).get(METRICS_META_KEY);
    const [data, metadata] = await Promise.all([
      promisifyRequest<SourceMetrics | undefined>(metricsRequest),
      promisifyRequest<CacheMetadata | undefined>(metadataRequest),
    ]);
    await waitForTransaction(tx);
    if (!data || !metadata) {
      return null;
    }
    const now = Date.now();
    const lastUpdatedMs = Number(new Date(metadata.lastUpdated).getTime());
    const expiresAtMs = metadata.expiresAt ? Number(new Date(metadata.expiresAt).getTime()) : null;
    const ageMs = Number.isNaN(lastUpdatedMs) ? null : Math.max(0, now - lastUpdatedMs);
    const expiredForMs =
      expiresAtMs && Number.isFinite(expiresAtMs) && now > expiresAtMs ? now - expiresAtMs : 0;
    return {
      data,
      metadata,
      isExpired: isExpired(metadata.expiresAt),
      ageMs,
      expiredForMs,
      expiresAtMs,
    };
  } catch (error) {
    console.warn('Failed to read source metrics cache payload.', error);
    return null;
  }
}

export async function clearCache(): Promise<void> {
  const db = await openDatabase();
  if (!db) {
    return;
  }
  try {
    const tx = db.transaction([HEALTH_STORE, METRICS_STORE, META_STORE], 'readwrite');
    tx.objectStore(HEALTH_STORE).delete(HEALTH_KEY);
    tx.objectStore(METRICS_STORE).delete(METRICS_KEY);
    tx.objectStore(META_STORE).delete(HEALTH_META_KEY);
    tx.objectStore(META_STORE).delete(METRICS_META_KEY);
    await waitForTransaction(tx);
  } catch (error) {
    console.warn('Failed to clear source health cache.', error);
  }
}

export async function getCacheInfo(): Promise<CacheInfo> {
  if (!isIndexedDBSupported()) {
    return {
      isAvailable: false,
      lastCacheTime: null,
      cacheSize: 0,
      isExpired: true,
      ageMs: null,
      expiredForMs: 0,
      refreshMode: null,
      recommendedRefreshIntervalMs: RECOMMENDED_REFRESH_MS,
      nextRefreshDueInMs: null,
      metadataVersion: null,
    };
  }

  try {
    const [health, metrics] = await Promise.all([getSourceHealth(), getMetrics()]);
    const hasHealth = Boolean(health?.data?.length);
    const hasMetrics = Boolean(metrics?.data);
    const isAvailable = hasHealth || hasMetrics;
    const lastCacheTime = health?.metadata.lastUpdated ?? metrics?.metadata.lastUpdated ?? null;
    const cacheSize = (() => {
      const healthSize = hasHealth ? JSON.stringify(health?.data ?? []).length : 0;
      const metricsSize = metrics?.data ? JSON.stringify(metrics.data).length : 0;
      const metaSize = [health?.metadata, metrics?.metadata]
        .filter(Boolean)
        .reduce((acc, meta) => acc + JSON.stringify(meta).length, 0);
      return healthSize + metricsSize + metaSize;
    })();
    const primaryMetadata = hasHealth ? health?.metadata : metrics?.metadata;
    const ageMs = hasHealth ? health?.ageMs ?? null : metrics?.ageMs ?? null;
    const expiredForMs = Math.max(health?.expiredForMs ?? 0, metrics?.expiredForMs ?? 0);
    const nextRefreshDueInMs =
      ageMs == null ? null : Math.max(RECOMMENDED_REFRESH_MS - ageMs, 0);
    return {
      isAvailable,
      lastCacheTime,
      cacheSize,
      isExpired: Boolean(health?.isExpired || metrics?.isExpired),
      ageMs,
      expiredForMs,
      refreshMode: primaryMetadata?.refreshMode ?? null,
      recommendedRefreshIntervalMs: RECOMMENDED_REFRESH_MS,
      nextRefreshDueInMs,
      metadataVersion: primaryMetadata?.version ?? null,
    };
  } catch (error) {
    console.warn('Failed to read source health cache info.', error);
    return {
      isAvailable: false,
      lastCacheTime: null,
      cacheSize: 0,
      isExpired: true,
      ageMs: null,
      expiredForMs: 0,
      refreshMode: null,
      recommendedRefreshIntervalMs: RECOMMENDED_REFRESH_MS,
      nextRefreshDueInMs: null,
      metadataVersion: null,
    };
  }
}

export const sourceHealthCache = {
  storeSourceHealth,
  getSourceHealth,
  storeMetrics,
  getMetrics,
  clearCache,
  getCacheInfo,
};

export type { CachedMetricsData };
