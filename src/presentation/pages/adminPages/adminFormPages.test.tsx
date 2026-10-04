// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import type { ComponentType } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { API_URL } from '@/lib/constants'
import {
    blogDetailDTO, certificationDTO, educationDTO, jobDTO,
    projectDTO, socialAccountDTO,
} from '@/src/test/fixtures'
import { server } from '@/src/test/msw/server'
import { AdminBlogFormPage } from './AdminBlogFormPage'
import { AdminCertificationFormPage } from './AdminCertificationFormPage'
import { AdminEducationFormPage } from './AdminEducationFormPage'
import { AdminJobFormPage } from './AdminJobFormPage'
import { AdminProjectFormPage } from './AdminProjectFormPage'
import { AdminSocialFormPage } from './AdminSocialFormPage'

const push = vi.hoisted(() => vi.fn())
const show = vi.hoisted(() => vi.fn())
const auth = vi.hoisted(() => ({ accessToken: 'tok-admin' as string | null }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace: vi.fn() }) }))
vi.mock('../../context/AuthContext', () => ({ useAuth: () => auth }))
vi.mock('../../context/ToastContext', () => ({ useToast: () => ({ show }) }))

// Labels aren't wired to their inputs (no htmlFor), so a field is found via its
// "_label:" text and the control that sits in the same wrapper.
function control(label: string): HTMLInputElement | HTMLTextAreaElement {
    const el = screen.getByText(`_${label}:`).parentElement?.querySelector('input, textarea')
    if (!el) throw new Error(`no control for label ${label}`)
    return el as HTMLInputElement | HTMLTextAreaElement
}
async function fill(label: string, value: string) {
    const el = control(label)
    if ((el as HTMLInputElement).type === 'date') fireEvent.change(el, { target: { value } })
    else {
        await userEvent.clear(el)
        await userEvent.type(el, value)
    }
}

interface Case {
    name: string
    Page: ComponentType<any> // eslint-disable-line @typescript-eslint/no-explicit-any
    editProp: string
    listHref: string
    base: string
    newTitle: string
    editTitle: string
    required: Array<[label: string, value: string]>       // the minimum that enables "save"
    createBody: Record<string, unknown>                   // payload when only `required` is filled
    saved: string                                         // name shown in the success toast (create)
    response: unknown                                     // what the API answers with
    existing: { id: number }
    prefill: Array<[label: string, value: string]>        // expected prefilled inputs in edit mode
    edit: [label: string, value: string]
    editBody: Record<string, unknown>
    savedEdit: string
}

