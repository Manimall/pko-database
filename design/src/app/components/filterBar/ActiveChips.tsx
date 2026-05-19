import { X } from 'lucide-react';
import { useIsMobile } from '../../shared/hooks/useIsMobile';
import { type RatingFilters, EMPTY_FILTERS, countActiveFilters } from './types';
import s from './FilterBar.module.css';

interface ActiveChipsProps {
  f: RatingFilters;
  setR: (patch: Partial<RatingFilters>) => void;
}

interface ChipDef {
  key: string;
  label: string;
  clear: () => void;
}

function buildChips(f: RatingFilters, setR: ActiveChipsProps['setR']): ChipDef[] {
  const chips: ChipDef[] = [];
  if (f.sortDir !== 'desc') {
    chips.push({ key: 'sort', label: 'Сорт: По возрастанию', clear: () => setR({ sortDir: 'desc' }) });
  }
  if (f.napka !== 'ignore') {
    chips.push({
      key: 'napka',
      label: `НАПКА: ${f.napka === 'yes' ? 'Да' : 'Нет'}`,
      clear: () => setR({ napka: 'ignore' }),
    });
  }
  if (f.experienceFrom !== '' || f.experienceTo !== '') {
    chips.push({
      key: 'exp',
      label: `Стаж: ${f.experienceFrom || '∞'} — ${f.experienceTo || '∞'} лет`,
      clear: () => setR({ experienceFrom: '', experienceTo: '' }),
    });
  }
  if (f.revenueFrom !== '' || f.revenueTo !== '') {
    chips.push({
      key: 'rev',
      label: `Выручка: ${f.revenueFrom || '∞'} — ${f.revenueTo || '∞'}`,
      clear: () => setR({ revenueFrom: '', revenueTo: '' }),
    });
  }
  if (f.profitFrom !== '' || f.profitTo !== '') {
    chips.push({
      key: 'profit',
      label: `Прибыль: ${f.profitFrom || '∞'} — ${f.profitTo || '∞'}`,
      clear: () => setR({ profitFrom: '', profitTo: '' }),
    });
  }
  if (f.cagrFrom !== '' || f.cagrTo !== '') {
    chips.push({
      key: 'cagr',
      label: `CAGR: ${f.cagrFrom || '∞'} — ${f.cagrTo || '∞'}%`,
      clear: () => setR({ cagrFrom: '', cagrTo: '' }),
    });
  }
  if (f.growthRateFrom !== '' || f.growthRateTo !== '') {
    chips.push({
      key: 'growth',
      label: `Рост фин. акт.: ${f.growthRateFrom || '∞'} — ${f.growthRateTo || '∞'}%`,
      clear: () => setR({ growthRateFrom: '', growthRateTo: '' }),
    });
  }
  if (f.deFrom !== '' || f.deTo !== '') {
    chips.push({
      key: 'de',
      label: `D/E: ${f.deFrom || '0'} — ${f.deTo || '∞'}`,
      clear: () => setR({ deFrom: '', deTo: '' }),
    });
  }
  return chips;
}

export function ActiveChips({ f, setR }: ActiveChipsProps) {
  const isMobile = useIsMobile();
  if (countActiveFilters(f) === 0) return null;

  const chips = buildChips(f, setR);
  const XIcon = <X style={{ width: '14px', height: '14px' }} />;

  return (
    <div className={`${s.chipsRow} ${isMobile ? s.chipsRowMobile : ''}`}>
      {chips.map(chip => (
        <div key={chip.key} className={s.chip}>
          {chip.label}
          <button type="button" className={s.chipBtn} onClick={chip.clear} aria-label="Убрать фильтр">
            {XIcon}
          </button>
        </div>
      ))}
      <button
        type="button"
        className={s.chipReset}
        onClick={() => setR(EMPTY_FILTERS)}
      >
        {XIcon}
        Сбросить все
      </button>
    </div>
  );
}
