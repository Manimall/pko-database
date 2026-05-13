import { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, ExternalLink } from 'lucide-react';
import { useIsMobile } from '../shared/hooks/useIsMobile';
import { stripOrgForm } from '../utils/formatCompanyName';
import { bonds, siteLoans, corporates, allInvestments, Bond, SiteLoan, Corporate, AllInvestment } from '../data/investmentData';
import { ratingData } from '../data/ratingData';
import { logoMap } from '../data/logoMap';

// Lookup: company name → rank in ПКО-300
const pkoRankMap = new Map<string, number>();
const pkoInnMap = new Map<string, string>();
for (const c of ratingData) {
  if (!pkoRankMap.has(c.name)) pkoRankMap.set(c.name, c.rank);
  if (!pkoInnMap.has(c.name)) pkoInnMap.set(c.name, c.inn);
}
// Aliases for names that differ between investmentData and ratingData
const ALIASES: Record<string, string> = {
  'НФИ': 'Национальная Фабрика Ипотеки',
  'Воксис': 'ПКО ВОКСИС',
  'Первое клиентское бюро': 'ПКБ',
  'Агентство Судебного Взыскания': 'АСВ',
  'Служба защиты активов': 'СЗА',
  'Юридическая служба взыскания': 'ЮСВ',
  'АктивБизнесКонсалт': 'АБК',
  'Столичная Сервисная Компания': 'Столичное АВД',
  'Сентинел (СКМ)': 'СКМ',
  'Региональная Служба Взыскания': 'РСВ',
  'Кредитор': 'ООО "ПКО "КРЕДИТОР"',
};
function resolveCompanyName(companyName: string): string | null {
  if (pkoRankMap.has(companyName)) return companyName;
  const alias = ALIASES[companyName];
  if (alias && pkoRankMap.has(alias)) return alias;
  const lower = companyName.toLowerCase();
  const aliasLower = alias?.toLowerCase();
  for (const [name] of pkoRankMap) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes(lower) || lower.includes(nameLower)) return name;
    if (aliasLower && (nameLower.includes(aliasLower) || aliasLower.includes(nameLower))) return name;
  }
  return null;
}

function getPkoRank(companyName: string): number | null {
  const resolved = resolveCompanyName(companyName);
  return resolved ? pkoRankMap.get(resolved)! : null;
}

function getPkoInn(companyName: string): string | null {
  const resolved = resolveCompanyName(companyName);
  return resolved ? pkoInnMap.get(resolved) ?? null : null;
}

const AVATAR_COLORS = [
  '#00B2AA', '#0060B9', '#4326BA', '#00B982', '#0DF0E6',
  '#0078d4', '#6B3FA0', '#00a67d', '#008c84', '#0052a3',
];

function CompanyLogo({ name }: { name: string }) {
  const inn = getPkoInn(name);
  const logoFile = inn ? logoMap[inn] : null;
  const [imgError, setImgError] = useState(false);
  const rank = getPkoRank(name) ?? 0;
  const letter = stripOrgForm(name)[0] ?? '?';
  const bg = AVATAR_COLORS[(rank - 1) % AVATAR_COLORS.length];

  if (logoFile && !imgError) {
    return (
      <div style={{
        width: '32px', height: '32px', borderRadius: '8px',
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, overflow: 'hidden',
      }}>
        <img
          src={`/logos/${logoFile}`}
          alt={name}
          onError={() => setImgError(true)}
          style={{ maxWidth: '28px', maxHeight: '28px', objectFit: 'contain' }}
        />
      </div>
    );
  }

  return (
    <div style={{
      width: '32px', height: '32px', borderRadius: '8px',
      background: bg, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, fontSize: '13px', fontWeight: 700,
    }}>
      {letter}
    </div>
  );
}

export type InvestMode = 'bonds' | 'loans' | 'corporate' | 'all';

// ── Shared styles ───────────────────────────────────────────��────
const CARD: React.CSSProperties = {
  background: '#111920',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: 'none',
  overflow: 'hidden',
};

const TH: React.CSSProperties = {
  textAlign: 'left',
  padding: '0 16px',
  height: '40px',
  fontSize: '10px',
  color: 'rgba(255,255,255,0.4)',
  fontWeight: 400,
  whiteSpace: 'nowrap',
  background: '#111920',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  userSelect: 'none',
};

