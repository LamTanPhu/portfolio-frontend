import { TriangleAlert } from 'lucide-react'

// =============================================================================
// VisibilityWarning — Atom
// Skill/Education/Job/Certification/SocialAccount/Project only expose a
// public-filtered list endpoint on this backend (no admin "show everything"
// route, unlike Blog's /blogs/admin). Turning this checkbox off removes the
// item from every list the admin UI can query — there's currently no way to
// find it again to re-publish or delete it short of the database directly.
// This warning is the honest way to expose the toggle anyway rather than
// hiding it, since the field is real and the backend does accept it.
// =============================================================================
export function VisibilityWarning() {
    return (
        <div className="flex gap-2.5 -mt-2 px-3 py-2.5 border border-amber-500/25 bg-amber-500/[0.06]">
            <TriangleAlert size={14} className="text-amber-500/80 shrink-0 mt-0.5" />
            <p className="font-mono text-[11px] text-amber-500/80 leading-relaxed">
                turning this off hides the item from every admin list too — there
                is no way to find it again here to re-publish or delete it until the
                backend adds an admin listing endpoint for this resource.
            </p>
        </div>
    )
}
