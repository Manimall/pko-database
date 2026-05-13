// Company-card types. Data lives at /public/data/company-details.json
// and is loaded at runtime via loader.ts (loadCompanyDetails).

export interface YearlyFinancials {
  year: number;
  revenue: number;
  cost: number;
  profit: number;
  assets: number;
  receivable: number;
}

export interface CapitalStructure {
  equity: number;
  debt: number;
  deRatio: number;
  authorizedCapital: number;
  debtShare: number;
  equityShare: number;
  totalAssets: number;
}

export interface FundraisingInfo {
  type: string;
  status: string;
  details: string;
  founder: string;
}

export interface BondInfo {
  rating: string;
  isin: string;
  volume: number;
  coupon: string;
  maturity: string;
  status: string;
  ticker: string;
}

export interface CompanyDetails {
  inn: string;
  fullName: string;
  director: string;
  ogrn: string;
  registrationDate: string;
  website: string;
  region: string;
  address: string;
  authorizedCapital: number;
  revenue2025: number;
  otherIncome2025: number;
  revenue2024: number;
  otherIncome2024: number;
  financials: YearlyFinancials[];
  capitalStructure: CapitalStructure;
  fundraising: FundraisingInfo | null;
  bonds: BondInfo[] | null;
}
