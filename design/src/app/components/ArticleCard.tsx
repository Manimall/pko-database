import { ArrowRight, Calendar } from 'lucide-react';
import type { Article } from '../data/articlesData';
import s from './ArticleCard.module.css';

interface ArticleCardProps {
  article: Article;
  onClick: (id: string) => void;
}

export function ArticleCard({ article, onClick }: ArticleCardProps) {
  return (
    <button
      type="button"
      className={s.card}
      onClick={() => onClick(article.id)}
      aria-label={article.shortTitle}
    >
      <div className={s.imageBox}>
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className={s.body}>
        <div className={s.meta}>
          <Calendar style={{ width: '11px', height: '11px' }} />
          {article.date}
        </div>

        <h3 className={s.title}>{article.shortTitle}</h3>
        <p className={s.summary}>{article.summary}</p>

        <span className={s.cta}>
          Читать
          <ArrowRight style={{ width: '14px', height: '14px' }} />
        </span>
      </div>
    </button>
  );
}
