// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { API_URL } from '@/lib/constants'
import { blogDetailDTO, educationDTO, socialAccountDTO } from '@/src/test/fixtures'
import { server } from '@/src/test/msw/server'
import { FormField } from './atoms/FormField'
import { MethodPill } from './atoms/MethodPill'
import { Select } from './atoms/Select'
import { ConfirmDialog } from './molecules/ConfirmDialog'
import { Sidebar } from './organisms/Sidebar'
import { AdminBlogFormPage } from './pages/adminPages/AdminBlogFormPage'
import { AdminCertificationFormPage } from './pages/adminPages/AdminCertificationFormPage'
import { AdminDashboardPage } from './pages/adminPages/AdminDashboardPage'
import { AdminEducationFormPage } from './pages/adminPages/AdminEducationFormPage'
import { AdminSocialFormPage } from './pages/adminPages/AdminSocialFormPage'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }))
vi.mock('./context/AuthContext', () => ({ useAuth: () => ({ accessToken: 'tok' }) }))
vi.mock('./context/ToastContext', () => ({ useToast: () => ({ show: vi.fn() }) }))

describe('Select', () => {
    const options = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }]

    it('shows the label and options, reflects the value, and reports changes', async () => {
        const onChange = vi.fn()
        render(<Select label="category" value="a" onChange={onChange} options={options} />)

        expect(screen.getByText('_category:')).toBeInTheDocument()
        expect(screen.getByRole('combobox')).toHaveValue('a')
        await userEvent.selectOptions(screen.getByRole('combobox'), 'b')

        expect(onChange).toHaveBeenCalledWith('b')
    })

    it('shows an error message and a red border when there is an error, and neither otherwise', () => {
        const { rerender } = render(<Select label="c" value="a" onChange={() => {}} options={options} error="Pick one" />)
        expect(screen.getByText('Pick one')).toBeInTheDocument()
        expect(screen.getByRole('combobox').className).toContain('border-red-500')

        rerender(<Select label="c" value="a" onChange={() => {}} options={options} />)
        expect(screen.queryByText('Pick one')).not.toBeInTheDocument()
        expect(screen.getByRole('combobox').className).not.toContain('border-red-500')
    })
})

describe('FormField', () => {
    it('an input reports changes and uses the given placeholder and type', () => {
        const onChange = vi.fn()
        render(<FormField label="when" type="date" value="" onChange={onChange} placeholder="pick" />)

        const input = screen.getByPlaceholderText('pick')
        expect(input).toHaveAttribute('type', 'date')
        fireEvent.change(input, { target: { value: '2025-01-01' } })
        expect(onChange).toHaveBeenCalledWith('2025-01-01')
    })

    it('shows an error message and the ⊘ icon for a single-line input', () => {
        render(<FormField label="name" value="" onChange={() => {}} error="Name is required" />)

        expect(screen.getByText('Name is required')).toBeInTheDocument()
        expect(screen.getByText('⊘')).toBeInTheDocument()
    })

    it('a textarea gets a default placeholder, default row count and no ⊘ icon, even with an error', () => {
        render(<FormField as="textarea" label="notes" value="" onChange={() => {}} error="Too short" />)

        const area = screen.getByPlaceholderText('your notes here ...')
        expect(area).toHaveAttribute('rows', '5')
        expect(screen.getByText('Too short')).toBeInTheDocument()
        expect(screen.queryByText('⊘')).not.toBeInTheDocument()
    })

    it('a textarea honours explicit rows and placeholder', () => {
        render(<FormField as="textarea" label="notes" rows={9} placeholder="write here" value="" onChange={() => {}} />)

        expect(screen.getByPlaceholderText('write here')).toHaveAttribute('rows', '9')
    })
})

