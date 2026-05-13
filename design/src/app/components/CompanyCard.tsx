import { useState } from 'react';
import {
  ArrowLeft, ArrowUp, ArrowDown, ExternalLink, TrendingUp, BarChart3, Building2, Banknote, Link2, Pencil,
} from 'lucide-react';
import { RatingCompany } from '../data/ratingData';
import { CompanyDetails } from '../data/companyDetails';
import { logoMap } from '../data/logoMap';
import { useIsMobile } from '../shared/hooks/useIsMobile';
import { stripOrgForm } from '../utils/formatCompanyName';
import { fmtMoney, fmtMoneyTable, fmtPct, DATA_YEAR_2024_OVERRIDE } from './companyCardHelpers';
import s from './CompanyCard.module.css';

interface CompanyCardProps {
  company: RatingCompany;
  details: CompanyDetails;
  onBack: () => void;
}

export function CompanyCard({ company, details, onBack }: CompanyCardProps) {
  const logoFile = logoMap[company.inn];

  return (
    <div className={s.root}>
      <button type="button" className={s.backLink} onClick={onBack}>
        <ArrowLeft style={{ width: '16px', height: '16px' }} />
        Назад к рейтингу
      </button>

      <HeaderSection company={company} details={details} logoFile={logoFile} />

      <div className={s.gridTwoCol}>
        <FinancialsSection company={company} details={details} />
        <CapitalStructureSection company={company} details={details} />
      </div>

      <div className={s.gridTwoCol}>
        <DynamicsSection details={details} />
        <FundraisingSidebar details={details} />
      </div>
    </div>
  );
}

// ── Header ──────────────────────────────────────────────────────

