import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { API_URL } from '@/lib/constants'
import {
    blogDetailDTO, blogSummaryDTO, certificationDTO, educationDTO, jobDTO,
    projectDTO, projectSummaryDTO, skillDTO, socialAccountDTO, userProfileDTO,
} from '@/src/test/fixtures'
import { server } from '@/src/test/msw/server'

import { TrackPageViewCommand } from './commands/analytics/TrackPageViewCommand'
import { TrackProjectViewCommand } from './commands/analytics/TrackProjectViewCommand'
import { TrackResumeDownloadCommand } from './commands/analytics/TrackResumeDownloadCommand'
import { LoginCommand } from './commands/auth/LoginCommand'
import { LogoutCommand } from './commands/auth/LogoutCommand'
import { RefreshAccessTokenCommand } from './commands/auth/RefreshAccessTokenCommand'
import { CreateBlogCommand } from './commands/blog/CreateBlogCommand'
import { DeleteBlogCommand } from './commands/blog/DeleteBlogCommand'
import { UpdateBlogCommand } from './commands/blog/UpdateBlogCommand'
import { VerifySnakeCompletionCommand } from './commands/captcha/VerifySnakeCompletionCommand'
import { CreateCertificationCommand } from './commands/certification/CreateCertificationCommand'
import { DeleteCertificationCommand } from './commands/certification/DeleteCertificationCommand'
import { UpdateCertificationCommand } from './commands/certification/UpdateCertificationCommand'
import { DeleteContactMessageCommand } from './commands/contact/DeleteContactMessageCommand'
import { SubmitContactCommand } from './commands/contact/SubmitContactCommand'
import { CreateEducationCommand } from './commands/education/CreateEducationCommand'
import { DeleteEducationCommand } from './commands/education/DeleteEducationCommand'
import { UpdateEducationCommand } from './commands/education/UpdateEducationCommand'
import { CreateJobCommand } from './commands/job/CreateJobCommand'
import { DeleteJobCommand } from './commands/job/DeleteJobCommand'
import { UpdateJobCommand } from './commands/job/UpdateJobCommand'
import { CreateProjectCommand } from './commands/project/CreateProjectCommand'
import { DeleteProjectCommand } from './commands/project/DeleteProjectCommand'
import { UpdateProjectCommand } from './commands/project/UpdateProjectCommand'
import { CreateSkillCommand } from './commands/skill/CreateSkillCommand'
import { DeleteSkillCommand } from './commands/skill/DeleteSkillCommand'
import { UpdateSkillCommand } from './commands/skill/UpdateSkillCommand'
import { CreateSocialAccountCommand } from './commands/social/CreateSocialAccountCommand'
import { DeleteSocialAccountCommand } from './commands/social/DeleteSocialAccountCommand'
import { UpdateSocialAccountCommand } from './commands/social/UpdateSocialAccountCommand'
import { UpdateUserProfileCommand } from './commands/user/UpdateUserProfileCommand'
import { GetAuditLogsQuery } from './queries/audit/GetAuditLogsQuery'
import { GetNowPlayingQuery } from './queries/analytics/GetNowPlayingQuery'
import { GetPageViewsQuery } from './queries/analytics/GetPageViewsQuery'
import { GetProjectViewsQuery } from './queries/analytics/GetProjectViewsQuery'
import { GetAllBlogsQuery } from './queries/blog/GetAllBlogsQuery'
import { loadBlogBySlug } from './queries/blog/loadBlogBySlug'
import { loadBlogs } from './queries/blog/loadBlogs'
import { SearchBlogsQuery } from './queries/blog/SearchBlogsQuery'
import { IssueSnakeChallengeQuery } from './queries/captcha/IssueSnakeChallengeQuery'
import { GetCertificationsQuery } from './queries/certification/GetCertificationsQuery'
import { loadCertifications } from './queries/certification/loadCertification'
import { GetContactMessagesQuery } from './queries/contact/GetContactMessagesQuery'
import { GetEducationQuery } from './queries/education/GetEducationQuery'
import { loadEducation } from './queries/education/loadEducation'
import { GetJobsQuery } from './queries/job/GetJobsQuery'
import { loadJobs } from './queries/job/loadJobs'
import { loadProjectBySlug } from './queries/project/loadProjectBySlug'
import { loadProjects } from './queries/project/loadProjects'
import { GetPublishedSkillsQuery } from './queries/skill/GetPublishedSkillsQuery'
import { loadSkills } from './queries/skill/loadSkills'
import { GetPublishedSocialAccountsQuery } from './queries/social/GetPublishedSocialAccountsQuery'
import { loadSocialAccounts } from './queries/social/loadSocialAccounts'
import { GetUserProfileQuery } from './queries/user/GetUserProfileQuery'

