import { useRef, useState, useCallback, type CSSProperties } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { RatingCompany } from '../data/ratingData';
import { useIsMobile } from '../shared/hooks/useIsMobile';
import { stripOrgForm } from '../utils/formatCompanyName';
import { CompanyAvatar } from './CompanyAvatar';
import s from './RatingTable.module.css';

const PAGE_SIZE = 100;
const fmt = (n: number) => Math.abs(n).toLocaleString('ru-RU');

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

type Align = 'left' | 'right' | 'center';

// ── Helpers ─────────────────────────────────────────────────────

function cumulativeLeft(widths: number[]): number[] {
  const result: number[] = [];
  widths.forEach((_, i) => {
    result.push(i === 0 ? 0 : result[i - 1] + widths[i - 1]);
  });
  return result;
}

function alignClass(a: Align): string {
  return a === 'right' ? s.thAlignRight : a === 'center' ? s.thAlignCenter : s.thAlignLeft;
}

function tdAlignStyle(a: Align): CSSProperties {
  if (a === 'right')  return { textAlign: 'right' };
  if (a === 'center') return { textAlign: 'center' };
  return {};
}

// ── Delta cell (YoY rank change) ────────────────────────────────

function DeltaCell({ delta }: { delta: number }) {
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

// ── Profit cell ─────────────────────────────────────────────────

function ProfitCell({ value, style }: { value: number; style?: CSSProperties }) {
  const cls = value >= 0 ? s.tdProfitPos : s.tdProfitNeg;
  return (
    <td className={`${s.td} ${cls}`} style={style}>
      {value < 0 ? `−${fmt(value)}` : fmt(value)}
    </td>
  );
}

// ── Main ────────────────────────────────────────────────────────

export function RatingTable({
  companies,
  onCompanyClick,
  compareMode = false,
  selectedInns,
  onToggleSelect,
  maxSelected = 5,
  extraColumns = [],
}: RatingTableProps) {
  const isMobile = useIsMobile();
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(companies.length / PAGE_SIZE);
  const pagedCompanies = companies.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  if (page >= totalPages && totalPages > 0) setPage(0);

  // Scroll sync: header uses transform; body has scrollLeft.
  // Math.round eliminates subpixel jitter; iOS WebKit drops scrollLeft on overflow:hidden, so we use transform there.
  const headerInnerRef = useRef<HTMLDivElement>(null);
  const headerTableRef = useRef<HTMLTableElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const handleBodyScroll = useCallback(() => {
    if (!bodyRef.current) return;
    const sL = Math.round(bodyRef.current.scrollLeft);
    if (headerInnerRef.current) {
      headerInnerRef.current.style.transform = `translate3d(${-sL}px, 0, 0)`;
    }
    if (headerTableRef.current) {
      // Desktop: shift the header table inside its overflow-hidden wrapper.
      headerTableRef.current.style.transform = `translate3d(${-sL}px, 0, 0)`;
    }
  }, []);

  if (isMobile) {
    return (
      <MobileTable
        companies={pagedCompanies}
        onCompanyClick={onCompanyClick}
        extraColumns={extraColumns}
        headerInnerRef={headerInnerRef}
        bodyRef={bodyRef}
        handleBodyScroll={handleBodyScroll}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        totalCompanies={companies.length}
      />
    );
  }

  return (
    <DesktopTable
      companies={pagedCompanies}
      onCompanyClick={onCompanyClick}
      compareMode={compareMode}
      selectedInns={selectedInns}
      onToggleSelect={onToggleSelect}
      maxSelected={maxSelected}
      extraColumns={extraColumns}
      bodyRef={bodyRef}
      handleBodyScroll={handleBodyScroll}
      page={page}
      totalPages={totalPages}
      setPage={setPage}
      totalCompanies={companies.length}
    />
  );
}

// ── Desktop layout ──────────────────────────────────────────────

interface DesktopProps {
  companies: RatingCompany[];
  onCompanyClick?: (inn: string) => void;
  compareMode: boolean;
  selectedInns?: Set<string>;
  onToggleSelect?: (inn: string) => void;
  maxSelected: number;
  extraColumns: ExtraColumn[];
  bodyRef: React.RefObject<HTMLDivElement>;
  handleBodyScroll: () => void;
  page: number;
  totalPages: number;
  setPage: (n: number | ((p: number) => number)) => void;
  totalCompanies: number;
}

function DesktopTable({
  companies, onCompanyClick, compareMode, selectedInns, onToggleSelect, maxSelected,
  extraColumns, bodyRef, handleBodyScroll, page, totalPages, setPage, totalCompanies,
}: DesktopProps) {
  const hasExtra = extraColumns.length > 0;

  const stickyPx = compareMode
    ? [40, 56, 48, 36, 180]
    : [60, 52, 36, 190];
  const stickyLeft = cumulativeLeft(stickyPx);
  const stickyTotalPx = stickyLeft[stickyLeft.length - 1] + stickyPx[stickyPx.length - 1];
  const stickyCount = stickyPx.length;

  const scrollHeaders = ['Выручка + пр. доходы, тыс ₽', 'Чистая прибыль, тыс ₽', 'Стаж, лет', ...extraColumns.map(ec => ec.header)];
  const scrollAligns: Align[] = ['right', 'right', 'right', ...extraColumns.map(() => 'right' as const)];
  const scrollColWidth = `${(100 / scrollHeaders.length).toFixed(1)}%`;

  const stickyHeaders = compareMode ? ['', '№', 'YoY', '', 'Компания'] : ['№', 'YoY', '', 'Компания'];
  const stickyAligns: Align[] = compareMode
    ? ['center', 'left', 'center', 'left', 'left']
    : ['left', 'center', 'left', 'left'];
  const colWidths = [...stickyPx.map(w => `${w}px`), ...scrollHeaders.map(() => scrollColWidth)];
  const colHeaders = [...stickyHeaders, ...scrollHeaders];
  const colAligns: Align[] = [...stickyAligns, ...scrollAligns];

  const tableMinWidth = hasExtra ? `${stickyTotalPx + scrollHeaders.length * 150}px` : '830px';

  const stickyTd = (idx: number, extra?: CSSProperties): CSSProperties => ({
    position: 'sticky',
    left: `${stickyLeft[idx]}px`,
    zIndex: 2,
    ...extra,
  });

  const colgroup = (
    <colgroup>{colWidths.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
  );

  return (
    <div>
      <div className={s.stickyHeader}>
        <table className={s.table} ref={undefined} style={{ minWidth: tableMinWidth }}>
          {colgroup}
          <thead>
            <tr>
              {colHeaders.map((h, i) => {
                const isSticky = i < stickyCount;
                const thStyle: CSSProperties = {
                  ...tdAlignStyle(colAligns[i]),
                  ...(h === '' ? { padding: 0 } : {}),
                  ...(i === 0 ? { paddingLeft: compareMode ? '16px' : '32px' } : {}),
                  ...(i === colHeaders.length - 1 ? { paddingRight: '32px' } : {}),
                  ...(isSticky ? { position: 'sticky', left: `${stickyLeft[i]}px`, zIndex: 12 } : {}),
                };
                return (
                  <th key={i} className={s.th} style={thStyle}>
                    {h && (
                      <div className={`${s.thInner} ${alignClass(colAligns[i])}`}>
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

      <div className={s.body} ref={bodyRef} onScroll={handleBodyScroll}>
        <table className={s.table} style={{ minWidth: tableMinWidth }}>
          {colgroup}
          <tbody>
            {companies.map((c, idx) => {
              const isLast = idx === companies.length - 1;
              const isSelected = selectedInns?.has(c.inn) ?? false;
              const isDisabled = compareMode && !isSelected && (selectedInns?.size ?? 0) >= maxSelected;
              const altBg = idx % 2 === 1;

              const cellBaseCls = isSelected
                ? `${s.td} ${s.tdSelected}`
                : altBg ? `${s.td} ${s.tdAlt}` : s.td;

              let si = 0;
              const onClick = () => {
                if (compareMode) {
                  if (!isDisabled) onToggleSelect?.(c.inn);
                } else {
                  onCompanyClick?.(c.inn);
                }
              };

              return (
                <tr
                  key={c.rank}
                  className={`${s.row} ${isLast ? s.rowLast : ''} ${isDisabled ? s.rowDisabled : ''}`}
                  onClick={onClick}
                >
                  {compareMode && (
                    <td className={cellBaseCls} style={stickyTd(si++, { textAlign: 'center', padding: '0 4px 0 12px' })}>
                      <div className={`${s.checkbox} ${isSelected ? s.checkboxActive : ''} ${isDisabled ? s.checkboxDisabled : ''}`}>
                        {isSelected && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#0a0f15" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </td>
                  )}

                  <td className={cellBaseCls} style={stickyTd(si++, { paddingLeft: compareMode ? '12px' : '32px' })}>
                    <span className={s.rankNum}>{c.rank}</span>
                  </td>

                  <td className={cellBaseCls} style={stickyTd(si++, { textAlign: 'center' })}>
                    <DeltaCell delta={c.rankDelta} />
                  </td>

                  <td className={`${cellBaseCls} ${s.tdLogo}`} style={stickyTd(si++)}>
                    <CompanyAvatar name={stripOrgForm(c.name)} rank={c.rank} inn={c.inn} />
                  </td>

                  <td className={`${cellBaseCls} ${s.tdCompanyCell}`} style={stickyTd(si++)}>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, gap: '1px' }}>
                      <span className={s.companyName}>{stripOrgForm(c.name)}</span>
                      <div className={s.companyMeta}>
                        {c.city && <span className={s.companyCity}>{c.city}</span>}
                        {c.napka && <span className={s.companyNapka}>· НАПКА</span>}
                      </div>
                    </div>
                  </td>

                  <td className={`${cellBaseCls} ${s.tdMuted}`}>{fmt(c.revenue)}</td>
                  <ProfitCell value={c.profit} />
                  <td className={`${cellBaseCls} ${s.tdMuted}`} style={{ paddingRight: hasExtra ? '16px' : '32px' }}>
                    {c.experience}
                  </td>

                  {extraColumns.map((ec, ecIdx) => (
                    <td
                      key={ec.key}
                      className={`${cellBaseCls} ${s.tdExtra}`}
                      style={{
                        color: ec.color ? ec.color(c) : undefined,
                        paddingRight: ecIdx === extraColumns.length - 1 ? '32px' : '16px',
                      }}
                    >
                      {ec.format(c)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pager page={page} totalPages={totalPages} setPage={setPage} totalCompanies={totalCompanies} />
    </div>
  );
}

// ── Mobile layout ───────────────────────────────────────────────

interface MobileProps {
  companies: RatingCompany[];
  onCompanyClick?: (inn: string) => void;
  extraColumns: ExtraColumn[];
  headerInnerRef: React.RefObject<HTMLDivElement>;
  bodyRef: React.RefObject<HTMLDivElement>;
  handleBodyScroll: () => void;
  page: number;
  totalPages: number;
  setPage: (n: number | ((p: number) => number)) => void;
  totalCompanies: number;
}

function MobileTable({
  companies, onCompanyClick, extraColumns,
  headerInnerRef, bodyRef, handleBodyScroll,
  page, totalPages, setPage, totalCompanies,
}: MobileProps) {
  const stickyPx = [50, 40, 150]; // [№, Logo, Компания]
  const stickyLeft = cumulativeLeft(stickyPx);
  const stickyTotal = stickyLeft[stickyLeft.length - 1] + stickyPx[stickyPx.length - 1];

  const scrollHeaders = ['YoY', 'Выручка + пр. доходы, тыс ₽', 'Чистая прибыль, тыс ₽', 'Стаж, лет', ...extraColumns.map(ec => ec.header)];
  const scrollAligns: Align[] = ['center', 'left', 'right', 'right', ...extraColumns.map(() => 'right' as const)];
  const scrollWidths = ['44px', '130px', '120px', '60px', ...extraColumns.map(() => '100px')];

  const colWidths = [...stickyPx.map(w => `${w}px`), ...scrollWidths];
  const colHeaders = ['№', '', 'Компания', ...scrollHeaders];
  const colAligns: Align[] = ['center', 'left', 'left', ...scrollAligns];
  const stickyCount = stickyPx.length;
  const minWidth = `${stickyTotal + 44 + 130 + 120 + 60 + extraColumns.length * 100}px`;

  const stickyTd = (idx: number, extra?: CSSProperties): CSSProperties => ({
    position: 'sticky',
    left: `${stickyLeft[idx]}px`,
    zIndex: 2,
    ...extra,
  });

  return (
    <div>
      <div className={`${s.stickyHeader} ${s.stickyHeaderMobile}`}>
        <div
          ref={headerInnerRef}
          className={s.mobileHeaderInner}
          style={{ left: `${stickyTotal}px` }}
        >
          {colHeaders.slice(stickyCount).map((h, i) => {
            const idx = i + stickyCount;
            const a = colAligns[idx];
            return (
              <div
                key={idx}
                className={s.mobileHeaderCell}
                style={{
                  width: colWidths[idx],
                  justifyContent: a === 'center' ? 'center' : a === 'right' ? 'flex-end' : 'flex-start',
                }}
              >
                <span className={s.mobileHeaderLabel}>{h}</span>
              </div>
            );
          })}
        </div>
        <div className={s.mobileHeaderSticky} style={{ width: `${stickyTotal}px` }}>
          {colHeaders.slice(0, stickyCount).map((h, i) => {
            const a = colAligns[i];
            return (
              <div
                key={i}
                className={s.mobileHeaderCell}
                style={{
                  width: colWidths[i],
                  justifyContent: a === 'center' ? 'center' : a === 'right' ? 'flex-end' : 'flex-start',
                }}
              >
                {h && <span className={s.mobileHeaderLabel}>{h}</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className={s.body} ref={bodyRef} onScroll={handleBodyScroll}>
        <table className={s.table} style={{ minWidth }}>
          <colgroup>{colWidths.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
          <tbody>
            {companies.map((c, idx) => {
              const isLast = idx === companies.length - 1;
              const altBg = idx % 2 === 1;
              const cellBaseCls = altBg ? `${s.td} ${s.mTd} ${s.tdAlt}` : `${s.td} ${s.mTd}`;

              return (
                <tr
                  key={c.rank}
                  className={`${s.row} ${isLast ? s.rowLast : ''}`}
                  onClick={() => onCompanyClick?.(c.inn)}
                >
                  <td className={cellBaseCls} style={stickyTd(0, { textAlign: 'center' })}>
                    <span className={s.rankNum}>{c.rank}</span>
                  </td>
                  <td className={cellBaseCls} style={stickyTd(1, { padding: '0 4px' })}>
                    <CompanyAvatar name={stripOrgForm(c.name)} rank={c.rank} inn={c.inn} />
                  </td>
                  <td className={`${cellBaseCls} ${s.tdCompanyCell}`} style={stickyTd(2)}>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: '1px' }}>
                      <span className={s.companyName} style={{ fontSize: '12px' }}>{stripOrgForm(c.name)}</span>
                      <span className={s.companyCity} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                        {c.city || ''}
                      </span>
                    </div>
                  </td>
                  <td className={cellBaseCls} style={{ textAlign: 'center' }}>
                    <DeltaCell delta={c.rankDelta} />
                  </td>
                  <td className={`${cellBaseCls} ${s.tdMuted}`} style={{ textAlign: 'center' }}>{fmt(c.revenue)}</td>
                  <td
                    className={`${cellBaseCls} ${c.profit >= 0 ? s.tdProfitPos : s.tdProfitNeg}`}
                    style={{ textAlign: 'center' }}
                  >
                    {c.profit < 0 ? `−${fmt(c.profit)}` : fmt(c.profit)}
                  </td>
                  <td className={`${cellBaseCls} ${s.tdMuted}`} style={{ textAlign: 'center' }}>
                    {c.experience}
                  </td>
                  {extraColumns.map(ec => (
                    <td
                      key={ec.key}
                      className={`${cellBaseCls} ${s.tdExtra}`}
                      style={{ color: ec.color ? ec.color(c) : undefined }}
                    >
                      {ec.format(c)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pager
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        totalCompanies={totalCompanies}
        mobile
      />
    </div>
  );
}

// ── Pager ───────────────────────────────────────────────────────

interface PagerProps {
  page: number;
  totalPages: number;
  setPage: (n: number | ((p: number) => number)) => void;
  totalCompanies: number;
  mobile?: boolean;
}

function Pager({ page, totalPages, setPage, totalCompanies, mobile }: PagerProps) {
  if (totalPages <= 1) return null;
  const first = page * PAGE_SIZE + 1;
  const last = Math.min((page + 1) * PAGE_SIZE, totalCompanies);
  return (
    <div className={`${s.pager} ${mobile ? s.pagerMobile : ''}`}>
      <span>{first}–{last} из {totalCompanies}</span>
      <div className={s.pagerNav}>
        <button
          type="button"
          className={s.pagerBtn}
          disabled={page === 0}
          onClick={() => setPage(p => (p as number) - 1)}
        >
          <ChevronLeft style={{ width: '16px', height: '16px' }} />
        </button>
        {!mobile && Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`${s.pagerNum} ${i === page ? s.pagerNumActive : ''}`}
            onClick={() => setPage(i)}
          >
            {i + 1}
          </button>
        ))}
        <button
          type="button"
          className={s.pagerBtn}
          disabled={page === totalPages - 1}
          onClick={() => setPage(p => (p as number) + 1)}
        >
          <ChevronRight style={{ width: '16px', height: '16px' }} />
        </button>
      </div>
    </div>
  );
}
