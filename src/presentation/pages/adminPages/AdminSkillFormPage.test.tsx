// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { API_URL } from '@/lib/constants'
import { skillDTO } from '@/src/test/fixtures'
import { server } from '@/src/test/msw/server'
import { AdminSkillFormPage } from './AdminSkillFormPage'

const push = vi.hoisted(() => vi.fn())
const show = vi.hoisted(() => vi.fn())
const auth = vi.hoisted(() => ({ accessToken: 'tok-admin' as string | null }))

vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace: vi.fn() }) }))
vi.mock('../../context/AuthContext', () => ({ useAuth: () => auth }))
vi.mock('../../context/ToastContext', () => ({ useToast: () => ({ show }) }))

// Real command → repository → mapper → httpClient chain, with only the network faked.
const nameInput = () => screen.getByPlaceholderText('React')
const saveButton = () => screen.getByRole('button', { name: /save/ })

beforeEach(() => {
    push.mockReset()
    show.mockReset()
    auth.accessToken = 'tok-admin'
})

describe('AdminSkillFormPage — create', () => {
    it('shows the "new-skill" heading and keeps save disabled until a name is typed', async () => {
        render(<AdminSkillFormPage mode="create" />)

        expect(screen.getByRole('heading', { name: /new-skill/ })).toBeInTheDocument()
        expect(saveButton()).toBeDisabled()

        await userEvent.type(nameInput(), 'Go')

        expect(saveButton()).toBeEnabled()
    })

    it('POSTs defaults (category "other", public, null image) with the bearer token, then toasts and returns to the list', async () => {
        let body: unknown
        let auth_: string | null = null
        server.use(
            http.post(`${API_URL}/skills`, async ({ request }) => {
                body = await request.json()
                auth_ = request.headers.get('authorization')
                return HttpResponse.json(skillDTO({ id: 5, name: 'Go', category: 'other' }), { status: 201 })
            }),
        )
        render(<AdminSkillFormPage mode="create" />)

        await userEvent.type(nameInput(), 'Go')
        await userEvent.click(saveButton())

        await waitFor(() => expect(push).toHaveBeenCalledWith('/admin/skills'))
        expect(body).toEqual({ name: 'Go', imageUrl: null, category: 'other', isPublic: true })
        expect(auth_).toBe('Bearer tok-admin')
        expect(show).toHaveBeenCalledWith('Saved "Go".', 'success')
    })

    it('sends the chosen category and image URL', async () => {
        let body: unknown
        server.use(
            http.post(`${API_URL}/skills`, async ({ request }) => {
                body = await request.json()
                return HttpResponse.json(skillDTO({ category: 'database' }), { status: 201 })
            }),
        )
        render(<AdminSkillFormPage mode="create" />)

        await userEvent.type(nameInput(), 'Postgres')
        await userEvent.type(screen.getByPlaceholderText(/optional icon URL/), 'https://x.dev/pg.svg')
        await userEvent.selectOptions(screen.getByRole('combobox'), 'database')
        await userEvent.click(saveButton())

        await waitFor(() => expect(push).toHaveBeenCalled())
        expect(body).toMatchObject({ name: 'Postgres', imageUrl: 'https://x.dev/pg.svg', category: 'database' })
    })

    it('warns when "public" is switched off, and sends isPublic: false', async () => {
        let body: unknown
        server.use(
            http.post(`${API_URL}/skills`, async ({ request }) => {
                body = await request.json()
                return HttpResponse.json(skillDTO(), { status: 201 })
            }),
        )
        render(<AdminSkillFormPage mode="create" />)
        expect(screen.queryByText(/hides the item from every admin list/)).not.toBeInTheDocument()

        await userEvent.click(screen.getByLabelText('public'))
        expect(screen.getByText(/hides the item from every admin list/)).toBeInTheDocument()

        await userEvent.type(nameInput(), 'Hidden')
        await userEvent.click(saveButton())
        await waitFor(() => expect(push).toHaveBeenCalled())
        expect(body).toMatchObject({ isPublic: false })
    })

    it('shows an error and lets the user retry when the backend fails', async () => {
        server.use(http.post(`${API_URL}/skills`, () => new HttpResponse(null, { status: 500 })))
        render(<AdminSkillFormPage mode="create" />)

        await userEvent.type(nameInput(), 'Go')
        await userEvent.click(saveButton())

        expect(await screen.findByText('Failed to save — check the backend is reachable.')).toBeInTheDocument()
        expect(push).not.toHaveBeenCalled()
        expect(show).not.toHaveBeenCalled()
        expect(saveButton()).toBeEnabled()
    })

    it('makes no request when there is no access token', async () => {
        auth.accessToken = null
        const hits = vi.fn()
        server.use(http.post(`${API_URL}/skills`, () => { hits(); return HttpResponse.json(skillDTO()) }))
        render(<AdminSkillFormPage mode="create" />)

        await userEvent.type(nameInput(), 'Go')
        await userEvent.click(saveButton())

        expect(hits).not.toHaveBeenCalled()
        expect(push).not.toHaveBeenCalled()
    })

    it('cancel goes back to the list without saving', async () => {
        render(<AdminSkillFormPage mode="create" />)

        await userEvent.click(screen.getByRole('button', { name: 'cancel' }))

        expect(push).toHaveBeenCalledWith('/admin/skills')
    })
})

describe('AdminSkillFormPage — edit', () => {
    const existing = skillDTO({ id: 5, name: 'TypeScript', imageUrl: 'https://x.dev/ts.svg', category: 'frontend' })

    it('is prefilled from the skill and shows the "edit-skill" heading', () => {
        render(<AdminSkillFormPage mode="edit" skill={existing} />)

        expect(screen.getByRole('heading', { name: /edit-skill/ })).toBeInTheDocument()
        expect(nameInput()).toHaveValue('TypeScript')
        expect(screen.getByPlaceholderText(/optional icon URL/)).toHaveValue('https://x.dev/ts.svg')
        expect(screen.getByRole('combobox')).toHaveValue('frontend')
    })

    it('PATCHes /skills/:id with the edited values', async () => {
        let url = ''
        let body: unknown
        server.use(
            http.patch(`${API_URL}/skills/:id`, async ({ request }) => {
                url = new URL(request.url).pathname
                body = await request.json()
                return HttpResponse.json(skillDTO({ id: 5, name: 'TypeScript 5' }))
            }),
        )
        render(<AdminSkillFormPage mode="edit" skill={existing} />)

        await userEvent.clear(nameInput())
        await userEvent.type(nameInput(), 'TypeScript 5')
        await userEvent.click(saveButton())

        await waitFor(() => expect(push).toHaveBeenCalledWith('/admin/skills'))
        expect(url).toMatch(/\/skills\/5$/)
        expect(body).toMatchObject({ name: 'TypeScript 5', category: 'frontend' })
        expect(show).toHaveBeenCalledWith('Saved "TypeScript 5".', 'success')
    })

    it('sends a cleared image URL as null, not an empty string', async () => {
        let body: unknown
        server.use(
            http.patch(`${API_URL}/skills/:id`, async ({ request }) => {
                body = await request.json()
                return HttpResponse.json(skillDTO({ id: 5 }))
            }),
        )
        render(<AdminSkillFormPage mode="edit" skill={existing} />)

        await userEvent.clear(screen.getByPlaceholderText(/optional icon URL/))
        await userEvent.click(saveButton())

        await waitFor(() => expect(push).toHaveBeenCalled())
        expect(body).toMatchObject({ imageUrl: null })
    })
})
