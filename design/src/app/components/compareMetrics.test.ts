import { describe, expect, it } from 'vitest';
import { COMPARE_METRICS, getBestIdx } from './compareMetrics';
import type { RatingCompany } from '../data/ratingData';

function mkCompany(overrides: Partial<RatingCompany>): RatingCompany {
  return {
    rank: 1, name: 'X', inn: '0', city: '', revenue: 0, profit: 0,
    yearChange: 0, growthRate: 0, experience: 0,
    capitalAttraction: 'none', napka: false,
    cost: 0, eqt: 0, dLong: 0, dShort: 0, de: 0, receivable: 0,
    cagr: 0, loan: 0, rankDelta: 0,
    ...overrides,
  };
}

describe('COMPARE_METRICS', () => {
  it('has at least 10 metrics', () => {
    expect(COMPARE_METRICS.length).toBeGreaterThanOrEqual(10);
  });

  it('all metrics have unique keys', () => {
    const keys = COMPARE_METRICS.map(m => m.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  describe('formatters', () => {
    const c = mkCompany({ rank: 5, rankDelta: 3, profit: -1000, yearChange: 12.34, de: 0.567, cagr: 0.42 });

    it('rank format', () => {
      const m = COMPARE_METRICS.find(m => m.key === 'rank')!;
      expect(m.format(c)).toBe('#5');
    });

    it('rankDelta format for positive', () => {
      const m = COMPARE_METRICS.find(m => m.key === 'rankDelta')!;
      expect(m.format(c)).toBe('↑ 3');
    });

    it('rankDelta format for negative', () => {
      const m = COMPARE_METRICS.find(m => m.key === 'rankDelta')!;
      expect(m.format(mkCompany({ rankDelta: -2 }))).toBe('↓ 2');
    });

    it('rankDelta format for zero', () => {
      const m = COMPARE_METRICS.find(m => m.key === 'rankDelta')!;
      expect(m.format(mkCompany({ rankDelta: 0 }))).toBe('—');
    });

    it('profit format prepends minus for negatives', () => {
      const m = COMPARE_METRICS.find(m => m.key === 'profit')!;
      expect(m.format(c)).toMatch(/^−1[\s ]?000$/);
    });

    it('yearChange adds + for positive', () => {
      const m = COMPARE_METRICS.find(m => m.key === 'yearChange')!;
      expect(m.format(c)).toBe('+12.3%');
    });

    it('de keeps 2 decimals', () => {
      const m = COMPARE_METRICS.find(m => m.key === 'de')!;
      expect(m.format(c)).toBe('0.57');
    });

    it('cagr multiplies by 100', () => {
      const m = COMPARE_METRICS.find(m => m.key === 'cagr')!;
      expect(m.format(c)).toBe('42.0%');
    });

    it('capitalAttraction translates to Russian', () => {
      const m = COMPARE_METRICS.find(m => m.key === 'capitalAttraction')!;
      expect(m.format(mkCompany({ capitalAttraction: 'public' }))).toBe('Публичный');
      expect(m.format(mkCompany({ capitalAttraction: 'corporate' }))).toBe('Корпоративный');
      expect(m.format(mkCompany({ capitalAttraction: 'none' }))).toBe('Нет');
    });
  });
});

describe('getBestIdx', () => {
  const companies = [
    mkCompany({ rank: 1, revenue: 100 }),
    mkCompany({ rank: 3, revenue: 500 }),
    mkCompany({ rank: 2, revenue: 250 }),
  ];

  it('picks max for higherIsBetter=true (revenue → index 1)', () => {
    const revenue = COMPARE_METRICS.find(m => m.key === 'revenue')!;
    expect(getBestIdx(revenue, companies)).toBe(1);
  });

  it('picks min for higherIsBetter=false (rank → index 0)', () => {
    const rank = COMPARE_METRICS.find(m => m.key === 'rank')!;
    expect(getBestIdx(rank, companies)).toBe(0);
  });

  it('returns null when higherIsBetter is null', () => {
    const napka = COMPARE_METRICS.find(m => m.key === 'napka')!;
    expect(getBestIdx(napka, companies)).toBeNull();
  });

  it('returns first index when there is a tie', () => {
    const revenue = COMPARE_METRICS.find(m => m.key === 'revenue')!;
    const tied = [mkCompany({ revenue: 100 }), mkCompany({ revenue: 100 })];
    expect(getBestIdx(revenue, tied)).toBe(0);
  });
});
