# Requirements

## Problem statement

Bachat Basket compares grocery offers from Al-Fatah, then calculates a valid basket using whole packages, brand exclusions, store delivery fees, and minimum order values.

## Users

Budget-conscious grocery shoppers in Pakistan who want a complete basket comparison rather than the cheapest isolated product.

## Functional requirements

| ID | Requirement | Priority (Must / Should / Stretch) | Status |
|----|-------------|------------------------------------|--------|
| FR-01 | Accept grocery requests with quantities in English, Urdu terms, or Roman Urdu aliases | Must | Implemented |
| FR-02 | Read normalized prices from the supported Al-Fatah feed | Must | Implemented |
| FR-03 | Store the last validated price snapshot in local JSON | Must | Implemented |
| FR-04 | Cover requested quantities with whole packages | Must | Implemented |
| FR-05 | Respect excluded brands, delivery fees, and store minimum orders | Must | Implemented |
| FR-06 | Report within-budget, over-budget, and no-valid-basket states | Must | Implemented |
| FR-07 | Refresh the snapshot using an explicit crawler command | Should | Partial: structured-data crawler scaffold |

## Non-functional requirements

<!-- Every NFR needs a measurable target and a way to measure it. -->

| ID | Category | Requirement | Target | How measured | Result |
|----|----------|-------------|--------|--------------|--------|
| NFR-01 | Performance | Optimize a cached basket locally | Under 3 seconds for the demonstration catalogue | Backend tests and manual API request | Pass |
| NFR-02 | Reliability | User requests must not depend on a live store response | Serve the last valid JSON snapshot | API reads `backend/data/catalogue.json` | Pass |

## Constraints

- Only Al-Fatah is currently supported because its public Shopify JSON feed returns product prices reliably.
- Prices are a snapshot and may become stale.
- Crawling must use publicly accessible data and must not bypass login, CAPTCHA, rate limits, or access controls.
- Delivery charges and minimum orders can vary by location and must be confirmed before being treated as authoritative.

## Assumptions

- Store pages expose usable public product data or structured product metadata.
- The configured crawl URLs are supplied locally through environment variables.

## Out of scope

- Checkout, ordering, payment, authentication, and live inventory reservation.
- Crawling stores other than Al-Fatah.
