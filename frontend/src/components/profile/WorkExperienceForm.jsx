import { useState } from 'react'
import { addExperience, updateExperience, deleteExperience } from '../../api/profile'
import useProfileStore from '../../store/profileStore'
import useToastStore from '../../store/toastStore'

function ExperienceItem({ item, onSave, onDelete }) {
  const [form, setForm] = useState({ ...item })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleBulletChange = (index, value) => {
    const updated = [...(form.responsibilities || [])]
    updated[index] = value
    setForm({ ...form, responsibilities: updated })
  }

  const addBullet = () => {
    setForm({ ...form, responsibilities: [...(form.responsibilities || []), ''] })
  }

  const removeBullet = (index) => {
    const updated = (form.responsibilities || []).filter((_, i) => i !== index)
    setForm({ ...form, responsibilities: updated })
  }

  const handleSave = async () => {
    const nextErrors = {}

    if (!form.job_title.trim()) {
      nextErrors.job_title = 'Job title is required.'
    }

    if (!form.company_name.trim()) {
      nextErrors.company_name = 'Company name is required.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="mb-3 rounded-xl2 border border-ubuntu-border bg-ubuntu-surfaceAlt p-4">
      <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2">
        <input
          className={`h-11 w-full rounded-xl2 border bg-ubuntu-surface px-4 text-sm text-ubuntu-text outline-none transition-all duration-250 ease-in-out focus:ring-2 focus:ring-brand-500/20 ${
            errors.job_title ? 'border-red-400 focus:border-red-500' : 'border-ubuntu-border focus:border-brand-500'
          }`}
          name="job_title"
          placeholder="Job Title"
          value={form.job_title}
          onChange={(e) => {
            handleChange(e)
            if (errors.job_title) {
              setErrors((currentErrors) => ({ ...currentErrors, job_title: undefined }))
            }
          }}
        />
        <input
          className={`h-11 w-full rounded-xl2 border bg-ubuntu-surface px-4 text-sm text-ubuntu-text outline-none transition-all duration-250 ease-in-out focus:ring-2 focus:ring-brand-500/20 ${
            errors.company_name ? 'border-red-400 focus:border-red-500' : 'border-ubuntu-border focus:border-brand-500'
          }`}
          name="company_name"
          placeholder="Company"
          value={form.company_name}
          onChange={(e) => {
            handleChange(e)
            if (errors.company_name) {
              setErrors((currentErrors) => ({ ...currentErrors, company_name: undefined }))
            }
          }}
        />
      </div>
      {(errors.job_title || errors.company_name) && (
        <div className="mb-2 space-y-1">
          {errors.job_title && <p className="text-xs font-medium text-red-400">{errors.job_title}</p>}
          {errors.company_name && <p className="text-xs font-medium text-red-400">{errors.company_name}</p>}
        </div>
      )}

      <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2">
        <input
          className="h-11 w-full rounded-xl2 border border-ubuntu-border bg-ubuntu-surface px-4 text-sm text-ubuntu-text outline-none transition-all duration-250 ease-in-out focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          name="start_date"
          placeholder="Start date (e.g. Jan 2022)"
          value={form.start_date || ''}
          onChange={handleChange}
        />
        <input
          className="h-11 w-full rounded-xl2 border border-ubuntu-border bg-ubuntu-surface px-4 text-sm text-ubuntu-text outline-none transition-all duration-250 ease-in-out focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          name="end_date"
          placeholder="End date (or leave blank if current)"
          value={form.end_date || ''}
          onChange={handleChange}
          disabled={form.is_current}
        />
      </div>

      <label className="mb-2 inline-flex items-center gap-2 text-sm text-ubuntu-muted">
        <input type="checkbox" checked={form.is_current} onChange={(e) => setForm({ ...form, is_current: e.target.checked })} />
        Currently working here
      </label>

      <p className="mb-2 text-sm font-medium text-ubuntu-muted">Responsibilities / Achievements</p>
      {(form.responsibilities || []).map((bullet, i) => (
        <div key={i} className="mb-2 flex gap-2">
          <input
            className="h-11 flex-1 rounded-xl2 border border-ubuntu-border bg-ubuntu-surface px-4 text-sm text-ubuntu-text outline-none transition-all duration-250 ease-in-out focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            placeholder={`Bullet point ${i + 1}`}
            value={bullet}
            onChange={(e) => handleBulletChange(i, e.target.value)}
          />
          <button
            className="h-11 min-w-[44px] rounded-xl2 border border-red-400/40 bg-red-500/10 px-3 text-sm font-semibold text-red-200 transition-all duration-250 ease-in-out hover:bg-red-500/20"
            onClick={() => removeBullet(i)}
          >
            ✕
          </button>
        </div>
      ))}

      <button
        className="mt-1 min-h-[44px] rounded-xl2 border border-dashed border-brand-400 bg-brand-500/5 px-4 py-2 text-sm font-semibold text-brand-300 transition-all duration-250 ease-in-out hover:bg-brand-500/10"
        onClick={addBullet}
      >
        + Add bullet
      </button>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="min-h-[44px] rounded-xl2 bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-250 ease-in-out hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-ubuntu-surface"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          className="min-h-[44px] rounded-xl2 bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-250 ease-in-out hover:bg-red-700"
          onClick={() => onDelete(item.id)}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default function WorkExperienceForm({ data }) {
  const { updateSection } = useProfileStore()
  const { success } = useToastStore()
  const [items, setItems] = useState(data || [])
  const [adding, setAdding] = useState(false)

  const handleSave = async (form) => {
    try {
      if (form.id) {
        const res = await updateExperience(form.id, form)
        const updated = items.map((i) => (i.id === form.id ? res.data : i))
        setItems(updated)
        updateSection('experience', updated)
        success('Work experience saved', 'Your work history was updated successfully.')
      } else {
        const res = await addExperience(form)
        const updated = [...items.filter((i) => i.id), res.data]
        setItems(updated)
        updateSection('experience', updated)
        setAdding(false)
        success('Work experience added', 'A new work experience entry was added.')
      }
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (id) => {
    try {
      await deleteExperience(id)
      const updated = items.filter((i) => i.id !== id)
      setItems(updated)
      updateSection('experience', updated)
      success('Work experience deleted', 'The entry was removed from your profile.')
    } catch (err) { console.error(err) }
  }

  const newItem = { job_title: '', company_name: '', start_date: '', end_date: '', is_current: false, responsibilities: [], display_order: 0 }

  return (
    <div>
      {items.filter(i => i.id).map((item) => (
        <ExperienceItem key={item.id} item={item} onSave={handleSave} onDelete={handleDelete} />
      ))}
      {adding && <ExperienceItem item={newItem} onSave={handleSave} onDelete={() => setAdding(false)} />}
      {!adding && (
        <button
          className="min-h-[44px] rounded-xl2 border border-dashed border-brand-400 bg-brand-500/5 px-4 py-2 text-sm font-semibold text-brand-300 transition-all duration-250 ease-in-out hover:bg-brand-500/10"
          onClick={() => setAdding(true)}
        >
          + Add Work Experience
        </button>
      )}
    </div>
  )
}