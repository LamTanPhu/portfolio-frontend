import type { IApiClient, PostOptions, RequestOptions } from '../../application/ports/IApiClient'
import { ApiError } from './httpClient'

// =============================================================================
// SnapshotFallbackApiClient
// Decorator over any IApiClient. Public, unauthenticated GETs fall back to a
// committed snapshot of the backend's responses (data/api-snapshot.json) when
// the backend is unreachable, slow or failing — so a sleeping free-tier
// backend can never fail a build or blank a page.
//
// Falls back on:   network errors, timeouts, unparseable bodies, 5xx, 429.
// Never falls back on:
//   - 4xx other than 429 — a genuine 404 must stay a 404 (the repositories
//     turn it into null / notFound()), never "stale data".
//   - authenticated reads (accessToken set) — admin screens must show live
//     data or an error, never a stale snapshot.
//   - paths missing from the snapshot — the original error is rethrown.
//   - post / patch / delete — pure passthrough.
// Server-only by design: only the server-side load*.ts composition roots use it.
// =============================================================================

export interface ApiSnapshot {
    generatedAt: string | null
    entries: Record<string, unknown>
}

export interface SnapshotFallbackInfo {
    path: string
    reason: string
    generatedAt: string | null
}

export interface SnapshotFallbackOptions {
    // Give up on the live request after this long and serve the snapshot.
    // 0 disables the timeout. Default 8000.
    timeoutMs?: number
    onFallback?: (info: SnapshotFallbackInfo) => void
}

export const DEFAULT_SNAPSHOT_TIMEOUT_MS = 8000

class SnapshotTimeoutError extends Error {
    constructor(ms: number) {
        super(`no response within ${ms}ms`)
        this.name = 'SnapshotTimeoutError'
    }
}

export class SnapshotFallbackApiClient implements IApiClient {
    constructor(
        private readonly inner: IApiClient,
        private readonly snapshot: ApiSnapshot,
        private readonly options: SnapshotFallbackOptions = {},
    ) {}

    async get<T>(path: string, revalidate?: number, options?: RequestOptions): Promise<T> {
        if (options?.accessToken) return this.inner.get<T>(path, revalidate, options)

        try {
            return await this.withTimeout(this.inner.get<T>(path, revalidate, options))
        } catch (err) {
            if (!this.canFallBack(err, path)) throw err

            this.options.onFallback?.({
                path,
                reason: err instanceof Error ? err.message : String(err),
                generatedAt: this.snapshot.generatedAt,
            })
            // Clone so a consumer mutating the result can't corrupt later reads.
            return structuredClone(this.snapshot.entries[path]) as T
        }
    }

    post<T>(path: string, body: unknown, options?: PostOptions): Promise<T> {
        return this.inner.post<T>(path, body, options)
    }

    patch<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
        return this.inner.patch<T>(path, body, options)
    }

    delete<T>(path: string, options?: RequestOptions): Promise<T> {
        return this.inner.delete<T>(path, options)
    }

    private canFallBack(err: unknown, path: string): boolean {
        if (!Object.hasOwn(this.snapshot.entries, path)) return false
        if (err instanceof ApiError) return err.status >= 500 || err.status === 429
        return true
    }

    private withTimeout<T>(promise: Promise<T>): Promise<T> {
        const ms = this.options.timeoutMs ?? DEFAULT_SNAPSHOT_TIMEOUT_MS
        if (ms <= 0) return promise

        return new Promise<T>((resolve, reject) => {
            const timer = setTimeout(() => reject(new SnapshotTimeoutError(ms)), ms)
            // Handlers on both outcomes: a request that settles after the timeout
            // fired is swallowed here instead of becoming an unhandled rejection.
            promise.then(
                (value) => { clearTimeout(timer); resolve(value) },
                (error: unknown) => { clearTimeout(timer); reject(error) },
            )
        })
    }
}
