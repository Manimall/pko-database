import type { CSSProperties, RefObject } from 'react';
import type { RatingCompany } from '../../data/ratingData';
import { stripOrgForm } from '../../utils/formatCompanyName';
import { CompanyAvatar } from '../CompanyAvatar';
import { DeltaCell } from './cells';
import { Pager } from './Pager';
import {
  type ExtraColumn, type MobileLayout,
  buildMobileLayout, fmt, justify, STICKY_PX,
} from './helpers';
import s from './RatingTable.module.css';

interface MobileTableProps {
  companies: RatingCompany[];
  onCompanyClick?: (inn: string) => void;
  extraColumns: ExtraColumn[];
  headerInnerRef: RefObject<HTMLDivElement>;
  bodyRef: RefObject<HTMLDivElement>;
  handleBodyScroll: () => void;
  page: number;
  totalPages: number;
  setPage: (n: number | ((p: number) => number)) => void;
  totalCompanies: number;
}

function HeaderRow({ layout }: { layout: MobileLayout }) {
  const stickyCount = STICKY_PX.length;
  return (
    <>
      <div className={s.mobileHeaderSticky} style={{ width: `${layout.stickyTotal}px` }}>
        {layout.colHeaders.slice(0, stickyCount).map((h, i) => (
          <div
            key={i}
            className={s.mobileHeaderCell}
            style={{ width: layout.colWidths[i], justifyContent: justify(layout.colAligns[i]) }}
          >
            {h && <span className={s.mobileHeaderLabel}>{h}</span>}
          </div>
        ))}
      </div>
    </>
  );
}

interface DataRowProps {
  company: RatingCompany;
  idx: number;
  isLast: boolean;
  stickyLeft: number[];
  extraColumns: ExtraColumn[];
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

function DataRow({ company, idx, isLast, stickyLeft, extraColumns, onClick }: DataRowProps) {
  const altBg = idx % 2 === 1;
  const cellBaseCls = altBg ? `${s.td} ${s.mTd} ${s.tdAlt}` : `${s.td} ${s.mTd}`;
  const stickyTd = makeStickyTd(stickyLeft);

  return (
    <tr className={`${s.row} ${isLast ? s.rowLast : ''}`} onClick={onClick}>
      <td className={cellBaseCls} style={stickyTd(0, { textAlign: 'center' })}>
        <span className={s.rankNum}>{company.rank}</span>
      </td>
      <td className={cellBaseCls} style={stickyTd(1, { padding: '0 4px' })}>
        <CompanyAvatar name={stripOrgForm(company.name)} rank={company.rank} inn={company.inn} size={28} />
      </td>
      <td className={`${cellBaseCls} ${s.tdCompanyCell}`} style={stickyTd(2)}>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: '1px' }}>
          <span className={s.companyName} style={{ fontSize: '11.5px' }}>{stripOrgForm(company.name)}</span>
          <span className={s.companyCity} style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.4)' }}>
            {company.city || ''}
          </span>
        </div>
      </td>
      <td className={cellBaseCls} style={{ textAlign: 'center' }}>
        <DeltaCell delta={company.rankDelta} />
      </td>
      <td className={`${cellBaseCls} ${s.tdMuted}`} style={{ textAlign: 'center' }}>{fmt(company.revenue)}</td>
      <td
        className={`${cellBaseCls} ${company.profit >= 0 ? s.tdProfitPos : s.tdProfitNeg}`}
        style={{ textAlign: 'center' }}
      >
        {company.profit < 0 ? `−${fmt(company.profit)}` : fmt(company.profit)}
      </td>
      <td className={`${cellBaseCls} ${s.tdMuted}`} style={{ textAlign: 'center' }}>
        {company.experience}
      </td>
      {extraColumns.map(ec => (
        <td
          key={ec.key}
          className={`${cellBaseCls} ${s.tdExtra}`}
          style={{ color: ec.color ? ec.color(company) : undefined, textAlign: 'center' }}
        >
          {ec.format(company)}
        </td>
      ))}
    </tr>
  );
}

export function MobileTable(props: MobileTableProps) {
  const {
    companies, onCompanyClick, extraColumns,
    headerInnerRef, bodyRef, handleBodyScroll,
    page, totalPages, setPage, totalCompanies,
  } = props;

  const layout = buildMobileLayout(extraColumns);
  const stickyCount = STICKY_PX.length;

  return (
    <div>
      <div className={`${s.stickyHeader} ${s.stickyHeaderMobile}`}>
        <div
          ref={headerInnerRef}
          className={s.mobileHeaderInner}
          style={{ left: `${layout.stickyTotal}px` }}
        >
          {layout.colHeaders.slice(stickyCount).map((h, i) => {
            const idx = i + stickyCount;
            return (
              <div
                key={idx}
                className={s.mobileHeaderCell}
                style={{ width: layout.colWidths[idx], justifyContent: justify(layout.colAligns[idx]) }}
              >
                <span className={s.mobileHeaderLabel}>{h}</span>
              </div>
            );
          })}
        </div>
        <HeaderRow layout={layout} />
      </div>

      <div className={s.body} ref={bodyRef} onScroll={handleBodyScroll}>
        <table className={s.table} style={{ width: layout.minWidth, minWidth: layout.minWidth }}>
          <colgroup>{layout.colWidths.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
          <tbody>
            {companies.map((c, idx) => (
              <DataRow
                key={c.rank}
                company={c}
                idx={idx}
                isLast={idx === companies.length - 1}
                stickyLeft={layout.stickyLeft}
                extraColumns={extraColumns}
                onClick={() => onCompanyClick?.(c.inn)}
              />
            ))}
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
