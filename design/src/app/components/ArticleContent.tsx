import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import { URLS, loadArticles } from '../data/loader';
import { useAsyncData } from '../data/useAsyncData';
import type { Article, ArticleSection } from '../data/articlesData';
import s from './ArticleContent.module.css';

function SectionRenderer({ section }: { section: ArticleSection }) {
  switch (section.type) {
    case 'heading':
      return <h2 className={s.heading}>{section.content}</h2>;
    case 'subheading':
      return <h3 className={s.subheading}>{section.content}</h3>;
    case 'paragraph':
      return <p className={s.paragraph}>{section.content}</p>;
    case 'bullets':
      return (
        <ul className={s.bullets}>
          {section.items?.map((item, i) => (
            <li key={i} className={s.bullet}>{item}</li>
          ))}
        </ul>
      );
    case 'table':
      if (!section.table) return null;
      return (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                {section.table.headers.map((h, i) => <th key={i}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {section.table.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

interface ArticleContentProps {
  articleId: string;
  onBack: () => void;
  onArticleClick: (id: string) => void;
}

export function ArticleContent({ articleId, onBack, onArticleClick }: ArticleContentProps) {
  const { data, loading } = useAsyncData<Article[]>(URLS.articles, loadArticles);
  const articles = data ?? [];
  const article = articles.find(a => a.id === articleId);

  if (loading) return null;
  if (!article) return <div className={s.notFound}>Статья не найдена</div>;

  const otherArticles = articles.filter(a => a.id !== articleId);

  return (
    <div className={s.root}>
      <button type="button" className={s.backLink} onClick={onBack}>
        <ArrowLeft style={{ width: '14px', height: '14px' }} />
        Тематические рейтинги
      </button>

      <div className={s.heroBox}>
        <img
          src={article.image}
          alt={article.title}
          decoding="async"
          fetchPriority="high"
        />
      </div>

      <div className={s.meta}>
        <Calendar style={{ width: '12px', height: '12px' }} />
        {article.date}
      </div>

      <h1 className={s.title}>{article.title}</h1>

      <div className={s.sections}>
        {article.sections.map((section, i) => (
          <SectionRenderer key={i} section={section} />
        ))}
      </div>

      {otherArticles.length > 0 && (
        <div className={s.otherSection}>
          <h3 className={s.otherHeading}>Другие материалы</h3>
          <div className={s.otherList}>
            {otherArticles.map(a => (
              <button
                key={a.id}
                type="button"
                className={s.otherRow}
                onClick={() => onArticleClick(a.id)}
              >
                <div className={s.otherThumb}>
                  <img src={a.image} alt={a.title} loading="lazy" decoding="async" />
                </div>
                <div className={s.otherTitle}>{a.title}</div>
                <ArrowRight style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
