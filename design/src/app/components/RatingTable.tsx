import { useState, useRef, useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { RatingCompany } from '../data/ratingData';
import { logoMap } from '../data/logoMap';
import { useIsMobile } from '../shared/hooks/useIsMobile';
import { stripOrgForm } from '../utils/formatCompanyName';

const PAGE_SIZE = 100;

// ── Compact number formatter for mobile ──
function formatCompact(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1).replace('.0', '')}М`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)}К`;
  return `${sign}${abs}`;
}

export type ExtraColumn = {
  key: string;
  header: string;
  format: (c: RatingCompany) => string;
  color?: (c: RatingCompany) => string;
};

interface RatingTableProps {
  companies: RatingCompany[];
  onCompanyClick?: (inn: string) => void;
  compareMode?: boolean;
  selectedInns?: Set<string>;
  onToggleSelect?: (inn: string) => void;
  maxSelected?: number;
  extraColumns?: ExtraColumn[];
}

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
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <img
          src={`/logos/${logoFile}`}
          alt={name}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          style={{
            maxWidth: '28px',
            maxHeight: '28px',
            objectFit: 'contain',
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        background: bg,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 700,
        flexShrink: 0,
        letterSpacing: 0,
      }}
    >
      {letter}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      style={{
        fontSize: '13px',
        fontWeight: 500,
        color: 'rgba(255,255,255,0.7)',
      }}
    >
      {rank}
    </span>
  );
}

const TH_STYLE: React.CSSProperties = {
  textAlign: 'left',
  padding: '0 16px',
  height: '48px',
  fontSize: '10px',
  color: 'rgba(255,255,255,0.4)',
  fontWeight: 400,
  whiteSpace: 'normal',
  lineHeight: '1.3',
  verticalAlign: 'middle',
  background: '#111920',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  userSelect: 'none',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  position: 'sticky',
  top: 0,
  zIndex: 10,
};

const TD_STYLE: React.CSSProperties = {
  textAlign: 'left',
  padding: '0 16px',
  height: '44px',
  fontSize: '12px',
  color: '#fff',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
  lineHeight: '1.4',
};

