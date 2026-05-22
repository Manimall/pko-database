import type { CSSProperties } from 'react';
import type { RatingCompany } from '../../data/ratingData';

export const PAGE_SIZE = 100;

export type Align = 'left' | 'right' | 'center';

export type SortKey = keyof RatingCompany;
export type SortDir = 'asc' | 'desc';

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

// ── Desktop layout ────────────────────────────────────────────────────────────

export const COMPACT_SCROLL_W = 140; // px — ширина scroll-колонок на 768–1150px

export interface ColumnLayout {
  widths: string[];
  headers: string[];
  aligns: Align[];
  sortKeys: Array<SortKey | null>;
  stickyLeft: number[];
  stickyCount: number;
  minWidth: string;
}

export function buildLayout(compareMode: boolean, extraColumns: ExtraColumn[], compact: boolean): ColumnLayout {
  const stickyPx = compareMode ? [40, 56, 48, 36, 180] : [60, 52, 36, 190];
  const stickyLeft = cumulativeLeft(stickyPx);
  const stickyTotalPx = stickyLeft[stickyLeft.length - 1] + stickyPx[stickyPx.length - 1];

  const scrollHeaders = [
    'Выручка + пр. доходы, тыс ₽',
    'Чистая прибыль, тыс ₽',
    'Стаж, лет',
    ...extraColumns.map(ec => ec.header),
  ];
  const scrollAligns: Align[] = ['right', 'right', 'right', ...extraColumns.map(() => 'right' as const)];
  const scrollColWidth = compact
    ? `${COMPACT_SCROLL_W}px`
    : `${(100 / scrollHeaders.length).toFixed(1)}%`;

  const stickyHeaders = compareMode ? ['', '№', 'YoY', '', 'Компания'] : ['№', 'YoY', '', 'Компания'];
  const stickyAligns: Align[] = compareMode
    ? ['center', 'left', 'center', 'left', 'left']
    : ['left', 'center', 'left', 'left'];

  const stickySortKeys: Array<SortKey | null> = compareMode
    ? [null, 'rank', 'yearChange', null, 'name']
    : ['rank', 'yearChange', null, 'name'];
  const scrollSortKeys: Array<SortKey | null> = [
    'revenue', 'profit', 'experience',
    ...extraColumns.map(ec => ec.key as SortKey),
  ];

  const minWidthPx = compact
    ? stickyTotalPx + scrollHeaders.length * COMPACT_SCROLL_W
    : extraColumns.length > 0
      ? stickyTotalPx + scrollHeaders.length * 150
      : 830;

  return {
    widths: [...stickyPx.map(w => `${w}px`), ...scrollHeaders.map(() => scrollColWidth)],
    headers: [...stickyHeaders, ...scrollHeaders],
    aligns: [...stickyAligns, ...scrollAligns],
    sortKeys: [...stickySortKeys, ...scrollSortKeys],
    stickyLeft,
    stickyCount: stickyPx.length,
    minWidth: `${minWidthPx}px`,
  };
}

// ── Mobile layout ─────────────────────────────────────────────────────────────

export const STICKY_PX = [46, 38, 142]; // [№, Logo, Компания]
export const SCROLL_WIDTHS = ['52px', '180px', '160px', '72px'];
export const EXTRA_COL_WIDTH_PX = 120;
export const SCROLL_HEADERS = ['YoY', 'Выручка + пр. доходы, тыс ₽', 'Чистая прибыль, тыс ₽', 'Стаж, лет'];
export const SCROLL_ALIGNS: Align[] = ['center', 'center', 'center', 'center'];

export interface MobileLayout {
  colWidths: string[];
  colHeaders: string[];
  colAligns: Align[];
  stickyLeft: number[];
  stickyTotal: number;
  minWidth: string;
}

export function buildMobileLayout(extraColumns: ExtraColumn[]): MobileLayout {
  const stickyLeft = cumulativeLeft(STICKY_PX);
  const stickyTotal = stickyLeft[stickyLeft.length - 1] + STICKY_PX[STICKY_PX.length - 1];
  const extraHeaders = extraColumns.map(ec => ec.header);
  const extraWidths = extraColumns.map(() => `${EXTRA_COL_WIDTH_PX}px`);
  const extraAligns = extraColumns.map(() => 'center' as Align);
  const scrollTotal = SCROLL_WIDTHS.reduce((sum, width) => sum + Number.parseInt(width, 10), 0);

  return {
    colWidths: [...STICKY_PX.map(w => `${w}px`), ...SCROLL_WIDTHS, ...extraWidths],
    colHeaders: ['№', '', 'Компания', ...SCROLL_HEADERS, ...extraHeaders],
    colAligns: ['center', 'left', 'left', ...SCROLL_ALIGNS, ...extraAligns],
    stickyLeft,
    stickyTotal,
    minWidth: `${stickyTotal + scrollTotal + extraColumns.length * EXTRA_COL_WIDTH_PX}px`,
  };
}

export function justify(a: Align): CSSProperties['justifyContent'] {
  if (a === 'center') return 'center';
  if (a === 'right')  return 'flex-end';
  return 'flex-start';
}
