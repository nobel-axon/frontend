import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAPIOptions {
  pollInterval?: number;
  enabled?: boolean;
}

interface UseAPIReturn<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  refetch: () => void;
}

export function useAPI<T>(
  fetcher: () => Promise<T>,
  deps: unknown[],
  options: UseAPIOptions = {},
): UseAPIReturn<T> {
  const { pollInterval, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const firstLoad = useRef(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const doFetch = useCallback(async () => {
    if (!enabled) return;
    const isFirst = firstLoad.current;
    try {
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
    } catch (err) {
      // Keep last good data on poll failure
      if (isFirst) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (isFirst) {
        firstLoad.current = false;
        setLoading(false);
      }
    }
  }, [enabled]);

  useEffect(() => {
    firstLoad.current = true;
    setData(null);
    setError(null);
    setLoading(true);
    doFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled]);

  useEffect(() => {
    if (!pollInterval || !enabled) return;
    const id = setInterval(doFetch, pollInterval);
    return () => clearInterval(id);
  }, [pollInterval, enabled, doFetch]);

  return { data, error, loading, refetch: doFetch };
}
