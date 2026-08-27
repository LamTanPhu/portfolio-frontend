import type { IApiClient, PostOptions, RequestOptions } from '../../application/ports/IApiClient'
import { get, post, patch, del } from './httpClient'

// =============================================================================
// HttpApiClient
// Concrete implementation of IApiClient using fetch-based httpClient.
// Passes revalidate through so callers retain ISR cache control.
// =============================================================================
export class HttpApiClient implements IApiClient {
    async get<T>(path: string, revalidate = 60, options?: RequestOptions): Promise<T> {
        return get<T>(path, revalidate, options)
    }

    async post<T>(path: string, body: unknown, options?: PostOptions): Promise<T> {
        return post<T>(path, body, options)
    }

    async patch<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
        return patch<T>(path, body, options)
    }

    async delete<T>(path: string, options?: RequestOptions): Promise<T> {
        return del<T>(path, options)
    }
}
