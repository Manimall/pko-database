import { describe, expect, it } from 'vitest';
import type { RatingCompany } from '../../data/ratingData';
import { sortCompanies } from './useTableSort';

function makeCompany(overrides: Partial<RatingCompany>): RatingCompany {
  return {
    rank: 1,
    name: 'ООО ПКО "Тест"',
    inn: '1234567890',
    city: 'Москва',
    revenue: 0,
    profit: 0,
    yearChange: 0,
    growthRate: 0,
    experience: 0,
    capitalAttraction: 'none',
    napka: false,
    cost: 0,
    eqt: 0,
    dLong: 0,
    dShort: 0,
    de: 0,
    receivable: 0,
    cagr: 0,
    loan: 0,
    rankDelta: 0,
    ...overrides,
  };
}

const alpha  = makeCompany({ rank: 1, name: 'ООО ПКО "Альфа"',  revenue: 300, profit:  50, experience: 10 });
const beta   = makeCompany({ rank: 2, name: 'АО ПКО "Бета"',    revenue: 100, profit: 200, experience:  5 });
const gamma  = makeCompany({ rank: 3, name: 'ПАО ПКО "Гамма"',  revenue: 200, profit: -10, experience: 15 });

describe('sortCompanies — numeric fields', () => {
  it('sorts by revenue desc (default)', () => {
    const result = sortCompanies([beta, gamma, alpha], 'revenue', 'desc');
    expect(result.map(c => c.revenue)).toEqual([300, 200, 100]);
  });

  it('sorts by revenue asc', () => {
    const result = sortCompanies([alpha, beta, gamma], 'revenue', 'asc');
    expect(result.map(c => c.revenue)).toEqual([100, 200, 300]);
  });

  it('sorts by profit including negative values desc', () => {
    const result = sortCompanies([alpha, beta, gamma], 'profit', 'desc');
    expect(result.map(c => c.profit)).toEqual([200, 50, -10]);
  });

  it('sorts by profit asc', () => {
    const result = sortCompanies([alpha, beta, gamma], 'profit', 'asc');
    expect(result.map(c => c.profit)).toEqual([-10, 50, 200]);
  });

  it('sorts by experience desc', () => {
    const result = sortCompanies([alpha, beta, gamma], 'experience', 'desc');
    expect(result.map(c => c.experience)).toEqual([15, 10, 5]);
  });

  it('sorts by rank asc', () => {
    const result = sortCompanies([gamma, alpha, beta], 'rank', 'asc');
    expect(result.map(c => c.rank)).toEqual([1, 2, 3]);
  });
});

describe('sortCompanies — name (alphabetical by display name)', () => {
  it('strips org-form prefix before comparing', () => {
    // display names: Альфа, Бета, Гамма — А < Б < Г
    const result = sortCompanies([gamma, alpha, beta], 'name', 'asc');
    expect(result.map(c => c.name)).toEqual([alpha.name, beta.name, gamma.name]);
  });

  it('sorts by name desc (Я → А)', () => {
    const result = sortCompanies([alpha, beta, gamma], 'name', 'desc');
    expect(result.map(c => c.name)).toEqual([gamma.name, beta.name, alpha.name]);
  });

  it('ignores case when comparing (sensitivity base)', () => {
    const lower = makeCompany({ name: 'ООО ПКО "альфа"' });
    const upper = makeCompany({ name: 'ООО ПКО "АЛЬФА"' });
    const other = makeCompany({ name: 'ООО ПКО "Бета"' });
    const result = sortCompanies([other, lower, upper], 'name', 'asc');
    // lower and upper are equal — both come before "Бета"
    expect(result[result.length - 1].name).toBe(other.name);
  });
});

describe('sortCompanies — immutability and edge cases', () => {
  it('does not mutate the original array', () => {
    const input = [beta, alpha, gamma];
    const original = [...input];
    sortCompanies(input, 'revenue', 'desc');
    expect(input).toEqual(original);
  });

  it('returns empty array for empty input', () => {
    expect(sortCompanies([], 'revenue', 'desc')).toEqual([]);
  });

  it('returns single-element array unchanged', () => {
    expect(sortCompanies([alpha], 'revenue', 'asc')).toEqual([alpha]);
  });

  it('preserves original order when all values are equal', () => {
    const a = makeCompany({ inn: '111', revenue: 100 });
    const b = makeCompany({ inn: '222', revenue: 100 });
    const c = makeCompany({ inn: '333', revenue: 100 });
    const result = sortCompanies([a, b, c], 'revenue', 'desc');
    // stable: equal elements keep input order
    expect(result.map(r => r.inn)).toEqual(['111', '222', '333']);
  });
});
