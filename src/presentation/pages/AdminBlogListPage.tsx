'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { Button } from '../atoms/Button'
import { StatusBadge } from '../atoms/StatusBadge'
import { GetAllBlogsQuery } from '@/src/application/use-cases/queries/blog/GetAllBlogsQuery'
import { DeleteBlogCommand } from '@/src/application/use-cases/commands/blog/DeleteBlogCommand'
import type { BlogSummaryDTO } from '@/src/application/dtos/blog/BlogSummaryDTO'

// =============================================================================
// AdminBlogListPage — Page
// Every post including drafts (GET /blogs/admin). Client-fetched — needs
// the access token from AuthContext, which only exists in the browser.
// =============================================================================
export function AdminBlogListPage() {
    const { accessToken } = useAuth()

    const [posts, setPosts]     = useState<BlogSummaryDTO[] | null>(null)
    const [error, setError]     = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const refresh = useCallback(async () => {
        if (!accessToken) return
        try {
            const result = await GetAllBlogsQuery.create().execute(accessToken)
            setPosts(result)
        } catch {
            setError('Failed to load posts.')
        }
    }, [accessToken])

    useEffect(() => {
        void refresh()
    }, [refresh])

    async function handleDelete(id: number, title: string) {
        if (!accessToken) return
        if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return

        setDeletingId(id)
        try {
            await DeleteBlogCommand.create().execute(id, accessToken)
            setPosts((prev) => prev?.filter((p) => p.id !== id) ?? null)
        } catch {
            setError('Failed to delete — try again.')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-mono text-lg text-(--text-primary)">
                    <span className="text-(--text-muted)">_</span>blog-posts
                </h1>
                <Link href="/admin/blog/new">
                    <Button size="sm">+ new post</Button>
                </Link>
            </div>

            {error && <p className="font-mono text-xs text-red-500 mb-4">{error}</p>}

            {posts === null ? (
                <p className="font-mono text-sm text-(--text-muted)">loading...</p>
            ) : posts.length === 0 ? (
                <p className="font-mono text-sm text-(--text-muted)">no posts yet.</p>
            ) : (
                <div className="flex flex-col divide-y divide-(--border-muted) border border-(--border-muted)">
                    {posts.map((post) => (
                        <div key={post.id} className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <StatusBadge published={post.isPublished} />
                                <span className="font-mono text-sm text-(--text-primary) truncate">
                                    {post.title}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <Link
                                    href={`/admin/blog/${post.slug}/edit`}
                                    className="font-mono text-xs text-(--text-muted) hover:text-(--text-primary) transition-colors"
                                >
                                    edit
                                </Link>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    disabled={deletingId === post.id}
                                    onClick={() => { void handleDelete(post.id, post.title) }}
                                >
                                    {deletingId === post.id ? '...' : 'delete'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
