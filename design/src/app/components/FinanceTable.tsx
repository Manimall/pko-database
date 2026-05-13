import { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { financeDynamic, FINANCE_YEARS } from '../data/financeDynamic';
import { logoMap } from '../data/logoMap';

const PAGE_SIZE = 100;

export type FinanceYear = 2020 | 2021 | 2022 | 2023 | 2024;

export interface FinanceMetricFilters {
  incomeFrom: string;
  incomeTo: string;
  profitFrom: string;
  profitTo: string;
}

interface FinanceTableProps {
  searchQuery: string;
  year: FinanceYear;
  filteredInns?: Set<string>;
  financeFilters?: FinanceMetricFilters;
}

// ── Styles ──────────────────────────────────────────────────────
const TH_STYLE: React.CSSProperties = {
  textAlign: 'left',
  padding: '4px 8px',
  height: '40px',
  fontSize: '10px',
  color: 'rgba(255,255,255,0.4)',
  fontWeight: 400,
  whiteSpace: 'normal',
  lineHeight: '1.3',
  background: '#111920',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  userSelect: 'none',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  position: 'sticky',
  top: '62px',
  zIndex: 10,
};

const TD_STYLE: React.CSSProperties = {
  textAlign: 'left',
  padding: '0 8px',
  height: '44px',
  fontSize: '12px',
  color: '#fff',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
};

const AVATAR_COLORS = [
  '#00B2AA', '#0060B9', '#4326BA', '#00B982', '#0DF0E6',
  '#0078d4', '#6B3FA0', '#00a67d', '#008c84', '#0052a3',
];

function Avatar({ name, rank, inn }: { name: string; rank: number; inn: string }) {
  const logoFile = logoMap[inn];
  const [imgError, setImgError] = useState(false);
  const letter = name[0] ?? '?';
  const bg = AVATAR_COLORS[(rank - 1) % AVATAR_COLORS.length];

  if (logoFile && !imgError) {
    return (
      <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
        <img src={`/logos/${logoFile}`} alt={name} loading="lazy" decoding="async" onError={() => setImgError(true)} style={{ maxWidth: '28px', maxHeight: '28px', objectFit: 'contain' }} />
      </div>
    );
  }

  return (
    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
      {letter}
    </div>
  );
}

const fmt = (n: number) => n === 0 ? '0' : Math.abs(n).toLocaleString('ru-RU');

function calcYoy(current: number, previous: number): number | null {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

type SortCol = 'rank' | 'income' | 'cost' | 'profit' | 'receivable';
type SortDir = 'asc' | 'desc';

function YoyBadge({ yoy }: { yoy: number | null }) {
  if (yoy === null) return null;
  const positive = yoy >= 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '1px',
      fontSize: '10px', fontWeight: 600, lineHeight: '1',
      color: positive ? '#0DF0E6' : '#dc2626',
    }}>
      {positive
        ? <ArrowUp style={{ width: '9px', height: '9px' }} />
        : <ArrowDown style={{ width: '9px', height: '9px' }} />}
      {Math.abs(yoy).toFixed(1)}%
    </span>
  );
}

