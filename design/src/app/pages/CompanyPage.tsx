import { lazy, Suspense } from 'react';
import type { RatingCompany } from '../data/ratingData';
import type { CompanyDetails } from '../data/companyDetails';
import { URLS, loadRatingData, loadCompanyDetails } from '../data/loader';
import { useAsyncData } from '../data/useAsyncData';
import { PageLayout } from './PageLayout';
import type { Router } from '../routing';

// Code-split: CompanyCard pulls a separate JS chunk only on first open.
// Company-details JSON (~124 KB gzip) is also loaded on demand here.
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
  const { data: companies } = useAsyncData<RatingCompany[]>(URLS.rating, loadRatingData);
  const { data: detailsMap, loading: detailsLoading } =
    useAsyncData<Record<string, CompanyDetails>>(URLS.companyDetails, loadCompanyDetails);

  // Wait for rating data before deciding the INN is unknown — otherwise we'd flash the rating page.
  if (!companies) return null;
  const company = companies.find(c => c.inn === inn);
  if (!company) return renderUnknown();

  if (detailsLoading) return null;
  const details = detailsMap?.[inn];
  if (!details) return renderUnknown();

  return (
    <PageLayout
      activeTab="pko300"
      onNavigateToRating={router.goRating}
      onNavigateToThematic={router.goThematic}
    >
      <Suspense fallback={null}>
        <CompanyCard company={company} details={details} onBack={router.goRating} />
      </Suspense>
    </PageLayout>
  );
}
