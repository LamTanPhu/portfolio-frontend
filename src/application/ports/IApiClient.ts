// =============================================================================
// IApiClient
// Application port for HTTP communication.
// Infrastructure layer implements this — swappable without touching use cases.
// revalidate controls Next.js ISR cache duration (seconds). Default: 60.
// =============================================================================

export interface PostOptions {
  // Sends/receives cookies — required for /auth/* (httpOnly refresh cookie).
  withCredentials?: boolean
  // Attaches `Authorization: Bearer <token>` — required for endpoints behind
  // JwtAuthGuard (e.g. logout, and all future admin CRUD calls).
  accessToken?: string
}

export interface IApiClient {
  get<T>(path: string, revalidate?: number): Promise<T>
  post<T>(path: string, body: unknown, options?: PostOptions): Promise<T>
}