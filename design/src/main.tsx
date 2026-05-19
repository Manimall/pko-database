import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import { loadRatingData, loadLogoMap, loadArticles } from './app/data/loader';
import './styles/index.css';

// Kick off fetches for first-paint data in parallel with React rendering.
// The fetches are cached in loader.ts, so components calling useAsyncData()
// will find them ready (or near-ready) by the time they mount.
loadRatingData();
loadLogoMap();
loadArticles();

createRoot(document.getElementById('root')!).render(<App />);
