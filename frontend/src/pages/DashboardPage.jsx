import useAuthStore from '../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>CV Maker Dashboard</h1>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div style={styles.card}>
        <h2>Welcome, {user?.full_name}!</h2>
        <p>Email: {user?.email}</p>
        <p style={styles.note}>Phase 2 coming next — profile management.</p>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '24px', margin: 0 },
  logoutBtn: { padding: '8px 16px', borderRadius: '8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer' },
  card: { backgroundColor: '#fff', padding: '32px', borderRadius: '12px', boxShadow: '0 2px 16px rgba(0,0,0,0.1)' },
  note: { color: '#666', marginTop: '16px' },
}