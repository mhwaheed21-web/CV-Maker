import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getCV, downloadCV, previewCVUrl, regenerateCV, getCVStatus } from '../api/cvs'
import { getTemplates } from '../api/templates'

export default function CVViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || 'cvs'
  const [cv, setCv] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [templates, setTemplates] = useState([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [regenerateError, setRegenerateError] = useState('')
  const [regenerateStatus, setRegenerateStatus] = useState('')
  const [formData, setFormData] = useState({ title: '', job_description: '', template_id: 'minimal' })

  useEffect(() => {
    getCV(id)
      .then((res) => {
        setCv(res.data)
        setFormData({
          title: res.data.title,
          job_description: res.data.job_description,
          template_id: res.data.template_id,
        })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    getTemplates()
      .then((res) => {
        setTemplates(res.data)
        setLoadingTemplates(false)
      })
      .catch((err) => {
        console.error('Failed to load templates:', err)
        setLoadingTemplates(false)
      })
  }, [])

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

  const handleRegenerate = async () => {
    setRegenerateError('')
    setRegenerateStatus('Regenerating...')
    setRegenerating(true)

    try {
      await regenerateCV(id, {
        title: formData.title !== cv.title ? formData.title : undefined,
        job_description: formData.job_description !== cv.job_description ? formData.job_description : undefined,
        template_id: formData.template_id !== cv.template_id ? formData.template_id : undefined,
      })

      // Poll for status updates
      let isComplete = false
      let attempts = 0
      const maxAttempts = 60 // 2 minutes max

      while (!isComplete && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        attempts++

        try {
          const statusRes = await getCVStatus(id)
          const status = statusRes.data.status

          if (status === 'complete') {
            setRegenerateStatus('CV regenerated successfully!')
            setRegenerating(false)
            setShowRegenerateModal(false)
            // Refresh CV data
            const updatedCV = await getCV(id)
            setCv(updatedCV.data)
            isComplete = true
          } else if (status === 'failed') {
            setRegenerateError('Regeneration failed. Please try again.')
            setRegenerating(false)
            isComplete = true
          } else {
            setRegenerateStatus(`Regenerating... (${attempts * 2}s)`)
          }
        } catch (err) {
          console.error('Status polling error:', err)
        }
      }

      if (!isComplete) {
        setRegenerateError('Regeneration timeout. Please check back in a moment.')
        setRegenerating(false)
      }
    } catch (err) {
      console.error('Regenerate error:', err)
      setRegenerateError(err.response?.data?.detail || 'Failed to regenerate CV')
      setRegenerating(false)
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

        <button
          style={styles.regenerateBtn}
          onClick={() => setShowRegenerateModal(true)}
          disabled={regenerating}
        >
          Regenerate
        </button>

        {showRegenerateModal && (
          <div style={styles.modalOverlay} onClick={() => !regenerating && setShowRegenerateModal(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h3 style={styles.modalTitle}>Regenerate CV</h3>

              <label style={styles.modalLabel}>CV Title</label>
              <input
                style={styles.modalInput}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={regenerating}
              />

              <label style={styles.modalLabel}>Template</label>
              {loadingTemplates ? (
                <p style={{ color: '#999', fontSize: '14px' }}>Loading templates...</p>
              ) : (
                <div style={styles.templateSelectGrid}>
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      style={{
                        ...styles.templateOption,
                        ...(formData.template_id === template.id ? styles.templateOptionSelected : {}),
                      }}
                      onClick={() => !regenerating && setFormData({ ...formData, template_id: template.id })}
                    >
                      {template.name}
                    </div>
                  ))}
                </div>
              )}

              <label style={styles.modalLabel}>Job Description</label>
              <textarea
                style={styles.modalTextarea}
                value={formData.job_description}
                onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                rows={6}
                disabled={regenerating}
              />

              {regenerateError && <p style={styles.errorText}>{regenerateError}</p>}

              {regenerating && (
                <div style={styles.statusBox}>
                  <div style={styles.spinner} />
                  <p style={styles.statusText}>{regenerateStatus}</p>
                </div>
              )}

              {!regenerating && (
                <div style={styles.modalButtons}>
                  <button
                    style={styles.cancelBtn}
                    onClick={() => setShowRegenerateModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    style={styles.regenerateConfirmBtn}
                    onClick={handleRegenerate}
                  >
                    Regenerate
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={styles.preview}>
        <iframe
          src={previewUrl}
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
  regenerateBtn: { padding: '12px', borderRadius: '8px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  preview: { flex: 1, padding: '24px', overflow: 'hidden' },
  iframe: { width: '100%', height: '100%', border: 'none', borderRadius: '8px', boxShadow: '0 2px 16px rgba(0,0,0,0.1)', backgroundColor: '#fff' },
  
  // Modal styles
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', borderRadius: '12px', padding: '32px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px rgba(0,0,0,0.15)' },
  modalTitle: { fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' },
  modalLabel: { fontSize: '13px', fontWeight: '600', color: '#374151', marginTop: '16px', marginBottom: '8px', display: 'block' },
  modalInput: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' },
  modalTextarea: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' },
  templateSelectGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' },
  templateOption: { padding: '10px', borderRadius: '8px', border: '2px solid #e5e7eb', backgroundColor: '#f9fafb', cursor: 'pointer', textAlign: 'center', fontSize: '13px', fontWeight: '500', color: '#374151', transition: 'all 0.2s' },
  templateOptionSelected: { borderColor: '#7c3aed', backgroundColor: '#f3e8ff', color: '#6d28d9' },
  errorText: { color: '#dc2626', fontSize: '13px', marginTop: '8px' },
  statusBox: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', marginTop: '16px' },
  spinner: { width: '16px', height: '16px', border: '2px solid #bfdbfe', borderTop: '2px solid #2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  statusText: { color: '#1d4ed8', fontSize: '13px', margin: 0 },
  modalButtons: { display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' },
  cancelBtn: { padding: '10px 16px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  regenerateConfirmBtn: { padding: '10px 16px', borderRadius: '8px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
}