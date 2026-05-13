import type { RatingCompany } from '../data/ratingData';

export type MetricDef = {
  label: string;
  key: string;
  format: (c: RatingCompany) => string;
  getValue: (c: RatingCompany) => number;
  /** true = higher is better, false = lower is better, null = no highlighting */
  higherIsBetter: boolean | null;
};

const fmtNum = (n: number) => Math.abs(n).toLocaleString('ru-RU');

export const COMPARE_METRICS: MetricDef[] = [
  { label: 'Ранг', key: 'rank', format: c => `#${c.rank}`, getValue: c => c.rank, higherIsBetter: false },
  {
    label: 'Изм. ранга (YoY)',
    key: 'rankDelta',
    format: c => c.rankDelta > 0 ? `↑ ${c.rankDelta}` : c.rankDelta < 0 ? `↓ ${Math.abs(c.rankDelta)}` : '—',
    getValue: c => c.rankDelta,
    higherIsBetter: true,
  },
  { label: 'Стаж, лет', key: 'experience', format: c => String(c.experience), getValue: c => c.experience, higherIsBetter: true },
  { label: 'НАПКА', key: 'napka', format: c => c.napka ? 'Да' : 'Нет', getValue: c => c.napka ? 1 : 0, higherIsBetter: null },
  { label: 'Выручка + пр. доходы, тыс ₽', key: 'revenue', format: c => fmtNum(c.revenue), getValue: c => c.revenue, higherIsBetter: true },
  {
    label: 'Чистая прибыль, тыс ₽',
    key: 'profit',
    format: c => c.profit < 0 ? `−${fmtNum(c.profit)}` : fmtNum(c.profit),
    getValue: c => c.profit,
    higherIsBetter: true,
  },
  { label: 'Расходы, тыс ₽', key: 'cost', format: c => fmtNum(c.cost), getValue: c => c.cost, higherIsBetter: false },
  {
    label: 'Изм. к 2023, %',
    key: 'yearChange',
    format: c => c.yearChange > 0 ? `+${c.yearChange.toFixed(1)}%` : `${c.yearChange.toFixed(1)}%`,
    getValue: c => c.yearChange,
    higherIsBetter: true,
  },
  { label: 'D/E', key: 'de', format: c => c.de.toFixed(2), getValue: c => c.de, higherIsBetter: false },
  { label: 'Рост фин. активов, %', key: 'growthRate', format: c => `${c.growthRate.toFixed(1)}%`, getValue: c => c.growthRate, higherIsBetter: true },
  { label: 'CAGR за 5 лет, %', key: 'cagr', format: c => `${(c.cagr * 100).toFixed(1)}%`, getValue: c => c.cagr, higherIsBetter: true },
  {
    label: 'Привлечение капитала',
    key: 'capitalAttraction',
    format: c => c.capitalAttraction === 'public' ? 'Публичный'
              : c.capitalAttraction === 'corporate' ? 'Корпоративный'
              : 'Нет',
    getValue: () => 0,
    higherIsBetter: null,
  },
];

export function getBestIdx(metric: MetricDef, companies: RatingCompany[]): number | null {
  if (metric.higherIsBetter === null) return null;
  const values = companies.map(c => metric.getValue(c));
  return values.indexOf(metric.higherIsBetter ? Math.max(...values) : Math.min(...values));
}
