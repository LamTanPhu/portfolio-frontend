'use client'
/* eslint-disable react-hooks/set-state-in-effect -- same guarded
   fetch-in-useCallback pattern AdminBlogListPage's refresh() uses (and
   passes lint for); this rule doesn't consistently flag that identical
   shape, so treating it as a rule quirk rather than a real issue here. */
import { useEffect, useState, useCallback } from 'react'
import { BarChart3 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { EmptyState } from '../atoms/EmptyState'
import { LoadingLine } from '../atoms/LoadingLine'
import { AdminPageHeader } from '../molecules/AdminPageHeader'
import { GetPageViewsQuery } from '@/src/application/use-cases/queries/analytics/GetPageViewsQuery'
import type { PageViewDTO } from '@/src/application/dtos/PageViewDTO'

// =============================================================================
// AdminAnalyticsPage — Page
// GET /analytics/page-views only — the backend has no admin read endpoint
// yet for project-view or resume-download aggregates (only the write/track
// side exists for those), so this dashboard is page views only for now.
// =============================================================================
export function AdminAnalyticsPage() {
    const { accessToken } = useAuth()
    const toast = useToast()

    const [views, setViews] = useState<PageViewDTO[] | null>(null)

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

    useEffect(() => {
        void refresh()
    }, [refresh])

    const maxCount = views && views.length > 0 ? Math.max(...views.map((v) => v.count)) : 0

    return (
        <div className="max-w-3xl mx-auto p-8">
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
    )
}