export function FinanceTable({ searchQuery, year, filteredInns, financeFilters }: FinanceTableProps) {
  const [sortCol, setSortCol] = useState<SortCol>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(0);

  const yearIdx = FINANCE_YEARS.indexOf(year);
  const prevIdx = yearIdx > 0 ? yearIdx - 1 : -1;
  const hasPrev = prevIdx >= 0;

  // Filter by search + rating filters (via filteredInns)
  const filtered = financeDynamic.filter(c => {
    if (filteredInns && !filteredInns.has(c.inn)) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.inn.includes(q);
  });

  // Apply finance metric filters
  const metricFiltered = financeFilters ? filtered.filter(c => {
    const income = c.income[yearIdx] || 0;
    const profit = c.profit[yearIdx] || 0;
    if (financeFilters.incomeFrom !== '' && income < Number(financeFilters.incomeFrom)) return false;
    if (financeFilters.incomeTo !== '' && income > Number(financeFilters.incomeTo)) return false;
    if (financeFilters.profitFrom !== '' && profit < Number(financeFilters.profitFrom)) return false;
    if (financeFilters.profitTo !== '' && profit > Number(financeFilters.profitTo)) return false;
    return true;
  }) : filtered;

  // Map to rows with values for selected year + YOY per metric
  const rows = metricFiltered.map(c => {
    const incomeVal = c.income[yearIdx] || 0;
    const costVal = c.cost[yearIdx] || 0;
    const profitVal = c.profit[yearIdx] || 0;
    const receivableVal = c.receivable[yearIdx] || 0;

    const incomeYoy = hasPrev ? calcYoy(incomeVal, c.income[prevIdx] || 0) : null;
    const costYoy = hasPrev ? calcYoy(costVal, c.cost[prevIdx] || 0) : null;
    const profitYoy = hasPrev ? calcYoy(profitVal, c.profit[prevIdx] || 0) : null;
    const receivableYoy = hasPrev ? calcYoy(receivableVal, c.receivable[prevIdx] || 0) : null;

    return { ...c, incomeVal, costVal, profitVal, receivableVal, incomeYoy, costYoy, profitYoy, receivableYoy };
  });

  // Sort
  const handleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir(col === 'rank' ? 'asc' : 'desc'); }
  };

  const sorted = [...rows].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1;
    if (sortCol === 'rank') return (a.rank - b.rank) * mul;
    if (sortCol === 'income') return (a.incomeVal - b.incomeVal) * mul;
    if (sortCol === 'cost') return (a.costVal - b.costVal) * mul;
    if (sortCol === 'profit') return (a.profitVal - b.profitVal) * mul;
    if (sortCol === 'receivable') return (a.receivableVal - b.receivableVal) * mul;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pagedRows = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Reset page if data changes and page is out of bounds
  if (page >= totalPages && totalPages > 0) setPage(0);

  function SortIcon({ col }: { col: SortCol }) {
    if (sortCol !== col) return <ArrowUpDown style={{ width: '10px', height: '10px', opacity: 0.3, marginLeft: '3px', display: 'inline' }} />;
    return sortDir === 'asc'
      ? <ArrowUp style={{ width: '10px', height: '10px', marginLeft: '3px', display: 'inline' }} />
      : <ArrowDown style={{ width: '10px', height: '10px', marginLeft: '3px', display: 'inline' }} />;
  }

  return (
    <div style={{ background: '#111920', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', boxShadow: 'none' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '1200px', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '80px' }} />
            <col style={{ width: '40px' }} />
            <col style={{ width: '200px' }} />
            <col style={{ width: '220px' }} />
            <col style={{ width: '200px' }} />
            <col style={{ width: '230px' }} />
            <col style={{ width: '230px' }} />
          </colgroup>
          <thead>
            <tr>
              <th style={{ ...TH_STYLE, cursor: 'pointer' }} onClick={() => handleSort('rank')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>№ в рейтинге <SortIcon col="rank" /></div>
              </th>
              <th style={{ ...TH_STYLE, padding: 0 }} />
              <th style={TH_STYLE}>Компания</th>
              <th style={{ ...TH_STYLE, textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('income')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                  Выручка + пр. доходы, тыс ₽ <SortIcon col="income" />
                </div>
              </th>
              <th style={{ ...TH_STYLE, textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('cost')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                  Расходы, тыс ₽ <SortIcon col="cost" />
                </div>
              </th>
              <th style={{ ...TH_STYLE, textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('profit')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                  Чистая прибыль, тыс ₽ <SortIcon col="profit" />
                </div>
              </th>
              <th style={{ ...TH_STYLE, textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('receivable')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                  Дебиторская задолж., тыс ₽ <SortIcon col="receivable" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((row, idx) => {
              const isLast = idx === pagedRows.length - 1;
              const rowBg = idx % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent';

              return (
                <tr
                  key={row.rank}
                  style={{ borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)', background: rowBg }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(13,240,230,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = rowBg)}
                >
                  <td style={TD_STYLE}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>{row.rank}</span>
                  </td>
                  <td style={{ ...TD_STYLE, padding: 0 }}>
                    <Avatar name={row.name} rank={row.rank} inn={row.inn} />
                  </td>
                  <td style={{ ...TD_STYLE, fontWeight: 500, overflow: 'hidden' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{row.name}</span>
                  </td>
                  {/* Выручка + YoY */}
                  <td style={{ ...TD_STYLE, textAlign: 'right', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '6px' }}>
                      <span>{row.incomeVal === 0 ? '—' : fmt(row.incomeVal)}</span>
                      {hasPrev && <YoyBadge yoy={row.incomeYoy} />}
                    </div>
                  </td>
                  {/* Расходы + YoY */}
                  <td style={{ ...TD_STYLE, textAlign: 'right', color: 'rgba(255,255,255,0.7)' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '6px' }}>
                      <span>{row.costVal === 0 ? '—' : fmt(row.costVal)}</span>
                      {hasPrev && <YoyBadge yoy={row.costYoy} />}
                    </div>
                  </td>
                  {/* Чистая прибыль + YoY */}
                  <td style={{ ...TD_STYLE, textAlign: 'right', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '6px' }}>
                      <span style={{ color: row.profitVal >= 0 ? '#0DF0E6' : '#dc2626' }}>
                        {row.profitVal === 0 ? '—' : (row.profitVal < 0 ? `−${fmt(row.profitVal)}` : fmt(row.profitVal))}
                      </span>
                      {hasPrev && <YoyBadge yoy={row.profitYoy} />}
                    </div>
                  </td>
                  {/* Дебиторская задолж. + YoY */}
                  <td style={{ ...TD_STYLE, textAlign: 'right', color: 'rgba(255,255,255,0.7)' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '6px' }}>
                      <span>{row.receivableVal === 0 ? '—' : fmt(row.receivableVal)}</span>
                      {hasPrev && <YoyBadge yoy={row.receivableYoy} />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.4)',
        }}>
          <span>
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} из {sorted.length}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '32px', height: '32px', borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', cursor: page === 0 ? 'default' : 'pointer',
                opacity: page === 0 ? 0.4 : 1,
              }}
            >
              <ChevronLeft style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.7)' }} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: '32px', height: '32px', borderRadius: '6px',
                  border: i === page ? '1px solid #0DF0E6' : '1px solid rgba(255,255,255,0.08)',
                  background: i === page ? 'rgba(13,240,230,0.1)' : 'transparent',
                  color: i === page ? '#0DF0E6' : 'rgba(255,255,255,0.5)',
                  fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                  padding: '0 8px',
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page === totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '32px', height: '32px', borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', cursor: page === totalPages - 1 ? 'default' : 'pointer',
                opacity: page === totalPages - 1 ? 0.4 : 1,
              }}
            >
              <ChevronRight style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.7)' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