describe('label association (accessible names)', () => {
    it('FormField: the input can be found by its label text and typed into', async () => {
        const onChange = vi.fn()
        render(<FormField label="name" value="" onChange={onChange} />)

        await userEvent.type(screen.getByLabelText('_name:'), 'A')

        expect(onChange).toHaveBeenCalledWith('A')
    })

    it('FormField: textareas are labelled too, and two fields never share an id', () => {
        render(<><FormField label="one" value="" onChange={() => {}} /><FormField as="textarea" label="two" value="" onChange={() => {}} /></>)

        const one = screen.getByLabelText('_one:'); const two = screen.getByLabelText('_two:')
        expect(two.tagName).toBe('TEXTAREA')
        expect(one.id).not.toBe(two.id)
    })

    it('FormField: an error marks the control invalid and links the message to it', () => {
        render(<FormField label="email" value="" onChange={() => {}} error="Wrong email address" />)

        const input = screen.getByLabelText('_email:')
        expect(input).toHaveAttribute('aria-invalid', 'true')
        expect(input).toHaveAccessibleDescription('Wrong email address')
    })

    it('FormField: without an error there is no aria-invalid or description', () => {
        render(<FormField label="email" value="" onChange={() => {}} />)

        const input = screen.getByLabelText('_email:')
        expect(input).not.toHaveAttribute('aria-invalid')
        expect(input).not.toHaveAttribute('aria-describedby')
    })

    it('Select: the dropdown is labelled and an error is announced', () => {
        render(<Select label="category" value="a" onChange={() => {}} options={[{ value: 'a', label: 'Alpha' }]} error="Pick one" />)

        const select = screen.getByLabelText('_category:')
        expect(select.tagName).toBe('SELECT')
        expect(select).toHaveAttribute('aria-invalid', 'true')
        expect(select).toHaveAccessibleDescription('Pick one')
    })
})

describe('MethodPill', () => {
    it.each([['GET', 'accent-blue'], ['POST', 'accent-teal'], ['PATCH', 'amber'], ['PUT', 'amber'], ['DELETE', 'red']])('colours %s', (method, cls) => {
        render(<MethodPill method={method} />)

        expect(screen.getByText(method).className).toContain(cls)
    })

    it('falls back to a muted style for a method it does not know', () => {
        render(<MethodPill method="OPTIONS" />)

        expect(screen.getByText('OPTIONS').className).toContain('text-(--text-muted)')
    })
})

