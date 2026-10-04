// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import type { ComponentType } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { API_URL } from '@/lib/constants'
import {
    blogSummaryDTO, certificationDTO, educationDTO, jobDTO,
    projectSummaryDTO, skillDTO, socialAccountDTO,
} from '@/src/test/fixtures'
import { server } from '@/src/test/msw/server'
import { AdminBlogListPage } from './AdminBlogListPage'
import { AdminCertificationListPage } from './AdminCertificationListPage'
import { AdminEducationListPage } from './AdminEducationListPage'
import { AdminJobListPage } from './AdminJobListPage'
import { AdminProjectListPage } from './AdminProjectListPage'
import { AdminSkillListPage } from './AdminSkillListPage'
import { AdminSocialListPage } from './AdminSocialListPage'

const show = vi.hoisted(() => vi.fn())
const auth = vi.hoisted(() => ({ accessToken: 'tok-admin' as string | null }))
vi.mock('../../context/AuthContext', () => ({ useAuth: () => auth }))
vi.mock('../../context/ToastContext', () => ({ useToast: () => ({ show }) }))

// The seven list pages are structurally identical (load → rows → confirm →
// delete), so one table drives the same behavioural checks through each.
interface Case {
    name: string
    Page: ComponentType
    heading: string
    newHref: string
    emptyMessage: string
    loadError: string
    dialogTitle: string
    listPath: string                 // GET
    items: unknown[]
    rowTitles: string[]              // what the two rows display, in order
    deleteLabel: string              // name used in "Deleted "X"."
    deletePath: (id: number) => string
    editHrefs: [string, string]      // projects and posts are edited by slug, the rest by id
    needsToken?: boolean             // list endpoint needs the bearer token
}

