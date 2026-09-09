'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../atoms/Button'
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

    const [messages, setMessages]     = useState<ContactMessageDTO[]>([])
    const [total, setTotal]           = useState<number | null>(null)
    const [nextCursor, setNextCursor] = useState<number | null>(null)
    const [loading, setLoading]       = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError]           = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [expandedId, setExpandedId] = useState<number | null>(null)

    const loadFirstPage = useCallback(async () => {
        if (!accessToken) return
        setLoading(true)
        try {
            const page = await GetContactMessagesQuery.create().execute(accessToken, undefined, PAGE_SIZE)
            setMessages(page.items)
            setNextCursor(page.nextCursor)
            setTotal(page.total)
        } catch {
            setError('Failed to load messages.')
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
            const page = await GetContactMessagesQuery.create().execute(accessToken, nextCursor, PAGE_SIZE)
            setMessages((prev) => [...prev, ...page.items])
            setNextCursor(page.nextCursor)
        } catch {
            setError('Failed to load more messages.')
        } finally {
            setLoadingMore(false)
        }
    }

    async function handleDelete(id: number) {
        if (!accessToken) return
        if (!window.confirm('Delete this message? This can\'t be undone.')) return

        setDeletingId(id)
        try {
            await DeleteContactMessageCommand.create().execute(id, accessToken)
            setMessages((prev) => prev.filter((m) => m.id !== id))
            setTotal((prev) => (prev !== null ? prev - 1 : prev))
        } catch {
            setError('Failed to delete — try again.')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-mono text-lg text-(--text-primary)">
                    <span className="text-(--text-muted)">_</span>contact-messages
                </h1>
                {total !== null && (
                    <span className="font-mono text-xs text-(--text-muted)">{total} total</span>
                )}
            </div>

            {error && <p className="font-mono text-xs text-red-500 mb-4">{error}</p>}

            {loading ? (
                <p className="font-mono text-sm text-(--text-muted)">loading...</p>
            ) : messages.length === 0 ? (
                <p className="font-mono text-sm text-(--text-muted)">no messages yet.</p>
            ) : (
                <>
                    <div className="flex flex-col divide-y divide-(--border-muted) border border-(--border-muted)">
                        {messages.map((msg) => {
                            const expanded = expandedId === msg.id
                            return (
                                <div key={msg.id} className="px-4 py-3">
                                    <button
                                        type="button"
                                        onClick={() => setExpandedId(expanded ? null : msg.id)}
                                        className="w-full flex items-center justify-between gap-3 text-left"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm text-(--text-primary) truncate">
                                                    {msg.name}
                                                </span>
                                                <span className="font-mono text-xs text-(--text-muted) truncate">
                                                    {msg.email}
                                                </span>
                                            </div>
                                            <p className="font-mono text-xs text-(--text-muted) truncate">
                                                {msg.message}
                                            </p>
                                        </div>
                                        <span className="font-mono text-[10px] text-(--text-muted) shrink-0">
                                            {new Date(msg.createdAt).toLocaleDateString()}
                                        </span>
                                    </button>

                                    {expanded && (
                                        <div className="mt-3 pt-3 border-t border-(--border-muted) flex flex-col gap-2">
                                            <p className="font-mono text-sm text-(--text-primary) whitespace-pre-wrap">
                                                {msg.message}
                                            </p>
                                            <p className="font-mono text-[11px] text-(--text-muted)">
                                                ip: {msg.ipAddress}
                                                {msg.browserInfo ? ` · ${msg.browserInfo}` : ''}
                                            </p>
                                            <div>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    disabled={deletingId === msg.id}
                                                    onClick={() => { void handleDelete(msg.id) }}
                                                >
                                                    {deletingId === msg.id ? '...' : 'delete'}
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
        </div>
    )
}
