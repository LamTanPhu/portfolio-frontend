// @vitest-environment jsdom
import { act, fireEvent, render, renderHook, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { API_URL, RESUME_URL } from '@/lib/constants'
import { server } from '@/src/test/msw/server'
import { MetricCard } from './atoms/MetricCard'
import { NowPlaying } from './atoms/NowPlaying'
import { ResumeDownloadButton } from './atoms/ResumeDownloadButton'
import { AmbientAudioControl } from './atoms/AmbientAudioControl'
import { ToastProvider, useToast } from './context/ToastContext'
import { AmbientAudioProvider } from './context/AmbientAudioContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { useProjects } from './hooks/useProjects'
import { AdminExplorer } from './organisms/AdminExplorer'
import { AdminNav } from './organisms/AdminNav'
import { PageViewTracker } from './organisms/PageViewTracker'
import { ProjectViewTracker } from './organisms/ProjectViewTracker'
import { Sidebar } from './organisms/Sidebar'
import { StatusBar } from './organisms/StatusBar'
import { TabBar } from './organisms/TabBar'
import { AdminShell } from './templates/AdminShell'
import { VSCodeLayout } from './templates/VSCodeLayout'
import { projectSummaryDTO } from '@/src/test/fixtures'

const nav = vi.hoisted(() => ({ pathname: '/', replace: vi.fn(), push: vi.fn() }))
vi.mock('next/navigation', () => ({
    usePathname: () => nav.pathname,
    useRouter: () => ({ replace: nav.replace, push: nav.push }),
}))
const auth = vi.hoisted(() => ({ status: 'authenticated' as 'loading' | 'authenticated' | 'unauthenticated', logout: vi.fn() }))
vi.mock('./context/AuthContext', () => ({ useAuth: () => auth }))

beforeEach(() => {
    nav.pathname = '/'
    nav.replace.mockReset()
    nav.push.mockReset()
    auth.status = 'authenticated'
    auth.logout.mockReset()
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve())
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    localStorage.clear()
    server.use(
        http.get(`${API_URL}/spotify/now-playing`, () => HttpResponse.json({ isPlaying: false, title: '', artist: '', albumArt: '', songUrl: '' })),
        http.post(`${API_URL}/analytics/*`, () => HttpResponse.json({}, { status: 201 })),
    )
})

// ── Small atoms ─────────────────────────────────────────────────────────────
describe('MetricCard', () => {
    it('shows the label and value', () => {
        render(<MetricCard label="views" value={1234} />)

        expect(screen.getByText('views')).toBeInTheDocument()
        expect(screen.getByText('1234')).toBeInTheDocument()
    })

    it.each([['teal', 'accent-teal'], ['amber', 'accent-amber'], ['default', 'text-primary']] as const)('accent "%s" colours the value', (accent, cls) => {
        render(<MetricCard label="x" value="v" accent={accent} />)

        expect(screen.getByText('v').className).toContain(cls)
    })

    it('uses the default accent when none is given and accepts extra classes', () => {
        const { container } = render(<MetricCard label="x" value="v" className="custom" />)

        expect(screen.getByText('v').className).toContain('text-primary')
        expect(container.firstElementChild).toHaveClass('custom')
    })
})

