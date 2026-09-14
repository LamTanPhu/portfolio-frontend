'use client'
/* eslint-disable react-hooks/set-state-in-effect -- same guarded
   fetch-in-useCallback pattern AdminBlogListPage's refresh() uses (and
   passes lint for); this rule doesn't consistently flag that identical
   shape, so treating it as a rule quirk rather than a real issue here. */
import type { PageViewDTO } from '@/src/application/dtos/PageViewDTO'
import { GetPageViewsQuery } from '@/src/application/use-cases/queries/analytics/GetPageViewsQuery'
import { GetProjectViewsQuery } from '@/src/application/use-cases/queries/analytics/GetProjectViewsQuery'
import { loadProjects } from '@/src/application/use-cases/queries/project/loadProjects'
import { BarChart3, FolderCode } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { EmptyState } from '../../atoms/EmptyState'
import { LoadingLine } from '../../atoms/LoadingLine'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { AdminPageHeader } from '../../molecules/AdminPageHeader'

interface ProjectViewRow {
    id:         number
    name:       string
    totalViews: number
    lastViewed: string | null
}

// =============================================================================
// AdminAnalyticsPage — Page
// Two independent sections: page views (GET /analytics/page-views) and
// per-project views (GET /analytics/project-views/:id — one call per
// project, since there's no bulk endpoint; fine at personal-portfolio
// project counts).
//
// Project list comes from loadProjects() (GET /projects, published only) —
// same limitation AdminProjectListPage already carries: there's no admin
// "everything" route for projects, so an unpublished draft's views won't
// show here until it's published. Resume downloads still have no admin
// read endpoint at all, so they're not shown anywhere yet.
// =============================================================================
export function AdminAnalyticsPage() {
    const { accessToken } = useAuth()
    const toast = useToast()

    const [views, setViews] = useState<PageViewDTO[] | null>(null)
    const [projectViews, setProjectViews] = useState<ProjectViewRow[] | null>(null)

    const refresh = useCallback(async () => {
        if (!accessToken) return
        try {
            const result = await GetPageViewsQuery.create().execute(accessToken)
            setViews(result)
        } catch {
            toast.show('Failed to load page view stats.', 'error')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken])

    const refreshProjectViews = useCallback(async () => {
        if (!accessToken) return
        try {
            const projects = await loadProjects()
            const rows = await Promise.all(
                projects.map(async (project): Promise<ProjectViewRow> => {
                    const stats = await GetProjectViewsQuery.create().execute(project.id, accessToken)
                    return {
                        id: project.id,
                        name: project.name,
                        totalViews: stats.totalViews,
                        lastViewed: stats.daily[0]?.date ?? null,
                    }
                }),
            )
            rows.sort((a, b) => b.totalViews - a.totalViews)
            setProjectViews(rows)
        } catch {
            toast.show('Failed to load project view stats.', 'error')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken])

    useEffect(() => {
        void refresh()
        void refreshProjectViews()
    }, [refresh, refreshProjectViews])

    const maxCount = views && views.length > 0 ? Math.max(...views.map((v) => v.count)) : 0
    const maxProjectCount =
        projectViews && projectViews.length > 0 ? Math.max(...projectViews.map((p) => p.totalViews)) : 0

    return (
        <div className="max-w-3xl mx-auto p-8 flex flex-col gap-10">
            <div>
                <AdminPageHeader icon={<BarChart3 size={16} />} title="page-views" count={views?.length ?? null} />

                {views === null ? (
                    <LoadingLine />
                ) : views.length === 0 ? (
                    <EmptyState icon={<BarChart3 size={28} />} message="no page views recorded yet." />
                ) : (
                    <div className="flex flex-col divide-y divide-(--border-muted) border border-(--border-muted)">
                        <div className="flex items-center justify-between px-4 py-2 bg-(--bg-elevated)">
                            <span className="font-mono text-[11px] text-(--text-muted)">route</span>
                            <div className="flex items-center gap-8">
                                <span className="font-mono text-[11px] text-(--text-muted)">views</span>
                                <span className="font-mono text-[11px] text-(--text-muted) w-24 text-right">last viewed</span>
                            </div>
                        </div>
                        {views.map((view) => (
                            <div key={view.route} className="relative flex items-center justify-between px-4 py-3 overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 bg-(--accent-teal)/6"
                                    style={{ width: `${maxCount > 0 ? (view.count / maxCount) * 100 : 0}%` }}
                                    aria-hidden
                                />
                                <span className="relative font-mono text-sm text-(--text-primary) truncate">{view.route}</span>
                                <div className="relative flex items-center gap-8 shrink-0">
                                    <span className="font-mono text-sm text-(--accent-teal) tabular-nums">{view.count}</span>
                                    <span className="font-mono text-[11px] text-(--text-muted) w-24 text-right">
                                        {new Date(view.lastViewedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <AdminPageHeader
                    icon={<FolderCode size={16} />}
                    title="project-views"
                    count={projectViews?.length ?? null}
                />

                {projectViews === null ? (
                    <LoadingLine />
                ) : projectViews.length === 0 ? (
                    <EmptyState icon={<FolderCode size={28} />} message="no project views recorded yet." />
                ) : (
                    <div className="flex flex-col divide-y divide-(--border-muted) border border-(--border-muted)">
                        <div className="flex items-center justify-between px-4 py-2 bg-(--bg-elevated)">
                            <span className="font-mono text-[11px] text-(--text-muted)">project</span>
                            <div className="flex items-center gap-8">
                                <span className="font-mono text-[11px] text-(--text-muted)">views</span>
                                <span className="font-mono text-[11px] text-(--text-muted) w-24 text-right">last viewed</span>
                            </div>
                        </div>
                        {projectViews.map((project) => (
                            <div
                                key={project.id}
                                className="relative flex items-center justify-between px-4 py-3 overflow-hidden"
                            >
                                <div
                                    className="absolute inset-y-0 left-0 bg-(--accent-teal)/6"
                                    style={{
                                        width: `${maxProjectCount > 0 ? (project.totalViews / maxProjectCount) * 100 : 0}%`,
                                    }}
                                    aria-hidden
                                />
                                <span className="relative font-mono text-sm text-(--text-primary) truncate">
                                    {project.name}
                                </span>
                                <div className="relative flex items-center gap-8 shrink-0">
                                    <span className="font-mono text-sm text-(--accent-teal) tabular-nums">
                                        {project.totalViews}
                                    </span>
                                    <span className="font-mono text-[11px] text-(--text-muted) w-24 text-right">
                                        {project.lastViewed ? new Date(project.lastViewed).toLocaleDateString() : '—'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
