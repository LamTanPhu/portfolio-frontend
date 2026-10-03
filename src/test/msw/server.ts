import { setupServer } from 'msw/node'

// No default handlers on purpose: each test declares exactly the endpoints it
// expects via server.use(...), and anything else errors (see vitest.setup.ts).
export const server = setupServer()
