import { useRouter } from './routing';
import { RatingPage } from './pages/RatingPage';
import { CompanyPage } from './pages/CompanyPage';
import { ArticlePage } from './pages/ArticlePage';
import { ThematicPage } from './pages/ThematicPage';

export default function App() {
  const router = useRouter();
  const { route } = router;

  const rating = <RatingPage router={router} />;

  switch (route.kind) {
    case 'company':
      return (
        <CompanyPage
          inn={route.inn}
          router={router}
          renderUnknown={() => rating}
        />
      );
    case 'article':
      return <ArticlePage id={route.id} router={router} />;
    case 'thematic':
      return <ThematicPage router={router} />;
    default:
      return rating;
  }
}
