import type { CSSProperties } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { fmt, type SortDir } from './helpers';
import s from './RatingTable.module.css';

export function SortIcon({ isActive, dir }: { isActive: boolean; dir: SortDir }) {
  const accent = 'var(--color-accent)';
  const dim    = 'rgba(255,255,255,0.25)';
  const upColor   = isActive && dir === 'asc'  ? accent : dim;
  const downColor = isActive && dir === 'desc' ? accent : dim;
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="m3 8 4-4 4 4"  stroke={upColor} />
      <path d="M7 4v16"        stroke={upColor} />
      <path d="m21 16-4 4-4-4" stroke={downColor} />
      <path d="M17 20V4"       stroke={downColor} />
    </svg>
  );
}

export function DeltaCell({ delta }: { delta: number }) {
  if (delta === 0) return <span className={s.deltaZero}>—</span>;
  const cls = delta > 0 ? s.deltaPos : s.deltaNeg;
  const Icon = delta > 0 ? ArrowUp : ArrowDown;
  return (
    <span className={cls}>
      <Icon style={{ width: '10px', height: '10px' }} />
      {Math.abs(delta)}
    </span>
  );
}

interface ProfitCellProps {
  value: number;
  baseClass?: string;
  style?: CSSProperties;
}

export function ProfitCell({ value, baseClass = s.td, style }: ProfitCellProps) {
  const cls = value >= 0 ? s.tdProfitPos : s.tdProfitNeg;
  return (
    <td className={`${baseClass} ${cls}`} style={style}>
      {value < 0 ? `−${fmt(value)}` : fmt(value)}
    </td>
  );
}
