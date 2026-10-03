import { vi } from 'vitest'

// IApiClient's methods are generic (`get<T>(...) => Promise<T>`), which a plain
// mock can't satisfy precisely — so the mock functions return Promise<any>,
// which *is* assignable to any instantiation of T. Passes as an IApiClient.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsyncFn = (...args: any[]) => Promise<any>

// A fully mocked IApiClient for repository tests — no HTTP, no fetch.
export function createApiClientMock() {
    return {
        get: vi.fn<AsyncFn>(),
        post: vi.fn<AsyncFn>(),
        patch: vi.fn<AsyncFn>(),
        delete: vi.fn<AsyncFn>(),
    }
}
