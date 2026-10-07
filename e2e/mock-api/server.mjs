// Tiny in-memory stand-in for the backend, used by `next build` and Playwright.
//
// Why it exists: pages prerender against the API at build time, and e2e tests
// need predictable data. This serves fixed fixtures for every public endpoint,
// plus just enough auth + skills CRUD + contact/captcha for the admin and
// contact journeys. It is NOT a copy of the backend's rules — contract-level
// behaviour (validation limits, throttling, ...) is covered by the backend's
// own test suite.
//
// Run standalone:  node e2e/mock-api/server.mjs   (PORT defaults to 3001)
import http from 'node:http'

const PORT = Number(process.env.MOCK_API_PORT ?? 3001)
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'e2e-password'
const ACCESS_TOKEN = 'e2e-access-token'
const REFRESH_COOKIE = 'refresh_token=e2e-refresh'

const iso = (d) => new Date(d).toISOString()

const baseFixtures = () => ({
    skills: [
        { id: 1, name: 'TypeScript', imageUrl: null, category: 'frontend' },
        { id: 2, name: 'NestJS', imageUrl: null, category: 'backend' },
        { id: 3, name: 'PostgreSQL', imageUrl: null, category: 'database' },
    ],
    jobs: [
        { id: 1, companyName: 'Acme Corp', role: 'Software Engineer', startedAt: iso('2023-07-01'), endedAt: null, isEnded: false },
    ],
    education: [
        { id: 1, degreeName: 'BSc Computer Science', instituteName: 'Example University', instituteUrl: null, startedAt: iso('2019-09-01'), endedAt: iso('2023-06-30'), isCompleted: true },
    ],
    certifications: [
        { id: 1, name: 'AWS Certified Developer', url: 'https://example.com/cert', startDate: iso('2024-05-01'), endDate: null },
    ],
    social: [
        { id: 1, name: 'GitHub', url: 'https://github.com/example', imageUrl: null, isPublic: true },
        { id: 2, name: 'Email', url: 'mailto:hello@example.dev', imageUrl: null, isPublic: true },
    ],
    projects: [
        { id: 1, name: 'Portfolio Site', slug: 'portfolio-site', description: 'The site you are looking at.', techStack: ['Next.js', 'NestJS'], repoUrl: 'https://github.com/example/portfolio', liveUrl: null, thumbnailUrl: null, isPublished: true, isOpenSource: true, createdAt: iso('2025-01-10T12:00:00Z'), updatedAt: iso('2025-01-12T12:00:00Z') },
        { id: 2, name: 'Snake Game', slug: 'snake-game', description: 'A tiny canvas snake game.', techStack: ['TypeScript'], repoUrl: null, liveUrl: 'https://example.dev/snake', thumbnailUrl: null, isPublished: true, isOpenSource: false, createdAt: iso('2025-02-01T12:00:00Z'), updatedAt: iso('2025-02-02T12:00:00Z') },
    ],
    blogs: [
        { id: 1, title: 'React Hooks Deep Dive', slug: 'react-hooks-deep-dive', content: 'Hooks let you use state in function components.', excerpt: 'All about hooks.', tags: ['react', 'frontend'], isPublished: true, publishedAt: iso('2025-03-01T12:00:00Z'), createdAt: iso('2025-02-28T12:00:00Z') },
        { id: 2, title: 'NestJS Guards Explained', slug: 'nestjs-guards-explained', content: 'Guards decide whether a request may proceed.', excerpt: 'Protecting routes.', tags: ['nestjs', 'backend'], isPublished: true, publishedAt: iso('2025-03-05T12:00:00Z'), createdAt: iso('2025-03-04T12:00:00Z') },
        { id: 3, title: 'Testing Next.js Apps', slug: 'testing-nextjs-apps', content: 'Test the behaviour users see.', excerpt: 'Tests that matter.', tags: ['react', 'testing'], isPublished: true, publishedAt: iso('2025-03-10T12:00:00Z'), createdAt: iso('2025-03-09T12:00:00Z') },
    ],
    profile: { id: 1, firstname: 'Phu', lastname: 'Lam', email: 'phu@example.dev', aboutme: 'Software engineer.', lastLogin: null },
})

let db = baseFixtures()
let contacts = []
let nextSkillId = 100

// List endpoints return summaries: no post body, no project description.
const summary = (item) => {
    const copy = { ...item }
    delete copy.content
    delete copy.description
    return copy
}

function send(res, status, body, headers = {}) {
    if (body === undefined) {
        res.writeHead(status, headers)
        return res.end()
    }
    res.writeHead(status, { 'Content-Type': 'application/json', ...headers })
    res.end(JSON.stringify(body))
}

async function readJson(req) {
    const chunks = []
    for await (const c of req) chunks.push(c)
    const raw = Buffer.concat(chunks).toString()
    try { return raw ? JSON.parse(raw) : {} } catch { return {} }
}