const cases: Case[] = [
    {
        name: 'job', Page: AdminJobFormPage, editProp: 'job', listHref: '/admin/jobs', base: '/jobs',
        newTitle: 'new-job', editTitle: 'edit-job',
        required: [['companyName', 'Initech'], ['role', 'Dev'], ['startedAt', '2024-01-02']],
        createBody: { companyName: 'Initech', role: 'Dev', startedAt: '2024-01-02', endedAt: null, isEnded: false, isPublic: true },
        saved: 'Dev', response: jobDTO({ id: 7 }),
        existing: jobDTO({ id: 7, companyName: 'Acme', role: 'Engineer', startedAt: '2023-07-01T00:00:00.000Z', endedAt: null, isEnded: false }),
        prefill: [['companyName', 'Acme'], ['role', 'Engineer'], ['startedAt', '2023-07-01'], ['endedAt', '']],
        edit: ['role', 'Staff'],
        editBody: { companyName: 'Acme', role: 'Staff', startedAt: '2023-07-01', endedAt: null, isEnded: false, isPublic: true },
        savedEdit: 'Staff',
    },
    {
        name: 'education', Page: AdminEducationFormPage, editProp: 'education', listHref: '/admin/education', base: '/education',
        newTitle: 'new-education', editTitle: 'edit-education',
        required: [['degreeName', 'MSc'], ['instituteName', 'MIT'], ['startedAt', '2020-09-01']],
        createBody: { degreeName: 'MSc', instituteName: 'MIT', instituteUrl: null, startedAt: '2020-09-01', endedAt: null, isCompleted: false, isPublic: true },
        saved: 'MSc', response: educationDTO({ id: 7 }),
        existing: educationDTO({ id: 7, degreeName: 'BSc', instituteName: 'Example University', instituteUrl: 'https://example.edu', startedAt: '2019-09-01T00:00:00.000Z', endedAt: '2023-06-30T00:00:00.000Z', isCompleted: true }),
        prefill: [['degreeName', 'BSc'], ['instituteName', 'Example University'], ['instituteUrl', 'https://example.edu'], ['startedAt', '2019-09-01'], ['endedAt', '2023-06-30']],
        edit: ['degreeName', 'BSc (Hons)'],
        editBody: { degreeName: 'BSc (Hons)', instituteName: 'Example University', instituteUrl: 'https://example.edu', startedAt: '2019-09-01', endedAt: '2023-06-30', isCompleted: true, isPublic: true },
        savedEdit: 'BSc (Hons)',
    },
    {
        name: 'certification', Page: AdminCertificationFormPage, editProp: 'certification', listHref: '/admin/certifications', base: '/certifications',
        newTitle: 'new-certification', editTitle: 'edit-certification',
        required: [['name', 'CKA'], ['url', 'https://x.dev/cka'], ['startDate', '2024-05-01']],
        createBody: { name: 'CKA', url: 'https://x.dev/cka', startDate: '2024-05-01', endDate: null, isPublished: true },
        saved: 'CKA', response: certificationDTO({ id: 7 }),
        existing: certificationDTO({ id: 7, name: 'AWS Certified Developer', url: 'https://example.com/cert', startDate: '2024-05-01T00:00:00.000Z', endDate: '2027-05-01T00:00:00.000Z' }),
        prefill: [['name', 'AWS Certified Developer'], ['url', 'https://example.com/cert'], ['startDate', '2024-05-01'], ['endDate', '2027-05-01']],
        edit: ['name', 'AWS Dev'],
        editBody: { name: 'AWS Dev', url: 'https://example.com/cert', startDate: '2024-05-01', endDate: '2027-05-01', isPublished: true },
        savedEdit: 'AWS Dev',
    },
    {
        name: 'social account', Page: AdminSocialFormPage, editProp: 'account', listHref: '/admin/social', base: '/social',
        newTitle: 'new-social-account', editTitle: 'edit-social-account',
        required: [['name', 'GitHub'], ['url', 'https://github.com/x']],
        createBody: { name: 'GitHub', url: 'https://github.com/x', imageUrl: null, isPublic: true },
        saved: 'GitHub', response: socialAccountDTO({ id: 7 }),
        existing: socialAccountDTO({ id: 7, name: 'GitHub', url: 'https://github.com/example', imageUrl: null }),
        prefill: [['name', 'GitHub'], ['url', 'https://github.com/example'], ['imageUrl', '']],
        edit: ['name', 'GitLab'],
        editBody: { name: 'GitLab', url: 'https://github.com/example', imageUrl: null, isPublic: true },
        savedEdit: 'GitLab',
    },
    {
        name: 'project', Page: AdminProjectFormPage, editProp: 'project', listHref: '/admin/projects', base: '/projects',
        newTitle: 'new-project', editTitle: 'edit-project',
        required: [['name', 'P'], ['description', 'D']],
        createBody: { name: 'P', description: 'D', techStack: [], isOpenSource: true, isPublished: false, repoUrl: null, liveUrl: null, thumbnailUrl: null },
        saved: 'P', response: projectDTO({ id: 7 }),
        existing: projectDTO({ id: 7, name: 'Portfolio', description: 'A personal portfolio site.', techStack: ['Next.js', 'NestJS'], repoUrl: 'https://github.com/example/portfolio', liveUrl: 'https://example.dev', thumbnailUrl: 'https://example.dev/thumb.png', isOpenSource: true, isPublished: true }),
        prefill: [['name', 'Portfolio'], ['description', 'A personal portfolio site.'], ['techStack', 'Next.js, NestJS'], ['repoUrl', 'https://github.com/example/portfolio'], ['liveUrl', 'https://example.dev'], ['thumbnailUrl', 'https://example.dev/thumb.png']],
        edit: ['name', 'Portfolio v2'],
        editBody: { name: 'Portfolio v2', description: 'A personal portfolio site.', techStack: ['Next.js', 'NestJS'], isOpenSource: true, isPublished: true, repoUrl: 'https://github.com/example/portfolio', liveUrl: 'https://example.dev', thumbnailUrl: 'https://example.dev/thumb.png' },
        savedEdit: 'Portfolio v2',
    },
    {
        name: 'blog post', Page: AdminBlogFormPage, editProp: 'post', listHref: '/admin/blog', base: '/blogs',
        newTitle: 'new-post', editTitle: 'edit-post',
        required: [['title', 'T'], ['content', 'C']],
        createBody: { title: 'T', content: 'C', excerpt: null, tags: [], isPublished: false },
        saved: 'T', response: blogDetailDTO({ id: 7 }),
        existing: blogDetailDTO({ id: 7, title: 'Hello World', content: 'Body text', excerpt: 'Short.', tags: ['react'], isPublished: true }),
        prefill: [['title', 'Hello World'], ['content', 'Body text'], ['excerpt', 'Short.'], ['tags', 'react']],
        edit: ['title', 'Hello again'],
        editBody: { title: 'Hello again', content: 'Body text', excerpt: 'Short.', tags: ['react'], isPublished: true },
        savedEdit: 'Hello again',
    },
]

