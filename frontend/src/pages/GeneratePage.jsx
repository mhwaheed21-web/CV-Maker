import { useState } from 'react'
import { generateCV, getCVStatus } from '../api/cvs'
import { useNavigate } from 'react-router-dom'

export default function GeneratePage() {
  const navigate = useNavigate()
  const [jobDescription, setJobDescription] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description')
      return
    }
    setError('')
    setLoading(true)
    setStatus('Starting generation...')

    try {
      const res = await generateCV({
        job_description: jobDescription,
        template_id: 'minimal',
        title: title || undefined,
      })

      const cvId = res.data.id
      setStatus('Generating your CV...')

      const poll = setInterval(async () => {
        try {
          const statusRes = await getCVStatus(cvId)
          const currentStatus = statusRes.data.status

          if (currentStatus === 'complete') {
            clearInterval(poll)
            setLoading(false)
            navigate(`/cv/${cvId}`, { state: { from: 'generate' } })
          } else if (currentStatus === 'failed') {
            clearInterval(poll)
            setLoading(false)
            setError('CV generation failed. Please try again.')
            setStatus('')
          }
        } catch {
          clearInterval(poll)
          setLoading(false)
          setError('Something went wrong. Please try again.')
          setStatus('')
        }
      }, 2000)

    } catch (err) {
      setLoading(false)
      setStatus('')
      setError(err.response?.data?.detail || 'Generation failed')
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Generate CV</h2>
      <p style={styles.subtitle}>
        Paste a job description below. The AI will tailor your CV to match it.
      </p>

      <div style={styles.form}>
        <label style={styles.label}>CV Title (optional)</label>
        <input
          style={styles.input}
          placeholder="e.g. Senior Software Engineer at Google"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />

        <label style={styles.label}>Job Description *</label>
        <textarea
          style={styles.textarea}
          placeholder="Paste the full job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={12}
          disabled={loading}
        />

        {error && <p style={styles.error}>{error}</p>}

        {loading && (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>{status}</p>
          </div>
        )}

        <button
          style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate CV'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '32px', maxWidth: '720px', margin: '0 auto' },
  title: { fontSize: '24px', marginBottom: '6px' },
  subtitle: { color: '#666', fontSize: '14px', marginBottom: '28px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  input: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  textarea: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', resize: 'vertical', lineHeight: '1.6' },
  button: { padding: '14px', borderRadius: '8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', fontSize: '15px', cursor: 'pointer', marginTop: '8px' },
  error: { color: '#ef4444', fontSize: '13px', margin: 0 },
  loadingBox: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' },
  spinner: { width: '18px', height: '18px', border: '2px solid #bfdbfe', borderTop: '2px solid #2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { color: '#1d4ed8', fontSize: '14px', margin: 0 },
}