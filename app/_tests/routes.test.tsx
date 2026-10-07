import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { API_URL, SITE_URL } from '@/lib/constants'
import {
    blogDetailDTO, blogSummaryDTO, certificationDTO, educationDTO, jobDTO,
    projectDTO, projectSummaryDTO, skillDTO, socialAccountDTO,
} from '@/src/test/fixtures'
import { server } from '@/src/test/msw/server'

import { AdminAnalyticsPage } from '@/src/presentation/pages/adminPages/AdminAnalyticsPage'
import { AdminAuditPage } from '@/src/presentation/pages/adminPages/AdminAuditPage'
import { AdminBlogFormPage } from '@/src/presentation/pages/adminPages/AdminBlogFormPage'
import { AdminBlogListPage } from '@/src/presentation/pages/adminPages/AdminBlogListPage'
import { AdminCertificationEditPage } from '@/src/presentation/pages/adminPages/AdminCertificationEditPage'
import { AdminCertificationFormPage } from '@/src/presentation/pages/adminPages/AdminCertificationFormPage'
import { AdminCertificationListPage } from '@/src/presentation/pages/adminPages/AdminCertificationListPage'
import { AdminContactListPage } from '@/src/presentation/pages/adminPages/AdminContactListPage'
import { AdminDashboardPage } from '@/src/presentation/pages/adminPages/AdminDashboardPage'
import { AdminEducationEditPage } from '@/src/presentation/pages/adminPages/AdminEducationEditPage'
import { AdminEducationFormPage } from '@/src/presentation/pages/adminPages/AdminEducationFormPage'
import { AdminEducationListPage } from '@/src/presentation/pages/adminPages/AdminEducationListPage'
import { AdminJobEditPage } from '@/src/presentation/pages/adminPages/AdminJobEditPage'
import { AdminJobFormPage } from '@/src/presentation/pages/adminPages/AdminJobFormPage'
import { AdminJobListPage } from '@/src/presentation/pages/adminPages/AdminJobListPage'
import { AdminLoginPage } from '@/src/presentation/pages/adminPages/AdminLoginPage'
import { AdminProfilePage } from '@/src/presentation/pages/adminPages/AdminProfilePage'
import { AdminProjectFormPage } from '@/src/presentation/pages/adminPages/AdminProjectFormPage'
import { AdminProjectListPage } from '@/src/presentation/pages/adminPages/AdminProjectListPage'
import { AdminSkillEditPage } from '@/src/presentation/pages/adminPages/AdminSkillEditPage'
import { AdminSkillFormPage } from '@/src/presentation/pages/adminPages/AdminSkillFormPage'
import { AdminSkillListPage } from '@/src/presentation/pages/adminPages/AdminSkillListPage'
import { AdminSocialEditPage } from '@/src/presentation/pages/adminPages/AdminSocialEditPage'
import { AdminSocialFormPage } from '@/src/presentation/pages/adminPages/AdminSocialFormPage'
import { AdminSocialListPage } from '@/src/presentation/pages/adminPages/AdminSocialListPage'
import { AdminShell } from '@/src/presentation/templates/AdminShell'
import { AboutPage } from '@/src/presentation/pages/AboutPage'
import { BlogPage } from '@/src/presentation/pages/BlogPage'
import { BlogPostPage } from '@/src/presentation/pages/BlogPostPage'
import { ContactPage } from '@/src/presentation/pages/ContactPage'
import { HomePage } from '@/src/presentation/pages/HomePage'
import { ProjectDetailPage } from '@/src/presentation/pages/ProjectDetailPage'
import { ProjectsPage } from '@/src/presentation/pages/ProjectsPage'
import { SubmitContactCommand } from '@/src/application/use-cases/commands/contact/SubmitContactCommand'
import { ValidationError } from '@/src/domain/errors/ValidationError'

import robots from '../robots'
import sitemap from '../sitemap'
import { submitContactAction } from '../contact/action'
import * as homeRoute from '../page'
import * as aboutRoute from '../about/page'
import * as projectsRoute from '../projects/page'
import * as blogRoute from '../blog/page'
import * as contactRoute from '../contact/page'
import * as projectSlugRoute from '../projects/[slug]/page'
import * as blogSlugRoute from '../blog/[slug]/page'

