import { useCallback, useEffect, useState } from 'react';

// ── Route shape ─────────────────────────────────────────────────
export type Route =
  | { kind: 'rating' }
  | { kind: 'company'; inn: string }
  | { kind: 'thematic' }
  | { kind: 'article'; id: string };

// ── URL ↔ Route ─────────────────────────────────────────────────
export function routeFromLocation(): Route {
  if (typeof window === 'undefined') return { kind: 'rating' };
  const { pathname, search } = window.location;
  const params = new URLSearchParams(search);
  const inn = params.get('company');
  if (inn) return { kind: 'company', inn };
  const articleMatch = pathname.match(/^\/article\/([^/]+)\/?$/);
  if (articleMatch) return { kind: 'article', id: decodeURIComponent(articleMatch[1]) };
  if (pathname === '/thematic' || pathname.startsWith('/thematic/')) return { kind: 'thematic' };
  return { kind: 'rating' };
}

export function routeToUrl(r: Route): string {
  switch (r.kind) {
    case 'rating':   return '/';
    case 'company':  return `/?company=${encodeURIComponent(r.inn)}`;
    case 'thematic': return '/thematic';
    case 'article':  return `/article/${encodeURIComponent(r.id)}`;
  }
}

// ── Hook ────────────────────────────────────────────────────────
export interface Router {
  route: Route;
  navigate: (next: Route) => void;
  goRating:   () => void;
  goThematic: () => void;
  goCompany:  (inn: string) => void;
  goArticle:  (id: string)  => void;
}

export function useRouter(): Router {
  const [route, setRoute] = useState<Route>(routeFromLocation);

  // Sync state ← browser back/forward.
  useEffect(() => {
    const onPop = () => setRoute(routeFromLocation());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((next: Route) => {
    const url = routeToUrl(next);
    const current = window.location.pathname + window.location.search;
    if (current !== url) window.history.pushState(null, '', url);
    setRoute(next);
    window.scrollTo(0, 0);
  }, []);

  return {
    route,
    navigate,
    goRating:   useCallback(()        => navigate({ kind: 'rating' }),        [navigate]),
    goThematic: useCallback(()        => navigate({ kind: 'thematic' }),      [navigate]),
    goCompany:  useCallback((inn)     => navigate({ kind: 'company', inn }),  [navigate]),
    goArticle:  useCallback((id)      => navigate({ kind: 'article', id }),   [navigate]),
  };
}
