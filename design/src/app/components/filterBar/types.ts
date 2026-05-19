export type SortDirection = 'desc' | 'asc';
export type Preset = 'overview' | 'capital';

export interface RatingFilters {
  sortDir: SortDirection;
  napka: 'ignore' | 'yes' | 'no';
  experienceFrom: string;
  experienceTo: string;
  capitalPublic: boolean;
  capitalCorporate: boolean;
  capitalNone: boolean;
  revenueFrom: string;
  revenueTo: string;
  profitFrom: string;
  profitTo: string;
  deFrom: string;
  deTo: string;
  growthRateFrom: string;
  growthRateTo: string;
  cagrFrom: string;
  cagrTo: string;
}

export const EMPTY_FILTERS: RatingFilters = {
  sortDir: 'desc',
  napka: 'ignore',
  experienceFrom: '', experienceTo: '',
  capitalPublic: true, capitalCorporate: true, capitalNone: true,
  revenueFrom: '', revenueTo: '',
  profitFrom: '', profitTo: '',
  deFrom: '', deTo: '',
  growthRateFrom: '', growthRateTo: '',
  cagrFrom: '', cagrTo: '',
};

export function countActiveFilters(f: RatingFilters): number {
  let n = 0;
  if (f.sortDir !== 'desc') n++;
  if (f.napka !== 'ignore') n++;
  if (f.experienceFrom !== '' || f.experienceTo !== '') n++;
  if (f.revenueFrom !== '' || f.revenueTo !== '') n++;
  if (f.profitFrom !== '' || f.profitTo !== '') n++;
  if (f.cagrFrom !== '' || f.cagrTo !== '') n++;
  if (f.growthRateFrom !== '' || f.growthRateTo !== '') n++;
  if (f.deFrom !== '' || f.deTo !== '') n++;
  return n;
}
