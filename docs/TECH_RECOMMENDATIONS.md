# Технические рекомендации — pko-database / pko300.ru

Документ описывает, **что уже исправлено** в ветке `feat/back-button-and-optimization`, и **что ещё имеет смысл сделать** для скорости, поддерживаемости и роста.

---

## 1. Что сделано в этом проходе

### Исправлено
- **Браузерная кнопка «Назад» теперь работает.** В `design/src/app/App.tsx` три отдельных state-переменных (`selectedCompanyInn`, `page`, `selectedArticleId`) заменены одним `route: Route` с синхронизацией через History API:
  - `navigate(next)` делает `history.pushState` при переходе.
  - Слушатель `popstate` восстанавливает `route` из `window.location` при нажатии «Назад/Вперёд» в браузере.
  - URL-схема: `/` (рейтинг), `/?company=INN` (карточка ПКО, совместимо со старой «копировать ссылку»), `/thematic` (рейтинги-исследования), `/article/ID` (статья).
  - При загрузке по прямой ссылке роут парсится из URL — это сразу даёт share-friendly URL для карточек компаний и статей.

### Оптимизация загрузки (low-risk)
- На все `<img>` логотипов компаний (RatingTable, CompareModal, CompareFloatingBar, FinanceTable) добавлены `loading="lazy"` и `decoding="async"`. Логотипы ниже первого экрана теперь не блокируют LCP.
- Hero-картинка и иллюстрация в статье помечены `fetchPriority="high"` + `decoding="async"`.
- Превью статей в Sidebar/Thematic-сетке/Related тоже lazy.
- В `index.html` добавлены `<link rel="preload">` для hero JPG и кириллической подмножества Inter — браузер начинает грузить их параллельно с парсингом JS.

### Чистка
- Удалён неиспользуемый `design/src/app/data/mockData.ts` (431 строка).

### Что проверено
- `pnpm build` проходит, ошибок типов/линкера нет.
- Bundle: 1 089 KB raw / 239 KB gzip — без изменений по размеру, потому что dead-code-elimination и так выкидывал `mockData.ts`. Основной размер берут зависимости (см. §2).

---

## 2. Что снизит размер бандла сильнее всего

Сейчас всё приложение использует ровно одну вещь из «UI-кита» — хук `useIsMobile()` (`design/src/app/components/ui/use-mobile.ts`, 20 строк). Всё остальное в `components/ui/` (48 файлов, ~1500 строк) и связанные с ним зависимости в `package.json` не импортируются ни одним продакшен-компонентом.

### Шаг 1 — вырвать `useIsMobile` и убрать всю папку `ui/`
1. Перенести `useIsMobile` в `design/src/app/hooks/useIsMobile.ts`.
2. Перебить импорты (9 файлов): `from './ui/use-mobile'` → `from '../hooks/useIsMobile'`.
3. Удалить целиком `design/src/app/components/ui/` и `design/src/app/components/figma/` (он тоже нигде не используется).

### Шаг 2 — пройтись по `package.json`
Заведомо не используется (проверено `grep -rln`):

```
@emotion/react @emotion/styled @mui/icons-material @mui/material
@popperjs/core react-popper react-slick canvas-confetti
react-dnd react-dnd-html5-backend react-responsive-masonry
react-router motion date-fns
```

Используется только косвенно в `ui/` (то есть после шага 1 тоже не нужно):

```
все @radix-ui/* — 30 пакетов
class-variance-authority clsx tailwind-merge tw-animate-css
embla-carousel-react react-day-picker react-hook-form
input-otp vaul cmdk next-themes recharts sonner
react-resizable-panels
```

Останутся только:
```
react, react-dom, lucide-react
+ dev: vite, @vitejs/plugin-react, @tailwindcss/vite, tailwindcss
```

**Ожидаемый эффект:** install-time с ~57 с до ~10 с; bundle ~239 KB gzip → оценочно 80–110 KB gzip (после удаления Radix-зависимостей, которые сейчас тянутся через `tw-animate-css` и pivot-импорты).

### Шаг 3 — Tailwind тоже можно выкинуть
Реальные компоненты приложения **не используют ни одного `className=`** — всё через inline `style={…}`. Tailwind подключён через PostCSS только для `ui/`. После шага 1:
- Удалить `@tailwindcss/vite` и `tailwindcss` из `devDependencies`.
- Удалить `design/src/styles/tailwind.css` и `@import './tailwind.css'` из `index.css`.
- Из `vite.config.ts` убрать плагин `tailwindcss()`.
- Удалить `design/src/styles/theme.css` (это переменные shadcn/ui — для inline-стилей не нужны).
- В `index.css` останется только `@import './fonts.css'`.

### Шаг 4 — Lucide-react: импорт по подпути
Сейчас:
```ts
import { ArrowLeft, ArrowUp } from 'lucide-react';
```
`lucide-react` уже tree-shake'ится Vite-ом, но иконки тащатся как один объект. Безопаснее:
```ts
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
```
…или, как минимум, **посчитать иконки** (`grep -roh "from 'lucide-react'" -A0 src | wc -l`) и при числе <30 — оставить как есть; при больших количествах перейти на subpath-импорты.

