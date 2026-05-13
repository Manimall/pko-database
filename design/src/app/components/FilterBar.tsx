import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X, Search, GitCompareArrows, SlidersHorizontal } from 'lucide-react';
import { useIsMobile } from '../shared/hooks/useIsMobile';
import s from './FilterBar.module.css';

// ── Types ───────────────────────────────────────────────────────

export type SortDirection = 'desc' | 'asc';
export type Preset = 'overview' | 'capital';

export interface RatingFilters {
  sortDir: SortDirection;
  napka: 'ignore' | 'yes' | 'no';
  experienceFrom: string;
  experienceTo: string;
  capitalPublic: boolean;
  capitalCorporate: boolean;
  capitalNone: boolean;
  revenueFrom: string;
  revenueTo: string;
  profitFrom: string;
  profitTo: string;
  deFrom: string;
  deTo: string;
  growthRateFrom: string;
  growthRateTo: string;
  cagrFrom: string;
  cagrTo: string;
}

const EMPTY_FILTERS: RatingFilters = {
  sortDir: 'desc',
  napka: 'ignore',
  experienceFrom: '', experienceTo: '',
  capitalPublic: true, capitalCorporate: true, capitalNone: true,
  revenueFrom: '', revenueTo: '',
  profitFrom: '', profitTo: '',
  deFrom: '', deTo: '',
  growthRateFrom: '', growthRateTo: '',
  cagrFrom: '', cagrTo: '',
};

// ── Helpers ─────────────────────────────────────────────────────

function countActiveFilters(f: RatingFilters): number {
  let n = 0;
  if (f.sortDir !== 'desc') n++;
  if (f.napka !== 'ignore') n++;
  if (f.experienceFrom !== '' || f.experienceTo !== '') n++;
  if (f.revenueFrom !== '' || f.revenueTo !== '') n++;
  if (f.profitFrom !== '' || f.profitTo !== '') n++;
  if (f.cagrFrom !== '' || f.cagrTo !== '') n++;
  if (f.growthRateFrom !== '' || f.growthRateTo !== '') n++;
  if (f.deFrom !== '' || f.deTo !== '') n++;
  return n;
}

// ── Primitives ──────────────────────────────────────────────────

function RadioOption({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <label className={s.radioRow} onClick={onChange}>
      <div className={`${s.radioBox} ${checked ? s.radioBoxChecked : ''}`}>
        {checked && <div className={s.radioDot} />}
      </div>
      <span className={`${s.radioLabel} ${checked ? s.radioLabelChecked : ''}`}>{label}</span>
    </label>
  );
}

function RangeInputs({
  fromVal, toVal, onFromChange, onToChange,
}: {
  fromVal: string; toVal: string;
  onFromChange: (v: string) => void; onToChange: (v: string) => void;
}) {
  return (
    <div className={s.rangeRow}>
      <input
        className={s.rangeInput}
        type="number"
        value={fromVal}
        onChange={e => onFromChange(e.target.value)}
        placeholder="от"
      />
      <span className={s.rangeDash}>—</span>
      <input
        className={s.rangeInput}
        type="number"
        value={toVal}
        onChange={e => onToChange(e.target.value)}
        placeholder="до"
      />
      {(fromVal || toVal) && (
        <button
          type="button"
          className={s.rangeClearBtn}
          onClick={() => { onFromChange(''); onToChange(''); }}
          aria-label="Сбросить"
        >
          <X style={{ width: '14px', height: '14px' }} />
        </button>
      )}
    </div>
  );
}

// ── Filter panel (portal popover) ───────────────────────────────

interface FilterPanelProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}

function FilterDropdown({ open, onClose, anchorRef, children }: FilterPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!open || !anchorRef.current || isMobile) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const panelWidth = 380;
    setPos({ top: rect.bottom + 8, left: Math.max(8, rect.right - panelWidth) });
  }, [open, anchorRef, isMobile]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  const panelStyle = isMobile ? undefined : { top: pos.top, left: pos.left };

  return createPortal(
    <div
      ref={panelRef}
      className={`${s.panel} ${isMobile ? s.panelMobile : ''}`}
      style={panelStyle}
    >
      <div className={s.panelHeader}>
        <span className={s.panelTitle}>Фильтры</span>
        <button type="button" className={s.panelCloseBtn} onClick={onClose} aria-label="Закрыть">
          <X style={{ width: '14px', height: '14px' }} />
        </button>
      </div>
      <div className={s.panelBody}>{children}</div>
      <div className={s.panelFooter}>
        <button type="button" className={s.applyBtn} onClick={onClose}>Применить</button>
      </div>
    </div>,
    document.body,
  );
}

