import { BlogTag } from '../atoms/BlogTag'

// =============================================================================
// BlogPreview — Molecule
// Right panel. Shows selected post excerpt + tags + read-more link.
// When nothing selected, shows a hint comment.
// =============================================================================

interface Post {
    title:       string
    slug:        string
    date:        string
    excerpt:     string
    tags:        string[]
    readingTime: string
}

interface Props {
    post: Post | null
}

export function BlogPreview({ post }: Props) {
    if (!post) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="font-mono text-sm text-(--text-muted)">
                // select a post to preview
                </p>
            </div>
        )
    }

    return (
        <article className="flex flex-col h-full p-8 overflow-y-auto">

        {/* Editor tab style header */}
        <header className="flex flex-col gap-3 pb-6 border-b border-(--border-muted) mb-6">
            <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-(--text-muted)">{post.date}</span>
            <span className="font-mono text-[11px] text-(--text-muted)">·</span>
            <span className="font-mono text-[11px] text-(--text-muted)">{post.readingTime}</span>
            </div>
            <h2 className="font-mono text-lg text-(--text-primary) leading-snug">
            {post.title}
            </h2>
            <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
                <BlogTag key={tag} label={tag} />
            ))}
            </div>
        </header>

        {/* Excerpt as JSDoc comment block */}
        <div className="flex flex-col gap-0 font-mono text-sm text-(--text-comment) leading-7 flex-1">
            <span>/**</span>
            {post.excerpt.split('\n').map((line, i) => (
            <span key={i}> * {line}</span>
            ))}
            <span> */</span>
        </div>

        {/* Read more */}
        <footer className="pt-6 mt-6 border-t border-(--border-muted) shrink-0">
            <a
            href={`/blog/${post.slug}`}
            title={`Read ${post.title}`}
            className="font-mono text-sm text-(--accent-teal) hover:opacity-80 transition-opacity"
            >
            read-more →
            </a>
        </footer>

        </article>
    )
}