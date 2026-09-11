'use client'
import { useEffect, useRef } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Button } from '../atoms/Button'

// =============================================================================
// ConfirmDialog — Molecule
// Controlled — parent owns open state. Replaces window.confirm() everywhere
// a destructive action (delete) needs confirmation, so the browser's native
// dialog never breaks the IDE illusion.
// =============================================================================
interface Props {
    open:         boolean
    title:        string
    message:      string
    confirmLabel?: string
    onConfirm:    () => void
    onCancel:     () => void
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'delete', onConfirm, onCancel }: Props) {
    const cancelRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        if (!open) return
        cancelRef.current?.focus()

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onCancel()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [open, onCancel])

    if (!open) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] animate-overlay-in"
            onClick={onCancel}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                onClick={(e) => e.stopPropagation()}
                className="animate-dialog-in w-full max-w-sm border border-(--border-muted) bg-(--bg-elevated) shadow-xl"
            >
                <div className="flex gap-3 px-5 pt-5 pb-4">
                    <span className="flex items-center justify-center w-8 h-8 shrink-0 border border-red-500/30 bg-red-500/10 text-red-400">
                        <TriangleAlert size={16} />
                    </span>
                    <div className="flex flex-col gap-1 pt-0.5">
                        <h2 id="confirm-dialog-title" className="font-mono text-sm text-(--text-primary)">
                            {title}
                        </h2>
                        <p className="font-mono text-xs text-(--text-muted) leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>
                <div className="flex justify-end gap-2 px-5 py-4 border-t border-(--border-subtle)">
                    <Button ref={cancelRef} type="button" variant="ghost" size="sm" onClick={onCancel}>
                        cancel
                    </Button>
                    <Button type="button" variant="danger" size="sm" onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    )
}
