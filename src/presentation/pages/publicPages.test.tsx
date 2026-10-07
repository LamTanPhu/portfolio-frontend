// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { API_URL, SITE_URL } from '@/lib/constants'
import {
    blogDetailDTO, certificationDTO, educationDTO, jobDTO, projectDTO,
    projectSummaryDTO, skillDTO, socialAccountDTO,
} from '@/src/test/fixtures'
import { server } from '@/src/test/msw/server'
import { AboutPage } from './AboutPage'
import { BlogPostPage } from './BlogPostPage'
import { HomePage } from './HomePage'
import { ProjectDetailPage } from './ProjectDetailPage'
import { ProjectsPage } from './ProjectsPage'

// The page chrome is tested on its own; here it is a stand-in that exposes the
// props each page hands to it.
vi.mock('../templates/VSCodeLayout', () => ({
    VSCodeLayout: ({ children, activeTab, showSidebar, socials }: { children: ReactNode; activeTab: string; showSidebar?: boolean; socials?: unknown }) => (
        <div data-testid="layout" data-active={activeTab} data-sidebar={String(showSidebar)} data-socials={JSON.stringify(socials ?? null)}>
            {children}
        </div>
    ),
}))
vi.mock('../organisms/SnakeGame', () => ({ SnakeGame: () => <div data-testid="snake" /> }))

const layout = () => screen.getByTestId('layout')

