import type { RatingFilters } from './types';
import { RadioOption, RangeInputs } from './primitives';
import s from './FilterBar.module.css';

interface FilterSectionsProps {
  f: RatingFilters;
  setR: (patch: Partial<RatingFilters>) => void;
}

export function FilterSections({ f, setR }: FilterSectionsProps) {
  return (
    <div className={s.sectionsGroup}>
      <div className={s.sectionHead}>Общие</div>
      <div>
        <div className={s.sectionLabel}>Сортировка</div>
        <RadioOption checked={f.sortDir === 'desc'} label="По убыванию"    onChange={() => setR({ sortDir: 'desc' })} />
        <RadioOption checked={f.sortDir === 'asc'}  label="По возрастанию" onChange={() => setR({ sortDir: 'asc'  })} />
      </div>
      <div className={s.sectionDivider} />
      <div>
        <div className={s.sectionLabel}>Член НАПКА</div>
        <RadioOption checked={f.napka === 'ignore'} label="Не учитывать" onChange={() => setR({ napka: 'ignore' })} />
        <RadioOption checked={f.napka === 'yes'}    label="Да"           onChange={() => setR({ napka: 'yes'    })} />
        <RadioOption checked={f.napka === 'no'}     label="Нет"          onChange={() => setR({ napka: 'no'     })} />
      </div>
      <div className={s.sectionDivider} />
      <div>
        <div className={s.sectionLabel}>Работает на рынке, лет</div>
        <RangeInputs
          fromVal={f.experienceFrom} toVal={f.experienceTo}
          onFromChange={v => setR({ experienceFrom: v })}
          onToChange={v => setR({ experienceTo: v })}
        />
      </div>

      <div className={s.sectionDivider} />
      <div className={s.sectionHead}>Метрики</div>
      <div>
        <div className={s.sectionLabel}>Выручка + пр. доходы, тыс ₽</div>
        <RangeInputs
          fromVal={f.revenueFrom} toVal={f.revenueTo}
          onFromChange={v => setR({ revenueFrom: v })}
          onToChange={v => setR({ revenueTo: v })}
        />
      </div>
      <div className={s.sectionDivider} />
      <div>
        <div className={s.sectionLabel}>Чистая прибыль, тыс ₽</div>
        <RangeInputs
          fromVal={f.profitFrom} toVal={f.profitTo}
          onFromChange={v => setR({ profitFrom: v })}
          onToChange={v => setR({ profitTo: v })}
        />
      </div>
      <div className={s.sectionDivider} />
      <div>
        <div className={s.sectionLabel}>Темпы роста (CAGR 5 лет), %</div>
        <RangeInputs
          fromVal={f.cagrFrom} toVal={f.cagrTo}
          onFromChange={v => setR({ cagrFrom: v })}
          onToChange={v => setR({ cagrTo: v })}
        />
      </div>
      <div className={s.sectionDivider} />
      <div>
        <div className={s.sectionLabel}>Рост фин. активов за 5 лет, %</div>
        <RangeInputs
          fromVal={f.growthRateFrom} toVal={f.growthRateTo}
          onFromChange={v => setR({ growthRateFrom: v })}
          onToChange={v => setR({ growthRateTo: v })}
        />
      </div>
      <div className={s.sectionDivider} />
      <div>
        <div className={s.sectionLabel}>D/E коэффициент</div>
        <RangeInputs
          fromVal={f.deFrom} toVal={f.deTo}
          onFromChange={v => setR({ deFrom: v })}
          onToChange={v => setR({ deTo: v })}
        />
      </div>
    </div>
  );
}
