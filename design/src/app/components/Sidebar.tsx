import { ArrowRight } from 'lucide-react';
import { articles } from '../data/articlesData';
import s from './Sidebar.module.css';

interface SidebarProps {
  onArticleClick?: (articleId: string) => void;
}

export function Sidebar({ onArticleClick }: SidebarProps) {
  return (
    <div className={s.root}>
      <div className={s.sectionHeader}>
        <span className={s.sectionLabel}>Материалы</span>
        <div className={s.sectionRule} />
      </div>

      <div className={s.articlesList}>
        {articles.map(article => (
          <button
            key={article.id}
            type="button"
            className={s.articleRow}
            onClick={() => onArticleClick?.(article.id)}
            aria-label={article.shortTitle}
          >
            <div className={s.thumb}>
              <img src={article.image} alt={article.title} loading="lazy" decoding="async" />
            </div>
            <h3 className={s.articleTitle}>{article.shortTitle}</h3>
            <ArrowRight style={{ width: '12px', height: '12px', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
          </button>
        ))}
      </div>

      <div className={s.banner}>
        <div className={s.bannerCard}>
          <div className={s.bannerInner}>
            <div className={s.accents} />
            <div className={s.accentGlow} />
            <div className={s.bannerContent}>
              <img className={s.bannerLogo} src="/logo-navigator.webp" alt="Навигатор" />
              <p className={s.bannerHeading}>
                Навигатор по&nbsp;технологическим решениям для&nbsp;работы с&nbsp;долговыми обязательствами
              </p>
              <p className={s.bannerSubheading}>
                От&nbsp;аналитики до&nbsp;продажи, взыскания и&nbsp;банкротства
              </p>
              <a
                className={s.bannerCta}
                href="https://navigator.debt-tech.ru/catalog"
                target="_blank"
                rel="noopener noreferrer"
              >
                Открыть каталог
                <ArrowRight style={{ width: '14px', height: '14px' }} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
