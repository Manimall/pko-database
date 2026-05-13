import { X } from 'lucide-react';
import { RatingCompany } from '../data/ratingData';
import { logoMap } from '../data/logoMap';
import { useState } from 'react';
import { stripOrgForm } from '../utils/formatCompanyName';

// ── Formatting helpers ──────────────────────────────────────────
const fmtNum = (n: number) => Math.abs(n).toLocaleString('ru-RU');

const AVATAR_COLORS = [
  '#00B2AA', '#0060B9', '#4326BA', '#00B982', '#0DF0E6',
  '#0078d4', '#6B3FA0', '#00a67d', '#008c84', '#0052a3',
];

// ── Metric definitions ──────────────────────────────────────────

type MetricDef = {
  label: string;
  key: string;
  format: (c: RatingCompany) => string;
  getValue: (c: RatingCompany) => number;
  /** true = higher is better, false = lower is better, null = no highlighting */
  higherIsBetter: boolean | null;
};

const METRICS: MetricDef[] = [
  {
    label: 'Ранг',
    key: 'rank',
    format: c => `#${c.rank}`,
    getValue: c => c.rank,
    higherIsBetter: false,
  },
  {
    label: 'Изм. ранга (YoY)',
    key: 'rankDelta',
    format: c => c.rankDelta > 0 ? `↑ ${c.rankDelta}` : c.rankDelta < 0 ? `↓ ${Math.abs(c.rankDelta)}` : '—',
    getValue: c => c.rankDelta,
    higherIsBetter: true,
  },
  {
    label: 'Стаж, лет',
    key: 'experience',
    format: c => String(c.experience),
    getValue: c => c.experience,
    higherIsBetter: true,
  },
  {
    label: 'НАПКА',
    key: 'napka',
    format: c => c.napka ? 'Да' : 'Нет',
    getValue: c => c.napka ? 1 : 0,
    higherIsBetter: null,
  },
  {
    label: 'Выручка + пр. доходы, тыс ₽',
    key: 'revenue',
    format: c => fmtNum(c.revenue),
    getValue: c => c.revenue,
    higherIsBetter: true,
  },
  {
    label: 'Чистая прибыль, тыс ₽',
    key: 'profit',
    format: c => c.profit < 0 ? `−${fmtNum(c.profit)}` : fmtNum(c.profit),
    getValue: c => c.profit,
    higherIsBetter: true,
  },
  {
    label: 'Расходы, тыс ₽',
    key: 'cost',
    format: c => fmtNum(c.cost),
    getValue: c => c.cost,
    higherIsBetter: false,
  },
  {
    label: 'Изм. к 2023, %',
    key: 'yearChange',
    format: c => {
      const v = c.yearChange;
      return v > 0 ? `+${v.toFixed(1)}%` : `${v.toFixed(1)}%`;
    },
    getValue: c => c.yearChange,
    higherIsBetter: true,
  },
  {
    label: 'D/E',
    key: 'de',
    format: c => c.de.toFixed(2),
    getValue: c => c.de,
    higherIsBetter: false,
  },
  {
    label: 'Рост фин. активов, %',
    key: 'growthRate',
    format: c => `${c.growthRate.toFixed(1)}%`,
    getValue: c => c.growthRate,
    higherIsBetter: true,
  },
  {
    label: 'CAGR за 5 лет, %',
    key: 'cagr',
    format: c => `${(c.cagr * 100).toFixed(1)}%`,
    getValue: c => c.cagr,
    higherIsBetter: true,
  },
  {
    label: 'Привлечение капитала',
    key: 'capitalAttraction',
    format: c => {
      if (c.capitalAttraction === 'public') return 'Публичный';
      if (c.capitalAttraction === 'corporate') return 'Корпоративный';
      return 'Нет';
    },
    getValue: () => 0,
    higherIsBetter: null,
  },
];

// ── Tiny avatar for modal header ────────────────────────────────

