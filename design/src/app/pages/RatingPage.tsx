import { lazy, Suspense, useMemo, useState } from 'react';
import { HeroScreen } from '../components/HeroScreen';
import {
  PresetTabs,
  SearchFilterBar,
  Preset,
  RatingFilters,
} from '../components/filterBar';
import { RatingTable, ExtraColumn } from '../components/ratingTable';
import { InvestmentTable } from '../components/investmentTable';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { CompareFloatingBar } from '../components/CompareFloatingBar';

// Compare modal only mounts when user clicks "Сравнить" — code-split it.
const CompareModal = lazy(() =>
  import('../components/CompareModal').then(m => ({ default: m.CompareModal }))
);
import { useIsMobile } from '../shared/hooks/useIsMobile';
import { ratingData, RatingCompany } from '../data/ratingData';
import type { Router } from '../routing';
import s from './RatingPage.module.css';

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

function applyFilters(rows: RatingCompany[], q: string, f: RatingFilters): RatingCompany[] {
  const query = q.toLowerCase();
  const allCapitalChecked = f.capitalPublic && f.capitalCorporate && f.capitalNone;

  const filtered = rows.filter(c => {
    if (query && !c.name.toLowerCase().includes(query) && !c.inn.includes(query)) return false;

    if (f.napka === 'yes' && c.napka !== true)  return false;
    if (f.napka === 'no'  && c.napka !== false) return false;

    if (f.experienceFrom !== '' && c.experience < Number(f.experienceFrom)) return false;
    if (f.experienceTo   !== '' && c.experience > Number(f.experienceTo))   return false;

    if (!allCapitalChecked) {
      if (c.capitalAttraction === 'public'    && !f.capitalPublic)    return false;
      if (c.capitalAttraction === 'corporate' && !f.capitalCorporate) return false;
      if (c.capitalAttraction === 'none'      && !f.capitalNone)      return false;
    }

    if (f.revenueFrom !== '' && c.revenue < Number(f.revenueFrom)) return false;
    if (f.revenueTo   !== '' && c.revenue > Number(f.revenueTo))   return false;
    if (f.profitFrom  !== '' && c.profit  < Number(f.profitFrom))  return false;
    if (f.profitTo    !== '' && c.profit  > Number(f.profitTo))    return false;

    if (f.deFrom !== '' && c.de < Number(f.deFrom)) return false;
    if (f.deTo   !== '' && c.de > Number(f.deTo))   return false;

    if (f.growthRateFrom !== '' && c.growthRate < Number(f.growthRateFrom)) return false;
    if (f.growthRateTo   !== '' && c.growthRate > Number(f.growthRateTo))   return false;

    // CAGR в данных — доля (0.33 = 33%), пользователь вводит %.
    if (f.cagrFrom !== '' && c.cagr * 100 < Number(f.cagrFrom)) return false;
    if (f.cagrTo   !== '' && c.cagr * 100 > Number(f.cagrTo))   return false;

    return true;
  });

  return [...filtered].sort((a, b) =>
    f.sortDir === 'desc' ? a.rank - b.rank : b.rank - a.rank
  );
}

function buildExtraColumns(f: RatingFilters): ExtraColumn[] {
  const cols: ExtraColumn[] = [];
  if (f.deFrom !== '' || f.deTo !== '') {
    cols.push({ key: 'de', header: 'D/E', format: c => c.de.toFixed(2) });
  }
  if (f.growthRateFrom !== '' || f.growthRateTo !== '') {
    cols.push({
      key: 'growthRate',
      header: 'Рост фин. акт., %',
      format: c => `${Number(c.growthRate.toFixed(1)).toLocaleString('ru-RU')}%`,
    });
  }
  if (f.cagrFrom !== '' || f.cagrTo !== '') {
    cols.push({
      key: 'cagr',
      header: 'CAGR 5 лет, %',
      format: c => `${Number((c.cagr * 100).toFixed(1)).toLocaleString('ru-RU')}%`,
    });
  }
  return cols;
}

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
