'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ScrollText, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../atoms/Button'
import { StatusBadge } from '../atoms/StatusBadge'
import { EmptyState } from '../atoms/EmptyState'
import { LoadingLine } from '../atoms/LoadingLine'
import { AdminPageHeader } from '../molecules/AdminPageHeader'
import { AdminListRow } from '../molecules/AdminListRow'
import { AdminRowActions } from '../molecules/AdminRowActions'
import { ConfirmDialog } from '../molecules/ConfirmDialog'
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
    const toast = useToast()

    const [posts, setPosts]           = useState<BlogSummaryDTO[] | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [pendingDelete, setPendingDelete] = useState<BlogSummaryDTO | null>(null)

    const refresh = useCallback(async () => {
        if (!accessToken) return
        try {
            const result = await GetAllBlogsQuery.create().execute(accessToken)
            setPosts(result)
        } catch {
            toast.show('Failed to load posts.', 'error')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken])

    useEffect(() => {
        void refresh()
    }, [refresh])

    async function confirmDelete() {
        if (!accessToken || !pendingDelete) return
        const target = pendingDelete
        setPendingDelete(null)
        setDeletingId(target.id)
        try {
            await DeleteBlogCommand.create().execute(target.id, accessToken)
            setPosts((prev) => prev?.filter((p) => p.id !== target.id) ?? null)
            toast.show(`Deleted "${target.title}".`, 'success')
        } catch {
            toast.show('Failed to delete — try again.', 'error')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-8">
            <AdminPageHeader
                icon={<ScrollText size={16} />}
                title="blog-posts"
                count={posts?.length ?? null}
                action={
                    <Link href="/admin/blog/new">
                        <Button size="sm" className="flex items-center gap-1.5"><Plus size={13} /> new post</Button>
                    </Link>
                }
            />

            {posts === null ? (
                <LoadingLine />
            ) : posts.length === 0 ? (
                <EmptyState icon={<ScrollText size={28} />} message="no posts yet." />
            ) : (
                <div className="flex flex-col divide-y divide-(--border-muted) border border-(--border-muted)">
                    {posts.map((post) => (
                        <AdminListRow
                            key={post.id}
                            leading={<StatusBadge published={post.isPublished} />}
                            title={post.title}
                            actions={
                                <AdminRowActions
                                    editHref={`/admin/blog/${post.slug}/edit`}
                                    onDelete={() => setPendingDelete(post)}
                                    deleting={deletingId === post.id}
                                />
                            }
                        />
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={pendingDelete !== null}
                title="Delete post?"
                message={pendingDelete ? `"${pendingDelete.title}" will be permanently removed. This can't be undone.` : ''}
                onConfirm={() => { void confirmDelete() }}
                onCancel={() => setPendingDelete(null)}
            />
        </div>
    )
}
