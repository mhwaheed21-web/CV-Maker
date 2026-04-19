import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useAuthStore from './store/authStore'
import { getMe } from './api/auth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import CVViewPage from './pages/CVViewPage'
import { Skeleton, ToastContainer } from './components/common'

function AuthGuard({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  const { setUser, logout } = useAuthStore()
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('access_token')))

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      return
    }

    getMe()
      .then((res) => setUser(res.data))
      .catch(() => logout())
      .finally(() => setLoading(false))
  }, [logout, setUser])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ubuntu-background p-4">
        <div className="surface-card w-full max-w-md p-6">
          <div className="mb-4 h-6 w-32 rounded bg-ubuntu-surfaceAlt" />
          <Skeleton className="mb-3 h-11 w-full" />
          <Skeleton className="mb-3 h-11 w-full" />
          <Skeleton className="mb-4 h-11 w-40" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/dashboard" element={<AuthGuard><DashboardPage /></AuthGuard>} />
        <Route path="/cv/:id" element={<AuthGuard><CVViewPage /></AuthGuard>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}