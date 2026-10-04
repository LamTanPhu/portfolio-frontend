// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { API_URL } from '@/lib/constants'
import { projectSummaryDTO, userProfileDTO } from '@/src/test/fixtures'
import { server } from '@/src/test/msw/server'
import { AdminAnalyticsPage } from './AdminAnalyticsPage'
import { AdminAuditPage } from './AdminAuditPage'
import { AdminContactListPage } from './AdminContactListPage'
import { AdminProfilePage } from './AdminProfilePage'

const show = vi.hoisted(() => vi.fn())
const auth = vi.hoisted(() => ({ accessToken: 'tok-admin' as string | null }))
vi.mock('../../context/AuthContext', () => ({ useAuth: () => auth }))
vi.mock('../../context/ToastContext', () => ({ useToast: () => ({ show }) }))

beforeEach(() => {
    show.mockReset()
    auth.accessToken = 'tok-admin'
})

const none = (status: number) => new HttpResponse(null, { status })

// ── Contact messages ────────────────────────────────────────────────────────
const msg = (id: number, over: Record<string, unknown> = {}) => ({
    id, name: `Sender ${id}`, email: `s${id}@example.com`, message: `Hello number ${id}`,
    ipAddress: `10.0.0.${id}`, browserInfo: `Browser ${id}`, createdAt: '2025-03-01T10:00:00.000Z', ...over,
})

