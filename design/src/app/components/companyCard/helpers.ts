// Pure formatting helpers used by CompanyCard sections.

export function fmtMoney(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} млрд`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(1)} млн`;
  return `${v.toFixed(0)} тыс`;
}

export function fmtMoneyTable(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} млрд`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(1)} млн`;
  return `${Math.round(v).toLocaleString('ru-RU')} тыс`;
}

export function fmtPct(cur: number, prev: number): { text: string; color: string } | null {
  if (!prev || prev === 0) return null;
  const pct = ((cur - prev) / Math.abs(prev)) * 100;
  const sign = pct >= 0 ? '+' : '';
  return {
    text: `${sign}${pct.toFixed(1)}%`,
    color: pct >= 0 ? '#0DF0E6' : '#ef4444',
  };
}

/** Companies whose 2025 numbers are anomalous (reporting bugs); render 2024 instead. */
export const DATA_YEAR_2024_OVERRIDE = new Set<string>(['2635261351']); // АВЗ
