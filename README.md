# MotaharNews

A React + Vite news application with dark mode, infinite scroll, image placeholders, a development proxy, and a tiny Express server for production. Supports dual NewsAPI keys with automatic failover to minimize downtime during rate limits.

## Features
- __React + Vite__: Fast HMR and modern tooling.
- __Dark Mode__: Theme toggle via context across the app.
- __Infinite Scroll__: Seamless pagination of articles.
- __Image Placeholder__: Graceful UI when articles lack images.
- __Dev Proxy__: Vite server proxies `/newsapi/*` to NewsAPI to avoid CORS and keep keys off the client.
- __Production Server__: Tiny Express server proxies `/api/*` to NewsAPI and serves the built app.
- __Dual API Keys__: Automatically switch to a backup key on 401/429.

## Tech Stack
- React 19, React Router, Infinite Scroll
- Vite 7
- Express 4 (production proxy)

## Getting Started

### 1) Prerequisites
- Node.js 18+ and npm
- NewsAPI.org API key(s)

### 2) Clone and install
```bash
npm install
```

### 3) Environment variables
Create a `.env` file in the project root. You can provide one or two keys.

Development (Vite):
```bash
# primary key (required for dev)
VITE_NEWS_API_KEY_1=YOUR_KEY_1
# optional fallback key
VITE_NEWS_API_KEY_2=YOUR_KEY_2
```

Production (Express server):
```bash
# Use the same VITE keys for production
VITE_NEWS_API_KEY_1=YOUR_KEY_1
VITE_NEWS_API_KEY_2=YOUR_KEY_2
```

> Tip: Do not commit `.env`. Add it to `.gitignore`.

### 4) Run in development
```bash
npm run dev
```
- Frontend runs on Vite with a dev proxy configured in `vite.config.js`:
  - Browser fetches call `/newsapi/...`
  - Vite forwards to `https://newsapi.org/...` and injects the API key via `X-Api-Key`

### 5) Build and run in production locally
```bash
# ensure NEWS_API_KEY_1 (and optionally _2) are set in your shell or a .env loaded by your process manager
npm run start
```
- Builds to `dist/`, then starts the Express server from `server/index.js`.
- Browser fetches call `/api/...` which the server forwards to NewsAPI with your API key.

## How API key failover works
- __Development__ (`vite.config.js`):
  - Reads `VITE_NEWS_API_KEY_1` and `VITE_NEWS_API_KEY_2`.
  - Client sends `X-Use-Key: 1|2`; Vite injects the selected key.
- __Production__ (`server/index.js`):
  - Reads `VITE_NEWS_API_KEY_1` and `VITE_NEWS_API_KEY_2`.
  - If a request returns 401/429, the server retries once with the alternate key.
- __Client__ (`src/Components/News.jsx`):
  - Uses `fetchWithFailover()` to retry with the other key on 401/429 and remembers the working slot for subsequent requests.

## Scripts
```json
{
  "dev": "vite",
  "build": "vite build",
  "serve": "node server/index.js",
  "start": "npm run build && node server/index.js",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

## Project structure
```bash
.
├─ src/
│  ├─ Components/
│  │  ├─ News.jsx             # Fetches articles, infinite scroll, key failover
│  │  ├─ NewsItem.jsx         # Renders individual article with placeholder image
│  │  └─ NavBar.jsx           # Navigation and theme toggle
│  ├─ App.jsx                 # Routes, props like pageSize
│  ├─ ThemeContext.jsx        # Dark mode context
│  └─ ...
├─ server/
│  └─ index.js                # Express prod server + /api proxy
├─ vite.config.js             # Vite dev proxy + key selection
├─ package.json
└─ README.md
```

## Configuration notes
- __CORS__: Avoided via dev proxy (`/newsapi`) and prod server (`/api`).
- __Rate limiting__: NewsAPI free tier can return 429. This app:
  - Uses smaller `pageSize` by default.
  - Falls back to a secondary key on 401/429.
  - Logs responses to the console for debugging.

## Deployment
- Static hosting (e.g., GitHub Pages) serves only the `dist/` frontend. It cannot proxy to NewsAPI by itself.
  - If you deploy static-only, your browser requests must go directly to NewsAPI and will expose your key and hit CORS limits.
- Recommended: deploy the Express server as well on a platform like Render, Railway, Fly.io, or a VPS.
  - Set `NEWS_API_KEY_1` (and optionally `_2`) as environment variables on the platform.
  - Serve `dist/` and proxy `/api/*` as in `server/index.js`.
- Alternatively, create a serverless function (Netlify/Vercel) that forwards `/api/*` to NewsAPI.

## Troubleshooting
- __429 Too Many Requests__:
  - Reduce `pageSize` in `src/App.jsx`.
  - Wait a minute for rate limit to reset.
  - Ensure the second key is configured.
- __401 Unauthorized__:
  - Check that your API key(s) are correct and not expired.
  - Confirm the correct env var names are set for the current environment.
- __CORS errors in dev__:
  - Make sure calls go to `/newsapi/...`, not `https://newsapi.org/...`.
  - Restart `npm run dev` after changing `.env`.
- __Blank page after build__:
  - Ensure the Express server is running and serving `dist/`.
  - Open the browser console for network errors.

## License
MIT
