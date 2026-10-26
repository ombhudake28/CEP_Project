# Cyber Suraksha: client

React 18 + Vite single-page app. Talks to the Express API under `/api` (port 5000). Dev server runs on port 5173.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on http://localhost:5173 (needs `/api` proxied to port 5000 in `vite.config.js`) |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run i18n:merge` | Adds the page translation keys to `src/locales/*/translation.json` (see below) |

Add this line to `package.json` scripts: `"i18n:merge": "node scripts/merge-locales.mjs"`.

## Routes

| Path | Page |
| --- | --- |
| `/` | Home (landing page) |
| `/scams` | `ScamList`: search, filter by severity |
| `/scams/:slug` | `ScamDetail`: full scam guide, lightbox, share, print checklist |
| `/helpline` | `Helpline`: 1930, portal, state contacts, first-hour checklist |
| `/quiz` | `Quiz` |
| `/report` | `Report` |
| `/about` | `About` |
| `*` | `NotFound` |

Every page is a default export, so `<Route element={<Quiz />} />` after `import Quiz from './pages/Quiz.jsx'` is all the router needs.

## Data fetching

`src/hooks/useApi.js` wraps axios (`baseURL: '/api'`). It appends `?lang=` from the active i18next language and re-fetches whenever the language changes, so no page reload is needed. Errors are normalised to `{ message, code, details, status }`; `code` is `NETWORK_ERROR` when the backend is unreachable.

## Translations

Language is stored in `localStorage` under `lang`. Page strings live in `src/locales/<lang>/translation.json`.

First setup: run `npm run i18n:merge`. It deep-merges `scripts/locale-additions/{en,hi,mr}.json` into the translation files. It only adds missing keys and never overwrites existing ones, so it is safe to re-run.

### Add a new language

1. Create `src/locales/<code>/translation.json` (copy `en` and translate every value).
2. Register it in the i18n setup (`src/i18n.js`): import the file and add it to `resources`.
3. Add the code to `SUPPORTED_LANGS` in `src/hooks/useApi.js` and to the language switcher in `Header`.
4. Make sure the server accepts `?lang=<code>` and returns localized scam, quiz and helpline content.
5. Add the code to `scripts/merge-locales.mjs` and create `scripts/locale-additions/<code>.json` if you want the merge script to cover it.

## Add a new scam

The frontend contains no scam content. It is all served by the API.

1. Pick a slug, lowercase with hyphens, for example `sim-swap`.
2. Add three images in `public/images/scams/` named exactly:
   - `<slug>-hero.svg`
   - `<slug>-example.svg`
   - `<slug>-redflags.svg`
3. Add the scam to the server data in all three languages. `GET /api/scams` must return:
   `[{ slug, title, summary, image, severity }]`
4. `GET /api/scams/:slug` must return:

```json
{
  "slug": "sim-swap",
  "title": "...",
  "summary": "...",
  "severity": "high",
  "images": [{ "src": "/images/scams/sim-swap-hero.svg", "alt": "...", "caption": "..." }],
  "whatIsIt": "...",
  "howItWorks": ["step", "step"],
  "redFlags": ["flag"],
  "howToStaySafe": ["tip"],
  "ifScammed": ["step"],
  "example": { "channel": "sms", "sender": "...", "text": "..." }
}
```

`severity` is shown as a badge. `low`, `medium`, `high` and `critical` are translated (`ui.severity.*`); other values are shown as-is. `example.channel` is `sms`, `email` or `call` and picks the mock-up style. Unknown slugs must return 404 with `{ "error": { "code": "NOT_FOUND" } }`.

## Accessibility and polish notes

- Animations are disabled under `prefers-reduced-motion`.
- Lightbox: Esc closes, left/right arrows navigate, focus is trapped and restored.
- Quiz: number keys pick an answer; focus moves to "Next" after answering.
- "If you were scammed" and the first-hour checklist print on their own (`cs-print-area`).
- Styles for these pages are in `src/styles/pages.css` (classes prefixed `cs-`; colour tokens at the top).
