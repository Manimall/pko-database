import { useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, ExternalLink } from 'lucide-react';
import { useIsMobile } from '../shared/hooks/useIsMobile';
import { stripOrgForm } from '../utils/formatCompanyName';
import {
  bonds, siteLoans, corporates, allInvestments,
  Bond, AllInvestment,
} from '../data/investmentData';
import { CompanyAvatar } from './CompanyAvatar';
import { getPkoRank, getPkoInn } from './investmentHelpers';
import s from './InvestmentTable.module.css';

export type InvestMode = 'bonds' | 'loans' | 'corporate' | 'all';

// ── Mobile sticky helpers ───────────────────────────────────────

interface StickyCols {
  rankTh: CSSProperties;
  logoTh: CSSProperties;
  rankTd: CSSProperties;
  logoTd: CSSProperties;
}

function useMobileSticky(): StickyCols {
  const isMobile = useIsMobile();
  if (!isMobile) return { rankTh: {}, logoTh: {}, rankTd: {}, logoTd: {} };
  return {
    rankTh: { position: 'sticky', left: 0,      zIndex: 3, background: 'var(--bg-card)' },
    logoTh: { position: 'sticky', left: '44px', zIndex: 3, background: 'var(--bg-card)' },
    rankTd: { position: 'sticky', left: 0,      zIndex: 1, background: 'var(--bg-card)' },
    logoTd: { position: 'sticky', left: '44px', zIndex: 1, background: 'var(--bg-card)' },
  };
}

// ── Avatar wrapper that resolves name → INN ─────────────────────

function NamedAvatar({ name }: { name: string }) {
  const inn = getPkoInn(name);
  const rank = getPkoRank(name) ?? 0;
  return (
    <CompanyAvatar
      name={stripOrgForm(name)}
      rank={rank}
      inn={inn ?? '__missing__'}
    />
  );
}

// ── Badges ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Bond['status'] }) {
  const active = status === 'active';
  return (
    <span className={s.statusBadge}>
      <span className={`${s.statusDot} ${active ? s.statusDotActive : s.statusDotPlacing}`} />
      {active ? 'В обращении' : 'Размещение'}
    </span>
  );
}

function RatingBadge({ rating }: { rating: string }) {
  if (rating === '—') return <span style={{ color: '#a1a1aa', fontSize: '13px' }}>—</span>;

  let color = '#52525b';
  if      (rating.startsWith('ruA')   || rating.startsWith('A'))   color = '#15803d';
  else if (rating.startsWith('ruBBB') || rating.startsWith('BBB')) color = '#1d4ed8';
  else if (rating.startsWith('BB')    || rating.startsWith('ruBB')) color = '#b45309';
  else if (rating.startsWith('ruB')   || rating.startsWith('B'))   color = '#b91c1c';

  return <span className={s.ratingBadge} style={{ color }}>{rating}</span>;
}

const TYPE_COLOR_MAP: Record<string, string> = {
  'Банк':                   '#93c5fd',
  'Иностранный холдинг':    '#c4b5fd',
  'Секьюритизация':         '#fcd34d',
  'ЗПИФ':                   '#6ee7b7',
  'Иностранная компания':   '#c4b5fd',
  'Финтех-группа':          '#fdba74',
  'Контакт-центр/холдинг':  '#cbd5e1',
};

function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLOR_MAP[type] || '#94a3b8';
  return (
    <span className={s.typeBadge} style={{ color, border: `1px solid ${color}33` }}>
      {type}
    </span>
  );
}

const INVEST_TYPE_META: Record<AllInvestment['type'], { label: string; color: string }> = {
  bonds:       { label: 'Облигации',      color: '#2563eb' },
  'site-loan': { label: 'Займы',          color: '#059669' },
  corporate:   { label: 'Корпоративное',  color: '#7c3aed' },
};

// ── Mode switcher ──────────────────────────────────────────────

const MODE_OPTS: { value: InvestMode; label: string }[] = [
  { value: 'bonds',     label: 'Облигации (10)' },
  { value: 'loans',     label: 'Займы через сайт (3)' },
  { value: 'corporate', label: 'Корпоративные (11)' },
  { value: 'all',       label: 'Все (23)' },
];

