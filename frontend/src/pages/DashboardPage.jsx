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
    <div className="min-h-screen bg-ubuntu-background md:flex">
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-ubuntu-border bg-ubuntu-aubergine md:flex">
        <div className="border-b border-white/15 px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">Workspace</p>
          <img src={require('../assets/cv-maker-logo.svg')} alt="CV Maker Logo" className="h-8 mx-auto mb-2" />
          <p className="mt-2 text-2xl font-bold tracking-tight text-white">CV Maker</p>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-4">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`w-full rounded-xl2 px-4 py-3 text-left text-sm font-medium transition-all duration-250 ease-in-out ${
                activePage === item.key
                  ? 'border border-brand-400/40 bg-brand-500 text-white shadow-soft'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => setActivePage(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-white/15 px-6 py-5">
          <p className="truncate text-sm font-semibold text-white">{user?.full_name}</p>
          <p className="truncate text-xs text-white/70">{user?.email}</p>
          <button
            className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl2 border border-brand-400/40 bg-black/20 px-3 text-sm font-semibold text-white transition-all duration-250 ease-in-out hover:border-brand-300 hover:bg-brand-500/20"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="min-h-screen flex-1 pb-20 md:pb-0">
        <div className="sticky top-0 z-10 border-b border-ubuntu-border bg-ubuntu-surface/95 px-4 py-3 backdrop-blur md:hidden">
          <p className="text-sm font-semibold text-ubuntu-text">CV Maker</p>
          <p className="truncate text-xs text-ubuntu-muted">{user?.email}</p>
        </div>

        <div className="min-h-[calc(100vh-4.25rem)]">
        {activePage === 'profile' && <ProfilePage />}
        {activePage === 'generate' && <GeneratePage />}
        {activePage === 'cvs' && <CVListPage />}
        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-ubuntu-border bg-ubuntu-surface/95 px-2 py-2 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                className={`h-11 min-w-[44px] flex-1 rounded-xl2 px-3 text-xs font-semibold transition-all duration-250 ease-in-out ${
                  activePage === item.key
                    ? 'bg-brand-500 text-white shadow-soft'
                    : 'border border-ubuntu-border bg-ubuntu-surfaceAlt text-ubuntu-muted hover:border-brand-500/40 hover:text-ubuntu-text'
                }`}
                onClick={() => setActivePage(item.key)}
              >
                {item.label}
              </button>
            ))}

            <button
              className="h-11 min-w-[44px] rounded-xl2 border border-brand-400/40 bg-ubuntu-surfaceAlt px-4 text-xs font-semibold text-ubuntu-text transition-all duration-250 ease-in-out hover:bg-brand-500/20"
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