// ── Filter sections (the panel contents) ────────────────────────

function FilterSections({
  f, setR,
}: {
  f: RatingFilters;
  setR: (patch: Partial<RatingFilters>) => void;
}) {
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
        <RangeInputs fromVal={f.experienceFrom} toVal={f.experienceTo}
          onFromChange={v => setR({ experienceFrom: v })} onToChange={v => setR({ experienceTo: v })} />
      </div>

      <div className={s.sectionDivider} />
      <div className={s.sectionHead}>Метрики</div>
      <div>
        <div className={s.sectionLabel}>Выручка + пр. доходы, тыс ₽</div>
        <RangeInputs fromVal={f.revenueFrom} toVal={f.revenueTo}
          onFromChange={v => setR({ revenueFrom: v })} onToChange={v => setR({ revenueTo: v })} />
      </div>
      <div className={s.sectionDivider} />
      <div>
        <div className={s.sectionLabel}>Чистая прибыль, тыс ₽</div>
        <RangeInputs fromVal={f.profitFrom} toVal={f.profitTo}
          onFromChange={v => setR({ profitFrom: v })} onToChange={v => setR({ profitTo: v })} />
      </div>
      <div className={s.sectionDivider} />
      <div>
        <div className={s.sectionLabel}>Темпы роста (CAGR 5 лет), %</div>
        <RangeInputs fromVal={f.cagrFrom} toVal={f.cagrTo}
          onFromChange={v => setR({ cagrFrom: v })} onToChange={v => setR({ cagrTo: v })} />
      </div>
      <div className={s.sectionDivider} />
      <div>
        <div className={s.sectionLabel}>Рост фин. активов за 5 лет, %</div>
        <RangeInputs fromVal={f.growthRateFrom} toVal={f.growthRateTo}
          onFromChange={v => setR({ growthRateFrom: v })} onToChange={v => setR({ growthRateTo: v })} />
      </div>
      <div className={s.sectionDivider} />
      <div>
        <div className={s.sectionLabel}>D/E коэффициент</div>
        <RangeInputs fromVal={f.deFrom} toVal={f.deTo}
          onFromChange={v => setR({ deFrom: v })} onToChange={v => setR({ deTo: v })} />
      </div>
    </div>
  );
}

// ── Filter chips (active filter badges) ─────────────────────────

interface ChipsProps {
  f: RatingFilters;
  setR: (patch: Partial<RatingFilters>) => void;
}

