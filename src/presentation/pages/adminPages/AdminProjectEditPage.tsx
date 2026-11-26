'use client'
import type { ProjectDTO } from '@/src/application/dtos/project/ProjectDTO'
import { GetProjectForAdminQuery } from '@/src/application/use-cases/queries/project/GetProjectForAdminQuery'
import { useEffect, useState } from 'react'
import { AdminNotFound } from '../../atoms/AdminNotFound'
import { LoadingLine } from '../../atoms/LoadingLine'
import { useAuth } from '../../context/AuthContext'
import { AdminProjectFormPage } from './AdminProjectFormPage'

// =============================================================================
// AdminProjectEditPage — Page
// Loads ONE project for the edit form through the admin-only, JWT-guarded route
// (GET /projects/admin/:slug), which returns drafts too. The public GET
// /projects/:slug answers 404 for an unpublished project, so it cannot feed this
// form. The access token lives only in AuthContext (browser memory), so this has
// to be a client-side fetch — a Server Component has no token to send.
// =============================================================================
interface Props {
    slug: string
}

export function AdminProjectEditPage({ slug }: Props) {
    const { accessToken } = useAuth()
    const [project, setProject] = useState<ProjectDTO | null | undefined>(undefined)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!accessToken) return
        let cancelled = false

        GetProjectForAdminQuery.create().execute(slug, accessToken)
            .then((result) => {
                if (cancelled) return
                setError(null)
                setProject(result)
            })
            .catch(() => {
                if (cancelled) return
                setError('Failed to load project — check the backend is reachable.')
            })

        return () => { cancelled = true }
    }, [slug, accessToken])

    if (error) {
        return <p className="font-mono text-xs text-red-500 p-8">{error}</p>
    }

    if (project === undefined) {
        return <LoadingLine />
    }

    if (project === null) {
        return (
            <AdminNotFound
                message="No project with that slug — it may have been deleted."
                backHref="/admin/projects"
                backLabel="back to projects"
            />
        )
    }

    return <AdminProjectFormPage mode="edit" project={project} />
}
