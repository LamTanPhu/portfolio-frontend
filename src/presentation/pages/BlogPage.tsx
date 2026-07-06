'use client'
import { useState }       from 'react'
import { VSCodeLayout }   from '../templates/VSCodeLayout'
import { BlogCard }       from '../molecules/BlogCard'
import { BlogPreview }    from '../molecules/BlogPreview'
import { ActiveFilterTab } from '../molecules/ActiveFilterTab'
import { BlogSidebar } from '../organisms/BlogSidebar'
import type { BlogSummaryDTO } from '@/src/application/dtos/blog/BlogSummaryDTO'

// =============================================================================
// BlogPage — Page
// Three column layout: tag filters | post list | post preview.
// Clicking a post loads its preview on the right without navigating.
// Full post lives at /blog/[slug].
//
// `posts` is fetched server-side in app/blog/page.tsx (via loadBlogs()) and
// passed in as a prop. This component only owns filter/selection UI state —
// it never fetches data itself.
// =============================================================================

interface Post {
    id:          number
    title:       string
    slug:        string
    date:        string
    excerpt:     string
    tags:        string[]
    readingTime: string
}

// BlogSummaryDTO carries no reading-time field (list view has no content),
// so it's estimated from the excerpt as a rough placeholder — the real
// figure (based on full content) is computed on the detail page.
function estimateReadingTime(text: string | null): string {
    const words   = (text ?? '').trim().split(/\s+/).filter(Boolean).length
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

function toPost(dto: BlogSummaryDTO): Post {
    return {
        id:          dto.id,
        title:       dto.title,
        slug:        dto.slug,
        date:        formatDate(dto.publishedAt ?? dto.createdAt),
        excerpt:     dto.excerpt ?? '',
        tags:        dto.tags,
        readingTime: estimateReadingTime(dto.excerpt),
    }
}

interface Props {
    posts: BlogSummaryDTO[]
}

export function BlogPage({ posts }: Props) {
    const allPosts = posts.map(toPost)

    // Unique tags actually in use, alphabetical — replaces the old
    // hardcoded filter list so it can't drift from real post data.
    const allTags = Array.from(new Set(allPosts.flatMap((p) => p.tags))).sort()

    const [selectedTags,    setSelectedTags]    = useState<string[]>([])
    const [selectedPost,    setSelectedPost]    = useState<Post | null>(null)

    function handleTagToggle(tag: string) {
        // strip leading # if present
        const clean = tag.startsWith('#') ? tag.slice(1) : tag
        setSelectedTags((prev) =>
        prev.includes(clean) ? prev.filter((t) => t !== clean) : [...prev, clean]
        )
    }

    function handleClear() {
        setSelectedTags([])
    }

    // Union filter — posts matching ANY selected tag
    const filtered = selectedTags.length === 0
        ? allPosts
        : allPosts.filter((p) =>
            p.tags.some((t) => selectedTags.includes(t))
        )

    // If selected post no longer in filtered list, deselect it
    const visiblePost = selectedPost && filtered.find((p) => p.id === selectedPost.id)
        ? selectedPost
        : null

    return (
        <VSCodeLayout activeTab="blog" showSidebar={false}>
        <div className="flex h-full overflow-hidden">

            {/* Tag filter sidebar */}
            <BlogSidebar tags={allTags} selected={selectedTags} onChange={handleTagToggle} />

            {/* Post list */}
            <div className="flex flex-col w-72 shrink-0 border-r border-(--border-muted) overflow-hidden">

            {/* Active filter tab */}
            <ActiveFilterTab
                selected={selectedTags.map((t) => `#${t}`)}
                onClear={handleClear}
            />

            {/* Post count */}
            <div className="px-4 py-2 border-b border-(--border-subtle) shrink-0">
                <span className="font-mono text-[11px] text-(--text-muted)">
                {`// ${filtered.length} post${filtered.length !== 1 ? 's' : ''}`}
                </span>
            </div>

            {/* Post cards */}
            <div className="flex flex-col overflow-y-auto flex-1">
                {filtered.length === 0 ? (
                <div className="flex items-center justify-center flex-1 p-4">
                    <p className="font-mono text-xs text-(--text-muted) text-center">
                    {allPosts.length === 0
                        ? '// no posts published yet'
                        : <>{'// no posts match'}<br />selected tags</>}
                    </p>
                </div>
                ) : (
                filtered.map((post) => (
                    <BlogCard
                    key={post.id}
                    title={post.title}
                    slug={post.slug}
                    date={post.date}
                    tags={post.tags}
                    isSelected={visiblePost?.id === post.id}
                    onClick={() => setSelectedPost(post)}
                    />
                ))
                )}
            </div>

            </div>

            {/* Preview panel */}
            <section className="flex-1 overflow-hidden bg-[rgba(1,13,24,0.3)] glow-bg">
            <BlogPreview post={visiblePost} />
            </section>

        </div>
        </VSCodeLayout>
    )
}