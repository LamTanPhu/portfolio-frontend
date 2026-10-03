import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './src/test/msw/server'

// Any request a test didn't explicitly handle fails loudly instead of silently
// hitting the network (or localhost:3001).
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
    cleanup() // Vitest has no globals here, so Testing Library can't auto-register this
    server.resetHandlers()
})

afterAll(() => server.close())

// jsdom gaps that the app's components touch.
if (typeof window !== 'undefined') {
    window.matchMedia ??= ((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
    })) as typeof window.matchMedia

    Element.prototype.scrollIntoView ??= () => {}
}