// ── HomePage ────────────────────────────────────────────────────────────────
describe('HomePage', () => {
    it('introduces the owner and renders inside the "hello" tab without a sidebar', () => {
        render(<HomePage socialAccounts={[]} />)

        expect(screen.getByRole('heading', { level: 1, name: 'Lam Tan Phu' })).toBeInTheDocument()
        expect(screen.getByText('developer.ts')).toBeInTheDocument()
        expect(layout().dataset.active).toBe('hello')
        expect(layout().dataset.sidebar).toBe('false')
        expect(screen.getByTestId('snake')).toBeInTheDocument()
    })

    it('links to GitHub in a new tab without leaking the opener', () => {
        render(<HomePage socialAccounts={[]} />)

        const link = screen.getByRole('link', { name: /github\.com\/lam-tan-phu/ })
        expect(link).toHaveAttribute('href', 'https://github.com/lam-tan-phu')
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('passes the API social accounts to the status bar, mapped to label/href/imageUrl', () => {
        render(<HomePage socialAccounts={[socialAccountDTO({ name: 'GitHub', url: 'https://github.com/x', imageUrl: 'g.png' })]} />)

        expect(JSON.parse(layout().dataset.socials!)).toEqual([{ label: 'GitHub', href: 'https://github.com/x', imageUrl: 'g.png' }])
    })

    it('passes nothing when there are no accounts, so the status bar uses its own defaults', () => {
        render(<HomePage socialAccounts={[]} />)

        expect(JSON.parse(layout().dataset.socials!)).toBeNull()
    })
})

// ── AboutPage (+ ActivityBar + AboutSidebar) ────────────────────────────────
describe('AboutPage', () => {
    const props = () => ({
        skills: [skillDTO({ id: 1, name: 'TypeScript', category: 'frontend' }), skillDTO({ id: 2, name: 'Mystery', category: 'weird' })],
        education: [
            educationDTO({ id: 1, degreeName: 'BSc', instituteName: 'Uni', instituteUrl: 'https://uni.edu', isCompleted: true }),
            educationDTO({ id: 2, degreeName: 'MSc', instituteName: 'Tech', instituteUrl: null, isCompleted: false }),
        ],
        jobs: [jobDTO({ id: 1, role: 'Engineer', companyName: 'Acme', isEnded: false }), jobDTO({ id: 2, role: 'Intern', companyName: 'Old Co', isEnded: true })],
        certifications: Array.from({ length: 7 }, (_, i) => certificationDTO({ id: i + 1, name: `Cert ${i + 1}`, url: `https://c.example/${i + 1}` })),
    })
    const panelLabel = (text: string) => screen.getByText(text, { selector: 'header span' })

    it('renders in the "about" tab with the bio, numbered lines and the snippet showcase', () => {
        render(<AboutPage {...props()} />)

        expect(layout().dataset.active).toBe('about')
        expect(screen.getByText('about-me.ts')).toBeInTheDocument()
        expect(screen.getByText(/I'm Lam Tan Phu/)).toBeInTheDocument()
        expect(screen.getByText('16')).toBeInTheDocument() // BIO has 16 lines
        expect(screen.getByText('const stack = {')).toBeInTheDocument()
        expect(screen.getByText('const interests = [')).toBeInTheDocument()
        expect(screen.getByText('★ 4')).toBeInTheDocument()
        expect(screen.getByText('2 months ago')).toBeInTheDocument()
    })

    it('shows the resume download link in the editor header', () => {
        render(<AboutPage {...props()} />)

        expect(screen.getByRole('link', { name: /resume\.pdf/ })).toBeInTheDocument()
    })

    it('opens on the "personal" panel: personal-info, education (linked when the school has a site) and contacts', () => {
        render(<AboutPage {...props()} />)

        expect(panelLabel('personal-info')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'bio' })).toHaveAttribute('href', '/about')
        const bsc = screen.getByRole('link', { name: 'BSc — Uni' })
        expect(bsc).toHaveAttribute('href', 'https://uni.edu')
        expect(bsc).toHaveAttribute('target', '_blank')
        const msc = screen.getByRole('link', { name: 'MSc — Tech' })
        expect(msc).toHaveAttribute('href', '/about#education')
        expect(msc).not.toHaveAttribute('target')
        expect(screen.getByRole('link', { name: /lam@example\.com/ })).toHaveAttribute('href', 'mailto:lam@example.com')
        expect(screen.getByRole('link', { name: /\+84 000 000 000/ })).toHaveAttribute('href', 'tel:+84000000000')
    })

    it('colours education dots by completion', () => {
        render(<AboutPage {...props()} />)

        expect(screen.getByRole('link', { name: 'BSc — Uni' }).querySelector('.sidebar-dot')).toHaveClass('dot-grey')
        expect(screen.getByRole('link', { name: 'MSc — Tech' }).querySelector('.sidebar-dot')).toHaveClass('dot-teal')
    })

    it('"Professional Info" shows jobs, skills and certificates', async () => {
        render(<AboutPage {...props()} />)

        await userEvent.click(screen.getByTitle('Professional Info'))

        expect(panelLabel('professional-info')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Engineer @ Acme' }).querySelector('.sidebar-dot')).toHaveClass('dot-teal')
        expect(screen.getByRole('link', { name: 'Intern @ Old Co' }).querySelector('.sidebar-dot')).toHaveClass('dot-grey')
        expect(screen.getByRole('link', { name: 'typescript' }).querySelector('.sidebar-dot')).toHaveClass('dot-teal')
        expect(screen.getByRole('link', { name: 'mystery' }).querySelector('.sidebar-dot')).toHaveClass('dot-grey') // unknown category
    })

    it('certificates open in a new tab and cycle through the dot colours', async () => {
        render(<AboutPage {...props()} />)
        await userEvent.click(screen.getByTitle('Professional Info'))

        const first = screen.getByRole('link', { name: 'cert 1' })
        expect(first).toHaveAttribute('href', 'https://c.example/1')
        expect(first).toHaveAttribute('target', '_blank')
        expect(first).toHaveAttribute('rel', 'noopener noreferrer')
        expect(first.querySelector('.sidebar-dot')).toHaveClass('dot-teal')
        expect(screen.getByRole('link', { name: 'cert 6' }).querySelector('.sidebar-dot')).toHaveClass('dot-red')
        expect(screen.getByRole('link', { name: 'cert 7' }).querySelector('.sidebar-dot')).toHaveClass('dot-teal') // wraps after 6
    })

    it('shows "// none yet" for an empty group', async () => {
        render(<AboutPage {...props()} jobs={[]} />)
        await userEvent.click(screen.getByTitle('Professional Info'))

        expect(screen.getByText('// none yet')).toBeInTheDocument()
    })

    it('"Hobbies" shows the hobby groups', async () => {
        render(<AboutPage {...props()} />)

        await userEvent.click(screen.getByTitle('Hobbies'))

        expect(panelLabel('hobbies')).toBeInTheDocument()
        expect(screen.getByText('music')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'lo-fi' })).toBeInTheDocument()
    })

    it('switching panels moves the active highlight', async () => {
        render(<AboutPage {...props()} />)
        expect(screen.getByTitle('Personal Info').className).toContain('border-(--accent-teal)')

        await userEvent.click(screen.getByTitle('Hobbies'))

        expect(screen.getByTitle('Hobbies').className).toContain('border-(--accent-teal)')
        expect(screen.getByTitle('Personal Info').className).not.toContain('border-(--accent-teal)')
    })
})

// ── ProjectsPage (+ ProjectCard, filters) ───────────────────────────────────
describe('ProjectsPage', () => {
    const projects = [
        projectSummaryDTO({ id: 1, name: 'Alpha', slug: 'alpha', techStack: ['React', 'Node.js'], liveUrl: 'https://alpha.dev', repoUrl: null, thumbnailUrl: 'https://img.dev/a.png' }),
        projectSummaryDTO({ id: 2, name: 'Beta', slug: 'beta', techStack: ['Flutter'], liveUrl: null, repoUrl: 'https://github.com/x/beta', thumbnailUrl: null }),
        projectSummaryDTO({ id: 3, name: 'Gamma', slug: 'gamma', techStack: [], liveUrl: null, repoUrl: null, thumbnailUrl: null }),
    ]

    it('renders in the "projects" tab with a card per project, numbered', () => {
        render(<ProjectsPage projects={projects} />)

        expect(layout().dataset.active).toBe('projects')
        expect(screen.getByText('_alpha')).toBeInTheDocument()
        expect(screen.getByText('_beta')).toBeInTheDocument()
        expect(screen.getByText('Project 3', { selector: 'span' })).toBeInTheDocument()
    })

    it('cards link to the detail page and the best external link (live site, else repo, else nothing)', () => {
        render(<ProjectsPage projects={projects} />)

        expect(screen.getByTitle('View Alpha')).toHaveAttribute('href', 'https://alpha.dev')
        expect(screen.getByTitle('View Beta')).toHaveAttribute('href', 'https://github.com/x/beta')
        expect(screen.getByTitle('View Gamma')).toHaveAttribute('href', '#')
        expect(screen.getAllByRole('link').filter((a) => a.getAttribute('href') === '/projects/alpha').length).toBeGreaterThan(0)
    })

    it('shows the thumbnail when there is one, a placeholder otherwise', () => {
        render(<ProjectsPage projects={projects} />)

        expect(screen.getByAltText('Alpha')).toHaveAttribute('src', expect.stringContaining('a.png'))
        expect(screen.getAllByText('no preview')).toHaveLength(2)
    })

    it('shows the tech badges (and none for a project without a stack)', () => {
        render(<ProjectsPage projects={projects} />)

        const alpha = screen.getByText('_alpha').closest('article')!
        expect(within(alpha).getByText('Node.js')).toBeInTheDocument()
        const gamma = screen.getByText('_gamma').closest('article')!
        expect(within(gamma).queryByText('React')).not.toBeInTheDocument()
    })

    it('filters by technology (any match), names the filters in a tab, and clears them', async () => {
        render(<ProjectsPage projects={projects} />)

        await userEvent.click(screen.getByLabelText('React'))
        expect(screen.getByText('_alpha')).toBeInTheDocument()
        expect(screen.queryByText('_beta')).not.toBeInTheDocument()

        await userEvent.click(screen.getByLabelText('Flutter'))
        expect(screen.getByText('_beta')).toBeInTheDocument()
        expect(screen.getByText('React; Flutter')).toBeInTheDocument()

        await userEvent.click(screen.getByTitle('Clear filters'))
        expect(screen.getByText('_gamma')).toBeInTheDocument()
        expect(screen.queryByText('React; Flutter')).not.toBeInTheDocument()
    })

    it('unticking a technology removes just that filter', async () => {
        render(<ProjectsPage projects={projects} />)
        await userEvent.click(screen.getByLabelText('React'))
        await userEvent.click(screen.getByLabelText('Flutter'))

        await userEvent.click(screen.getByLabelText('React'))

        expect(screen.queryByText('React; Flutter')).not.toBeInTheDocument()
        expect(screen.queryByText('_alpha')).not.toBeInTheDocument()
        expect(screen.getByText('_beta')).toBeInTheDocument()
    })

    it('has different empty messages for "nothing published" and "nothing matches"', async () => {
        const empty = render(<ProjectsPage projects={[]} />)
        expect(screen.getByText('// no projects published yet')).toBeInTheDocument()
        empty.unmount()

        render(<ProjectsPage projects={projects} />)
        await userEvent.click(screen.getByLabelText('Angular'))
        expect(screen.getByText('// no projects match the selected filters')).toBeInTheDocument()
    })
})

// ── ProjectDetailPage ───────────────────────────────────────────────────────
describe('ProjectDetailPage', () => {
    const jsonLd = () => JSON.parse(document.querySelector('script[type="application/ld+json"]')!.textContent!)

    it('shows the project: title, stack, description and a way back', () => {
        server.use(http.post(`${API_URL}/analytics/project-view/:id`, () => HttpResponse.json({}, { status: 201 })))
        render(<ProjectDetailPage project={projectDTO({ name: 'Portfolio', description: 'Long description', techStack: ['Next.js', 'NestJS'] })} />)

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Portfolio')
        expect(screen.getByText('Next.js')).toBeInTheDocument()
        expect(screen.getByText('Long description')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /back to projects/ })).toHaveAttribute('href', '/projects')
    })

    it('records one view for the project on mount', async () => {
        const seen: string[] = []
        server.use(http.post(`${API_URL}/analytics/project-view/:id`, ({ params }) => { seen.push(String(params.id)); return HttpResponse.json({}, { status: 201 }) }))

        render(<ProjectDetailPage project={projectDTO({ id: 42 })} />)

        await waitFor(() => expect(seen).toEqual(['42']))
    })

    it('shows live-demo and source-code links only when the project has those URLs', () => {
        server.use(http.post(`${API_URL}/analytics/project-view/:id`, () => HttpResponse.json({})))
        const both = render(<ProjectDetailPage project={projectDTO({ liveUrl: 'https://live.dev', repoUrl: 'https://git.dev/r' })} />)
        expect(screen.getByRole('link', { name: /live-demo/ })).toHaveAttribute('href', 'https://live.dev')
        expect(screen.getByRole('link', { name: /source-code/ })).toHaveAttribute('href', 'https://git.dev/r')
        both.unmount()

        render(<ProjectDetailPage project={projectDTO({ liveUrl: null, repoUrl: null })} />)
        expect(screen.queryByRole('link', { name: /live-demo/ })).not.toBeInTheDocument()
        expect(screen.queryByRole('link', { name: /source-code/ })).not.toBeInTheDocument()
    })

    it('shows the thumbnail only when there is one', () => {
        server.use(http.post(`${API_URL}/analytics/project-view/:id`, () => HttpResponse.json({})))
        const withImg = render(<ProjectDetailPage project={projectDTO({ name: 'Pic', thumbnailUrl: 'https://img.dev/p.png' })} />)
        expect(screen.getByAltText('Pic')).toBeInTheDocument()
        withImg.unmount()

        render(<ProjectDetailPage project={projectDTO({ name: 'Pic', thumbnailUrl: null })} />)
        expect(screen.queryByAltText('Pic')).not.toBeInTheDocument()
    })

    it('embeds schema.org JSON-LD for search engines', () => {
        server.use(http.post(`${API_URL}/analytics/project-view/:id`, () => HttpResponse.json({})))
        render(<ProjectDetailPage project={projectDTO({ name: 'Portfolio', slug: 'portfolio', repoUrl: 'https://git.dev/r', techStack: ['TS'] })} />)

        expect(jsonLd()).toMatchObject({
            '@type': 'SoftwareSourceCode', name: 'Portfolio', url: `${SITE_URL}/projects/portfolio`,
            codeRepository: 'https://git.dev/r', programmingLanguage: ['TS'], author: { name: 'Lam Tan Phu' },
        })
    })

    it('leaves codeRepository out of the JSON-LD when there is no repo', () => {
        server.use(http.post(`${API_URL}/analytics/project-view/:id`, () => HttpResponse.json({})))
        render(<ProjectDetailPage project={projectDTO({ repoUrl: null })} />)

        expect(jsonLd()).not.toHaveProperty('codeRepository')
    })
})

