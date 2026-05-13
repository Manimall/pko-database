import { ReactNode } from 'react';
import { SiteHeader } from '../components/SiteHeader';
import { Footer } from '../components/Footer';
import s from './PageLayout.module.css';

interface PageLayoutProps {
  activeTab?: 'pko300' | 'thematic';
  onNavigateToRating: () => void;
  onNavigateToThematic: () => void;
  children: ReactNode;
  /** Set false for pages that already manage their own outer padding (e.g. rating with sticky tabs). */
  withContainer?: boolean;
}

export function PageLayout({
  activeTab = 'pko300',
  onNavigateToRating,
  onNavigateToThematic,
  children,
  withContainer = true,
}: PageLayoutProps) {
  return (
    <div className={s.root}>
      <SiteHeader
        activeTab={activeTab}
        onNavigateToRating={onNavigateToRating}
        onNavigateToThematic={onNavigateToThematic}
      />
      {withContainer ? <div className={s.container}>{children}</div> : children}
      <Footer />
    </div>
  );
}
