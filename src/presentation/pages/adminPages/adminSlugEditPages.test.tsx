// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ComponentType } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { API_URL } from '@/lib/constants'
import { blogDetailDTO, projectDTO } from '@/src/test/fixtures'
import { server } from '@/src/test/msw/server'
import { AdminBlogEditPage } from './AdminBlogEditPage'
import { AdminProjectEditPage } from './AdminProjectEditPage'

const auth = vi.hoisted(() => ({ accessToken: 'tok-admin' as string | null }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }))
vi.mock('../../context/AuthContext', () => ({ useAuth: () => auth }))
vi.mock('../../context/ToastContext', () => ({ useToast: () => ({ show: vi.fn() }) }))

// Blog posts and projects are edited by SLUG and loaded through the JWT-guarded
// admin routes, which — unlike the public ones — also return drafts. The page
// must therefore (a) send the bearer token, (b) open an UNPUBLISHED record
// normally, and (c) never fall back to the public route.
interface Case {
    name: string
    Page: ComponentType<{ slug: string }>
    adminPath: (slug: string) => string
    publicPath: (slug: string) => string
    draft: () => unknown
    editTitle: string
    shown: string
    notFound: RegExp
    backHref: string
    backLabel: string
    loadError: RegExp
}

const cases: Case[] = [
    {
        name: 'blog post', Page: AdminBlogEditPage,
        adminPath: (s) => `/blogs/admin/${s}`, publicPath: (s) => `/blogs/${s}`,
        draft: () => blogDetailDTO({ slug: 'wip', title: 'Work in progress', isPublished: false, publishedAt: null }),
        editTitle: 'edit-post', shown: 'Work in progress',
        notFound: /No post with that slug/, backHref: '/admin/blog', backLabel: 'back to posts',
        loadError: /Failed to load post/,
    },
    {
        name: 'project', Page: AdminProjectEditPage,
        adminPath: (s) => `/projects/admin/${s}`, publicPath: (s) => `/projects/${s}`,
        draft: () => projectDTO({ slug: 'wip', name: 'Work in progress', isPublished: false }),
        editTitle: 'edit-project', shown: 'Work in progress',
        notFound: /No project with that slug/, backHref: '/admin/projects', backLabel: 'back to projects',
        loadError: /Failed to load project/,
    },
]

beforeEach(() => {
    vi.clearAllMocks()
    auth.accessToken = 'tok-admin'
})

describe.each(cases)('admin $name edit page (by slug, drafts included)', (c) => {
    it('shows a loading indicator first', () => {
        server.use(http.get(`${API_URL}${c.adminPath('wip')}`, () => HttpResponse.json(c.draft() as never)))
        render(<c.Page slug="wip" />)

        expect(screen.getByText('loading')).toBeInTheDocument()
    })

    it('opens the form for an UNPUBLISHED record, pre-filled, sending the bearer token', async () => {
        let authHeader: string | null = null
        server.use(http.get(`${API_URL}${c.adminPath('wip')}`, ({ request }) => {
            authHeader = request.headers.get('authorization')
            return HttpResponse.json(c.draft() as never)
        }))
        render(<c.Page slug="wip" />)

        expect(await screen.findByRole('heading', { name: new RegExp(c.editTitle) })).toBeInTheDocument()
        expect(screen.getByDisplayValue(c.shown)).toBeInTheDocument()
        expect(authHeader).toBe('Bearer tok-admin')
    })

    it('never touches the public route (it 404s on drafts by design)', async () => {
        const publicHit = vi.fn()
        server.use(
            http.get(`${API_URL}${c.publicPath('wip')}`, () => { publicHit(); return new HttpResponse(null, { status: 404 }) }),
            http.get(`${API_URL}${c.adminPath('wip')}`, () => HttpResponse.json(c.draft() as never)),
        )
        render(<c.Page slug="wip" />)
        await screen.findByRole('heading', { name: new RegExp(c.editTitle) })

        expect(publicHit).not.toHaveBeenCalled()
    })

    it('shows a "not found" panel with a way back on a 404', async () => {
        server.use(http.get(`${API_URL}${c.adminPath('nope')}`, () => new HttpResponse(null, { status: 404 })))
        render(<c.Page slug="nope" />)

        expect(await screen.findByText(c.notFound)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: new RegExp(c.backLabel) })).toHaveAttribute('href', c.backHref)
        expect(screen.queryByRole('heading', { name: new RegExp(c.editTitle) })).not.toBeInTheDocument()
    })

    it('shows an error (not "not found") when the request fails with a server error', async () => {
        server.use(http.get(`${API_URL}${c.adminPath('boom')}`, () => new HttpResponse(null, { status: 500 })))
        render(<c.Page slug="boom" />)

        expect(await screen.findByText(c.loadError)).toBeInTheDocument()
        expect(screen.queryByText(c.notFound)).not.toBeInTheDocument()
    })

    it('shows an error when the token is rejected (401)', async () => {
        server.use(http.get(`${API_URL}${c.adminPath('wip')}`, () => new HttpResponse(null, { status: 401 })))
        render(<c.Page slug="wip" />)

        expect(await screen.findByText(c.loadError)).toBeInTheDocument()
    })

    it('does not request anything before there is an access token', async () => {
        auth.accessToken = null
        const hit = vi.fn()
        server.use(http.get(`${API_URL}${c.adminPath('wip')}`, () => { hit(); return HttpResponse.json(c.draft() as never) }))

        render(<c.Page slug="wip" />)
        await new Promise((r) => setTimeout(r, 50))

        expect(hit).not.toHaveBeenCalled()
        expect(screen.getByText('loading')).toBeInTheDocument()
    })

    it('does not update state after unmounting mid-request', async () => {
        let release!: () => void
        server.use(http.get(`${API_URL}${c.adminPath('wip')}`, async () => {
            await new Promise<void>((r) => { release = r })
            return HttpResponse.json(c.draft() as never)
        }))
        const { unmount } = render(<c.Page slug="wip" />)
        await waitFor(() => expect(release).toBeDefined())

        unmount()
        release()
        await new Promise((r) => setTimeout(r, 30))

        expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })
})
