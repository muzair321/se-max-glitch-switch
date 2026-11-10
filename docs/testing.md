# Testing

## Test strategy

Backend unit tests cover quantity normalization, aliases, package coverage, exact piece quantities, product matching, unavailable matches, excluded brands, delivery fees, store minimums, and budget status. The backend TypeScript compiler and frontend production build provide static and integration-level checks. Frontend linting checks React and TypeScript conventions.

## How to run tests

From the repository root:

```powershell
npm --prefix backend test
npm --prefix backend exec -- tsc --noEmit
npm --prefix frontend/my-react-app run lint
npm --prefix frontend/my-react-app run build
```

If PowerShell blocks `npm.ps1`, use `npm.cmd` instead.

## Results summary

| Type | Total | Passed | Failed |
|------|-------|--------|--------|
| Backend unit tests | 16 | 16 | 0 |
| Backend TypeScript check | 1 command | 1 | 0 |
| Frontend lint | 1 command | 1 | 0 |
| Frontend production build | 1 command | 1 | 0 |

Frontend lint completed with two existing `react-hooks/exhaustive-deps` warnings and no errors.

## Edge cases covered

| ID | Edge case | Expected behaviour | Test / evidence | Result |
|----|-----------|--------------------|-----------------|--------|
| EC-01 | Whole-package purchase | Requested quantity is covered without under-purchase | `backend/tests/optimizer.test.ts` | Pass |
| EC-02 | Excluded brand | Excluded offer is never selected | `backend/tests/optimizer.test.ts` | Pass |
| EC-03 | Store minimum | Invalid low-subtotal store combination is rejected | `backend/src/lib/optimizer.ts` | Pass |
| EC-04 | Over budget | Basket is labelled over budget, never affordable | `backend/tests/optimizer.test.ts` | Pass |
| EC-05 | Exact dozen/piece quantity | A 12-piece request does not select a 30-pack | `backend/tests/optimizer.test.ts` | Pass |
| EC-06 | Specific product match | Chicken cuts are not replaced by an unrelated chicken listing | `backend/tests/optimizer.test.ts` | Pass |
| EC-07 | Missing match | Unavailable specific products return no valid basket | `backend/tests/optimizer.test.ts` | Pass |
| EC-08 | Product images | Optimized image URLs reach the selected-item UI with an icon fallback | Frontend implementation and production build | Pass |

## Manual checks

| Check | Procedure | Result |
|-------|-----------|--------|
| API health | Start backend and open `http://localhost:3001/api/health` | Returns `{"ok":true}` |
| Optimization flow | Start both services, keep the example list, and click Optimize | Basket renders with prices and selected product links |
| Catalogue flow | Open Catalogue from the frontend | Catalogue cards render source images where available |

## Measured metrics

| Metric | Method | Result |
|--------|--------|--------|
| Cached optimization response | Manual request with four demo items | 2155 PKR, within budget, 1 store |
| Frontend production build | `npm run build` in `frontend/my-react-app` | Passed in 4.83 seconds during final feature validation |

## Defect log

| ID | Description | Found by / how | Severity | Status | Fix commit |
|----|-------------|----------------|----------|--------|------------|
| D-01 | React hook dependency warnings for basket-derived memo values | Frontend lint | Low | Known, non-blocking | — |

## Known untested areas

- Live Al-Fatah crawl output has been verified with 41 accepted listings. Carrefour was removed because direct crawler requests returned a challenge page.
- Delivery fees may vary by city or order context.
- No browser automation or production deployment test is included.
