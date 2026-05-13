// Rating-row type. Data lives at /public/data/rating.json and is loaded
// at runtime via loader.ts (loadRatingData). The JSON file is regenerated
// by scripts/update_data.py.

export interface RatingCompany {
  rank: number;
  name: string;
  inn: string;
  city: string;       // Город регистрации
  revenue: number;    // Совокупный доход 2025 (выручка + прочие), тыс руб
  profit: number;     // Чистая прибыль 2025, тыс руб
  yearChange: number; // Δ к 2024 (%)
  growthRate: number; // Рост фин активов за 5 лет (%)
  experience: number; // Стаж (лет)
  capitalAttraction: 'public' | 'corporate' | 'none';
  napka: boolean;
  cost: number;        // Расходы 2025, тыс руб
  eqt: number;         // Собственный капитал, тыс руб
  dLong: number;       // Долгосрочные обязательства, тыс руб
  dShort: number;      // Краткосрочные обязательства, тыс руб
  de: number;          // D/E коэффициент
  receivable: number;  // Дебиторская задолженность, тыс руб
  cagr: number;        // CAGR выручки 5 лет (доля)
  loan: number;        // Заёмный капитал, тыс руб
  rankDelta: number;   // Изменение позиции в рейтинге YoY
}
