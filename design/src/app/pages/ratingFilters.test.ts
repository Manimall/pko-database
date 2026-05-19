import { describe, expect, it } from 'vitest';
import type { RatingCompany } from '../data/ratingData';
import { EMPTY_FILTERS, type RatingFilters } from '../components/filterBar';
import { applyFilters, buildExtraColumns } from './ratingFilters';

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

function withFilter(patch: Partial<RatingFilters>): RatingFilters {
  return { ...EMPTY_FILTERS, ...patch };
}

const FIXTURES: RatingCompany[] = [
  mkCompany({ rank: 1, name: 'ПКБ',          inn: '1111111111', revenue: 25_000, profit: 7_000, napka: true,  capitalAttraction: 'public',    experience: 17, de: 0.01, growthRate: 200, cagr: 3.0 }),
  mkCompany({ rank: 2, name: 'АЙДИ КОЛЛЕКТ', inn: '2222222222', revenue: 13_000, profit: 2_800, napka: true,  capitalAttraction: 'public',    experience: 9,  de: 0.04, growthRate: 500, cagr: 5.5 }),
  mkCompany({ rank: 3, name: 'ФЕНИКС',       inn: '3333333333', revenue: 13_000, profit: 5_900, napka: false, capitalAttraction: 'corporate', experience: 11, de: 0,    growthRate: 150, cagr: 1.3 }),
  mkCompany({ rank: 4, name: 'ЭОС',          inn: '4444444444', revenue: 8_800,  profit: -1_000, napka: true,  capitalAttraction: 'corporate', experience: 18, de: 0,    growthRate: 100, cagr: 0.5 }),
  mkCompany({ rank: 5, name: 'ЦДУ',          inn: '5555555555', revenue: 5_600,  profit: 1_400, napka: false, capitalAttraction: 'none',      experience: 17, de: 0,    growthRate: 450, cagr: 3.7 }),
];

describe('applyFilters — search', () => {
  it('returns all rows when query is empty', () => {
    expect(applyFilters(FIXTURES, '', EMPTY_FILTERS)).toHaveLength(5);
  });

  it('matches by name (case-insensitive)', () => {
    expect(applyFilters(FIXTURES, 'феник', EMPTY_FILTERS).map(c => c.rank)).toEqual([3]);
  });

  it('matches by ИНН substring', () => {
    expect(applyFilters(FIXTURES, '4444', EMPTY_FILTERS).map(c => c.rank)).toEqual([4]);
  });

  it('returns empty for non-matching query', () => {
    expect(applyFilters(FIXTURES, 'xxxxxx', EMPTY_FILTERS)).toHaveLength(0);
  });
});

describe('applyFilters — NAPKA', () => {
  it('napka=yes keeps only members', () => {
    const out = applyFilters(FIXTURES, '', withFilter({ napka: 'yes' }));
    expect(out.map(c => c.rank)).toEqual([1, 2, 4]);
  });

  it('napka=no keeps only non-members', () => {
    const out = applyFilters(FIXTURES, '', withFilter({ napka: 'no' }));
    expect(out.map(c => c.rank)).toEqual([3, 5]);
  });
});

describe('applyFilters — capital attraction', () => {
  it('all flags true means no filter applied', () => {
    expect(applyFilters(FIXTURES, '', withFilter({
      capitalPublic: true, capitalCorporate: true, capitalNone: true,
    }))).toHaveLength(5);
  });

  it('only public keeps public companies', () => {
    const out = applyFilters(FIXTURES, '', withFilter({
      capitalPublic: true, capitalCorporate: false, capitalNone: false,
    }));
    expect(out.map(c => c.rank)).toEqual([1, 2]);
  });

  it('only corporate keeps corporate', () => {
    const out = applyFilters(FIXTURES, '', withFilter({
      capitalPublic: false, capitalCorporate: true, capitalNone: false,
    }));
    expect(out.map(c => c.rank)).toEqual([3, 4]);
  });
});

