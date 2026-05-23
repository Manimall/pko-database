import { useState } from 'react';
import { useIsMobile } from '../../shared/hooks/useIsMobile';
import { BondsTable } from './BondsTable';
import { LoansTable, CorporateTable, AllTable } from './SimpleTables';
import s from './InvestmentTable.module.css';

export type InvestMode = 'bonds' | 'loans' | 'corporate' | 'all';

const MODE_OPTS: { value: InvestMode; label: string }[] = [
  { value: 'bonds',     label: 'Облигации (10)' },
  { value: 'loans',     label: 'Займы через сайт (3)' },
  { value: 'corporate', label: 'Корпоративные (11)' },
  { value: 'all',       label: 'Все (23)' },
];

interface ModeSwitcherProps {
  mode: InvestMode;
  onChange: (m: InvestMode) => void;
}

function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  const isMobile = useIsMobile();
  return (
    <div className={`${s.modeRow} ${isMobile ? s.modeRowMobile : ''}`}>
      {MODE_OPTS.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={`${s.modeTab} ${opt.value === mode ? s.modeTabActive : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

interface InvestmentTableProps {
  onCompanyClick?: (inn: string) => void;
  searchQuery?: string;
}

export function InvestmentTable({ onCompanyClick, searchQuery = '' }: InvestmentTableProps) {
  const [mode, setMode] = useState<InvestMode>('bonds');

  return (
    <div>
      <ModeSwitcher mode={mode} onChange={setMode} />
      <div className={s.tableWrap}>
        {mode === 'bonds'     && <BondsTable     onCompanyClick={onCompanyClick} searchQuery={searchQuery} />}
        {mode === 'loans'     && <LoansTable     onCompanyClick={onCompanyClick} searchQuery={searchQuery} />}
        {mode === 'corporate' && <CorporateTable onCompanyClick={onCompanyClick} searchQuery={searchQuery} />}
        {mode === 'all'       && <AllTable       onCompanyClick={onCompanyClick} searchQuery={searchQuery} />}
      </div>
    </div>
  );
}
