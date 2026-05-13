import { useCallback, useRef, useState } from 'react';
import type { RatingCompany } from '../../data/ratingData';
import { useIsMobile } from '../../shared/hooks/useIsMobile';
import { DesktopTable } from './DesktopTable';
import { MobileTable } from './MobileTable';
import { PAGE_SIZE, type ExtraColumn } from './helpers';

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
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(companies.length / PAGE_SIZE);
  const pagedCompanies = companies.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  if (page >= totalPages && totalPages > 0) setPage(0);

  // Scroll sync. iOS WebKit drops scrollLeft on overflow:hidden, so the header uses transform.
  const headerInnerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const handleBodyScroll = useCallback(() => {
    if (!bodyRef.current) return;
    const sL = Math.round(bodyRef.current.scrollLeft);
    if (headerInnerRef.current) {
      headerInnerRef.current.style.transform = `translate3d(${-sL}px, 0, 0)`;
    }
  }, []);

  if (isMobile) {
    return (
      <MobileTable
        companies={pagedCompanies}
        onCompanyClick={onCompanyClick}
        extraColumns={extraColumns}
        headerInnerRef={headerInnerRef}
        bodyRef={bodyRef}
        handleBodyScroll={handleBodyScroll}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        totalCompanies={companies.length}
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
      bodyRef={bodyRef}
      handleBodyScroll={handleBodyScroll}
      page={page}
      totalPages={totalPages}
      setPage={setPage}
      totalCompanies={companies.length}
    />
  );
}
