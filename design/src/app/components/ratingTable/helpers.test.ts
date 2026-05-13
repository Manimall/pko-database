import { describe, expect, it } from 'vitest';
import { cumulativeLeft, fmt, tdAlignStyle } from './helpers';

describe('cumulativeLeft', () => {
  it('returns empty array for empty input', () => {
    expect(cumulativeLeft([])).toEqual([]);
  });

  it('returns [0] for single-element input', () => {
    expect(cumulativeLeft([100])).toEqual([0]);
  });

  it('builds prefix sum of preceding widths', () => {
    expect(cumulativeLeft([60, 52, 36, 190])).toEqual([0, 60, 112, 148]);
  });

  it('handles zeros without skipping', () => {
    expect(cumulativeLeft([0, 10, 0, 5])).toEqual([0, 0, 10, 10]);
  });
});

describe('fmt', () => {
  it('formats with ru-RU separator', () => {
    expect(fmt(1234567).replace(/\s/g, '')).toBe('1234567');
  });

  it('takes absolute value', () => {
    expect(fmt(-100)).toBe(fmt(100));
  });

  it('handles zero', () => {
    expect(fmt(0)).toBe('0');
  });
});

describe('tdAlignStyle', () => {
  it('returns textAlign: right for right', () => {
    expect(tdAlignStyle('right')).toEqual({ textAlign: 'right' });
  });

  it('returns textAlign: center for center', () => {
    expect(tdAlignStyle('center')).toEqual({ textAlign: 'center' });
  });

  it('returns empty object for left (default browser alignment)', () => {
    expect(tdAlignStyle('left')).toEqual({});
  });
});
