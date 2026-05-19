// Investment types. Data lives at /public/data/investment-*.json
// and is loaded at runtime via loader.ts.

export interface Bond {
  company: string;
  rating: string;
  isin: string;
  coupon: string;
  volume: number | null; // млн ₽, null = нет данных
  platform: string;
  status: 'active' | 'placing';
  repayment: string;
}

export interface SiteLoan {
  company: string;
  type: string;
  sites: string[];
}

export type CorporateType =
  | 'Банк'
  | 'Иностранный холдинг'
  | 'Секьюритизация'
  | 'ЗПИФ'
  | 'Иностранная компания'
  | 'Финтех-группа'
  | 'Контакт-центр/холдинг';

export interface Corporate {
  company: string;
  founder: string;
  structureType: CorporateType;
  details: string;
}

export interface AllInvestment {
  company: string;
  type: 'bonds' | 'site-loan' | 'corporate';
  details: string;
  subDetails?: string;
}