describe('ResumeDownloadButton', () => {
    it('is a download link to the configured resume URL, opening safely in a new tab', () => {
        render(<ResumeDownloadButton />)

        const link = screen.getByRole('link', { name: /resume\.pdf/ })
        expect(link).toHaveAttribute('href', RESUME_URL)
        expect(link).toHaveAttribute('download')
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('has an "inline" and a "button" look with different labels', () => {
        const { unmount } = render(<ResumeDownloadButton />)
        expect(screen.getByText(/resume\.pdf/)).toBeInTheDocument()
        unmount()

        render(<ResumeDownloadButton variant="button" className="extra" />)
        expect(screen.getByRole('link', { name: /resume$/ })).toHaveClass('extra')
        expect(screen.queryByText(/resume\.pdf/)).not.toBeInTheDocument()
    })

    it('records a download when clicked', async () => {
        const hits = vi.fn()
        server.use(http.post(`${API_URL}/analytics/resume-download`, () => { hits(); return HttpResponse.json({}, { status: 201 }) }))
        render(<ResumeDownloadButton />)

        fireEvent.click(screen.getByRole('link'))

        await waitFor(() => expect(hits).toHaveBeenCalledTimes(1))
    })
})

describe('NowPlaying', () => {
    it('says "Not playing" when nothing is playing', async () => {
        render(<NowPlaying />)

        expect(await screen.findByText(/Not playing/)).toBeInTheDocument()
    })

    it('links to the song with title and artist when something is playing', async () => {
        server.use(http.get(`${API_URL}/spotify/now-playing`, () => HttpResponse.json({ isPlaying: true, title: 'Song', artist: 'Band', albumArt: 'a', songUrl: 'https://s.example/1' })))
        render(<NowPlaying />)

        const link = await screen.findByRole('link', { name: /Song — Band/ })
        expect(link).toHaveAttribute('href', 'https://s.example/1')
        expect(link).toHaveAttribute('target', '_blank')
    })
})

describe('trackers', () => {
    it('PageViewTracker records the current route once, and again when the route changes', async () => {
        const routes: string[] = []
        server.use(http.post(`${API_URL}/analytics/page-view`, async ({ request }) => { routes.push(((await request.json()) as { route: string }).route); return HttpResponse.json({}, { status: 201 }) }))
        nav.pathname = '/blog'
        const { rerender, container } = render(<PageViewTracker />)
        expect(container).toBeEmptyDOMElement()
        await waitFor(() => expect(routes).toEqual(['/blog']))

        nav.pathname = '/projects'
        rerender(<PageViewTracker />)

        await waitFor(() => expect(routes).toEqual(['/blog', '/projects']))
    })

    it('ProjectViewTracker records one view per project id', async () => {
        const ids: string[] = []
        server.use(http.post(`${API_URL}/analytics/project-view/:id`, ({ params }) => { ids.push(String(params.id)); return HttpResponse.json({}, { status: 201 }) }))
        const { rerender } = render(<ProjectViewTracker projectId={3} />)
        await waitFor(() => expect(ids).toEqual(['3']))

        rerender(<ProjectViewTracker projectId={3} />)
        rerender(<ProjectViewTracker projectId={4} />)

        await waitFor(() => expect(ids).toEqual(['3', '4']))
    })
})

describe('ThemeContext', () => {
    it('provides the dark theme, with or without a provider', () => {
        expect(renderHook(() => useTheme()).result.current.theme).toBe('dark')
        const wrapper = ({ children }: { children: ReactNode }) => <ThemeProvider>{children}</ThemeProvider>

        expect(renderHook(() => useTheme(), { wrapper }).result.current.theme).toBe('dark')
    })
})

// ── Toasts ──────────────────────────────────────────────────────────────────
describe('ToastContext', () => {
    function Harness() {
        const toast = useToast()
        return (
            <>
                <button onClick={() => toast.show('Saved!')}>default</button>
                <button onClick={() => toast.show('Boom', 'error')}>error</button>
                <button onClick={() => toast.show('FYI', 'info')}>info</button>
            </>
        )
    }

    it('useToast throws a helpful error outside a provider', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})

        expect(() => renderHook(() => useToast())).toThrow('useToast must be used within a ToastProvider')
    })

    it('shows a toast with the message (success by default), and several can stack', () => {
        render(<ToastProvider><Harness /></ToastProvider>)

        fireEvent.click(screen.getByText('default'))
        fireEvent.click(screen.getByText('error'))
        fireEvent.click(screen.getByText('info'))

        expect(screen.getByText('Saved!')).toBeInTheDocument()
        expect(screen.getByText('Boom')).toBeInTheDocument()
        expect(screen.getByText('FYI')).toBeInTheDocument()
    })

    it('colours each type differently', () => {
        render(<ToastProvider><Harness /></ToastProvider>)
        fireEvent.click(screen.getByText('default')); fireEvent.click(screen.getByText('error')); fireEvent.click(screen.getByText('info'))

        expect(screen.getByText('Saved!').parentElement!.className).toContain('border-l-(--accent-teal)')
        expect(screen.getByText('Boom').parentElement!.className).toContain('border-l-red-500')
        expect(screen.getByText('FYI').parentElement!.className).toContain('border-l-(--accent-blue)')
    })

    it('removes each toast on its own after 3.5 seconds', () => {
        vi.useFakeTimers()
        try {
            render(<ToastProvider><Harness /></ToastProvider>)
            fireEvent.click(screen.getByText('default'))
            act(() => { vi.advanceTimersByTime(2000) })
            fireEvent.click(screen.getByText('error'))

            act(() => { vi.advanceTimersByTime(1499) })
            expect(screen.getByText('Saved!')).toBeInTheDocument()
            act(() => { vi.advanceTimersByTime(1) })
            expect(screen.queryByText('Saved!')).not.toBeInTheDocument()
            expect(screen.getByText('Boom')).toBeInTheDocument()
            act(() => { vi.advanceTimersByTime(2000) })
            expect(screen.queryByText('Boom')).not.toBeInTheDocument()
        } finally {
            vi.useRealTimers()
        }
    })
})

