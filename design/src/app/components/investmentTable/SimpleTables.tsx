import { ExternalLink } from 'lucide-react';
import type { SiteLoan, Corporate, AllInvestment } from '../../data/investmentData';
import {
  URLS,
  loadInvestmentLoans,
  loadInvestmentCorporates,
  loadInvestmentAll,
} from '../../data/loader';
import { useAsyncData } from '../../data/useAsyncData';
import { stripOrgForm } from '../../utils/formatCompanyName';
import {
  matchesAllInvestmentSearch,
  matchesCorporateSearch,
  matchesLoanSearch,
  useInvestmentResolver,
  type InvestmentResolver,
} from './helpers';
import { EmptySearchRow, useMobileSticky, NamedAvatar, rowClassName } from './common';
import { TypeBadge, InvestmentTypeBadge } from './badges';
import s from './InvestmentTable.module.css';

interface TableProps {
  onCompanyClick?: (inn: string) => void;
  searchQuery?: string;
}

function makeCompareByRank(resolver: InvestmentResolver) {
  return <T extends { company: string }>(a: T, b: T) =>
    (resolver.getPkoRank(a.company) ?? 999) - (resolver.getPkoRank(b.company) ?? 999);
}

export function LoansTable({ onCompanyClick, searchQuery = '' }: TableProps) {
  const sticky = useMobileSticky();
  const resolver = useInvestmentResolver();
  const { data } = useAsyncData<SiteLoan[]>(URLS.investmentLoans, loadInvestmentLoans);
  const compareByRank = makeCompareByRank(resolver);
  const rows = (data ?? [])
    .filter(row => matchesLoanSearch(row, searchQuery))
    .sort(compareByRank);

  return (
    <table className={s.table}>
      <thead>
        <tr>
          <th className={`${s.th} ${s.thRank}`} style={sticky.rankTh}>№ в<br />ПКО-300</th>
          <th className={`${s.th} ${s.thLogo}`} style={sticky.logoTh} aria-label="Логотип" />
          <th className={s.th}>Компания</th>
          <th className={s.th}>Тип</th>
          <th className={s.th}>Сайт</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && <EmptySearchRow colSpan={5} />}
        {rows.map(l => {
          const inn = resolver.getPkoInn(l.company);
          const canClick = !!(onCompanyClick && inn);
          return (
            <tr
              key={l.company}
              className={rowClassName(canClick)}
              onClick={() => canClick && onCompanyClick!(inn!)}
            >
              <td className={`${s.td} ${s.tdRank}`} style={sticky.rankTd}>{resolver.getPkoRank(l.company) ?? '—'}</td>
              <td className={`${s.td} ${s.tdLogo}`} style={sticky.logoTd}><NamedAvatar name={l.company} resolver={resolver} /></td>
              <td className={`${s.td} ${s.tdName}`}>{stripOrgForm(l.company)}</td>
              <td className={s.td}><TypeBadge type={l.type} /></td>
              <td className={s.td}>
                <div className={s.sitesRow}>
                  {l.sites.map(site => (
                    <a
                      key={site}
                      className={s.siteLink}
                      href={`https://${site}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                    >
                      {site}
                      <ExternalLink style={{ width: '11px', height: '11px', opacity: 0.5 }} />
                    </a>
                  ))}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function CorporateTable({ onCompanyClick, searchQuery = '' }: TableProps) {
  const sticky = useMobileSticky();
  const resolver = useInvestmentResolver();
  const { data } = useAsyncData<Corporate[]>(URLS.investmentCorporates, loadInvestmentCorporates);
  const compareByRank = makeCompareByRank(resolver);
  const rows = (data ?? [])
    .filter(row => matchesCorporateSearch(row, searchQuery))
    .sort(compareByRank);

  return (
    <table className={s.table}>
      <thead>
        <tr>
          <th className={`${s.th} ${s.thRank}`} style={sticky.rankTh}>№ в<br />ПКО-300</th>
          <th className={`${s.th} ${s.thLogo}`} style={sticky.logoTh} aria-label="Логотип" />
          <th className={s.th}>Компания</th>
          <th className={s.th}>Учредитель / Структура</th>
          <th className={s.th}>Тип</th>
          <th className={s.th}>Детали</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && <EmptySearchRow colSpan={6} />}
        {rows.map(c => {
          const inn = resolver.getPkoInn(c.company);
          const canClick = !!(onCompanyClick && inn);
          return (
            <tr
              key={c.company}
              className={rowClassName(canClick)}
              onClick={() => canClick && onCompanyClick!(inn!)}
            >
              <td className={`${s.td} ${s.tdRank}`} style={sticky.rankTd}>{resolver.getPkoRank(c.company) ?? '—'}</td>
              <td className={`${s.td} ${s.tdLogo}`} style={sticky.logoTd}><NamedAvatar name={c.company} resolver={resolver} /></td>
              <td className={`${s.td} ${s.tdName}`}>{stripOrgForm(c.company)}</td>
              <td className={`${s.td} ${s.tdWrap}`} style={{ color: 'rgba(255,255,255,0.7)' }}>{c.founder}</td>
              <td className={s.td}><TypeBadge type={c.structureType} /></td>
              <td className={`${s.td} ${s.tdMuted}`}>{c.details}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function AllTable({ onCompanyClick, searchQuery = '' }: TableProps) {
  const sticky = useMobileSticky();
  const resolver = useInvestmentResolver();
  const { data } = useAsyncData<AllInvestment[]>(URLS.investmentAll, loadInvestmentAll);
  const compareByRank = makeCompareByRank(resolver);
  const rows = (data ?? [])
    .filter(row => matchesAllInvestmentSearch(row, searchQuery))
    .sort(compareByRank);

  return (
    <table className={s.table}>
      <thead>
        <tr>
          <th className={`${s.th} ${s.thRank}`} style={sticky.rankTh}>№ в<br />ПКО-300</th>
          <th className={`${s.th} ${s.thLogo}`} style={sticky.logoTh} aria-label="Логотип" />
          <th className={s.th}>Компания</th>
          <th className={s.th}>Тип привлечения</th>
          <th className={s.th}>Детали</th>
          <th className={s.th}>Подробнее</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && <EmptySearchRow colSpan={6} />}
        {rows.map(r => {
          const inn = resolver.getPkoInn(r.company);
          const canClick = !!(onCompanyClick && inn);
          return (
            <tr
              key={r.company + r.type}
              className={rowClassName(canClick)}
              onClick={() => canClick && onCompanyClick!(inn!)}
            >
              <td className={`${s.td} ${s.tdRank}`} style={sticky.rankTd}>{resolver.getPkoRank(r.company) ?? '—'}</td>
              <td className={`${s.td} ${s.tdLogo}`} style={sticky.logoTd}><NamedAvatar name={r.company} resolver={resolver} /></td>
              <td className={`${s.td} ${s.tdName}`}>{stripOrgForm(r.company)}</td>
              <td className={s.td}><InvestmentTypeBadge type={r.type} /></td>
              <td className={`${s.td} ${s.tdBold}`}>{r.details}</td>
              <td className={`${s.td} ${s.tdMuted} ${s.tdWrap}`}>{r.subDetails}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
