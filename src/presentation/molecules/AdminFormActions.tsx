import { Loader2 } from 'lucide-react'
import { Button } from '../atoms/Button'

interface Props {
    submitting:   boolean
    canSubmit:    boolean
    submitLabel?: string
    cancelLabel?: string
    error?:       string | null
    onCancel:     () => void
}

export function AdminFormActions({ submitting, canSubmit, submitLabel = 'save', cancelLabel = 'cancel', error, onCancel }: Props) {
    return (
        <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 mt-2 px-4 sm:px-6 lg:px-8 py-4 border-t border-(--border-muted) bg-(--bg-surface)/95 backdrop-blur-sm flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={submitting || !canSubmit} className="flex items-center gap-2">
                {submitting && <Loader2 size={13} className="animate-spin" />}
                {submitting ? 'saving...' : submitLabel}
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel}>
                {cancelLabel}
            </Button>
            {error && <p className="font-mono text-xs text-red-500 ml-1">{error}</p>}
        </div>
    )
}