// Route files are thin: fetch on the server, hand the data to a page component.
// These tests call them the way Next does (an async function, `params` as a
// Promise) and check what comes back, with only the network faked.

const get = (path: string, body: unknown, status = 200) =>
    server.use(http.get(`${API_URL}${path}`, () => HttpResponse.json(body as never, { status })))
const fail = (path: string, status = 500) => server.use(http.get(`${API_URL}${path}`, () => new HttpResponse(null, { status })))

interface El { type: unknown; props: Record<string, unknown> }
const params = <T,>(p: T) => ({ params: Promise.resolve(p) })
const NOT_FOUND = { digest: 'NEXT_HTTP_ERROR_FALLBACK;404' }

// ── Public pages ────────────────────────────────────────────────────────────
describe('public route files', () => {
    it('/ loads the social accounts for the home page', async () => {
        get('/about/social', [socialAccountDTO({ name: 'GitHub' })])

        const el = (await homeRoute.default()) as unknown as El

        expect(el.type).toBe(HomePage)
        expect(el.props.socialAccounts).toMatchObject([{ name: 'GitHub' }])
    })

    it('/about loads skills, education, jobs and certifications together', async () => {
        get('/about/skills', [skillDTO({ name: 'TS' })])
        get('/about/education', [educationDTO({ degreeName: 'BSc' })])
        get('/about/jobs', [jobDTO({ role: 'Dev' })])
        get('/about/certifications', [certificationDTO({ name: 'AWS' })])

        const el = (await aboutRoute.default()) as unknown as El

        expect(el.type).toBe(AboutPage)
        expect(el.props).toMatchObject({
            skills: [{ name: 'TS' }], education: [{ degreeName: 'BSc' }], jobs: [{ role: 'Dev' }], certifications: [{ name: 'AWS' }],
        })
    })

    it('/about fails (rather than rendering half a page) when any of its four requests fails', async () => {
        get('/about/skills', [])
        get('/about/education', [])
        get('/about/jobs', [])
        fail('/about/certifications')

        await expect(aboutRoute.default()).rejects.toMatchObject({ status: 500 })
    })

    it('/projects loads the project list', async () => {
        get('/projects', [projectSummaryDTO({ name: 'Alpha' })])

        const el = (await projectsRoute.default()) as unknown as El

        expect(el.type).toBe(ProjectsPage)
        expect(el.props.projects).toMatchObject([{ name: 'Alpha' }])
    })

    it('/blog loads the published posts', async () => {
        get('/blogs', [blogSummaryDTO({ title: 'Post' })])

        const el = (await blogRoute.default()) as unknown as El

        expect(el.type).toBe(BlogPage)
        expect(el.props.posts).toMatchObject([{ title: 'Post' }])
    })

    it('/contact loads the social accounts for its sidebar', async () => {
        get('/about/social', [socialAccountDTO({ name: 'Email', url: 'mailto:a@b.co' })])

        const el = (await contactRoute.default()) as unknown as El

        expect(el.type).toBe(ContactPage)
        expect(el.props.socialAccounts).toMatchObject([{ name: 'Email' }])
    })

    it.each([
        ['home', homeRoute.metadata, SITE_URL, undefined],
        ['about', aboutRoute.metadata, `${SITE_URL}/about`, 'About'],
        ['projects', projectsRoute.metadata, `${SITE_URL}/projects`, 'Projects'],
        ['blog', blogRoute.metadata, `${SITE_URL}/blog`, 'Blog'],
        ['contact', contactRoute.metadata, `${SITE_URL}/contact`, 'Contact'],
    ])('%s has a canonical URL, Open Graph and Twitter metadata', (_name, metadata, canonical, title) => {
        expect(metadata.alternates?.canonical).toBe(canonical)
        expect(metadata.title).toBe(title)
        expect(metadata.description).toEqual(expect.any(String))
        expect(metadata.openGraph).toMatchObject({ url: canonical, type: 'website' })
        expect(metadata.twitter).toMatchObject({ card: 'summary' })
    })
})

