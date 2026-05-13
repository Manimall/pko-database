import { useState } from 'react';
import { X } from 'lucide-react';
import { RatingCompany } from '../data/ratingData';
import { logoMap } from '../data/logoMap';
import { stripOrgForm } from '../utils/formatCompanyName';
import { COMPARE_METRICS, getBestIdx } from './compareMetrics';
import s from './CompareModal.module.css';

const AVATAR_COLORS = [
  '#00B2AA', '#0060B9', '#4326BA', '#00B982', '#0DF0E6',
  '#0078d4', '#6B3FA0', '#00a67d', '#008c84', '#0052a3',
];

const TEXT_METRIC_KEYS = new Set(['napka', 'capitalAttraction']);

function MiniAvatar({ name, rank, inn }: { name: string; rank: number; inn: string }) {
  const logoFile = logoMap[inn];
  const [imgError, setImgError] = useState(false);

  if (logoFile && !imgError) {
    return (
      <div className={s.avatarLogo}>
        <img
          src={`/logos/${logoFile}`}
          alt={name}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={s.avatarLetter}
      style={{ background: AVATAR_COLORS[(rank - 1) % AVATAR_COLORS.length] }}
    >
      {name[0] ?? '?'}
    </div>
  );
}

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
                      <MiniAvatar name={stripOrgForm(c.name)} rank={c.rank} inn={c.inn} />
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
