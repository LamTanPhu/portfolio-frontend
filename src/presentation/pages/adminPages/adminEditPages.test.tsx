// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ComponentType } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { API_URL } from '@/lib/constants'
import { certificationDTO, educationDTO, jobDTO, skillDTO, socialAccountDTO } from '@/src/test/fixtures'
import { server } from '@/src/test/msw/server'
import { AdminCertificationEditPage } from './AdminCertificationEditPage'
import { AdminEducationEditPage } from './AdminEducationEditPage'
import { AdminJobEditPage } from './AdminJobEditPage'
import { AdminSkillEditPage } from './AdminSkillEditPage'
import { AdminSocialEditPage } from './AdminSocialEditPage'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }))
vi.mock('../../context/AuthContext', () => ({ useAuth: () => ({ accessToken: 'tok' }) }))
vi.mock('../../context/ToastContext', () => ({ useToast: () => ({ show: vi.fn() }) }))

// Each edit page loads the admin list, finds the record by id, and either
// renders the form pre-filled, a "not found" panel, or an error.
interface Case {
    name: string
    Page: ComponentType<{ id: number }>
    listPath: string
    items: unknown[]
    editTitle: string
    shown: string                 // a value from record id=2 that the form must show
    notFound: RegExp
    backHref: string
    backLabel: string
    loadError: string
}

const cases: Case[] = [
    {
        name: 'skill', Page: AdminSkillEditPage, listPath: '/skills',
        items: [skillDTO({ id: 1, name: 'TypeScript' }), skillDTO({ id: 2, name: 'Rust' })],
        editTitle: 'edit-skill', shown: 'Rust', notFound: /No public skill with that id/,
        backHref: '/admin/skills', backLabel: 'back to skills', loadError: 'Failed to load skill.',
    },
    {
        name: 'job', Page: AdminJobEditPage, listPath: '/jobs',
        items: [jobDTO({ id: 1, role: 'Engineer' }), jobDTO({ id: 2, role: 'Lead' })],
        editTitle: 'edit-job', shown: 'Lead', notFound: /No public job with that id/,
        backHref: '/admin/jobs', backLabel: 'back to jobs', loadError: 'Failed to load job.',
    },
    {
        name: 'education', Page: AdminEducationEditPage, listPath: '/education',
        items: [educationDTO({ id: 1, degreeName: 'BSc' }), educationDTO({ id: 2, degreeName: 'MSc' })],
        editTitle: 'edit-education', shown: 'MSc', notFound: /No public education record with that id/,
        backHref: '/admin/education', backLabel: 'back to education', loadError: 'Failed to load education record.',
    },
    {
        name: 'certification', Page: AdminCertificationEditPage, listPath: '/certifications',
        items: [certificationDTO({ id: 1, name: 'AWS' }), certificationDTO({ id: 2, name: 'CKA' })],
        editTitle: 'edit-certification', shown: 'CKA', notFound: /No published certification with that id/,
        backHref: '/admin/certifications', backLabel: 'back to certifications', loadError: 'Failed to load certification.',
    },
    {
        name: 'social account', Page: AdminSocialEditPage, listPath: '/social',
        items: [socialAccountDTO({ id: 1, name: 'GitHub' }), socialAccountDTO({ id: 2, name: 'Mastodon' })],
        editTitle: 'edit-social-account', shown: 'Mastodon', notFound: /No public social account with that id/,
        backHref: '/admin/social', backLabel: 'back to social accounts', loadError: 'Failed to load social account.',
    },
]

beforeEach(() => {
    vi.clearAllMocks()
})

describe.each(cases)('admin $name edit page', (c) => {
    const serve = (items: unknown[] = c.items) =>
        server.use(http.get(`${API_URL}${c.listPath}`, () => HttpResponse.json(items as never)))

    it('shows a loading indicator first', () => {
        serve()
        render(<c.Page id={2} />)

        expect(screen.getByText('loading')).toBeInTheDocument()
    })

    it('opens the form for the record with the matching id, pre-filled', async () => {
        serve()
        render(<c.Page id={2} />)

        expect(await screen.findByRole('heading', { name: new RegExp(c.editTitle) })).toBeInTheDocument()
        expect(screen.getByDisplayValue(c.shown)).toBeInTheDocument()
    })

    it('shows a "not found" panel with a way back when the id is not in the list', async () => {
        serve()
        render(<c.Page id={999} />)

        expect(await screen.findByText(c.notFound)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: new RegExp(c.backLabel) })).toHaveAttribute('href', c.backHref)
        expect(screen.queryByRole('heading', { name: new RegExp(c.editTitle) })).not.toBeInTheDocument()
    })

    it('shows an error message when the list cannot be loaded', async () => {
        server.use(http.get(`${API_URL}${c.listPath}`, () => new HttpResponse(null, { status: 500 })))
        render(<c.Page id={2} />)

        expect(await screen.findByText(c.loadError)).toBeInTheDocument()
    })

    it('does not update state after unmounting mid-request', async () => {
        let release!: () => void
        server.use(http.get(`${API_URL}${c.listPath}`, async () => {
            await new Promise<void>((r) => { release = r })
            return HttpResponse.json(c.items as never)
        }))
        const { unmount } = render(<c.Page id={2} />)
        await waitFor(() => expect(release).toBeDefined())

        unmount()
        release()
        await new Promise((r) => setTimeout(r, 30))

        expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })
})
