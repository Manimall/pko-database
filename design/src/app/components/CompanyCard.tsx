import { useState } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, ExternalLink, TrendingUp, BarChart3, Building2, Banknote, Link2, Pencil } from 'lucide-react';
import { RatingCompany } from '../data/ratingData';
import { CompanyDetails, YearlyFinancials } from '../data/companyDetails';
import { logoMap } from '../data/logoMap';
import { useIsMobile } from '../shared/hooks/useIsMobile';
import { stripOrgForm } from '../utils/formatCompanyName';

// ── Companies showing previous-year data ────────────────────────
// Для отдельных ПКО берём цифры за 2024 вместо 2025 (баг/аномалия 2025-отчётности).
// Источник в xlsx уже подменён, здесь — лишь UI-пометка.
const DATA_YEAR_2024_OVERRIDE = new Set<string>(['2635261351']); // АВЗ

// ── Helpers ─────────────────────────────────────────────────────

function fmtMoney(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} млрд`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(1)} млн`;
  return `${v.toFixed(0)} тыс`;
}

function fmtMoneyTable(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} млрд`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(1)} млн`;
  return `${Math.round(v).toLocaleString('ru-RU')} тыс`;
}

function fmtPct(cur: number, prev: number): { text: string; color: string } | null {
  if (!prev || prev === 0) return null;
  const pct = ((cur - prev) / Math.abs(prev)) * 100;
  const sign = pct >= 0 ? '+' : '';
  return {
    text: `${sign}${pct.toFixed(1)}%`,
    color: pct >= 0 ? '#0DF0E6' : '#ef4444',
  };
}

const ACCENT = '#0DF0E6';
const CARD_BG = '#111920';
const BORDER = 'rgba(255,255,255,0.06)';
const MUTED = 'rgba(255,255,255,0.4)';
const spaceGrotesk = "'Space Grotesk', sans-serif";

// ── Props ───────────────────────────────────────────────────────

interface CompanyCardProps {
  company: RatingCompany;
  details: CompanyDetails;
  onBack: () => void;
}

// ── Main Component ──────────────────────────────────────────────

export function CompanyCard({ company, details, onBack }: CompanyCardProps) {
  const isMobile = useIsMobile();
  const logoFile = logoMap[company.inn];
  const gridCols = isMobile ? '1fr' : '1fr 340px';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '20px', padding: isMobile ? '12px 0' : '20px 0' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', color: ACCENT,
          fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          padding: 0, alignSelf: 'flex-start',
        }}
      >
        <ArrowLeft style={{ width: '16px', height: '16px' }} />
        Назад к рейтингу
      </button>

      {/* Header Card */}
      <HeaderSection company={company} details={details} logoFile={logoFile} />

      {/* Two-column: Financials + Capital Structure */}
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: isMobile ? '12px' : '20px', minWidth: 0, overflow: 'hidden' }}>
        <FinancialsSection company={company} details={details} />
        <CapitalStructureSection company={company} details={details} />
      </div>

      {/* Chart + Capital Attraction */}
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: isMobile ? '12px' : '20px', minWidth: 0, overflow: 'hidden' }}>
        <DynamicsSection details={details} />
        <FundraisingSidebar details={details} />
      </div>
    </div>
  );
}

// ── Header ──────────────────────────────────────────────────────

