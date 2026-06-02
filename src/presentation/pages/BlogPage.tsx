'use client'
import { useState }       from 'react'
import { VSCodeLayout }   from '../templates/VSCodeLayout'
import { BlogCard }       from '../molecules/BlogCard'
import { BlogPreview }    from '../molecules/BlogPreview'
import { ActiveFilterTab } from '../molecules/ActiveFilterTab'
import { BlogSidebar } from '../organisms/BlogSidebar'

// =============================================================================
// BlogPage — Page
// Three column layout: tag filters | post list | post preview.
// Clicking a post loads its preview on the right without navigating.
// Full post lives at /blog/[slug].
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

const MOCK_POSTS: Post[] = [
    {
        id: 1,
        title:       'Clean Architecture in Next.js',
        slug:        'clean-architecture-nextjs',
        date:        '2025-01-10',
        readingTime: '8 min read',
        tags:        ['architecture', 'nextjs', 'typescript'],
        excerpt:     'How to structure a Next.js project with domain, application,\nand infrastructure layers that scale without turning into spaghetti.\nWe explore the dependency rule, repository pattern, and\nhow to keep your presentation layer dumb.',
    },
    {
        id: 2,
        title:       'Tailwind v4 — What Actually Changed',
        slug:        'tailwind-v4-changes',
        date:        '2025-02-03',
        readingTime: '5 min read',
        tags:        ['css', 'tailwind'],
        excerpt:     'CSS variable shorthand, no more JIT surprises, and why\nyou should move component styles to globals.css.\nA practical migration guide from v3 to v4 with real examples\nfrom a production codebase.',
    },
    {
        id: 3,
        title:       'Building a VS Code Themed Portfolio',
        slug:        'vscode-portfolio',
        date:        '2025-03-15',
        readingTime: '6 min read',
        tags:        ['design', 'react', 'css'],
        excerpt:     'The design decisions behind a developer portfolio that looks\nlike your editor. Why monospace fonts, dark navy, and amber\naccents work together — and how to build a layout system\nthat feels intentional rather than accidental.',
    },
    {
        id: 4,
        title:       'TypeScript Patterns I Actually Use',
        slug:        'typescript-patterns',
        date:        '2025-04-20',
        readingTime: '7 min read',
        tags:        ['typescript', 'architecture'],
        excerpt:     'Discriminated unions, const assertions, template literal types,\nand a few other patterns that show up in real codebases.\nNot a tour of every TypeScript feature — just the ones\nthat actually solve problems I keep running into.',
    },
]

export function BlogPage() {
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
        ? MOCK_POSTS
        : MOCK_POSTS.filter((p) =>
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
            <BlogSidebar selected={selectedTags} onChange={handleTagToggle} />

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
                // {filtered.length} post{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Post cards */}
            <div className="flex flex-col overflow-y-auto flex-1">
                {filtered.length === 0 ? (
                <div className="flex items-center justify-center flex-1 p-4">
                    <p className="font-mono text-xs text-(--text-muted) text-center">
                    // no posts match<br />selected tags
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