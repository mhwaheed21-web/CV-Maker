import { useEffect, useState } from 'react'
import { listCVs, deleteCV } from '../api/cvs'
import { useNavigate } from 'react-router-dom'

export default function CVListPage() {
  const [cvs, setCvs] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    listCVs()
      .then((res) => setCvs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete this CV?')) return
    try {
      await deleteCV(id)
      setCvs(cvs.filter((cv) => cv.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    })
  }

  const statusColor = (status) => {
    if (status === 'complete') return '#16a34a'
    if (status === 'failed') return '#ef4444'
    return '#d97706'
  }

  if (loading) return <div style={{ padding: 40 }}>Loading CVs...</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>My CVs</h2>
        <button style={styles.generateBtn} onClick={() => navigate('/dashboard')}>
          + Generate New CV
        </button>
      </div>

      {cvs.length === 0 ? (
        <div style={styles.empty}>
          <p>No CVs generated yet.</p>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Go to Generate CV and paste a job description to get started.
          </p>
        </div>
      ) : (
        <div style={styles.list}>
          {cvs.map((cv) => (
            <div
              key={cv.id}
              style={styles.card}
              onClick={() => cv.status === 'complete' && navigate(`/cv/${cv.id}`, { state: { from: 'cvs' } })}
            >
              <div style={styles.cardLeft}>
                <div style={styles.cvTitle}>{cv.title}</div>
                <div style={styles.cvJD}>
                  {cv.job_description.slice(0, 100)}...
                </div>
                <div style={styles.cvMeta}>{formatDate(cv.created_at)}</div>
              </div>
              <div style={styles.cardRight}>
                <span style={{ ...styles.badge, color: statusColor(cv.status) }}>
                  {cv.status}
                </span>
                <button
                  style={styles.deleteBtn}
                  onClick={(e) => handleDelete(e, cv.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { padding: '32px', maxWidth: '860px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '24px', margin: 0 },
  generateBtn: { padding: '10px 18px', borderRadius: '8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px' },
  empty: { textAlign: 'center', padding: '60px 0', color: '#444' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px 24px', cursor: 'pointer' },
  cardLeft: { flex: 1 },
  cvTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '4px' },
  cvJD: { fontSize: '13px', color: '#666', marginBottom: '6px' },
  cvMeta: { fontSize: '12px', color: '#999' },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' },
  badge: { fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' },
  deleteBtn: { padding: '6px 12px', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '12px' },
}