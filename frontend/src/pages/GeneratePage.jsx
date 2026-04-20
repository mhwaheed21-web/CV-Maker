import { useState, useEffect } from 'react'
import { generateCV, getCVStatus } from '../api/cvs'
import { getTemplates } from '../api/templates'
import { useNavigate } from 'react-router-dom'
import useToastStore from '../store/toastStore'
import { Button } from '../components/common'

export default function GeneratePage() {
  const navigate = useNavigate()
  const { info, success, error: showError } = useToastStore()
  const [jobDescription, setJobDescription] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [errors, setErrors] = useState({})
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

  const validate = () => {
    const nextErrors = {}

    if (!jobDescription.trim()) {
      nextErrors.job_description = 'Job description is required.'
    } else if (jobDescription.trim().length < 50) {
      nextErrors.job_description = 'Job description must be at least 50 characters.'
    }

    return nextErrors
  }

  const canSubmit = Object.keys(validate()).length === 0 && !loading

  const handleGenerate = async () => {
    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setLoading(true)
    setStatus('Starting generation...')
    info('Generation started', 'Your CV is being tailored to the job description.')

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
            success('CV generated', 'Your tailored CV is ready to view.')
            navigate(`/cv/${cvId}`, { state: { from: 'generate' } })
          } else if (currentStatus === 'failed') {
            clearInterval(poll)
            setLoading(false)
            showError('Generation failed', 'CV generation failed. Please try again.')
            setStatus('')
          }
        } catch {
          clearInterval(poll)
          setLoading(false)
          showError('Generation error', 'Something went wrong. Please try again.')
          setStatus('')
        }
      }, 2000)

    } catch {
      setLoading(false)
      setStatus('')
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-ubuntu-text">Generate CV</h2>
        <p className="mt-2 text-sm text-ubuntu-muted">
           {/* Paste a job description below. The AI will tailor your CV to match it. */}
        </p>
      </div>

      <div className="surface-card space-y-3 p-5 sm:p-6">
        <label className="text-sm font-semibold text-ubuntu-muted">Select Template</label>
        {loadingTemplates ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl2 border border-ubuntu-border bg-ubuntu-surfaceAlt" />
            ))}
          </div>
        ) : (
          <div className="mb-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`rounded-xl2 border-2 p-4 transition-all duration-250 ease-in-out ${
                  selectedTemplateId === template.id
                    ? 'border-brand-500 bg-brand-500/10 shadow-soft'
                    : 'border-ubuntu-border bg-ubuntu-surfaceAlt hover:border-brand-500/40'
                }`}
                onClick={() => setSelectedTemplateId(template.id)}
              >
                <div className="mb-1 text-sm font-semibold text-ubuntu-text">{template.name}</div>
                {/* <div className="text-xs leading-relaxed text-ubuntu-muted">{template.description}</div> */}
              </div>
            ))}
          </div>
        )}

        <label className="text-sm font-semibold text-ubuntu-muted">CV Title (optional)</label>
        <input
          className="h-11 w-full rounded-xl2 border border-ubuntu-border bg-ubuntu-surfaceAlt px-4 text-sm text-ubuntu-text placeholder:text-ubuntu-muted/80 outline-none transition-all duration-250 ease-in-out focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-70"
          placeholder="e.g. Senior Software Engineer at Google"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />

        <label className="text-sm font-semibold text-ubuntu-muted">Job Description *</label>
        <textarea
          className={`min-h-64 w-full rounded-xl2 border bg-ubuntu-surfaceAlt px-4 py-3 text-sm leading-relaxed text-ubuntu-text placeholder:text-ubuntu-muted/80 outline-none transition-all duration-250 ease-in-out focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-70 ${
            errors.job_description ? 'border-red-400 focus:border-red-500' : 'border-ubuntu-border focus:border-brand-500'
          }`}
          placeholder="Paste the full job description here..."
          value={jobDescription}
          onChange={(e) => {
            setJobDescription(e.target.value)
            if (errors.job_description) {
              setErrors((currentErrors) => ({ ...currentErrors, job_description: undefined }))
            }
          }}
          rows={12}
          disabled={loading}
        />

        {errors.job_description && (
          <p className="rounded-xl2 border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {errors.job_description}
          </p>
        )}

        {loading && (
          <div className="flex items-center gap-3 rounded-xl2 border border-brand-400/40 bg-brand-500/10 px-4 py-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-300/40 border-t-brand-500" />
            <p className="text-sm font-medium text-brand-100">{status}</p>
          </div>
        )}

        <Button className="mt-1 w-full" onClick={handleGenerate} loading={loading} disabled={!canSubmit}>
          Generate CV
        </Button>
      </div>
    </div>
  )
}
