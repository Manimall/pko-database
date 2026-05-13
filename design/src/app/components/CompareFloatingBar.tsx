import { X, GitCompareArrows } from 'lucide-react';
import { RatingCompany } from '../data/ratingData';
import { logoMap } from '../data/logoMap';
import { useState } from 'react';
import { stripOrgForm } from '../utils/formatCompanyName';

const AVATAR_COLORS = [
  '#00B2AA', '#0060B9', '#4326BA', '#00B982', '#0DF0E6',
  '#0078d4', '#6B3FA0', '#00a67d', '#008c84', '#0052a3',
];

function TinyAvatar({ name, rank, inn }: { name: string; rank: number; inn: string }) {
  const logoFile = logoMap[inn];
  const [imgError, setImgError] = useState(false);
  const letter = name[0] ?? '?';
  const bg = AVATAR_COLORS[(rank - 1) % AVATAR_COLORS.length];

  if (logoFile && !imgError) {
    return (
      <div style={{
        width: '24px', height: '24px', borderRadius: '5px', background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
      }}>
        <img src={`/logos/${logoFile}`} alt={name} loading="lazy" decoding="async" onError={() => setImgError(true)}
          style={{ maxWidth: '20px', maxHeight: '20px', objectFit: 'contain' }} />
      </div>
    );
  }

  return (
    <div style={{
      width: '24px', height: '24px', borderRadius: '5px', background: bg, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '10px', fontWeight: 700, flexShrink: 0,
    }}>
      {letter}
    </div>
  );
}

interface CompareFloatingBarProps {
  selectedCompanies: RatingCompany[];
  onRemove: (inn: string) => void;
  onCompare: () => void;
  onCancel: () => void;
}

export function CompareFloatingBar({ selectedCompanies, onRemove, onCompare, onCancel }: CompareFloatingBarProps) {
  if (selectedCompanies.length === 0) return null;

  const canCompare = selectedCompanies.length >= 2;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 16px',
      background: '#1a2230',
      border: '1px solid rgba(13,240,230,0.2)',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      maxWidth: '90vw',
    }}>
      {/* Selected companies chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap', overflow: 'hidden' }}>
        {selectedCompanies.map(c => (
          <div key={c.inn} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 8px 4px 4px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '8px',
            whiteSpace: 'nowrap',
          }}>
            <TinyAvatar name={stripOrgForm(c.name)} rank={c.rank} inn={c.inn} />
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#fff', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {stripOrgForm(c.name)}
            </span>
            <button
              onClick={() => onRemove(c.inn)}
              style={{
                width: '18px', height: '18px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <X style={{ width: '10px', height: '10px', color: 'rgba(255,255,255,0.4)' }} />
            </button>
          </div>
        ))}
      </div>

      {/* Compare button */}
      <button
        onClick={onCompare}
        disabled={!canCompare}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 16px',
          borderRadius: '8px',
          border: 'none',
          background: canCompare ? '#0DF0E6' : 'rgba(255,255,255,0.08)',
          color: canCompare ? '#0a0f15' : 'rgba(255,255,255,0.3)',
          fontSize: '12px',
          fontWeight: 700,
          cursor: canCompare ? 'pointer' : 'default',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s',
        }}
      >
        <GitCompareArrows style={{ width: '14px', height: '14px' }} />
        Сравнить ({selectedCompanies.length})
      </button>

      {/* Cancel */}
      <button
        onClick={onCancel}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '28px', height: '28px', borderRadius: '6px',
          background: 'rgba(255,255,255,0.06)', border: 'none',
          cursor: 'pointer', flexShrink: 0,
        }}
      >
        <X style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.4)' }} />
      </button>
    </div>
  );
}
