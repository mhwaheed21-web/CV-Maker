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

  const statusClass = (status) => {
    if (status === 'complete') return 'border-green-200 bg-green-50 text-green-700'
    if (status === 'failed') return 'border-red-200 bg-red-50 text-red-700'
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="surface-card animate-pulse p-5">
              <div className="mb-2 h-5 w-40 rounded bg-slate-200" />
              <div className="mb-2 h-4 w-full rounded bg-slate-200" />
              <div className="h-3 w-24 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">My CVs</h2>
        <button
          className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
          onClick={() => navigate('/dashboard', { state: { page: 'generate' } })}
        >
          + Generate New CV
        </button>
      </div>

      {cvs.length === 0 ? (
        <div className="surface-card px-6 py-14 text-center text-slate-600">
          <p className="text-base font-semibold text-slate-800">No CVs generated yet.</p>
          <p className="mt-2 text-sm text-slate-500">
            Go to Generate CV and paste a job description to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cvs.map((cv) => (
            <div
              key={cv.id}
              className="surface-card flex cursor-pointer flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-card sm:flex-row sm:items-center sm:justify-between"
              onClick={() => cv.status === 'complete' && navigate(`/cv/${cv.id}`, { state: { from: 'cvs' } })}
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 truncate text-base font-semibold text-slate-900">{cv.title}</div>
                <div className="mb-2 text-sm text-slate-600">
                  {cv.job_description.slice(0, 100)}...
                </div>
                <div className="text-xs text-slate-500">{formatDate(cv.created_at)}</div>
              </div>

              <div className="flex flex-row items-center justify-between gap-3 sm:flex-col sm:items-end">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClass(cv.status)}`}
                >
                  {cv.status}
                </span>
                <button
                  className="inline-flex h-9 min-w-[44px] items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-100"
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