import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getCV, downloadCV, previewCVUrl } from '../api/cvs'

export default function CVViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || 'cvs'
  const [cv, setCv] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    getCV(id)
      .then((res) => setCv(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const res = await downloadCV(id)
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${cv?.title || 'cv'}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return <div style={{ padding: 40 }}>Loading CV...</div>
  if (!cv) return <div style={{ padding: 40 }}>CV not found</div>

  const previewUrl = `${previewCVUrl(id)}?token=${localStorage.getItem('access_token')}`

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard', { state: { page: from } })}>
          ← Back
        </button>

        <div style={styles.meta}>
          <h2 style={styles.cvTitle}>{cv.title}</h2>
          <p style={styles.metaLabel}>Status</p>
          <p style={styles.metaValue}>{cv.status}</p>
          <p style={styles.metaLabel}>Created</p>
          <p style={styles.metaValue}>
            {new Date(cv.created_at).toLocaleDateString()}
          </p>
          <p style={styles.metaLabel}>Job Description</p>
          <p style={styles.jdText}>{cv.job_description}</p>
        </div>

        <button
          style={{ ...styles.downloadBtn, opacity: downloading ? 0.7 : 1 }}
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? 'Downloading...' : 'Download PDF'}
        </button>
      </div>

      <div style={styles.preview}>
        <iframe
          src={`/api/v1/cvs/${id}/preview`}
          style={styles.iframe}
          title="CV Preview"
        />
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#f5f5f5' },
  sidebar: { width: '280px', backgroundColor: '#fff', borderRight: '1px solid #e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', flexShrink: 0, overflowY: 'auto' },
  backBtn: { background: 'none', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', textAlign: 'left' },
  meta: { flex: 1 },
  cvTitle: { fontSize: '16px', fontWeight: '700', marginBottom: '16px', lineHeight: '1.4' },
  metaLabel: { fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px', marginTop: '12px' },
  metaValue: { fontSize: '14px', color: '#333' },
  jdText: { fontSize: '12px', color: '#666', lineHeight: '1.5', marginTop: '4px' },
  downloadBtn: { padding: '12px', borderRadius: '8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  preview: { flex: 1, padding: '24px', overflow: 'hidden' },
  iframe: { width: '100%', height: '100%', border: 'none', borderRadius: '8px', boxShadow: '0 2px 16px rgba(0,0,0,0.1)', backgroundColor: '#fff' },
}