beforeEach(() => {
    push.mockReset()
    show.mockReset()
    auth.accessToken = 'tok-admin'
})

describe.each(cases)('admin $name form', (c) => {
    function capture(method: 'post' | 'patch', path: string, respond = c.response, status = 200) {
        const seen: Array<{ body: unknown; auth: string | null }> = []
        server.use(http[method](`${API_URL}${path}`, async ({ request }) => {
            seen.push({ body: await request.json(), auth: request.headers.get('authorization') })
            return HttpResponse.json(respond as never, { status })
        }))
        return seen
    }
    const save = () => screen.getByRole('button', { name: /save/ })

    describe('create', () => {
        it('shows the "new" heading and keeps save disabled until the required fields are filled', async () => {
            render(<c.Page mode="create" />)
            expect(screen.getByRole('heading', { name: new RegExp(c.newTitle) })).toBeInTheDocument()
            expect(save()).toBeDisabled()

            for (const [label, value] of c.required) await fill(label, value)

            expect(save()).toBeEnabled()
        })

        it.each(c.required.map(([label]) => label))('stays disabled while "%s" is empty', async (missing) => {
            render(<c.Page mode="create" />)

            for (const [label, value] of c.required) if (label !== missing) await fill(label, value)

            expect(save()).toBeDisabled()
        })

        it('POSTs the payload (empty optionals become null) with the bearer token, then toasts and returns to the list', async () => {
            const seen = capture('post', c.base, c.response, 201)
            render(<c.Page mode="create" />)
            for (const [label, value] of c.required) await fill(label, value)

            await userEvent.click(save())

            await waitFor(() => expect(push).toHaveBeenCalledWith(c.listHref))
            expect(seen).toHaveLength(1)
            expect(seen[0].body).toEqual(c.createBody)
            expect(seen[0].auth).toBe('Bearer tok-admin')
            expect(show).toHaveBeenCalledWith(`Saved "${c.saved}".`, 'success')
        })

        it('shows "saving..." and blocks a second submit while the request is in flight', async () => {
            let release!: () => void
            const hits = vi.fn()
            server.use(http.post(`${API_URL}${c.base}`, async () => {
                hits()
                await new Promise<void>((r) => { release = r })
                return HttpResponse.json(c.response as never, { status: 201 })
            }))
            render(<c.Page mode="create" />)
            for (const [label, value] of c.required) await fill(label, value)

            await userEvent.click(save())

            const busy = await screen.findByRole('button', { name: 'saving...' })
            expect(busy).toBeDisabled()
            expect(hits).toHaveBeenCalledTimes(1)
            release()
            await waitFor(() => expect(push).toHaveBeenCalled())
        })

        it('shows an error and lets the user retry when the backend fails', async () => {
            server.use(http.post(`${API_URL}${c.base}`, () => new HttpResponse(null, { status: 500 })))
            render(<c.Page mode="create" />)
            for (const [label, value] of c.required) await fill(label, value)

            await userEvent.click(save())

            expect(await screen.findByText('Failed to save — check the backend is reachable.')).toBeInTheDocument()
            expect(push).not.toHaveBeenCalled()
            expect(show).not.toHaveBeenCalled()
            expect(save()).toBeEnabled()
        })

        it('clears the previous error when saving again', async () => {
            let calls = 0
            server.use(http.post(`${API_URL}${c.base}`, () =>
                ++calls === 1 ? new HttpResponse(null, { status: 500 }) : HttpResponse.json(c.response as never, { status: 201 })))
            render(<c.Page mode="create" />)
            for (const [label, value] of c.required) await fill(label, value)
            await userEvent.click(save())
            await screen.findByText('Failed to save — check the backend is reachable.')

            await userEvent.click(save())

            await waitFor(() => expect(push).toHaveBeenCalledWith(c.listHref))
            expect(screen.queryByText('Failed to save — check the backend is reachable.')).not.toBeInTheDocument()
        })

        it('sends nothing when there is no access token', async () => {
            auth.accessToken = null
            const hits = vi.fn()
            server.use(http.post(`${API_URL}${c.base}`, () => { hits(); return HttpResponse.json(c.response as never) }))
            render(<c.Page mode="create" />)
            for (const [label, value] of c.required) await fill(label, value)

            await userEvent.click(save())

            expect(hits).not.toHaveBeenCalled()
            expect(push).not.toHaveBeenCalled()
        })

        it('cancel returns to the list without saving', async () => {
            render(<c.Page mode="create" />)

            await userEvent.click(screen.getByRole('button', { name: 'cancel' }))

            expect(push).toHaveBeenCalledWith(c.listHref)
        })
    })

    describe('edit', () => {
        const props = () => ({ mode: 'edit', [c.editProp]: c.existing })

        it('uses the "edit" heading and is prefilled from the record', () => {
            render(<c.Page {...props()} />)

            expect(screen.getByRole('heading', { name: new RegExp(c.editTitle) })).toBeInTheDocument()
            for (const [label, value] of c.prefill) expect(control(label)).toHaveValue(value)
            expect(save()).toBeEnabled()
        })

        it('PATCHes /:id with the full payload including the edit, then toasts and returns to the list', async () => {
            const seen = capture('patch', `${c.base}/${c.existing.id}`)
            render(<c.Page {...props()} />)

            await fill(c.edit[0], c.edit[1])
            await userEvent.click(save())

            await waitFor(() => expect(push).toHaveBeenCalledWith(c.listHref))
            expect(seen[0].body).toEqual(c.editBody)
            expect(seen[0].auth).toBe('Bearer tok-admin')
            expect(show).toHaveBeenCalledWith(`Saved "${c.savedEdit}".`, 'success')
        })

        it('shows an error when the update fails', async () => {
            server.use(http.patch(`${API_URL}${c.base}/${c.existing.id}`, () => new HttpResponse(null, { status: 404 })))
            render(<c.Page {...props()} />)

            await userEvent.click(save())

            expect(await screen.findByText('Failed to save — check the backend is reachable.')).toBeInTheDocument()
            expect(push).not.toHaveBeenCalled()
        })
    })
})

