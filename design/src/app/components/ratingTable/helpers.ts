import type { CSSProperties } from 'react';
import type { RatingCompany } from '../../data/ratingData';

export const PAGE_SIZE = 100;

export type Align = 'left' | 'right' | 'center';

export type ExtraColumn = {
  key: string;
  header: string;
  format: (c: RatingCompany) => string;
  color?: (c: RatingCompany) => string;
};

export function fmt(n: number): string {
  return Math.abs(n).toLocaleString('ru-RU');
}

export function cumulativeLeft(widths: number[]): number[] {
  const result: number[] = [];
  widths.forEach((_, i) => {
    result.push(i === 0 ? 0 : result[i - 1] + widths[i - 1]);
  });
  return result;
}

export function tdAlignStyle(a: Align): CSSProperties {
  if (a === 'right')  return { textAlign: 'right' };
  if (a === 'center') return { textAlign: 'center' };
  return {};
}