describe('applyFilters — numeric ranges', () => {
  it('revenue range — both bounds', () => {
    const out = applyFilters(FIXTURES, '', withFilter({ revenueFrom: '10000', revenueTo: '20000' }));
    expect(out.map(c => c.rank)).toEqual([2, 3]);
  });

  it('revenue range — only lower', () => {
    const out = applyFilters(FIXTURES, '', withFilter({ revenueFrom: '20000' }));
    expect(out.map(c => c.rank)).toEqual([1]);
  });

  it('profit range filters out negatives', () => {
    const out = applyFilters(FIXTURES, '', withFilter({ profitFrom: '0' }));
    expect(out.map(c => c.rank)).toEqual([1, 2, 3, 5]);
  });

  it('experience range', () => {
    const out = applyFilters(FIXTURES, '', withFilter({ experienceFrom: '15' }));
    expect(out.map(c => c.rank)).toEqual([1, 4, 5]);
  });

  it('CAGR uses percent-scale (stored as fraction)', () => {
    // fixtures have cagr in fraction form already: 3.0, 5.5, 1.3, 0.5, 3.7
    // user filter cagrFrom='200' means filter out cagr*100 < 200, i.e. fraction < 2
    const out = applyFilters(FIXTURES, '', withFilter({ cagrFrom: '200' }));
    expect(out.map(c => c.rank)).toEqual([1, 2, 5]);
  });

  it('D/E range', () => {
    const out = applyFilters(FIXTURES, '', withFilter({ deTo: '0.01' }));
    expect(out.map(c => c.rank)).toEqual([1, 3, 4, 5]);
  });
});

describe('applyFilters — sort', () => {
  it('default is desc (by rank ascending = best first)', () => {
    expect(applyFilters(FIXTURES, '', EMPTY_FILTERS).map(c => c.rank))
      .toEqual([1, 2, 3, 4, 5]);
  });

  it('asc flips order (worst first)', () => {
    expect(applyFilters(FIXTURES, '', withFilter({ sortDir: 'asc' })).map(c => c.rank))
      .toEqual([5, 4, 3, 2, 1]);
  });

  it('does not mutate input array', () => {
    const original = [...FIXTURES];
    applyFilters(FIXTURES, '', withFilter({ sortDir: 'asc' }));
    expect(FIXTURES).toEqual(original);
  });
});

describe('applyFilters — combined filters', () => {
  it('search + napka', () => {
    const out = applyFilters(FIXTURES, 'эос', withFilter({ napka: 'yes' }));
    expect(out.map(c => c.rank)).toEqual([4]);
  });

  it('returns empty when filters are mutually exclusive', () => {
    expect(applyFilters(FIXTURES, '', withFilter({
      revenueFrom: '100000', revenueTo: '200000',
    }))).toHaveLength(0);
  });
});

describe('buildExtraColumns', () => {
  it('returns empty when no advanced filters are set', () => {
    expect(buildExtraColumns(EMPTY_FILTERS)).toEqual([]);
  });

  it('adds D/E column when deFrom or deTo is set', () => {
    expect(buildExtraColumns(withFilter({ deFrom: '0.5' })).map(c => c.key))
      .toEqual(['de']);
  });

  it('adds growthRate column when range is set', () => {
    expect(buildExtraColumns(withFilter({ growthRateTo: '500' })).map(c => c.key))
      .toEqual(['growthRate']);
  });

  it('adds cagr column when range is set', () => {
    expect(buildExtraColumns(withFilter({ cagrFrom: '2' })).map(c => c.key))
      .toEqual(['cagr']);
  });

  it('can return multiple columns', () => {
    const cols = buildExtraColumns(withFilter({ deFrom: '0', cagrTo: '10', growthRateFrom: '100' }));
    expect(cols.map(c => c.key)).toEqual(['de', 'growthRate', 'cagr']);
  });

  it('D/E column formats to 2 decimals', () => {
    const col = buildExtraColumns(withFilter({ deFrom: '0' }))[0];
    expect(col.format(mkCompany({ de: 0.123 }))).toBe('0.12');
  });

  it('CAGR column multiplies stored fraction by 100', () => {
    const col = buildExtraColumns(withFilter({ cagrFrom: '0' }))[0];
    expect(col.format(mkCompany({ cagr: 5.5 }))).toMatch(/^550\s*%$|^550%$/);
  });
});