const cases: Case[] = [
    {
        name: 'skills', Page: AdminSkillListPage, heading: 'skills', newHref: '/admin/skills/new',
        emptyMessage: 'no public skills yet.', loadError: 'Failed to load skills.', dialogTitle: 'Delete skill?',
        listPath: '/skills', items: [skillDTO({ id: 1, name: 'TypeScript' }), skillDTO({ id: 2, name: 'Rust' })],
        rowTitles: ['TypeScript', 'Rust'], deleteLabel: 'TypeScript', deletePath: (id) => `/skills/${id}`,
        editHrefs: ['/admin/skills/1/edit', '/admin/skills/2/edit'],
    },
    {
        name: 'jobs', Page: AdminJobListPage, heading: 'jobs', newHref: '/admin/jobs/new',
        emptyMessage: 'no public jobs yet.', loadError: 'Failed to load jobs.', dialogTitle: 'Delete job?',
        listPath: '/jobs', items: [jobDTO({ id: 1, role: 'Engineer', companyName: 'Acme' }), jobDTO({ id: 2, role: 'Lead', companyName: 'Initech' })],
        rowTitles: ['Engineer', 'Lead'], deleteLabel: 'Engineer', deletePath: (id) => `/jobs/${id}`,
        editHrefs: ['/admin/jobs/1/edit', '/admin/jobs/2/edit'],
    },
    {
        name: 'education', Page: AdminEducationListPage, heading: 'education', newHref: '/admin/education/new',
        emptyMessage: 'no public education records yet.', loadError: 'Failed to load education records.', dialogTitle: 'Delete education record?',
        listPath: '/education', items: [educationDTO({ id: 1, degreeName: 'BSc' }), educationDTO({ id: 2, degreeName: 'MSc' })],
        rowTitles: ['BSc', 'MSc'], deleteLabel: 'BSc', deletePath: (id) => `/education/${id}`,
        editHrefs: ['/admin/education/1/edit', '/admin/education/2/edit'],
    },
    {
        name: 'certifications', Page: AdminCertificationListPage, heading: 'certifications', newHref: '/admin/certifications/new',
        emptyMessage: 'no published certifications yet.', loadError: 'Failed to load certifications.', dialogTitle: 'Delete certification?',
        listPath: '/certifications', items: [certificationDTO({ id: 1, name: 'AWS' }), certificationDTO({ id: 2, name: 'CKA' })],
        rowTitles: ['AWS', 'CKA'], deleteLabel: 'AWS', deletePath: (id) => `/certifications/${id}`,
        editHrefs: ['/admin/certifications/1/edit', '/admin/certifications/2/edit'],
    },
    {
        name: 'social accounts', Page: AdminSocialListPage, heading: 'social-accounts', newHref: '/admin/social/new',
        emptyMessage: 'no public social accounts yet.', loadError: 'Failed to load social accounts.', dialogTitle: 'Delete social account?',
        listPath: '/social', items: [socialAccountDTO({ id: 1, name: 'GitHub' }), socialAccountDTO({ id: 2, name: 'Mastodon' })],
        rowTitles: ['GitHub', 'Mastodon'], deleteLabel: 'GitHub', deletePath: (id) => `/social/${id}`,
        editHrefs: ['/admin/social/1/edit', '/admin/social/2/edit'],
    },
    {
        name: 'projects', Page: AdminProjectListPage, heading: 'projects', newHref: '/admin/projects/new',
        emptyMessage: 'no published projects yet.', loadError: 'Failed to load projects.', dialogTitle: 'Delete project?',
        listPath: '/projects', items: [projectSummaryDTO({ id: 1, name: 'Alpha', slug: 'alpha' }), projectSummaryDTO({ id: 2, name: 'Beta', slug: 'beta', isPublished: false })],
        rowTitles: ['Alpha', 'Beta'], deleteLabel: 'Alpha', deletePath: (id) => `/projects/${id}`,
        editHrefs: ['/admin/projects/alpha/edit', '/admin/projects/beta/edit'],
    },
    {
        name: 'blog posts', Page: AdminBlogListPage, heading: 'blog-posts', newHref: '/admin/blog/new',
        emptyMessage: 'no posts yet.', loadError: 'Failed to load posts.', dialogTitle: 'Delete post?',
        listPath: '/blogs/admin', items: [blogSummaryDTO({ id: 1, title: 'First', slug: 'first' }), blogSummaryDTO({ id: 2, title: 'Second', slug: 'second', isPublished: false })],
        rowTitles: ['First', 'Second'], deleteLabel: 'First', deletePath: (id) => `/blogs/${id}`,
        editHrefs: ['/admin/blog/first/edit', '/admin/blog/second/edit'], needsToken: true,
    },
]

beforeEach(() => {
    show.mockReset()
    auth.accessToken = 'tok-admin'
})

