import { useState } from 'react';
import { logoMap } from '../data/logoMap';
import s from './CompanyAvatar.module.css';

const AVATAR_COLORS = [
  '#00B2AA', '#0060B9', '#4326BA', '#00B982', '#0DF0E6',
  '#0078d4', '#6B3FA0', '#00a67d', '#008c84', '#0052a3',
];

const sizeClass = { 32: s.size32, 28: s.size28, 24: s.size24 } as const;

interface CompanyAvatarProps {
  name: string;
  rank: number;
  inn: string;
  size?: 32 | 28 | 24;
}

/** Logo-or-letter avatar. Single source for RatingTable, CompareModal, CompareFloatingBar. */
export function CompanyAvatar({ name, rank, inn, size = 32 }: CompanyAvatarProps) {
  const logoFile = logoMap[inn];
  const [imgError, setImgError] = useState(false);
  const sizeCls = sizeClass[size];

  if (logoFile && !imgError) {
    return (
      <div className={`${s.logo} ${sizeCls}`}>
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
      className={`${s.letter} ${sizeCls}`}
      style={{ background: AVATAR_COLORS[(rank - 1) % AVATAR_COLORS.length] }}
    >
      {name[0] ?? '?'}
    </div>
  );
}
