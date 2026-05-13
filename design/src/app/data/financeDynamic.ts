// Finance-chart types. Data lives at /public/data/finance-dynamic.json
// and is loaded at runtime via loader.ts (loadFinanceDynamic).

export const FINANCE_YEARS = [2021, 2022, 2023, 2024, 2025] as const;
export type FinanceYearType = typeof FINANCE_YEARS[number];

export interface FinanceDynamic {
  rank: number;
  name: string;
  inn: string;
  income: number[];     // Выручка + пр. доходы, тыс руб
  cost: number[];       // Расходы, тыс руб
  profit: number[];     // Чистая прибыль, тыс руб
  receivable: number[]; // Дебиторская задолженность, тыс руб
}
