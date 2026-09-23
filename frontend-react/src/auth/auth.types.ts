import type { User } from '../users/user.ts'

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}
