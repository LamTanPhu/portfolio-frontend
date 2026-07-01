// app/blog/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlogPostPage } from '@/src/presentation/pages/BlogPostPage'
import { loadBlogBySlug } from '@/src/application/use-cases/queries/blog/loadBlogBySlug'
import { loadBlogs } from '@/src/application/use-cases/queries/blog/loadBlogs'
import { SITE_URL } from '@/lib/constants'

interface Params {
    slug: string
}

// Pre-render every published post at build time — see rationale in
// app/projects/[slug]/page.tsx.
export async function generateStaticParams(): Promise<Params[]> {
    const posts = await loadBlogs()
    return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata(
    { params }: { params: Promise<Params> },
): Promise<Metadata> {
    const { slug } = await params
    const post = await loadBlogBySlug(slug)

    if (!post) return { title: 'Post not found' }

    const url         = `${SITE_URL}/blog/${post.slug}`
    const description = post.excerpt ?? post.content.slice(0, 160)
    const publishedAt = post.publishedAt ?? post.createdAt

    return {
        title:       post.title,
        description,
        alternates: { canonical: url },
        openGraph: {
            title:       post.title,
            description,
            url,
            type:        'article',
            publishedTime: publishedAt,
            tags:        post.tags,
        },
        twitter: {
            card:        'summary',
            title:       post.title,
            description,
        },
    }
}

export default async function Page({ params }: { params: Promise<Params> }) {
    const { slug } = await params
    const post = await loadBlogBySlug(slug)

    if (!post) notFound()

    return <BlogPostPage post={post} />
}