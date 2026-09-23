import { createContext } from 'react'

import type { User } from '../users/user.ts'

export interface AuthContextValue {
  currentUser: User | null
  login: (email: string, password: string) => Promise<User>
  loadCurrentUser: () => Promise<User>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
