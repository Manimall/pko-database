import { ExternalLink } from 'lucide-react';
import { siteLoans, corporates, allInvestments } from '../../data/investmentData';
import { stripOrgForm } from '../../utils/formatCompanyName';
import { getPkoRank, getPkoInn } from './helpers';
import { useMobileSticky, NamedAvatar, rowClassName } from './common';
import { TypeBadge, InvestmentTypeBadge } from './badges';
import s from './InvestmentTable.module.css';

interface TableProps {
  onCompanyClick?: (inn: string) => void;
}

function compareByRank<T extends { company: string }>(a: T, b: T): number {
  return (getPkoRank(a.company) ?? 999) - (getPkoRank(b.company) ?? 999);
}

export function LoansTable({ onCompanyClick }: TableProps) {
  const sticky = useMobileSticky();
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
        {[...siteLoans].sort(compareByRank).map(l => {
          const inn = getPkoInn(l.company);
          const canClick = !!(onCompanyClick && inn);
          return (
            <tr
              key={l.company}
              className={rowClassName(canClick)}
              onClick={() => canClick && onCompanyClick!(inn!)}
            >
              <td className={`${s.td} ${s.tdRank}`} style={sticky.rankTd}>{getPkoRank(l.company) ?? '—'}</td>
              <td className={`${s.td} ${s.tdLogo}`} style={sticky.logoTd}><NamedAvatar name={l.company} /></td>
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

export function CorporateTable({ onCompanyClick }: TableProps) {
  const sticky = useMobileSticky();
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
        {[...corporates].sort(compareByRank).map(c => {
          const inn = getPkoInn(c.company);
          const canClick = !!(onCompanyClick && inn);
          return (
            <tr
              key={c.company}
              className={rowClassName(canClick)}
              onClick={() => canClick && onCompanyClick!(inn!)}
            >
              <td className={`${s.td} ${s.tdRank}`} style={sticky.rankTd}>{getPkoRank(c.company) ?? '—'}</td>
              <td className={`${s.td} ${s.tdLogo}`} style={sticky.logoTd}><NamedAvatar name={c.company} /></td>
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

export function AllTable({ onCompanyClick }: TableProps) {
  const sticky = useMobileSticky();
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
        {[...allInvestments].sort(compareByRank).map(r => {
          const inn = getPkoInn(r.company);
          const canClick = !!(onCompanyClick && inn);
          return (
            <tr
              key={r.company + r.type}
              className={rowClassName(canClick)}
              onClick={() => canClick && onCompanyClick!(inn!)}
            >
              <td className={`${s.td} ${s.tdRank}`} style={sticky.rankTd}>{getPkoRank(r.company) ?? '—'}</td>
              <td className={`${s.td} ${s.tdLogo}`} style={sticky.logoTd}><NamedAvatar name={r.company} /></td>
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
