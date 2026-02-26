import AsyncStorage from '@react-native-async-storage/async-storage';

type CacheEnvelope<T> = {
  savedAt: number;
  data: T;
};

export type CachedResult<T> = {
  data: T;
  stale: boolean;
  savedAt: number;
};

async function readCache<T>(key: string): Promise<CacheEnvelope<T> | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as CacheEnvelope<T>;
  } catch {
    return null;
  }
}

async function writeCache<T>(key: string, data: T) {
  const envelope: CacheEnvelope<T> = {
    savedAt: Date.now(),
    data,
  };

  await AsyncStorage.setItem(key, JSON.stringify(envelope));
}

export async function fetchWithCache<T>(
  key: string,
  maxAgeMs: number,
  fetcher: () => Promise<T>
): Promise<CachedResult<T>> {
  const cached = await readCache<T>(key);
  const cacheFresh = cached ? Date.now() - cached.savedAt < maxAgeMs : false;

  if (cacheFresh && cached) {
    return { data: cached.data, stale: false, savedAt: cached.savedAt };
  }

  try {
    const data = await fetcher();
    await writeCache(key, data);
    return { data, stale: false, savedAt: Date.now() };
  } catch (error) {
    if (cached) {
      return { data: cached.data, stale: true, savedAt: cached.savedAt };
    }

    throw error;
  }
}

export async function clearApiCache() {
  const keys = await AsyncStorage.getAllKeys();
  const cacheKeys = keys.filter((key) => key.startsWith('easyparking:cache:'));
  if (!cacheKeys.length) {
    return;
  }

  await Promise.all(cacheKeys.map((key) => AsyncStorage.removeItem(key)));
}
