import { describe, expect, it } from 'vitest';
import { EMPTY_FILTERS, countActiveFilters, type RatingFilters } from './types';

function withOverride(patch: Partial<RatingFilters>): RatingFilters {
  return { ...EMPTY_FILTERS, ...patch };
}

describe('countActiveFilters', () => {
  it('returns 0 for default filters', () => {
    expect(countActiveFilters(EMPTY_FILTERS)).toBe(0);
  });

  it('counts non-desc sort', () => {
    expect(countActiveFilters(withOverride({ sortDir: 'asc' }))).toBe(1);
  });

  it('counts napka != ignore', () => {
    expect(countActiveFilters(withOverride({ napka: 'yes' }))).toBe(1);
    expect(countActiveFilters(withOverride({ napka: 'no' }))).toBe(1);
  });

  it('counts a single experience bound', () => {
    expect(countActiveFilters(withOverride({ experienceFrom: '5' }))).toBe(1);
    expect(countActiveFilters(withOverride({ experienceTo: '10' }))).toBe(1);
  });

  it('counts experience range as one filter, not two', () => {
    expect(countActiveFilters(withOverride({ experienceFrom: '5', experienceTo: '10' }))).toBe(1);
  });

  it('counts multiple filters independently', () => {
    expect(countActiveFilters(withOverride({
      sortDir: 'asc',
      napka: 'yes',
      revenueFrom: '1000',
      deTo: '0.5',
    }))).toBe(4);
  });

  it('does not count empty strings', () => {
    expect(countActiveFilters(withOverride({ revenueFrom: '', revenueTo: '' }))).toBe(0);
  });
});
