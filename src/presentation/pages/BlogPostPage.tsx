import Link from 'next/link'
import { VSCodeLayout } from '../templates/VSCodeLayout'
import { BlogTag }      from '../atoms/BlogTag'
import type { BlogDetailDTO } from '@/src/application/dtos/blog/BlogDetailDTO'

// =============================================================================
// BlogPostPage — Page
// Full post view at /blog/[slug]. Server Component — `post` is fetched in
// app/blog/[slug]/page.tsx via loadBlogBySlug() and passed in as a prop.
// =============================================================================

function estimateReadingTime(content: string): string {
    const words   = content.trim().split(/\s+/).filter(Boolean).length
    const minutes = Math.max(1, Math.round(words / 200))
    return `~${minutes} min read`
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        year:  'numeric',
        month: 'short',
        day:   'numeric',
    })
}

interface Props {
    post: BlogDetailDTO
}

export function BlogPostPage({ post }: Props) {
    const date        = formatDate(post.publishedAt ?? post.createdAt)
    const readingTime = estimateReadingTime(post.content)

    return (
        <VSCodeLayout activeTab="blog" showSidebar={false}>
            <div className="flex flex-col h-full overflow-y-auto glow-bg">
                <article className="flex flex-col w-full max-w-3xl mx-auto p-8">

                    <Link
                        href="/blog"
                        className="font-mono text-sm text-(--accent-teal) hover:opacity-80 transition-opacity mb-6 w-fit"
                    >
                        ← back to blog
                    </Link>

                    <header className="flex flex-col gap-3 pb-6 border-b border-(--border-muted) mb-6">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-(--text-muted)">{date}</span>
                            <span className="font-mono text-[11px] text-(--text-muted)">·</span>
                            <span className="font-mono text-[11px] text-(--text-muted)">{readingTime}</span>
                        </div>
                        <h1 className="font-mono text-2xl text-(--text-primary) leading-snug">
                            {post.title}
                        </h1>
                        <div className="flex flex-wrap gap-1.5">
                            {post.tags.map((tag) => (
                                <BlogTag key={tag} label={tag} />
                            ))}
                        </div>
                    </header>

                    <div className="font-mono text-sm text-(--text-primary) leading-7 whitespace-pre-wrap">
                        {post.content}
                    </div>

                </article>
            </div>
        </VSCodeLayout>
    )
}