'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { Button } from '../atoms/Button'
import { Badge } from '../atoms/Badge'
import { loadSkills } from '@/src/application/use-cases/queries/skill/loadSkills'
import { DeleteSkillCommand } from '@/src/application/use-cases/commands/skill/DeleteSkillCommand'
import type { SkillDTO } from '@/src/application/dtos/skill/SkillDTO'

// =============================================================================
// AdminSkillListPage — Page
// The backend's GET /skills only ever returns public skills (there's no
// admin "everything" route like blogs/admin) — so this list, and therefore
// what's editable/deletable here, is limited to skills currently public.
// See VisibilityWarning on the form for what that means for the toggle.
// =============================================================================
export function AdminSkillListPage() {
    const { accessToken } = useAuth()

    const [skills, setSkills]         = useState<SkillDTO[] | null>(null)
    const [error, setError]           = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const refresh = useCallback(async () => {
        try {
            const result = await loadSkills()
            setSkills(result)
        } catch {
            setError('Failed to load skills.')
        }
    }, [])

    useEffect(() => {
        void refresh()
    }, [refresh])

    async function handleDelete(id: number, name: string) {
        if (!accessToken) return
        if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return

        setDeletingId(id)
        try {
            await DeleteSkillCommand.create().execute(id, accessToken)
            setSkills((prev) => prev?.filter((s) => s.id !== id) ?? null)
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
                    <span className="text-(--text-muted)">_</span>skills
                </h1>
                <Link href="/admin/skills/new">
                    <Button size="sm">+ new skill</Button>
                </Link>
            </div>

            {error && <p className="font-mono text-xs text-red-500 mb-4">{error}</p>}

            {skills === null ? (
                <p className="font-mono text-sm text-(--text-muted)">loading...</p>
            ) : skills.length === 0 ? (
                <p className="font-mono text-sm text-(--text-muted)">no public skills yet.</p>
            ) : (
                <div className="flex flex-col divide-y divide-(--border-muted) border border-(--border-muted)">
                    {skills.map((skill) => (
                        <div key={skill.id} className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <Badge label={skill.category} />
                                <span className="font-mono text-sm text-(--text-primary) truncate">
                                    {skill.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <Link
                                    href={`/admin/skills/${skill.id}/edit`}
                                    className="font-mono text-xs text-(--text-muted) hover:text-(--text-primary) transition-colors"
                                >
                                    edit
                                </Link>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    disabled={deletingId === skill.id}
                                    onClick={() => { void handleDelete(skill.id, skill.name) }}
                                >
                                    {deletingId === skill.id ? '...' : 'delete'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