describe('AdminContactListPage', () => {
    const page = (items: unknown[], nextCursor: number | null = null, total = items.length) =>
        HttpResponse.json({ items, nextCursor, total } as never)

    it('lists messages with sender, email and a preview, and shows the total', async () => {
        server.use(http.get(`${API_URL}/contact`, () => page([msg(1), msg(2)], null, 42)))
        render(<AdminContactListPage />)

        expect(await screen.findByText('Sender 1')).toBeInTheDocument()
        expect(screen.getByText('s2@example.com')).toBeInTheDocument()
        expect(screen.getByText('Hello number 1')).toBeInTheDocument()
        expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('requests the first page of 20 with the bearer token', async () => {
        let search = ''; let authz: string | null = null
        server.use(http.get(`${API_URL}/contact`, ({ request }) => {
            search = new URL(request.url).search; authz = request.headers.get('authorization')
            return page([])
        }))
        render(<AdminContactListPage />)
        await screen.findByText('no messages yet.')

        expect(search).toBe('?limit=20')
        expect(authz).toBe('Bearer tok-admin')
    })

    it('shows the empty state', async () => {
        server.use(http.get(`${API_URL}/contact`, () => page([])))
        render(<AdminContactListPage />)

        expect(await screen.findByText('no messages yet.')).toBeInTheDocument()
    })

    it('toasts an error when loading fails', async () => {
        server.use(http.get(`${API_URL}/contact`, () => none(500)))
        render(<AdminContactListPage />)

        await waitFor(() => expect(show).toHaveBeenCalledWith('Failed to load messages.', 'error'))
    })

    it('does not request anything without an access token', async () => {
        auth.accessToken = null
        const hit = vi.fn()
        server.use(http.get(`${API_URL}/contact`, () => { hit(); return page([]) }))
        render(<AdminContactListPage />)
        await new Promise((r) => setTimeout(r, 40))

        expect(hit).not.toHaveBeenCalled()
        expect(screen.getByText('loading')).toBeInTheDocument()
    })

    it('expands a message to show the full text, IP and browser, and collapses it again', async () => {
        server.use(http.get(`${API_URL}/contact`, () => page([msg(1)])))
        render(<AdminContactListPage />)
        const row = await screen.findByRole('button', { name: /Sender 1/ })

        await userEvent.click(row)
        expect(screen.getByText('10.0.0.1')).toBeInTheDocument()
        expect(screen.getByText('Browser 1')).toBeInTheDocument()
        expect(screen.getAllByText('Hello number 1')).toHaveLength(1) // preview is replaced by the full text

        await userEvent.click(row)
        expect(screen.queryByText('10.0.0.1')).not.toBeInTheDocument()
    })

    it('omits the browser line when none was recorded', async () => {
        server.use(http.get(`${API_URL}/contact`, () => page([msg(1, { browserInfo: null })])))
        render(<AdminContactListPage />)

        await userEvent.click(await screen.findByRole('button', { name: /Sender 1/ }))

        expect(screen.getByText('10.0.0.1')).toBeInTheDocument()
        expect(screen.queryByText(/Browser/)).not.toBeInTheDocument()
    })

    it('"load more" fetches the next page by cursor, appends it, and disappears at the end', async () => {
        const searches: string[] = []
        server.use(http.get(`${API_URL}/contact`, ({ request }) => {
            const url = new URL(request.url); searches.push(url.search)
            return url.searchParams.get('cursor') === '2' ? page([msg(3)], null, 3) : page([msg(1), msg(2)], 2, 3)
        }))
        render(<AdminContactListPage />)

        await userEvent.click(await screen.findByRole('button', { name: 'load more' }))

        expect(await screen.findByText('Sender 3')).toBeInTheDocument()
        expect(screen.getByText('Sender 1')).toBeInTheDocument()
        expect(searches).toEqual(['?limit=20', '?cursor=2&limit=20'])
        expect(screen.queryByRole('button', { name: 'load more' })).not.toBeInTheDocument()
    })

    it('shows "loading..." on the button while the next page is in flight', async () => {
        let release!: () => void
        server.use(http.get(`${API_URL}/contact`, async ({ request }) => {
            if (new URL(request.url).searchParams.has('cursor')) {
                await new Promise<void>((r) => { release = r })
                return page([msg(3)])
            }
            return page([msg(1)], 1, 2)
        }))
        render(<AdminContactListPage />)

        await userEvent.click(await screen.findByRole('button', { name: 'load more' }))

        expect(await screen.findByRole('button', { name: 'loading...' })).toBeDisabled()
        release()
        await screen.findByText('Sender 3')
    })

    it('toasts an error when "load more" fails and keeps the rows it has', async () => {
        server.use(http.get(`${API_URL}/contact`, ({ request }) =>
            new URL(request.url).searchParams.has('cursor') ? none(500) : page([msg(1)], 1, 2)))
        render(<AdminContactListPage />)

        await userEvent.click(await screen.findByRole('button', { name: 'load more' }))

        await waitFor(() => expect(show).toHaveBeenCalledWith('Failed to load more messages.', 'error'))
        expect(screen.getByText('Sender 1')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'load more' })).toBeEnabled()
    })

    it('deletes after confirmation: authenticated DELETE, row removed, total decremented, toast', async () => {
        let authz: string | null = null
        server.use(
            http.get(`${API_URL}/contact`, () => page([msg(1), msg(2)], null, 2)),
            http.delete(`${API_URL}/contact/1`, ({ request }) => { authz = request.headers.get('authorization'); return none(204) }),
        )
        render(<AdminContactListPage />)
        await userEvent.click(await screen.findByRole('button', { name: /Sender 1/ }))

        await userEvent.click(screen.getByRole('button', { name: /^delete$/ }))
        const dialog = screen.getByRole('alertdialog')
        expect(within(dialog).getByText('Delete message?')).toBeInTheDocument()
        expect(within(dialog).getByText(/"Sender 1"/)).toBeInTheDocument()
        await userEvent.click(within(dialog).getByRole('button', { name: 'delete' }))

        await waitFor(() => expect(screen.queryByText('Sender 1')).not.toBeInTheDocument())
        expect(authz).toBe('Bearer tok-admin')
        expect(screen.getByText('1')).toBeInTheDocument()
        expect(show).toHaveBeenCalledWith('Deleted message from Sender 1.', 'success')
    })

    it('cancelling the confirmation deletes nothing', async () => {
        const hit = vi.fn()
        server.use(http.get(`${API_URL}/contact`, () => page([msg(1)])), http.delete(`${API_URL}/contact/1`, () => { hit(); return none(204) }))
        render(<AdminContactListPage />)
        await userEvent.click(await screen.findByRole('button', { name: /Sender 1/ }))
        await userEvent.click(screen.getByRole('button', { name: /^delete$/ }))

        await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'cancel' }))

        expect(hit).not.toHaveBeenCalled()
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })

    it('toasts an error and keeps the message when the delete fails', async () => {
        server.use(http.get(`${API_URL}/contact`, () => page([msg(1)])), http.delete(`${API_URL}/contact/1`, () => none(500)))
        render(<AdminContactListPage />)
        await userEvent.click(await screen.findByRole('button', { name: /Sender 1/ }))
        await userEvent.click(screen.getByRole('button', { name: /^delete$/ }))

        await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'delete' }))

        await waitFor(() => expect(show).toHaveBeenCalledWith('Failed to delete — try again.', 'error'))
        expect(screen.getByText('Sender 1')).toBeInTheDocument()
    })
})

