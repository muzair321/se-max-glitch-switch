# Bachat Basket

> AI-assisted grocery basket optimizer · CUI Tech Fest FA'26

## What it does

Bachat Basket turns a natural-language grocery list into a valid, budget-aware basket. It uses a validated Al-Fatah catalogue snapshot, whole-package quantities, brand exclusions, delivery fees, and store minimums to calculate a deterministic recommendation.

## Problem and user

Budget-conscious grocery shoppers in Pakistan often compare isolated prices while missing package sizes, delivery charges, or minimum-order rules. Bachat Basket gives them a complete basket recommendation rather than a misleading cheapest-item list.

## Live deployment

- **URL / install link:** No public deployment configured; run locally using the instructions below.
- **Platform:** Web application: React/Vite frontend with a Node/Express API.

## Judge quick start (under 5 minutes)

1. Install Node.js 20 or newer.
2. From the repository root, install dependencies and start both services:
   ```powershell
   cd backend
   npm install
   npm run dev
   ```
   In a second terminal:
   ```powershell
   cd frontend/my-react-app
   npm install
   npm run dev
   ```
3. Open http://localhost:5173, enter or keep the example list, set a budget, and select **Optimize my basket**. Product links open the source listing, and Catalogue shows the validated product images.

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
- `VITE_API_BASE_URL` — frontend API base URL; defaults to `http://localhost:3001`.
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

```powershell
cd backend
npm test
npm exec -- tsc --noEmit
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
