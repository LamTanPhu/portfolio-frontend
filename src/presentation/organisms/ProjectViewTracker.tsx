'use client'
import { useEffect } from 'react'
import { TrackProjectViewCommand } from '@/src/application/use-cases/commands/analytics/TrackProjectViewCommand'

// =============================================================================
// ProjectViewTracker
// Fires a project-view ping once on mount. Renders nothing.
//
// Separate from PageViewTracker (which handles the generic page-view ping
// for every route via the root layout) — this is the project-specific
// counter the backend uses for its own project-view stat. Rendered as a
// child of ProjectDetailPage, a Server Component, so the tracking side
// effect stays isolated to this one client boundary.
// =============================================================================
interface Props {
    projectId: number
}

export function ProjectViewTracker({ projectId }: Props) {
    useEffect(() => {
        TrackProjectViewCommand.create().execute(projectId)
    }, [projectId])

    return null
}