import { environment } from '../environment.ts'
import { getToken } from '../auth/token.ts'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

let onUnauthorized: () => void = () => {}

export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${environment.apiUrl}${path}`, { ...init, headers })
  if (!response.ok) {
    if (response.status === 401 && token) {
      onUnauthorized()
    }
    throw new ApiError(response.status, response.statusText)
  }
  return response.json() as Promise<T>
}