// These tests drive each use case through the *real* stack — use case →
// repository → mapper → httpClient → fetch — and fake only the network (MSW).
// They pin the HTTP contract with the backend: method, path, body, bearer
// token, and how the response is mapped. Typed loosely on purpose: request
// DTO shapes are the backend's contract, not what is under test here.

const TOKEN = 'tok-123'
type Captured = { method: string; path: string; body: unknown; auth: string | null }

/** Registers a handler for one route and records what the app actually sent. */
function route(method: 'get' | 'post' | 'patch' | 'delete', path: string, respond: () => Response) {
    const seen: Captured[] = []
    server.use(
        http[method](`${API_URL}${path}`, async ({ request }) => {
            const text = method === 'get' || method === 'delete' ? '' : await request.text()
            seen.push({
                method: request.method,
                path: new URL(request.url).pathname.replace(new URL(API_URL).pathname, ''),
                body: text ? JSON.parse(text) : undefined,
                auth: request.headers.get('authorization'),
            })
            return respond()
        }),
    )
    return seen
}
const json = (body: unknown, status = 200) => () => HttpResponse.json(body as never, { status })
const noContent = () => new HttpResponse(null, { status: 204 })
const status = (code: number) => () => new HttpResponse(null, { status: code })

// ── Resource tables ─────────────────────────────────────────────────────────
// One row per CRUD resource, so the same assertions run for each.
const resources = [
    {
        name: 'skill', base: '/skills', dto: () => skillDTO({ id: 7, name: 'Rust' }), label: 'Rust',
        pick: (r: { name: string }) => r.name,
        publicList: () => loadSkills(), publicPath: '/about/skills',
        adminList: () => GetPublishedSkillsQuery.createForAdmin().execute(),
        create: (b: unknown) => CreateSkillCommand.create().execute(b as never, TOKEN),
        update: (id: number, b: unknown) => UpdateSkillCommand.create().execute(id, b as never, TOKEN),
        remove: (id: number) => DeleteSkillCommand.create().execute(id, TOKEN),
    },
    {
        name: 'job', base: '/jobs', dto: () => jobDTO({ id: 7, companyName: 'Initech' }), label: 'Initech',
        pick: (r: { companyName: string }) => r.companyName,
        publicList: () => loadJobs(), publicPath: '/about/jobs',
        adminList: () => GetJobsQuery.createForAdmin().execute(),
        create: (b: unknown) => CreateJobCommand.create().execute(b as never, TOKEN),
        update: (id: number, b: unknown) => UpdateJobCommand.create().execute(id, b as never, TOKEN),
        remove: (id: number) => DeleteJobCommand.create().execute(id, TOKEN),
    },
    {
        name: 'education', base: '/education', dto: () => educationDTO({ id: 7, degreeName: 'MSc' }), label: 'MSc',
        pick: (r: { degreeName: string }) => r.degreeName,
        publicList: () => loadEducation(), publicPath: '/about/education',
        adminList: () => GetEducationQuery.createForAdmin().execute(),
        create: (b: unknown) => CreateEducationCommand.create().execute(b as never, TOKEN),
        update: (id: number, b: unknown) => UpdateEducationCommand.create().execute(id, b as never, TOKEN),
        remove: (id: number) => DeleteEducationCommand.create().execute(id, TOKEN),
    },
    {
        name: 'certification', base: '/certifications', dto: () => certificationDTO({ id: 7, name: 'CKA' }), label: 'CKA',
        pick: (r: { name: string }) => r.name,
        publicList: () => loadCertifications(), publicPath: '/about/certifications',
        adminList: () => GetCertificationsQuery.createForAdmin().execute(),
        create: (b: unknown) => CreateCertificationCommand.create().execute(b as never, TOKEN),
        update: (id: number, b: unknown) => UpdateCertificationCommand.create().execute(id, b as never, TOKEN),
        remove: (id: number) => DeleteCertificationCommand.create().execute(id, TOKEN),
    },
    {
        name: 'social account', base: '/social', dto: () => socialAccountDTO({ id: 7, name: 'Mastodon' }), label: 'Mastodon',
        pick: (r: { name: string }) => r.name,
        publicList: () => loadSocialAccounts(), publicPath: '/about/social',
        adminList: () => GetPublishedSocialAccountsQuery.createForAdmin().execute(),
        create: (b: unknown) => CreateSocialAccountCommand.create().execute(b as never, TOKEN),
        update: (id: number, b: unknown) => UpdateSocialAccountCommand.create().execute(id, b as never, TOKEN),
        remove: (id: number) => DeleteSocialAccountCommand.create().execute(id, TOKEN),
    },
] as const

