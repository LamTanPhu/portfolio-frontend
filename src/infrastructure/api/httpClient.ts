const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export async function get<T>(path: string): Promise<T> {
  const res = await fetch(${BASE_URL}, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(GET  failed: )
  return res.json() as Promise<T>
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(${BASE_URL}, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(POST  failed: )
  return res.json() as Promise<T>
}
