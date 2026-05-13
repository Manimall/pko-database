import type { CSSProperties, RefObject } from 'react';
import { ArrowUpDown } from 'lucide-react';
import type { RatingCompany } from '../../data/ratingData';
import { stripOrgForm } from '../../utils/formatCompanyName';
import { CompanyAvatar } from '../CompanyAvatar';
import { DeltaCell, ProfitCell } from './cells';
import { Pager } from './Pager';
import { type Align, type ExtraColumn, cumulativeLeft, fmt, tdAlignStyle } from './helpers';
import s from './RatingTable.module.css';

interface DesktopTableProps {
  companies: RatingCompany[];
  onCompanyClick?: (inn: string) => void;
  compareMode: boolean;
  selectedInns?: Set<string>;
  onToggleSelect?: (inn: string) => void;
  maxSelected: number;
  extraColumns: ExtraColumn[];
  bodyRef: RefObject<HTMLDivElement>;
  handleBodyScroll: () => void;
  page: number;
  totalPages: number;
  setPage: (n: number | ((p: number) => number)) => void;
  totalCompanies: number;
}

interface ColumnLayout {
  widths: string[];
  headers: string[];
  aligns: Align[];
  stickyLeft: number[];
  stickyCount: number;
  minWidth: string;
}

function alignFlex(a: Align): string {
  return a === 'right' ? s.thAlignRight : a === 'center' ? s.thAlignCenter : s.thAlignLeft;
}

function buildLayout(compareMode: boolean, extraColumns: ExtraColumn[]): ColumnLayout {
  const stickyPx = compareMode ? [40, 56, 48, 36, 180] : [60, 52, 36, 190];
  const stickyLeft = cumulativeLeft(stickyPx);
  const stickyTotalPx = stickyLeft[stickyLeft.length - 1] + stickyPx[stickyPx.length - 1];

  const scrollHeaders = [
    'Выручка + пр. доходы, тыс ₽',
    'Чистая прибыль, тыс ₽',
    'Стаж, лет',
    ...extraColumns.map(ec => ec.header),
  ];
  const scrollAligns: Align[] = ['right', 'right', 'right', ...extraColumns.map(() => 'right' as const)];
  const scrollColWidth = `${(100 / scrollHeaders.length).toFixed(1)}%`;

  const stickyHeaders = compareMode ? ['', '№', 'YoY', '', 'Компания'] : ['№', 'YoY', '', 'Компания'];
  const stickyAligns: Align[] = compareMode
    ? ['center', 'left', 'center', 'left', 'left']
    : ['left', 'center', 'left', 'left'];

  return {
    widths: [...stickyPx.map(w => `${w}px`), ...scrollHeaders.map(() => scrollColWidth)],
    headers: [...stickyHeaders, ...scrollHeaders],
    aligns: [...stickyAligns, ...scrollAligns],
    stickyLeft,
    stickyCount: stickyPx.length,
    minWidth: extraColumns.length > 0
      ? `${stickyTotalPx + scrollHeaders.length * 150}px`
      : '830px',
  };
}

