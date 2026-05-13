import { useState } from 'react';
import { ArrowUp, ArrowDown, ExternalLink, Link2, Pencil } from 'lucide-react';
import type { RatingCompany } from '../../data/ratingData';
import type { CompanyDetails } from '../../data/companyDetails';
import { stripOrgForm } from '../../utils/formatCompanyName';
import s from './CompanyCard.module.css';

interface HeaderSectionProps {
  company: RatingCompany;
  details: CompanyDetails;
  logoFile?: string;
}

export function HeaderSection({ company, details, logoFile }: HeaderSectionProps) {
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?company=${company.inn}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const handleEdit = () => {
    const subject = encodeURIComponent(`Правка карточки: ${company.name} (ИНН ${company.inn})`);
    window.open(`mailto:redchief@rvzrus.ru?subject=${subject}`, '_self');
  };

  return (
    <div className={`${s.card} ${s.headerCard}`}>
      <div className={s.headerLogo}>
        {logoFile
          ? <img src={`/logos/${logoFile}`} alt="" decoding="async" />
          : <span className={s.headerLogoLetter}>{stripOrgForm(company.name)[0]}</span>}
      </div>

      <div className={s.headerInfo}>
        <div className={s.headerTitleRow}>
          <span className={s.companyName}>{stripOrgForm(company.name)}</span>
          <span className={s.rankBadge}>#{company.rank}</span>
          {company.rankDelta !== 0 && (
            <span className={company.rankDelta > 0 ? s.deltaPos : s.deltaNeg}>
              {company.rankDelta > 0
                ? <ArrowUp   style={{ width: '12px', height: '12px' }} />
                : <ArrowDown style={{ width: '12px', height: '12px' }} />}
              {Math.abs(company.rankDelta)}
            </span>
          )}
          {company.napka && <span className={s.napkaBadge}>НАПКА</span>}
        </div>

        <div className={s.fullName}>{details.fullName}</div>

        {details.director && (
          <div className={s.director}>
            <span className={s.directorLabel}>Генеральный директор:</span>{' '}
            <span style={{ fontWeight: 500 }}>{details.director}</span>
          </div>
        )}

        <div className={s.metaRow}>
          <span>ИНН: <span className={s.metaValue}>{company.inn}</span></span>
          {details.ogrn             && <span>ОГРН: <span className={s.metaValue}>{details.ogrn}</span></span>}
          {details.registrationDate && <span>Рег.: <span className={s.metaValue}>{details.registrationDate}</span></span>}
          <span>{company.city}</span>
          {details.website && (
            <a
              className={s.metaLink}
              href={`https://${details.website}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {details.website} <ExternalLink style={{ width: '11px', height: '11px' }} />
            </a>
          )}
        </div>
      </div>

      <div className={s.actions}>
        <button
          type="button"
          className={`${s.actionBtn} ${linkCopied ? s.actionBtnActive : ''}`}
          onClick={handleCopyLink}
          title="Скопировать ссылку"
        >
          <Link2 style={{ width: '14px', height: '14px' }} />
          {linkCopied ? 'Скопировано' : 'Ссылка'}
        </button>
        <button
          type="button"
          className={s.actionBtn}
          onClick={handleEdit}
          title="Написать об ошибке в карточке"
        >
          <Pencil style={{ width: '13px', height: '13px' }} />
          Править
        </button>
      </div>
    </div>
  );
}
