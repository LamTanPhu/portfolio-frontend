// =============================================================================
// ContactSuccess — Molecule
// Shown after successful form submission.
// "Thank you!" with send-new-message button to reset.
// =============================================================================

interface Props {
    onReset: () => void
}

export function ContactSuccess({ onReset }: Props) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 h-full text-center px-8">
            <h2 className="font-mono text-2xl text-(--text-primary)">
                Thank you! 🤘
            </h2>
            <p className="font-mono text-sm text-(--text-muted) leading-relaxed">
                Your message has been accepted.<br />
                You will receive an answer soon!
            </p>
            <button
                onClick={onReset}
                className="font-mono text-sm font-semibold px-6 py-2.5 mt-2 bg-(--accent-amber) text-[#010d18] hover:opacity-90 transition-opacity"
            >
                send-new-message
            </button>
        </div>
    )
}