import { Outlet } from 'react-router'

import { useAuth } from '../auth/useAuth.ts'
import './AppLayout.css'

export function AppLayout() {
  const { currentUser, logout } = useAuth()

  return (
    <>
      {currentUser && (
        <header className="topbar">
          <span className="brand">
            <span className="brand-mark" aria-hidden="true">
              IC
            </span>
            Interview Chat
          </span>
          <div className="topbar-user">
            <span className="avatar" aria-hidden="true">
              {currentUser.initials}
            </span>
            <span className="topbar-name">{currentUser.name}</span>
            <button className="btn btn-secondary btn-sm" type="button" onClick={logout}>
              Sign out
            </button>
          </div>
        </header>
      )}
      <Outlet />
    </>
  )
}
