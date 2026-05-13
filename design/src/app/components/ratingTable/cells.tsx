import type { CSSProperties } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { fmt } from './helpers';
import s from './RatingTable.module.css';

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
