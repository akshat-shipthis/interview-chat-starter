import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'

import { AuthProvider } from './auth/AuthProvider.tsx'
import { RequireAuth } from './auth/RequireAuth.tsx'
import { AppLayout } from './layout/AppLayout.tsx'
import { Chat } from './pages/Chat.tsx'
import { Login } from './pages/Login.tsx'
import './styles.css'

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    element: <RequireAuth />,
    children: [{ element: <AppLayout />, children: [{ path: '/chat', element: <Chat /> }] }],
  },
  { path: '*', element: <Navigate to="/chat" replace /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