// ── Project detail route ────────────────────────────────────────────────────
describe('/projects/[slug]', () => {
    it('prebuilds a page per published project', async () => {
        get('/projects', [projectSummaryDTO({ slug: 'a' }), projectSummaryDTO({ slug: 'b' })])

        await expect(projectSlugRoute.generateStaticParams()).resolves.toEqual([{ slug: 'a' }, { slug: 'b' }])
    })

    it('renders the project page for a known slug', async () => {
        get('/projects/alpha', projectDTO({ slug: 'alpha', name: 'Alpha' }))

        const el = (await projectSlugRoute.default(params({ slug: 'alpha' }))) as unknown as El

        expect(el.type).toBe(ProjectDetailPage)
        expect(el.props.project).toMatchObject({ slug: 'alpha', name: 'Alpha' })
    })

    it('answers an unknown slug with Next\'s 404', async () => {
        server.use(http.get(`${API_URL}/projects/nope`, () => new HttpResponse(null, { status: 404 })))

        await expect(projectSlugRoute.default(params({ slug: 'nope' }))).rejects.toMatchObject(NOT_FOUND)
    })

    it('builds SEO metadata from the project, with a large Twitter card when there is a thumbnail', async () => {
        get('/projects/alpha', projectDTO({ slug: 'alpha', name: 'Alpha', description: 'd'.repeat(300), thumbnailUrl: 'https://img.dev/a.png' }))

        const md = await projectSlugRoute.generateMetadata(params({ slug: 'alpha' }))

        expect(md.title).toBe('Alpha')
        expect(md.description).toHaveLength(160)
        expect(md.alternates?.canonical).toBe(`${SITE_URL}/projects/alpha`)
        expect(md.openGraph?.images).toEqual([{ url: 'https://img.dev/a.png' }])
        expect(md.twitter).toMatchObject({ card: 'summary_large_image', images: ['https://img.dev/a.png'] })
    })

    it('uses a plain Twitter card and no images without a thumbnail', async () => {
        get('/projects/alpha', projectDTO({ slug: 'alpha', thumbnailUrl: null }))

        const md = await projectSlugRoute.generateMetadata(params({ slug: 'alpha' }))

        expect(md.openGraph?.images).toBeUndefined()
        expect(md.twitter).toMatchObject({ card: 'summary' })
        expect((md.twitter as { images?: unknown }).images).toBeUndefined()
    })

    it('titles an unknown project "Project not found"', async () => {
        server.use(http.get(`${API_URL}/projects/nope`, () => new HttpResponse(null, { status: 404 })))

        await expect(projectSlugRoute.generateMetadata(params({ slug: 'nope' }))).resolves.toEqual({ title: 'Project not found' })
    })
})

// ── Blog post route ─────────────────────────────────────────────────────────
describe('/blog/[slug]', () => {
    it('prebuilds a page per published post', async () => {
        get('/blogs', [blogSummaryDTO({ slug: 'x' }), blogSummaryDTO({ slug: 'y' })])

        await expect(blogSlugRoute.generateStaticParams()).resolves.toEqual([{ slug: 'x' }, { slug: 'y' }])
    })

    it('renders the post page for a known slug', async () => {
        get('/blogs/hello', blogDetailDTO({ slug: 'hello', title: 'Hello' }))

        const el = (await blogSlugRoute.default(params({ slug: 'hello' }))) as unknown as El

        expect(el.type).toBe(BlogPostPage)
        expect(el.props.post).toMatchObject({ slug: 'hello', title: 'Hello' })
    })

    it('answers an unknown slug with Next\'s 404', async () => {
        server.use(http.get(`${API_URL}/blogs/nope`, () => new HttpResponse(null, { status: 404 })))

        await expect(blogSlugRoute.default(params({ slug: 'nope' }))).rejects.toMatchObject(NOT_FOUND)
    })

    it('builds article metadata using the excerpt, the publish date and the tags', async () => {
        get('/blogs/hello', blogDetailDTO({ slug: 'hello', title: 'Hello', excerpt: 'Short.', tags: ['a', 'b'], publishedAt: '2025-03-01T12:00:00.000Z' }))

        const md = await blogSlugRoute.generateMetadata(params({ slug: 'hello' }))

        expect(md.title).toBe('Hello')
        expect(md.description).toBe('Short.')
        expect(md.alternates?.canonical).toBe(`${SITE_URL}/blog/hello`)
        expect(md.openGraph).toMatchObject({ type: 'article', publishedTime: '2025-03-01T12:00:00.000Z', tags: ['a', 'b'] })
    })

    it('falls back to the start of the content, and to the creation date, for a post without excerpt or publish date', async () => {
        get('/blogs/draft', blogDetailDTO({ slug: 'draft', excerpt: null, content: 'c'.repeat(300), publishedAt: null, createdAt: '2025-02-10T12:00:00.000Z' }))

        const md = await blogSlugRoute.generateMetadata(params({ slug: 'draft' }))

        expect(md.description).toBe('c'.repeat(160))
        expect(md.openGraph).toMatchObject({ publishedTime: '2025-02-10T12:00:00.000Z' })
    })

    it('titles an unknown post "Post not found"', async () => {
        server.use(http.get(`${API_URL}/blogs/nope`, () => new HttpResponse(null, { status: 404 })))

        await expect(blogSlugRoute.generateMetadata(params({ slug: 'nope' }))).resolves.toEqual({ title: 'Post not found' })
    })
})

