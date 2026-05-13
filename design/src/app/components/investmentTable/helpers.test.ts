import { describe, expect, it } from 'vitest';
import { getPkoRank, getPkoInn } from './helpers';

// These tests use real ratingData, since the helpers are tightly coupled to it.
// They verify the alias-resolution + fuzzy-match logic, which is the actual
// business logic worth covering.

describe('getPkoRank', () => {
  it('returns null for unknown company', () => {
    expect(getPkoRank('Totally Made Up Inc')).toBeNull();
  });

  it('returns a positive rank for a known alias', () => {
    // НФИ → Национальная Фабрика Ипотеки → exists in ratingData
    const rank = getPkoRank('НФИ');
    expect(rank).toBeTypeOf('number');
    expect(rank!).toBeGreaterThan(0);
  });

  it('returns a positive rank for "Первое клиентское бюро" alias (→ ПКБ)', () => {
    const rank = getPkoRank('Первое клиентское бюро');
    expect(rank).toBeTypeOf('number');
    expect(rank!).toBeGreaterThan(0);
  });
});

describe('getPkoInn', () => {
  it('returns null for unknown company', () => {
    expect(getPkoInn('Totally Made Up Inc')).toBeNull();
  });

  it('returns a numeric ИНН string for a known alias', () => {
    const inn = getPkoInn('НФИ');
    expect(inn).toBeTypeOf('string');
    // ИНН is 10 or 12 digits
    expect(inn!).toMatch(/^\d{10,12}$/);
  });

  it('returns the same ИНН for alias and resolved name', () => {
    // Both 'Первое клиентское бюро' (alias) and 'ПКБ' (direct match) should resolve
    // to the same company via fuzzy match in ratingData.
    const aliasInn = getPkoInn('Первое клиентское бюро');
    const directInn = getPkoInn('ПКБ');
    expect(aliasInn).not.toBeNull();
    expect(aliasInn).toBe(directInn);
  });
});
