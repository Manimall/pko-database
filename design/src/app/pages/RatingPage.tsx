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
import { useIsMobile } from '../shared/hooks/useIsMobile';
import { URLS, loadRatingData } from '../data/loader';
import { useAsyncData } from '../data/useAsyncData';
import type { RatingCompany } from '../data/ratingData';
import type { Router } from '../routing';
import { applyFilters, buildExtraColumns } from './ratingFilters';
import s from './RatingPage.module.css';

// Compare modal only mounts when user clicks "Сравнить" — code-split it.
const CompareModal = lazy(() =>
  import('../components/CompareModal').then(m => ({ default: m.CompareModal }))
);

const MAX_COMPARE = 5;

export function RatingPage({ router }: { router: Router }) {
  const isMobile = useIsMobile();
  const { data: ratingData, loading } = useAsyncData<RatingCompany[]>(URLS.rating, loadRatingData);
  const rows = ratingData ?? [];

  const [preset, setPreset] = useState<Preset>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilters, setRatingFilters] = useState<RatingFilters>(EMPTY_FILTERS);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedInns, setSelectedInns] = useState<Set<string>>(new Set());
  const [showCompareModal, setShowCompareModal] = useState(false);

  const ratingCompanies = useMemo(
    () => applyFilters(rows, searchQuery, ratingFilters),
    [rows, searchQuery, ratingFilters]
  );
  const extraColumns = useMemo(() => buildExtraColumns(ratingFilters), [ratingFilters]);

  const showSidebar = preset === 'overview';
  const selectedCompanies = rows.filter(c => selectedInns.has(c.inn));

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
      else if (next.size < MAX_COMPARE) next.add(inn);
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
              <RatingBody
                loading={loading}
                companies={ratingCompanies}
                router={router}
                compareMode={compareMode}
                selectedInns={selectedInns}
                toggleSelected={toggleSelected}
                extraColumns={extraColumns}
              />
            ) : (
              <InvestmentTable onCompanyClick={router.goCompany} searchQuery={searchQuery} />
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

      {compareMode && selectedCompanies.length > 0 && (
        <CompareFloatingBar
          selectedCompanies={selectedCompanies}
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
            companies={selectedCompanies}
            onClose={() => setShowCompareModal(false)}
          />
        </Suspense>
      )}
    </div>
  );
}

interface RatingBodyProps {
  loading: boolean;
  companies: RatingCompany[];
  router: Router;
  compareMode: boolean;
  selectedInns: Set<string>;
  toggleSelected: (inn: string) => void;
  extraColumns: ReturnType<typeof buildExtraColumns>;
}

function RatingBody({
  loading, companies, router, compareMode, selectedInns, toggleSelected, extraColumns,
}: RatingBodyProps) {
  if (loading)              return <div className={s.empty}>Загрузка…</div>;
  if (companies.length === 0) return <div className={s.empty}>По вашему запросу ничего не найдено</div>;
  return (
    <RatingTable
      companies={companies}
      onCompanyClick={router.goCompany}
      compareMode={compareMode}
      selectedInns={selectedInns}
      onToggleSelect={toggleSelected}
      maxSelected={MAX_COMPARE}
      extraColumns={extraColumns}
    />
  );
}
