import { useState, useEffect, useCallback, useRef } from 'react';

interface Page<T> {
  items: T[];
  /** If backend returns total, pass it. Otherwise leave undefined — hasMore is inferred from page size. */
  total?: number;
}

interface UseInfiniteAPIOptions {
  pageSize?: number;
  enabled?: boolean;
}

interface UseInfiniteAPIReturn<T> {
  items: T[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  sentinelRef: (node: HTMLElement | null) => void;
}

export function useInfiniteAPI<T>(
  fetcher: (offset: number, limit: number) => Promise<Page<T>>,
  deps: unknown[],
  options: UseInfiniteAPIOptions = {},
): UseInfiniteAPIReturn<T> {
  const { pageSize = 20, enabled = true } = options;
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const offsetRef = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const busyRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadPage = useCallback(async (isFirst: boolean) => {
    if (busyRef.current) return;
    busyRef.current = true;
    if (!isFirst) setLoadingMore(true);
    try {
      const offset = offsetRef.current;
      const { items: newItems, total } = await fetcherRef.current(offset, pageSize);
      setItems(prev => isFirst ? newItems : [...prev, ...newItems]);
      offsetRef.current = offset + newItems.length;
      // If total provided, use it. Otherwise, short page = no more.
      if (total != null) {
        setHasMore(offsetRef.current < total);
      } else {
        setHasMore(newItems.length >= pageSize);
      }
      setError(null);
    } catch (err) {
      if (isFirst) setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (isFirst) setLoading(false);
      setLoadingMore(false);
      busyRef.current = false;
    }
  }, [pageSize]);

  // Reset and load first page when deps change
  useEffect(() => {
    if (!enabled) return;
    offsetRef.current = 0;
    setItems([]);
    setHasMore(true);
    setError(null);
    setLoading(true);
    busyRef.current = false;
    loadPage(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled]);

  // Sentinel ref callback — attaches IntersectionObserver
  const sentinelRef = useCallback((node: HTMLElement | null) => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!node) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !busyRef.current) {
          loadPage(false);
        }
      },
      { threshold: 0 },
    );
    observerRef.current.observe(node);
  }, [loadPage]);

  return { items, loading, loadingMore, hasMore, error, sentinelRef };
}
