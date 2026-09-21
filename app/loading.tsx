// app/loading.tsx
// Shown while an async page (e.g. app/blog/page.tsx awaiting loadBlogs())
// is fetching data, on both first load and client-side navigation. Every
// page composes its own VSCodeLayout rather than sharing one persistent
// Next layout, so without this file Next's default behavior would swap the
// *entire* shell — tab bar and status bar included — out for a blank
// screen and back. Reusing VSCodeLayout here keeps that chrome in place;
// activeTab intentionally matches no real tab, so nothing is highlighted
// until the real page (and its correct active tab) takes over.
import { VSCodeLayout } from '@/src/presentation/templates/VSCodeLayout'

export default function Loading() {
    return (
        <VSCodeLayout activeTab="loading" showSidebar={false}>
            <div className="flex items-center justify-center min-h-[60vh] lg:h-full glow-bg">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-(--text-muted)">loading</span>
                    <span className="w-2 h-4 bg-(--accent-teal) animate-pulse" aria-hidden />
                </div>
            </div>
        </VSCodeLayout>
    )
}
