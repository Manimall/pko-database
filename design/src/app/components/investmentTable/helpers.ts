import { ratingData } from '../../data/ratingData';

const rankByName = new Map<string, number>();
const innByName = new Map<string, string>();
for (const c of ratingData) {
  if (!rankByName.has(c.name)) rankByName.set(c.name, c.rank);
  if (!innByName.has(c.name)) innByName.set(c.name, c.inn);
}

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

function resolveCompanyName(companyName: string): string | null {
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

export function getPkoRank(companyName: string): number | null {
  const resolved = resolveCompanyName(companyName);
  return resolved ? rankByName.get(resolved)! : null;
}

export function getPkoInn(companyName: string): string | null {
  const resolved = resolveCompanyName(companyName);
  return resolved ? innByName.get(resolved) ?? null : null;
}
