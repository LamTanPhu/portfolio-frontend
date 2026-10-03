import { defineConfig, devices } from '@playwright/test'

// End-to-end tests run against the *production build* of the app talking to the
// mock API in e2e/mock-api (deterministic, no database needed).
//
//   npm run test:e2e        build against the mock API, then run the tests
//   E2E_SKIP_BUILD=1 ...    reuse an existing .next build
//
// Pages prerender at build time, so the build itself must run while the mock
// API is up — `npm run test:e2e` handles that via e2e/with-mock-api.mjs.
const PORT = Number(process.env.E2E_PORT ?? 3000)
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
    testDir: './e2e/tests',
    // The mock API holds state (admin tests create/delete skills), so keep
    // things sequential and predictable.
    workers: 1,
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    timeout: 30_000,
    expect: { timeout: 7_500 },
    reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
    use: {
        baseURL,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: [
        {
            command: 'node e2e/mock-api/server.mjs',
            url: 'http://localhost:3001/__health',
            reuseExistingServer: true,
            timeout: 15_000,
        },
        {
            command: `npx next start --port ${PORT}`,
            url: baseURL,
            reuseExistingServer: !process.env.CI,
            timeout: 60_000,
        },
    ],
})
