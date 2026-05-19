import { describe, expect, it } from 'vitest';
import { fmtMoney, fmtMoneyTable, fmtPct, DATA_YEAR_2024_OVERRIDE } from './helpers';

describe('fmtMoney', () => {
  it('formats billions', () => {
    expect(fmtMoney(2_500_000)).toBe('2.5 млрд');
  });

  it('formats millions', () => {
    expect(fmtMoney(2_500)).toBe('2.5 млн');
  });

  it('formats thousands without suffix', () => {
    expect(fmtMoney(500)).toBe('500 тыс');
  });

  it('handles zero', () => {
    expect(fmtMoney(0)).toBe('0 тыс');
  });

  it('preserves sign for negatives in scale check', () => {
    expect(fmtMoney(-2_500_000)).toBe('-2.5 млрд');
  });
});

describe('fmtMoneyTable', () => {
  it('formats billions same as fmtMoney', () => {
    expect(fmtMoneyTable(2_500_000)).toBe('2.5 млрд');
  });

  it('uses ru-RU separators for thousands', () => {
    // 850 тыс ≈ "850 тыс" with NBSP from ru-RU locale or regular space.
    const result = fmtMoneyTable(850);
    expect(result.endsWith(' тыс')).toBe(true);
    expect(result.replace(/\s/g, '')).toBe('850тыс');
  });

  it('rounds non-integer thousands', () => {
    expect(fmtMoneyTable(123.7)).toMatch(/^124\s+тыс$/);
  });
});

describe('fmtPct', () => {
  it('returns null when prev is zero', () => {
    expect(fmtPct(100, 0)).toBeNull();
  });

  it('returns null when prev is missing (0)', () => {
    expect(fmtPct(100, 0)).toBeNull();
  });

  it('formats positive change with plus sign and accent color', () => {
    const result = fmtPct(150, 100);
    expect(result).toEqual({ text: '+50.0%', color: '#0DF0E6' });
  });

  it('formats negative change without plus sign and danger color', () => {
    const result = fmtPct(50, 100);
    expect(result).toEqual({ text: '-50.0%', color: '#ef4444' });
  });

  it('uses absolute value of prev for the denominator', () => {
    // current=0, prev=-100 → (0 - (-100)) / 100 = +100%
    expect(fmtPct(0, -100)?.text).toBe('+100.0%');
  });
});

describe('DATA_YEAR_2024_OVERRIDE', () => {
  it('contains АВЗ inn', () => {
    expect(DATA_YEAR_2024_OVERRIDE.has('2635261351')).toBe(true);
  });

  it('does not match other inns', () => {
    expect(DATA_YEAR_2024_OVERRIDE.has('7707782563')).toBe(false);
  });
});
