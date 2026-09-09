'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadSkills } from '@/src/application/use-cases/queries/skill/loadSkills'
import type { SkillDTO } from '@/src/application/dtos/skill/SkillDTO'
import { AdminSkillFormPage } from './AdminSkillFormPage'

// =============================================================================
// AdminSkillEditPage — Page
// The backend has no GET /skills/:id — only the public list. So editing by
// id means: fetch the public list, find the matching row client-side. If
// it's not there (wrong id, or the skill was made private and is now
// unreachable — see VisibilityWarning), say so instead of crashing.
// =============================================================================
interface Props {
    id: number
}

export function AdminSkillEditPage({ id }: Props) {
    const [skill, setSkill]   = useState<SkillDTO | null | undefined>(undefined)
    const [error, setError]   = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        loadSkills()
            .then((skills) => {
                if (cancelled) return
                setSkill(skills.find((s) => s.id === id) ?? null)
            })
            .catch(() => {
                if (cancelled) return
                setError('Failed to load skill.')
            })
        return () => { cancelled = true }
    }, [id])

    if (error) {
        return <p className="font-mono text-xs text-red-500 p-8">{error}</p>
    }

    if (skill === undefined) {
        return <p className="font-mono text-sm text-(--text-muted) p-8">loading...</p>
    }

    if (skill === null) {
        return (
            <div className="max-w-2xl mx-auto p-8 flex flex-col gap-3">
                <p className="font-mono text-sm text-(--text-muted)">
                    No public skill with that id — it may not exist, or it is currently
                    marked private (see the note on the form about why that hides it here too).
                </p>
                <Link href="/admin/skills" className="font-mono text-xs text-(--accent-teal) w-fit">
                    ← back to skills
                </Link>
            </div>
        )
    }

    return <AdminSkillFormPage mode="edit" skill={skill} />
}