describe('list-style fields', () => {
    it('project tech stack is split on commas, trimmed, and blanks are dropped', async () => {
        let body: { techStack?: string[] } = {}
        server.use(http.post(`${API_URL}/projects`, async ({ request }) => {
            body = (await request.json()) as typeof body
            return HttpResponse.json(projectDTO({ id: 1 }), { status: 201 })
        }))
        render(<AdminProjectFormPage mode="create" />)
        await fill('name', 'P')
        await fill('description', 'D')
        await fill('techStack', ' React ,TypeScript, ,, NestJS ')

        await userEvent.click(screen.getByRole('button', { name: /save/ }))

        await waitFor(() => expect(push).toHaveBeenCalled())
        expect(body.techStack).toEqual(['React', 'TypeScript', 'NestJS'])
    })

    it('blog tags are split on commas, trimmed, and blanks are dropped', async () => {
        let body: { tags?: string[] } = {}
        server.use(http.post(`${API_URL}/blogs`, async ({ request }) => {
            body = (await request.json()) as typeof body
            return HttpResponse.json(blogDetailDTO({ id: 1 }), { status: 201 })
        }))
        render(<AdminBlogFormPage mode="create" />)
        await fill('title', 'T')
        await fill('content', 'C')
        await fill('tags', 'a, b ,,  c')

        await userEvent.click(screen.getByRole('button', { name: /save/ }))

        await waitFor(() => expect(push).toHaveBeenCalled())
        expect(body.tags).toEqual(['a', 'b', 'c'])
    })

    it('checkboxes change the payload (published post, closed-source project, ended job)', async () => {
        const bodies: Record<string, unknown> = {}
        server.use(
            http.post(`${API_URL}/blogs`, async ({ request }) => { bodies.blog = await request.json(); return HttpResponse.json(blogDetailDTO(), { status: 201 }) }),
            http.post(`${API_URL}/projects`, async ({ request }) => { bodies.project = await request.json(); return HttpResponse.json(projectDTO(), { status: 201 }) }),
            http.post(`${API_URL}/jobs`, async ({ request }) => { bodies.job = await request.json(); return HttpResponse.json(jobDTO(), { status: 201 }) }),
        )

        const blog = render(<AdminBlogFormPage mode="create" />)
        await fill('title', 'T'); await fill('content', 'C')
        await userEvent.click(screen.getByLabelText('published'))
        await userEvent.click(screen.getByRole('button', { name: /save/ }))
        await waitFor(() => expect(bodies.blog).toBeDefined())
        blog.unmount()

        const project = render(<AdminProjectFormPage mode="create" />)
        await fill('name', 'P'); await fill('description', 'D')
        await userEvent.click(screen.getByLabelText('open source'))
        await userEvent.click(screen.getByLabelText('published'))
        await userEvent.click(screen.getByRole('button', { name: /save/ }))
        await waitFor(() => expect(bodies.project).toBeDefined())
        project.unmount()

        render(<AdminJobFormPage mode="create" />)
        await fill('companyName', 'C'); await fill('role', 'R'); await fill('startedAt', '2024-01-01'); await fill('endedAt', '2024-06-30')
        await userEvent.click(screen.getByLabelText('ended'))
        await userEvent.click(screen.getByLabelText('public'))
        await userEvent.click(screen.getByRole('button', { name: /save/ }))
        await waitFor(() => expect(bodies.job).toBeDefined())

        expect(bodies.blog).toMatchObject({ isPublished: true })
        expect(bodies.project).toMatchObject({ isOpenSource: false, isPublished: true })
        expect(bodies.job).toMatchObject({ isEnded: true, isPublic: false, endedAt: '2024-06-30' })
    })
})