// ── Ambient audio control ───────────────────────────────────────────────────
describe('AmbientAudioControl', () => {
    const setup = () => render(<AmbientAudioProvider><AmbientAudioControl /></AmbientAudioProvider>)

    it('play/pause button toggles and its label follows the state', async () => {
        setup()
        expect(screen.getByRole('button', { name: 'Pause ambient audio' })).toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: 'Pause ambient audio' }))

        expect(screen.getByRole('button', { name: 'Play ambient audio' })).toBeInTheDocument()
    })

    it('mute button toggles and its label follows the state', async () => {
        setup()
        const before = screen.getByRole('button', { name: /(Mute|Unmute) ambient audio/ }).getAttribute('aria-label')

        await userEvent.click(screen.getByRole('button', { name: /(Mute|Unmute) ambient audio/ }))

        expect(screen.getByRole('button', { name: /(Mute|Unmute) ambient audio/ }).getAttribute('aria-label')).not.toBe(before)
    })

    it('the volume slider changes the volume and unmutes', async () => {
        setup()
        if (screen.queryByRole('button', { name: 'Mute ambient audio' })) await userEvent.click(screen.getByRole('button', { name: 'Mute ambient audio' }))
        expect(screen.getByRole('button', { name: 'Unmute ambient audio' })).toBeInTheDocument()

        fireEvent.change(screen.getByLabelText('Ambient audio volume'), { target: { value: '0.8' } })

        expect(screen.getByLabelText('Ambient audio volume')).toHaveValue('0.8')
        expect(screen.getByRole('button', { name: 'Mute ambient audio' })).toBeInTheDocument()
    })

    it('opens a track picker listing every track, highlights the current one and closes after choosing', async () => {
        setup()
        const picker = screen.getByRole('button', { name: 'Choose ambient track' })
        expect(picker).toHaveAttribute('aria-expanded', 'false')

        await userEvent.click(picker)

        expect(picker).toHaveAttribute('aria-expanded', 'true')
        expect(screen.getByRole('button', { name: 'Ambient 3' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Rain On Window' })).toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: 'Ambient 3' }))

        expect(picker).toHaveAttribute('aria-expanded', 'false')
        expect(picker).toHaveTextContent('Ambient 3')
    })

    it('closes the picker when clicking elsewhere, but not when clicking inside it', async () => {
        setup()
        const picker = screen.getByRole('button', { name: 'Choose ambient track' })
        await userEvent.click(picker)

        fireEvent.mouseDown(screen.getByRole('button', { name: 'Ambient 3' }))
        expect(picker).toHaveAttribute('aria-expanded', 'true')

        fireEvent.mouseDown(document.body)
        expect(picker).toHaveAttribute('aria-expanded', 'false')
    })

    it('renders harmlessly without a provider (error shells)', () => {
        render(<AmbientAudioControl />)

        expect(screen.getByRole('button', { name: 'Play ambient audio' })).toBeInTheDocument()
    })
})

// ── useProjects ─────────────────────────────────────────────────────────────
describe('useProjects', () => {
    it('loads projects from the API', async () => {
        server.use(http.get(`${API_URL}/projects`, () => HttpResponse.json([projectSummaryDTO({ id: 1, name: 'A' })])))

        const { result } = renderHook(() => useProjects())
        expect(result.current.loading).toBe(true)

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.projects).toMatchObject([{ id: 1, name: 'A' }])
        expect(result.current.error).toBeNull()
    })

    it('reports an error when the request cannot be made or parsed', async () => {
        server.use(http.get(`${API_URL}/projects`, () => HttpResponse.text('not json', { status: 200 })))

        const { result } = renderHook(() => useProjects())

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.error).toBe('Failed to load projects')
        expect(result.current.projects).toEqual([])
    })
})

