'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Tags, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../atoms/Button'
import { Badge } from '../atoms/Badge'
import { EmptyState } from '../atoms/EmptyState'
import { LoadingLine } from '../atoms/LoadingLine'
import { AdminPageHeader } from '../molecules/AdminPageHeader'
import { AdminListRow } from '../molecules/AdminListRow'
import { AdminRowActions } from '../molecules/AdminRowActions'
import { ConfirmDialog } from '../molecules/ConfirmDialog'
import { loadSkills } from '@/src/application/use-cases/queries/skill/loadSkills'
import { DeleteSkillCommand } from '@/src/application/use-cases/commands/skill/DeleteSkillCommand'
import type { SkillDTO } from '@/src/application/dtos/skill/SkillDTO'

// =============================================================================
// AdminSkillListPage — Page
// The backend's GET /skills only ever returns public skills (there's no
// admin "everything" route like blogs/admin) — so this list, and therefore
// what's editable/deletable here, is limited to skills currently public.
// =============================================================================
export function AdminSkillListPage() {
    const { accessToken } = useAuth()
    const toast = useToast()

    const [skills, setSkills]         = useState<SkillDTO[] | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [pendingDelete, setPendingDelete] = useState<SkillDTO | null>(null)

    const refresh = useCallback(async () => {
        try {
            const result = await loadSkills()
            setSkills(result)
        } catch {
            toast.show('Failed to load skills.', 'error')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        void refresh()
    }, [refresh])

    async function confirmDelete() {
        if (!accessToken || !pendingDelete) return
        const target = pendingDelete
        setPendingDelete(null)
        setDeletingId(target.id)
        try {
            await DeleteSkillCommand.create().execute(target.id, accessToken)
            setSkills((prev) => prev?.filter((s) => s.id !== target.id) ?? null)
            toast.show(`Deleted "${target.name}".`, 'success')
        } catch {
            toast.show('Failed to delete — try again.', 'error')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-8">
            <AdminPageHeader
                icon={<Tags size={16} />}
                title="skills"
                count={skills?.length ?? null}
                action={
                    <Link href="/admin/skills/new">
                        <Button size="sm" className="flex items-center gap-1.5"><Plus size={13} /> new skill</Button>
                    </Link>
                }
            />

            {skills === null ? (
                <LoadingLine />
            ) : skills.length === 0 ? (
                <EmptyState icon={<Tags size={28} />} message="no public skills yet." />
            ) : (
                <div className="flex flex-col divide-y divide-(--border-muted) border border-(--border-muted)">
                    {skills.map((skill) => (
                        <AdminListRow
                            key={skill.id}
                            leading={<Badge label={skill.category} />}
                            title={skill.name}
                            actions={
                                <AdminRowActions
                                    editHref={`/admin/skills/${skill.id}/edit`}
                                    onDelete={() => setPendingDelete(skill)}
                                    deleting={deletingId === skill.id}
                                />
                            }
                        />
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={pendingDelete !== null}
                title="Delete skill?"
                message={pendingDelete ? `"${pendingDelete.name}" will be permanently removed. This can't be undone.` : ''}
                onConfirm={() => { void confirmDelete() }}
                onCancel={() => setPendingDelete(null)}
            />
        </div>
    )
}
