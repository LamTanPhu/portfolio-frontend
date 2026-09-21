'use client'
/* eslint-disable react-hooks/set-state-in-effect -- same rule quirk
   AdminAnalyticsPage documents: setting a loading flag synchronously before
   an async fetch kicked off by a dependency change (here, the debounced
   search query) is the standard pattern, not the "manually syncing state"
   case this rule is meant to catch. */
import { useEffect, useRef, useState } from 'react'
import { VSCodeLayout }   from '../templates/VSCodeLayout'
import { BlogCard }       from '../molecules/BlogCard'
import { BlogPreview }    from '../molecules/BlogPreview'
import { ActiveFilterTab } from '../molecules/ActiveFilterTab'
import { BlogSidebar } from '../organisms/BlogSidebar'
import { SearchInput } from '../atoms/SearchInput'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { SearchBlogsQuery } from '@/src/application/use-cases/queries/blog/SearchBlogsQuery'
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

    // Backend full-text search (GET /blogs/search) — separate from the tag
    // filter below, which only ever filters the already-fetched `allPosts`.
    // Debounced so we're not firing a request per keystroke (the endpoint is
    // also throttled server-side at 60 req/min).
    const [searchQuery, setSearchQuery]   = useState('')
    const debouncedQuery                  = useDebouncedValue(searchQuery, 300)
    const isSearching                     = debouncedQuery.trim().length > 0
    const [searchResults, setSearchResults] = useState<Post[]>([])
    const [searchLoading, setSearchLoading] = useState(false)
    const [searchError,   setSearchError]   = useState<string | null>(null)

    useEffect(() => {
        const trimmed = debouncedQuery.trim()
        if (trimmed.length === 0) {
            // Nothing to do — sourcePosts below only reads searchResults/
            // searchError while isSearching is true, so stale values here
            // are simply never rendered until the next real search.
            return
        }

        let cancelled = false
        setSearchLoading(true)
        setSearchError(null)

        SearchBlogsQuery.create().execute(trimmed)
            .then((dtos) => {
                if (cancelled) return
                setSearchResults(dtos.map(toPost))
            })
            .catch(() => {
                if (cancelled) return
                setSearchError('Search failed — check the backend is reachable.')
                setSearchResults([])
            })
            .finally(() => {
                if (!cancelled) setSearchLoading(false)
            })

        return () => { cancelled = true }
    }, [debouncedQuery])

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

    // While searching, the source list is the backend's search results
    // (already ranked/matched server-side); otherwise it's every post.
    // Tag selection still narrows either one client-side.
    const sourcePosts = isSearching ? searchResults : allPosts

    // Union filter — posts matching ANY selected tag
    const filtered = selectedTags.length === 0
        ? sourcePosts
        : sourcePosts.filter((p) =>
            p.tags.some((t) => selectedTags.includes(t))
        )

    // If selected post no longer in filtered list, deselect it
    const visiblePost = selectedPost && filtered.find((p) => p.id === selectedPost.id)
        ? selectedPost
        : null

    // Below lg, list and preview stack vertically instead of sitting
    // side by side, so picking a post from a long list wouldn't otherwise
    // visibly do anything until the user scrolls down manually.
    const previewRef = useRef<HTMLElement>(null)
    useEffect(() => {
        if (!visiblePost) return
        if (window.matchMedia('(min-width: 1024px)').matches) return
        previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, [visiblePost])

    return (
        <VSCodeLayout activeTab="blog" showSidebar={false}>
        <div className="flex flex-col lg:flex-row lg:h-full lg:overflow-hidden">

            {/* Tag filter sidebar */}
            <BlogSidebar tags={allTags} selected={selectedTags} onChange={handleTagToggle} />

            {/* Post list */}
            <div className="flex flex-col w-full lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-(--border-muted) lg:overflow-hidden">

            {/* Search box */}
            <div className="px-3 py-2.5 border-b border-(--border-muted) shrink-0">
                <SearchInput value={searchQuery} onChange={setSearchQuery} />
            </div>

            {/* Active filter tab */}
            <ActiveFilterTab
                selected={selectedTags.map((t) => `#${t}`)}
                onClear={handleClear}
            />

            {/* Post count */}
            <div className="px-4 py-2 border-b border-(--border-subtle) shrink-0">
                <span className="font-mono text-[11px] text-(--text-muted)">
                {isSearching && searchLoading
                    ? '// searching...'
                    : `// ${filtered.length} post${filtered.length !== 1 ? 's' : ''}`}
                </span>
            </div>

            {/* Post cards */}
            <div className="flex flex-col lg:overflow-y-auto flex-1">
                {isSearching && searchError ? (
                <div className="flex items-center justify-center flex-1 p-4">
                    <p className="font-mono text-xs text-red-500 text-center">{searchError}</p>
                </div>
                ) : filtered.length === 0 && !(isSearching && searchLoading) ? (
                <div className="flex items-center justify-center flex-1 p-4">
                    <p className="font-mono text-xs text-(--text-muted) text-center">
                    {isSearching
                        ? <>{'// no results for'}<br />&quot;{debouncedQuery.trim()}&quot;</>
                        : allPosts.length === 0
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
            <section ref={previewRef} className="w-full lg:flex-1 lg:overflow-hidden bg-[rgba(1,13,24,0.3)] glow-bg">
            <BlogPreview post={visiblePost} />
            </section>

        </div>
        </VSCodeLayout>
    )
}