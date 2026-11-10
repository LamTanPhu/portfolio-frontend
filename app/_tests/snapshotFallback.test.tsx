import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { API_URL } from '@/lib/constants'
import { server } from '@/src/test/msw/server'

import { AboutPage } from '@/src/presentation/pages/AboutPage'
import { BlogPage } from '@/src/presentation/pages/BlogPage'
import { BlogPostPage } from '@/src/presentation/pages/BlogPostPage'
import { HomePage } from '@/src/presentation/pages/HomePage'
import { ProjectDetailPage } from '@/src/presentation/pages/ProjectDetailPage'

import sitemap from '../sitemap'
import * as homeRoute from '../page'
import * as aboutRoute from '../about/page'
import * as blogRoute from '../blog/page'
import * as blogSlugRoute from '../blog/[slug]/page'
import * as projectSlugRoute from '../projects/[slug]/page'

// What a visitor gets when the backend is asleep or down: the committed
// snapshot, through the real route files, with only the network faked.
vi.mock('@/data/api-snapshot.json', async () => {
    const f = await import('@/src/test/fixtures')
    return {
        default: {
            generatedAt: '2026-11-01T00:00:00.000Z',
            entries: {
                '/about/skills': [f.skillDTO({ name: 'Snap Skill' })],
                '/about/education': [f.educationDTO()],
                '/about/jobs': [f.jobDTO()],
                '/about/certifications': [f.certificationDTO()],
                '/about/social': [f.socialAccountDTO({ name: 'Snap GitHub' })],
                '/projects': [f.projectSummaryDTO({ slug: 'snap-project' })],
                '/projects/snap-project': f.projectDTO({ slug: 'snap-project', name: 'Snap Project' }),
                '/blogs': [f.blogSummaryDTO({ slug: 'snap-post' })],
                '/blogs/snap-post': f.blogDetailDTO({ slug: 'snap-post', title: 'Snap Post' }),
            },
        },
    }
})

interface El { type: unknown; props: Record<string, unknown> }
const params = <T,>(p: T) => ({ params: Promise.resolve(p) })
const NOT_FOUND = { digest: 'NEXT_HTTP_ERROR_FALLBACK;404' }

const status = (path: string, code: number) =>
    server.use(http.get(`${API_URL}${path}`, () => new HttpResponse(null, { status: code })))
const unreachable = (path: string) => server.use(http.get(`${API_URL}${path}`, () => HttpResponse.error()))

beforeEach(() => {
    vi.spyOn(process.stderr, 'write').mockReturnValue(true)
})

describe('public routes with the backend down', () => {
    it('/ still renders, with the snapshot\'s social accounts', async () => {
        unreachable('/about/social')

        const el = (await homeRoute.default()) as unknown as El

        expect(el.type).toBe(HomePage)
        expect(el.props.socialAccounts).toMatchObject([{ name: 'Snap GitHub' }])
    })

    it('/about still renders from the snapshot when every request fails', async () => {
        status('/about/skills', 503)
        status('/about/education', 500)
        unreachable('/about/jobs')
        status('/about/certifications', 429)

        const el = (await aboutRoute.default()) as unknown as El

        expect(el.type).toBe(AboutPage)
        expect(el.props.skills).toMatchObject([{ name: 'Snap Skill' }])
        expect(el.props.jobs).toHaveLength(1)
    })

    it('/blog still lists the snapshot posts', async () => {
        status('/blogs', 502)

        const el = (await blogRoute.default()) as unknown as El

        expect(el.type).toBe(BlogPage)
        expect(el.props.posts).toMatchObject([{ slug: 'snap-post' }])
    })

    it('prebuilds blog and project pages from the snapshot, so a build cannot fail on a sleeping backend', async () => {
        unreachable('/blogs')
        unreachable('/projects')

        await expect(blogSlugRoute.generateStaticParams()).resolves.toEqual([{ slug: 'snap-post' }])
        await expect(projectSlugRoute.generateStaticParams()).resolves.toEqual([{ slug: 'snap-project' }])
    })

    it('renders a post and a project detail page from the snapshot', async () => {
        status('/blogs/snap-post', 500)
        status('/projects/snap-project', 500)

        const post = (await blogSlugRoute.default(params({ slug: 'snap-post' }))) as unknown as El
        const project = (await projectSlugRoute.default(params({ slug: 'snap-project' }))) as unknown as El

        expect(post.type).toBe(BlogPostPage)
        expect(post.props.post).toMatchObject({ title: 'Snap Post' })
        expect(project.type).toBe(ProjectDetailPage)
        expect(project.props.project).toMatchObject({ name: 'Snap Project' })
    })

    it('builds SEO metadata for a snapshot post', async () => {
        status('/blogs/snap-post', 500)

        await expect(blogSlugRoute.generateMetadata(params({ slug: 'snap-post' }))).resolves.toMatchObject({
            title: 'Snap Post',
        })
    })

    it('the sitemap lists snapshot projects and posts', async () => {
        status('/projects', 500)
        status('/blogs', 500)

        const urls = (await sitemap()).map((e) => e.url)

        expect(urls.some((u) => u.endsWith('/blog/snap-post'))).toBe(true)
        expect(urls.some((u) => u.endsWith('/projects/snap-project'))).toBe(true)
    })

    it('logs each fallback to stderr so it shows up in host and build logs', async () => {
        status('/blogs', 500)

        await blogRoute.default()

        expect(process.stderr.write).toHaveBeenCalledWith(expect.stringContaining('[snapshot-fallback] GET /blogs'))
    })
})

describe('what the fallback must NOT do', () => {
    it('a live 404 for a slug that is in the snapshot is still a 404 (deleted posts do not come back)', async () => {
        status('/blogs/snap-post', 404)

        await expect(blogSlugRoute.default(params({ slug: 'snap-post' }))).rejects.toMatchObject(NOT_FOUND)
    })

    it('an unknown slug with the backend down surfaces the error instead of inventing a page', async () => {
        status('/blogs/never-existed', 500)

        await expect(blogSlugRoute.default(params({ slug: 'never-existed' }))).rejects.toMatchObject({ status: 500 })
    })

    it('uses live data, not the snapshot, whenever the backend answers', async () => {
        server.use(http.get(`${API_URL}/about/social`, () => HttpResponse.json([])))

        const el = (await homeRoute.default()) as unknown as El

        expect(el.props.socialAccounts).toEqual([])
    })
})