const isAuthed = (req) => req.headers.authorization === `Bearer ${ACCESS_TOKEN}`

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
    const { pathname } = url
    const method = req.method ?? 'GET'

    // CORS — the browser calls this from http://localhost:3000 with credentials.
    const origin = req.headers.origin
    const cors = origin
        ? {
              'Access-Control-Allow-Origin': origin,
              'Access-Control-Allow-Credentials': 'true',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
              Vary: 'Origin',
          }
        : {}
    const reply = (status, body, headers = {}) => send(res, status, body, { ...cors, ...headers })

    if (method === 'OPTIONS') return reply(204)

    // ── test-only endpoints ─────────────────────────────────────────────
    if (pathname === '/__health') return reply(200, { ok: true })
    if (pathname === '/__test/reset' && method === 'POST') {
        db = baseFixtures()
        contacts = []
        nextSkillId = 100
        return reply(204)
    }
    if (pathname === '/__test/contacts') return reply(200, contacts)

    if (!pathname.startsWith('/api/')) return reply(404, { message: 'Not found' })
    const path = pathname.slice('/api'.length)
    const body = method === 'POST' || method === 'PATCH' ? await readJson(req) : {}

    // ── public reads ────────────────────────────────────────────────────
    if (method === 'GET') {
        if (path === '/skills' || path === '/about/skills') return reply(200, db.skills)
        if (path === '/about/jobs' || path === '/jobs') return reply(200, db.jobs)
        if (path === '/about/education' || path === '/education') return reply(200, db.education)
        if (path === '/about/certifications' || path === '/certifications') return reply(200, db.certifications)
        if (path === '/social' || path === '/about/social') return reply(200, db.social)
        if (path === '/user/profile') return reply(200, db.profile)
        if (path === '/projects') return reply(200, db.projects.filter((p) => p.isPublished).map(summary))
        if (path.startsWith('/projects/')) {
            const found = db.projects.find((p) => p.slug === decodeURIComponent(path.slice('/projects/'.length)))
            return found ? reply(200, found) : reply(404, { message: 'Project not found' })
        }
        if (path === '/blogs/search') {
            const q = (url.searchParams.get('q') ?? '').toLowerCase()
            if (!q) return reply(400, { message: 'q must not be empty' })
            const hits = db.blogs.filter((b) => [b.title, b.excerpt, ...b.tags].join(' ').toLowerCase().includes(q))
            return reply(200, hits.map(summary))
        }
        if (path === '/blogs/admin') return isAuthed(req) ? reply(200, db.blogs.map(summary)) : reply(401, { message: 'Unauthorized' })
        if (path === '/blogs') return reply(200, db.blogs.filter((b) => b.isPublished).map(summary))
        if (path.startsWith('/blogs/')) {
            const found = db.blogs.find((b) => b.slug === decodeURIComponent(path.slice('/blogs/'.length)))
            return found ? reply(200, found) : reply(404, { message: 'Post not found' })
        }
        if (path === '/spotify/now-playing') return reply(200, { isPlaying: false, title: '', artist: '', albumArt: '', songUrl: '' })
        if (path === '/analytics/page-views') return isAuthed(req) ? reply(200, []) : reply(401, { message: 'Unauthorized' })
        return reply(404, { message: `No mock for GET ${path}` })
    }

    // ── auth ────────────────────────────────────────────────────────────
    if (path === '/auth/login' && method === 'POST') {
        if (body.password !== ADMIN_PASSWORD) return reply(401, { message: 'Invalid credentials' })
        return reply(200, { accessToken: ACCESS_TOKEN }, { 'Set-Cookie': `${REFRESH_COOKIE}; HttpOnly; Path=/; SameSite=Lax` })
    }
    if (path === '/auth/refresh' && method === 'POST') {
        const hasCookie = (req.headers.cookie ?? '').includes(REFRESH_COOKIE)
        return hasCookie ? reply(200, { accessToken: ACCESS_TOKEN }) : reply(401, { message: 'No refresh cookie' })
    }
    if (path === '/auth/logout' && method === 'POST') {
        return reply(204, undefined, { 'Set-Cookie': 'refresh_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax' })
    }

    // ── captcha + contact ───────────────────────────────────────────────
    if (path === '/captcha/snake/challenge' && method === 'POST') return reply(201, { challengeId: 'e2e-challenge' })
    if (path === '/captcha/snake/verify' && method === 'POST') return reply(201, { proofToken: 'e2e-proof' })
    if (path === '/contact' && method === 'POST') {
        const required = ['name', 'email', 'message', 'turnstileToken', 'snakeProofToken']
        if (required.some((k) => typeof body[k] !== 'string' || body[k].trim() === '')) return reply(400, { message: 'Invalid contact payload' })
        contacts.push(body)
        return reply(201, { id: contacts.length })
    }

    // ── analytics writes (fire-and-forget on the frontend) ──────────────
    if (path.startsWith('/analytics/') && method === 'POST') return reply(201, {})

    // ── skills CRUD (admin) ─────────────────────────────────────────────
    if (path === '/skills' || path.startsWith('/skills/')) {
        if (!isAuthed(req)) return reply(401, { message: 'Unauthorized' })
        if (path === '/skills' && method === 'POST') {
            const skill = { id: nextSkillId++, name: body.name, imageUrl: body.imageUrl ?? null, category: body.category ?? 'other' }
            db.skills.push(skill)
            return reply(201, skill)
        }
        const id = Number(path.split('/')[2])
        const idx = db.skills.findIndex((s) => s.id === id)
        if (idx === -1) return reply(404, { message: 'Skill not found' })
        if (method === 'PATCH') {
            db.skills[idx] = { ...db.skills[idx], ...Object.fromEntries(Object.entries(body).filter(([k]) => ['name', 'imageUrl', 'category'].includes(k))) }
            return reply(200, db.skills[idx])
        }
        if (method === 'DELETE') {
            db.skills.splice(idx, 1)
            return reply(204)
        }
    }

    return reply(404, { message: `No mock for ${method} ${path}` })
})

server.listen(PORT, () => console.log(`[mock-api] listening on http://localhost:${PORT}`))
