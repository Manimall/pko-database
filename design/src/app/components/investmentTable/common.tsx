import { type CSSProperties } from 'react';
import { useIsMobile } from '../../shared/hooks/useIsMobile';
import { stripOrgForm } from '../../utils/formatCompanyName';
import { CompanyAvatar } from '../CompanyAvatar';
import type { InvestmentResolver } from './helpers';
import s from './InvestmentTable.module.css';

export interface StickyCols {
  rankTh: CSSProperties;
  logoTh: CSSProperties;
  rankTd: CSSProperties;
  logoTd: CSSProperties;
}

export function useMobileSticky(): StickyCols {
  const isMobile = useIsMobile();
  if (!isMobile) return { rankTh: {}, logoTh: {}, rankTd: {}, logoTd: {} };
  return {
    rankTh: { position: 'sticky', left: 0,      zIndex: 3, background: 'var(--bg-card)' },
    logoTh: { position: 'sticky', left: '44px', zIndex: 3, background: 'var(--bg-card)' },
    rankTd: { position: 'sticky', left: 0,      zIndex: 1, background: 'var(--bg-card)' },
    logoTd: { position: 'sticky', left: '44px', zIndex: 1, background: 'var(--bg-card)' },
  };
}

export function NamedAvatar({ name, resolver }: { name: string; resolver: InvestmentResolver }) {
  const inn = resolver.getPkoInn(name);
  const rank = resolver.getPkoRank(name) ?? 0;
  return (
    <CompanyAvatar
      name={stripOrgForm(name)}
      rank={rank}
      inn={inn ?? '__missing__'}
    />
  );
}

export function rowClassName(canClick: boolean): string {
  return `${s.row} ${canClick ? '' : s.rowDefault}`;
}

export function EmptySearchRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td className={s.emptyCell} colSpan={colSpan}>
        По вашему запросу ничего не найдено
      </td>
    </tr>
  );
}
