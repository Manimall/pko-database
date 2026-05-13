import { lazy, Suspense, useMemo, useState } from 'react';
import { HeroScreen } from '../components/HeroScreen';
import {
  PresetTabs,
  SearchFilterBar,
  Preset,
  RatingFilters,
  EMPTY_FILTERS,
} from '../components/filterBar';
import { RatingTable } from '../components/ratingTable';
import { InvestmentTable } from '../components/investmentTable';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { CompareFloatingBar } from '../components/CompareFloatingBar';
import { applyFilters, buildExtraColumns } from './ratingFilters';

// Compare modal only mounts when user clicks "Сравнить" — code-split it.
const CompareModal = lazy(() =>
  import('../components/CompareModal').then(m => ({ default: m.CompareModal }))
);
import { useIsMobile } from '../shared/hooks/useIsMobile';
import { ratingData } from '../data/ratingData';
import type { Router } from '../routing';
import s from './RatingPage.module.css';

export function RatingPage({ router }: { router: Router }) {
  const isMobile = useIsMobile();
  const [preset, setPreset] = useState<Preset>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilters, setRatingFilters] = useState<RatingFilters>(EMPTY_FILTERS);

  const [compareMode, setCompareMode] = useState(false);
  const [selectedInns, setSelectedInns] = useState<Set<string>>(new Set());
  const [showCompareModal, setShowCompareModal] = useState(false);

  const ratingCompanies = useMemo(
    () => applyFilters(ratingData, searchQuery, ratingFilters),
    [searchQuery, ratingFilters]
  );
  const extraColumns = useMemo(() => buildExtraColumns(ratingFilters), [ratingFilters]);

  const showSidebar = preset === 'overview';

  const toggleCompare = () => {
    if (compareMode) {
      setCompareMode(false);
      setSelectedInns(new Set());
    } else {
      setCompareMode(true);
    }
  };

  const toggleSelected = (inn: string) => {
    setSelectedInns(prev => {
      const next = new Set(prev);
      if (next.has(inn)) next.delete(inn);
      else if (next.size < 5) next.add(inn);
      return next;
    });
  };

  return (
    <div className={s.root}>
      <HeroScreen
        activeTab="pko300"
        onNavigateToThematic={router.goThematic}
        onNavigateToRating={router.goRating}
      />

      <div className={s.stickyTabs}>
        <PresetTabs preset={preset} onPresetChange={setPreset} />
      </div>

      <main className={s.main}>
        <div className={`${s.grid} ${showSidebar && !isMobile ? '' : s.gridSingleCol}`}>
          <div className={s.card}>
            <SearchFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              ratingFilters={ratingFilters}
              onRatingFiltersChange={setRatingFilters}
              preset={preset}
              compareMode={compareMode}
              onCompareModeToggle={toggleCompare}
              selectedCount={selectedInns.size}
            />

            {preset === 'overview' ? (
              ratingCompanies.length === 0 ? (
                <div className={s.empty}>По вашему запросу ничего не найдено</div>
              ) : (
                <RatingTable
                  companies={ratingCompanies}
                  onCompanyClick={router.goCompany}
                  compareMode={compareMode}
                  selectedInns={selectedInns}
                  onToggleSelect={toggleSelected}
                  maxSelected={5}
                  extraColumns={extraColumns}
                />
              )
            ) : (
              <InvestmentTable onCompanyClick={router.goCompany} />
            )}

            {preset === 'overview' && (
              <p className={s.disclaimer}>
                Данные на основе отчётности ФНС. Только для информационных целей.
              </p>
            )}
          </div>

          {showSidebar && !isMobile && (
            <aside className={s.sidebar}>
              <Sidebar onArticleClick={router.goArticle} />
            </aside>
          )}
        </div>

        {showSidebar && isMobile && (
          <div className={s.sidebarMobile}>
            <Sidebar onArticleClick={router.goArticle} />
          </div>
        )}
      </main>

      <Footer />

      {compareMode && selectedInns.size > 0 && (
        <CompareFloatingBar
          selectedCompanies={ratingData.filter(c => selectedInns.has(c.inn))}
          onRemove={inn => setSelectedInns(prev => {
            const next = new Set(prev);
            next.delete(inn);
            return next;
          })}
          onCompare={() => setShowCompareModal(true)}
          onCancel={() => {
            setCompareMode(false);
            setSelectedInns(new Set());
          }}
        />
      )}

      {showCompareModal && (
        <Suspense fallback={null}>
          <CompareModal
            companies={ratingData.filter(c => selectedInns.has(c.inn))}
            onClose={() => setShowCompareModal(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