function MiniAvatar({ name, rank, inn }: { name: string; rank: number; inn: string }) {
  const logoFile = logoMap[inn];
  const [imgError, setImgError] = useState(false);
  const letter = name[0] ?? '?';
  const bg = AVATAR_COLORS[(rank - 1) % AVATAR_COLORS.length];

  if (logoFile && !imgError) {
    return (
      <div style={{
        width: '28px', height: '28px', borderRadius: '6px', background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
      }}>
        <img src={`/logos/${logoFile}`} alt={name} loading="lazy" decoding="async" onError={() => setImgError(true)}
          style={{ maxWidth: '24px', maxHeight: '24px', objectFit: 'contain' }} />
      </div>
    );
  }

  return (
    <div style={{
      width: '28px', height: '28px', borderRadius: '6px', background: bg, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '11px', fontWeight: 700, flexShrink: 0,
    }}>
      {letter}
    </div>
  );
}

// ── Main CompareModal ───────────────────────────────────────────

interface CompareModalProps {
  companies: RatingCompany[];
  onClose: () => void;
}

export function CompareModal({ companies, onClose }: CompareModalProps) {
  if (companies.length < 2) return null;

  // Find best value per metric row
  function getBestIdx(metric: MetricDef): number | null {
    if (metric.higherIsBetter === null) return null;
    const values = companies.map(c => metric.getValue(c));
    if (metric.higherIsBetter) {
      const max = Math.max(...values);
      return values.indexOf(max);
    } else {
      const min = Math.min(...values);
      return values.indexOf(min);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: companies.length <= 3 ? '800px' : '960px',
          maxHeight: '85vh',
          overflowY: 'auto',
          background: '#111920',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky', top: 0, background: '#111920', zIndex: 10,
          borderRadius: '16px 16px 0 0',
        }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>
            Сравнение компаний
          </span>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.06)', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>

        {/* Table */}
        <div style={{ padding: '0 24px 24px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            {/* Company headers */}
            <thead>
              <tr>
                <th style={{
                  textAlign: 'left', padding: '16px 12px 12px 0',
                  fontSize: '10px', fontWeight: 500, color: 'rgba(255,255,255,0.3)',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  width: '160px', minWidth: '140px',
                }}>
                  Метрика
                </th>
                {companies.map((c) => (
                  <th key={c.inn} style={{
                    textAlign: 'center', padding: '16px 8px 12px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <MiniAvatar name={stripOrgForm(c.name)} rank={c.rank} inn={c.inn} />
                      <span style={{
                        fontSize: '12px', fontWeight: 600, color: '#fff',
                        maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {stripOrgForm(c.name)}
                      </span>
                      {c.city && (
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>
                          {c.city}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map((metric) => {
                const bestIdx = getBestIdx(metric);
                return (
                  <tr key={metric.key}>
                    <td style={{
                      padding: '10px 12px 10px 0',
                      fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.5)',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      whiteSpace: 'nowrap',
                    }}>
                      {metric.label}
                    </td>
                    {companies.map((c, idx) => {
                      const isBest = bestIdx === idx;
                      return (
                        <td key={c.inn} style={{
                          padding: '10px 8px',
                          textAlign: 'center',
                          fontSize: '13px',
                          fontWeight: isBest ? 600 : 400,
                          color: isBest ? '#0DF0E6' : '#fff',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          fontFamily: metric.key === 'napka' || metric.key === 'capitalAttraction'
                            ? 'inherit'
                            : "'Space Grotesk', sans-serif",
                        }}>
                          {metric.format(c)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Source disclaimer */}
          <p style={{
            margin: '16px 0 0', fontSize: '10px', color: 'rgba(255,255,255,0.25)',
            textAlign: 'center',
          }}>
            Источник данных: ФНС. Только для информационных целей.
          </p>
        </div>
      </div>
    </div>
  );
}
