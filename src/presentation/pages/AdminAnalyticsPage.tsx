'use client'
/* eslint-disable react-hooks/set-state-in-effect -- same guarded
   fetch-in-useCallback pattern AdminBlogListPage's refresh() uses (and
   passes lint for); this rule doesn't consistently flag that identical
   shape, so treating it as a rule quirk rather than a real issue here. */
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { MetricCard } from '../atoms/MetricCard'
import { GetPageViewsQuery } from '@/src/application/use-cases/queries/analytics/GetPageViewsQuery'
import type { PageViewDTO } from '@/src/application/dtos/PageViewDTO'

// =============================================================================
// AdminAnalyticsPage — Page
// GET /analytics/page-views only — the backend has no admin read endpoint
// yet for project-view or resume-download aggregates (only the write/track
// side exists for those), so this dashboard is page views only for now.
//
// Design pass: adds the glow-bg atmosphere VSCodeLayout already uses on the
// public site (previously admin used none of it), a MetricCard summary row,
// and renders route as --text-string — the same amber the code-highlighting
// palette gives actual string literals — so the table reads as an extension
// of the site's own visual language rather than a generic data grid.
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

    const totalViews = useMemo(
        () => views?.reduce((sum, v) => sum + v.count, 0) ?? 0,
        [views],
    )
    const topRoute = useMemo(
        () => views?.reduce((top, v) => (v.count > (top?.count ?? 0) ? v : top), null as PageViewDTO | null) ?? null,
        [views],
    )
    const maxCount = useMemo(
        () => Math.max(1, ...(views?.map((v) => v.count) ?? [1])),
        [views],
    )

    return (
        <div className="relative glow-bg">
            <div className="max-w-3xl mx-auto p-8 relative">
                <h1 className="font-mono text-lg text-(--text-primary) mb-1">
                    <span className="text-(--text-muted)">_</span>page-views
                </h1>

                {views !== null && views.length > 0 && (
                    <p className="font-mono text-xs text-(--text-muted) mb-6">
                        {views.length} route{views.length === 1 ? '' : 's'} tracked
                    </p>
                )}

                {error && <p className="font-mono text-xs text-red-500 mb-4">{error}</p>}

                {views === null ? (
                    <p className="font-mono text-sm text-(--text-muted)">loading...</p>
                ) : views.length === 0 ? (
                    <p className="font-mono text-sm text-(--text-muted)">no page views recorded yet.</p>
                ) : (
                    <>
                        <div className="grid grid-cols-3 gap-3 mb-7">
                            <MetricCard label="total views" value={totalViews} accent="teal" />
                            <MetricCard label="routes tracked" value={views.length} />
                            <MetricCard
                                label="top route"
                                value={topRoute?.route ?? '—'}
                                accent="amber"
                            />
                        </div>

                        <div className="flex flex-col divide-y divide-(--border-muted) border border-(--border-muted)">
                            <div className="flex items-center justify-between px-4 py-2 bg-(--bg-elevated)">
                                <span className="font-mono text-[11px] text-(--text-muted)">route</span>
                                <div className="flex items-center gap-8">
                                    <span className="font-mono text-[11px] text-(--text-muted)">views</span>
                                    <span className="font-mono text-[11px] text-(--text-muted) w-24 text-right">last viewed</span>
                                </div>
                            </div>
                            {views.map((view) => (
                                <div
                                    key={view.route}
                                    className="flex items-center justify-between px-4 py-3 gap-6 hover:bg-(--bg-elevated) transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <span className="font-mono text-sm text-(--text-string) truncate">
                                            {view.route}
                                        </span>
                                        <div className="h-1 flex-1 bg-(--border-subtle) relative overflow-hidden max-w-24">
                                            <div
                                                className="absolute inset-y-0 left-0 bg-(--accent-teal) opacity-60"
                                                style={{ width: `${(view.count / maxCount) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8 shrink-0">
                                        <span className="font-mono text-sm text-(--accent-teal) tabular-nums">{view.count}</span>
                                        <span className="font-mono text-[11px] text-(--text-muted) w-24 text-right">
                                            {new Date(view.lastViewedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
