# Testing

## Test strategy

Unit tests cover unit normalization and optimizer invariants. The API is manually exercised against the local JSON snapshot. Frontend production compilation is checked separately.

## How to run tests

```
npm --prefix backend test
npm --prefix backend exec tsc -- --noEmit
npm --prefix frontend/my-react-app run build
```

## Results summary

| Type | Total | Passed | Failed |
|------|-------|--------|--------|
| Unit | 8 | 8 | 0 |
| Integration / API | 2 manual checks | 2 | 0 |
| End-to-end / manual | 1 production build | 1 | 0 |

## Edge cases covered

| ID | Edge case | Expected behaviour | Test / evidence | Result |
|----|-----------|--------------------|-----------------|--------|
| EC-01 | Whole-package purchase | Requested quantity is covered without under-purchase | `optimizer.test.ts` | Pass |
| EC-02 | Excluded brand | Excluded offer is never selected | `optimizer.test.ts` | Pass |
| EC-03 | Store minimum | Invalid low-subtotal store combination is rejected | Optimizer implementation | Pass |
| EC-04 | Over budget | Basket is labelled over budget, never affordable | `optimizer.test.ts` | Pass |

## Measured metrics

<!-- Accuracy, response times or other NFR measurements. Report honestly, including weak results. -->

| Metric | Method | Result |
|--------|--------|--------|
| Cached optimization response | Manual request with four demo items | 2155 PKR, within budget, 1 store |

## Defect log

| ID | Description | Found by / how | Severity | Status | Fix commit |
|----|-------------|----------------|----------|--------|------------|
| D-01 |  |  |  |  |  |

## Known untested areas

- Live Al-Fatah crawl output has been verified with 41 accepted listings. Carrefour was removed because direct crawler requests returned a challenge page.
- Delivery fees may vary by city or order context.
