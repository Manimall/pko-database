import { useMemo } from 'react';
import { URLS, loadRatingData } from '../../data/loader';
import { useAsyncData } from '../../data/useAsyncData';
import type { RatingCompany } from '../../data/ratingData';
import type { AllInvestment, Bond, Corporate, SiteLoan } from '../../data/investmentData';
import { stripOrgForm } from '../../utils/formatCompanyName';

const ALIASES: Record<string, string> = {
  'НФИ': 'Национальная Фабрика Ипотеки',
  'Воксис': 'ПКО ВОКСИС',
  'Первое клиентское бюро': 'ПКБ',
  'Агентство Судебного Взыскания': 'АСВ',
  'Служба защиты активов': 'СЗА',
  'Юридическая служба взыскания': 'ЮСВ',
  'АктивБизнесКонсалт': 'АБК',
  'Столичная Сервисная Компания': 'Столичное АВД',
  'Сентинел (СКМ)': 'СКМ',
  'Региональная Служба Взыскания': 'РСВ',
  'Кредитор': 'ООО "ПКО "КРЕДИТОР"',
};

export interface InvestmentResolver {
  getPkoRank: (companyName: string) => number | null;
  getPkoInn:  (companyName: string) => string | null;
}

/**
 * Pure factory: builds name → rank / name → ИНН lookups with alias resolution
 * and fuzzy fallback. Easy to unit-test in isolation from React/loaders.
 */
export function createInvestmentResolver(rows: readonly RatingCompany[]): InvestmentResolver {
  const rankByName = new Map<string, number>();
  const innByName  = new Map<string, string>();
  for (const c of rows) {
    if (!rankByName.has(c.name)) rankByName.set(c.name, c.rank);
    if (!innByName.has(c.name))  innByName.set(c.name, c.inn);
  }

  function resolve(companyName: string): string | null {
    if (rankByName.has(companyName)) return companyName;
    const alias = ALIASES[companyName];
    if (alias && rankByName.has(alias)) return alias;
    const lower = companyName.toLowerCase();
    const aliasLower = alias?.toLowerCase();
    for (const [name] of rankByName) {
      const nameLower = name.toLowerCase();
      if (nameLower.includes(lower) || lower.includes(nameLower)) return name;
      if (aliasLower && (nameLower.includes(aliasLower) || aliasLower.includes(nameLower))) return name;
    }
    return null;
  }

  return {
    getPkoRank: name => {
      const resolved = resolve(name);
      return resolved ? rankByName.get(resolved)! : null;
    },
    getPkoInn: name => {
      const resolved = resolve(name);
      return resolved ? innByName.get(resolved) ?? null : null;
    },
  };
}

const EMPTY_RESOLVER: InvestmentResolver = createInvestmentResolver([]);

/** React hook: loads ratingData and memoises the resolver. */
export function useInvestmentResolver(): InvestmentResolver {
  const { data } = useAsyncData<RatingCompany[]>(URLS.rating, loadRatingData);
  return useMemo(() => data ? createInvestmentResolver(data) : EMPTY_RESOLVER, [data]);
}

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

function includesQuery(value: string | number | null | undefined, query: string): boolean {
  if (value == null) return false;
  return String(value).toLowerCase().includes(query);
}

function matchesCompany(company: string, query: string): boolean {
  return includesQuery(company, query) || includesQuery(stripOrgForm(company), query);
}

const BOND_STATUS_LABEL: Record<Bond['status'], string> = {
  active: 'В обращении',
  placing: 'Размещение',
};

const INVESTMENT_TYPE_LABEL: Record<AllInvestment['type'], string> = {
  bonds: 'Облигации',
  'site-loan': 'Займы',
  corporate: 'Корпоративное',
};

export function matchesBondSearch(row: Bond, searchQuery: string): boolean {
  const query = normalizeSearch(searchQuery);
  if (!query) return true;
  return (
    matchesCompany(row.company, query) ||
    includesQuery(row.rating, query) ||
    includesQuery(row.isin, query) ||
    includesQuery(row.coupon, query) ||
    includesQuery(row.volume, query) ||
    includesQuery(row.platform, query) ||
    includesQuery(row.repayment, query) ||
    includesQuery(row.status, query) ||
    includesQuery(BOND_STATUS_LABEL[row.status], query)
  );
}

export function matchesLoanSearch(row: SiteLoan, searchQuery: string): boolean {
  const query = normalizeSearch(searchQuery);
  if (!query) return true;
  return (
    matchesCompany(row.company, query) ||
    includesQuery(row.type, query) ||
    row.sites.some(site => includesQuery(site, query))
  );
}

export function matchesCorporateSearch(row: Corporate, searchQuery: string): boolean {
  const query = normalizeSearch(searchQuery);
  if (!query) return true;
  return (
    matchesCompany(row.company, query) ||
    includesQuery(row.founder, query) ||
    includesQuery(row.structureType, query) ||
    includesQuery(row.details, query)
  );
}

export function matchesAllInvestmentSearch(row: AllInvestment, searchQuery: string): boolean {
  const query = normalizeSearch(searchQuery);
  if (!query) return true;
  return (
    matchesCompany(row.company, query) ||
    includesQuery(row.type, query) ||
    includesQuery(INVESTMENT_TYPE_LABEL[row.type], query) ||
    includesQuery(row.details, query) ||
    includesQuery(row.subDetails, query)
  );
}