describe('ConfirmDialog', () => {
    it('uses "delete" as the default confirm label and a custom one when given', () => {
        const { rerender } = render(<ConfirmDialog open title="T" message="M" onConfirm={() => {}} onCancel={() => {}} />)
        expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument()

        rerender(<ConfirmDialog open title="T" message="M" confirmLabel="remove it" onConfirm={() => {}} onCancel={() => {}} />)
        expect(screen.getByRole('button', { name: 'remove it' })).toBeInTheDocument()
    })

    it('renders nothing when closed, and focuses "cancel" when opened', () => {
        const { rerender, container } = render(<ConfirmDialog open={false} title="T" message="M" onConfirm={() => {}} onCancel={() => {}} />)
        expect(container).toBeEmptyDOMElement()

        rerender(<ConfirmDialog open title="T" message="M" onConfirm={() => {}} onCancel={() => {}} />)
        expect(screen.getByRole('button', { name: 'cancel' })).toHaveFocus()
    })

    it('only Escape cancels — other keys do nothing; clicking the backdrop cancels, clicking the dialog does not', async () => {
        const onCancel = vi.fn()
        render(<ConfirmDialog open title="T" message="M" onConfirm={() => {}} onCancel={onCancel} />)

        await userEvent.keyboard('a{Tab}{ArrowDown}')
        expect(onCancel).not.toHaveBeenCalled()

        await userEvent.click(screen.getByRole('alertdialog'))
        expect(onCancel).not.toHaveBeenCalled()

        await userEvent.click(screen.getByRole('alertdialog').parentElement!)
        expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it('confirm calls onConfirm', async () => {
        const onConfirm = vi.fn()
        render(<ConfirmDialog open title="T" message="M" onConfirm={onConfirm} onCancel={() => {}} />)

        await userEvent.click(screen.getByRole('button', { name: 'delete' }))

        expect(onConfirm).toHaveBeenCalledTimes(1)
    })
})

describe('Sidebar parents with icons', () => {
    it('shows an icon on a parent row too', () => {
        render(<Sidebar ownerName="x" items={[{ label: 'inbox', href: '/i', icon: '📥' }]} />)

        expect(screen.getByText('📥')).toBeInTheDocument()
    })
})

describe('AdminDashboardPage', () => {
    it('shows a card for every admin section, linking to it with a one-line description', () => {
        render(<AdminDashboardPage />)

        const expected: Record<string, string> = {
            blog: '/admin/blog', projects: '/admin/projects', skills: '/admin/skills', education: '/admin/education',
            jobs: '/admin/jobs', certifications: '/admin/certifications', social: '/admin/social',
            contact: '/admin/contact', analytics: '/admin/analytics', audit: '/admin/audit', profile: '/admin/profile',
        }
        const links = screen.getAllByRole('link')
        expect(links).toHaveLength(11)
        for (const [label, href] of Object.entries(expected)) {
            expect(screen.getByText(label).closest('a')).toHaveAttribute('href', href)
        }
        expect(screen.getByText('posts — draft & published')).toBeInTheDocument()
    })
})

describe('"public" warning on the other forms', () => {
    it.each([
        ['social account', () => <AdminSocialFormPage mode="create" />, 'public'],
        ['education', () => <AdminEducationFormPage mode="create" />, 'public'],
        ['certification', () => <AdminCertificationFormPage mode="create" />, 'published'],
    ])('%s: unticking the visibility checkbox shows the warning, ticking it again hides it', async (_n, make, label) => {
        render(make())
        expect(screen.queryByText(/hides the item from every admin list/)).not.toBeInTheDocument()

        await userEvent.click(screen.getByLabelText(label))
        expect(screen.getByText(/hides the item from every admin list/)).toBeInTheDocument()

        await userEvent.click(screen.getByLabelText(label))
        expect(screen.queryByText(/hides the item from every admin list/)).not.toBeInTheDocument()
    })

    it('an education record can be edited without an institute URL, sending null', async () => {
        let body: Record<string, unknown> = {}
        server.use(http.patch(`${API_URL}/education/3`, async ({ request }) => { body = (await request.json()) as typeof body; return HttpResponse.json(educationDTO({ id: 3 })) }))
        render(<AdminEducationFormPage mode="edit" education={educationDTO({ id: 3, instituteUrl: null })} />)

        await userEvent.click(screen.getByRole('button', { name: /save/ }))

        await vi.waitFor(() => expect(body.instituteUrl).toBeNull())
    })

    it('a social account edit sends a null image when it is cleared', async () => {
        let body: Record<string, unknown> = {}
        server.use(http.patch(`${API_URL}/social/4`, async ({ request }) => { body = (await request.json()) as typeof body; return HttpResponse.json(socialAccountDTO({ id: 4 })) }))
        render(<AdminSocialFormPage mode="edit" account={socialAccountDTO({ id: 4, imageUrl: null })} />)

        await userEvent.click(screen.getByRole('button', { name: /save/ }))

        await vi.waitFor(() => expect(body.imageUrl).toBeNull())
    })

    it('a blog post edit with no excerpt sends a null excerpt', async () => {
        let body: Record<string, unknown> = {}
        server.use(http.patch(`${API_URL}/blogs/5`, async ({ request }) => { body = (await request.json()) as typeof body; return HttpResponse.json(blogDetailDTO({ id: 5 })) }))
        render(<AdminBlogFormPage mode="edit" post={blogDetailDTO({ id: 5, excerpt: null })} />)

        await userEvent.click(screen.getByRole('button', { name: /save/ }))

        await vi.waitFor(() => expect(body.excerpt).toBeNull())
    })
})
