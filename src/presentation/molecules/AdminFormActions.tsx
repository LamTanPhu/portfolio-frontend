import { Loader2 } from 'lucide-react'
import { Button } from '../atoms/Button'

interface Props {
    submitting:   boolean
    canSubmit:    boolean
    submitLabel?: string
    error?:       string | null
    onCancel:     () => void
}

export function AdminFormActions({ submitting, canSubmit, submitLabel = 'save', error, onCancel }: Props) {
    return (
        <div className="sticky bottom-0 -mx-6 mt-2 px-6 py-4 border-t border-(--border-muted) bg-(--bg-surface)/95 backdrop-blur-sm flex items-center gap-3">
            <Button type="submit" disabled={submitting || !canSubmit} className="flex items-center gap-2">
                {submitting && <Loader2 size={13} className="animate-spin" />}
                {submitting ? 'saving...' : submitLabel}
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel}>
                cancel
            </Button>
            {error && <p className="font-mono text-xs text-red-500 ml-1">{error}</p>}
        </div>
    )
}