function ActiveChips({ f, setR }: ChipsProps) {
  const isMobile = useIsMobile();
  if (countActiveFilters(f) === 0) return null;

  const XIcon = <X style={{ width: '14px', height: '14px' }} />;

  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (f.sortDir !== 'desc') {
    chips.push({ key: 'sort', label: 'Сорт: По возрастанию', clear: () => setR({ sortDir: 'desc' }) });
  }
  if (f.napka !== 'ignore') {
    chips.push({ key: 'napka', label: `НАПКА: ${f.napka === 'yes' ? 'Да' : 'Нет'}`, clear: () => setR({ napka: 'ignore' }) });
  }
  if (f.experienceFrom !== '' || f.experienceTo !== '') {
    chips.push({ key: 'exp', label: `Стаж: ${f.experienceFrom || '∞'} — ${f.experienceTo || '∞'} лет`, clear: () => setR({ experienceFrom: '', experienceTo: '' }) });
  }
  if (f.revenueFrom !== '' || f.revenueTo !== '') {
    chips.push({ key: 'rev', label: `Выручка: ${f.revenueFrom || '∞'} — ${f.revenueTo || '∞'}`, clear: () => setR({ revenueFrom: '', revenueTo: '' }) });
  }
  if (f.profitFrom !== '' || f.profitTo !== '') {
    chips.push({ key: 'profit', label: `Прибыль: ${f.profitFrom || '∞'} — ${f.profitTo || '∞'}`, clear: () => setR({ profitFrom: '', profitTo: '' }) });
  }
  if (f.cagrFrom !== '' || f.cagrTo !== '') {
    chips.push({ key: 'cagr', label: `CAGR: ${f.cagrFrom || '∞'} — ${f.cagrTo || '∞'}%`, clear: () => setR({ cagrFrom: '', cagrTo: '' }) });
  }
  if (f.growthRateFrom !== '' || f.growthRateTo !== '') {
    chips.push({ key: 'growth', label: `Рост фин. акт.: ${f.growthRateFrom || '∞'} — ${f.growthRateTo || '∞'}%`, clear: () => setR({ growthRateFrom: '', growthRateTo: '' }) });
  }
  if (f.deFrom !== '' || f.deTo !== '') {
    chips.push({ key: 'de', label: `D/E: ${f.deFrom || '0'} — ${f.deTo || '∞'}`, clear: () => setR({ deFrom: '', deTo: '' }) });
  }

  return (
    <div className={`${s.chipsRow} ${isMobile ? s.chipsRowMobile : ''}`}>
      {chips.map(chip => (
        <div key={chip.key} className={s.chip}>
          {chip.label}
          <button type="button" className={s.chipBtn} onClick={chip.clear} aria-label="Убрать фильтр">{XIcon}</button>
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

// ── PresetTabs ──────────────────────────────────────────────────

const PRESETS: { id: Preset; label: string }[] = [
  { id: 'overview', label: 'Рейтинг ПКО-300' },
  { id: 'capital',  label: 'Привлечение капитала' },
];

export function PresetTabs({ preset, onPresetChange }: { preset: Preset; onPresetChange: (p: Preset) => void }) {
  return (
    <div className={s.presetTabs}>
      {PRESETS.map(p => (
        <button
          key={p.id}
          type="button"
          className={`${s.presetTab} ${p.id === preset ? s.presetTabActive : ''}`}
          onClick={() => onPresetChange(p.id)}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

// ── SearchFilterBar (main) ──────────────────────────────────────

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  ratingFilters: RatingFilters;
  onRatingFiltersChange: (f: RatingFilters) => void;
  preset: Preset;
  compareMode?: boolean;
  onCompareModeToggle?: () => void;
  selectedCount?: number;
}

export function SearchFilterBar({
  searchQuery, onSearchChange,
  ratingFilters, onRatingFiltersChange,
  preset,
  compareMode = false, onCompareModeToggle, selectedCount = 0,
}: SearchFilterBarProps) {
  const isMobile = useIsMobile();
  const setR = (patch: Partial<RatingFilters>) => onRatingFiltersChange({ ...ratingFilters, ...patch });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const filterBtnRef = useRef<HTMLDivElement>(null);

  const showFilters = preset === 'overview';
  const activeCount = countActiveFilters(ratingFilters);

  return (
    <div className={s.bar}>
      <div className={s.row}>
        <div className={s.searchBox}>
          <Search className={s.searchIcon} />
          <input
            type="text"
            className={s.searchInput}
            placeholder="Поиск компании"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>

        {showFilters && onCompareModeToggle && !isMobile && (
          <button
            type="button"
            className={`${s.compareBtn} ${compareMode ? s.compareBtnActive : ''}`}
            onClick={onCompareModeToggle}
          >
            <GitCompareArrows style={{ width: '14px', height: '14px' }} />
            Сравнить
            {compareMode && selectedCount > 0 && (
              <span className={s.badge}>{selectedCount}</span>
            )}
          </button>
        )}

        {showFilters && (
          <div ref={filterBtnRef}>
            {isMobile ? (
              <button
                type="button"
                className={`${s.filterIconBtn} ${activeCount > 0 ? s.filterIconBtnActive : ''}`}
                onClick={() => setDrawerOpen(o => !o)}
                aria-label="Фильтры"
              >
                <SlidersHorizontal style={{ width: '16px', height: '16px' }} />
                {activeCount > 0 && (
                  <span className={`${s.badge} ${s.badgeIconCorner}`}>{activeCount}</span>
                )}
              </button>
            ) : (
              <button
                type="button"
                className={`${s.filterBtn} ${activeCount > 0 ? s.filterBtnActive : ''}`}
                onClick={() => setDrawerOpen(o => !o)}
              >
                Фильтры
                {activeCount > 0 && <span className={s.badge}>{activeCount}</span>}
                <ChevronDown style={{ width: '14px', height: '14px' }} />
              </button>
            )}
          </div>
        )}
      </div>

      {showFilters && (
        <FilterDropdown open={drawerOpen} onClose={() => setDrawerOpen(false)} anchorRef={filterBtnRef}>
          <FilterSections f={ratingFilters} setR={setR} />
        </FilterDropdown>
      )}

      {showFilters && <ActiveChips f={ratingFilters} setR={setR} />}
    </div>
  );
}
