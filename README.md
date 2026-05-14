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

### Требования

- **Node.js ≥ 20.19** (тестировалось на 20.19.4 и 22.13.1).
- **Corepack** (входит в Node 16+) — управляет версией pnpm автоматически.
- **cwebp** (`brew install webp`) — только если будешь пересобирать логотипы.

Версия pnpm пиннится через поле `"packageManager": "pnpm@10.6.5"` в `package.json` — corepack сам подхватит правильную версию при первой команде.

### Первый запуск с нуля

```bash
# 1. Клонировать
git clone git@github.com:Manimall/pko-database.git
cd pko-database/design

# 2. (Если node не той версии) — поставить через nvm
nvm install 20.19.4
nvm use 20.19.4

# 3. Включить corepack (один раз для системы; --force нужно только если ругается на shim'ы)
corepack enable --install-directory ~/.local/bin 2>/dev/null || corepack enable

# 4. Поставить зависимости (corepack автоматически возьмёт pnpm@10.6.5 из package.json)
pnpm install

# 5. Запустить dev-сервер — откроется http://localhost:5173/
pnpm dev
```

### Остальные команды

```bash
pnpm dev          # dev-сервер (HMR, http://localhost:5173)
pnpm build        # прод-сборка в design/dist
pnpm preview      # локальный предпросмотр прод-сборки
pnpm test         # все 95 unit-тестов, ~3 сек
pnpm test:watch   # watch-режим
```

### Если pnpm выдаёт ошибку про esbuild build scripts

В `package.json` уже прописано:
```json
"pnpm": { "onlyBuiltDependencies": ["esbuild"] }
```
— это разрешает esbuild'у запускать postinstall. Если всё равно жалуется, выполнить:

```bash
pnpm approve-builds   # один раз, выбрать esbuild → 'a' для approve all
```

### Если установлен pnpm@11+ и ругается на Node < 22.13

Поле `packageManager` в `package.json` заставит corepack использовать pnpm 10.6.5 (работает с Node 20.19+). Если этого не произошло, выполни:

```bash
corepack prepare pnpm@10.6.5 --activate
```

---

## Обновление данных без пересборки фронтенда

Данные ПКО лежат как **статические JSON-файлы** в `design/public/data/`. Фронтенд читает их через `fetch` при первой загрузке. **Обновление данных не требует пересборки и редеплоя фронтенда** — достаточно перезалить JSON.

### Workflow

1. Положить свежую выгрузку в `data/source/PKO-YYYY-MM.xlsx`.
2. Прогнать пайплайн:
   ```bash
   python3 scripts/update_data.py --dry-run   # посмотреть diff
   python3 scripts/update_data.py             # реальная запись
   ```
   Скрипт пишет в `design/public/data/`:
   - `rating.json`         — рейтинг (530+ компаний)
   - `company-details.json` — данные карточек
   - Сохраняет ручные правки (`napka`, `capitalAttraction`, `website`, `fundraising`, `bonds`) из текущих JSON-ов.
3. Закоммитить и запушить — Vercel задеплоит обновлённые статические файлы.

### Конверсия логотипов

Если в базу добавились новые ПКО с PNG-логотипами:
```bash
bash design/scripts/convert-images-to-webp.sh
```
Скрипт идемпотентен — пересобирает только новые/изменённые файлы. Затем обновить `logoMap` (генерируется в составе rating-обновления) и закоммитить.

---

## Архитектура фронтенда