function ModeSwitcher({ mode, onChange }: { mode: InvestMode; onChange: (m: InvestMode) => void }) {
  const isMobile = useIsMobile();
  return (
    <div className={`${s.modeRow} ${isMobile ? s.modeRowMobile : ''}`}>
      {MODE_OPTS.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={`${s.modeTab} ${opt.value === mode ? s.modeTabActive : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Common row helper ───────────────────────────────────────────

function rowClass(canClick: boolean): string {
  return `${s.row} ${canClick ? '' : s.rowDefault}`;
}

// ── Bonds table ─────────────────────────────────────────────────

type BondSortKey = 'pkoRank' | 'company' | 'rating' | 'coupon' | 'volume' | 'status' | 'repayment';

function BondsTable({ onCompanyClick }: { onCompanyClick?: (inn: string) => void }) {
  const sticky = useMobileSticky();
  const [sortKey, setSortKey] = useState<BondSortKey>('pkoRank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (k: BondSortKey) => {
    if (k === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('asc'); }
  };

  const sorted = [...bonds].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1;
    if (sortKey === 'pkoRank') return ((getPkoRank(a.company) ?? 999) - (getPkoRank(b.company) ?? 999)) * mul;
    if (sortKey === 'volume')  return ((a.volume ?? -1) - (b.volume ?? -1)) * mul;
    const av = (a as Record<string, string | number | null>)[sortKey] as string ?? '';
    const bv = (b as Record<string, string | number | null>)[sortKey] as string ?? '';
    return av.localeCompare(bv, 'ru') * mul;
  });

  function Th({ k, children, style }: { k: BondSortKey; children: ReactNode; style?: CSSProperties }) {
    const active = sortKey === k;
    return (
      <th className={`${s.th} ${s.thSortable}`} style={style} onClick={() => handleSort(k)}>
        <span className={s.thInner}>
          <span>{children}</span>
          {active
            ? sortDir === 'asc'
              ? <ArrowUp   style={{ width: '10px', height: '10px' }} />
              : <ArrowDown style={{ width: '10px', height: '10px' }} />
            : <ArrowUpDown style={{ width: '10px', height: '10px', opacity: 0.25 }} />}
        </span>
      </th>
    );
  }

  return (
    <table className={s.table}>
      <thead>
        <tr>
          <Th k="pkoRank" style={{ ...sticky.rankTh } as CSSProperties}><span className={s.thRank}>№ в<br />ПКО-300</span></Th>
          <th className={`${s.th} ${s.thLogo}`} style={sticky.logoTh} aria-label="Логотип" />
          <Th k="company">Компания</Th>
          <Th k="rating">Рейтинг</Th>
          <th className={s.th}>ISIN / Погашение</th>
          <Th k="coupon">Купон</Th>
          <Th k="volume">Объём, млн ₽</Th>
          <th className={s.th}>Площадка</th>
          <Th k="status">Статус</Th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((b, idx) => {
          const inn = getPkoInn(b.company);
          const canClick = !!(onCompanyClick && inn);
          return (
            <tr
              key={b.isin + b.company + idx}
              className={rowClass(canClick)}
              onClick={() => canClick && onCompanyClick!(inn!)}
            >
              <td className={`${s.td} ${s.tdRank}`} style={sticky.rankTd}>{getPkoRank(b.company) ?? '—'}</td>
              <td className={`${s.td} ${s.tdLogo}`} style={sticky.logoTd}><NamedAvatar name={b.company} /></td>
              <td className={`${s.td} ${s.tdName}`}>{stripOrgForm(b.company)}</td>
              <td className={s.td}><RatingBadge rating={b.rating} /></td>
              <td className={s.td}>
                <div className={s.isinBox}>
                  <span className={s.isinCode}>{b.isin}</span>
                  <span className={s.isinMaturity}>{b.repayment || '—'}</span>
                </div>
              </td>
              <td className={`${s.td} ${s.tdBold}`}>{b.coupon}</td>
              <td className={s.td}>
                {b.volume != null
                  ? <span style={{ fontWeight: 500 }}>{b.volume.toLocaleString('ru-RU')}</span>
                  : <span style={{ color: '#d1d5db' }}>н/д</span>}
              </td>
              <td className={s.td}>{b.platform}</td>
              <td className={s.td}><StatusBadge status={b.status} /></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ── Loans table ─────────────────────────────────────────────────

function LoansTable({ onCompanyClick }: { onCompanyClick?: (inn: string) => void }) {
  const sticky = useMobileSticky();
  return (
    <table className={s.table}>
      <thead>
        <tr>
          <th className={`${s.th} ${s.thRank}`} style={sticky.rankTh}>№ в<br />ПКО-300</th>
          <th className={`${s.th} ${s.thLogo}`} style={sticky.logoTh} aria-label="Логотип" />
          <th className={s.th}>Компания</th>
          <th className={s.th}>Тип</th>
          <th className={s.th}>Сайт</th>
        </tr>
      </thead>
      <tbody>
        {[...siteLoans]
          .sort((a, b) => (getPkoRank(a.company) ?? 999) - (getPkoRank(b.company) ?? 999))
          .map(l => {
            const inn = getPkoInn(l.company);
            const canClick = !!(onCompanyClick && inn);
            return (
              <tr
                key={l.company}
                className={rowClass(canClick)}
                onClick={() => canClick && onCompanyClick!(inn!)}
              >
                <td className={`${s.td} ${s.tdRank}`} style={sticky.rankTd}>{getPkoRank(l.company) ?? '—'}</td>
                <td className={`${s.td} ${s.tdLogo}`} style={sticky.logoTd}><NamedAvatar name={l.company} /></td>
                <td className={`${s.td} ${s.tdName}`}>{stripOrgForm(l.company)}</td>
                <td className={s.td}><TypeBadge type={l.type} /></td>
                <td className={s.td}>
                  <div className={s.sitesRow}>
                    {l.sites.map(site => (
                      <a
                        key={site}
                        className={s.siteLink}
                        href={`https://${site}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                      >
                        {site}
                        <ExternalLink style={{ width: '11px', height: '11px', opacity: 0.5 }} />
                      </a>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}

// ── Corporate table ─────────────────────────────────────────────

function CorporateTable({ onCompanyClick }: { onCompanyClick?: (inn: string) => void }) {
  const sticky = useMobileSticky();
  return (
    <table className={s.table}>
      <thead>
        <tr>
          <th className={`${s.th} ${s.thRank}`} style={sticky.rankTh}>№ в<br />ПКО-300</th>
          <th className={`${s.th} ${s.thLogo}`} style={sticky.logoTh} aria-label="Логотип" />
          <th className={s.th}>Компания</th>
          <th className={s.th}>Учредитель / Структура</th>
          <th className={s.th}>Тип</th>
          <th className={s.th}>Детали</th>
        </tr>
      </thead>
      <tbody>
        {[...corporates]
          .sort((a, b) => (getPkoRank(a.company) ?? 999) - (getPkoRank(b.company) ?? 999))
          .map(c => {
            const inn = getPkoInn(c.company);
            const canClick = !!(onCompanyClick && inn);
            return (
              <tr
                key={c.company}
                className={rowClass(canClick)}
                onClick={() => canClick && onCompanyClick!(inn!)}
              >
                <td className={`${s.td} ${s.tdRank}`} style={sticky.rankTd}>{getPkoRank(c.company) ?? '—'}</td>
                <td className={`${s.td} ${s.tdLogo}`} style={sticky.logoTd}><NamedAvatar name={c.company} /></td>
                <td className={`${s.td} ${s.tdName}`}>{stripOrgForm(c.company)}</td>
                <td className={`${s.td} ${s.tdWrap}`} style={{ color: 'rgba(255,255,255,0.7)' }}>{c.founder}</td>
                <td className={s.td}><TypeBadge type={c.structureType} /></td>
                <td className={`${s.td} ${s.tdMuted}`}>{c.details}</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}

// ── All table ───────────────────────────────────────────────────

function AllTable({ onCompanyClick }: { onCompanyClick?: (inn: string) => void }) {
  const sticky = useMobileSticky();

  return (
    <table className={s.table}>
      <thead>
        <tr>
          <th className={`${s.th} ${s.thRank}`} style={sticky.rankTh}>№ в<br />ПКО-300</th>
          <th className={`${s.th} ${s.thLogo}`} style={sticky.logoTh} aria-label="Логотип" />
          <th className={s.th}>Компания</th>
          <th className={s.th}>Тип привлечения</th>
          <th className={s.th}>Детали</th>
          <th className={s.th}>Подробнее</th>
        </tr>
      </thead>
      <tbody>
        {[...allInvestments]
          .sort((a, b) => (getPkoRank(a.company) ?? 999) - (getPkoRank(b.company) ?? 999))
          .map(r => {
            const inn = getPkoInn(r.company);
            const canClick = !!(onCompanyClick && inn);
            const meta = INVEST_TYPE_META[r.type];
            return (
              <tr
                key={r.company + r.type}
                className={rowClass(canClick)}
                onClick={() => canClick && onCompanyClick!(inn!)}
              >
                <td className={`${s.td} ${s.tdRank}`} style={sticky.rankTd}>{getPkoRank(r.company) ?? '—'}</td>
                <td className={`${s.td} ${s.tdLogo}`} style={sticky.logoTd}><NamedAvatar name={r.company} /></td>
                <td className={`${s.td} ${s.tdName}`}>{stripOrgForm(r.company)}</td>
                <td className={s.td}>
                  <span className={s.investType} style={{ color: meta.color }}>{meta.label}</span>
                </td>
                <td className={`${s.td} ${s.tdBold}`}>{r.details}</td>
                <td className={`${s.td} ${s.tdMuted} ${s.tdWrap}`}>{r.subDetails}</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}

// ── Main ────────────────────────────────────────────────────────

interface InvestmentTableProps {
  onCompanyClick?: (inn: string) => void;
}

export function InvestmentTable({ onCompanyClick }: InvestmentTableProps) {
  const [mode, setMode] = useState<InvestMode>('bonds');

  return (
    <div>
      <ModeSwitcher mode={mode} onChange={setMode} />
      <div className={s.tableWrap}>
        {mode === 'bonds'     && <BondsTable     onCompanyClick={onCompanyClick} />}
        {mode === 'loans'     && <LoansTable     onCompanyClick={onCompanyClick} />}
        {mode === 'corporate' && <CorporateTable onCompanyClick={onCompanyClick} />}
        {mode === 'all'       && <AllTable       onCompanyClick={onCompanyClick} />}
      </div>
    </div>
  );
}
