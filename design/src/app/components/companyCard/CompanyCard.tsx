import { ArrowLeft } from 'lucide-react';
import type { RatingCompany } from '../../data/ratingData';
import type { CompanyDetails } from '../../data/companyDetails';
import { logoMap } from '../../data/logoMap';
import { HeaderSection } from './HeaderSection';
import { FinancialsSection } from './FinancialsSection';
import { CapitalStructureSection } from './CapitalStructureSection';
import { DynamicsSection } from './DynamicsSection';
import { FundraisingSidebar } from './FundraisingSidebar';
import s from './CompanyCard.module.css';

interface CompanyCardProps {
  company: RatingCompany;
  details: CompanyDetails;
  onBack: () => void;
}

export function CompanyCard({ company, details, onBack }: CompanyCardProps) {
  const logoFile = logoMap[company.inn];

  return (
    <div className={s.root}>
      <button type="button" className={s.backLink} onClick={onBack}>
        <ArrowLeft style={{ width: '16px', height: '16px' }} />
        Назад к рейтингу
      </button>

      <HeaderSection company={company} details={details} logoFile={logoFile} />

      <div className={s.gridTwoCol}>
        <FinancialsSection company={company} details={details} />
        <CapitalStructureSection company={company} details={details} />
      </div>

      <div className={s.gridTwoCol}>
        <DynamicsSection details={details} />
        <FundraisingSidebar details={details} />
      </div>
    </div>
  );
}
