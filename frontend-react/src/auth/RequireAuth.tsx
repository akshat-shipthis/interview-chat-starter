import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router'

import { getToken } from './token.ts'
import { useAuth } from './useAuth.ts'

export function RequireAuth() {
  const { currentUser, loadCurrentUser } = useAuth()
  const [failed, setFailed] = useState(false)
  const hasToken = getToken() !== null

  useEffect(() => {
    if (!currentUser && hasToken) {
      loadCurrentUser().catch(() => setFailed(true))
    }
  }, [currentUser, hasToken, loadCurrentUser])

  if (currentUser) {
    return <Outlet />
  }
  if (!hasToken || failed) {
    return <Navigate to="/login" replace />
  }
  return null
}