```
design/
├── index.html              # preload: hero WebP, Inter cyrillic, 3 первых JSON
├── package.json            # 3 prod-зависимости (react, react-dom, lucide-react)
├── vite.config.ts          # + vitest config
├── vercel.json             # SPA-rewrite для прямых ссылок
├── public/
│   ├── data/               # 📦 статические JSON, обновляются update_data.py
│   │   ├── rating.json
│   │   ├── company-details.json
│   │   ├── logo-map.json
│   │   ├── articles.json
│   │   └── investment-*.json   (bonds, loans, corporates, all)
│   ├── logos/              # 440 WebP логотипов (~2 MB)
│   ├── images/             # hero, article covers (WebP)
│   ├── fonts/              # 3 woff2: Inter cyrillic/latin + Space Grotesk latin
│   ├── logo-rvdp.webp
│   └── logo-navigator.webp
└── src/
    ├── main.tsx                                # preload первых JSON параллельно с React-рендером
    ├── app/
    │   ├── App.tsx                             # 29 строк — роутинг-диспетчер
    │   ├── routing.ts                          # useRouter() + History API
    │   ├── shared/hooks/useIsMobile.ts
    │   ├── pages/
    │   │   ├── PageLayout.tsx
    │   │   ├── RatingPage.tsx
    │   │   ├── ratingFilters.ts                # чистая логика фильтрации (тестируется)
    │   │   ├── CompanyPage.tsx                 # ждёт ratingData + companyDetails
    │   │   ├── ArticlePage.tsx                 # lazy chunk
    │   │   └── ThematicPage.tsx
    │   ├── components/
    │   │   ├── companyCard/                    # HeaderSection, FinancialsSection,
    │   │   │                                   #   CapitalStructureSection, DynamicsSection,
    │   │   │                                   #   FundraisingSidebar + helpers + CSS-модуль
    │   │   ├── ratingTable/                    # DesktopTable, MobileTable, Pager, cells
    │   │   ├── filterBar/                      # FilterBar, FilterDropdown, FilterSections,
    │   │   │                                   #   ActiveChips, primitives, types
    │   │   ├── investmentTable/                # InvestmentTable, BondsTable, SimpleTables,
    │   │   │                                   #   badges, common, helpers
    │   │   ├── ArticleCard.tsx
    │   │   ├── ArticleContent.tsx              # lazy chunk
    │   │   ├── CompanyAvatar.tsx               # общий аватар (logo|letter)
    │   │   ├── CompareModal.tsx                # lazy chunk
    │   │   ├── CompareFloatingBar.tsx
    │   │   ├── compareMetrics.ts               # метрики сравнения (тестируется)
    │   │   ├── Footer.tsx, HeroScreen.tsx,
    │   │   ├── Sidebar.tsx, SiteHeader.tsx
    │   ├── data/                               # 📐 ТОЛЬКО ТИПЫ (значения в /public/data)
    │   │   ├── ratingData.ts                   # interface RatingCompany
    │   │   ├── companyDetails.ts               # interface CompanyDetails
    │   │   ├── articlesData.ts                 # interface Article
    │   │   ├── investmentData.ts               # Bond, SiteLoan, Corporate, AllInvestment
    │   │   ├── logoMap.ts                      # type LogoMap
    │   │   ├── loader.ts                       # fetch + memo-cache (peek/load)
    │   │   └── useAsyncData.ts                 # React-хук поверх loader
    │   └── utils/formatCompanyName.ts
    ├── scripts/
    │   ├── build-data-json.mjs                 # bootstrap скрипт (one-shot)
    │   └── convert-images-to-webp.sh           # batch конверсия логотипов
    └── styles/
        ├── index.css                           # @import fonts + tokens
        ├── tokens.css                          # CSS-переменные (цвета, шрифты, размеры)
        └── fonts.css                           # 3 @font-face (Inter cyr + latin, SG latin)
```

### Технические принципы

- **Данные отвязаны от приложения**. `src/app/data/*.ts` содержит только типы. Сами значения — статические JSON-файлы в `public/data/`, которые загружаются на runtime. Update пайплайна пишет JSON, фронт пересобирать не надо.
- **Стилизация**: CSS Modules + общие CSS-переменные в `styles/tokens.css`. Никакого Tailwind/PostCSS/CSS-in-JS.
- **Логика отделена от UI**: чистая бизнес-логика (`applyFilters`, `createInvestmentResolver`, `routeFromLocation`, `fmtMoney`, метрики сравнения) живёт в отдельных `.ts`-модулях и покрыта unit-тестами.
- **Code splitting**: страницы и тяжёлые компоненты (CompanyCard, ArticleContent, CompareModal) подгружаются через `React.lazy`. companyDetails.json (584 KB) тянется только при открытии карточки.
- **Роутинг**: History API напрямую, без `react-router`. URL-схема: `/`, `/?company=INN`, `/thematic`, `/article/ID`.
- **Размер файлов**: все продакшен-компоненты ≤300 строк; крупные разбиты на подпапки.
- **Тестирование**: Vitest + jsdom; 95 тестов покрывают роутинг, форматтеры, фильтры рейтинга, метрики сравнения, резолверы.

### Размеры артефактов после `pnpm build`

| Файл | gzip |
|---|---|
| `index-*.js` (главный) | ~66 KB |
| `CompanyCard-*.js` (lazy) | ~7 KB |
| `CompareModal-*.js` (lazy) | ~2 KB |
| `ArticleContent-*.js` (lazy) | ~1 KB |
| CSS суммарно | ~10 KB |
| **Всего JS+CSS на первый экран** | **~76 KB gzip** |

Параллельно браузер тянет 3 JSON: `rating` (40 KB gzip), `logo-map` (5 KB), `articles` (3 KB). `company-details.json` (124 KB gzip) грузится только при открытии карточки.

Для сравнения, до оптимизации главный бандл был **239 KB gzip** с monolithic JS.

---

## Деплой

Проект собирается на Vercel из ветки `main`:

- Build command: `pnpm build` (рабочая директория `design`)
- Output: `design/dist`
- `vercel.json` уже настроен на SPA-rewrite, чтобы прямые ссылки `/thematic`, `/article/:id`, `/?company=:inn` работали без 404.
- `public/data/*.json` копируются в `dist/data/` как есть, отдаются Vercel CDN с long-cache headers.

---

## Дополнительная документация

- [docs/TECH_RECOMMENDATIONS.md](docs/TECH_RECOMMENDATIONS.md) — что ещё можно улучшить (TS strict, ESLint+CI и т.д.).
- [docs/ТЗ_ПЛАТФОРМА_ПКО.md](docs/ТЗ_ПЛАТФОРМА_ПКО.md) — техническое задание.
- [CLAUDE.md](CLAUDE.md) — правила работы с данными и git-флоу.
