import { describe, expect, it } from 'vitest';
import {
  createInvestmentResolver,
  matchesAllInvestmentSearch,
  matchesBondSearch,
  matchesCorporateSearch,
  matchesLoanSearch,
} from './helpers';
import type { RatingCompany } from '../../data/ratingData';
import type { AllInvestment, Bond, Corporate, SiteLoan } from '../../data/investmentData';

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

describe('investment table search', () => {
  const bond: Bond = {
    company: 'Первое клиентское бюро',
    rating: 'ruA- / A.ru',
    isin: 'RU000A108CC9',
    coupon: '14.1%',
    volume: 1668,
    platform: 'Мосбиржа',
    status: 'active',
    repayment: '23.04.2027',
  };

  const loan: SiteLoan = {
    company: 'М.Б.А. Финансы',
    type: 'Займы через сайт для физлиц',
    sites: ['mbafin.ru'],
  };

  const corporate: Corporate = {
    company: 'Феникс',
    founder: 'Т-Банк (Тинькофф)',
    structureType: 'Банк',
    details: 'Учредитель — банк',
  };

  const all: AllInvestment = {
    company: 'АйДи Коллект',
    type: 'bonds',
    details: 'ruBBB-',
    subDetails: '25.1% / 23.4% · 2 выпуска · 2 958 млн ₽',
  };

  it('matches bonds by company, isin and visible status label', () => {
    expect(matchesBondSearch(bond, 'бюро')).toBe(true);
    expect(matchesBondSearch(bond, 'A108CC9')).toBe(true);
    expect(matchesBondSearch(bond, 'в обращении')).toBe(true);
    expect(matchesBondSearch(bond, 'феникс')).toBe(false);
  });

  it('matches site loans by company, type and site', () => {
    expect(matchesLoanSearch(loan, 'финансы')).toBe(true);
    expect(matchesLoanSearch(loan, 'физлиц')).toBe(true);
    expect(matchesLoanSearch(loan, 'mbafin')).toBe(true);
    expect(matchesLoanSearch(loan, 'мосбиржа')).toBe(false);
  });

  it('matches corporate rows by founder and structure details', () => {
    expect(matchesCorporateSearch(corporate, 'тинькофф')).toBe(true);
    expect(matchesCorporateSearch(corporate, 'банк')).toBe(true);
    expect(matchesCorporateSearch(corporate, 'облигации')).toBe(false);
  });

  it('matches all-investments rows by visible type label and details', () => {
    expect(matchesAllInvestmentSearch(all, 'облигации')).toBe(true);
    expect(matchesAllInvestmentSearch(all, 'rubbb')).toBe(true);
    expect(matchesAllInvestmentSearch(all, 'коллект')).toBe(true);
    expect(matchesAllInvestmentSearch(all, 'займы')).toBe(false);
  });
});
