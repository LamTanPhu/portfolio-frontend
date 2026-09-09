'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../atoms/Button'
import { GetAuditLogsQuery } from '@/src/application/use-cases/queries/audit/GetAuditLogsQuery'
import type { AuditLogDTO } from '@/src/application/dtos/audit/AuditLogDTO'

const PAGE_SIZE = 30

function statusColor(status: number): string {
    if (status >= 500) return 'text-red-500'
    if (status >= 400) return 'text-amber-500'
    return 'text-(--accent-teal)'
}

// =============================================================================
// AdminAuditPage — Page
// Recent-activity trail (create/update/delete + their status codes) — read
// only, cursor-paginated. See backend AuditLog model comment: short
// retention window, no before/after diff, "what happened recently" not a
// permanent record.
// =============================================================================
export function AdminAuditPage() {
    const { accessToken } = useAuth()

    const [entries, setEntries]       = useState<AuditLogDTO[]>([])
    const [total, setTotal]           = useState<number | null>(null)
    const [nextCursor, setNextCursor] = useState<number | null>(null)
    const [loading, setLoading]       = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError]           = useState<string | null>(null)

    const loadFirstPage = useCallback(async () => {
        if (!accessToken) return
        setLoading(true)
        try {
            const page = await GetAuditLogsQuery.create().execute(accessToken, undefined, PAGE_SIZE)
            setEntries(page.items)
            setNextCursor(page.nextCursor)
            setTotal(page.total)
        } catch {
            setError('Failed to load audit log.')
        } finally {
            setLoading(false)
        }
    }, [accessToken])

    useEffect(() => {
        void loadFirstPage()
    }, [loadFirstPage])

    async function loadMore() {
        if (!accessToken || nextCursor === null) return
        setLoadingMore(true)
        try {
            const page = await GetAuditLogsQuery.create().execute(accessToken, nextCursor, PAGE_SIZE)
            setEntries((prev) => [...prev, ...page.items])
            setNextCursor(page.nextCursor)
        } catch {
            setError('Failed to load more entries.')
        } finally {
            setLoadingMore(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-mono text-lg text-(--text-primary)">
                    <span className="text-(--text-muted)">_</span>audit-log
                </h1>
                {total !== null && (
                    <span className="font-mono text-xs text-(--text-muted)">{total} total</span>
                )}
            </div>

            {error && <p className="font-mono text-xs text-red-500 mb-4">{error}</p>}

            {loading ? (
                <p className="font-mono text-sm text-(--text-muted)">loading...</p>
            ) : entries.length === 0 ? (
                <p className="font-mono text-sm text-(--text-muted)">no activity recorded yet.</p>
            ) : (
                <>
                    <div className="flex flex-col divide-y divide-(--border-muted) border border-(--border-muted)">
                        {entries.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between px-4 py-2.5 gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="font-mono text-[11px] text-(--text-muted) w-14 shrink-0">
                                        {entry.method}
                                    </span>
                                    <span className="font-mono text-sm text-(--text-primary) truncate">
                                        {entry.route}
                                    </span>
                                    <span className="font-mono text-[11px] text-(--text-muted) truncate">
                                        {entry.entityType}{entry.entityId ? `#${entry.entityId}` : ''}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <span className={`font-mono text-xs tabular-nums ${statusColor(entry.statusCode)}`}>
                                        {entry.statusCode}
                                    </span>
                                    <span className="font-mono text-[10px] text-(--text-muted) w-32 text-right">
                                        {new Date(entry.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {nextCursor !== null && (
                        <div className="mt-4 flex justify-center">
                            <Button variant="ghost" size="sm" disabled={loadingMore} onClick={() => { void loadMore() }}>
                                {loadingMore ? 'loading...' : 'load more'}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