function HeaderSection({
  company, details, logoFile,
}: {
  company: RatingCompany;
  details: CompanyDetails;
  logoFile?: string;
}) {
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?company=${company.inn}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const handleEdit = () => {
    const subject = encodeURIComponent(`Правка карточки: ${company.name} (ИНН ${company.inn})`);
    window.open(`mailto:redchief@rvzrus.ru?subject=${subject}`, '_self');
  };

  return (
    <div className={`${s.card} ${s.headerCard}`}>
      <div className={s.headerLogo}>
        {logoFile
          ? <img src={`/logos/${logoFile}`} alt="" decoding="async" />
          : <span className={s.headerLogoLetter}>{stripOrgForm(company.name)[0]}</span>}
      </div>

      <div className={s.headerInfo}>
        <div className={s.headerTitleRow}>
          <span className={s.companyName}>{stripOrgForm(company.name)}</span>
          <span className={s.rankBadge}>#{company.rank}</span>
          {company.rankDelta !== 0 && (
            <span className={company.rankDelta > 0 ? s.deltaPos : s.deltaNeg}>
              {company.rankDelta > 0
                ? <ArrowUp   style={{ width: '12px', height: '12px' }} />
                : <ArrowDown style={{ width: '12px', height: '12px' }} />}
              {Math.abs(company.rankDelta)}
            </span>
          )}
          {company.napka && <span className={s.napkaBadge}>НАПКА</span>}
        </div>

        <div className={s.fullName}>{details.fullName}</div>

        {details.director && (
          <div className={s.director}>
            <span className={s.directorLabel}>Генеральный директор:</span>{' '}
            <span style={{ fontWeight: 500 }}>{details.director}</span>
          </div>
        )}

        <div className={s.metaRow}>
          <span>ИНН: <span className={s.metaValue}>{company.inn}</span></span>
          {details.ogrn             && <span>ОГРН: <span className={s.metaValue}>{details.ogrn}</span></span>}
          {details.registrationDate && <span>Рег.: <span className={s.metaValue}>{details.registrationDate}</span></span>}
          <span>{company.city}</span>
          {details.website && (
            <a
              className={s.metaLink}
              href={`https://${details.website}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {details.website} <ExternalLink style={{ width: '11px', height: '11px' }} />
            </a>
          )}
        </div>
      </div>

      <div className={s.actions}>
        <button
          type="button"
          className={`${s.actionBtn} ${linkCopied ? s.actionBtnActive : ''}`}
          onClick={handleCopyLink}
          title="Скопировать ссылку"
        >
          <Link2 style={{ width: '14px', height: '14px' }} />
          {linkCopied ? 'Скопировано' : 'Ссылка'}
        </button>
        <button
          type="button"
          className={s.actionBtn}
          onClick={handleEdit}
          title="Написать об ошибке в карточке"
        >
          <Pencil style={{ width: '13px', height: '13px' }} />
          Править
        </button>
      </div>
    </div>
  );
}

// ── Financials ──────────────────────────────────────────────────

function FinancialsSection({ company, details }: { company: RatingCompany; details: CompanyDetails }) {
  const fin2024 = details.financials.find(f => f.year === 2024);
  const fin2025 = details.financials.find(f => f.year === 2025);
  const useY2024 = DATA_YEAR_2024_OVERRIDE.has(company.inn);
  const dataYear = useY2024 ? 2024 : 2025;

  const rows: { label: string; value: number; prev: number | null; dot: string }[] = [
    { label: 'Выручка',          value: details.revenue2025,     prev: details.revenue2024,        dot: '#0DF0E6' },
    { label: 'Прочие доходы',    value: details.otherIncome2025, prev: details.otherIncome2024,    dot: '#6366f1' },
    { label: 'Расходы',          value: company.cost,            prev: fin2024?.cost ?? null,      dot: '#3b82f6' },
    { label: 'Чистая прибыль',   value: company.profit,          prev: fin2024?.profit ?? null,    dot: '#22c55e' },
    { label: 'Фин. вложения',    value: fin2025?.assets ?? 0,    prev: fin2024?.assets ?? null,    dot: '#f59e0b' },
    { label: 'Дебит. задолж.',   value: company.receivable,      prev: fin2024?.receivable ?? null, dot: '#f97316' },
  ];

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

// ── Capital structure ───────────────────────────────────────────

function CapitalStructureSection({ company, details }: { company: RatingCompany; details: CompanyDetails }) {
  // Use ratingData (ФНС) — reliable for all 545 companies.
  // companyDetails.capitalStructure has zeros for ~63% of companies.
  const equity = company.eqt;
  const debt = company.loan;
  const deRatio = company.de;
  const authorizedCapital = details.capitalStructure.authorizedCapital;
  const total = equity + debt;
  const eqPct = total > 0 ? (equity / total) * 100 : 0;
  const debtPct = total > 0 ? (debt / total) * 100 : 0;

  const size = 160;
  const stroke = 20;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const debtArc = (debtPct / 100) * circumference;
  const eqArc = (eqPct / 100) * circumference;

  return (
    <div className={`${s.card} ${s.capCard}`}>
      <div className={s.sectionHead}>
        <Building2 style={{ width: '16px', height: '16px', color: 'var(--color-accent)' }} />
        <span className={s.sectionTitle}>Структура капитала</span>
      </div>

      <div className={s.donutBox}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          <circle
            cx={size/2} cy={size/2} r={radius} fill="none"
            stroke="#3b82f6" strokeWidth={stroke}
            strokeDasharray={`${debtArc} ${circumference - debtArc}`}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
          />
          <circle
            cx={size/2} cy={size/2} r={radius} fill="none"
            stroke="#22c55e" strokeWidth={stroke}
            strokeDasharray={`${eqArc} ${circumference - eqArc}`}
            strokeDashoffset={circumference * 0.25 - debtArc}
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

// ── Dynamics chart ──────────────────────────────────────────────

const CHART_METRICS = [
  { key: 'revenue'    as const, label: 'Выручка',        color: '#0DF0E6' },
  { key: 'cost'       as const, label: 'Расходы',        color: '#3b82f6' },
  { key: 'profit'     as const, label: 'Чистая прибыль', color: '#22c55e' },
  { key: 'assets'     as const, label: 'Вложения',       color: '#f59e0b' },
  { key: 'receivable' as const, label: 'Дебиторка',      color: '#ec4899' },
];

function DynamicsSection({ details }: { details: CompanyDetails }) {
  const isMobile = useIsMobile();
  const [activeMetrics, setActiveMetrics] = useState<Set<string>>(
    new Set(CHART_METRICS.map(m => m.key))
  );
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const fins = details.financials
    .filter(f => f.year >= 2021 && f.year <= 2025)
    .sort((a, b) => a.year - b.year);

  if (fins.length === 0) return null;

  const toggleMetric = (key: string) => {
    setActiveMetrics(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const activeKeys = CHART_METRICS.filter(m => activeMetrics.has(m.key));
  let maxVal = 0;
  for (const f of fins) {
    for (const m of activeKeys) {
      if (f[m.key] > maxVal) maxVal = f[m.key];
    }
  }
  if (maxVal === 0) maxVal = 1;

  const W = 700, H = 280;
  const PAD_L = 80, PAD_R = 20, PAD_T = 20, PAD_B = 30;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const xStep = fins.length > 1 ? chartW / (fins.length - 1) : 0;
  const getX = (i: number) => PAD_L + i * xStep;
  const getY = (v: number) => PAD_T + chartH - (v / maxVal) * chartH;

  const yTicks = 5;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => (maxVal / yTicks) * i);

  return (
    <div className={s.card}>
      <div className={s.sectionHead}>
        <TrendingUp style={{ width: '16px', height: '16px', color: 'var(--color-accent)' }} />
        <span className={s.sectionTitle}>Динамика за 5 лет</span>
      </div>

      <div className={s.metricTabs}>
        {CHART_METRICS.map(m => {
          const active = activeMetrics.has(m.key);
          return (
            <button
              key={m.key}
              type="button"
              className={s.metricTab}
              onClick={() => toggleMetric(m.key)}
              style={
                active
                  ? { background: m.color, color: 'var(--bg-base)' }
                  : undefined
              }
            >
              {m.label}
            </button>
          );
        })}
      </div>

      <div className={s.chartBox}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ display: 'block', width: '100%', height: 'auto' }}
          onMouseLeave={() => setHoverIdx(null)}
        >
          {yLabels.map((v, i) => (
            <g key={i}>
              <line x1={PAD_L} y1={getY(v)} x2={W - PAD_R} y2={getY(v)} stroke="rgba(255,255,255,0.06)" />
              <text
                x={PAD_L - 8} y={getY(v) + 4} textAnchor="end"
                fill="rgba(255,255,255,0.4)" fontSize="10"
                fontFamily="'Space Grotesk', sans-serif"
              >
                {fmtMoneyTable(v)}
              </text>
            </g>
          ))}

          {fins.map((f, i) => (
            <text
              key={f.year} x={getX(i)} y={H - 4} textAnchor="middle"
              fill={hoverIdx === i ? '#fff' : 'rgba(255,255,255,0.4)'}
              fontSize="12"
              fontFamily="'Space Grotesk', sans-serif"
              fontWeight={hoverIdx === i ? 600 : 400}
            >
              {f.year}
            </text>
          ))}

          {activeKeys.map(m => {
            const points = fins.map((f, i) => `${getX(i)},${getY(f[m.key])}`).join(' ');
            return (
              <g key={m.key}>
                <polyline points={points} fill="none" stroke={m.color} strokeWidth="2.5" strokeLinejoin="round" />
                {fins.map((f, i) => (
                  <circle
                    key={i}
                    cx={getX(i)} cy={getY(f[m.key])}
                    r={hoverIdx === i ? 6 : 4}
                    fill={m.color} stroke="#111920" strokeWidth="2"
                  />
                ))}
              </g>
            );
          })}

          {hoverIdx !== null && (
            <line
              x1={getX(hoverIdx)} y1={PAD_T}
              x2={getX(hoverIdx)} y2={PAD_T + chartH}
              stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 3"
            />
          )}

          {fins.map((_f, i) => {
            const zoneW = i === 0 || i === fins.length - 1 ? xStep / 2 + 40 : xStep;
            const zoneX = i === 0 ? 0 : getX(i) - xStep / 2;
            return (
              <rect
                key={i}
                x={zoneX} y={0} width={zoneW} height={H}
                fill="transparent"
                style={{ cursor: 'crosshair' }}
                onMouseEnter={() => setHoverIdx(i)}
              />
            );
          })}
        </svg>

        {hoverIdx !== null && (() => {
          const f = fins[hoverIdx];
          const x = getX(hoverIdx);
          const tooltipRight = x > W / 2;
          return (
            <div
              className={s.tooltip}
              style={{
                top: PAD_T,
                left: tooltipRight ? undefined : x + 12,
                right: tooltipRight ? W - x + 12 : undefined,
              }}
            >
              <div className={s.tooltipYear}>{f.year}</div>
              {activeKeys.map(m => (
                <div key={m.key} className={s.tooltipRow}>
                  <div className={s.tooltipLabel}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                    <span className={s.tooltipLabelText}>{m.label}</span>
                  </div>
                  <span className={s.tooltipValue}>{fmtMoneyTable(f[m.key])}</span>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      <div className={s.dataTableWrap}>
        <table className={s.dataTable}>
          <thead>
            <tr>
              <th className={`${s.dataTableLeft} ${isMobile ? s.dataTableStickyLeft : ''}`} />
              {fins.map(f => <th key={f.year}>{f.year}</th>)}
            </tr>
          </thead>
          <tbody>
            {CHART_METRICS.map(m => (
              <tr key={m.key}>
                <td className={`${s.dataTableLeft} ${isMobile ? s.dataTableStickyLeft : ''}`}>
                  {m.label}
                </td>
                {fins.map(f => (
                  <td key={f.year}>{fmtMoneyTable(f[m.key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Fundraising sidebar ─────────────────────────────────────────

function FundraisingSidebar({ details }: { details: CompanyDetails }) {
  const fr = details.fundraising;
  const bonds = details.bonds;
  const totalVolume = bonds?.reduce((sum, b) => sum + b.volume, 0) ?? 0;
  const firstRating = bonds?.find(b => b.rating)?.rating ?? null;

  return (
    <div className={`${s.card} ${s.fundraisingCard}`}>
      <div className={s.sectionHead}>
        <Banknote style={{ width: '16px', height: '16px', color: 'var(--color-accent)' }} />
        <span className={s.sectionTitle}>Привлечение капитала</span>
      </div>

      {!fr && (!bonds || bonds.length === 0) ? (
        <div className={s.fundraisingEmpty}>
          <span className={s.fundraisingEmptyMain}>Нет данных о публичном привлечении</span>
          <span className={s.fundraisingEmptySub}>Данные дополняются</span>
        </div>
      ) : (
        <div className={s.fundraisingRows}>
          {fr && (
            <>
              <div className={s.frRow}>
                <span className={s.frLabel}>Тип</span>
                <span className={s.frValue}>{fr.type}</span>
              </div>
              <div className={s.frRow}>
                <span className={s.frLabel}>Статус</span>
                <span
                  className={s.frValue}
                  style={{ color: fr.status === 'Подтверждено' ? 'var(--color-accent)' : '#f59e0b' }}
                >
                  {fr.status}
                </span>
              </div>
              {fr.founder && fr.founder !== '—' && (
                <div className={s.frRow}>
                  <span className={s.frLabel}>Учредитель</span>
                  <span className={s.frValue}>{fr.founder}</span>
                </div>
              )}
            </>
          )}

          {bonds && bonds.length > 0 && (
            <>
              <div className={s.frDivider} />
              <div className={s.frRow}>
                <span className={s.frLabel}>Облигации</span>
                <span className={s.frValueMono}>{bonds.length} вып.</span>
              </div>
              <div className={s.frRow}>
                <span className={s.frLabel}>Общий объём</span>
                <span className={s.frValueMono}>{totalVolume.toLocaleString('ru-RU')} млн ₽</span>
              </div>
              {bonds[0].coupon && (
                <div className={s.frRow}>
                  <span className={s.frLabel}>Купон</span>
                  <span className={s.frValue}>{bonds[0].coupon}</span>
                </div>
              )}
              {firstRating && (
                <div className={s.frRow}>
                  <span className={s.frLabel}>Рейтинг</span>
                  <span className={s.frValue} style={{ fontSize: '12px' }}>{firstRating}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
