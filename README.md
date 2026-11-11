# Bachat Basket

> AI-assisted grocery basket optimizer · CUI Tech Fest FA'26

## What it does

Bachat Basket turns a natural-language grocery list into a valid, budget-aware basket. It uses a validated Al-Fatah catalogue snapshot, whole-package quantities, brand exclusions, delivery fees, and store minimums to calculate a deterministic recommendation.

## Problem and user

Budget-conscious grocery shoppers in Pakistan often compare isolated prices while missing package sizes, delivery charges, or minimum-order rules. Bachat Basket gives them a complete basket recommendation rather than a misleading cheapest-item list.

## Live deployment

- **Frontend:** https://se-max-glitch-switch.vercel.app/
- **Backend API:** https://se-max-glitch-switch.onrender.com
- **Platform:** Vercel-hosted React/Vite frontend with a Render-hosted Node/Express API.

## Judge quick start (under 5 minutes)

1. Open the live frontend at https://se-max-glitch-switch.vercel.app/.
2. Keep the example list, set a budget, and select **Optimize my basket**.
3. Confirm the optimized products, images, links, store logos, and Catalogue view load.

To run locally instead, install Node.js 20 or newer and start both services:

1. From the repository root, install dependencies and start the backend:
   ```powershell
   cd backend
   npm install
   npm run dev
   ```
2. In a second terminal:
   ```powershell
   cd frontend/my-react-app
   npm install
   npm run dev
   ```
3. Open http://localhost:5173.

The API health check is available at http://localhost:3001/api/health.

## Test accounts

No account or authentication is required.

## Run locally

### Prerequisites

- Node.js 20 or newer
- npm
- A browser with JavaScript enabled

### Setup

```powershell
cd backend
npm install
cd ..\frontend\my-react-app
npm install
```

### Environment variables

Optional:

- `PORT` — backend port; defaults to `3001`.
- `VITE_API_BASE_URL` — frontend API base URL; production is `https://se-max-glitch-switch.onrender.com`; local default is `http://localhost:3001`.
- `ALFATAH_CATALOGUE_URL` — comma-separated public Al-Fatah feed URLs used by the crawler.

### Run

Start the backend:

```powershell
cd backend
npm run dev
```

Start the frontend in a second terminal:

```powershell
cd frontend/my-react-app
npm run dev
```

To refresh the cached catalogue explicitly:

```powershell
cd backend
$env:ALFATAH_CATALOGUE_URL="https://example.invalid/products.json"
npm run crawl
```

Only use a real, publicly accessible feed URL when running the crawler. A failed crawl does not replace the cached snapshot.

### Run tests

Run the complete automated suite from the repository root:

```powershell
npm run test:all
```

This runs the backend tests and type-check, frontend lint, and frontend production build. The individual commands are:

```powershell
cd backend
npm test
npm run typecheck
cd ..\frontend\my-react-app
npm run lint
npm run build
```

## Known limitations

- The current supported live source is Al-Fatah; Metro is shown as an alternative comparison reference, not a crawled source.
- Prices, availability, delivery fees, and minimum orders are snapshot data and can become stale.
- Checkout, ordering, payment, authentication, and inventory reservation are not implemented.
- Delivery rules can vary by city or order context.
- The crawler depends on public structured data and does not bypass login, CAPTCHA, rate limits, or access controls.

## Documentation

- [Product overview, architecture, and capacity estimate](docs/product-overview.md)
- [Requirements](docs/requirements.md)
- [Design](docs/design.md)
- [Testing](docs/testing.md)
- [AI usage log](docs/ai-usage-log.md)
- [Judge checks](docs/judge-checks.md)
- [Submission checklist](SUBMISSION.md)

## Team

| Name | Role |
|------|------|
| Huzaifa Khan | Web crawler, server |
| Muhamamd Uzair | Frontend, GitHub |
| Shayan Abdullah | Documentation, unit tests |