// ── Audit log ───────────────────────────────────────────────────────────────
const entry = (id: number, over: Record<string, unknown> = {}) => ({
    id, actorId: 1, method: 'POST', route: `/api/things/${id}`, entityType: 'Thing', entityId: String(id),
    ipAddress: '10.0.0.1', statusCode: 201, createdAt: '2025-03-01T10:00:00.000Z', ...over,
})

describe('AdminAuditPage', () => {
    const page = (items: unknown[], nextCursor: number | null = null, total = items.length) =>
        HttpResponse.json({ items, nextCursor, total } as never)

    it('lists entries with method, route, entity and status, and shows the total', async () => {
        server.use(http.get(`${API_URL}/audit`, () => page([entry(1), entry(2, { method: 'DELETE', entityType: 'Skill', entityId: null })], null, 99)))
        render(<AdminAuditPage />)

        expect(await screen.findByText('/api/things/1')).toBeInTheDocument()
        expect(screen.getByText('POST')).toBeInTheDocument()
        expect(screen.getByText('DELETE')).toBeInTheDocument()
        expect(screen.getByText('Thing#1')).toBeInTheDocument()
        expect(screen.getByText('Skill')).toBeInTheDocument() // no "#id" when entityId is null
        expect(screen.getByText('99')).toBeInTheDocument()
    })

    it('colours the status code: 2xx teal, 4xx amber, 5xx red', async () => {
        server.use(http.get(`${API_URL}/audit`, () => page([entry(1, { statusCode: 200 }), entry(2, { statusCode: 404 }), entry(3, { statusCode: 503 })])))
        render(<AdminAuditPage />)
        await screen.findByText('/api/things/1')

        expect(screen.getByText('200').className).toContain('accent-teal')
        expect(screen.getByText('404').className).toContain('text-amber-500')
        expect(screen.getByText('503').className).toContain('text-red-500')
    })

    it('requests pages of 30 and appends the next page on "load more"', async () => {
        const searches: string[] = []
        server.use(http.get(`${API_URL}/audit`, ({ request }) => {
            const url = new URL(request.url); searches.push(url.search)
            return url.searchParams.get('cursor') === '1' ? page([entry(2)], null, 2) : page([entry(1)], 1, 2)
        }))
        render(<AdminAuditPage />)

        await userEvent.click(await screen.findByRole('button', { name: 'load more' }))

        expect(await screen.findByText('/api/things/2')).toBeInTheDocument()
        expect(screen.getByText('/api/things/1')).toBeInTheDocument()
        expect(searches).toEqual(['?limit=30', '?cursor=1&limit=30'])
        expect(screen.queryByRole('button', { name: 'load more' })).not.toBeInTheDocument()
    })

    it('shows the empty state, load errors, and "load more" errors', async () => {
        server.use(http.get(`${API_URL}/audit`, () => page([])))
        const empty = render(<AdminAuditPage />)
        expect(await screen.findByText('no activity recorded yet.')).toBeInTheDocument()
        empty.unmount()

        server.use(http.get(`${API_URL}/audit`, () => none(500)))
        const failed = render(<AdminAuditPage />)
        await waitFor(() => expect(show).toHaveBeenCalledWith('Failed to load audit log.', 'error'))
        failed.unmount()

        server.use(http.get(`${API_URL}/audit`, ({ request }) =>
            new URL(request.url).searchParams.has('cursor') ? none(500) : page([entry(1)], 1, 2)))
        render(<AdminAuditPage />)
        await userEvent.click(await screen.findByRole('button', { name: 'load more' }))
        await waitFor(() => expect(show).toHaveBeenCalledWith('Failed to load more entries.', 'error'))
    })

    it('does not request anything without an access token', async () => {
        auth.accessToken = null
        const hit = vi.fn()
        server.use(http.get(`${API_URL}/audit`, () => { hit(); return page([]) }))
        render(<AdminAuditPage />)
        await new Promise((r) => setTimeout(r, 40))

        expect(hit).not.toHaveBeenCalled()
    })
})

