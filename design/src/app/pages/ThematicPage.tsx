import { ArticleCard } from '../components/ArticleCard';
import { URLS, loadArticles } from '../data/loader';
import { useAsyncData } from '../data/useAsyncData';
import type { Article } from '../data/articlesData';
import { PageLayout } from './PageLayout';
import type { Router } from '../routing';
import s from './ThematicPage.module.css';

export function ThematicPage({ router }: { router: Router }) {
  const { data } = useAsyncData<Article[]>(URLS.articles, loadArticles);
  const articles = data ?? [];

  return (
    <PageLayout
      activeTab="thematic"
      onNavigateToRating={router.goRating}
      onNavigateToThematic={router.goThematic}
    >
      <button type="button" onClick={router.goRating} className={s.backLink}>
        ← ПКО-300
      </button>

      <h1 className={s.title}>Тематические рейтинги</h1>
      <p className={s.lead}>
        Аналитические материалы и исследования на основе данных рейтинга ПКО-300.
      </p>

      <div className={s.grid}>
        {articles.map(article => (
          <ArticleCard key={article.id} article={article} onClick={router.goArticle} />
        ))}
      </div>
    </PageLayout>
  );
}
