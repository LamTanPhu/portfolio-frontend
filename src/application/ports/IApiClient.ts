// =============================================================================
// IApiClient
// Application port for HTTP communication.
// Infrastructure layer implements this — swappable without touching use cases.
// revalidate controls Next.js ISR cache duration (seconds). Default: 60.
// =============================================================================
export interface IApiClient {
  get<T>(path: string, revalidate?: number): Promise<T>
  post<T>(path: string, body: unknown): Promise<T>
}