import type { RatingCompany } from '../data/ratingData';
import type { RatingFilters } from '../components/filterBar';
import type { ExtraColumn } from '../components/ratingTable';

// CAGR stored as fraction (0.33 = 33%); user enters %.
const CAGR_DISPLAY_FACTOR = 100;

function matchesSearch(c: RatingCompany, query: string): boolean {
  if (query === '') return true;
  return c.name.toLowerCase().includes(query) || c.inn.includes(query);
}

function matchesNapka(c: RatingCompany, mode: RatingFilters['napka']): boolean {
  if (mode === 'ignore') return true;
  if (mode === 'yes')    return c.napka === true;
  return c.napka === false;
}

function matchesCapital(c: RatingCompany, f: RatingFilters): boolean {
  const all = f.capitalPublic && f.capitalCorporate && f.capitalNone;
  if (all) return true;
  if (c.capitalAttraction === 'public')    return f.capitalPublic;
  if (c.capitalAttraction === 'corporate') return f.capitalCorporate;
  return f.capitalNone;
}

function inRange(value: number, from: string, to: string): boolean {
  if (from !== '' && value < Number(from)) return false;
  if (to   !== '' && value > Number(to))   return false;
  return true;
}

export function applyFilters(
  rows: RatingCompany[],
  searchQuery: string,
  f: RatingFilters,
): RatingCompany[] {
  const query = searchQuery.toLowerCase();

  const filtered = rows.filter(c =>
    matchesSearch(c, query) &&
    matchesNapka(c, f.napka) &&
    matchesCapital(c, f) &&
    inRange(c.experience, f.experienceFrom, f.experienceTo) &&
    inRange(c.revenue,    f.revenueFrom,    f.revenueTo)    &&
    inRange(c.profit,     f.profitFrom,     f.profitTo)     &&
    inRange(c.de,         f.deFrom,         f.deTo)         &&
    inRange(c.growthRate, f.growthRateFrom, f.growthRateTo) &&
    inRange(c.cagr * CAGR_DISPLAY_FACTOR, f.cagrFrom, f.cagrTo)
  );

  return [...filtered].sort((a, b) =>
    f.sortDir === 'desc' ? a.rank - b.rank : b.rank - a.rank
  );
}

export function buildExtraColumns(f: RatingFilters): ExtraColumn[] {
  const cols: ExtraColumn[] = [];
  if (f.deFrom !== '' || f.deTo !== '') {
    cols.push({ key: 'de', header: 'D/E', format: c => c.de.toFixed(2) });
  }
  if (f.growthRateFrom !== '' || f.growthRateTo !== '') {
    cols.push({
      key: 'growthRate',
      header: 'Рост фин. акт., %',
      format: c => `${Number(c.growthRate.toFixed(1)).toLocaleString('ru-RU')}%`,
    });
  }
  if (f.cagrFrom !== '' || f.cagrTo !== '') {
    cols.push({
      key: 'cagr',
      header: 'CAGR 5 лет, %',
      format: c => `${Number((c.cagr * 100).toFixed(1)).toLocaleString('ru-RU')}%`,
    });
  }
  return cols;
}
