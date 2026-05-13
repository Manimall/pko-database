import { CompanyCard } from '../components/CompanyCard';
import { ratingData } from '../data/ratingData';
import { companyDetailsMap } from '../data/companyDetails';
import { PageLayout } from './PageLayout';
import type { Router } from '../routing';

interface CompanyPageProps {
  inn: string;
  router: Router;
  /** Render fallback when INN is unknown (so caller can show the rating page instead). */
  renderUnknown: () => JSX.Element;
}

export function CompanyPage({ inn, router, renderUnknown }: CompanyPageProps) {
  const comp = ratingData.find(c => c.inn === inn);
  const det = companyDetailsMap[inn];

  if (!comp || !det) return renderUnknown();

  return (
    <PageLayout
      activeTab="pko300"
      onNavigateToRating={router.goRating}
      onNavigateToThematic={router.goThematic}
    >
      <CompanyCard company={comp} details={det} onBack={router.goRating} />
    </PageLayout>
  );
}
