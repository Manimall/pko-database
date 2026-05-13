import { ArticleContent } from '../components/ArticleContent';
import { PageLayout } from './PageLayout';
import type { Router } from '../routing';

export function ArticlePage({ id, router }: { id: string; router: Router }) {
  return (
    <PageLayout
      activeTab="thematic"
      onNavigateToRating={router.goRating}
      onNavigateToThematic={router.goThematic}
    >
      <ArticleContent
        articleId={id}
        onBack={router.goThematic}
        onArticleClick={router.goArticle}
      />
    </PageLayout>
  );
}
