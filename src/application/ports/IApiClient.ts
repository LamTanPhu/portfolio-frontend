// =============================================================================
// IApiClient
// Application port for HTTP communication.
// Infrastructure layer implements this — swappable without touching use cases.
// revalidate controls Next.js ISR cache duration (seconds). Default: 60.
// =============================================================================

export interface RequestOptions {
  // Sends/receives cookies — required for /auth/* (httpOnly refresh cookie).
  withCredentials?: boolean
  // Attaches `Authorization: Bearer <token>` — required for endpoints behind
  // JwtAuthGuard (logout, and all admin CRUD/read calls).
  accessToken?: string
}

// Kept as an alias — existing call sites import PostOptions specifically.
export type PostOptions = RequestOptions

export interface IApiClient {
  get<T>(path: string, revalidate?: number, options?: RequestOptions): Promise<T>
  post<T>(path: string, body: unknown, options?: RequestOptions): Promise<T>
  patch<T>(path: string, body: unknown, options?: RequestOptions): Promise<T>
  delete<T>(path: string, options?: RequestOptions): Promise<T>
}