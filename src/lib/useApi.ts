import { useEffect, useRef, useState } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

// Global cache with 5 minute TTL
const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const REQUEST_TIMEOUT = 10000; // 10 seconds

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  cacheKey: string = ""
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  const actualCacheKey = cacheKey || JSON.stringify(apiCall.toString());

  useEffect(() => {
    isMounted.current = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const cached = cache.get(actualCacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          if (isMounted.current) {
            setData(cached.data);
            setLoading(false);
          }
          return;
        }

        // Check if request is already in flight (deduplication)
        if (cached?.promise) {
          const result = await cached.promise;
          if (isMounted.current) {
            setData(result);
            setLoading(false);
          }
          return;
        }

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        try {
          // Make the API call with deduplication
          const promise = apiCall().then((result) => {
            clearTimeout(timeoutId);
            // Cache the result
            cache.set(actualCacheKey, {
              data: result,
              timestamp: Date.now(),
            });
            return result;
          });

          // Store the in-flight promise for deduplication
          cache.set(actualCacheKey, {
            data: null,
            timestamp: Date.now(),
            promise,
          });

          const result = await promise;
          if (isMounted.current) {
            setData(result);
            setLoading(false);
          }
        } catch (err) {
          clearTimeout(timeoutId);
          throw err;
        }
      } catch (err) {
        if (isMounted.current) {
          const error =
            err instanceof Error ? err : new Error("Unknown error occurred");
          setError(error);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted.current = false;
    };
  }, dependencies);

  return { data, loading, error };
}

// Clear cache function for manual cache invalidation
export function clearApiCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

// Utility for retry logic
export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }

  throw lastError;
}