// ── Server action ───────────────────────────────────────────────────────────
describe('submitContactAction', () => {
    const input = { name: 'Ada', email: 'ada@example.com', message: 'Hi', turnstileToken: 't', snakeProofToken: 's' }
    const respond = (status: number) => server.use(http.post(`${API_URL}/contact`, () => new HttpResponse(null, { status })))

    it('reports success when the backend accepts the message', async () => {
        server.use(http.post(`${API_URL}/contact`, () => HttpResponse.json({ id: 1 }, { status: 201 })))

        await expect(submitContactAction(input)).resolves.toEqual({ success: true })
    })

    it('turns a rejected submission (400) into a message the form can show', async () => {
        respond(400)

        await expect(submitContactAction(input)).resolves.toEqual({ success: false, error: expect.any(String) })
    })

    it('turns throttling (429) into the "too many messages" message', async () => {
        respond(429)

        await expect(submitContactAction(input)).resolves.toEqual({ success: false, error: expect.stringMatching(/too many messages/i) })
    })

    it('turns a backend failure (500) into the server-failed message', async () => {
        respond(500)

        await expect(submitContactAction(input)).resolves.toEqual({ success: false, error: expect.stringMatching(/server failed/i) })
    })

    it('turns an unreachable backend into the connectivity message', async () => {
        server.use(http.post(`${API_URL}/contact`, () => HttpResponse.error()))

        await expect(submitContactAction(input)).resolves.toEqual({ success: false, error: expect.stringMatching(/could not reach the server/i) })
    })

    it('uses a generic message for anything unexpected, never leaking internals', async () => {
        vi.spyOn(SubmitContactCommand, 'create').mockReturnValue({ execute: () => Promise.reject(new TypeError('secret internal detail')) } as never)

        const result = await submitContactAction(input)

        expect(result).toEqual({ success: false, error: 'Something went wrong. Please try again later.' })
    })

    it('passes a ValidationError message through as-is', async () => {
        vi.spyOn(SubmitContactCommand, 'create').mockReturnValue({ execute: () => Promise.reject(new ValidationError('Invalid email')) } as never)

        await expect(submitContactAction(input)).resolves.toEqual({ success: false, error: 'Invalid email' })
    })
})