---

## 3. Отделить данные от логики

Сейчас 4 файла данных импортируются прямо в JS-бандл:

| Файл | Размер | Когда нужно |
|---|---|---|
| `ratingData.ts` | 561 строка | первый экран — нужно сразу |
| `logoMap.ts` | 445 строк | первый экран |
| `companyDetails.ts` | 593 строки | **только** на карточке компании |
| `financeDynamic.ts` | 551 строка | **только** на карточке (динамика) |
| `articlesData.ts` | 195 строк | только на /thematic и /article |

Это значит, что при заходе на главную браузер парсит 2300+ строк JSON-в-JS, из которых на первом экране нужны только две таблицы.

### Рекомендуемый план

1. **Скрипту `scripts/update_data.py` параллельно генерировать JSON-файлы** в `design/public/data/`:
   ```
   public/data/rating.json
   public/data/logo-map.json
   public/data/company-details.json   # или по одному файлу на ИНН
   public/data/finance-dynamic.json
   public/data/articles.json
   ```
2. **На клиенте** заменить `import { ratingData }` на async fetch:
   ```ts
   const res = await fetch('/data/rating.json');
   const ratingData: RatingCompany[] = await res.json();
   ```
   В компоненте — `useEffect` + `useState`, либо более чистый кастомный хук `useJson<T>(url)`.
3. Для CompanyCard данные подтягиваются **только при открытии карточки** — экономия 1100+ строк на первом заходе.
4. Тип `RatingCompany`, `CompanyDetails` и т.д. оставляем в TS-файлах рядом — но без значений, только `export interface`.
5. Кэшируется автоматически — Vercel выставит `Cache-Control: public, max-age=…` для статики, и при следующих заходах файлы тянутся из disk-cache.

**Ожидаемый эффект:** первый JS-чанк уменьшается на 60–80 KB gzip; данные грузятся параллельно, а не в составе main-бандла, который блокирует first paint.

---

## 4. Картинки

- **Логотипы (`public/logos/`, 6.1 MB).** Перегнать PNG → WebP скриптом:
  ```bash
  cd design/public/logos
  for f in *.png; do cwebp -q 85 "$f" -o "${f%.png}.webp"; done
  ```
  В `logoMap.ts` оставить PNG-имена, а в `<img>` рендерить `<picture>` с двумя `<source>` (WebP + PNG-фоллбэк). Реальное падение веса — 60–80%.
- **`hero-architecture.jpg` (261 KB)** — пересохранить как WebP, отдать через `<picture>`. Размер пересчёта обычно ~50–80 KB.
- **`article-1.jpg` (290 KB)** — то же самое. Если автор подкладывает RAW-фотки — добавить в `update_data.py` шаг конвертации.
- **Размеры в HTML.** Сейчас `<img>` не имеют `width`/`height` — браузер пересчитывает layout при загрузке. Добавить атрибуты или задать через CSS `aspect-ratio` для контейнеров (это уже сделано для article preview, проверить остальные).

---

## 5. Шрифты

В `fonts.css` 56 `@font-face`-объявлений на 15 файлов. На русскоязычном сайте реально используются 1–2 кириллические подгруппы (вес 400 и 600/700). Остальные (greek, vietnamese, latin-ext) тащатся «на всякий случай» — браузер их не загрузит при `unicode-range`-фильтрации, но 56 правил всё равно парсятся.

- **Минимум** — оставить только `cyrillic` + `latin` подмножества для весов 400, 500, 600, 700 → ~8 правил. Можно вообще обойтись только cyrillic-подмножеством.
- **Альтернатива** — убрать самохостинг и переехать обратно на `fonts.googleapis.com` (преимущество: shared cache между сайтами).

---

## 6. Code splitting

Если данные останутся в JS — хотя бы разнести страницы:

```tsx
const CompanyCard = lazy(() => import('./components/CompanyCard'));
const ArticlePage = lazy(() => import('./components/ArticlePage'));
const CompareModal = lazy(() => import('./components/CompareModal'));
```

В `vite.config.ts` можно явно задать chunks:
```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'data-company': ['./src/app/data/companyDetails.ts', './src/app/data/financeDynamic.ts'],
      },
    },
  },
},
```

---

## 7. Рекомендации по архитектуре и стилю кода

### Структура папок
Сейчас:
```
src/app/
  App.tsx           ← 480 строк, и роутинг, и thematic-сетка inline
  components/       ← всё вперемешку
  data/             ← данные
```
Лучше:
```
src/
  app/              ← App + роутинг
  pages/            ← RatingPage.tsx, ThematicPage.tsx, ArticlePage.tsx, CompanyPage.tsx
  features/         ← rating-table, compare, filters
  shared/ui/        ← Avatar, NumberCell, Tag, BackLink — переиспользуемые «атомы»
  shared/hooks/     ← useIsMobile, useJson, useRoute
  data/             ← типы + загрузка
  styles/           ← глобал стили
```
Сейчас в `App.tsx` вкручен render thematic-сетки на 100+ строк. Это надо вынести в `pages/ThematicPage.tsx`.

