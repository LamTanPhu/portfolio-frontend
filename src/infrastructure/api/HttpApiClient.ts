import type { IApiClient, PostOptions } from '../../application/ports/IApiClient'
import { get, post }       from './httpClient'

// =============================================================================
// HttpApiClient
// Concrete implementation of IApiClient using fetch-based httpClient.
// Passes revalidate through so callers retain ISR cache control.
// =============================================================================
export class HttpApiClient implements IApiClient {
    async get<T>(path: string, revalidate = 60): Promise<T> {
        return get<T>(path, revalidate)
    }

    async post<T>(path: string, body: unknown, options?: PostOptions): Promise<T> {
        return post<T>(path, body, options)
    }
}