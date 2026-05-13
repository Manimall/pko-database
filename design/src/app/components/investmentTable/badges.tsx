import type { Bond, AllInvestment } from '../../data/investmentData';
import s from './InvestmentTable.module.css';

export function StatusBadge({ status }: { status: Bond['status'] }) {
  const active = status === 'active';
  return (
    <span className={s.statusBadge}>
      <span className={`${s.statusDot} ${active ? s.statusDotActive : s.statusDotPlacing}`} />
      {active ? 'В обращении' : 'Размещение'}
    </span>
  );
}

const RATING_COLORS: { match: (r: string) => boolean; color: string }[] = [
  { match: r => r.startsWith('ruA')   || r.startsWith('A'),   color: '#15803d' },
  { match: r => r.startsWith('ruBBB') || r.startsWith('BBB'), color: '#1d4ed8' },
  { match: r => r.startsWith('BB')    || r.startsWith('ruBB'), color: '#b45309' },
  { match: r => r.startsWith('ruB')   || r.startsWith('B'),   color: '#b91c1c' },
];

function ratingColor(rating: string): string {
  for (const entry of RATING_COLORS) {
    if (entry.match(rating)) return entry.color;
  }
  return '#52525b';
}

export function RatingBadge({ rating }: { rating: string }) {
  if (rating === '—') return <span style={{ color: '#a1a1aa', fontSize: '13px' }}>—</span>;
  return (
    <span className={s.ratingBadge} style={{ color: ratingColor(rating) }}>
      {rating}
    </span>
  );
}

const TYPE_COLORS: Record<string, string> = {
  'Банк':                   '#93c5fd',
  'Иностранный холдинг':    '#c4b5fd',
  'Секьюритизация':         '#fcd34d',
  'ЗПИФ':                   '#6ee7b7',
  'Иностранная компания':   '#c4b5fd',
  'Финтех-группа':          '#fdba74',
  'Контакт-центр/холдинг':  '#cbd5e1',
};

export function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type] || '#94a3b8';
  return (
    <span className={s.typeBadge} style={{ color, border: `1px solid ${color}33` }}>
      {type}
    </span>
  );
}

const INVEST_TYPE_META: Record<AllInvestment['type'], { label: string; color: string }> = {
  bonds:       { label: 'Облигации',     color: '#2563eb' },
  'site-loan': { label: 'Займы',         color: '#059669' },
  corporate:   { label: 'Корпоративное', color: '#7c3aed' },
};

export function InvestmentTypeBadge({ type }: { type: AllInvestment['type'] }) {
  const meta = INVEST_TYPE_META[type];
  return (
    <span className={s.investType} style={{ color: meta.color }}>
      {meta.label}
    </span>
  );
}