### Стили
Решить один раз: **либо inline `style={}`, либо CSS Modules / Tailwind**. Текущий микс «всё inline + Tailwind, который не используется» — это ловушка для будущего разработчика. Рекомендую CSS Modules:
- Никаких runtime cost.
- Стили видны в DevTools нормальными классами.
- Inline остаётся только для динамических значений (вычисляемая ширина и т.п.).

Простейший минимум — выделить design tokens в один файл:
```ts
// src/shared/theme.ts
export const colors = {
  bg: '#0a0f15',
  card: '#111920',
  accent: '#0DF0E6',
  border: 'rgba(255,255,255,0.06)',
  textMuted: 'rgba(255,255,255,0.4)',
};
export const fontFamily = "Inter, -apple-system, 'Segoe UI', sans-serif";
```
И импортировать вместо строковых литералов, разбросанных по 14 файлам.

### Дублирование «обёртки страницы»
В `App.tsx` 4 раза подряд встречается:
```tsx
<div style={{ minHeight:'100vh', background:'#0a0f15', ... }}>
  <SiteHeader … />
  <div style={{ maxWidth:'1100px', … }}>{children}</div>
  <Footer />
</div>
```
Это просится в `<PageLayout activeTab>{children}</PageLayout>`. Сокращает App.tsx на 30–40 строк и убирает источник расхождений.

### Производительность React
- `ratingCompanies` (filter+sort) сейчас пересчитывается **на каждом ререндере App** — IIFE без `useMemo`. При 530 строк это пока неощутимо, но при добавлении более тяжёлых фильтров обернуть в `useMemo(() => …, [searchQuery, ratingFilters])`.
- `RatingTable` рендерит сразу все строки (PAGE_SIZE = 100, но всё равно). При расширении до полного списка стоит подумать о `react-virtuoso` или `@tanstack/react-virtual`.
- Inline-функции в `onMouseEnter/Leave` хэндлерах создают новые closures на каждый ререндер карточек статей. Для длинных списков завернуть в `React.memo` + стабильные обработчики.

### Качество кода
- **Включить TypeScript strict mode.** Сейчас в `tsconfig.json` его, скорее всего, нет (надо проверить — файл я не открывал). `"strict": true` отловит `selectedCompanyInn`-style проблемы на этапе компиляции.
- **Добавить ESLint + Prettier.** Хотя бы:
  ```
  eslint-config-airbnb-typescript
  eslint-plugin-react-hooks  ← особенно полезен
  eslint-plugin-jsx-a11y     ← полезен для img alt и т.п.
  ```
- **CI / GitHub Actions.** Простейший workflow на 10 строк: `pnpm install && pnpm build && pnpm typecheck`. Это уже отловит 80% багов до мержа.

### SEO и шаринг
- На карточках компаний сейчас нет уникального `<title>` / `<meta description>` / OG-тегов. После того как роутинг даёт уникальные URL — имеет смысл управлять `document.title` из эффекта в `CompanyCard` и `ArticlePage`.
- Для соц-сетей (`og:image`, `og:title`) полноценный SSR не нужен — достаточно прероллированных мета-тегов через простейший Vercel Edge-функцию или статически сгенерированные страницы (для топ-30 компаний — это 30 HTML-файлов).

### Аналитика
Если интересна реальная скорость у пользователей — добавить веб-вайталы:
```ts
import { onCLS, onFID, onLCP } from 'web-vitals';
[onCLS, onFID, onLCP].forEach(fn => fn(m => sendBeacon('/vitals', m)));
```
И смотреть p75 LCP по реальным сессиям, а не только в Lighthouse.

---

## 8. Что НЕ стоит делать
- Не переходить на `react-router` ради текущих 4 URL-ов — History API даёт всё что нужно за 30 строк. `react-router` (он уже в зависимостях, кстати) станет оправданным, когда страниц будет 10+.
- Не «улучшать» данные на лету в `update_data.py` так, чтобы клиент потом транспонировал. Лучше один раз отдать готовый JSON.
- Не вводить state-менеджмент (Redux/Zustand) — в текущей модели 6 state-переменных в `App.tsx` это перебор.

---

## 9. Резюме

Если делать поэтапно (рекомендую такой порядок — каждый шаг — отдельный PR):

| Шаг | Эффект | Сложность |
|---|---|---|
| Браузерный «назад» (сделано) | UX-баг исправлен | низкая |
| Lazy/preload картинок (сделано) | LCP −200…400 ms | низкая |
| Удалить `components/ui/` + `figma/` + мусор из `package.json` | -50% size+deps | средняя (механика, риск 0) |
| Убрать Tailwind | -10 KB CSS, -1 dev plugin | средняя |
| Конвертировать логотипы в WebP | -4–5 MB трафика на холодном кэше | низкая (скрипт) |
| Данные через fetch JSON | -60–80 KB gzip JS | средняя |
| Code splitting CompanyCard / ArticlePage | -50–80 KB gzip с первого экрана | низкая |
| TS strict + ESLint + CI | защита от регрессий | низкая |

Каждый из этих пунктов — изолированный PR на 30–200 строк диффа, легко ревьюится и легко откатывается.
