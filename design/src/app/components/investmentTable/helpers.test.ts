import { describe, expect, it } from 'vitest';
import { createInvestmentResolver } from './helpers';
import type { RatingCompany } from '../../data/ratingData';

function mkRow(name: string, rank: number, inn: string): RatingCompany {
  return {
    rank, name, inn,
    city: '', revenue: 0, profit: 0, yearChange: 0, growthRate: 0, experience: 0,
    capitalAttraction: 'none', napka: false,
    cost: 0, eqt: 0, dLong: 0, dShort: 0, de: 0, receivable: 0,
    cagr: 0, loan: 0, rankDelta: 0,
  };
}

const FIXTURES: RatingCompany[] = [
  mkRow('ПКБ',                          1, '1111111111'),
  mkRow('Национальная Фабрика Ипотеки', 7, '7706450420'),
  mkRow('АСВ',                          8, '7841019595'),
];

describe('createInvestmentResolver', () => {
  it('returns null for unknown company', () => {
    const r = createInvestmentResolver(FIXTURES);
    expect(r.getPkoRank('Totally Made Up Inc')).toBeNull();
    expect(r.getPkoInn('Totally Made Up Inc')).toBeNull();
  });

  it('resolves direct match by name', () => {
    const r = createInvestmentResolver(FIXTURES);
    expect(r.getPkoRank('ПКБ')).toBe(1);
    expect(r.getPkoInn('ПКБ')).toBe('1111111111');
  });

  it('resolves alias "Первое клиентское бюро" → ПКБ', () => {
    const r = createInvestmentResolver(FIXTURES);
    expect(r.getPkoInn('Первое клиентское бюро')).toBe('1111111111');
  });

  it('resolves alias "НФИ" → Национальная Фабрика Ипотеки', () => {
    const r = createInvestmentResolver(FIXTURES);
    expect(r.getPkoRank('НФИ')).toBe(7);
  });

  it('returns the same ИНН for alias and direct match', () => {
    const r = createInvestmentResolver(FIXTURES);
    expect(r.getPkoInn('Агентство Судебного Взыскания')).toBe(r.getPkoInn('АСВ'));
  });

  it('empty resolver returns null for everything', () => {
    const r = createInvestmentResolver([]);
    expect(r.getPkoRank('ПКБ')).toBeNull();
    expect(r.getPkoInn('ПКБ')).toBeNull();
  });
});
