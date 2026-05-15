// =============================================================================
// IApiClient
// Application port for HTTP communication.
// Infrastructure layer implements this — swappable without touching use cases.
// =============================================================================
export interface IApiClient {
  get<T>(path: string): Promise<T>
  post<T>(path: string, body: unknown): Promise<T>
}
