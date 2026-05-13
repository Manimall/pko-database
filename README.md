# PKO-300 — pko300.ru

Главный рейтинг профессиональных коллекторских организаций России. Сайт работает по адресу [pko300.ru](https://pko300.ru).

Репозиторий содержит:

- **`design/`** — фронтенд сайта на React 18 + Vite + TypeScript (CSS Modules)
- **`data/`** — исходные xlsx-файлы базы ПКО
- **`scripts/`** — Python-пайплайн для генерации данных из xlsx
- **`docs/`** — техническое задание, бриф и рекомендации
- **`results/`** — артефакты проверок данных

---

## Локальный запуск фронтенда

### Что нужно

- **Node.js 20.x** (рекомендуется 20.19+). На macOS удобно через [nvm](https://github.com/nvm-sh/nvm).
- **pnpm 10+** (на новых нодах ставится через `corepack enable && corepack prepare pnpm@latest --activate`).

### Команды

```bash
cd design

# Установка зависимостей (≈10–15 секунд)
pnpm install

# Запуск dev-сервера (http://localhost:5173)
pnpm dev

# Прод-сборка в design/dist
pnpm build

# Локальный предпросмотр прод-сборки
pnpm preview

# Тесты (Vitest)
pnpm test            # однократный прогон
pnpm test:watch      # watch-режим
```

### Если node не той версии

```bash
nvm install 20
nvm use 20
```

### Если pnpm не установлен

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

---

## Обновление данных

База ПКО редактируется в `data/ПКО_БАЗА_ДАННЫХ_2024.xlsx`. Чтобы пересобрать TS-файлы данных, которые читает фронтенд:

```bash
cd scripts
python3 update_data.py
```

Скрипт перезапишет файлы в `design/src/app/data/` (они помечены `Auto-generated`, не править вручную). Подробнее — в [CLAUDE.md](CLAUDE.md).

---

## Архитектура фронтенда

```
design/
├── index.html              # точка входа (preload hero JPG + Inter cyrillic)
├── package.json            # только то, что реально используется: react, react-dom, lucide-react + vite
├── vite.config.ts
├── vercel.json             # SPA-rewrite для прямых ссылок
├── public/                 # ассеты: логотипы (440), шрифты, hero
└── src/
    ├── main.tsx
    ├── app/
    │   ├── App.tsx                          # роутинг-диспетчер, 29 строк
    │   ├── routing.ts                       # useRouter() + History API (pushState/popstate)
    │   ├── shared/
    │   │   ├── theme.ts                     # TS-зеркало дизайн-токенов
    │   │   └── hooks/useIsMobile.ts
    │   ├── pages/
    │   │   ├── PageLayout.tsx               # общий шелл (Header + container + Footer)
    │   │   ├── RatingPage.tsx               # главная: фильтры + таблица + сравнение
    │   │   ├── ratingFilters.ts             # чистая логика фильтрации (тестируется отдельно)
    │   │   ├── CompanyPage.tsx              # карточка компании (lazy-chunk)
    │   │   ├── ArticlePage.tsx              # статья (lazy-chunk)
    │   │   └── ThematicPage.tsx             # список тематических рейтингов
    │   ├── components/
    │   │   ├── companyCard/                 # карточка ПКО: HeaderSection, FinancialsSection,
    │   │   │                                #   CapitalStructureSection, DynamicsSection,
    │   │   │                                #   FundraisingSidebar + helpers.ts + CSS-модуль
    │   │   ├── ratingTable/                 # таблица: DesktopTable, MobileTable, Pager, cells
    │   │   ├── filterBar/                   # фильтры: панель, поповер, чипы, типы
    │   │   ├── investmentTable/             # 4 таблицы привлечения капитала + бейджи
    │   │   ├── ArticleCard.tsx              # карточка статьи (для тематической сетки)
    │   │   ├── ArticleContent.tsx           # содержимое статьи (lazy-chunk)
    │   │   ├── CompanyAvatar.tsx            # общий аватар (логотип/буква) для 3 компонентов
    │   │   ├── CompareModal.tsx             # модалка сравнения (lazy-chunk)
    │   │   ├── CompareFloatingBar.tsx       # плашка выбранных
    │   │   ├── compareMetrics.ts            # метрики сравнения (отдельный модуль)
    │   │   ├── Footer.tsx
    │   │   ├── HeroScreen.tsx
    │   │   ├── Sidebar.tsx
    │   │   └── SiteHeader.tsx
    │   ├── data/                            # ⚠️ auto-generated TS-файлы из xlsx
    │   │   ├── ratingData.ts
    │   │   ├── companyDetails.ts            # подгружается отдельным чанком
    │   │   ├── financeDynamic.ts            # подгружается отдельным чанком
    │   │   ├── articlesData.ts
    │   │   ├── investmentData.ts
    │   │   └── logoMap.ts
    │   └── utils/
    │       └── formatCompanyName.ts         # stripOrgForm helper
    └── styles/
        ├── index.css                        # глобальный импорт
        ├── tokens.css                       # CSS-переменные (цвета, шрифты, размеры)
        └── fonts.css                        # @font-face (3 правила, было 56)
```

### Технические принципы

- **Стилизация**: CSS Modules + общие CSS-переменные в `styles/tokens.css`. Никакого Tailwind/PostCSS.
- **Логика отделена от UI**: бизнес-логика (`applyFilters`, `getPkoRank`, `routeFromLocation`, `fmtMoney`, метрики сравнения) живёт в отдельных `.ts`-модулях рядом с компонентами и покрыта тестами.
- **Code splitting**: страницы и тяжёлые компоненты (CompanyCard + companyDetails, ArticleContent, CompareModal) подгружаются через `React.lazy` — главный бандл 107 KB gzip, тяжёлый чанк компании 124 KB грузится только при клике.
- **Роутинг**: History API напрямую, без react-router. URL-схема: `/`, `/?company=INN`, `/thematic`, `/article/ID`.
- **Размер файлов**: все компоненты ≤300 строк; крупные разбиты на подпапки.
- **Тестирование**: Vitest + jsdom; 95 тестов покрывают роутинг, форматтеры, фильтры рейтинга, метрики сравнения, резолверы.

### Что лежит в `dist/` после `pnpm build`

| Файл | gzip |
|---|---|
| `index-*.js` (главный) | ~107 KB |
| `companyDetails-*.js` (lazy, только на карточке) | ~124 KB |
| `CompanyCard-*.js` (lazy) | ~7 KB |
| `CompareModal-*.js` (lazy) | ~2 KB |
| `ArticleContent-*.js` (lazy) | ~2 KB |
| `index-*.css` | ~2 KB |

Для сравнения, до оптимизации главный бандл был 239 KB gzip с monolithic JS.

---

## Деплой

Проект собирается на Vercel из ветки `main`:

- Build command: `pnpm build` (рабочая директория `design`)
- Output: `design/dist`
- `vercel.json` уже настроен на SPA-rewrite, чтобы прямые ссылки `/thematic`, `/article/:id`, `/?company=:inn` работали без 404.

---

## Дополнительная документация

- [docs/TECH_RECOMMENDATIONS.md](docs/TECH_RECOMMENDATIONS.md) — что ещё можно улучшить (PNG → WebP, lazy данных через fetch JSON, ESLint+CI и т.д.).
- [docs/ТЗ_ПЛАТФОРМА_ПКО.md](docs/ТЗ_ПЛАТФОРМА_ПКО.md) — техническое задание.
- [CLAUDE.md](CLAUDE.md) — правила работы с данными и git-флоу.