describe.each(resources)('$name use cases', (r) => {
    it('public loader reads the public endpoint without credentials and returns DTOs', async () => {
        const seen = route('get', r.publicPath, json([r.dto()]))

        const result = await r.publicList()

        expect(seen).toHaveLength(1)
        expect(seen[0].auth).toBeNull()
        expect(result).toHaveLength(1)
        expect(r.pick(result[0] as never)).toBe(r.label)
    })

    it('admin list reads the admin endpoint', async () => {
        const seen = route('get', r.base, json([r.dto(), r.dto()]))

        const result = await r.adminList()

        expect(seen[0].path).toBe(r.base)
        expect(result).toHaveLength(2)
    })

    it('an empty list stays an empty list', async () => {
        route('get', r.publicPath, json([]))

        await expect(r.publicList()).resolves.toEqual([])
    })

    it('a failing list request rejects instead of returning stale or empty data', async () => {
        route('get', r.publicPath, status(500))

        await expect(r.publicList()).rejects.toMatchObject({ status: 500 })
    })

    it('create POSTs the body with the bearer token and returns the created entity', async () => {
        const seen = route('post', r.base, json(r.dto(), 201))

        const created = await r.create({ name: 'x' })

        expect(seen[0]).toMatchObject({ method: 'POST', path: r.base, body: { name: 'x' }, auth: `Bearer ${TOKEN}` })
        expect(created).toMatchObject({ id: 7 })
    })

    it('update PATCHes /:id with the bearer token and returns the updated entity', async () => {
        const seen = route('patch', `${r.base}/7`, json(r.dto()))

        const updated = await r.update(7, { name: 'y' })

        expect(seen[0]).toMatchObject({ method: 'PATCH', path: `${r.base}/7`, body: { name: 'y' }, auth: `Bearer ${TOKEN}` })
        expect(updated).toMatchObject({ id: 7 })
    })

    it('delete DELETEs /:id with the bearer token', async () => {
        const seen = route('delete', `${r.base}/7`, noContent)

        await expect(r.remove(7)).resolves.toBeUndefined()

        expect(seen[0]).toMatchObject({ method: 'DELETE', path: `${r.base}/7`, auth: `Bearer ${TOKEN}` })
    })

    it('write failures reach the caller so the UI can show an error', async () => {
        route('post', r.base, status(401))
        route('patch', `${r.base}/7`, status(404))
        route('delete', `${r.base}/7`, status(403))

        await expect(r.create({})).rejects.toMatchObject({ status: 401 })
        await expect(r.update(7, {})).rejects.toMatchObject({ status: 404 })
        await expect(r.remove(7)).rejects.toMatchObject({ status: 403 })
    })
})

