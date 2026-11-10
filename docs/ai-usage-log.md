# AI Usage Log

AI tools were used throughout development for implementation, debugging, testing support, design review, and documentation. Human team members supplied the product requirements, reviewed the generated changes, ran the commands, and accepted or corrected the results.

## Tools used

| Tool | Used for |
|------|----------|
| GitHub Copilot / Copilot SDK in VS Code | Code generation, refactoring, debugging, test drafting, documentation, and review |
| TypeScript compiler, Vitest, ESLint, and Vite | Verification of AI-assisted changes |

## Log

| Time | Member | Tool | What it was asked | What was accepted / changed / rejected | How it was verified |
|------|--------|------|-------------------|----------------------------------------|---------------------|
| Sprint development | Huzaifa Khan | Copilot | Draft the public catalogue crawler and Express server | Accepted with explicit error handling, cached snapshot protection, and Zod validation | Backend TypeScript check, API health check, and manual review |
| Sprint development | Huzaifa Khan | Copilot | Implement catalogue loading and normalized listing types | Accepted the typed `Listing` model and local JSON snapshot flow | Backend tests and TypeScript check |
| Sprint development | Muhamamd Uzair | Copilot | Build the React optimizer interface and catalogue view | Accepted and refined the input, basket, catalogue, theme, and store-summary UI | Frontend lint and production build |
| Sprint development | Muhamamd Uzair | Copilot | Add product links, product images, and Al-Fatah/Metro Mart logos | Accepted local SVG logo assets and image fallbacks | Frontend production build and manual browser checks |
| Sprint development | Shayan Abdullah | Copilot | Draft unit tests for quantity parsing and optimization invariants | Accepted tests for aliases, package coverage, exclusions, matching, budget, and invalid baskets | Vitest: 16 tests passed |
| Final documentation pass | Shayan Abdullah | Copilot | Complete README, requirements, design, testing, submission, and judge-check documentation | Accepted factual descriptions, recorded limitations, and left deployment/submission fields explicit where unknown | Cross-checked against source files and verification commands |

## Reflection

### Where AI helped most

AI accelerated repetitive TypeScript and React implementation, generated test cases for edge conditions, connected the crawler data shape to the frontend, and helped maintain consistent documentation across the API, UI, and testing workflow.

### Where AI was wrong or misleading

Generated code initially omitted optimized `imageUrl` values when mapping API results into frontend basket state. The issue was found during review and corrected. AI-generated documentation can also overstate deployment or test coverage, so the team kept the deployment status and untested areas explicit.

### What we did not delegate to AI

The team retained responsibility for product scope, source-data policy, acceptance of generated code, final test execution, repository history, and submission decisions. No credentials, payment data, or private user data were supplied to AI tools.
