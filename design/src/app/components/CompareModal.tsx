import { X } from 'lucide-react';
import { RatingCompany } from '../data/ratingData';
import { stripOrgForm } from '../utils/formatCompanyName';
import { COMPARE_METRICS, getBestIdx } from './compareMetrics';
import { CompanyAvatar } from './CompanyAvatar';
import s from './CompareModal.module.css';

const TEXT_METRIC_KEYS = new Set(['napka', 'capitalAttraction']);

interface CompareModalProps {
  companies: RatingCompany[];
  onClose: () => void;
}

export function CompareModal({ companies, onClose }: CompareModalProps) {
  if (companies.length < 2) return null;
  const wide = companies.length > 3;

  return (
    <div className={s.backdrop} onClick={onClose}>
      <div
        className={`${s.modal} ${wide ? s.modalWide : ''}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-label="Сравнение компаний"
      >
        <div className={s.header}>
          <span className={s.title}>Сравнение компаний</span>
          <button type="button" className={s.closeBtn} onClick={onClose} aria-label="Закрыть">
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.thMetric}>Метрика</th>
                {companies.map(c => (
                  <th key={c.inn} className={s.thCompany}>
                    <div className={s.companyHead}>
                      <CompanyAvatar name={stripOrgForm(c.name)} rank={c.rank} inn={c.inn} size={28} />
                      <span className={s.companyName}>{stripOrgForm(c.name)}</span>
                      {c.city && <span className={s.companyCity}>{c.city}</span>}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_METRICS.map(metric => {
                const bestIdx = getBestIdx(metric, companies);
                const valueClasses = TEXT_METRIC_KEYS.has(metric.key) ? s.tdValueText : '';
                return (
                  <tr key={metric.key}>
                    <td className={s.tdLabel}>{metric.label}</td>
                    {companies.map((c, idx) => {
                      const isBest = bestIdx === idx;
                      return (
                        <td
                          key={c.inn}
                          className={`${s.tdValue} ${isBest ? s.tdValueBest : ''} ${valueClasses}`}
                        >
                          {metric.format(c)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p className={s.disclaimer}>Источник данных: ФНС. Только для информационных целей.</p>
        </div>
      </div>
    </div>
  );
}
