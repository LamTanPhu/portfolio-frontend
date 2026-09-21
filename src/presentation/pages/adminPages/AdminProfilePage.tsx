'use client'
import type { User } from '@/src/domain/entities/User'
import { GetUserProfileQuery } from '@/src/application/use-cases/queries/user/GetUserProfileQuery'
import { UpdateUserProfileCommand } from '@/src/application/use-cases/commands/user/UpdateUserProfileCommand'
import { UserCog } from 'lucide-react'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { FormField } from '../../atoms/FormField'
import { LoadingLine } from '../../atoms/LoadingLine'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { AdminFormActions } from '../../molecules/AdminFormActions'
import { AdminPageHeader } from '../../molecules/AdminPageHeader'

// =============================================================================
// AdminProfilePage — Page
// The single admin's own account settings (GET/PATCH /user/profile).
// Unlike every other admin resource this has no list and no create mode —
// the backend always resolves the record from the JWT subject (see
// IUserReadRepository), so there is exactly one profile and this page is
// both its "view" and its "edit" form.
//
// email and lastLogin are read-only here — the backend's UpdateUserDto
// excludes both (this endpoint doesn't support changing email or password
// at all), so only firstname/lastname/aboutme are ever sent back.
// =============================================================================
export function AdminProfilePage() {
    const { accessToken } = useAuth()
    const toast = useToast()

    const [profile, setProfile]     = useState<User | null>(null)
    const [loadError, setLoadError] = useState<string | null>(null)

    const [firstname, setFirstname] = useState('')
    const [lastname, setLastname]   = useState('')
    const [aboutme, setAboutme]     = useState('')

    const [submitting, setSubmitting] = useState(false)
    const [error, setError]           = useState<string | null>(null)

    useEffect(() => {
        if (!accessToken) return
        let cancelled = false

        GetUserProfileQuery.create().execute(accessToken)
            .then((user) => {
                if (cancelled) return
                setProfile(user)
                setFirstname(user.firstname)
                setLastname(user.lastname)
                setAboutme(user.aboutme ?? '')
            })
            .catch(() => {
                if (cancelled) return
                setLoadError('Failed to load profile.')
            })

        return () => { cancelled = true }
    }, [accessToken])

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (!accessToken) return

        setSubmitting(true)
        setError(null)

        try {
            const updated = await UpdateUserProfileCommand.create().execute(
                { firstname, lastname, aboutme: aboutme || null },
                accessToken,
            )
            setProfile(updated)
            setFirstname(updated.firstname)
            setLastname(updated.lastname)
            setAboutme(updated.aboutme ?? '')
            toast.show('Profile updated.', 'success')
        } catch {
            setError('Failed to save — check the backend is reachable.')
        } finally {
            setSubmitting(false)
        }
    }

    function handleReset() {
        if (!profile) return
        setFirstname(profile.firstname)
        setLastname(profile.lastname)
        setAboutme(profile.aboutme ?? '')
        setError(null)
    }

    if (loadError) {
        return <p className="font-mono text-xs text-red-500 p-8">{loadError}</p>
    }

    if (profile === null) {
        return <LoadingLine />
    }

    return (
        <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
            <AdminPageHeader icon={<UserCog size={16} />} title="profile" />

            <form onSubmit={(e) => { void handleSubmit(e) }} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField label="firstname" value={firstname} onChange={setFirstname} placeholder="Tấn Phú" />
                    <FormField label="lastname" value={lastname} onChange={setLastname} placeholder="Lâm" />
                </div>

                <FormField
                    as="textarea"
                    label="aboutme"
                    value={aboutme}
                    onChange={setAboutme}
                    rows={6}
                    placeholder="Full-Stack Developer based in Ho Chi Minh City."
                />

                {/* Read-only — not editable via this endpoint */}
                <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-sm text-(--text-muted)">_email:</label>
                    <div className="w-full bg-[rgba(1,13,24,0.35)] font-mono text-sm text-(--text-muted) border border-(--border-subtle) px-4 py-3">
                        {profile.email}
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-sm text-(--text-muted)">_lastLogin:</label>
                    <div className="w-full bg-[rgba(1,13,24,0.35)] font-mono text-sm text-(--text-muted) border border-(--border-subtle) px-4 py-3">
                        {profile.lastLogin ? profile.lastLogin.toLocaleString() : 'never'}
                    </div>
                </div>

                <AdminFormActions
                    submitting={submitting}
                    canSubmit={firstname.length > 0 && lastname.length > 0}
                    cancelLabel="reset"
                    error={error}
                    onCancel={handleReset}
                />
            </form>
        </div>
    )
}
