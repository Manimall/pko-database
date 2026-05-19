import { useRef, useState } from 'react';
import { ChevronDown, Search, GitCompareArrows, SlidersHorizontal } from 'lucide-react';
import { useIsMobile } from '../../shared/hooks/useIsMobile';
import { type Preset, type RatingFilters, countActiveFilters } from './types';
import { FilterDropdown } from './FilterDropdown';
import { FilterSections } from './FilterSections';
import { ActiveChips } from './ActiveChips';
import s from './FilterBar.module.css';

export type { Preset, RatingFilters, SortDirection } from './types';

const PRESETS: { id: Preset; label: string }[] = [
  { id: 'overview', label: 'Рейтинг ПКО-300' },
  { id: 'capital',  label: 'Привлечение капитала' },
];

interface PresetTabsProps {
  preset: Preset;
  onPresetChange: (p: Preset) => void;
}

export function PresetTabs({ preset, onPresetChange }: PresetTabsProps) {
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const filterBtnRef = useRef<HTMLDivElement>(null);

  const setR = (patch: Partial<RatingFilters>) =>
    onRatingFiltersChange({ ...ratingFilters, ...patch });

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
          <CompareButton active={compareMode} count={selectedCount} onClick={onCompareModeToggle} />
        )}

        {showFilters && (
          <FilterButton
            anchorRef={filterBtnRef}
            isMobile={isMobile}
            activeCount={activeCount}
            onToggle={() => setDrawerOpen(o => !o)}
          />
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

interface CompareButtonProps {
  active: boolean;
  count: number;
  onClick: () => void;
}

function CompareButton({ active, count, onClick }: CompareButtonProps) {
  return (
    <button
      type="button"
      className={`${s.compareBtn} ${active ? s.compareBtnActive : ''}`}
      onClick={onClick}
    >
      <GitCompareArrows style={{ width: '14px', height: '14px' }} />
      Сравнить
      {active && count > 0 && <span className={s.badge}>{count}</span>}
    </button>
  );
}

interface FilterButtonProps {
  anchorRef: React.RefObject<HTMLDivElement | null>;
  isMobile: boolean;
  activeCount: number;
  onToggle: () => void;
}

function FilterButton({ anchorRef, isMobile, activeCount, onToggle }: FilterButtonProps) {
  return (
    <div ref={anchorRef}>
      {isMobile ? (
        <button
          type="button"
          className={`${s.filterIconBtn} ${activeCount > 0 ? s.filterIconBtnActive : ''}`}
          onClick={onToggle}
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
          onClick={onToggle}
        >
          Фильтры
          {activeCount > 0 && <span className={s.badge}>{activeCount}</span>}
          <ChevronDown style={{ width: '14px', height: '14px' }} />
        </button>
      )}
    </div>
  );
}