export function RatingTable({ companies, onCompanyClick, compareMode = false, selectedInns, onToggleSelect, maxSelected = 5, extraColumns = [] }: RatingTableProps) {
  const isMobile = useIsMobile();
  const [page, setPage] = useState(0);
  const fmt = (n: number) => Math.abs(n).toLocaleString('ru-RU');

  const totalPages = Math.ceil(companies.length / PAGE_SIZE);
  const pagedCompanies = companies.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Reset page if companies change and page is out of bounds
  if (page >= totalPages && totalPages > 0) setPage(0);

  // ── Hooks must be called before any early return ──────────────
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInnerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const handleBodyScroll = useCallback(() => {
    if (!headerInnerRef.current || !bodyRef.current) return;
    // Math.round убирает subpixel jitter — текст в заголовках перестаёт «дёргаться» при скролле
    const sL = Math.round(bodyRef.current.scrollLeft);
    // transform вместо scrollLeft — работает в iOS WebKit, где scrollLeft на overflow:hidden игнорируется
    headerInnerRef.current.style.transform = `translate3d(${-sL}px, 0, 0)`;
  }, []);

  // ── Mobile table view (full columns, sticky №+Company, horizontal scroll) ──
  if (isMobile) {
    const mStickyPx = [50, 40, 150]; // [№, Logo, Компания]
    const mStickyLeft: number[] = [];
    mStickyPx.forEach((w, i) => { mStickyLeft.push(i === 0 ? 0 : mStickyLeft[i - 1] + mStickyPx[i - 1]); });
    const mStickyTotal = mStickyLeft[mStickyLeft.length - 1] + mStickyPx[mStickyPx.length - 1];

    const mScrollHeaders = ['YoY', 'Выручка + пр. доходы, тыс ₽', 'Чистая прибыль, тыс ₽', 'Стаж, лет', ...extraColumns.map(ec => ec.header)];
    const mScrollAligns: ('left' | 'right' | 'center')[] = ['center', 'left', 'right', 'right', ...extraColumns.map(() => 'right' as const)];
    const mScrollWidths = ['44px', '130px', '120px', '60px', ...extraColumns.map(() => '100px')];
    const mColWidths = [...mStickyPx.map(w => `${w}px`), ...mScrollWidths];
    const mColHeaders = ['№', '', 'Компания', ...mScrollHeaders];
    const mColAligns: ('left' | 'right' | 'center')[] = ['center', 'left', 'left', ...mScrollAligns];
    const mStickyCount = mStickyPx.length;
    const mMinWidth = `${mStickyTotal + 44 + 130 + 120 + 60 + extraColumns.length * 100}px`;

    const mTD: React.CSSProperties = {
      ...TD_STYLE,
      padding: '0 8px',
      height: '52px',
      fontSize: '12px',
    };

    const mColgroup = (
      <colgroup>
        {mColWidths.map((w, i) => <col key={i} style={{ width: w }} />)}
      </colgroup>
    );

    return (
      <div>
        {/* Sticky header — два слоя: sticky-колонки поверх + скроллируемые через translateX.
            Избегает iOS WebKit багов: (1) scrollLeft на overflow:hidden игнорируется,
            (2) flex/line-height alignment ломается внутри position:sticky при scroll. */}
        <div
          ref={headerRef}
          style={{
            position: 'sticky', top: 44, zIndex: 11,
            background: '#111920',
            overflow: 'hidden',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
            height: '48px',
            WebkitTransform: 'translateZ(0)' as any,
            transform: 'translateZ(0)',
          }}
        >
          {/* Скроллируемые заголовки (non-sticky) — transform синхронно с body */}
          <div
            ref={headerInnerRef}
            style={{
              position: 'absolute',
              top: 0,
              left: `${mStickyTotal}px`,
              height: '48px',
              display: 'flex',
              willChange: 'transform',
            }}
          >
            {mColHeaders.slice(mStickyCount).map((h, i) => {
              const idx = i + mStickyCount;
              const align = mColAligns[idx];
              return (
                <div key={idx} style={{
                  width: mColWidths[idx],
                  height: '48px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
                  padding: '0 8px',
                }}>
                  <span style={{
                    textAlign: align,
                    fontSize: '9px',
                    color: 'rgba(255,255,255,0.4)',
                    fontWeight: 400,
                    lineHeight: 1.2,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    userSelect: 'none',
                  }}>
                    {h}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Sticky-колонки (№, Logo, Компания) — поверх скроллируемых */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '48px',
            width: `${mStickyTotal}px`,
            zIndex: 2,
            background: '#111920',
            display: 'flex',
          }}>
            {mColHeaders.slice(0, mStickyCount).map((h, i) => {
              const align = mColAligns[i];
              return (
                <div key={i} style={{
                  width: mColWidths[i],
                  height: '48px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
                  padding: '0 8px',
                }}>
                  {h && (
                    <span style={{
                      textAlign: align,
                      fontSize: '9px',
                      color: 'rgba(255,255,255,0.4)',
                      fontWeight: 400,
                      lineHeight: 1.2,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      userSelect: 'none',
                    }}>
                      {h}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable body */}
        <div ref={bodyRef} style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any }} onScroll={handleBodyScroll}>
          <table style={{ width: '100%', minWidth: mMinWidth, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            {mColgroup}
            <tbody>
              {pagedCompanies.map((company, idx) => {
                const delta = company.rankDelta;
                const isLast = idx === pagedCompanies.length - 1;
                const cellBg = idx % 2 === 1 ? '#121a22' : '#111920';

                const mStickyTd = (colIdx: number, extra?: React.CSSProperties): React.CSSProperties => ({
                  ...mTD,
                  position: 'sticky',
                  left: `${mStickyLeft[colIdx]}px`,
                  zIndex: 2,
                  background: cellBg,
                  ...extra,
                });

                return (
                  <tr
                    key={company.rank}
                    style={{
                      borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
                      cursor: onCompanyClick ? 'pointer' : undefined,
                    }}
                    onClick={() => onCompanyClick?.(company.inn)}
                  >
                    {/* № */}
                    <td style={mStickyTd(0, { textAlign: 'center' })}>
                      <RankBadge rank={company.rank} />
                    </td>
                    {/* Logo */}
                    <td style={mStickyTd(1, { padding: '0 4px' })}>
                      <Avatar name={stripOrgForm(company.name)} rank={company.rank} inn={company.inn} />
                    </td>
                    {/* Компания */}
                    <td style={mStickyTd(2, { fontWeight: 500, overflow: 'hidden' })}>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: '1px' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px' }}>{stripOrgForm(company.name)}</span>
                        <span style={{ fontSize: '10px', fontWeight: 400, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {company.city || ''}
                        </span>
                      </div>
                    </td>
                    {/* YoY */}
                    <td style={{ ...mTD, textAlign: 'center' }}>
                      {delta !== 0 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '11px', fontWeight: 600, color: delta > 0 ? '#0DF0E6' : '#ef4444' }}>
                          {delta > 0 ? <ArrowUp style={{ width: '10px', height: '10px' }} /> : <ArrowDown style={{ width: '10px', height: '10px' }} />}
                          {Math.abs(delta)}
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>—</span>
                      )}
                    </td>
                    {/* Выручка */}
                    <td style={{ ...mTD, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                      {fmt(company.revenue)}
                    </td>
                    {/* Прибыль */}
                    <td style={{ ...mTD, textAlign: 'center', fontWeight: 500, color: company.profit >= 0 ? '#0DF0E6' : '#ef4444' }}>
                      {company.profit < 0 ? `−${fmt(company.profit)}` : fmt(company.profit)}
                    </td>
                    {/* Стаж */}
                    <td style={{ ...mTD, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                      {company.experience}
                    </td>
                    {/* Extra columns */}
                    {extraColumns.map((ec) => (
                      <td key={ec.key} style={{ ...mTD, textAlign: 'right', color: ec.color ? ec.color(company) : 'rgba(255,255,255,0.7)' }}>
                        {ec.format(company)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 12px', borderTop: '1px solid rgba(255,255,255,0.04)',
            fontSize: '12px', color: 'rgba(255,255,255,0.4)',
          }}>
            <span>{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, companies.length)} из {companies.length}</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{
                width: '32px', height: '32px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)',
                background: 'transparent', cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.4 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ChevronLeft style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.7)' }} />
              </button>
              <button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)} style={{
                width: '32px', height: '32px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)',
                background: 'transparent', cursor: page === totalPages - 1 ? 'default' : 'pointer', opacity: page === totalPages - 1 ? 0.4 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ChevronRight style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.7)' }} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const hasExtra = extraColumns.length > 0;

  // ── Sticky columns (fixed px widths) ──────────────────────────
  // First N columns are sticky on horizontal scroll: №, YoY, Logo, Компания
  // In compare mode, Checkbox is also sticky.
  const stickyPx = compareMode
    ? [40, 56, 48, 36, 180]   // [☑, №, YoY, Logo, Компания]
    : [60, 52, 36, 190];      // [№, YoY, Logo, Компания]
  const stickyCount = stickyPx.length;
  // Cumulative left offsets for position: sticky
  const stickyLeft: number[] = [];
  stickyPx.forEach((w, i) => { stickyLeft.push(i === 0 ? 0 : stickyLeft[i - 1] + stickyPx[i - 1]); });
  const stickyTotalPx = stickyLeft[stickyLeft.length - 1] + stickyPx[stickyPx.length - 1];

  // ── Scrollable columns ────────────────────────────────────────
  const scrollHeaders = ['Выручка + пр. доходы, тыс ₽', 'Чистая прибыль, тыс ₽', 'Стаж, лет', ...extraColumns.map(ec => ec.header)];
  const scrollAligns: ('left' | 'right' | 'center')[] = ['right', 'right', 'right', ...extraColumns.map(() => 'right' as const)];
  const scrollCount = scrollHeaders.length;
  // Each scrollable column gets equal width of remaining space
  const scrollColWidth = `${(100 / scrollCount).toFixed(1)}%`;

  // ── All columns combined ──────────────────────────────────────
  const stickyHeaders = compareMode
    ? ['', '№', 'YoY', '', 'Компания']
    : ['№', 'YoY', '', 'Компания'];
  const stickyAligns: ('left' | 'right' | 'center')[] = compareMode
    ? ['center', 'left', 'center', 'left', 'left']
    : ['left', 'center', 'left', 'left'];
  const colWidths = [...stickyPx.map(w => `${w}px`), ...scrollHeaders.map(() => scrollColWidth)];
  const colHeaders = [...stickyHeaders, ...scrollHeaders];
  const colAligns: ('left' | 'right' | 'center')[] = [...stickyAligns, ...scrollAligns];

  // ── Scroll sync (hooks declared above early return) ──────────

  const tableMinWidth = hasExtra ? `${stickyTotalPx + scrollCount * 150}px` : '830px';
  const colgroupEl = (
    <colgroup>
      {colWidths.map((w, i) => (
        <col key={i} style={{ width: w }} />
      ))}
    </colgroup>
  );

  return (
    <div>
      {/* ── Sticky header ── */}
      <div
        ref={headerRef}
        style={{
          position: 'sticky',
          top: 56,
          zIndex: 11,
          background: '#111920',
          overflowX: 'hidden',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
        }}
      >
        <table style={{ width: '100%', minWidth: tableMinWidth, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          {colgroupEl}
          <thead>
            <tr>
              {colHeaders.map((h, i) => {
                const isSticky = i < stickyCount;
                return (
                  <th key={i} style={{
                    ...TH_STYLE,
                    borderBottom: 'none',
                    textAlign: colAligns[i],
                    ...(h === '' ? { padding: 0 } : {}),
                    ...(i === 0 ? { paddingLeft: compareMode ? '16px' : '32px' } : {}),
                    ...(i === colHeaders.length - 1 ? { paddingRight: '32px' } : {}),
                    ...(isSticky ? {
                      position: 'sticky',
                      left: `${stickyLeft[i]}px`,
                      zIndex: 12,
                      background: '#111920',
                    } : {}),
                  }}>
                    {h && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: colAligns[i] === 'right' ? 'flex-end' : colAligns[i] === 'center' ? 'center' : 'flex-start', gap: '3px' }}>
                        {h} <ArrowUpDown size={10} color="#d1d5db" />
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
        </table>
      </div>

      {/* ── Scrollable body ── */}
      <div ref={bodyRef} style={{ overflowX: 'auto' }} onScroll={handleBodyScroll}>
        <table style={{ width: '100%', minWidth: tableMinWidth, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          {colgroupEl}
          <tbody>
            {pagedCompanies.map((company, idx) => {
              const delta = company.rankDelta;
              const isLast = idx === pagedCompanies.length - 1;
              const isSelected = selectedInns?.has(company.inn) ?? false;
              const isDisabled = compareMode && !isSelected && (selectedInns?.size ?? 0) >= maxSelected;
              const rowBg = isSelected ? 'rgba(13,240,230,0.06)' : idx % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent';
              const cellBg = isSelected ? 'rgba(13,240,230,0.06)' : idx % 2 === 1 ? '#121a22' : '#111920';

              // Helper: sticky td style for left-pinned columns
              const stickyTd = (colIdx: number, extra?: React.CSSProperties): React.CSSProperties => ({
                ...TD_STYLE,
                position: 'sticky',
                left: `${stickyLeft[colIdx]}px`,
                zIndex: 2,
                background: cellBg,
                ...extra,
              });

              let si = 0; // sticky column index

              return (
                <tr
                  key={company.rank}
                  style={{
                    borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
                    cursor: compareMode ? (isDisabled ? 'default' : 'pointer') : onCompanyClick ? 'pointer' : undefined,
                    opacity: isDisabled ? 0.4 : 1,
                  }}
                  onClick={() => {
                    if (compareMode) {
                      if (!isDisabled) onToggleSelect?.(company.inn);
                    } else {
                      onCompanyClick?.(company.inn);
                    }
                  }}
                  onMouseEnter={e => {
                    if (!isDisabled) {
                      const bg = isSelected ? 'rgba(13,240,230,0.08)' : 'rgba(13,240,230,0.04)';
                      e.currentTarget.querySelectorAll('td').forEach(td => { (td as HTMLElement).style.background = bg; });
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.querySelectorAll('td').forEach((td, i) => {
                      (td as HTMLElement).style.background = i < stickyCount ? cellBg : '';
                    });
                  }}
                >
                  {/* Checkbox (only in compare mode) */}
                  {compareMode && (
                    <td style={stickyTd(si++, { textAlign: 'center', padding: '0 4px 0 12px' })}>
                      <div
                        style={{
                          width: '18px', height: '18px', borderRadius: '4px',
                          border: `1.5px solid ${isSelected ? '#0DF0E6' : 'rgba(255,255,255,0.2)'}`,
                          background: isSelected ? '#0DF0E6' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: isDisabled ? 'default' : 'pointer',
                          transition: 'all 0.1s',
                        }}
                      >
                        {isSelected && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#0a0f15" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </td>
                  )}
                  {/* № */}
                  <td style={stickyTd(si++, { paddingLeft: compareMode ? '12px' : '32px' })}>
                    <RankBadge rank={company.rank} />
                  </td>

                  {/* Динамика YoY */}
                  <td style={stickyTd(si++, { textAlign: 'center' })}>
                    {delta !== 0 ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: delta > 0 ? '#0DF0E6' : '#ef4444',
                        }}
                      >
                        {delta > 0
                          ? <ArrowUp style={{ width: '10px', height: '10px' }} />
                          : <ArrowDown style={{ width: '10px', height: '10px' }} />}
                        {Math.abs(delta)}
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>—</span>
                    )}
                  </td>

                  {/* Logo */}
                  <td style={stickyTd(si++, { padding: 0 })}>
                    <Avatar name={stripOrgForm(company.name)} rank={company.rank} inn={company.inn} />
                  </td>

                  {/* Компания */}
                  <td style={stickyTd(si++, { fontWeight: 500, overflow: 'hidden' })}>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, gap: '1px' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stripOrgForm(company.name)}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {company.city && (
                          <span style={{ fontSize: '11px', fontWeight: 400, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {company.city}
                          </span>
                        )}
                        {company.napka && (
                          <span style={{ fontSize: '9px', fontWeight: 500, color: 'rgba(255,255,255,0.4)', flexShrink: 0, lineHeight: '14px' }}>
                            · НАПКА
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Выручка */}
                  <td style={{ ...TD_STYLE, color: 'rgba(255,255,255,0.7)', textAlign: 'right' }}>
                    {fmt(company.revenue)}
                  </td>

                  {/* Прибыль */}
                  <td style={{ ...TD_STYLE, textAlign: 'right', fontWeight: 500, color: company.profit >= 0 ? '#0DF0E6' : '#ef4444' }}>
                    {company.profit < 0 ? `−${fmt(company.profit)}` : fmt(company.profit)}
                  </td>

                  {/* Стаж */}
                  <td style={{ ...TD_STYLE, color: 'rgba(255,255,255,0.7)', textAlign: 'right', paddingRight: hasExtra ? '16px' : '32px' }}>
                    {company.experience}
                  </td>

                  {/* Dynamic extra columns */}
                  {extraColumns.map((ec, ecIdx) => (
                    <td
                      key={ec.key}
                      style={{
                        ...TD_STYLE,
                        textAlign: 'right',
                        color: ec.color ? ec.color(company) : 'rgba(255,255,255,0.7)',
                        fontFamily: "'Space Grotesk', sans-serif",
                        paddingRight: ecIdx === extraColumns.length - 1 ? '32px' : '16px',
                      }}
                    >
                      {ec.format(company)}
                    </td>
                  ))}
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
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, companies.length)} из {companies.length}
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
