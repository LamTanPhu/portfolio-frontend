'use client'
import type { AuditLogDTO } from '@/src/application/dtos/audit/AuditLogDTO'
import { GetAuditLogsQuery } from '@/src/application/use-cases/queries/audit/GetAuditLogsQuery'
import { ShieldAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../atoms/Button'
import { EmptyState } from '../../atoms/EmptyState'
import { LoadingLine } from '../../atoms/LoadingLine'
import { MethodPill } from '../../atoms/MethodPill'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { AdminPageHeader } from '../../molecules/AdminPageHeader'

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
    const toast = useToast()

    // `entries === null` doubles as the initial-load flag, same pattern as
    // AdminBlogListPage — one fewer state variable than a separate `loading`
    // boolean, and one fewer render on mount.
    const [entries, setEntries]       = useState<AuditLogDTO[] | null>(null)
    const [total, setTotal]           = useState<number | null>(null)
    const [nextCursor, setNextCursor] = useState<number | null>(null)
    const [loadingMore, setLoadingMore] = useState(false)

    useEffect(() => {
        if (!accessToken) return
        let ignore = false

        void (async () => {
            try {
                const page = await GetAuditLogsQuery.create().execute(accessToken, undefined, PAGE_SIZE)
                if (ignore) return
                setEntries(page.items)
                setNextCursor(page.nextCursor)
                setTotal(page.total)
            } catch {
                if (!ignore) toast.show('Failed to load audit log.', 'error')
            }
        })()

        return () => { ignore = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken])

    async function loadMore() {
        if (!accessToken || nextCursor === null) return
        setLoadingMore(true)
        try {
            const page = await GetAuditLogsQuery.create().execute(accessToken, nextCursor, PAGE_SIZE)
            setEntries((prev) => [...(prev ?? []), ...page.items])
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

            {entries === null ? (
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
