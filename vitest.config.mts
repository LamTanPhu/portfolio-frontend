import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Unit + component tests (Vitest, jsdom). End-to-end tests live in e2e/ and run
// under Playwright instead — see playwright.config.ts.
export default defineConfig({
    plugins: [react()],
    resolve: {
        // Mirrors tsconfig's "@/*" → "./*" path alias.
        alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
    },
    test: {
        // Default is node (fast). Tests that render React add `// @vitest-environment jsdom` at the top.
        environment: 'node',
        setupFiles: ['./vitest.setup.ts'],
        include: ['{app,lib,src}/**/*.test.{ts,tsx}'],
        // Node 26 ships an experimental built-in localStorage that prints a warning
        // whenever jsdom's globals are copied in. jsdom provides its own, so turn Node's off.
        execArgv: ['--no-experimental-webstorage'],
        css: false,
        restoreMocks: true,
        unstubGlobals: true,
        // Pinned so tests don't depend on whatever the shell / CI happens to set.
        // Set before any module is imported, so lib/constants.ts picks these up.
        env: {
            NEXT_PUBLIC_API_URL: 'http://localhost:3001/api',
            NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
            NEXT_PUBLIC_RESUME_URL: '/resume.pdf',
            NEXT_PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
            NEXT_PUBLIC_AMBIENT_TRACK_1_URL: '/lofi-coffee-shop.mp3',
            NEXT_PUBLIC_AMBIENT_TRACK_2_URL: '/rain_on_window.mp3',
            NEXT_PUBLIC_AMBIENT_TRACK_3_URL: '/ambient-3.mp3',
        },
        coverage: {
            provider: 'v8',
            include: ['src/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}'],
            exclude: ['**/*.test.{ts,tsx}', 'src/test/**', 'src/**/dtos/**', 'src/domain/repositories/**'],
            reporter: ['text-summary', 'html', 'lcov'],
            // `npm run test:coverage` fails if any of these drops.
            thresholds: { statements: 90, branches: 90, functions: 90, lines: 90 },
        },
    },
})
