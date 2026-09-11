export function LoadingLine({ label = 'loading' }: { label?: string }) {
    return (
        <div className="flex items-center gap-2 py-16 justify-center">
            <span className="font-mono text-sm text-(--text-muted)">{label}</span>
            <span className="w-2 h-4 bg-(--accent-teal) animate-pulse" aria-hidden />
        </div>
    )
}