function HeaderRow({ layout, compareMode }: { layout: ColumnLayout; compareMode: boolean }) {
  return (
    <thead>
      <tr>
        {layout.headers.map((h, i) => {
          const isSticky = i < layout.stickyCount;
          const thStyle: CSSProperties = {
            ...tdAlignStyle(layout.aligns[i]),
            ...(h === '' ? { padding: 0 } : {}),
            ...(i === 0 ? { paddingLeft: compareMode ? '16px' : '32px' } : {}),
            ...(i === layout.headers.length - 1 ? { paddingRight: '32px' } : {}),
            ...(isSticky ? { position: 'sticky', left: `${layout.stickyLeft[i]}px`, zIndex: 12 } : {}),
          };
          return (
            <th key={i} className={s.th} style={thStyle}>
              {h && (
                <div className={`${s.thInner} ${alignFlex(layout.aligns[i])}`}>
                  {h} <ArrowUpDown size={10} color="#d1d5db" />
                </div>
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

interface DataRowProps {
  company: RatingCompany;
  idx: number;
  isLast: boolean;
  compareMode: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  hasExtra: boolean;
  extraColumns: ExtraColumn[];
  stickyLeft: number[];
  onClick: () => void;
}

function makeStickyTd(stickyLeft: number[]) {
  return (idx: number, extra?: CSSProperties): CSSProperties => ({
    position: 'sticky',
    left: `${stickyLeft[idx]}px`,
    zIndex: 2,
    ...extra,
  });
}

function DataRow({
  company, idx, isLast, compareMode, isSelected, isDisabled,
  hasExtra, extraColumns, stickyLeft, onClick,
}: DataRowProps) {
  const altBg = idx % 2 === 1;
  const cellBaseCls = isSelected
    ? `${s.td} ${s.tdSelected}`
    : altBg ? `${s.td} ${s.tdAlt}` : s.td;

  const stickyTd = makeStickyTd(stickyLeft);
  let si = 0;

  return (
    <tr
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
        <span className={s.rankNum}>{company.rank}</span>
      </td>

      <td className={cellBaseCls} style={stickyTd(si++, { textAlign: 'center' })}>
        <DeltaCell delta={company.rankDelta} />
      </td>

      <td className={`${cellBaseCls} ${s.tdLogo}`} style={stickyTd(si++)}>
        <CompanyAvatar name={stripOrgForm(company.name)} rank={company.rank} inn={company.inn} />
      </td>

      <td className={`${cellBaseCls} ${s.tdCompanyCell}`} style={stickyTd(si++)}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, gap: '1px' }}>
          <span className={s.companyName}>{stripOrgForm(company.name)}</span>
          <div className={s.companyMeta}>
            {company.city && <span className={s.companyCity}>{company.city}</span>}
            {company.napka && <span className={s.companyNapka}>· НАПКА</span>}
          </div>
        </div>
      </td>

      <td className={`${cellBaseCls} ${s.tdMuted}`}>{fmt(company.revenue)}</td>
      <ProfitCell value={company.profit} baseClass={cellBaseCls} />
      <td className={`${cellBaseCls} ${s.tdMuted}`} style={{ paddingRight: hasExtra ? '16px' : '32px' }}>
        {company.experience}
      </td>

      {extraColumns.map((ec, ecIdx) => (
        <td
          key={ec.key}
          className={`${cellBaseCls} ${s.tdExtra}`}
          style={{
            color: ec.color ? ec.color(company) : undefined,
            paddingRight: ecIdx === extraColumns.length - 1 ? '32px' : '16px',
          }}
        >
          {ec.format(company)}
        </td>
      ))}
    </tr>
  );
}

export function DesktopTable(props: DesktopTableProps) {
  const {
    companies, onCompanyClick, compareMode, selectedInns, onToggleSelect, maxSelected,
    extraColumns, bodyRef, handleBodyScroll, page, totalPages, setPage, totalCompanies,
  } = props;

  const layout = buildLayout(compareMode, extraColumns);
  const hasExtra = extraColumns.length > 0;

  const colgroup = (
    <colgroup>{layout.widths.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
  );

  return (
    <div>
      <div className={s.stickyHeader}>
        <table className={s.table} style={{ minWidth: layout.minWidth }}>
          {colgroup}
          <HeaderRow layout={layout} compareMode={compareMode} />
        </table>
      </div>

      <div className={s.body} ref={bodyRef} onScroll={handleBodyScroll}>
        <table className={s.table} style={{ minWidth: layout.minWidth }}>
          {colgroup}
          <tbody>
            {companies.map((c, idx) => {
              const isSelected = selectedInns?.has(c.inn) ?? false;
              const isDisabled = compareMode && !isSelected && (selectedInns?.size ?? 0) >= maxSelected;
              const onClick = () => {
                if (compareMode) {
                  if (!isDisabled) onToggleSelect?.(c.inn);
                } else {
                  onCompanyClick?.(c.inn);
                }
              };
              return (
                <DataRow
                  key={c.rank}
                  company={c}
                  idx={idx}
                  isLast={idx === companies.length - 1}
                  compareMode={compareMode}
                  isSelected={isSelected}
                  isDisabled={isDisabled}
                  hasExtra={hasExtra}
                  extraColumns={extraColumns}
                  stickyLeft={layout.stickyLeft}
                  onClick={onClick}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      <Pager page={page} totalPages={totalPages} setPage={setPage} totalCompanies={totalCompanies} />
    </div>
  );
}
