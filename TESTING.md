# Testing

| Command | What it runs | Needs |
|---|---|---|
| `npm test` | Unit + component tests (Vitest, jsdom, MSW) | nothing |
| `npm run test:watch` | Same, in watch mode | nothing |
| `npm run test:coverage` | Same, with a V8 coverage report in `coverage/` | nothing |
| `npm run test:e2e` | Builds against the mock API, then runs the Playwright journeys | `npx playwright install chromium` once |
| `npm run test:e2e:only` | Playwright only, reusing the existing `.next` build | a build made via `npm run build:mock` |
| `npm run lighthouse` | Builds against the mock API, then Lighthouse CI budgets (`@lhci/cli` is fetched on demand by `npx`, not installed in the project) | Chrome |

## What lives where

- `src/**/*.test.ts(x)` — next to the code they test.
  - Pure logic (mappers, value objects, `httpClient`, repositories) uses Vitest's default `node` environment.
  - Anything that renders React starts with `// @vitest-environment jsdom`.
  - Network is faked with **MSW** (`src/test/msw/server.ts`). Unhandled requests *fail the test* so nothing silently hits the network.
  - `src/test/fixtures.ts` has DTO factories: `blogSummaryDTO({ tags: ['x'] })`.
- `e2e/tests/*.spec.ts` — Playwright journeys (navigation, projects, blog, contact gate, admin, accessibility).
- `e2e/mock-api/server.mjs` — in-memory stand-in for the backend with fixed fixtures. Used by `next build` (pages prerender against the API) and by the e2e tests. It is deliberately *not* a copy of backend rules; those are tested in the backend repo.
- `lighthouserc.json` — performance/a11y/SEO budgets (warnings, not failures).

## Mock API vs. real backend

CI builds against the mock API until the `NEXT_PUBLIC_API_URL` Actions variable is set; then the real-API build step takes over. e2e and Lighthouse always use the mock, so they stay deterministic.

## Known gaps (on purpose)

- The contact **submit** journey isn't end-to-end: reaching the form requires beating the snake game (random food). Form logic is covered by the `ContactPage` component tests.
- Two accessibility tests are `test.fixme` until `FormField` associates its `<label>` with its input.