// ── Projects ────────────────────────────────────────────────────────────────
describe('project use cases', () => {
    it('loadProjects maps list items to summaries', async () => {
        route('get', '/projects', json([projectSummaryDTO({ id: 1, name: 'Alpha' }), projectSummaryDTO({ id: 2, name: 'Beta' })]))

        const result = await loadProjects()

        expect(result.map((p) => p.name)).toEqual(['Alpha', 'Beta'])
    })

    it('loadProjectBySlug returns the full project with ISO date strings', async () => {
        route('get', '/projects/alpha', json(projectDTO({ slug: 'alpha', description: 'Long text' })))

        const project = await loadProjectBySlug('alpha')

        expect(project).toMatchObject({ slug: 'alpha', description: 'Long text' })
        expect(project?.createdAt).toBe('2025-01-10T08:00:00.000Z')
    })

    it('loadProjectBySlug returns null for a 404 (so the page can show notFound())', async () => {
        route('get', '/projects/missing', status(404))

        await expect(loadProjectBySlug('missing')).resolves.toBeNull()
    })

    it('loadProjectBySlug still throws for server errors (a 500 is not "not found")', async () => {
        route('get', '/projects/boom', status(500))

        await expect(loadProjectBySlug('boom')).rejects.toMatchObject({ status: 500 })
    })

    it('create / update / delete hit /projects with the bearer token', async () => {
        const created = route('post', '/projects', json(projectDTO({ id: 9 }), 201))
        const updated = route('patch', '/projects/9', json(projectDTO({ id: 9 })))
        const deleted = route('delete', '/projects/9', noContent)

        await expect(CreateProjectCommand.create().execute({ name: 'n' } as never, TOKEN)).resolves.toMatchObject({ id: 9 })
        await expect(UpdateProjectCommand.create().execute(9, { name: 'm' } as never, TOKEN)).resolves.toMatchObject({ id: 9 })
        await DeleteProjectCommand.create().execute(9, TOKEN)

        expect([created[0].auth, updated[0].auth, deleted[0].auth]).toEqual(Array(3).fill(`Bearer ${TOKEN}`))
        expect(created[0].body).toEqual({ name: 'n' })
        expect(updated[0].body).toEqual({ name: 'm' })
    })
})

// ── Blogs ───────────────────────────────────────────────────────────────────
describe('blog use cases', () => {
    it('loadBlogs returns published summaries', async () => {
        route('get', '/blogs', json([blogSummaryDTO({ id: 1, title: 'One' })]))

        await expect(loadBlogs()).resolves.toMatchObject([{ id: 1, title: 'One' }])
    })

    it('loadBlogBySlug returns the full post, with null publishedAt preserved for drafts', async () => {
        route('get', '/blogs/draft', json(blogDetailDTO({ slug: 'draft', publishedAt: null, isPublished: false })))

        const post = await loadBlogBySlug('draft')

        expect(post).toMatchObject({ slug: 'draft', publishedAt: null })
    })

    it('loadBlogBySlug returns null for a 404', async () => {
        route('get', '/blogs/missing', status(404))

        await expect(loadBlogBySlug('missing')).resolves.toBeNull()
    })

    it('loadBlogBySlug rethrows other failures', async () => {
        route('get', '/blogs/boom', status(500))

        await expect(loadBlogBySlug('boom')).rejects.toMatchObject({ status: 500 })
    })

    it('admin list uses /blogs/admin with the bearer token', async () => {
        const seen = route('get', '/blogs/admin', json([blogSummaryDTO({ isPublished: false })]))

        const result = await GetAllBlogsQuery.create().execute(TOKEN)

        expect(seen[0].auth).toBe(`Bearer ${TOKEN}`)
        expect(result).toHaveLength(1)
    })

    it('search URL-encodes the query', async () => {
        let q: string | null = null
        server.use(http.get(`${API_URL}/blogs/search`, ({ request }) => {
            q = new URL(request.url).searchParams.get('q')
            return HttpResponse.json([blogSummaryDTO()])
        }))

        await SearchBlogsQuery.create().execute('c++ & rust')

        expect(q).toBe('c++ & rust')
    })

    it('create / update / delete hit /blogs with the bearer token', async () => {
        const created = route('post', '/blogs', json(blogDetailDTO({ id: 5 }), 201))
        const updated = route('patch', '/blogs/5', json(blogDetailDTO({ id: 5 })))
        const deleted = route('delete', '/blogs/5', noContent)

        await expect(CreateBlogCommand.create().execute({ title: 't' } as never, TOKEN)).resolves.toMatchObject({ id: 5 })
        await expect(UpdateBlogCommand.create().execute(5, { title: 'u' } as never, TOKEN)).resolves.toMatchObject({ id: 5 })
        await DeleteBlogCommand.create().execute(5, TOKEN)

        expect([created[0].auth, updated[0].auth, deleted[0].auth]).toEqual(Array(3).fill(`Bearer ${TOKEN}`))
    })
})

