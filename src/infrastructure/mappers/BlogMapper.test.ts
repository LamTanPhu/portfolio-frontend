import { describe, expect, it } from 'vitest'
import { Blog, BlogSummary } from '@/src/domain/entities/Blog'
import { blogDetailDTO, blogSummaryDTO } from '@/src/test/fixtures'
import { BlogMapper } from './BlogMapper'

describe('BlogMapper', () => {
    describe('toDomainSummary', () => {
        it('maps a list-view DTO to a BlogSummary entity', () => {
            const summary = BlogMapper.toDomainSummary(blogSummaryDTO({ id: 7, title: 'T', slug: 't', tags: ['a', 'b'] }))

            expect(summary).toBeInstanceOf(BlogSummary)
            expect(summary).toMatchObject({ id: 7, title: 'T', slug: 't', tags: ['a', 'b'], isPublished: true })
        })

        it('converts ISO date strings into real Date objects', () => {
            const summary = BlogMapper.toDomainSummary(
                blogSummaryDTO({ publishedAt: '2025-03-01T10:00:00.000Z', createdAt: '2025-02-28T09:00:00.000Z' }),
            )

            expect(summary.publishedAt).toBeInstanceOf(Date)
            expect(summary.publishedAt?.toISOString()).toBe('2025-03-01T10:00:00.000Z')
            expect(summary.createdAt.toISOString()).toBe('2025-02-28T09:00:00.000Z')
        })

        it('keeps publishedAt as null for an unpublished draft instead of producing an Invalid Date', () => {
            const summary = BlogMapper.toDomainSummary(blogSummaryDTO({ isPublished: false, publishedAt: null }))

            expect(summary.publishedAt).toBeNull()
        })

        it('keeps a null excerpt as null', () => {
            expect(BlogMapper.toDomainSummary(blogSummaryDTO({ excerpt: null })).excerpt).toBeNull()
        })

        it('does not carry post content (list view never loads it)', () => {
            const summary = BlogMapper.toDomainSummary(blogDetailDTO({ content: 'secret body' }))

            expect(summary).not.toHaveProperty('content')
        })
    })

    describe('toDomain', () => {
        it('maps a detail DTO to a Blog entity including content and updatedAt', () => {
            const blog = BlogMapper.toDomain(blogDetailDTO({ content: 'Body', updatedAt: '2025-03-02T11:00:00.000Z' }))

            expect(blog).toBeInstanceOf(Blog)
            expect(blog.content).toBe('Body')
            expect(blog.updatedAt).toBeInstanceOf(Date)
            expect(blog.updatedAt.toISOString()).toBe('2025-03-02T11:00:00.000Z')
        })

        it('keeps publishedAt as null for a draft', () => {
            expect(BlogMapper.toDomain(blogDetailDTO({ publishedAt: null })).publishedAt).toBeNull()
        })
    })
})
