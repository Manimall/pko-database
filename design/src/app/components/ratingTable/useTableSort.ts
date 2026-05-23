import { useCallback, useMemo, useState } from 'react';
import type { RatingCompany } from '../../data/ratingData';
import { stripOrgForm } from '../../utils/formatCompanyName';
import type { SortDir, SortKey } from './helpers';

// Pure sort function — exported for testing.
export function sortCompanies(
  companies: RatingCompany[],
  key: SortKey,
  dir: SortDir,
): RatingCompany[] {
  return [...companies].sort((a, b) => {
    // For the name column sort by the display name (without org-form prefix).
    const va = key === 'name' ? stripOrgForm(a.name) : a[key];
    const vb = key === 'name' ? stripOrgForm(b.name) : b[key];

    if (typeof va === 'number' && typeof vb === 'number') {
      return dir === 'desc' ? vb - va : va - vb;
    }
    if (typeof va === 'string' && typeof vb === 'string') {
      const cmp = va.localeCompare(vb, 'ru', { sensitivity: 'base' });
      return dir === 'desc' ? -cmp : cmp;
    }
    return 0;
  });
}

export interface TableSortResult {
  sortedCompanies: RatingCompany[];
  sortKey: SortKey | null;
  sortDir: SortDir;
  handleSort: (key: SortKey) => void;
}

export function useTableSort(companies: RatingCompany[]): TableSortResult {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = useCallback((key: SortKey) => {
    setSortKey(prev => {
      if (prev === key) {
        setSortDir(d => (d === 'desc' ? 'asc' : 'desc'));
        return key;
      }
      setSortDir('desc');
      return key;
    });
  }, []);

  const sortedCompanies = useMemo(
    () => (sortKey ? sortCompanies(companies, sortKey, sortDir) : companies),
    [companies, sortKey, sortDir],
  );

  return { sortedCompanies, sortKey, sortDir, handleSort };
}
