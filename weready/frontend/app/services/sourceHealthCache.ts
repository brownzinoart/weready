import type {
  CacheInfo,
  CacheMetadata,
  CachedSourceData,
  SourceHealthData,
  SourceMetrics,
} from '@/app/types/sources';

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
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

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
  ttlMs: number = DEFAULT_CACHE_TTL_MS,
): CacheMetadata {
  const now = Date.now();
  const lastUpdated = overrides?.lastUpdated ?? new Date(now).toISOString();
  const expiresAt = overrides?.expiresAt ?? new Date(now + ttlMs).toISOString();
  const version = overrides?.version ?? CACHE_VERSION;
  return {
    dataSource,
    lastUpdated,
    expiresAt,
    version,
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
    const ttl = options.expiresInMs ?? DEFAULT_CACHE_TTL_MS;
    const metadata = buildMetadata(options.dataSource, {
      lastUpdated: options.lastUpdated,
      expiresAt: options.expiresAt,
      version: options.version,
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
    return {
      data,
      metadata,
      isExpired: isExpired(metadata.expiresAt),
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
    const ttl = options.expiresInMs ?? DEFAULT_CACHE_TTL_MS;
    const metadata = buildMetadata(options.dataSource, {
      lastUpdated: options.lastUpdated,
      expiresAt: options.expiresAt,
      version: options.version,
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
    return {
      data,
      metadata,
      isExpired: isExpired(metadata.expiresAt),
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
    };
  }

  try {
    const [health, metrics] = await Promise.all([getSourceHealth(), getMetrics()]);
    const hasHealth = Boolean(health?.data?.length);
    const lastCacheTime = health?.metadata.lastUpdated ?? metrics?.metadata.lastUpdated ?? null;
    const cacheSize = (() => {
      const healthSize = hasHealth ? JSON.stringify(health?.data ?? []).length : 0;
      const metricsSize = metrics?.data ? JSON.stringify(metrics.data).length : 0;
      const metaSize = [health?.metadata, metrics?.metadata]
        .filter(Boolean)
        .reduce((acc, meta) => acc + JSON.stringify(meta).length, 0);
      return healthSize + metricsSize + metaSize;
    })();
    return {
      isAvailable: hasHealth,
      lastCacheTime,
      cacheSize,
      isExpired: Boolean(health?.isExpired || metrics?.isExpired),
    };
  } catch (error) {
    console.warn('Failed to read source health cache info.', error);
    return {
      isAvailable: false,
      lastCacheTime: null,
      cacheSize: 0,
      isExpired: true,
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