const TD: React.CSSProperties = {
  padding: '0 16px',
  height: '44px',
  fontSize: '13px',
  color: 'rgba(255,255,255,0.7)',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
};

const TD_NAME: React.CSSProperties = {
  ...TD,
  fontWeight: 600,
  color: '#fff',
  minWidth: '160px',
};

// On mobile: freeze only № + Logo columns during horizontal scroll — company name scrolls
function useMobileSticky() {
  const isMobile = useIsMobile();
  if (!isMobile) return { rankTh: {}, logoTh: {}, rankTd: {}, logoTd: {} };
  return {
    rankTh: { position: 'sticky' as const, left: 0,      zIndex: 3, background: '#111920' },
    logoTh: { position: 'sticky' as const, left: '44px', zIndex: 3, background: '#111920' },
    rankTd: { position: 'sticky' as const, left: 0,      zIndex: 1, background: '#111920' },
    logoTd: { position: 'sticky' as const, left: '44px', zIndex: 1, background: '#111920' },
  };
}

// Shared styles for logo / name cells (split from TD_NAME)
const TH_LOGO: React.CSSProperties = { ...TH, width: '48px', padding: '0 8px' };
const TD_LOGO: React.CSSProperties = { ...TD, width: '48px', padding: '0 8px' };

// ── Sub-mode switcher ────────�����───���──────────────────────────────
interface ModeSwitcherProps {
  mode: InvestMode;
  onChange: (m: InvestMode) => void;
}

function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  const isMobile = useIsMobile();
  const opts: { value: InvestMode; label: string }[] = [
    { value: 'bonds',     label: 'Облигации (10)' },
    { value: 'loans',     label: 'Займы через сайт (3)' },
    { value: 'corporate', label: 'Корпоративные (11)' },
    { value: 'all',       label: 'Все (23)' },
  ];
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      overflowX: isMobile ? 'auto' : 'visible',
      WebkitOverflowScrolling: 'touch' as any,
    }}>
      {opts.map((opt) => {
        const active = opt.value === mode;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 500,
              color: active ? '#0DF0E6' : 'rgba(255,255,255,0.4)',
              background: 'transparent',
              border: 'none',
              borderBottom: active ? '2px solid #0DF0E6' : '2px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s, border-color 0.15s',
              outline: 'none',
              marginBottom: '-1px',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────────
function StatusBadge({ status }: { status: Bond['status'] }) {
  const active = status === 'active';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 500,
        background: 'rgba(255,255,255,0.04)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: active ? '#10b981' : '#f59e0b', // emerald for active, amber for placing
          flexShrink: 0,
        }}
      />
      {active ? 'В обращении' : 'Размещение'}
    </span>
  );
}

// ── Rating badge ─────────────────────────────────────────────────
function RatingBadge({ rating }: { rating: string }) {
  if (rating === '—') {
    return <span style={{ color: '#a1a1aa', fontSize: '13px' }}>—</span>;
  }
  
  let color = '#52525b';
  if (rating.startsWith('ruA') || rating.startsWith('A')) color = '#15803d'; // green-700
  else if (rating.startsWith('ruBBB') || rating.startsWith('BBB')) color = '#1d4ed8'; // blue-700
  else if (rating.startsWith('BB') || rating.startsWith('ruBB')) color = '#b45309'; // amber-700
  else if (rating.startsWith('ruB') || rating.startsWith('B')) color = '#b91c1c'; // red-700

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 600,
        color,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        whiteSpace: 'nowrap',
        letterSpacing: '0.5px'
      }}
    >
      {rating}
    </span>
  );
}

