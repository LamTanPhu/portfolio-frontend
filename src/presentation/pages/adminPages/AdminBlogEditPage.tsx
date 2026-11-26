'use client'
import type { BlogDetailDTO } from '@/src/application/dtos/blog/BlogDetailDTO'
import { GetBlogForAdminQuery } from '@/src/application/use-cases/queries/blog/GetBlogForAdminQuery'
import { useEffect, useState } from 'react'
import { AdminNotFound } from '../../atoms/AdminNotFound'
import { LoadingLine } from '../../atoms/LoadingLine'
import { useAuth } from '../../context/AuthContext'
import { AdminBlogFormPage } from './AdminBlogFormPage'

// =============================================================================
// AdminBlogEditPage — Page
// Loads ONE post for the edit form through the admin-only, JWT-guarded route
// (GET /blogs/admin/:slug), which returns drafts too. The public GET
// /blogs/:slug answers 404 for an unpublished post, so it cannot feed this form.
// The access token lives only in AuthContext (browser memory), so this has to
// be a client-side fetch — a Server Component has no token to send.
// =============================================================================
interface Props {
    slug: string
}

export function AdminBlogEditPage({ slug }: Props) {
    const { accessToken } = useAuth()
    const [post, setPost] = useState<BlogDetailDTO | null | undefined>(undefined)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!accessToken) return
        let cancelled = false

        GetBlogForAdminQuery.create().execute(slug, accessToken)
            .then((result) => {
                if (cancelled) return
                setError(null)
                setPost(result)
            })
            .catch(() => {
                if (cancelled) return
                setError('Failed to load post — check the backend is reachable.')
            })

        return () => { cancelled = true }
    }, [slug, accessToken])

    if (error) {
        return <p className="font-mono text-xs text-red-500 p-8">{error}</p>
    }

    if (post === undefined) {
        return <LoadingLine />
    }

    if (post === null) {
        return (
            <AdminNotFound
                message="No post with that slug — it may have been deleted."
                backHref="/admin/blog"
                backLabel="back to posts"
            />
        )
    }

    return <AdminBlogFormPage mode="edit" post={post} />
}