// ── Auth, profile, contact, captcha, analytics, audit ───────────────────────
describe('auth use cases', () => {
    it('login sends the password and returns the access token', async () => {
        const seen = route('post', '/auth/login', json({ accessToken: 'abc' }))

        await expect(LoginCommand.create().execute('pw')).resolves.toEqual({ accessToken: 'abc' })
        expect(seen[0].body).toEqual({ password: 'pw' })
    })

    it('a rejected login surfaces as an error', async () => {
        route('post', '/auth/login', status(401))

        await expect(LoginCommand.create().execute('bad')).rejects.toMatchObject({ status: 401 })
    })

    it('refresh posts an empty body and returns a new token', async () => {
        const seen = route('post', '/auth/refresh', json({ accessToken: 'fresh' }))

        await expect(RefreshAccessTokenCommand.create().execute()).resolves.toEqual({ accessToken: 'fresh' })
        expect(seen[0].body).toEqual({})
    })

    it('logout sends the bearer token and accepts 204', async () => {
        const seen = route('post', '/auth/logout', noContent)

        await expect(LogoutCommand.create().execute(TOKEN)).resolves.toBeUndefined()
        expect(seen[0].auth).toBe(`Bearer ${TOKEN}`)
    })
})

describe('user profile use cases', () => {
    it('GetUserProfileQuery reads /user/profile with the token', async () => {
        const seen = route('get', '/user/profile', json(userProfileDTO({ firstname: 'Ada' })))

        const user = await GetUserProfileQuery.create().execute(TOKEN)

        expect(seen[0].auth).toBe(`Bearer ${TOKEN}`)
        expect(user).toMatchObject({ firstname: 'Ada' })
    })

    it('UpdateUserProfileCommand PATCHes /user/profile', async () => {
        const seen = route('patch', '/user/profile', json(userProfileDTO({ firstname: 'Grace' })))

        const user = await UpdateUserProfileCommand.create().execute({ firstname: 'Grace' } as never, TOKEN)

        expect(seen[0].body).toEqual({ firstname: 'Grace' })
        expect(user).toMatchObject({ firstname: 'Grace' })
    })
})

describe('contact use cases', () => {
    const input = { name: 'Ada', email: 'ada@example.com', message: 'Hi', turnstileToken: 't', snakeProofToken: 's' }

    it('SubmitContactCommand posts the whole submission', async () => {
        const seen = route('post', '/contact', json({ id: 1 }, 201))

        await SubmitContactCommand.create().execute(input)

        expect(seen[0].body).toEqual(input)
    })

    it('SubmitContactCommand maps a 429 to a RateLimitedError', async () => {
        route('post', '/contact', status(429))

        await expect(SubmitContactCommand.create().execute(input)).rejects.toMatchObject({ name: 'RateLimitedError' })
    })

    it('GetContactMessagesQuery forwards cursor and limit', async () => {
        let search = ''
        server.use(http.get(`${API_URL}/contact`, ({ request }) => {
            search = new URL(request.url).search
            return HttpResponse.json({ items: [], nextCursor: null })
        }))

        await GetContactMessagesQuery.create().execute(TOKEN, 5, 20)

        expect(search).toBe('?cursor=5&limit=20')
    })

    it('DeleteContactMessageCommand DELETEs /contact/:id', async () => {
        const seen = route('delete', '/contact/3', noContent)

        await DeleteContactMessageCommand.create().execute(3, TOKEN)

        expect(seen[0]).toMatchObject({ method: 'DELETE', path: '/contact/3', auth: `Bearer ${TOKEN}` })
    })
})

