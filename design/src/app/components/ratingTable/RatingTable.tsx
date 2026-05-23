import { useCallback, useRef, useState } from 'react';
import type { RatingCompany } from '../../data/ratingData';
import { useIsMobile, useIsTablet } from '../../shared/hooks/useIsMobile';
import { DesktopTable } from './DesktopTable';
import { MobileTable } from './MobileTable';
import { PAGE_SIZE, type ExtraColumn } from './helpers';
import { useTableSort } from './useTableSort';

export type { ExtraColumn } from './helpers';

interface RatingTableProps {
  companies: RatingCompany[];
  onCompanyClick?: (inn: string) => void;
  compareMode?: boolean;
  selectedInns?: Set<string>;
  onToggleSelect?: (inn: string) => void;
  maxSelected?: number;
  extraColumns?: ExtraColumn[];
}

export function RatingTable({
  companies,
  onCompanyClick,
  compareMode = false,
  selectedInns,
  onToggleSelect,
  maxSelected = 5,
  extraColumns = [],
}: RatingTableProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const { sortedCompanies, sortKey: colSortKey, sortDir: colSortDir, handleSort } = useTableSort(companies);

  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(sortedCompanies.length / PAGE_SIZE);
  const pagedCompanies = sortedCompanies.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  if (page >= totalPages && totalPages > 0) setPage(0);

  const desktopHeaderRef = useRef<HTMLDivElement>(null);
  const mobileHeaderInnerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Keep horizontally split headers aligned with the scrollable table body.
  // iOS WebKit drops scrollLeft on overflow:hidden, so the mobile header still uses transform.
  const handleBodyScroll = useCallback(() => {
    const body = bodyRef.current;
    if (!body) return;

    const scrollLeft = Math.round(body.scrollLeft);
    if (mobileHeaderInnerRef.current) {
      mobileHeaderInnerRef.current.style.transform = `translate3d(${-scrollLeft}px, 0, 0)`;
    }
    if (desktopHeaderRef.current && desktopHeaderRef.current.scrollLeft !== scrollLeft) {
      desktopHeaderRef.current.scrollLeft = scrollLeft;
    }
  }, []);

  const handleHeaderScroll = useCallback(() => {
    const header = desktopHeaderRef.current;
    const body = bodyRef.current;
    if (!header || !body) return;

    const scrollLeft = Math.round(header.scrollLeft);
    if (body.scrollLeft !== scrollLeft) {
      body.scrollLeft = scrollLeft;
    }
  }, []);

  if (isMobile) {
    return (
      <MobileTable
        companies={pagedCompanies}
        onCompanyClick={onCompanyClick}
        extraColumns={extraColumns}
        headerInnerRef={mobileHeaderInnerRef}
        bodyRef={bodyRef}
        handleBodyScroll={handleBodyScroll}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        totalCompanies={sortedCompanies.length}
      />
    );
  }

  return (
    <DesktopTable
      companies={pagedCompanies}
      onCompanyClick={onCompanyClick}
      compareMode={compareMode}
      selectedInns={selectedInns}
      onToggleSelect={onToggleSelect}
      maxSelected={maxSelected}
      extraColumns={extraColumns}
      compact={isTablet}
      sortKey={colSortKey}
      sortDir={colSortDir}
      onSort={handleSort}
      headerRef={desktopHeaderRef}
      handleHeaderScroll={handleHeaderScroll}
      bodyRef={bodyRef}
      handleBodyScroll={handleBodyScroll}
      page={page}
      totalPages={totalPages}
      setPage={setPage}
      totalCompanies={sortedCompanies.length}
    />
  );
}
