import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { apiFetch, setUnauthorizedHandler } from '../api/http.ts'
import type { User } from '../users/user.ts'
import type { LoginResponse } from './auth.types.ts'
import { AuthContext } from './authContext.ts'
import { clearToken, setToken } from './token.ts'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const logout = useCallback(() => {
    clearToken()
    setCurrentUser(null)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setToken(response.access_token)
    setCurrentUser(response.user)
    return response.user
  }, [])

  const loadCurrentUser = useCallback(async () => {
    const user = await apiFetch<User>('/api/auth/me')
    setCurrentUser(user)
    return user
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [logout])

  const value = useMemo(
    () => ({ currentUser, login, loadCurrentUser, logout }),
    [currentUser, login, loadCurrentUser, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
