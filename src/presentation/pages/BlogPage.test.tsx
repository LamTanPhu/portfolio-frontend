// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { API_URL } from '@/lib/constants'
import { blogSummaryDTO } from '@/src/test/fixtures'
import { server } from '@/src/test/msw/server'
import { BlogPage } from './BlogPage'

vi.mock('../templates/VSCodeLayout', () => ({
    VSCodeLayout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const posts = [
    blogSummaryDTO({ id: 1, title: 'React Hooks Deep Dive', slug: 'hooks', tags: ['react', 'frontend'], excerpt: 'All about hooks.' }),
    blogSummaryDTO({ id: 2, title: 'NestJS Guards', slug: 'guards', tags: ['nestjs', 'backend'], excerpt: 'Protecting routes.' }),
    blogSummaryDTO({ id: 3, title: 'Testing Next.js', slug: 'testing', tags: ['react', 'testing'], excerpt: 'Tests that matter.' }),
]

const searchUrl = `${API_URL}/blogs/search`
const card = (title: string) => screen.getByRole('button', { name: new RegExp(title) })
const queryCard = (title: string) => screen.queryByRole('button', { name: new RegExp(title) })
const searchBox = () => screen.getByRole('textbox', { name: 'Search blog posts' })

describe('BlogPage — listing', () => {
    it('lists every post and shows the count', () => {
        render(<BlogPage posts={posts} />)

        expect(card('React Hooks Deep Dive')).toBeInTheDocument()
        expect(card('NestJS Guards')).toBeInTheDocument()
        expect(card('Testing Next.js')).toBeInTheDocument()
        expect(screen.getByText('// 3 posts')).toBeInTheDocument()
    })

    it('uses the singular for exactly one post', () => {
        render(<BlogPage posts={[posts[0]]} />)

        expect(screen.getByText('// 1 post')).toBeInTheDocument()
    })

    it('shows an empty state when nothing is published', () => {
        render(<BlogPage posts={[]} />)

        expect(screen.getByText('// no posts published yet')).toBeInTheDocument()
        expect(screen.getByText('// 0 posts')).toBeInTheDocument()
    })

    it('builds the tag list from posts: unique and alphabetical', () => {
        render(<BlogPage posts={posts} />)

        const tagLabels = screen.getAllByRole('checkbox').map((c) => c.closest('label')?.textContent)
        expect(tagLabels).toEqual(['#backend', '#frontend', '#nestjs', '#react', '#testing'])
    })

    it('shows the publish date, falling back to createdAt for drafts', () => {
        render(
            <BlogPage
                posts={[
                    blogSummaryDTO({ id: 1, title: 'Published', publishedAt: '2025-03-01T12:00:00.000Z' }),
                    blogSummaryDTO({ id: 2, title: 'Draft', publishedAt: null, createdAt: '2025-02-10T12:00:00.000Z' }),
                ]}
            />,
        )

        expect(within(card('Published')).getByText('Mar 1, 2025')).toBeInTheDocument()
        expect(within(card('Draft')).getByText('Feb 10, 2025')).toBeInTheDocument()
    })
})

describe('BlogPage — tag filtering', () => {
    it('narrows the list to posts with the selected tag', async () => {
        render(<BlogPage posts={posts} />)

        await userEvent.click(screen.getByLabelText('#backend'))

        expect(card('NestJS Guards')).toBeInTheDocument()
        expect(queryCard('React Hooks Deep Dive')).not.toBeInTheDocument()
        expect(screen.getByText('// 1 post')).toBeInTheDocument()
    })

    it('combines several tags as a union (posts matching ANY selected tag)', async () => {
        render(<BlogPage posts={posts} />)

        await userEvent.click(screen.getByLabelText('#backend'))
        await userEvent.click(screen.getByLabelText('#testing'))

        expect(card('NestJS Guards')).toBeInTheDocument()
        expect(card('Testing Next.js')).toBeInTheDocument()
        expect(queryCard('React Hooks Deep Dive')).not.toBeInTheDocument()
    })

    it('shows the active filters and removes them all with the × button', async () => {
        render(<BlogPage posts={posts} />)
        await userEvent.click(screen.getByLabelText('#react'))
        await userEvent.click(screen.getByLabelText('#backend'))
        expect(screen.getByText('#react; #backend')).toBeInTheDocument()

        await userEvent.click(screen.getByTitle('Clear filters'))

        expect(screen.queryByText('#react; #backend')).not.toBeInTheDocument()
        expect(screen.getByText('// 3 posts')).toBeInTheDocument()
    })

    it('toggling a tag a second time removes it from the filter', async () => {
        render(<BlogPage posts={posts} />)
        const tag = screen.getByLabelText('#backend')

        await userEvent.click(tag)
        await userEvent.click(tag)

        expect(screen.getByText('// 3 posts')).toBeInTheDocument()
    })
})

describe('BlogPage — preview', () => {
    it('shows a hint until a post is picked', () => {
        render(<BlogPage posts={posts} />)

        expect(screen.getByText('// select a post to preview')).toBeInTheDocument()
    })

    it('previews the picked post (title, estimated reading time, excerpt)', async () => {
        render(<BlogPage posts={posts} />)

        await userEvent.click(card('NestJS Guards'))

        expect(screen.getByRole('heading', { name: 'NestJS Guards' })).toBeInTheDocument()
        expect(screen.getByText('~1 min read')).toBeInTheDocument()
        expect(screen.getByText(/Protecting routes\./)).toBeInTheDocument()
        expect(screen.queryByText('// select a post to preview')).not.toBeInTheDocument()
    })

    it('estimates reading time from excerpt length at 200 words per minute', async () => {
        const longExcerpt = Array.from({ length: 450 }, () => 'word').join(' ') // 450 words → 2.25 → 2 min
        render(<BlogPage posts={[blogSummaryDTO({ title: 'Long one', excerpt: longExcerpt })]} />)

        await userEvent.click(card('Long one'))

        expect(screen.getByText('~2 min read')).toBeInTheDocument()
    })

    it('handles a post with no excerpt', async () => {
        render(<BlogPage posts={[blogSummaryDTO({ title: 'No excerpt', excerpt: null })]} />)

        await userEvent.click(card('No excerpt'))

        expect(screen.getByRole('heading', { name: 'No excerpt' })).toBeInTheDocument()
        expect(screen.getByText('~1 min read')).toBeInTheDocument()
    })

    it('drops the preview when a filter hides the selected post', async () => {
        render(<BlogPage posts={posts} />)
        await userEvent.click(card('NestJS Guards'))
        expect(screen.getByRole('heading', { name: 'NestJS Guards' })).toBeInTheDocument()

        await userEvent.click(screen.getByLabelText('#react'))

        expect(screen.queryByRole('heading', { name: 'NestJS Guards' })).not.toBeInTheDocument()
        expect(screen.getByText('// select a post to preview')).toBeInTheDocument()
    })
})

describe('BlogPage — search', () => {
    it('queries the backend (debounced) with the URL-encoded term and shows its results instead of the full list', async () => {
        let requestedQ: string | null = null
        server.use(
            http.get(searchUrl, ({ request }) => {
                requestedQ = new URL(request.url).searchParams.get('q')
                return HttpResponse.json([blogSummaryDTO({ id: 9, title: 'Result About Hooks', slug: 'r' })])
            }),
        )
        render(<BlogPage posts={posts} />)

        await userEvent.type(searchBox(), 'hooks & more')

        expect(await screen.findByRole('button', { name: /Result About Hooks/ })).toBeInTheDocument()
        expect(requestedQ).toBe('hooks & more')
        expect(queryCard('NestJS Guards')).not.toBeInTheDocument()
    })

    it('sends one request for a burst of keystrokes, not one per character', async () => {
        const hits = vi.fn()
        server.use(http.get(searchUrl, () => { hits(); return HttpResponse.json([]) }))
        render(<BlogPage posts={posts} />)

        await userEvent.type(searchBox(), 'react')
        await screen.findByText(/no results for/)

        expect(hits).toHaveBeenCalledTimes(1)
    })

    it('shows an empty-results message that quotes the search term', async () => {
        server.use(http.get(searchUrl, () => HttpResponse.json([])))
        render(<BlogPage posts={posts} />)

        await userEvent.type(searchBox(), 'zzz')

        expect(await screen.findByText(/no results for/)).toBeInTheDocument()
        expect(screen.getByText(/"zzz"/)).toBeInTheDocument()
    })

    it('shows an error message when the search request fails', async () => {
        server.use(http.get(searchUrl, () => new HttpResponse(null, { status: 500 })))
        render(<BlogPage posts={posts} />)

        await userEvent.type(searchBox(), 'boom')

        expect(await screen.findByText(/search failed/i)).toBeInTheDocument()
    })

    it('does not call the backend for a whitespace-only query', async () => {
        const hits = vi.fn()
        server.use(http.get(searchUrl, () => { hits(); return HttpResponse.json([]) }))
        render(<BlogPage posts={posts} />)

        await userEvent.type(searchBox(), '   ')
        await new Promise((r) => setTimeout(r, 450)) // longer than the 300ms debounce

        expect(hits).not.toHaveBeenCalled()
        expect(screen.getByText('// 3 posts')).toBeInTheDocument()
    })

    it('goes back to the full list when the search is cleared', async () => {
        server.use(http.get(searchUrl, () => HttpResponse.json([blogSummaryDTO({ id: 9, title: 'Only Result' })])))
        render(<BlogPage posts={posts} />)
        await userEvent.type(searchBox(), 'x')
        await screen.findByRole('button', { name: /Only Result/ })

        await userEvent.click(screen.getByTitle('Clear search'))

        await waitFor(() => expect(card('NestJS Guards')).toBeInTheDocument())
        expect(screen.getByText('// 3 posts')).toBeInTheDocument()
    })

    it('still applies the tag filter on top of search results', async () => {
        server.use(
            http.get(searchUrl, () =>
                HttpResponse.json([
                    blogSummaryDTO({ id: 8, title: 'Found React', tags: ['react'] }),
                    blogSummaryDTO({ id: 9, title: 'Found Backend', tags: ['backend'] }),
                ]),
            ),
        )
        render(<BlogPage posts={posts} />)
        await userEvent.type(searchBox(), 'found')
        await screen.findByRole('button', { name: /Found React/ })

        await userEvent.click(screen.getByLabelText('#backend'))

        expect(card('Found Backend')).toBeInTheDocument()
        expect(queryCard('Found React')).not.toBeInTheDocument()
    })
})
