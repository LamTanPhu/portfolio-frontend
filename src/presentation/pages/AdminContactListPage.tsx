'use client'
import { useEffect, useState, useCallback } from 'react'
import { Inbox, Mail, Globe, ChevronDown, ChevronRight, Trash2, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../atoms/Button'
import { EmptyState } from '../atoms/EmptyState'
import { LoadingLine } from '../atoms/LoadingLine'
import { AdminPageHeader } from '../molecules/AdminPageHeader'
import { ConfirmDialog } from '../molecules/ConfirmDialog'
import { GetContactMessagesQuery } from '@/src/application/use-cases/queries/contact/GetContactMessagesQuery'
import { DeleteContactMessageCommand } from '@/src/application/use-cases/commands/contact/DeleteContactMessageCommand'
import type { ContactMessageDTO } from '@/src/application/dtos/ContactMessageDTO'

const PAGE_SIZE = 20

// =============================================================================
// AdminContactListPage — Page
// Cursor-paginated inbox for GET /contact. Every submitted message lands
// here — this is the only way to read them; there was previously no admin
// UI for this endpoint at all.
// =============================================================================
export function AdminContactListPage() {
    const { accessToken } = useAuth()
    const toast = useToast()

    const [messages, setMessages]     = useState<ContactMessageDTO[]>([])
    const [total, setTotal]           = useState<number | null>(null)
    const [nextCursor, setNextCursor] = useState<number | null>(null)
    const [loading, setLoading]       = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [pendingDelete, setPendingDelete] = useState<ContactMessageDTO | null>(null)

    const loadFirstPage = useCallback(async () => {
        if (!accessToken) return
        setLoading(true)
        try {
            const page = await GetContactMessagesQuery.create().execute(accessToken, undefined, PAGE_SIZE)
            setMessages(page.items)
            setNextCursor(page.nextCursor)
            setTotal(page.total)
        } catch {
            toast.show('Failed to load messages.', 'error')
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
            const page = await GetContactMessagesQuery.create().execute(accessToken, nextCursor, PAGE_SIZE)
            setMessages((prev) => [...prev, ...page.items])
            setNextCursor(page.nextCursor)
        } catch {
            toast.show('Failed to load more messages.', 'error')
        } finally {
            setLoadingMore(false)
        }
    }

    async function confirmDelete() {
        if (!accessToken || !pendingDelete) return
        const target = pendingDelete
        setPendingDelete(null)
        setDeletingId(target.id)
        try {
            await DeleteContactMessageCommand.create().execute(target.id, accessToken)
            setMessages((prev) => prev.filter((m) => m.id !== target.id))
            setTotal((prev) => (prev !== null ? prev - 1 : prev))
            toast.show(`Deleted message from ${target.name}.`, 'success')
        } catch {
            toast.show('Failed to delete — try again.', 'error')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-8">
            <AdminPageHeader
                icon={<Inbox size={16} />}
                title="contact-messages"
                count={total}
            />

            {loading ? (
                <LoadingLine />
            ) : messages.length === 0 ? (
                <EmptyState icon={<Inbox size={28} />} message="no messages yet." />
            ) : (
                <>
                    <div className="flex flex-col divide-y divide-(--border-muted) border border-(--border-muted)">
                        {messages.map((msg) => {
                            const expanded = expandedId === msg.id
                            return (
                                <div key={msg.id}>
                                    <button
                                        type="button"
                                        onClick={() => setExpandedId(expanded ? null : msg.id)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-(--bg-elevated) transition-colors duration-100"
                                    >
                                        <span className="text-(--text-muted) shrink-0">
                                            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm text-(--text-primary) truncate">
                                                    {msg.name}
                                                </span>
                                                <span className="font-mono text-xs text-(--text-muted) truncate">
                                                    {msg.email}
                                                </span>
                                            </div>
                                            {!expanded && (
                                                <p className="font-mono text-xs text-(--text-muted) truncate">
                                                    {msg.message}
                                                </p>
                                            )}
                                        </div>
                                        <span className="font-mono text-[10px] text-(--text-muted) shrink-0">
                                            {new Date(msg.createdAt).toLocaleDateString()}
                                        </span>
                                    </button>

                                    {expanded && (
                                        <div className="px-4 pb-4 pl-11 flex flex-col gap-3">
                                            <p className="font-mono text-sm text-(--text-primary) whitespace-pre-wrap leading-relaxed">
                                                {msg.message}
                                            </p>
                                            <div className="flex items-center gap-4 font-mono text-[11px] text-(--text-muted)">
                                                <span className="flex items-center gap-1"><Globe size={11} /> {msg.ipAddress}</span>
                                                {msg.browserInfo && (
                                                    <span className="flex items-center gap-1"><Mail size={11} /> {msg.browserInfo}</span>
                                                )}
                                            </div>
                                            <div>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    disabled={deletingId === msg.id}
                                                    onClick={() => setPendingDelete(msg)}
                                                    className="flex items-center gap-1.5"
                                                >
                                                    {deletingId === msg.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                                    delete
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
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

            <ConfirmDialog
                open={pendingDelete !== null}
                title="Delete message?"
                message={pendingDelete ? `The message from "${pendingDelete.name}" will be permanently removed. This can't be undone.` : ''}
                onConfirm={() => { void confirmDelete() }}
                onCancel={() => setPendingDelete(null)}
            />
        </div>
    )
}