// ── Navigation chrome ───────────────────────────────────────────────────────
describe('TabBar', () => {
    const tabs = [
        { id: 'hello', label: '_hello', href: '/' },
        { id: 'about', label: '_about-me', href: '/about' },
        { id: 'contact', label: '_contact-me', href: '/contact' },
    ]

    it('shows the owner name, a link per tab, and the resume button', () => {
        render(<TabBar tabs={tabs} activeId="about" ownerName="lam-tan-phu" />)

        expect(screen.getByText('lam-tan-phu')).toBeInTheDocument()
        expect(screen.getByTitle('_hello')).toHaveAttribute('href', '/')
        expect(screen.getByTitle('_about-me')).toHaveAttribute('href', '/about')
        expect(screen.getByRole('link', { name: /resume$/ })).toBeInTheDocument()
    })

    it('marks only the active tab, and puts the contact tab on the right after the resume button', () => {
        const { container } = render(<TabBar tabs={tabs} activeId="about" ownerName="x" />)

        expect(screen.getByText('_about-me')).toHaveClass('nav-tab--active')
        expect(screen.getByText('_hello')).not.toHaveClass('nav-tab--active')
        const order = [...container.querySelectorAll('a')].map((a) => a.getAttribute('title') ?? 'resume')
        expect(order.indexOf('_contact-me')).toBeGreaterThan(order.indexOf('Download resume (PDF)'))
    })
})

describe('Sidebar', () => {
    it('renders the owner and a tree: parents with chevrons, leaves with dots, children indented', () => {
        render(
            <Sidebar
                ownerName="lam-tan-phu"
                items={[
                    { label: 'contacts', href: '/c', children: [{ label: 'email', href: 'mailto:a@b.co', icon: '✉', meta: 'a@b.co' }] },
                    { label: 'bio', href: '/bio', dot: 'dot-teal', meta: 'short' },
                    { label: 'github', href: 'https://github.com/x', external: true },
                ]}
            />,
        )

        expect(screen.getByText('Explorer')).toBeInTheDocument()
        expect(screen.getByText('lam-tan-phu')).toBeInTheDocument()
        expect(screen.getByTitle('contacts').textContent).toContain('▾')
        expect(screen.getByTitle('bio').textContent).toContain('·')
        expect(screen.getByTitle('bio').querySelector('.sidebar-dot')).toHaveClass('dot-teal')
        expect(screen.getByTitle('email')).toHaveAttribute('href', 'mailto:a@b.co')
        expect(screen.getByText('✉')).toBeInTheDocument()
        expect(screen.getByText('a@b.co')).toBeInTheDocument() // child meta
        expect(screen.getByText('short')).toBeInTheDocument()  // parent meta
    })

    it('external items open in a new tab; internal ones do not', () => {
        render(<Sidebar ownerName="x" items={[{ label: 'out', href: 'https://x.dev', external: true }, { label: 'in', href: '/in' }, { label: 'p', href: '/p', children: [{ label: 'ext-child', href: 'https://y.dev', external: true, dot: 'dot-red' }] }]} />)

        expect(screen.getByTitle('out')).toHaveAttribute('target', '_blank')
        expect(screen.getByTitle('out')).toHaveAttribute('rel', 'noopener noreferrer')
        expect(screen.getByTitle('in')).not.toHaveAttribute('target')
        expect(screen.getByTitle('ext-child')).toHaveAttribute('target', '_blank')
        expect(screen.getByTitle('ext-child').querySelector('.sidebar-dot')).toHaveClass('dot-red')
    })
})

