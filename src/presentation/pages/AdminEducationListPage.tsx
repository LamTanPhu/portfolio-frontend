'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { Button } from '../atoms/Button'
import { loadEducation } from '@/src/application/use-cases/queries/education/loadEducation'
import { DeleteEducationCommand } from '@/src/application/use-cases/commands/education/DeleteEducationCommand'
import type { EducationDTO } from '@/src/application/dtos/education/EducationDTO'

// =============================================================================
// AdminEducationListPage — Page
// Same limitation as Skill: GET /about/education is public-filtered only,
// so this list (and what's editable/deletable here) is limited to records
// currently public.
// =============================================================================
export function AdminEducationListPage() {
    const { accessToken } = useAuth()

    const [records, setRecords]       = useState<EducationDTO[] | null>(null)
    const [error, setError]           = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const refresh = useCallback(async () => {
        try {
            setRecords(await loadEducation())
        } catch {
            setError('Failed to load education records.')
        }
    }, [])

    useEffect(() => {
        void refresh()
    }, [refresh])

    async function handleDelete(id: number, label: string) {
        if (!accessToken) return
        if (!window.confirm(`Delete "${label}"? This can't be undone.`)) return

        setDeletingId(id)
        try {
            await DeleteEducationCommand.create().execute(id, accessToken)
            setRecords((prev) => prev?.filter((r) => r.id !== id) ?? null)
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
                    <span className="text-(--text-muted)">_</span>education
                </h1>
                <Link href="/admin/education/new">
                    <Button size="sm">+ new record</Button>
                </Link>
            </div>

            {error && <p className="font-mono text-xs text-red-500 mb-4">{error}</p>}

            {records === null ? (
                <p className="font-mono text-sm text-(--text-muted)">loading...</p>
            ) : records.length === 0 ? (
                <p className="font-mono text-sm text-(--text-muted)">no public education records yet.</p>
            ) : (
                <div className="flex flex-col divide-y divide-(--border-muted) border border-(--border-muted)">
                    {records.map((rec) => (
                        <div key={rec.id} className="flex items-center justify-between px-4 py-3">
                            <div className="flex flex-col min-w-0">
                                <span className="font-mono text-sm text-(--text-primary) truncate">
                                    {rec.degreeName}
                                </span>
                                <span className="font-mono text-xs text-(--text-muted) truncate">
                                    {rec.instituteName}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <Link
                                    href={`/admin/education/${rec.id}/edit`}
                                    className="font-mono text-xs text-(--text-muted) hover:text-(--text-primary) transition-colors"
                                >
                                    edit
                                </Link>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    disabled={deletingId === rec.id}
                                    onClick={() => { void handleDelete(rec.id, rec.degreeName) }}
                                >
                                    {deletingId === rec.id ? '...' : 'delete'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
