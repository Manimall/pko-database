import { type CSSProperties, type ReactNode, useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import type { Bond } from '../../data/investmentData';
import { URLS, loadInvestmentBonds } from '../../data/loader';
import { useAsyncData } from '../../data/useAsyncData';
import { stripOrgForm } from '../../utils/formatCompanyName';
import { matchesBondSearch, useInvestmentResolver, type InvestmentResolver } from './helpers';
import { EmptySearchRow, useMobileSticky, NamedAvatar, rowClassName } from './common';
import { StatusBadge, RatingBadge } from './badges';
import s from './InvestmentTable.module.css';

type SortKey = 'pkoRank' | 'company' | 'rating' | 'coupon' | 'volume' | 'status' | 'repayment';

interface BondsTableProps {
  onCompanyClick?: (inn: string) => void;
  searchQuery?: string;
}

function sortBonds(
  rows: Bond[],
  key: SortKey,
  dir: 'asc' | 'desc',
  resolver: InvestmentResolver,
): Bond[] {
  const mul = dir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    if (key === 'pkoRank') {
      return ((resolver.getPkoRank(a.company) ?? 999) - (resolver.getPkoRank(b.company) ?? 999)) * mul;
    }
    if (key === 'volume') {
      return ((a.volume ?? -1) - (b.volume ?? -1)) * mul;
    }
    const av = (a as Record<string, string | number | null>)[key] as string ?? '';
    const bv = (b as Record<string, string | number | null>)[key] as string ?? '';
    return av.localeCompare(bv, 'ru') * mul;
  });
}

interface SortableThProps {
  sortKey: SortKey;
  currentKey: SortKey;
  dir: 'asc' | 'desc';
  onSort: (k: SortKey) => void;
  children: ReactNode;
  style?: CSSProperties;
}

function SortableTh({ sortKey, currentKey, dir, onSort, children, style }: SortableThProps) {
  const active = currentKey === sortKey;
  return (
    <th className={`${s.th} ${s.thSortable}`} style={style} onClick={() => onSort(sortKey)}>
      <span className={s.thInner}>
        <span>{children}</span>
        {active
          ? dir === 'asc'
            ? <ArrowUp   style={{ width: '10px', height: '10px' }} />
            : <ArrowDown style={{ width: '10px', height: '10px' }} />
          : <ArrowUpDown style={{ width: '10px', height: '10px', opacity: 0.25 }} />}
      </span>
    </th>
  );
}

export function BondsTable({ onCompanyClick, searchQuery = '' }: BondsTableProps) {
  const sticky = useMobileSticky();
  const resolver = useInvestmentResolver();
  const { data } = useAsyncData<Bond[]>(URLS.investmentBonds, loadInvestmentBonds);
  const [sortKey, setSortKey] = useState<SortKey>('pkoRank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('asc'); }
  };

  const filtered = (data ?? []).filter(row => matchesBondSearch(row, searchQuery));
  const sorted = sortBonds(filtered, sortKey, sortDir, resolver);
  const thProps = (k: SortKey) => ({ sortKey: k, currentKey: sortKey, dir: sortDir, onSort: handleSort });

  return (
    <table className={s.table}>
      <thead>
        <tr>
          <SortableTh {...thProps('pkoRank')} style={sticky.rankTh}>
            <span className={s.thRank}>№ в<br />ПКО-300</span>
          </SortableTh>
          <th className={`${s.th} ${s.thLogo}`} style={sticky.logoTh} aria-label="Логотип" />
          <SortableTh {...thProps('company')}>Компания</SortableTh>
          <SortableTh {...thProps('rating')}>Рейтинг</SortableTh>
          <th className={s.th}>ISIN / Погашение</th>
          <SortableTh {...thProps('coupon')}>Купон</SortableTh>
          <SortableTh {...thProps('volume')}>Объём, млн ₽</SortableTh>
          <th className={s.th}>Площадка</th>
          <SortableTh {...thProps('status')}>Статус</SortableTh>
        </tr>
      </thead>
      <tbody>
        {sorted.length === 0 && <EmptySearchRow colSpan={9} />}
        {sorted.map((b, idx) => {
          const inn = resolver.getPkoInn(b.company);
          const canClick = !!(onCompanyClick && inn);
          return (
            <tr
              key={b.isin + b.company + idx}
              className={rowClassName(canClick)}
              onClick={() => canClick && onCompanyClick!(inn!)}
            >
              <td className={`${s.td} ${s.tdRank}`} style={sticky.rankTd}>{resolver.getPkoRank(b.company) ?? '—'}</td>
              <td className={`${s.td} ${s.tdLogo}`} style={sticky.logoTd}><NamedAvatar name={b.company} resolver={resolver} /></td>
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