// ── sitemap / robots ────────────────────────────────────────────────────────
describe('sitemap', () => {
    it('lists the static pages, then every project and post with its last-modified date', async () => {
        get('/projects', [projectSummaryDTO({ slug: 'alpha', updatedAt: '2025-01-12T08:30:00.000Z' })])
        get('/blogs', [blogSummaryDTO({ slug: 'hello', publishedAt: '2025-03-02T11:00:00.000Z' })])

        const map = await sitemap()

        expect(map.map((e) => e.url)).toEqual([
            `${SITE_URL}/`, `${SITE_URL}/about`, `${SITE_URL}/projects`, `${SITE_URL}/blog`, `${SITE_URL}/contact`,
            `${SITE_URL}/projects/alpha`, `${SITE_URL}/blog/hello`,
        ])
        expect(map[0].priority).toBe(1)
        expect(map[5]).toMatchObject({ lastModified: '2025-01-12T08:30:00.000Z', changeFrequency: 'monthly', priority: 0.6 })
        expect(map[6]).toMatchObject({ lastModified: '2025-03-02T11:00:00.000Z' })
    })

    it('blog lastModified: updatedAt if the backend sends one, else the publish date, else the creation date', async () => {
        get('/projects', [])
        get('/blogs', [
            blogSummaryDTO({ slug: 'edited', publishedAt: '2025-03-01T00:00:00.000Z', createdAt: '2025-02-01T00:00:00.000Z', updatedAt: '2025-04-01T00:00:00.000Z' }),
            blogSummaryDTO({ slug: 'published', publishedAt: '2025-03-01T00:00:00.000Z', createdAt: '2025-02-01T00:00:00.000Z' }),
            blogSummaryDTO({ slug: 'draft', isPublished: false, publishedAt: null, createdAt: '2025-02-01T00:00:00.000Z' }),
        ])

        const byUrl = Object.fromEntries((await sitemap()).map((e) => [e.url, e.lastModified]))

        expect(byUrl[`${SITE_URL}/blog/edited`]).toBe('2025-04-01T00:00:00.000Z')
        expect(byUrl[`${SITE_URL}/blog/published`]).toBe('2025-03-01T00:00:00.000Z')
        expect(byUrl[`${SITE_URL}/blog/draft`]).toBe('2025-02-01T00:00:00.000Z')
    })

    it('still returns the static pages when the API is down (the build must not fail)', async () => {
        fail('/projects')
        fail('/blogs')

        const map = await sitemap()

        expect(map).toHaveLength(5)
    })

    it('keeps projects when only the blog list fails, and vice versa', async () => {
        get('/projects', [projectSummaryDTO({ slug: 'alpha' })])
        fail('/blogs')
        expect((await sitemap()).map((e) => e.url)).toContain(`${SITE_URL}/projects/alpha`)

        fail('/projects')
        get('/blogs', [blogSummaryDTO({ slug: 'hello' })])
        expect((await sitemap()).map((e) => e.url)).toContain(`${SITE_URL}/blog/hello`)
    })
})

describe('robots', () => {
    it('allows everything and points crawlers at the sitemap', () => {
        expect(robots()).toEqual({ rules: { userAgent: '*', allow: '/' }, sitemap: `${SITE_URL}/sitemap.xml` })
    })
})

