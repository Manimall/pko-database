/// <reference lib="dom" />
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAsyncData } from './useAsyncData';

// Each test resets these so the loader's mocked fetch is deterministic.
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  vi.restoreAllMocks();
});

/**
 * Inline mini-loader that mirrors what loader.ts does: dedupes by URL and
 * stores resolved value in a sync cache.
 *
 * We use a local cache per test, not loader.ts's module-scoped one, to keep
 * tests isolated from each other.
 */
function makeLoader<T>() {
  const pending = new Map<string, Promise<T>>();
  const sync    = new Map<string, T>();

  function load(url: string): Promise<T> {
    const cached = pending.get(url);
    if (cached) return cached;
    const p = (globalThis.fetch as unknown as typeof fetch)(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<T>;
      })
      .then(v => { sync.set(url, v); return v; });
    pending.set(url, p);
    return p;
  }

  return { load, sync };
}

function okJson(body: unknown) {
  return { ok: true, status: 200, json: async () => body } as Response;
}

describe('useAsyncData', () => {
  it('resolves data when the cache fills between render and effect (race fix)', async () => {
    // Simulates the exact pattern from main.tsx: preload kicks off BEFORE the
    // component renders. If the resolve happens between render and useEffect,
    // the old implementation would never call setData and the component would
    // stay empty forever.
    fetchMock.mockResolvedValueOnce(okJson([{ id: 'x' }]));
    const { load } = makeLoader<{ id: string }[]>();
    const url = '/data/test-race.json';

    // Kick off the load BEFORE rendering — mirrors main.tsx behaviour.
    const promise = load(url);

    const { result } = renderHook(() => useAsyncData(url, () => promise));

    // First render returns undefined (cache wasn't populated yet on render).
    expect(result.current.data).toBeUndefined();
    expect(result.current.loading).toBe(true);

    // After the microtask drains the promise, setData fires and the hook reports the value.
    await waitFor(() => {
      expect(result.current.data).toEqual([{ id: 'x' }]);
      expect(result.current.loading).toBe(false);
    });
  });

  it('reports an error when fetch fails', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) } as Response);
    const { load } = makeLoader<unknown>();
    const url = '/data/bad.json';
    const promise = load(url);

    const { result } = renderHook(() => useAsyncData(url, () => promise));

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  it('keeps loading=true while the promise is unresolved', async () => {
    let resolveFetch!: (v: Response) => void;
    fetchMock.mockReturnValueOnce(new Promise<Response>(r => { resolveFetch = r; }));
    const { load } = makeLoader<number[]>();
    const url = '/data/slow.json';
    const promise = load(url);

    const { result } = renderHook(() => useAsyncData(url, () => promise));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeUndefined();

    resolveFetch(okJson([1, 2, 3]));
    await waitFor(() => expect(result.current.data).toEqual([1, 2, 3]));
  });
});
