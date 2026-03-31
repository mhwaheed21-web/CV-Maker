import { useState } from 'react'
import useAuthStore from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import ProfilePage from './ProfilePage'

export default function DashboardPage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState('profile')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>CV Maker</div>
        <nav style={styles.nav}>
          <button
            style={{ ...styles.navItem, ...(activePage === 'profile' ? styles.navActive : {}) }}
            onClick={() => setActivePage('profile')}
          >
            My Profile
          </button>
          <button
            style={{ ...styles.navItem, ...(activePage === 'generate' ? styles.navActive : {}) }}
            onClick={() => setActivePage('generate')}
          >
            Generate CV
          </button>
          <button
            style={{ ...styles.navItem, ...(activePage === 'cvs' ? styles.navActive : {}) }}
            onClick={() => setActivePage('cvs')}
          >
            My CVs
          </button>
        </nav>
        <div style={styles.userInfo}>
          <p style={styles.userName}>{user?.full_name}</p>
          <p style={styles.userEmail}>{user?.email}</p>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.main}>
        {activePage === 'profile' && <ProfilePage />}
        {activePage === 'generate' && (
          <div style={styles.placeholder}>
            <h2>Generate CV</h2>
            <p>Coming in Phase 3</p>
          </div>
        )}
        {activePage === 'cvs' && (
          <div style={styles.placeholder}>
            <h2>My CVs</h2>
            <p>Coming in Phase 3</p>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' },
  sidebar: { width: '240px', backgroundColor: '#1e293b', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 },
  logo: { color: '#fff', fontSize: '20px', fontWeight: '700', padding: '0 24px 24px' },
  nav: { display: 'flex', flexDirection: 'column', flex: 1 },
  navItem: { padding: '12px 24px', background: 'none', border: 'none', color: '#94a3b8', fontSize: '14px', textAlign: 'left', cursor: 'pointer' },
  navActive: { backgroundColor: '#334155', color: '#fff' },
  userInfo: { padding: '16px 24px', borderTop: '1px solid #334155' },
  userName: { color: '#fff', fontSize: '14px', margin: '0 0 2px' },
  userEmail: { color: '#64748b', fontSize: '12px', margin: '0 0 12px' },
  logoutBtn: { width: '100%', padding: '8px', borderRadius: '6px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px' },
  main: { flex: 1, overflowY: 'auto' },
  placeholder: { padding: '40px', color: '#666' },
}