// ── BlogPostPage ────────────────────────────────────────────────────────────
describe('BlogPostPage', () => {
    const jsonLd = () => JSON.parse(document.querySelector('script[type="application/ld+json"]')!.textContent!)

    it('shows the post: title, date, reading time, tags, content and a way back', () => {
        render(<BlogPostPage post={blogDetailDTO({ title: 'Hello', content: 'Body words here', tags: ['react', 'ts'], publishedAt: '2025-03-01T12:00:00.000Z' })} />)

        expect(layout().dataset.active).toBe('blog')
        expect(screen.getByRole('heading', { level: 1, name: 'Hello' })).toBeInTheDocument()
        expect(screen.getByText('Mar 1, 2025')).toBeInTheDocument()
        expect(screen.getByText('~1 min read')).toBeInTheDocument()
        expect(screen.getByText('#react')).toBeInTheDocument()
        expect(screen.getByText('Body words here')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /back to blog/ })).toHaveAttribute('href', '/blog')
    })

    it('estimates reading time at 200 words per minute, never below one minute', () => {
        const long = Array.from({ length: 650 }, () => 'w').join(' ') // 3.25 → 3
        const { unmount } = render(<BlogPostPage post={blogDetailDTO({ content: long })} />)
        expect(screen.getByText('~3 min read')).toBeInTheDocument()
        unmount()

        render(<BlogPostPage post={blogDetailDTO({ content: '' })} />)
        expect(screen.getByText('~1 min read')).toBeInTheDocument()
    })

    it('falls back to the creation date for a draft with no publish date', () => {
        render(<BlogPostPage post={blogDetailDTO({ publishedAt: null, createdAt: '2025-02-10T12:00:00.000Z' })} />)

        expect(screen.getByText('Feb 10, 2025')).toBeInTheDocument()
    })

    it('embeds BlogPosting JSON-LD with excerpt, dates and keywords', () => {
        render(<BlogPostPage post={blogDetailDTO({ title: 'T', slug: 't', excerpt: 'Ex', tags: ['a', 'b'], publishedAt: '2025-03-01T12:00:00.000Z', updatedAt: '2025-03-02T12:00:00.000Z' })} />)

        expect(jsonLd()).toMatchObject({
            '@type': 'BlogPosting', headline: 'T', description: 'Ex', url: `${SITE_URL}/blog/t`,
            datePublished: '2025-03-01T12:00:00.000Z', dateModified: '2025-03-02T12:00:00.000Z', keywords: 'a, b',
        })
    })

    it('omits dateModified when the backend sends no updatedAt (rather than inventing one)', () => {
        render(<BlogPostPage post={blogDetailDTO({ title: 'T', slug: 't' })} />)

        expect(jsonLd()).not.toHaveProperty('dateModified')
        expect(jsonLd().datePublished).toBeTruthy()
    })

    it('omits description and keywords from the JSON-LD when the post has neither', () => {
        render(<BlogPostPage post={blogDetailDTO({ excerpt: null, tags: [], publishedAt: null, createdAt: '2025-02-10T12:00:00.000Z' })} />)

        const ld = jsonLd()
        expect(ld).not.toHaveProperty('description')
        expect(ld).not.toHaveProperty('keywords')
        expect(ld.datePublished).toBe('2025-02-10T12:00:00.000Z')
    })
})

