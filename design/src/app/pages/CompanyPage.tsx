import { lazy, Suspense, useEffect, useState } from 'react';
import { ratingData } from '../data/ratingData';
import { PageLayout } from './PageLayout';
import type { Router } from '../routing';
import type { CompanyDetails } from '../data/companyDetails';

// Code-split: CompanyCard + companyDetails + financeDynamic pull a separate chunk
// (~55 KB gzip) that loads only when the user actually opens a company card.
const CompanyCard = lazy(() =>
  import('../components/companyCard').then(m => ({ default: m.CompanyCard }))
);

interface CompanyPageProps {
  inn: string;
  router: Router;
  /** Render fallback when INN is unknown (so caller can show the rating page instead). */
  renderUnknown: () => JSX.Element;
}

export function CompanyPage({ inn, router, renderUnknown }: CompanyPageProps) {
  const comp = ratingData.find(c => c.inn === inn);
  const [details, setDetails] = useState<CompanyDetails | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    import('../data/companyDetails').then(m => {
      if (!cancelled) setDetails(m.companyDetailsMap[inn] ?? null);
    });
    return () => { cancelled = true; };
  }, [inn]);

  if (!comp) return renderUnknown();
  if (details === null) return renderUnknown();

  return (
    <PageLayout
      activeTab="pko300"
      onNavigateToRating={router.goRating}
      onNavigateToThematic={router.goThematic}
    >
      <Suspense fallback={null}>
        {details && (
          <CompanyCard company={comp} details={details} onBack={router.goRating} />
        )}
      </Suspense>
    </PageLayout>
  );
}
