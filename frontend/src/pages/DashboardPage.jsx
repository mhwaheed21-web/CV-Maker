import { useState } from 'react'
import useAuthStore from '../store/authStore'
import { useNavigate, useLocation } from 'react-router-dom'
import ProfilePage from './ProfilePage'
import GeneratePage from './GeneratePage'
import CVListPage from './CVListPage'

export default function DashboardPage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [activePage, setActivePage] = useState(location.state?.page || 'profile')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { key: 'profile', label: 'My Profile' },
    { key: 'generate', label: 'Generate CV' },
    { key: 'cvs', label: 'My CVs' },
  ]

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <aside className="hidden w-64 flex-shrink-0 flex-col bg-slate-900 md:flex">
        <div className="border-b border-slate-800 px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">Workspace</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-white">CV Maker</p>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-4">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                activePage === item.key
                  ? 'bg-slate-700 text-white shadow-card'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              onClick={() => setActivePage(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-800 px-6 py-5">
          <p className="truncate text-sm font-semibold text-white">{user?.full_name}</p>
          <p className="truncate text-xs text-slate-400">{user?.email}</p>
          <button
            className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-red-500 px-3 text-sm font-semibold text-white transition hover:bg-red-600"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="min-h-screen flex-1 pb-20 md:pb-0">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
          <p className="text-sm font-semibold text-slate-900">CV Maker</p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
        </div>

        <div className="min-h-[calc(100vh-4.25rem)]">
        {activePage === 'profile' && <ProfilePage />}
        {activePage === 'generate' && <GeneratePage />}
        {activePage === 'cvs' && <CVListPage />}
        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                className={`h-11 min-w-[44px] flex-1 rounded-lg px-3 text-xs font-semibold transition ${
                  activePage === item.key
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                onClick={() => setActivePage(item.key)}
              >
                {item.label}
              </button>
            ))}

            <button
              className="h-11 min-w-[44px] rounded-lg bg-red-500 px-4 text-xs font-semibold text-white transition hover:bg-red-600"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </nav>
      </main>
      </div>
  )
}