// ── Profile ─────────────────────────────────────────────────────────────────
function control(label: string): HTMLInputElement | HTMLTextAreaElement {
    const el = screen.getByText(`_${label}:`).parentElement?.querySelector('input, textarea')
    if (!el) throw new Error(`no control for ${label}`)
    return el as HTMLInputElement | HTMLTextAreaElement
}

describe('AdminProfilePage', () => {
    const profile = (over = {}) => userProfileDTO({ id: 1, firstname: 'Phu', lastname: 'Lam', email: 'phu@example.dev', aboutme: 'Engineer.', lastLogin: '2025-04-01T12:00:00.000Z', ...over })
    const serveProfile = (over = {}) => server.use(http.get(`${API_URL}/user/profile`, () => HttpResponse.json(profile(over))))

    it('shows a loading indicator, then the editable name/about fields and the read-only email and last login', async () => {
        serveProfile()
        render(<AdminProfilePage />)
        expect(screen.getByText('loading')).toBeInTheDocument()

        await screen.findByRole('heading', { name: /profile/ })
        expect(control('firstname')).toHaveValue('Phu')
        expect(control('lastname')).toHaveValue('Lam')
        expect(control('aboutme')).toHaveValue('Engineer.')
        expect(screen.getByText('phu@example.dev')).toBeInTheDocument()
        expect(screen.getByText(new Date('2025-04-01T12:00:00.000Z').toLocaleString())).toBeInTheDocument()
    })

    it('shows "never" when the admin has not logged in, and an empty about box for a null bio', async () => {
        serveProfile({ lastLogin: null, aboutme: null })
        render(<AdminProfilePage />)

        await screen.findByRole('heading', { name: /profile/ })
        expect(screen.getByText('never')).toBeInTheDocument()
        expect(control('aboutme')).toHaveValue('')
    })

    it('shows an error when the profile cannot be loaded', async () => {
        server.use(http.get(`${API_URL}/user/profile`, () => none(500)))
        render(<AdminProfilePage />)

        expect(await screen.findByText('Failed to load profile.')).toBeInTheDocument()
    })

    it('stays on the loading indicator without an access token', async () => {
        auth.accessToken = null
        render(<AdminProfilePage />)
        await new Promise((r) => setTimeout(r, 40))

        expect(screen.getByText('loading')).toBeInTheDocument()
    })

    it('PATCHes the edited fields (empty about becomes null), refreshes from the response and toasts', async () => {
        serveProfile()
        let body: unknown; let authz: string | null = null
        server.use(http.patch(`${API_URL}/user/profile`, async ({ request }) => {
            body = await request.json(); authz = request.headers.get('authorization')
            return HttpResponse.json(profile({ firstname: 'Phú', aboutme: null }))
        }))
        render(<AdminProfilePage />)
        await screen.findByRole('heading', { name: /profile/ })

        await userEvent.clear(control('firstname')); await userEvent.type(control('firstname'), 'Phú')
        await userEvent.clear(control('aboutme'))
        await userEvent.click(screen.getByRole('button', { name: /save/ }))

        await waitFor(() => expect(show).toHaveBeenCalledWith('Profile updated.', 'success'))
        expect(body).toEqual({ firstname: 'Phú', lastname: 'Lam', aboutme: null })
        expect(authz).toBe('Bearer tok-admin')
        expect(control('firstname')).toHaveValue('Phú')
    })

    it('disables save when the first or last name is cleared', async () => {
        serveProfile()
        render(<AdminProfilePage />)
        await screen.findByRole('heading', { name: /profile/ })

        await userEvent.clear(control('firstname'))
        expect(screen.getByRole('button', { name: /save/ })).toBeDisabled()
        await userEvent.type(control('firstname'), 'P')
        expect(screen.getByRole('button', { name: /save/ })).toBeEnabled()
        await userEvent.clear(control('lastname'))
        expect(screen.getByRole('button', { name: /save/ })).toBeDisabled()
    })

    it('shows an error when saving fails, and "reset" restores the saved values and clears the error', async () => {
        serveProfile()
        server.use(http.patch(`${API_URL}/user/profile`, () => none(500)))
        render(<AdminProfilePage />)
        await screen.findByRole('heading', { name: /profile/ })
        await userEvent.type(control('firstname'), 'XYZ')
        await userEvent.click(screen.getByRole('button', { name: /save/ }))
        expect(await screen.findByText('Failed to save — check the backend is reachable.')).toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: 'reset' }))

        expect(control('firstname')).toHaveValue('Phu')
        expect(screen.queryByText('Failed to save — check the backend is reachable.')).not.toBeInTheDocument()
        expect(show).not.toHaveBeenCalled()
    })
})

