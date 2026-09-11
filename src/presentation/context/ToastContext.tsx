'use client'
import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, XCircle, Info } from 'lucide-react'

// =============================================================================
// ToastContext — Context + Provider
// Scoped to the admin section (mounted once in AdminShell). Auto-dismisses
// after 3.5s. Deliberately minimal — no queue limits, no pause-on-hover;
// admin actions are infrequent enough that this doesn't need to be fancier.
// =============================================================================
type ToastType = 'success' | 'error' | 'info'

interface Toast {
    id:      number
    message: string
    type:    ToastType
}

interface ToastContextValue {
    show: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ICON: Record<ToastType, ReactNode> = {
    success: <CheckCircle2 size={15} className="text-(--accent-teal) shrink-0" />,
    error:   <XCircle size={15} className="text-red-400 shrink-0" />,
    info:    <Info size={15} className="text-(--accent-blue) shrink-0" />,
}

const BORDER: Record<ToastType, string> = {
    success: 'border-l-(--accent-teal)',
    error:   'border-l-red-500',
    info:    'border-l-(--accent-blue)',
}

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const show = useCallback((message: string, type: ToastType = 'success') => {
        const id = nextId++
        setToasts((prev) => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 3500)
    }, [])

    return (
        <ToastContext.Provider value={{ show }}>
            {children}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={[
                            'animate-toast-in pointer-events-auto flex items-center gap-2.5',
                            'px-4 py-3 min-w-64 max-w-sm border border-(--border-muted) border-l-2',
                            'bg-(--bg-elevated) shadow-lg font-mono text-xs text-(--text-primary)',
                            BORDER[toast.type],
                        ].join(' ')}
                    >
                        {ICON[toast.type]}
                        <span>{toast.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext)
    if (!ctx) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return ctx
}