describe.each(cases)('admin $name list page', (c) => {
    const serveList = (items: unknown[] = c.items) =>
        server.use(http.get(`${API_URL}${c.listPath}`, () => HttpResponse.json(items as never)))

    it('shows a loading indicator, then one row per item with the count in the header', async () => {
        serveList()
        render(<c.Page />)
        expect(screen.getByText('loading')).toBeInTheDocument()

        for (const title of c.rowTitles) expect(await screen.findByText(title)).toBeInTheDocument()

        expect(screen.queryByText('loading')).not.toBeInTheDocument()
        expect(screen.getByRole('heading', { name: new RegExp(c.heading) })).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('links to the "new" form and to each row\'s edit form', async () => {
        serveList()
        render(<c.Page />)
        await screen.findByText(c.rowTitles[0])

        expect(screen.getAllByRole('link').some((a) => a.getAttribute('href') === c.newHref)).toBe(true)
        const edits = screen.getAllByTitle('edit')
        expect(edits).toHaveLength(2)
        expect(edits.map((a) => a.getAttribute('href'))).toEqual(c.editHrefs)
    })

    it('shows the empty state when there is nothing yet', async () => {
        serveList([])
        render(<c.Page />)

        expect(await screen.findByText(c.emptyMessage)).toBeInTheDocument()
        expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('toasts an error (and keeps loading) when the list request fails', async () => {
        server.use(http.get(`${API_URL}${c.listPath}`, () => new HttpResponse(null, { status: 500 })))
        render(<c.Page />)

        await waitFor(() => expect(show).toHaveBeenCalledWith(c.loadError, 'error'))
        expect(screen.getByText('loading')).toBeInTheDocument()
    })

    if (c.needsToken) {
        it('does not request the list before there is an access token', async () => {
            auth.accessToken = null
            const hit = vi.fn()
            server.use(http.get(`${API_URL}${c.listPath}`, () => { hit(); return HttpResponse.json([]) }))

            render(<c.Page />)
            await new Promise((r) => setTimeout(r, 50))

            expect(hit).not.toHaveBeenCalled()
            expect(screen.getByText('loading')).toBeInTheDocument()
        })
    }

    it('asks for confirmation before deleting, and "cancel" leaves everything untouched', async () => {
        serveList()
        const deleted = vi.fn()
        server.use(http.delete(`${API_URL}${c.deletePath(1)}`, () => { deleted(); return new HttpResponse(null, { status: 204 }) }))
        render(<c.Page />)
        await screen.findByText(c.rowTitles[0])

        await userEvent.click(screen.getAllByTitle('delete')[0])
        const dialog = screen.getByRole('alertdialog')
        expect(within(dialog).getByText(c.dialogTitle)).toBeInTheDocument()

        await userEvent.click(within(dialog).getByRole('button', { name: 'cancel' }))

        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        expect(deleted).not.toHaveBeenCalled()
        expect(screen.getByText(c.rowTitles[0])).toBeInTheDocument()
    })

    it('Escape also dismisses the confirmation', async () => {
        serveList()
        render(<c.Page />)
        await screen.findByText(c.rowTitles[0])
        await userEvent.click(screen.getAllByTitle('delete')[0])

        await userEvent.keyboard('{Escape}')

        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })

    it('confirming sends an authenticated DELETE, removes the row and toasts success', async () => {
        serveList()
        let authHeader: string | null = null
        server.use(http.delete(`${API_URL}${c.deletePath(1)}`, ({ request }) => {
            authHeader = request.headers.get('authorization')
            return new HttpResponse(null, { status: 204 })
        }))
        render(<c.Page />)
        await screen.findByText(c.rowTitles[0])

        await userEvent.click(screen.getAllByTitle('delete')[0])
        await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'delete' }))

        await waitFor(() => expect(screen.queryByText(c.rowTitles[0])).not.toBeInTheDocument())
        expect(authHeader).toBe('Bearer tok-admin')
        expect(show).toHaveBeenCalledWith(`Deleted "${c.deleteLabel}".`, 'success')
        expect(screen.getByText(c.rowTitles[1])).toBeInTheDocument() // the other row is untouched
    })

    it('keeps the row and toasts an error when the delete fails', async () => {
        serveList()
        server.use(http.delete(`${API_URL}${c.deletePath(1)}`, () => new HttpResponse(null, { status: 500 })))
        render(<c.Page />)
        await screen.findByText(c.rowTitles[0])

        await userEvent.click(screen.getAllByTitle('delete')[0])
        await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'delete' }))

        await waitFor(() => expect(show).toHaveBeenCalledWith('Failed to delete — try again.', 'error'))
        expect(screen.getByText(c.rowTitles[0])).toBeInTheDocument()
        expect(screen.getAllByTitle('delete')[0]).toBeEnabled() // spinner cleared
    })

    if (!c.needsToken) {
        it('does nothing when confirm is clicked without an access token', async () => {
            auth.accessToken = null // the list is public, so rows still load
            serveList()
            const deleted = vi.fn()
            server.use(http.delete(`${API_URL}${c.deletePath(1)}`, () => { deleted(); return new HttpResponse(null, { status: 204 }) }))
            render(<c.Page />)
            await screen.findByText(c.rowTitles[0])
            await userEvent.click(screen.getAllByTitle('delete')[0])

            await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'delete' }))

            expect(deleted).not.toHaveBeenCalled()
            expect(show).not.toHaveBeenCalledWith(expect.stringContaining('Deleted'), 'success')
            expect(screen.getByText(c.rowTitles[0])).toBeInTheDocument()
        })
    }
})