// ── Analytics ───────────────────────────────────────────────────────────────
describe('AdminAnalyticsPage', () => {
    const pageViews = [
        { route: '/', count: 10, lastViewedAt: '2025-03-02T10:00:00.000Z' },
        { route: '/blog', count: 5, lastViewedAt: '2025-03-01T10:00:00.000Z' },
    ]
    function serve({ views = pageViews, projects = [] as unknown[], stats = {} as Record<number, unknown> } = {}) {
        server.use(
            http.get(`${API_URL}/analytics/page-views`, () => HttpResponse.json(views as never)),
            http.get(`${API_URL}/projects`, () => HttpResponse.json(projects as never)),
            http.get(`${API_URL}/analytics/project-views/:id`, ({ params }) => HttpResponse.json((stats[Number(params.id)] ?? { projectId: Number(params.id), totalViews: 0, daily: [] }) as never)),
        )
    }
    const widthOf = (text: string) => (screen.getByText(text).parentElement?.querySelector('[aria-hidden]') as HTMLElement).style.width

    it('lists page views with counts and bars scaled to the busiest route', async () => {
        serve()
        render(<AdminAnalyticsPage />)

        expect(await screen.findByText('/blog')).toBeInTheDocument()
        expect(widthOf('/')).toBe('100%')
        expect(widthOf('/blog')).toBe('50%')
        expect(screen.getByText('10')).toBeInTheDocument()
        expect(screen.getByText(new Date('2025-03-02T10:00:00.000Z').toLocaleDateString())).toBeInTheDocument()
    })

    it('lists projects by total views (most first) with the latest day, or "—" when never viewed', async () => {
        serve({
            projects: [projectSummaryDTO({ id: 1, name: 'Quiet' }), projectSummaryDTO({ id: 2, name: 'Popular' })],
            stats: {
                1: { projectId: 1, totalViews: 0, daily: [] },
                2: { projectId: 2, totalViews: 30, daily: [{ date: '2025-03-05', count: 4 }] },
            },
        })
        render(<AdminAnalyticsPage />)

        const popular = await screen.findByText('Popular')
        const names = screen.getAllByText(/^(Popular|Quiet)$/).map((n) => n.textContent)
        expect(names).toEqual(['Popular', 'Quiet'])
        expect(popular).toBeInTheDocument()
        expect(screen.getByText('30')).toBeInTheDocument()
        expect(screen.getByText(new Date('2025-03-05').toLocaleDateString())).toBeInTheDocument()
        expect(screen.getByText('—')).toBeInTheDocument()
    })

    it('shows both empty states', async () => {
        serve({ views: [], projects: [] })
        render(<AdminAnalyticsPage />)

        expect(await screen.findByText('no page views recorded yet.')).toBeInTheDocument()
        expect(await screen.findByText('no project views recorded yet.')).toBeInTheDocument()
    })

    it('draws zero-width bars when every count is zero', async () => {
        serve({ views: [{ route: '/idle', count: 0, lastViewedAt: '2025-03-01T10:00:00.000Z' }] })
        render(<AdminAnalyticsPage />)

        await screen.findByText('/idle')
        expect(widthOf('/idle')).toBe('0%')
    })

    it('toasts a separate error for each section that fails to load', async () => {
        server.use(
            http.get(`${API_URL}/analytics/page-views`, () => none(500)),
            http.get(`${API_URL}/projects`, () => none(500)),
        )
        render(<AdminAnalyticsPage />)

        await waitFor(() => expect(show).toHaveBeenCalledWith('Failed to load page view stats.', 'error'))
        await waitFor(() => expect(show).toHaveBeenCalledWith('Failed to load project view stats.', 'error'))
    })

    it('requests nothing without an access token', async () => {
        auth.accessToken = null
        const hit = vi.fn()
        server.use(http.get(`${API_URL}/analytics/page-views`, () => { hit(); return HttpResponse.json([]) }))
        render(<AdminAnalyticsPage />)
        await new Promise((r) => setTimeout(r, 40))

        expect(hit).not.toHaveBeenCalled()
    })
})
