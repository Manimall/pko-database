import { Banknote } from 'lucide-react';
import type { CompanyDetails, BondInfo, FundraisingInfo } from '../../data/companyDetails';
import s from './CompanyCard.module.css';

interface FundraisingSidebarProps {
  details: CompanyDetails;
}

export function FundraisingSidebar({ details }: FundraisingSidebarProps) {
  const fr = details.fundraising;
  const bonds = details.bonds;
  const isEmpty = !fr && (!bonds || bonds.length === 0);

  return (
    <div className={`${s.card} ${s.fundraisingCard}`}>
      <div className={s.sectionHead}>
        <Banknote style={{ width: '16px', height: '16px', color: 'var(--color-accent)' }} />
        <span className={s.sectionTitle}>Привлечение капитала</span>
      </div>

      {isEmpty
        ? <EmptyState />
        : <Body fundraising={fr} bonds={bonds} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className={s.fundraisingEmpty}>
      <span className={s.fundraisingEmptyMain}>Нет данных о публичном привлечении</span>
      <span className={s.fundraisingEmptySub}>Данные дополняются</span>
    </div>
  );
}

interface BodyProps {
  fundraising: FundraisingInfo | null;
  bonds: BondInfo[] | null;
}

function Body({ fundraising, bonds }: BodyProps) {
  const totalVolume = bonds?.reduce((sum, b) => sum + b.volume, 0) ?? 0;
  const firstRating = bonds?.find(b => b.rating)?.rating ?? null;

  return (
    <div className={s.fundraisingRows}>
      {fundraising && <FundraisingRows fr={fundraising} />}
      {bonds && bonds.length > 0 && (
        <>
          <div className={s.frDivider} />
          <BondsRows bonds={bonds} totalVolume={totalVolume} firstRating={firstRating} />
        </>
      )}
    </div>
  );
}

function FundraisingRows({ fr }: { fr: FundraisingInfo }) {
  const isConfirmed = fr.status === 'Подтверждено';
  return (
    <>
      <Row label="Тип" value={fr.type} />
      <Row
        label="Статус"
        value={fr.status}
        valueStyle={{ color: isConfirmed ? 'var(--color-accent)' : '#f59e0b' }}
      />
      {fr.founder && fr.founder !== '—' && (
        <Row label="Учредитель" value={fr.founder} />
      )}
    </>
  );
}

interface BondsRowsProps {
  bonds: BondInfo[];
  totalVolume: number;
  firstRating: string | null;
}

function BondsRows({ bonds, totalVolume, firstRating }: BondsRowsProps) {
  return (
    <>
      <Row label="Облигации" value={`${bonds.length} вып.`} mono />
      <Row label="Общий объём" value={`${totalVolume.toLocaleString('ru-RU')} млн ₽`} mono />
      {bonds[0].coupon && <Row label="Купон" value={bonds[0].coupon} />}
      {firstRating && <Row label="Рейтинг" value={firstRating} valueStyle={{ fontSize: '12px' }} />}
    </>
  );
}

interface RowProps {
  label: string;
  value: string;
  mono?: boolean;
  valueStyle?: React.CSSProperties;
}

function Row({ label, value, mono, valueStyle }: RowProps) {
  return (
    <div className={s.frRow}>
      <span className={s.frLabel}>{label}</span>
      <span className={mono ? s.frValueMono : s.frValue} style={valueStyle}>{value}</span>
    </div>
  );
}
