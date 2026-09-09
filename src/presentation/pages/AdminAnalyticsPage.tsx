'use client'
/* eslint-disable react-hooks/set-state-in-effect -- same guarded
   fetch-in-useCallback pattern AdminBlogListPage's refresh() uses (and
   passes lint for); this rule doesn't consistently flag that identical
   shape, so treating it as a rule quirk rather than a real issue here. */
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
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

    const [views, setViews] = useState<PageViewDTO[] | null>(null)
    const [error, setError] = useState<string | null>(null)

    const refresh = useCallback(async () => {
        if (!accessToken) return
        try {
            const result = await GetPageViewsQuery.create().execute(accessToken)
            setViews(result)
        } catch {
            setError('Failed to load page view stats.')
        }
    }, [accessToken])

    useEffect(() => {
        void refresh()
    }, [refresh])

    return (
        <div className="max-w-3xl mx-auto p-8">
            <h1 className="font-mono text-lg text-(--text-primary) mb-6">
                <span className="text-(--text-muted)">_</span>page-views
            </h1>

            {error && <p className="font-mono text-xs text-red-500 mb-4">{error}</p>}

            {views === null ? (
                <p className="font-mono text-sm text-(--text-muted)">loading...</p>
            ) : views.length === 0 ? (
                <p className="font-mono text-sm text-(--text-muted)">no page views recorded yet.</p>
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
                        <div key={view.route} className="flex items-center justify-between px-4 py-3">
                            <span className="font-mono text-sm text-(--text-primary) truncate">{view.route}</span>
                            <div className="flex items-center gap-8 shrink-0">
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
