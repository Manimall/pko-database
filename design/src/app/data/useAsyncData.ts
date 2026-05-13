import { useEffect, useState } from 'react';
import { peek } from './loader';

interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
}

/**
 * Subscribe to a cached async loader. Returns synced cached value immediately if
 * already loaded (no loading flash on remount). Re-renders once the fetch resolves.
 *
 * @param url        the dataset URL (used as cache key)
 * @param loader     thunk that returns the same Promise the loader module memoises
 */
export function useAsyncData<T>(url: string, loader: () => Promise<T>): AsyncState<T> {
  const initial = peek<T>(url);
  const [data, setData] = useState<T | undefined>(initial);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (peek<T>(url) !== undefined) return;
    let cancelled = false;
    loader()
      .then(value => { if (!cancelled) setData(value); })
      .catch(err   => { if (!cancelled) setError(err instanceof Error ? err : new Error(String(err))); });
    return () => { cancelled = true; };
  }, [url, loader]);

  return { data, loading: data === undefined && error === null, error };
}
