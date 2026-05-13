import { Building2 } from 'lucide-react';
import type { RatingCompany } from '../../data/ratingData';
import type { CompanyDetails } from '../../data/companyDetails';
import { fmtMoney } from './helpers';
import s from './CompanyCard.module.css';

const DONUT_SIZE = 160;
const STROKE = 20;
const RADIUS = (DONUT_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface CapitalStructureSectionProps {
  company: RatingCompany;
  details: CompanyDetails;
}

// Use ratingData (ФНС) — reliable for all 545 companies.
// companyDetails.capitalStructure has zeros for ~63% of companies.
export function CapitalStructureSection({ company, details }: CapitalStructureSectionProps) {
  const equity = company.eqt;
  const debt = company.loan;
  const deRatio = company.de;
  const authorizedCapital = details.capitalStructure.authorizedCapital;
  const total = equity + debt;
  const eqPct = total > 0 ? (equity / total) * 100 : 0;
  const debtPct = total > 0 ? (debt / total) * 100 : 0;

  const debtArc = (debtPct / 100) * CIRCUMFERENCE;
  const eqArc = (eqPct / 100) * CIRCUMFERENCE;
  const center = DONUT_SIZE / 2;

  return (
    <div className={`${s.card} ${s.capCard}`}>
      <div className={s.sectionHead}>
        <Building2 style={{ width: '16px', height: '16px', color: 'var(--color-accent)' }} />
        <span className={s.sectionTitle}>Структура капитала</span>
      </div>

      <div className={s.donutBox}>
        <svg width={DONUT_SIZE} height={DONUT_SIZE} viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}>
          <circle cx={center} cy={center} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={STROKE} />
          <circle
            cx={center} cy={center} r={RADIUS} fill="none"
            stroke="#3b82f6" strokeWidth={STROKE}
            strokeDasharray={`${debtArc} ${CIRCUMFERENCE - debtArc}`}
            strokeDashoffset={CIRCUMFERENCE * 0.25}
            strokeLinecap="round"
          />
          <circle
            cx={center} cy={center} r={RADIUS} fill="none"
            stroke="#22c55e" strokeWidth={STROKE}
            strokeDasharray={`${eqArc} ${CIRCUMFERENCE - eqArc}`}
            strokeDashoffset={CIRCUMFERENCE * 0.25 - debtArc}
            strokeLinecap="round"
          />
        </svg>
        <div className={s.donutCenter}>
          <div className={s.donutCenterValue}>{deRatio.toFixed(2)}</div>
          <div className={s.donutCenterLabel}>D / E</div>
        </div>
      </div>

      <div className={s.donutLegend}>
        <span className={s.donutLegendItem}>
          <span className={s.donutSwatch} style={{ background: '#3b82f6' }} />
          Заёмный {Math.round(debtPct)}%
        </span>
        <span className={s.donutLegendItem}>
          <span className={s.donutSwatch} style={{ background: '#22c55e' }} />
          Собств. {Math.round(eqPct)}%
        </span>
      </div>

      <div className={s.capMetrics}>
        {[
          { label: 'Собственный капитал', value: equity },
          { label: 'Заёмный капитал',     value: debt },
          { label: 'D/E ratio',           value: deRatio, raw: true },
          { label: 'Уставной капитал',    value: authorizedCapital },
        ].map(({ label, value, raw }) => (
          <div key={label} className={s.capRow}>
            <span className={s.capLabel}>{label}</span>
            <span className={`${s.capValue} ${label === 'D/E ratio' ? s.capValueAccent : ''}`}>
              {raw ? value.toFixed(2) : `${fmtMoney(value)} ₽`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
