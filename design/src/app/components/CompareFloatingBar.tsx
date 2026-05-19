import { X, GitCompareArrows } from 'lucide-react';
import { RatingCompany } from '../data/ratingData';
import { stripOrgForm } from '../utils/formatCompanyName';
import { CompanyAvatar } from './CompanyAvatar';
import s from './CompareFloatingBar.module.css';

interface CompareFloatingBarProps {
  selectedCompanies: RatingCompany[];
  onRemove: (inn: string) => void;
  onCompare: () => void;
  onCancel: () => void;
}

export function CompareFloatingBar({
  selectedCompanies,
  onRemove,
  onCompare,
  onCancel,
}: CompareFloatingBarProps) {
  if (selectedCompanies.length === 0) return null;
  const canCompare = selectedCompanies.length >= 2;

  return (
    <div className={s.bar}>
      <div className={s.chips}>
        {selectedCompanies.map(c => (
          <div key={c.inn} className={s.chip}>
            <CompanyAvatar name={stripOrgForm(c.name)} rank={c.rank} inn={c.inn} size={24} />
            <span className={s.chipName}>{stripOrgForm(c.name)}</span>
            <button
              type="button"
              className={s.chipRemove}
              onClick={() => onRemove(c.inn)}
              aria-label="Убрать из сравнения"
            >
              <X style={{ width: '10px', height: '10px' }} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={s.compareBtn}
        onClick={onCompare}
        disabled={!canCompare}
      >
        <GitCompareArrows style={{ width: '14px', height: '14px' }} />
        Сравнить ({selectedCompanies.length})
      </button>

      <button type="button" className={s.cancelBtn} onClick={onCancel} aria-label="Отменить">
        <X style={{ width: '14px', height: '14px' }} />
      </button>
    </div>
  );
}