describe('captcha use cases', () => {
    it('IssueSnakeChallengeQuery returns the challenge id', async () => {
        route('post', '/captcha/snake/challenge', json({ challengeId: 'c-9' }, 201))

        await expect(IssueSnakeChallengeQuery.create().execute()).resolves.toBe('c-9')
    })

    it('VerifySnakeCompletionCommand returns the proof token, or null when the run is rejected', async () => {
        route('post', '/captcha/snake/verify', json({ proofToken: 'p-1' }, 201))
        await expect(VerifySnakeCompletionCommand.create().execute({ challengeId: 'c', eaten: 10, durationMs: 9000, moveCount: 50 } as never)).resolves.toBe('p-1')

        route('post', '/captcha/snake/verify', status(400))
        await expect(VerifySnakeCompletionCommand.create().execute({ challengeId: 'c', eaten: 1, durationMs: 1, moveCount: 1 } as never)).resolves.toBeNull()
    })
})

describe('analytics use cases', () => {
    it('TrackPageViewCommand posts the route', async () => {
        const seen = route('post', '/analytics/page-view', json({}, 201))

        await TrackPageViewCommand.create().execute('/blog')

        expect(seen[0].body).toEqual({ route: '/blog' })
    })

    it('TrackProjectViewCommand posts to the project-specific path', async () => {
        const seen = route('post', '/analytics/project-view/4', json({}, 201))

        await TrackProjectViewCommand.create().execute(4)

        expect(seen).toHaveLength(1)
    })

    it('TrackResumeDownloadCommand posts to the resume endpoint', async () => {
        const seen = route('post', '/analytics/resume-download', json({}, 201))

        await TrackResumeDownloadCommand.create().execute()

        expect(seen).toHaveLength(1)
    })

    it.each([
        ['page view', () => TrackPageViewCommand.create().execute('/x'), '/analytics/page-view'],
        ['project view', () => TrackProjectViewCommand.create().execute(1), '/analytics/project-view/1'],
        ['resume download', () => TrackResumeDownloadCommand.create().execute(), '/analytics/resume-download'],
    ])('tracking a %s never throws, even when analytics is down (best-effort)', async (_name, run, path) => {
        route('post', path, status(500))

        await expect(run()).resolves.toBeUndefined()
    })

    it('GetPageViewsQuery / GetProjectViewsQuery read with the bearer token', async () => {
        const pages = route('get', '/analytics/page-views', json([{ route: '/', views: 3 }]))
        const project = route('get', '/analytics/project-views/2', json({ projectId: 2, views: 8 }))

        await expect(GetPageViewsQuery.create().execute(TOKEN)).resolves.toEqual([{ route: '/', views: 3 }])
        await expect(GetProjectViewsQuery.create().execute(2, TOKEN)).resolves.toEqual({ projectId: 2, views: 8 })

        expect(pages[0].auth).toBe(`Bearer ${TOKEN}`)
        expect(project[0].auth).toBe(`Bearer ${TOKEN}`)
    })

    it('GetNowPlayingQuery reads /spotify/now-playing', async () => {
        route('get', '/spotify/now-playing', json({ isPlaying: true, title: 'Song', artist: 'Band', albumArt: 'a', songUrl: 'u' }))

        await expect(GetNowPlayingQuery.create().execute()).resolves.toMatchObject({ title: 'Song' })
    })
})

describe('audit use case', () => {
    it.each([
        [undefined, undefined, ''],
        [10, undefined, '?cursor=10'],
        [undefined, 25, '?limit=25'],
        [0, 25, '?cursor=0&limit=25'],
    ])('cursor=%s limit=%s → query string "%s"', async (cursor, limit, expected) => {
        let search = 'unset'
        server.use(http.get(`${API_URL}/audit`, ({ request }) => {
            search = new URL(request.url).search
            return HttpResponse.json({ items: [], nextCursor: null })
        }))

        await GetAuditLogsQuery.create().execute(TOKEN, cursor, limit)

        expect(search).toBe(expected)
    })
})

