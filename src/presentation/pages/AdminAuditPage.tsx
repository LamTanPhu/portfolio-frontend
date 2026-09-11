'use client'
import { useEffect, useState, useCallback } from 'react'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../atoms/Button'
import { EmptyState } from '../atoms/EmptyState'
import { LoadingLine } from '../atoms/LoadingLine'
import { AdminPageHeader } from '../molecules/AdminPageHeader'
import { GetAuditLogsQuery } from '@/src/application/use-cases/queries/audit/GetAuditLogsQuery'
import type { AuditLogDTO } from '@/src/application/dtos/audit/AuditLogDTO'

const PAGE_SIZE = 30

function statusColor(status: number): string {
    if (status >= 500) return 'text-red-500'
    if (status >= 400) return 'text-amber-500'
    return 'text-(--accent-teal)'
}

const METHOD_COLOR: Record<string, string> = {
    GET:    'text-(--accent-blue) border-(--accent-blue)/30 bg-(--accent-blue)/10',
    POST:   'text-(--accent-teal) border-(--accent-teal)/30 bg-(--accent-teal)/10',
    PATCH:  'text-amber-400 border-amber-400/30 bg-amber-400/10',
    PUT:    'text-amber-400 border-amber-400/30 bg-amber-400/10',
    DELETE: 'text-red-400 border-red-400/30 bg-red-400/10',
}

function MethodPill({ method }: { method: string }) {
    const cls = METHOD_COLOR[method] ?? 'text-(--text-muted) border-(--border-muted) bg-transparent'
    return (
        <span className={`font-mono text-[10px] px-1.5 py-0.5 border w-16 text-center shrink-0 ${cls}`}>
            {method}
        </span>
    )
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
    const toast = useToast()

    const [entries, setEntries]       = useState<AuditLogDTO[]>([])
    const [total, setTotal]           = useState<number | null>(null)
    const [nextCursor, setNextCursor] = useState<number | null>(null)
    const [loading, setLoading]       = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)

    const loadFirstPage = useCallback(async () => {
        if (!accessToken) return
        setLoading(true)
        try {
            const page = await GetAuditLogsQuery.create().execute(accessToken, undefined, PAGE_SIZE)
            setEntries(page.items)
            setNextCursor(page.nextCursor)
            setTotal(page.total)
        } catch {
            toast.show('Failed to load audit log.', 'error')
        } finally {
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            toast.show('Failed to load more entries.', 'error')
        } finally {
            setLoadingMore(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-8">
            <AdminPageHeader icon={<ShieldAlert size={16} />} title="audit-log" count={total} />

            {loading ? (
                <LoadingLine />
            ) : entries.length === 0 ? (
                <EmptyState icon={<ShieldAlert size={28} />} message="no activity recorded yet." />
            ) : (
                <>
                    <div className="flex flex-col divide-y divide-(--border-muted) border border-(--border-muted)">
                        {entries.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between px-4 py-2.5 gap-3 hover:bg-(--bg-elevated) transition-colors duration-100">
                                <div className="flex items-center gap-3 min-w-0">
                                    <MethodPill method={entry.method} />
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
