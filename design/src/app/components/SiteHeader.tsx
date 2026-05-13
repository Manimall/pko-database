import { useIsMobile } from '../shared/hooks/useIsMobile';
import s from './SiteHeader.module.css';

type Tab = 'pko300' | 'thematic';

interface SiteHeaderProps {
  activeTab?: Tab;
  onNavigateToThematic?: () => void;
  onNavigateToRating?: () => void;
}

interface NavItem {
  key: Tab;
  label: string;
  shortLabel: string;
  onClick?: () => void;
}

export function SiteHeader({
  activeTab = 'pko300',
  onNavigateToThematic,
  onNavigateToRating,
}: SiteHeaderProps) {
  const isMobile = useIsMobile();

  const items: NavItem[] = [
    { key: 'pko300',   label: 'ПКО-300',               shortLabel: 'ПКО-300',      onClick: onNavigateToRating },
    { key: 'thematic', label: 'Тематические рейтинги', shortLabel: 'Тематические', onClick: onNavigateToThematic },
  ];

  return (
    <header className={s.header}>
      <div className={s.brandSide}>
        <div className={s.logoBox}>
          <img src="/logo-rvdp.png" alt="Рынок Взыскания и Debt Price" />
          <a className={s.logoBoxHalf} style={{ left: 0 }} href="https://debtprice.market/" target="_blank" rel="noopener noreferrer" title="Debt Price" />
          <a className={s.logoBoxHalf} style={{ right: 0 }} href="https://rvzrus.ru/"        target="_blank" rel="noopener noreferrer" title="Рынок Взыскания" />
        </div>

        {!isMobile && <div className={s.divider} />}

        {!isMobile && (
          <Nav items={items} activeTab={activeTab} />
        )}

        {isMobile && (
          <a className={s.navigatorLink} href="https://navigator.debt-tech.ru/" target="_blank" rel="noopener noreferrer">
            <img src="/logo-navigator.png" alt="Навигатор" />
          </a>
        )}
      </div>

      {isMobile && <Nav items={items} activeTab={activeTab} mobile />}

      {!isMobile && (
        <a className={s.navigatorLink} href="https://navigator.debt-tech.ru/" target="_blank" rel="noopener noreferrer">
          <img src="/logo-navigator.png" alt="Навигатор" />
        </a>
      )}
    </header>
  );
}

function Nav({ items, activeTab, mobile }: { items: NavItem[]; activeTab: Tab; mobile?: boolean }) {
  return (
    <nav className={s.nav}>
      {items.map(item => {
        const isActive = activeTab === item.key;
        return (
          <a
            key={item.key}
            href="#"
            className={`${s.navItem} ${isActive ? s.navItemActive : ''}`}
            onClick={e => { e.preventDefault(); item.onClick?.(); }}
          >
            {mobile ? item.shortLabel : item.label}
          </a>
        );
      })}
    </nav>
  );
}
