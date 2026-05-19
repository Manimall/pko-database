import { lazy, Suspense } from 'react';
import { PageLayout } from './PageLayout';
import type { Router } from '../routing';

const ArticleContent = lazy(() =>
  import('../components/ArticleContent').then(m => ({ default: m.ArticleContent }))
);

export function ArticlePage({ id, router }: { id: string; router: Router }) {
  return (
    <PageLayout
      activeTab="thematic"
      onNavigateToRating={router.goRating}
      onNavigateToThematic={router.goThematic}
    >
      <Suspense fallback={null}>
        <ArticleContent
          articleId={id}
          onBack={router.goThematic}
          onArticleClick={router.goArticle}
        />
      </Suspense>
    </PageLayout>
  );
}
