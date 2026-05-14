import { useEffect, useState } from 'react';
import { peek } from './loader';

interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
}

/**
 * Subscribe to a cached async loader. Returns the cached value synchronously on
 * mount (no loading flash on remount). Always re-subscribes via .then so we
 * cannot miss a resolution that happens between render and effect.
 *
 * @param url        the dataset URL (used as cache key)
 * @param loader     thunk that returns the same Promise the loader module memoises
 */
export function useAsyncData<T>(url: string, loader: () => Promise<T>): AsyncState<T> {
  // Lazy initializer: peek() runs only on the first render.
  const [data, setData]   = useState<T | undefined>(() => peek<T>(url));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Always subscribe to the cached promise. If the data was set into the cache
    // between render and effect, the `.then()` below still fires (memoised
    // promise resolves on microtask) and we update state. React skips the
    // re-render if the value is reference-equal to the current state.
    let cancelled = false;
    loader()
      .then(value => { if (!cancelled) setData(value); })
      .catch(err  => { if (!cancelled) setError(err instanceof Error ? err : new Error(String(err))); });
    return () => { cancelled = true; };
  }, [url, loader]);

  return { data, loading: data === undefined && error === null, error };
}