// ── Type badge ───────────────────────────────────────────────────
const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Банк:                   { bg: 'rgba(96,165,250,0.1)', text: '#93c5fd', border: 'rgba(96,165,250,0.2)' },
  'Иностранный холдинг':  { bg: 'rgba(192,132,252,0.1)', text: '#c4b5fd', border: 'rgba(192,132,252,0.2)' },
  Секьюритизация:         { bg: 'rgba(251,191,36,0.1)', text: '#fcd34d', border: 'rgba(251,191,36,0.2)' },
  ЗПИФ:                   { bg: 'rgba(52,211,153,0.1)', text: '#6ee7b7', border: 'rgba(52,211,153,0.2)' },
  'Иностранная компания': { bg: 'rgba(192,132,252,0.1)', text: '#c4b5fd', border: 'rgba(192,132,252,0.2)' },
  'Финтех-группа':        { bg: 'rgba(251,146,60,0.1)', text: '#fdba74', border: 'rgba(251,146,60,0.2)' },
  'Контакт-центр/холдинг':{ bg: 'rgba(148,163,184,0.1)', text: '#cbd5e1', border: 'rgba(148,163,184,0.2)' },
};

function TypeBadge({ type }: { type: string }) {
  const c = TYPE_COLORS[type] || { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8', border: 'rgba(148,163,184,0.2)' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 600,
        background: 'transparent',
        color: c.text,
        border: `1px solid ${c.text}33`,
        whiteSpace: 'nowrap',
      }}
    >
      {type}
    </span>
  );
}

// ── BONDS TABLE ───────────────────────────────────────��──────────
type BondSortKey = 'pkoRank' | 'company' | 'rating' | 'coupon' | 'volume' | 'status' | 'repayment';

