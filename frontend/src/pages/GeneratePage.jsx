import { useState, useEffect } from 'react'
import { generateCV, getCVStatus } from '../api/cvs'
import { getTemplates } from '../api/templates'
import { useNavigate } from 'react-router-dom'

export default function GeneratePage() {
  const navigate = useNavigate()
  const [jobDescription, setJobDescription] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [templates, setTemplates] = useState([])
  const [selectedTemplateId, setSelectedTemplateId] = useState('minimal')
  const [loadingTemplates, setLoadingTemplates] = useState(true)

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
        template_id: selectedTemplateId,
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
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Generate CV</h2>
        <p className="mt-2 text-sm text-slate-600">
          Paste a job description below. The AI will tailor your CV to match it.
        </p>
      </div>

      <div className="surface-card space-y-3 p-5 sm:p-6">
        <label className="text-sm font-semibold text-slate-700">Select Template</label>
        {loadingTemplates ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="mb-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`rounded-xl border-2 p-4 transition ${
                  selectedTemplateId === template.id
                    ? 'border-brand-600 bg-brand-50 shadow-card'
                    : 'border-slate-200 bg-slate-50 hover:border-brand-300'
                }`}
                onClick={() => setSelectedTemplateId(template.id)}
              >
                <div className="mb-1 text-sm font-semibold text-slate-800">{template.name}</div>
                <div className="text-xs leading-relaxed text-slate-500">{template.description}</div>
              </div>
            ))}
          </div>
        )}

        <label className="text-sm font-semibold text-slate-700">CV Title (optional)</label>
        <input
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          placeholder="e.g. Senior Software Engineer at Google"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />

        <label className="text-sm font-semibold text-slate-700">Job Description *</label>
        <textarea
          className="min-h-64 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-relaxed text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          placeholder="Paste the full job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={12}
          disabled={loading}
        />

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        {loading && (
          <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-brand-600" />
            <p className="text-sm font-medium text-blue-700">{status}</p>
          </div>
        )}

        <button
          className="mt-1 inline-flex h-12 min-w-[44px] items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate CV'}
        </button>
      </div>
    </div>
  )
}
