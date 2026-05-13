import { BarChart3 } from 'lucide-react';
import type { RatingCompany } from '../../data/ratingData';
import type { CompanyDetails } from '../../data/companyDetails';
import { fmtMoney, fmtPct, DATA_YEAR_2024_OVERRIDE } from './helpers';
import s from './CompanyCard.module.css';

interface FinancialsSectionProps {
  company: RatingCompany;
  details: CompanyDetails;
}

interface Row {
  label: string;
  value: number;
  prev: number | null;
  dot: string;
}

function buildRows(company: RatingCompany, details: CompanyDetails): Row[] {
  const fin2024 = details.financials.find(f => f.year === 2024);
  const fin2025 = details.financials.find(f => f.year === 2025);
  return [
    { label: 'Выручка',        value: details.revenue2025,     prev: details.revenue2024,         dot: '#0DF0E6' },
    { label: 'Прочие доходы',  value: details.otherIncome2025, prev: details.otherIncome2024,     dot: '#6366f1' },
    { label: 'Расходы',        value: company.cost,            prev: fin2024?.cost ?? null,       dot: '#3b82f6' },
    { label: 'Чистая прибыль', value: company.profit,          prev: fin2024?.profit ?? null,     dot: '#22c55e' },
    { label: 'Фин. вложения',  value: fin2025?.assets ?? 0,    prev: fin2024?.assets ?? null,     dot: '#f59e0b' },
    { label: 'Дебит. задолж.', value: company.receivable,      prev: fin2024?.receivable ?? null, dot: '#f97316' },
  ];
}

export function FinancialsSection({ company, details }: FinancialsSectionProps) {
  const useY2024 = DATA_YEAR_2024_OVERRIDE.has(company.inn);
  const dataYear = useY2024 ? 2024 : 2025;
  const rows = buildRows(company, details);

  return (
    <div className={s.card}>
      <div className={s.sectionHead}>
        <BarChart3 style={{ width: '16px', height: '16px', color: 'var(--color-accent)' }} />
        <span className={s.sectionTitle}>Финансовые показатели ({dataYear})</span>
      </div>

      {useY2024 && (
        <div className={s.financialNotice}>
          ⚠ Отображаются данные за <b>2024 год</b>: в отчётности компании за 2025 произошёл
          бухгалтерский сбой (аномальный скачок прочих доходов до 17,7 млрд ₽). До исправления
          источника используем последние корректные значения.
        </div>
      )}

      <div className={s.tableHeader}>
        <span>Показать</span>
        <div className={s.metricValueGroup}>
          <span>{dataYear} год</span>
          <span>YoY</span>
        </div>
      </div>

      {rows.map(({ label, value, prev, dot }) => {
        const yoy = prev !== null ? fmtPct(value, prev) : null;
        return (
          <div key={label} className={s.metricRow}>
            <div className={s.metricLabel}>
              <div className={s.metricDot} style={{ background: dot }} />
              <span>{label}</span>
            </div>
            <div className={s.metricValueGroup}>
              <span className={s.metricValue}>{fmtMoney(value)} ₽</span>
              <span className={s.metricYoy} style={yoy ? { color: yoy.color } : undefined}>
                {yoy ? yoy.text : '—'}
              </span>
            </div>
          </div>
        );
      })}

      <div className={s.growthRow}>
        <span className={s.growthLabel}>Темп роста объема фин. активов за 5 лет</span>
        <span
          className={s.growthValue}
          style={{ color: company.growthRate >= 0 ? 'var(--color-accent)' : 'var(--color-danger)' }}
        >
          +{company.growthRate}%
        </span>
      </div>
    </div>
  );
}