function HeaderSection({ company, details, logoFile }: { company: RatingCompany; details: CompanyDetails; logoFile?: string }) {
  const isMobile = useIsMobile();
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

  const actionBtnStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.1)`,
    borderRadius: '8px', padding: '6px 12px',
    color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.2s',
  };

  const logoSize = isMobile ? 44 : 56;
  const logoInner = isMobile ? 36 : 48;

  return (
    <div style={{
      background: CARD_BG, borderRadius: '12px', border: `1px solid ${BORDER}`,
      padding: isMobile ? '16px' : '24px',
      display: 'flex', flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '12px' : '20px', alignItems: 'flex-start',
    }}>
      {/* Top row on mobile: Logo + Name + Badges + Actions */}
      {isMobile ? (
        <>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', width: '100%' }}>
            {/* Logo */}
            <div style={{
              width: `${logoSize}px`, height: `${logoSize}px`, borderRadius: '10px',
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, overflow: 'hidden',
            }}>
              {logoFile ? (
                <img src={`/logos/${logoFile}`} alt="" decoding="async" style={{ maxWidth: `${logoInner}px`, maxHeight: `${logoInner}px`, objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '18px', fontWeight: 700, color: ACCENT }}>{stripOrgForm(company.name)[0]}</span>
              )}
            </div>
            {/* Name + badges */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '18px', fontWeight: 700 }}>{stripOrgForm(company.name)}</span>
                <span style={{
                  fontSize: '11px', fontWeight: 600, color: ACCENT,
                  background: 'rgba(13,240,230,0.1)', padding: '2px 7px', borderRadius: '4px',
                }}>
                  #{company.rank}
                </span>
                {company.napka && (
                  <span style={{ fontSize: '10px', fontWeight: 600, color: ACCENT, border: `1px solid rgba(13,240,230,0.3)`, padding: '1px 6px', borderRadius: '3px' }}>
                    НАПКА
                  </span>
                )}
              </div>
              {/* Action buttons inline */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                <button
                  onClick={handleCopyLink}
                  style={{
                    ...actionBtnStyle, padding: '4px 10px', fontSize: '11px',
                    ...(linkCopied ? { color: ACCENT, borderColor: 'rgba(13,240,230,0.3)' } : {}),
                  }}
                  title="Скопировать ссылку"
                >
                  <Link2 style={{ width: '13px', height: '13px' }} />
                  {linkCopied ? 'Скопировано' : 'Ссылка'}
                </button>
                <button onClick={handleEdit} style={{ ...actionBtnStyle, padding: '4px 10px', fontSize: '11px' }} title="Написать об ошибке">
                  <Pencil style={{ width: '12px', height: '12px' }} />
                  Править
                </button>
              </div>
            </div>
          </div>

          {/* Full name */}
          <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.4 }}>
            {details.fullName}
          </div>

          {/* Director */}
          {details.director && (
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
              <span style={{ color: MUTED }}>Генеральный директор:</span>{' '}
              <span style={{ fontWeight: 500 }}>{details.director}</span>
            </div>
          )}

          {/* Meta row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', fontSize: '11px', color: MUTED }}>
            <span>ИНН: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{company.inn}</span></span>
            {details.ogrn && <span>ОГРН: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{details.ogrn}</span></span>}
            {details.registrationDate && <span>Рег.: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{details.registrationDate}</span></span>}
            <span>{company.city}</span>
            {details.website && (
              <a
                href={`https://${details.website}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: ACCENT, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                {details.website} <ExternalLink style={{ width: '10px', height: '10px' }} />
              </a>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Desktop layout — original */}
          {/* Logo */}
          <div style={{
            width: '56px', height: '56px', borderRadius: '12px',
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden',
          }}>
            {logoFile ? (
              <img src={`/logos/${logoFile}`} alt="" decoding="async" style={{ maxWidth: '48px', maxHeight: '48px', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: '22px', fontWeight: 700, color: ACCENT }}>{stripOrgForm(company.name)[0]}</span>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px', fontWeight: 700 }}>{stripOrgForm(company.name)}</span>
              <span style={{
                fontSize: '12px', fontWeight: 600, color: ACCENT,
                background: 'rgba(13,240,230,0.1)', padding: '2px 8px', borderRadius: '4px',
              }}>
                #{company.rank}
              </span>
              {company.rankDelta !== 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '2px',
                  fontSize: '12px', fontWeight: 600,
                  color: company.rankDelta > 0 ? '#0DF0E6' : '#ef4444',
                }}>
                  {company.rankDelta > 0
                    ? <ArrowUp style={{ width: '12px', height: '12px' }} />
                    : <ArrowDown style={{ width: '12px', height: '12px' }} />}
                  {Math.abs(company.rankDelta)}
                </span>
              )}
              {company.napka && (
                <span style={{ fontSize: '10px', fontWeight: 600, color: ACCENT, border: `1px solid rgba(13,240,230,0.3)`, padding: '1px 6px', borderRadius: '3px' }}>
                  НАПКА
                </span>
              )}
            </div>

            <div style={{ fontSize: '13px', color: MUTED, marginBottom: '8px' }}>
              {details.fullName}
            </div>

            {details.director && (
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '10px' }}>
                <span style={{ color: MUTED }}>Генеральный директор:</span>{' '}
                <span style={{ fontWeight: 500 }}>{details.director}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12px', color: MUTED }}>
              <span>ИНН: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{company.inn}</span></span>
              {details.ogrn && <span>ОГРН: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{details.ogrn}</span></span>}
              {details.registrationDate && <span>Рег.: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{details.registrationDate}</span></span>}
              <span>{company.city}</span>
              {details.website && (
                <a
                  href={`https://${details.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: ACCENT, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                >
                  {details.website} <ExternalLink style={{ width: '11px', height: '11px' }} />
                </a>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={handleCopyLink}
              style={{
                ...actionBtnStyle,
                ...(linkCopied ? { color: ACCENT, borderColor: 'rgba(13,240,230,0.3)' } : {}),
              }}
              onMouseEnter={e => { if (!linkCopied) { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; } }}
              onMouseLeave={e => { if (!linkCopied) { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; } }}
              title="Скопировать ссылку"
            >
              <Link2 style={{ width: '14px', height: '14px' }} />
              {linkCopied ? 'Скопировано' : 'Ссылка'}
            </button>
            <button
              onClick={handleEdit}
              style={actionBtnStyle}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              title="Написать об ошибке в карточке"
            >
              <Pencil style={{ width: '13px', height: '13px' }} />
              Править
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Financials ──────────────────────────────────────────────────

function FinancialsSection({ company, details }: { company: RatingCompany; details: CompanyDetails }) {
  const isMobile = useIsMobile();
  const fin2024 = details.financials.find(f => f.year === 2024);
  const fin2025 = details.financials.find(f => f.year === 2025);
  const useY2024 = DATA_YEAR_2024_OVERRIDE.has(company.inn);
  const dataYear = useY2024 ? 2024 : 2025;

  const rows: { label: string; value: number; prev: number | null; dot: string }[] = [
    { label: 'Выручка', value: details.revenue2025, prev: details.revenue2024, dot: '#0DF0E6' },
    { label: 'Прочие доходы', value: details.otherIncome2025, prev: details.otherIncome2024, dot: '#6366f1' },
    { label: 'Расходы', value: company.cost, prev: fin2024?.cost ?? null, dot: '#3b82f6' },
    { label: 'Чистая прибыль', value: company.profit, prev: fin2024?.profit ?? null, dot: '#22c55e' },
    { label: 'Фин. вложения', value: fin2025?.assets ?? 0, prev: fin2024?.assets ?? null, dot: '#f59e0b' },
    { label: 'Дебит. задолж.', value: company.receivable, prev: fin2024?.receivable ?? null, dot: '#f97316' },
  ];

  return (
    <div style={{
      background: CARD_BG, borderRadius: '12px', border: `1px solid ${BORDER}`,
      padding: isMobile ? '14px' : '20px', overflow: 'hidden', minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: isMobile ? '12px' : '16px' }}>
        <BarChart3 style={{ width: '16px', height: '16px', color: ACCENT }} />
        <span style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: spaceGrotesk }}>
          Финансовые показатели ({dataYear})
        </span>
      </div>

      {useY2024 && (
        <div style={{
          marginBottom: '12px', padding: '8px 10px', borderRadius: '8px',
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
          fontSize: '11px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4,
        }}>
          ⚠ Отображаются данные за <b>2024 год</b>: в отчётности компании за 2025 произошёл
          бухгалтерский сбой (аномальный скачок прочих доходов до 17,7 млрд ₽). До исправления
          источника используем последние корректные значения.
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0 8px', borderBottom: `1px solid ${BORDER}`, fontSize: '10px', fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        <span>Показать</span>
        <div style={{ display: 'flex', gap: isMobile ? '20px' : '40px' }}>
          <span>{dataYear} год</span>
          <span>YoY</span>
        </div>
      </div>

      {rows.map(({ label, value, prev, dot }) => {
        const yoy = prev !== null ? fmtPct(value, prev) : null;
        return (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: isMobile ? '10px 0' : '12px 0', borderBottom: `1px solid ${BORDER}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dot, flexShrink: 0 }} />
              <span style={{ fontSize: isMobile ? '12px' : '13px', color: 'rgba(255,255,255,0.8)' }}>{label}</span>
            </div>
            <div style={{ display: 'flex', gap: isMobile ? '12px' : '40px', alignItems: 'center' }}>
              <span style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 600, minWidth: isMobile ? '80px' : '100px', textAlign: 'right' }}>
                {fmtMoney(value)} ₽
              </span>
              <span style={{
                fontSize: isMobile ? '12px' : '13px', fontWeight: 600, minWidth: isMobile ? '50px' : '60px', textAlign: 'right',
                color: yoy ? yoy.color : MUTED,
              }}>
                {yoy ? yoy.text : '—'}
              </span>
            </div>
          </div>
        );
      })}

      {/* Growth rate */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 0 0',
      }}>
        <span style={{ fontSize: '13px', color: MUTED }}>
          Темп роста объема фин. активов за 5 лет
        </span>
        <span style={{ fontSize: '14px', fontWeight: 600, color: company.growthRate >= 0 ? ACCENT : '#ef4444' }}>
          +{company.growthRate}%
        </span>
      </div>
    </div>
  );
}

