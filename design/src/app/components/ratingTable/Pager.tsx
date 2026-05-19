import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZE } from './helpers';
import s from './RatingTable.module.css';

interface PagerProps {
  page: number;
  totalPages: number;
  setPage: (n: number | ((p: number) => number)) => void;
  totalCompanies: number;
  mobile?: boolean;
}

export function Pager({ page, totalPages, setPage, totalCompanies, mobile }: PagerProps) {
  if (totalPages <= 1) return null;
  const first = page * PAGE_SIZE + 1;
  const last = Math.min((page + 1) * PAGE_SIZE, totalCompanies);

  return (
    <div className={`${s.pager} ${mobile ? s.pagerMobile : ''}`}>
      <span>{first}–{last} из {totalCompanies}</span>
      <div className={s.pagerNav}>
        <button
          type="button"
          className={s.pagerBtn}
          disabled={page === 0}
          onClick={() => setPage(p => (p as number) - 1)}
          aria-label="Предыдущая страница"
        >
          <ChevronLeft style={{ width: '16px', height: '16px' }} />
        </button>

        {!mobile && Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`${s.pagerNum} ${i === page ? s.pagerNumActive : ''}`}
            onClick={() => setPage(i)}
            aria-label={`Страница ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}

        <button
          type="button"
          className={s.pagerBtn}
          disabled={page === totalPages - 1}
          onClick={() => setPage(p => (p as number) + 1)}
          aria-label="Следующая страница"
        >
          <ChevronRight style={{ width: '16px', height: '16px' }} />
        </button>
      </div>
    </div>
  );
}
