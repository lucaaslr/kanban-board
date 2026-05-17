const TOKEN_KEY = 'kanban-token'

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? ''
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`)

  return res.json() as Promise<T>
}

export const api = {
  get:   <T>(path: string)                  => request<T>('GET',    path),
  post:  <T>(path: string, body: unknown)   => request<T>('POST',   path, body),
  put:   <T>(path: string, body: unknown)   => request<T>('PUT',    path, body),
  patch: <T>(path: string, body: unknown)   => request<T>('PATCH',  path, body),
  del:   <T>(path: string)                  => request<T>('DELETE', path),
}
