import { describe, expect, it, beforeEach, vi } from 'vitest';
import { routeToUrl, routeFromLocation } from './routing';

describe('routeToUrl', () => {
  it('maps rating to /', () => {
    expect(routeToUrl({ kind: 'rating' })).toBe('/');
  });

  it('maps thematic to /thematic', () => {
    expect(routeToUrl({ kind: 'thematic' })).toBe('/thematic');
  });

  it('maps company to /?company=INN', () => {
    expect(routeToUrl({ kind: 'company', inn: '7707782563' })).toBe('/?company=7707782563');
  });

  it('encodes special characters in inn', () => {
    expect(routeToUrl({ kind: 'company', inn: 'foo bar' })).toBe('/?company=foo%20bar');
  });

  it('maps article to /article/:id', () => {
    expect(routeToUrl({ kind: 'article', id: 'moscow-vs-regions' }))
      .toBe('/article/moscow-vs-regions');
  });

  it('encodes special characters in article id', () => {
    expect(routeToUrl({ kind: 'article', id: 'a/b' })).toBe('/article/a%2Fb');
  });
});

function setLocation(url: string) {
  const u = new URL(url, 'https://pko300.ru');
  // jsdom's location can be reassigned via history.replaceState
  window.history.replaceState(null, '', u.pathname + u.search);
}

describe('routeFromLocation', () => {
  beforeEach(() => setLocation('/'));

  it('returns rating for /', () => {
    setLocation('/');
    expect(routeFromLocation()).toEqual({ kind: 'rating' });
  });

  it('returns thematic for /thematic', () => {
    setLocation('/thematic');
    expect(routeFromLocation()).toEqual({ kind: 'thematic' });
  });

  it('returns article for /article/:id', () => {
    setLocation('/article/moscow-vs-regions');
    expect(routeFromLocation()).toEqual({ kind: 'article', id: 'moscow-vs-regions' });
  });

  it('decodes article id', () => {
    setLocation('/article/a%2Fb');
    expect(routeFromLocation()).toEqual({ kind: 'article', id: 'a/b' });
  });

  it('returns company for /?company=INN (highest priority)', () => {
    setLocation('/?company=7707782563');
    expect(routeFromLocation()).toEqual({ kind: 'company', inn: '7707782563' });
  });

  it('?company wins over /thematic path', () => {
    setLocation('/thematic?company=12345');
    expect(routeFromLocation()).toEqual({ kind: 'company', inn: '12345' });
  });

  it('falls back to rating on unknown path', () => {
    setLocation('/some/unknown/path');
    expect(routeFromLocation()).toEqual({ kind: 'rating' });
  });

  it('tolerates trailing slash on article path', () => {
    setLocation('/article/x/');
    expect(routeFromLocation()).toEqual({ kind: 'article', id: 'x' });
  });
});

describe('routing round-trip', () => {
  it('routeToUrl ∘ routeFromLocation is identity for all kinds', () => {
    const routes = [
      { kind: 'rating' } as const,
      { kind: 'thematic' } as const,
      { kind: 'company', inn: '7707782563' } as const,
      { kind: 'article', id: 'foo-bar' } as const,
    ];
    for (const route of routes) {
      setLocation(routeToUrl(route));
      expect(routeFromLocation()).toEqual(route);
    }
  });
});
