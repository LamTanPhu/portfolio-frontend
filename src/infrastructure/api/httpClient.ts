// =============================================================================
// httpClient
// Typed HTTP client — wraps fetch with error handling and revalidation.
// =============================================================================
import { API_URL } from '@/lib/constants'
import type { PostOptions, RequestOptions } from '../../application/ports/IApiClient'

const BASE_URL = API_URL

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function get<T>(path: string, revalidate = 60, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (options.accessToken) {
    headers['Authorization'] = `Bearer ${options.accessToken}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers,
    next: { revalidate },
  })

  if (!res.ok) {
    throw new ApiError(res.status, `GET ${path} failed: ${res.status}`)
  }

  return res.json() as Promise<T>
}

export async function post<T>(path: string, body: unknown, options: PostOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (options.accessToken) {
    headers['Authorization'] = `Bearer ${options.accessToken}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method:      'POST',
    headers,
    body:        JSON.stringify(body),
    credentials: options.withCredentials ? 'include' : 'same-origin',
  })

  if (!res.ok) {
    throw new ApiError(res.status, `POST ${path} failed: ${res.status}`)
  }

  // Some endpoints return 204 No Content (e.g. logout) — res.json() throws
  // on an empty body, so read as text first and only parse if non-empty.
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export async function patch<T>(path: string, body: unknown, options: PostOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (options.accessToken) {
    headers['Authorization'] = `Bearer ${options.accessToken}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method:      'PATCH',
    headers,
    body:        JSON.stringify(body),
    credentials: options.withCredentials ? 'include' : 'same-origin',
  })

  if (!res.ok) {
    throw new ApiError(res.status, `PATCH ${path} failed: ${res.status}`)
  }

  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

// Named `del`, not `delete` — `delete` is a reserved word and cannot be used
// as a function declaration name. HttpApiClient's public `delete()` method
// (a valid method name — reserved-word rules don't apply there) calls this.
export async function del<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (options.accessToken) {
    headers['Authorization'] = `Bearer ${options.accessToken}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method:      'DELETE',
    headers,
    credentials: options.withCredentials ? 'include' : 'same-origin',
  })

  if (!res.ok) {
    throw new ApiError(res.status, `DELETE ${path} failed: ${res.status}`)
  }

  // Every DELETE endpoint on this backend returns 204 No Content.
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}