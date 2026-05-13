import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronUp, X, Search, GitCompareArrows, SlidersHorizontal } from 'lucide-react';
import { useIsMobile } from '../shared/hooks/useIsMobile';

// ── Filter interfaces ────────────────────────────────────────────

export type SortDirection = 'desc' | 'asc';

export type Preset = 'overview' | 'capital';

export interface RatingFilters {
  // ── Сквозные ──
  sortDir: SortDirection;
  napka: 'ignore' | 'yes' | 'no';
  experienceFrom: string;
  experienceTo: string;
  capitalPublic: boolean;
  capitalCorporate: boolean;
  capitalNone: boolean;
  // ── Overview метрики ──
  revenueFrom: string;
  revenueTo: string;
  profitFrom: string;
  profitTo: string;
  // ── Отдельные поповеры ──
  deFrom: string;
  deTo: string;
  growthRateFrom: string;
  growthRateTo: string;
  cagrFrom: string;
  cagrTo: string;
}

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  ratingFilters: RatingFilters;
  onRatingFiltersChange: (f: RatingFilters) => void;
  preset: Preset;
  onPresetChange: (p: Preset) => void;
}

// ── Hooks ────────────────────────────────────────────

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// ── Shared primitives ────────────────────────────────────────────

function Divider() {
  return <div style={{ width: '1px', height: '22px', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />;
}

// Filter dropdown panel (fixed, positioned near anchor button)
function FilterDropdown({
  open,
  onClose,
  anchorRef,
  children,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Position below the anchor button, aligned to its right edge
  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    if (isMobile) {
      setPos({ top: 0, left: 0 });
    } else {
      const panelWidth = 380;
      let left = rect.right - panelWidth;
      if (left < 8) left = 8;
      setPos({ top: rect.bottom + 8, left });
    }
  }, [open, anchorRef, isMobile]);

  // Close on click outside
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

  return createPortal(
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: isMobile ? 0 : pos.top,
        left: isMobile ? 0 : pos.left,
        width: isMobile ? '100vw' : '380px',
        height: isMobile ? '100vh' : 'auto',
        maxHeight: isMobile ? '100vh' : 'calc(100vh - ' + (pos.top + 20) + 'px)',
        background: '#151c26',
        border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.10)',
        borderRadius: isMobile ? 0 : '12px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        zIndex: 301,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Фильтры</span>
        <button
          onClick={onClose}
          style={{
            width: '26px', height: '26px', borderRadius: '6px',
            background: 'rgba(255,255,255,0.06)', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.5)' }} />
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', minHeight: 0 }}>
        {children}
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 16px 14px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px 0',
            borderRadius: '8px',
            border: 'none',
            background: '#0DF0E6',
            color: '#0a0f15',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Применить
        </button>
      </div>
    </div>,
    document.body,
  );
}

// Filter toggle button
function FilterToggleButton({
  isActive,
  activeCount,
  onClick,
}: {
  isActive: boolean;
  activeCount: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '20px',
        border: `1px solid ${isActive ? 'rgba(13,240,230,0.2)' : 'rgba(255,255,255,0.12)'}`,
        background: isActive ? 'rgba(13,240,230,0.04)' : 'transparent',
        fontSize: '13px',
        fontWeight: 500,
        color: isActive ? '#0DF0E6' : 'rgba(255,255,255,0.4)',
        cursor: 'pointer',
        outline: 'none',
        whiteSpace: 'nowrap',
        transition: 'all 0.1s',
      }}
    >
      Фильтры
      {activeCount > 0 && (
        <span style={{
          width: '16px', height: '16px', borderRadius: '50%',
          background: '#0DF0E6', color: '#0a0f15', fontSize: '10px',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
        }}>
          {activeCount}
        </span>
      )}
      <ChevronDown style={{ width: '14px', height: '14px', color: isActive ? '#0DF0E6' : 'rgba(255,255,255,0.3)' }} />
    </button>
  );
}

