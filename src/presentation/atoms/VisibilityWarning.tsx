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
        <p className="font-mono text-[11px] text-amber-500/80 -mt-3 leading-relaxed">
            ⚠ turning this off hides the item from every admin list too — there
            is no way to find it again here to re-publish or delete it until the
            backend adds an admin listing endpoint for this resource.
        </p>
    )
}
