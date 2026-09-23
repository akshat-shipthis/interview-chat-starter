import { apiFetch } from '../api/http.ts'
import type { User } from './user.ts'

export function getUsers(): Promise<User[]> {
  return apiFetch<User[]>('/api/users')
}
