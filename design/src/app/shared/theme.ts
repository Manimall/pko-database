// Design tokens — TS mirror of src/styles/tokens.css.
// Used by inline-style code that hasn't been migrated to CSS Modules yet.
// Keep both files in sync when changing values.

export const colors = {
  bgBase: '#0a0f15',
  bgCard: '#111920',
  borderSubtle: 'rgba(255,255,255,0.06)',
  borderAccent: 'rgba(13,240,230,0.2)',

  textPrimary: '#fff',
  textMuted30: 'rgba(255,255,255,0.3)',
  textMuted40: 'rgba(255,255,255,0.4)',
  textMuted45: 'rgba(255,255,255,0.45)',
  textMuted50: 'rgba(255,255,255,0.5)',

  accent: '#0DF0E6',
  danger: '#ef4444',
} as const;

export const fonts = {
  sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  display: "'Space Grotesk', sans-serif",
} as const;

export const layout = {
  contentMaxWidth: 1100,
  padDesktop: 32,
  padMobile: 12,
} as const;
