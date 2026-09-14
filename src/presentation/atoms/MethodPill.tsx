const METHOD_COLOR: Record<string, string> = {
    GET:    'text-(--accent-blue) border-(--accent-blue)/30 bg-(--accent-blue)/10',
    POST:   'text-(--accent-teal) border-(--accent-teal)/30 bg-(--accent-teal)/10',
    PATCH:  'text-amber-400 border-amber-400/30 bg-amber-400/10',
    PUT:    'text-amber-400 border-amber-400/30 bg-amber-400/10',
    DELETE: 'text-red-400 border-red-400/30 bg-red-400/10',
}

// =============================================================================
// MethodPill — Atom
// Small colored badge for an HTTP method. Pulled out of AdminAuditPage so it
// can be reused anywhere an HTTP method needs to be displayed, and so the
// page component stays focused on composition rather than defining
// presentational pieces inline.
// =============================================================================
export function MethodPill({ method }: { method: string }) {
    const cls = METHOD_COLOR[method] ?? 'text-(--text-muted) border-(--border-muted) bg-transparent'
    return (
        <span className={`font-mono text-[10px] px-1.5 py-0.5 border w-16 text-center shrink-0 ${cls}`}>
            {method}
        </span>
    )
}