describe('StatusBar', () => {
    it('shows default X and LinkedIn icons and the default GitHub handle', () => {
        render(<StatusBar />)

        expect(screen.getByTitle('X')).toHaveAttribute('href', 'https://x.com')
        expect(screen.getByTitle('LinkedIn')).toHaveAttribute('href', 'https://linkedin.com')
        expect(screen.getByTitle('GitHub profile')).toHaveAttribute('href', 'https://github.com')
        expect(screen.getByText('@lam-tan-phu')).toBeInTheDocument()
    })

    it('shows custom socials: an image when there is a URL, otherwise the first letter', () => {
        render(<StatusBar socials={[{ label: 'Mastodon', href: 'https://m.example', imageUrl: 'https://m.example/i.png' }, { label: 'bluesky', href: 'https://b.example', imageUrl: null }]} githubHandle="@me" githubUrl="https://github.com/me" />)

        expect(screen.getByTitle('Mastodon').querySelector('img')).toHaveAttribute('src', 'https://m.example/i.png')
        expect(screen.getByTitle('bluesky')).toHaveTextContent('B')
        expect(screen.getByText('@me')).toBeInTheDocument()
        expect(screen.getByTitle('GitHub profile')).toHaveAttribute('href', 'https://github.com/me')
        expect(screen.queryByTitle('X')).not.toBeInTheDocument()
    })

    it('opens every social link in a new tab and includes the now-playing and audio widgets', async () => {
        render(<StatusBar />)

        expect(screen.getByTitle('X')).toHaveAttribute('target', '_blank')
        expect(await screen.findByText(/Not playing/)).toBeInTheDocument()
        expect(screen.getAllByRole('button', { name: /ambient audio/ }).length).toBeGreaterThan(0)
    })
})

describe('VSCodeLayout', () => {
    it('composes tab bar, content and status bar, highlighting the active tab', () => {
        render(<VSCodeLayout activeTab="blog"><p>page content</p></VSCodeLayout>)

        expect(screen.getByText('page content')).toBeInTheDocument()
        expect(screen.getByText('_blog')).toHaveClass('nav-tab--active')
        expect(screen.getAllByText('lam-tan-phu').length).toBeGreaterThan(0) // tab bar owner name
        expect(screen.getByTitle('GitHub profile')).toBeInTheDocument()
    })

    it('shows the sidebar by default (with items) and hides it when asked', () => {
        const { unmount } = render(<VSCodeLayout activeTab="contact" sidebarItems={[{ label: 'email', href: 'mailto:a@b.co' }]}><p>c</p></VSCodeLayout>)
        expect(screen.getByText('Explorer')).toBeInTheDocument()
        expect(screen.getByTitle('email')).toBeInTheDocument()
        unmount()

        render(<VSCodeLayout activeTab="hello" showSidebar={false}><p>c</p></VSCodeLayout>)
        expect(screen.queryByText('Explorer')).not.toBeInTheDocument()
    })

    it('forwards custom socials to the status bar, and uses its defaults otherwise', () => {
        const { unmount } = render(<VSCodeLayout activeTab="hello" socials={[{ label: 'Custom', href: 'https://c.example' }]}><p>c</p></VSCodeLayout>)
        expect(screen.getByTitle('Custom')).toBeInTheDocument()
        expect(screen.queryByTitle('X')).not.toBeInTheDocument()
        unmount()

        render(<VSCodeLayout activeTab="hello"><p>c</p></VSCodeLayout>)
        expect(screen.getByTitle('X')).toBeInTheDocument()
    })
})

// ── Admin chrome ────────────────────────────────────────────────────────────
describe('AdminNav', () => {
    it('links to the dashboard and the public site, and logs out on click', async () => {
        const onLogout = vi.fn()
        render(<AdminNav onLogout={onLogout} />)

        expect(screen.getByRole('link', { name: /admin\.workspace/ })).toHaveAttribute('href', '/admin')
        expect(screen.getByRole('link', { name: /site/ })).toHaveAttribute('href', '/')
        await userEvent.click(screen.getByRole('button', { name: /logout/ }))

        expect(onLogout).toHaveBeenCalledTimes(1)
    })
})