// ── Capital Structure (Donut) ───────────────────────────────────

function CapitalStructureSection({ company, details }: { company: RatingCompany; details: CompanyDetails }) {
  const isMobile = useIsMobile();
  // Используем ratingData (ФНС) — достоверные данные для всех 545 компаний
  // companyDetails.capitalStructure содержит нули для 63% компаний
  const equity = company.eqt;
  const debt = company.loan;
  const deRatio = company.de;
  const authorizedCapital = details.capitalStructure.authorizedCapital;
  const total = equity + debt;
  const eqPct = total > 0 ? (equity / total) * 100 : 0;
  const debtPct = total > 0 ? (debt / total) * 100 : 0;

  // SVG donut
  const size = 160;
  const stroke = 20;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const debtArc = (debtPct / 100) * circumference;
  const eqArc = (eqPct / 100) * circumference;

  return (
    <div style={{
      background: CARD_BG, borderRadius: '12px', border: `1px solid ${BORDER}`,
      padding: isMobile ? '14px' : '20px', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: isMobile ? '12px' : '16px' }}>
        <Building2 style={{ width: '16px', height: '16px', color: ACCENT }} />
        <span style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: spaceGrotesk }}>
          Структура капитала
        </span>
      </div>

      {/* Donut */}
      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: '12px' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          {/* Debt arc */}
          <circle
            cx={size/2} cy={size/2} r={radius} fill="none"
            stroke="#3b82f6" strokeWidth={stroke}
            strokeDasharray={`${debtArc} ${circumference - debtArc}`}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
          />
          {/* Equity arc */}
          <circle
            cx={size/2} cy={size/2} r={radius} fill="none"
            stroke="#22c55e" strokeWidth={stroke}
            strokeDasharray={`${eqArc} ${circumference - eqArc}`}
            strokeDashoffset={circumference * 0.25 - debtArc}
            strokeLinecap="round"
          />
        </svg>
        {/* Center text */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: spaceGrotesk }}>
            {deRatio.toFixed(2)}
          </div>
          <div style={{ fontSize: '10px', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>D / E</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '11px', color: MUTED, marginBottom: '16px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
          Заёмный {Math.round(debtPct)}%
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
          Собств. {Math.round(eqPct)}%
        </span>
      </div>

      {/* Metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
        {[
          { label: 'Собственный капитал', value: equity },
          { label: 'Заёмный капитал', value: debt },
          { label: 'D/E ratio', value: deRatio, raw: true },
          { label: 'Уставной капитал', value: authorizedCapital },
        ].map(({ label, value, raw }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: MUTED }}>{label}</span>
            <span style={{ fontWeight: 600, fontFamily: spaceGrotesk, color: label === 'D/E ratio' ? ACCENT : '#fff' }}>
              {raw ? value.toFixed(2) : `${fmtMoney(value)} ₽`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Dynamics Chart ──────────────────────────────────────────────

const CHART_METRICS = [
  { key: 'revenue' as const, label: 'Выручка', color: '#0DF0E6' },
  { key: 'cost' as const, label: 'Расходы', color: '#3b82f6' },
  { key: 'profit' as const, label: 'Чистая прибыль', color: '#22c55e' },
  { key: 'assets' as const, label: 'Вложения', color: '#f59e0b' },
  { key: 'receivable' as const, label: 'Дебиторка', color: '#ec4899' },
];

function DynamicsSection({ details }: { details: CompanyDetails }) {
  const isMobile = useIsMobile();
  const [activeMetrics, setActiveMetrics] = useState<Set<string>>(new Set(CHART_METRICS.map(m => m.key)));
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const fins = details.financials.filter(f => f.year >= 2021 && f.year <= 2025).sort((a, b) => a.year - b.year);

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

  // Calculate chart bounds
  const activeKeys = CHART_METRICS.filter(m => activeMetrics.has(m.key));
  let maxVal = 0;
  for (const f of fins) {
    for (const m of activeKeys) {
      const v = f[m.key];
      if (v > maxVal) maxVal = v;
    }
  }
  if (maxVal === 0) maxVal = 1;

  const W = 700;
  const H = 280;
  const PAD_L = 80;
  const PAD_R = 20;
  const PAD_T = 20;
  const PAD_B = 30;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const xStep = fins.length > 1 ? chartW / (fins.length - 1) : 0;
  const getX = (i: number) => PAD_L + i * xStep;
  const getY = (v: number) => PAD_T + chartH - (v / maxVal) * chartH;

  // Y-axis labels
  const yTicks = 5;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => (maxVal / yTicks) * i);

  return (
    <div style={{
      background: CARD_BG, borderRadius: '12px', border: `1px solid ${BORDER}`,
      padding: isMobile ? '14px' : '20px', overflow: 'hidden', minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: isMobile ? '12px' : '16px' }}>
        <TrendingUp style={{ width: '16px', height: '16px', color: ACCENT }} />
        <span style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: spaceGrotesk }}>
          Динамика за 5 лет
        </span>
      </div>

      {/* Metric tabs */}
      <div style={{ display: 'flex', gap: isMobile ? '6px' : '8px', flexWrap: 'wrap', marginBottom: isMobile ? '12px' : '16px' }}>
        {CHART_METRICS.map(m => {
          const active = activeMetrics.has(m.key);
          return (
            <button
              key={m.key}
              onClick={() => toggleMetric(m.key)}
              style={{
                padding: isMobile ? '5px 10px' : '6px 14px', borderRadius: '6px', fontSize: isMobile ? '11px' : '12px', fontWeight: 600,
                border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.03em',
                background: active ? m.color : 'rgba(255,255,255,0.06)',
                color: active ? '#0a0f15' : MUTED,
              }}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* SVG Chart */}
      <div style={{ overflowX: 'auto', position: 'relative' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ display: 'block', width: '100%', height: 'auto' }}
          onMouseLeave={() => setHoverIdx(null)}
        >
          {/* Grid lines */}
          {yLabels.map((v, i) => (
            <g key={i}>
              <line x1={PAD_L} y1={getY(v)} x2={W - PAD_R} y2={getY(v)} stroke="rgba(255,255,255,0.06)" />
              <text x={PAD_L - 8} y={getY(v) + 4} textAnchor="end" fill={MUTED} fontSize="10" fontFamily={spaceGrotesk}>
                {fmtMoneyTable(v)}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {fins.map((f, i) => (
            <text key={f.year} x={getX(i)} y={H - 4} textAnchor="middle" fill={hoverIdx === i ? '#fff' : MUTED} fontSize="12" fontFamily={spaceGrotesk} fontWeight={hoverIdx === i ? 600 : 400}>
              {f.year}
            </text>
          ))}

          {/* Lines */}
          {activeKeys.map(m => {
            const points = fins.map((f, i) => `${getX(i)},${getY(f[m.key])}`).join(' ');
            return (
              <g key={m.key}>
                <polyline points={points} fill="none" stroke={m.color} strokeWidth="2.5" strokeLinejoin="round" />
                {fins.map((f, i) => (
                  <circle key={i} cx={getX(i)} cy={getY(f[m.key])} r={hoverIdx === i ? 6 : 4} fill={m.color} stroke="#111920" strokeWidth="2" />
                ))}
              </g>
            );
          })}

          {/* Hover vertical line */}
          {hoverIdx !== null && (
            <line x1={getX(hoverIdx)} y1={PAD_T} x2={getX(hoverIdx)} y2={PAD_T + chartH} stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 3" />
          )}

          {/* Invisible hover zones for each year */}
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

        {/* Tooltip */}
        {hoverIdx !== null && (() => {
          const f = fins[hoverIdx];
          const x = getX(hoverIdx);
          const tooltipRight = x > W / 2;
          return (
            <div style={{
              position: 'absolute',
              top: PAD_T,
              left: tooltipRight ? undefined : x + 12,
              right: tooltipRight ? W - x + 12 : undefined,
              background: 'rgba(21,28,38,0.95)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px',
              padding: '10px 14px',
              pointerEvents: 'none',
              zIndex: 10,
              minWidth: '140px',
              backdropFilter: 'blur(8px)',
            }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', marginBottom: '8px', fontFamily: spaceGrotesk }}>{f.year}</div>
              {activeKeys.map(m => (
                <div key={m.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '2px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: MUTED }}>{m.label}</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff', fontFamily: spaceGrotesk }}>{fmtMoneyTable(f[m.key])}</span>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Data table */}
      <div style={{ overflowX: 'auto', marginTop: '16px', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ minWidth: isMobile ? '480px' : undefined, width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? '11px' : '12px' }}>
          <thead>
            <tr>
              <th style={{
                textAlign: 'left', padding: isMobile ? '6px 8px' : '8px 12px',
                borderBottom: `1px solid ${BORDER}`, color: MUTED, fontWeight: 500,
                ...(isMobile ? { position: 'sticky' as const, left: 0, background: CARD_BG, zIndex: 1 } : {}),
              }} />
              {fins.map(f => (
                <th key={f.year} style={{ textAlign: 'center', padding: isMobile ? '6px 8px' : '8px 12px', borderBottom: `1px solid ${BORDER}`, color: MUTED, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {f.year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CHART_METRICS.map(m => (
              <tr key={m.key}>
                <td style={{
                  padding: isMobile ? '6px 8px' : '8px 12px',
                  borderBottom: `1px solid ${BORDER}`, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap',
                  ...(isMobile ? { position: 'sticky' as const, left: 0, background: CARD_BG, zIndex: 1 } : {}),
                }}>
                  {m.label}
                </td>
                {fins.map(f => (
                  <td key={f.year} style={{ textAlign: 'center', padding: isMobile ? '6px 8px' : '8px 12px', borderBottom: `1px solid ${BORDER}`, fontWeight: 500, fontFamily: spaceGrotesk, whiteSpace: 'nowrap' }}>
                    {fmtMoneyTable(f[m.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Fundraising Sidebar (compact) ───────────────────────────────

function FundraisingSidebar({ details }: { details: CompanyDetails }) {
  const isMobile = useIsMobile();
  const fr = details.fundraising;
  const bonds = details.bonds;
  const totalVolume = bonds?.reduce((s, b) => s + b.volume, 0) ?? 0;
  const firstRating = bonds?.find(b => b.rating)?.rating ?? null;

  return (
    <div style={{
      background: CARD_BG, borderRadius: '12px', border: `1px solid ${BORDER}`,
      padding: isMobile ? '14px' : '20px', display: 'flex', flexDirection: 'column',
      alignSelf: isMobile ? 'stretch' : 'start',
      overflow: 'hidden', minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: isMobile ? '12px' : '16px' }}>
        <Banknote style={{ width: '16px', height: '16px', color: ACCENT }} />
        <span style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: spaceGrotesk }}>
          Привлечение капитала
        </span>
      </div>

      {!fr && (!bonds || bonds.length === 0) ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '8px', padding: '20px 0' }}>
          <span style={{ fontSize: '13px', color: MUTED }}>Нет данных о публичном привлечении</span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>Данные дополняются</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: isMobile ? '12px' : '13px', minWidth: 0 }}>
          {fr && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', minWidth: 0 }}>
                <span style={{ color: MUTED, flexShrink: 0 }}>Тип</span>
                <span style={{ fontWeight: 500, textAlign: 'right', minWidth: 0 }}>{fr.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ color: MUTED, flexShrink: 0 }}>Статус</span>
                <span style={{ fontWeight: 500, color: fr.status === 'Подтверждено' ? ACCENT : '#f59e0b' }}>
                  {fr.status}
                </span>
              </div>
              {fr.founder && fr.founder !== '—' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', minWidth: 0 }}>
                  <span style={{ color: MUTED, flexShrink: 0 }}>Учредитель</span>
                  <span style={{ fontWeight: 500, textAlign: 'right', minWidth: 0 }}>{fr.founder}</span>
                </div>
              )}
            </>
          )}

          {bonds && bonds.length > 0 && (
            <>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ color: MUTED, flexShrink: 0 }}>Облигации</span>
                <span style={{ fontWeight: 600, fontFamily: spaceGrotesk }}>{bonds.length} вып.</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', minWidth: 0 }}>
                <span style={{ color: MUTED, flexShrink: 0 }}>Общий объём</span>
                <span style={{ fontWeight: 600, fontFamily: spaceGrotesk, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{totalVolume.toLocaleString('ru-RU')} млн ₽</span>
              </div>
              {bonds[0].coupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ color: MUTED, flexShrink: 0 }}>Купон</span>
                  <span style={{ fontWeight: 500 }}>{bonds[0].coupon}</span>
                </div>
              )}
              {firstRating && (
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', minWidth: 0 }}>
                  <span style={{ color: MUTED, flexShrink: 0 }}>Рейтинг</span>
                  <span style={{ fontWeight: 500, fontSize: '12px', textAlign: 'right', minWidth: 0 }}>{firstRating}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