// Custom Radio Option
function CustomRadio({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <label onClick={onChange} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '6px 4px' }}>
      <div style={{
        width: '18px', height: '18px', borderRadius: '50%', border: `1.5px solid ${checked ? '#0DF0E6' : 'rgba(255,255,255,0.2)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {checked && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0DF0E6' }} />}
      </div>
      <span style={{ fontSize: '13px', color: checked ? '#fff' : 'rgba(255,255,255,0.7)', fontWeight: checked ? 500 : 400 }}>
        {label}
      </span>
    </label>
  );
}

// Range Inputs inside Popover
function RangeInputs({ fromVal, toVal, onFromChange, onToChange }: { fromVal: string; toVal: string; onFromChange: (v: string) => void; onToChange: (v: string) => void }) {
  const inputStyle: React.CSSProperties = {
    width: '100px', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)',
    fontSize: '13px', color: '#fff', outline: 'none', fontFamily: 'inherit',
    background: 'rgba(255,255,255,0.04)'
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <input
        type="number" value={fromVal} onChange={e => onFromChange(e.target.value)}
        placeholder="от" style={inputStyle}
        onFocus={e => e.currentTarget.style.borderColor = '#0DF0E6'}
        onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
      />
      <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>
      <input
        type="number" value={toVal} onChange={e => onToChange(e.target.value)}
        placeholder="до" style={inputStyle}
        onFocus={e => e.currentTarget.style.borderColor = '#0DF0E6'}
        onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
      />
      {(fromVal || toVal) && (
        <button
          onClick={() => { onFromChange(''); onToChange(''); }}
          style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <X style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.4)' }} />
        </button>
      )}
    </div>
  );
}

// ── Filter section label ─────────────────────────────────────────
const SECTION_LABEL: React.CSSProperties = {
  fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '8px',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};

function SectionDivider() {
  return <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />;
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 0 2px', marginTop: '4px' }}>
      {children}
    </div>
  );
}

// Count active filters for badge
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

// ── Unified Filter Panel ────────────────────────────────────────
function FilterPanel({ f, setR, open, onClose, anchorRef }: { f: RatingFilters; setR: (p: Partial<RatingFilters>) => void; open: boolean; onClose: () => void; anchorRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <FilterDropdown open={open} onClose={onClose} anchorRef={anchorRef}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* ── Общие фильтры ── */}
        <SectionHeader>Общие</SectionHeader>
        <div>
          <div style={SECTION_LABEL}>Сортировка</div>
          <CustomRadio checked={f.sortDir === 'desc'} label="По убыванию" onChange={() => setR({ sortDir: 'desc' })} />
          <CustomRadio checked={f.sortDir === 'asc'} label="По возрастанию" onChange={() => setR({ sortDir: 'asc' })} />
        </div>
        <SectionDivider />
        <div>
          <div style={SECTION_LABEL}>Член НАПКА</div>
          <CustomRadio checked={f.napka === 'ignore'} label="Не учитывать" onChange={() => setR({ napka: 'ignore' })} />
          <CustomRadio checked={f.napka === 'yes'} label="Да" onChange={() => setR({ napka: 'yes' })} />
          <CustomRadio checked={f.napka === 'no'} label="Нет" onChange={() => setR({ napka: 'no' })} />
        </div>
        <SectionDivider />
        <div>
          <div style={SECTION_LABEL}>Работает на рынке, лет</div>
          <RangeInputs fromVal={f.experienceFrom} toVal={f.experienceTo} onFromChange={v => setR({ experienceFrom: v })} onToChange={v => setR({ experienceTo: v })} />
        </div>

        {/* ── Метрики ── */}
        <SectionDivider />
        <SectionHeader>Метрики</SectionHeader>
        <div>
          <div style={SECTION_LABEL}>Выручка + пр. доходы, тыс ₽</div>
          <RangeInputs fromVal={f.revenueFrom} toVal={f.revenueTo} onFromChange={v => setR({ revenueFrom: v })} onToChange={v => setR({ revenueTo: v })} />
        </div>
        <SectionDivider />
        <div>
          <div style={SECTION_LABEL}>Чистая прибыль, тыс ₽</div>
          <RangeInputs fromVal={f.profitFrom} toVal={f.profitTo} onFromChange={v => setR({ profitFrom: v })} onToChange={v => setR({ profitTo: v })} />
        </div>
        <SectionDivider />
        <div>
          <div style={SECTION_LABEL}>Темпы роста (CAGR 5 лет), %</div>
          <RangeInputs fromVal={f.cagrFrom} toVal={f.cagrTo} onFromChange={v => setR({ cagrFrom: v })} onToChange={v => setR({ cagrTo: v })} />
        </div>
        <SectionDivider />
        <div>
          <div style={SECTION_LABEL}>Рост фин. активов за 5 лет, %</div>
          <RangeInputs fromVal={f.growthRateFrom} toVal={f.growthRateTo} onFromChange={v => setR({ growthRateFrom: v })} onToChange={v => setR({ growthRateTo: v })} />
        </div>
        <SectionDivider />
        <div>
          <div style={SECTION_LABEL}>D/E коэффициент</div>
          <RangeInputs fromVal={f.deFrom} toVal={f.deTo} onFromChange={v => setR({ deFrom: v })} onToChange={v => setR({ deTo: v })} />
        </div>
      </div>
    </FilterDropdown>
  );
}

// ── Preset Tabs (снаружи карточки) ──────────────────────────────

const PRESETS: { id: Preset; label: string }[] = [
  { id: 'overview', label: 'Рейтинг ПКО-300' },
  { id: 'capital', label: 'Привлечение капитала' },
];

export function PresetTabs({ preset, onPresetChange }: { preset: Preset; onPresetChange: (p: Preset) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {PRESETS.map(p => (
        <button
          key={p.id}
          onClick={() => onPresetChange(p.id)}
          style={{
            padding: '8px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: p.id === preset ? 600 : 400,
            background: p.id === preset ? 'rgba(13,240,230,0.1)' : 'transparent',
            color: p.id === preset ? '#0DF0E6' : 'rgba(255,255,255,0.4)',
            border: '1px solid', borderColor: p.id === preset ? 'rgba(13,240,230,0.3)' : 'rgba(255,255,255,0.12)',
            cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap'
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

// ── Search + Filters (внутри карточки) ──────────────────────────

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
  const f = ratingFilters;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const filterBtnRef = useRef<HTMLDivElement>(null);

  const showFilters = preset === 'overview';
  const activeCount = countActiveFilters(f);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: isMobile ? '12px 12px' : '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Поиск */}
        <div style={{ position: 'relative', flex: 1, maxWidth: isMobile ? 'none' : '360px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'rgba(255,255,255,0.3)' }} />
          <input
            type="text"
            placeholder="Поиск компании"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              paddingLeft: '36px', paddingRight: '12px', paddingTop: '9px', paddingBottom: '9px',
              width: '100%', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.10)',
              fontSize: '13px', background: 'rgba(255,255,255,0.04)', color: '#fff',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Сравнить (hidden on mobile) */}
        {showFilters && onCompareModeToggle && !isMobile && (
          <button
            onClick={onCompareModeToggle}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '20px',
              border: `1px solid ${compareMode ? 'rgba(13,240,230,0.4)' : 'rgba(255,255,255,0.12)'}`,
              background: compareMode ? 'rgba(13,240,230,0.06)' : 'transparent',
              fontSize: '13px', fontWeight: 500,
              color: compareMode ? '#0DF0E6' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer', outline: 'none', whiteSpace: 'nowrap',
              transition: 'all 0.1s',
            }}
          >
            <GitCompareArrows style={{ width: '14px', height: '14px' }} />
            Сравнить
            {compareMode && selectedCount > 0 && (
              <span style={{
                width: '16px', height: '16px', borderRadius: '50%',
                background: '#0DF0E6', color: '#0a0f15', fontSize: '10px',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
              }}>
                {selectedCount}
              </span>
            )}
          </button>
        )}

        {/* Фильтры — icon-only on mobile */}
        {showFilters && (
          <div ref={filterBtnRef}>
            {isMobile ? (
              <button
                onClick={() => setDrawerOpen(!drawerOpen)}
                style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  border: `1px solid ${activeCount > 0 ? 'rgba(13,240,230,0.2)' : 'rgba(255,255,255,0.12)'}`,
                  background: activeCount > 0 ? 'rgba(13,240,230,0.04)' : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', flexShrink: 0,
                }}
              >
                <SlidersHorizontal style={{ width: '16px', height: '16px', color: activeCount > 0 ? '#0DF0E6' : 'rgba(255,255,255,0.4)' }} />
                {activeCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    width: '16px', height: '16px', borderRadius: '50%',
                    background: '#0DF0E6', color: '#0a0f15', fontSize: '9px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                  }}>
                    {activeCount}
                  </span>
                )}
              </button>
            ) : (
              <FilterToggleButton isActive={activeCount > 0} activeCount={activeCount} onClick={() => setDrawerOpen(!drawerOpen)} />
            )}
          </div>
        )}
      </div>

      {/* Filter Dropdown (portal) */}
      {showFilters && (
        <FilterPanel f={f} setR={setR} open={drawerOpen} onClose={() => setDrawerOpen(false)} anchorRef={filterBtnRef} />
      )}

      {/* Active filter chips */}
      {showFilters && (() => {
        const allActiveCount = countActiveFilters(f);
        if (allActiveCount === 0) return null;
        const chipStyle: React.CSSProperties = {
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '6px 12px', background: 'rgba(13,240,230,0.06)', borderRadius: '100px',
          fontSize: '13px', fontWeight: 500, color: '#0DF0E6',
          border: '1px solid rgba(13,240,230,0.15)',
          whiteSpace: 'nowrap', flexShrink: 0,
        };
        const btnStyle: React.CSSProperties = { background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' };
        const xIcon = <X style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.4)' }} />;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: isMobile ? 'nowrap' : 'wrap', overflowX: isMobile ? 'auto' : 'visible', WebkitOverflowScrolling: 'touch' as any }}>
            {f.sortDir !== 'desc' && (
              <div style={chipStyle}>Сорт: По возрастанию<button onClick={() => setR({ sortDir: 'desc' })} style={btnStyle}>{xIcon}</button></div>
            )}
            {f.napka !== 'ignore' && (
              <div style={chipStyle}>НАПКА: {f.napka === 'yes' ? 'Да' : 'Нет'}<button onClick={() => setR({ napka: 'ignore' })} style={btnStyle}>{xIcon}</button></div>
            )}
            {(f.experienceFrom !== '' || f.experienceTo !== '') && (
              <div style={chipStyle}>Стаж: {f.experienceFrom || '∞'} — {f.experienceTo || '∞'} лет<button onClick={() => setR({ experienceFrom: '', experienceTo: '' })} style={btnStyle}>{xIcon}</button></div>
            )}
            {(f.revenueFrom !== '' || f.revenueTo !== '') && (
              <div style={chipStyle}>Выручка: {f.revenueFrom || '∞'} — {f.revenueTo || '∞'}<button onClick={() => setR({ revenueFrom: '', revenueTo: '' })} style={btnStyle}>{xIcon}</button></div>
            )}
            {(f.profitFrom !== '' || f.profitTo !== '') && (
              <div style={chipStyle}>Прибыль: {f.profitFrom || '∞'} — {f.profitTo || '∞'}<button onClick={() => setR({ profitFrom: '', profitTo: '' })} style={btnStyle}>{xIcon}</button></div>
            )}
            {(f.cagrFrom !== '' || f.cagrTo !== '') && (
              <div style={chipStyle}>CAGR: {f.cagrFrom || '∞'} — {f.cagrTo || '∞'}%<button onClick={() => setR({ cagrFrom: '', cagrTo: '' })} style={btnStyle}>{xIcon}</button></div>
            )}
            {(f.growthRateFrom !== '' || f.growthRateTo !== '') && (
              <div style={chipStyle}>Рост фин. акт.: {f.growthRateFrom || '∞'} — {f.growthRateTo || '∞'}%<button onClick={() => setR({ growthRateFrom: '', growthRateTo: '' })} style={btnStyle}>{xIcon}</button></div>
            )}
            {(f.deFrom !== '' || f.deTo !== '') && (
              <div style={chipStyle}>D/E: {f.deFrom || '0'} — {f.deTo || '∞'}<button onClick={() => setR({ deFrom: '', deTo: '' })} style={btnStyle}>{xIcon}</button></div>
            )}
            <button
              onClick={() => setR({
                sortDir: 'desc', napka: 'ignore',
                experienceFrom: '', experienceTo: '',
                capitalPublic: true, capitalCorporate: true, capitalNone: true,
                revenueFrom: '', revenueTo: '',
                profitFrom: '', profitTo: '',
                deFrom: '', deTo: '',
                growthRateFrom: '', growthRateTo: '',
                cagrFrom: '', cagrTo: '',
              })}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '6px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px',
                fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              <X style={{ width: '14px', height: '14px' }} />
              Сбросить все
            </button>
          </div>
        );
      })()}
    </div>
  );
}

// ── Legacy wrapper (kept for backward compat) ───────────────────

export function FilterBar({
  searchQuery, onSearchChange,
  ratingFilters, onRatingFiltersChange,
  preset, onPresetChange,
}: FilterBarProps) {
  return (
    <div style={{
      background: '#0a0f15', padding: '12px 32px',
      position: 'sticky', top: 0, zIndex: 40,
    }}>
      <PresetTabs preset={preset} onPresetChange={onPresetChange} />
    </div>
  );
}