describe('AdminExplorer', () => {
    const link = (title: string) => screen.getByTitle(title)

    it('lists every admin section with its route', () => {
        render(<AdminExplorer />)

        const expected: Record<string, string> = {
            dashboard: '/admin', 'blog.ts': '/admin/blog', 'projects.ts': '/admin/projects', 'skills.ts': '/admin/skills',
            'education.ts': '/admin/education', 'jobs.ts': '/admin/jobs', 'certifications.ts': '/admin/certifications',
            'social.ts': '/admin/social', 'inbox.ts': '/admin/contact', 'analytics.ts': '/admin/analytics',
            'audit.log': '/admin/audit', 'profile.ts': '/admin/profile',
        }
        for (const [title, href] of Object.entries(expected)) expect(link(title)).toHaveAttribute('href', href)
    })

    it('highlights the current section, including its sub-pages', () => {
        nav.pathname = '/admin/blog/my-post/edit'
        render(<AdminExplorer />)

        expect(link('blog.ts').className).toContain('border-(--accent-teal)')
        expect(link('projects.ts').className).toContain('border-transparent')
        expect(link('dashboard').className).toContain('border-transparent') // "/admin" only matches exactly
    })

    it('highlights the dashboard only on /admin itself', () => {
        nav.pathname = '/admin'
        render(<AdminExplorer />)

        expect(link('dashboard').className).toContain('border-(--accent-teal)')
    })

    it('does not treat a longer sibling path as a sub-page (/admin/blogger ≠ /admin/blog)', () => {
        nav.pathname = '/admin/blogger'
        render(<AdminExplorer />)

        expect(link('blog.ts').className).toContain('border-transparent')
    })

    it('collapses and expands the about-content folder', async () => {
        render(<AdminExplorer />)
        expect(screen.getByTitle('skills.ts')).toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: /about-content/ }))
        expect(screen.queryByTitle('skills.ts')).not.toBeInTheDocument()
        expect(screen.getByTitle('inbox.ts')).toBeInTheDocument() // other groups stay

        await userEvent.click(screen.getByRole('button', { name: /about-content/ }))
        expect(screen.getByTitle('skills.ts')).toBeInTheDocument()
    })

    it('emphasises the folder name when a file inside it is active', () => {
        nav.pathname = '/admin/skills'
        render(<AdminExplorer />)

        expect(screen.getByRole('button', { name: /about-content/ }).className).toContain('text-(--text-primary)')
    })
})

describe('AdminShell', () => {
    it('shows a loading indicator while the session is being checked, and does not render the children', () => {
        auth.status = 'loading'
        render(<AdminShell><p>secret</p></AdminShell>)

        expect(screen.getByText('loading')).toBeInTheDocument()
        expect(screen.queryByText('secret')).not.toBeInTheDocument()
        expect(nav.replace).not.toHaveBeenCalled()
    })

    it('redirects visitors without a session to the login page and renders nothing private', () => {
        auth.status = 'unauthenticated'
        render(<AdminShell><p>secret</p></AdminShell>)

        expect(nav.replace).toHaveBeenCalledWith('/admin/login')
        expect(screen.queryByText('secret')).not.toBeInTheDocument()
    })

    it('renders the workspace (nav, explorer, children, toasts) for an authenticated admin', () => {
        render(<AdminShell><p>secret</p></AdminShell>)

        expect(screen.getByText('secret')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /admin\.workspace/ })).toBeInTheDocument()
        expect(screen.getByTitle('dashboard')).toBeInTheDocument()
        expect(nav.replace).not.toHaveBeenCalled()
    })

    it('logout signs out and then returns to the login page', async () => {
        auth.logout.mockResolvedValue(undefined)
        render(<AdminShell><p>x</p></AdminShell>)

        await userEvent.click(screen.getByRole('button', { name: /logout/ }))

        expect(auth.logout).toHaveBeenCalledTimes(1)
        await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/admin/login'))
    })

    it('provides toasts to its children', async () => {
        function Child() {
            const toast = useToast()
            return <button onClick={() => toast.show('Hello from child')}>go</button>
        }
        render(<AdminShell><Child /></AdminShell>)

        await userEvent.click(screen.getByRole('button', { name: 'go' }))

        expect(within(document.body).getByText('Hello from child')).toBeInTheDocument()
    })
})