// ── Admin route wrappers ────────────────────────────────────────────────────
describe('admin route files', () => {
    const adminParams = <T,>(p: T) => ({ params: Promise.resolve(p) })

    it.each([
        ['dashboard', () => import('../admin/(protected)/page'), AdminDashboardPage],
        ['skills list', () => import('../admin/(protected)/skills/page'), AdminSkillListPage],
        ['jobs list', () => import('../admin/(protected)/jobs/page'), AdminJobListPage],
        ['education list', () => import('../admin/(protected)/education/page'), AdminEducationListPage],
        ['certifications list', () => import('../admin/(protected)/certifications/page'), AdminCertificationListPage],
        ['social list', () => import('../admin/(protected)/social/page'), AdminSocialListPage],
        ['projects list', () => import('../admin/(protected)/projects/page'), AdminProjectListPage],
        ['blog list', () => import('../admin/(protected)/blog/page'), AdminBlogListPage],
        ['contact', () => import('../admin/(protected)/contact/page'), AdminContactListPage],
        ['audit', () => import('../admin/(protected)/audit/page'), AdminAuditPage],
        ['analytics', () => import('../admin/(protected)/analytics/page'), AdminAnalyticsPage],
        ['profile', () => import('../admin/(protected)/profile/page'), AdminProfilePage],
        ['login', () => import('../admin/login/page'), AdminLoginPage],
    ])('%s renders its page component', async (_name, load, Component) => {
        const el = (await (await load()).default()) as unknown as El

        expect(el.type).toBe(Component)
    })

    it.each([
        ['skill', () => import('../admin/(protected)/skills/new/page'), AdminSkillFormPage],
        ['job', () => import('../admin/(protected)/jobs/new/page'), AdminJobFormPage],
        ['education', () => import('../admin/(protected)/education/new/page'), AdminEducationFormPage],
        ['certification', () => import('../admin/(protected)/certifications/new/page'), AdminCertificationFormPage],
        ['social account', () => import('../admin/(protected)/social/new/page'), AdminSocialFormPage],
        ['project', () => import('../admin/(protected)/projects/new/page'), AdminProjectFormPage],
        ['blog post', () => import('../admin/(protected)/blog/new/page'), AdminBlogFormPage],
    ])('"new %s" opens the form in create mode', async (_name, load, Component) => {
        const el = (await (await load()).default()) as unknown as El

        expect(el.type).toBe(Component)
        expect(el.props).toMatchObject({ mode: 'create' })
    })

    it.each([
        ['skill', () => import('../admin/(protected)/skills/[id]/edit/page'), AdminSkillEditPage],
        ['job', () => import('../admin/(protected)/jobs/[id]/edit/page'), AdminJobEditPage],
        ['education', () => import('../admin/(protected)/education/[id]/edit/page'), AdminEducationEditPage],
        ['certification', () => import('../admin/(protected)/certifications/[id]/edit/page'), AdminCertificationEditPage],
        ['social account', () => import('../admin/(protected)/social/[id]/edit/page'), AdminSocialEditPage],
    ])('edit %s passes the numeric id from the URL', async (_name, load, Component) => {
        const el = (await (await load()).default(adminParams({ id: '12' }))) as unknown as El

        expect(el.type).toBe(Component)
        expect(el.props).toEqual({ id: 12 })
    })

    it('edit project loads the project by slug and opens the form in edit mode', async () => {
        get('/projects/alpha', projectDTO({ slug: 'alpha', name: 'Alpha' }))
        const { default: Page } = await import('../admin/(protected)/projects/[slug]/edit/page')

        const el = (await Page(adminParams({ slug: 'alpha' }))) as unknown as El

        expect(el.type).toBe(AdminProjectFormPage)
        expect(el.props).toMatchObject({ mode: 'edit', project: { slug: 'alpha' } })
    })

    it('edit blog post loads the post by slug and opens the form in edit mode', async () => {
        get('/blogs/hello', blogDetailDTO({ slug: 'hello', title: 'Hello' }))
        const { default: Page } = await import('../admin/(protected)/blog/[slug]/edit/page')

        const el = (await Page(adminParams({ slug: 'hello' }))) as unknown as El

        expect(el.type).toBe(AdminBlogFormPage)
        expect(el.props).toMatchObject({ mode: 'edit', post: { slug: 'hello' } })
    })

    it('editing an unknown project or post is a 404', async () => {
        server.use(
            http.get(`${API_URL}/projects/nope`, () => new HttpResponse(null, { status: 404 })),
            http.get(`${API_URL}/blogs/nope`, () => new HttpResponse(null, { status: 404 })),
        )
        const projectPage = (await import('../admin/(protected)/projects/[slug]/edit/page')).default
        const blogPage = (await import('../admin/(protected)/blog/[slug]/edit/page')).default

        await expect(projectPage(adminParams({ slug: 'nope' }))).rejects.toMatchObject(NOT_FOUND)
        await expect(blogPage(adminParams({ slug: 'nope' }))).rejects.toMatchObject(NOT_FOUND)
    })

    it('the protected layout wraps everything in the AdminShell', async () => {
        const { default: Layout } = await import('../admin/(protected)/layout')

        const el = Layout({ children: 'kids' }) as unknown as El

        expect(el.type).toBe(AdminShell)
        expect(el.props.children).toBe('kids')
    })

    it('the login page is kept out of search engines', async () => {
        const { metadata } = await import('../admin/login/page')

        expect(metadata.robots).toEqual({ index: false, follow: false })
    })
})
