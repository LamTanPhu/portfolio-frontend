import snapshot from '@/data/api-snapshot.json'
import type { IApiClient } from '../../application/ports/IApiClient'
import { HttpApiClient } from './HttpApiClient'
import { SnapshotFallbackApiClient, type SnapshotFallbackInfo } from './SnapshotFallbackApiClient'

// =============================================================================
// createServerApiClient
// The API client the server-side load*.ts loaders use: the normal HttpApiClient
// wrapped so public reads degrade to data/api-snapshot.json instead of failing.
// Regenerate the snapshot with `npm run snapshot` (see SNAPSHOT.md).
//
// SNAPSHOT_FALLBACK_TIMEOUT_MS (optional, runtime env): how long to wait for
// the live backend before serving the snapshot. 0 = wait indefinitely.
// =============================================================================

// console.* is stripped from production builds (next.config.ts removeConsole),
// so write to stderr directly — this must show up in build and host logs.
function logFallback({ path, reason, generatedAt }: SnapshotFallbackInfo): void {
    process.stderr.write(
        `[snapshot-fallback] GET ${path} failed (${reason}); serving snapshot generated ${generatedAt ?? 'never (placeholder)'}\n`,
    )
}

export function createServerApiClient(): IApiClient {
    const raw = process.env.SNAPSHOT_FALLBACK_TIMEOUT_MS
    const parsed = raw ? Number(raw) : NaN

    return new SnapshotFallbackApiClient(new HttpApiClient(), snapshot, {
        timeoutMs: Number.isFinite(parsed) ? parsed : undefined,
        onFallback: logFallback,
    })
}