function BondsTable({ onCompanyClick }: { onCompanyClick?: (inn: string) => void }) {
  const { rankTh, logoTh, rankTd, logoTd } = useMobileSticky();
  const [sortKey, setSortKey] = useState<BondSortKey>('pkoRank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (k: BondSortKey) => {
    if (k === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('asc'); }
  };

  const sorted = [...bonds].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1;
    if (sortKey === 'pkoRank') return ((getPkoRank(a.company) ?? 999) - (getPkoRank(b.company) ?? 999)) * mul;
    if (sortKey === 'volume') return ((a.volume ?? -1) - (b.volume ?? -1)) * mul;
    const av = (a as Record<string, string | number | null>)[sortKey] as string ?? '';
    const bv = (b as Record<string, string | number | null>)[sortKey] as string ?? '';
    return av.localeCompare(bv, 'ru') * mul;
  });

  function Th({ k, children, style }: { k: BondSortKey; children: React.ReactNode; style?: React.CSSProperties }) {
    const active = sortKey === k;
    return (
      <th
        onClick={() => handleSort(k)}
        style={{ ...TH, cursor: 'pointer', ...style }}
        onMouseEnter={e => { e.currentTarget.style.color = '#374151'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          <span>{children}</span>
          {active
            ? sortDir === 'asc'
              ? <ArrowUp style={{ width: '10px', height: '10px' }} />
              : <ArrowDown style={{ width: '10px', height: '10px' }} />
            : <ArrowUpDown style={{ width: '10px', height: '10px', opacity: 0.25 }} />}
        </span>
      </th>
    );
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <Th k="pkoRank" style={{ width: '44px', fontSize: '10px', whiteSpace: 'normal', lineHeight: 1.3, ...rankTh }}>№ в<br />ПКО-300</Th>
          <th style={{ ...TH_LOGO, ...logoTh }} aria-label="Логотип" />
          <Th k="company">Компания</Th>
          <Th k="rating">Рейтинг</Th>
          <th style={TH}>ISIN / Погашение</th>
          <Th k="coupon">Купон</Th>
          <Th k="volume">Объём, млн ₽</Th>
          <th style={TH}>Площадка</th>
          <Th k="status">Статус</Th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((b, idx) => (
          <tr
            key={b.isin + b.company + idx}
            style={{ borderBottom: idx < sorted.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: onCompanyClick && getPkoInn(b.company) ? 'pointer' : undefined }}
            onClick={() => { const inn = getPkoInn(b.company); if (inn && onCompanyClick) onCompanyClick(inn); }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(13,240,230,0.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <td style={{ ...TD, color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 600, width: '44px', ...rankTd }}>{getPkoRank(b.company) ?? '—'}</td>
            <td style={{ ...TD_LOGO, ...logoTd }}><CompanyLogo name={b.company} /></td>
            <td style={TD_NAME}>{stripOrgForm(b.company)}</td>
            <td style={TD}><RatingBadge rating={b.rating} /></td>
            <td style={{ ...TD }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: b.isin === '—' ? '#d1d5db' : '#374151' }}>{b.isin}</span>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>{b.repayment || '—'}</span>
              </div>
            </td>
            <td style={{ ...TD, fontWeight: 600, color: '#fff' }}>{b.coupon}</td>
            <td style={TD}>
              {b.volume != null
                ? <span style={{ fontWeight: 500 }}>{b.volume.toLocaleString('ru-RU')}</span>
                : <span style={{ color: '#d1d5db' }}>н/д</span>}
            </td>
            <td style={TD}>{b.platform}</td>
            <td style={TD}><StatusBadge status={b.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── SITE LOANS TABLE ─────────────────────────────────────────────
function LoansTable({ onCompanyClick }: { onCompanyClick?: (inn: string) => void }) {
  const { rankTh, logoTh, rankTd, logoTd } = useMobileSticky();
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ ...TH, width: '44px', fontSize: '10px', whiteSpace: 'normal', lineHeight: 1.3, ...rankTh }}>№ в<br />ПКО-300</th>
          <th style={{ ...TH_LOGO, ...logoTh }} aria-label="Логотип" />
          <th style={TH}>Компания</th>
          <th style={TH}>Тип</th>
          <th style={TH}>Сайт</th>
        </tr>
      </thead>
      <tbody>
        {[...siteLoans].sort((a, b) => (getPkoRank(a.company) ?? 999) - (getPkoRank(b.company) ?? 999)).map((l, idx) => (
          <tr
            key={l.company}
            style={{ borderBottom: idx < siteLoans.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: onCompanyClick && getPkoInn(l.company) ? 'pointer' : undefined }}
            onClick={() => { const inn = getPkoInn(l.company); if (inn && onCompanyClick) onCompanyClick(inn); }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(13,240,230,0.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <td style={{ ...TD, color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 600, ...rankTd }}>{getPkoRank(l.company) ?? '—'}</td>
            <td style={{ ...TD_LOGO, ...logoTd }}><CompanyLogo name={l.company} /></td>
            <td style={TD_NAME}>{stripOrgForm(l.company)}</td>
            <td style={TD}>
              <TypeBadge type={l.type} />
            </td>
            <td style={TD}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {l.sites.map(s => (
                  <a
                    key={s}
                    href={`https://${s}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#2563eb',
                      textDecoration: 'none',
                      fontSize: '13px',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
                    onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
                  >
                    {s}
                    <ExternalLink style={{ width: '11px', height: '11px', opacity: 0.5 }} />
                  </a>
                ))}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── CORPORATE TABLE ──────────────────────────────────────────────
function CorporateTable({ onCompanyClick }: { onCompanyClick?: (inn: string) => void }) {
  const { rankTh, logoTh, rankTd, logoTd } = useMobileSticky();
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ ...TH, width: '44px', fontSize: '10px', whiteSpace: 'normal', lineHeight: 1.3, ...rankTh }}>№ в<br />ПКО-300</th>
          <th style={{ ...TH_LOGO, ...logoTh }} aria-label="Логотип" />
          <th style={TH}>Компания</th>
          <th style={TH}>Учредитель / Структура</th>
          <th style={TH}>Тип</th>
          <th style={TH}>Детали</th>
        </tr>
      </thead>
      <tbody>
        {[...corporates].sort((a, b) => (getPkoRank(a.company) ?? 999) - (getPkoRank(b.company) ?? 999)).map((c, idx) => (
          <tr
            key={c.company}
            style={{ borderBottom: idx < corporates.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: onCompanyClick && getPkoInn(c.company) ? 'pointer' : undefined }}
            onClick={() => { const inn = getPkoInn(c.company); if (inn && onCompanyClick) onCompanyClick(inn); }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(13,240,230,0.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <td style={{ ...TD, color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 600, ...rankTd }}>{getPkoRank(c.company) ?? '—'}</td>
            <td style={{ ...TD_LOGO, ...logoTd }}><CompanyLogo name={c.company} /></td>
            <td style={TD_NAME}>{stripOrgForm(c.company)}</td>
            <td style={{ ...TD, color: 'rgba(255,255,255,0.7)', maxWidth: '280px', whiteSpace: 'normal' }}>
              {c.founder}
            </td>
            <td style={TD}><TypeBadge type={c.structureType} /></td>
            <td style={{ ...TD, color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{c.details}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── ALL TABLE ────────────────────────────────────────────────────
const INVEST_TYPE_META: Record<AllInvestment['type'], { label: string; bg: string; color: string; border: string }> = {
  bonds:      { label: 'Облигации',     bg: 'rgba(255,255,255,0.04)', color: '#2563eb', border: 'rgba(255,255,255,0.08)' },
  'site-loan':{ label: 'Займы',         bg: 'rgba(255,255,255,0.04)', color: '#059669', border: 'rgba(255,255,255,0.08)' },
  corporate:  { label: 'Корпоративное', bg: 'rgba(255,255,255,0.04)', color: '#7c3aed', border: 'rgba(255,255,255,0.08)' },
};

function AllTable({ onCompanyClick }: { onCompanyClick?: (inn: string) => void }) {
  const { rankTh, logoTh, rankTd, logoTd } = useMobileSticky();
  const [filterType, setFilterType] = useState<AllInvestment['type'] | 'all'>('all');

  const filtered = filterType === 'all'
    ? allInvestments
    : allInvestments.filter(r => r.type === filterType);

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...TH, width: '44px', fontSize: '10px', whiteSpace: 'normal', lineHeight: 1.3, ...rankTh }}>№ в<br />ПКО-300</th>
            <th style={{ ...TH_LOGO, ...logoTh }} aria-label="Логотип" />
            <th style={TH}>Компания</th>
            <th style={TH}>Тип привлечения</th>
            <th style={TH}>Детали</th>
            <th style={TH}>Подробнее</th>
          </tr>
        </thead>
        <tbody>
          {[...filtered].sort((a, b) => (getPkoRank(a.company) ?? 999) - (getPkoRank(b.company) ?? 999)).map((r, idx) => {
            const meta = INVEST_TYPE_META[r.type];
            return (
              <tr
                key={r.company + r.type}
                style={{ borderBottom: idx < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: onCompanyClick && getPkoInn(r.company) ? 'pointer' : undefined }}
                onClick={() => { const inn = getPkoInn(r.company); if (inn && onCompanyClick) onCompanyClick(inn); }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(13,240,230,0.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <td style={{ ...TD, color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 600, ...rankTd }}>{getPkoRank(r.company) ?? '—'}</td>
                <td style={{ ...TD_LOGO, ...logoTd }}><CompanyLogo name={r.company} /></td>
                <td style={TD_NAME}>{stripOrgForm(r.company)}</td>
                <td style={TD}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 500,
                      background: meta.bg,
                      color: meta.color,
                      border: `1px solid ${meta.border}`,
                    }}
                  >
                    {meta.label}
                  </span>
                </td>
                <td style={{ ...TD, fontWeight: 500, color: '#fff' }}>{r.details}</td>
                <td style={{ ...TD, color: 'rgba(255,255,255,0.4)', fontSize: '12px', maxWidth: '280px', whiteSpace: 'normal' }}>
                  {r.subDetails}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────
interface InvestmentTableProps {
  companies?: unknown[];
  onCompanyClick?: (inn: string) => void;
}

export function InvestmentTable({ onCompanyClick }: InvestmentTableProps) {
  const [mode, setMode] = useState<InvestMode>('bonds');

  return (
    <div>
      {/* Switcher */}
      <div style={{ marginBottom: '16px' }}>
        <ModeSwitcher mode={mode} onChange={setMode} />
      </div>

      {/* Table content (карточка уже в App.tsx) */}
      <div>
        {mode === 'bonds' && (
          <div style={{ overflowX: 'auto' }}>
            <BondsTable onCompanyClick={onCompanyClick} />
          </div>
        )}

        {mode === 'loans' && (
          <div style={{ overflowX: 'auto' }}>
            <LoansTable onCompanyClick={onCompanyClick} />
          </div>
        )}

        {mode === 'corporate' && (
          <div style={{ overflowX: 'auto' }}>
            <CorporateTable onCompanyClick={onCompanyClick} />
          </div>
        )}

        {mode === 'all' && (
          <div style={{ overflowX: 'auto' }}>
            <AllTable onCompanyClick={onCompanyClick} />
          </div>
        )}
      </div>
    </div>
  );
}
