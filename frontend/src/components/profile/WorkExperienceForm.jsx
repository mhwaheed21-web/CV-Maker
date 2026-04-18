import { useState } from 'react'
import { addExperience, updateExperience, deleteExperience } from '../../api/profile'
import useProfileStore from '../../store/profileStore'

function ExperienceItem({ item, onSave, onDelete }) {
  const [form, setForm] = useState({ ...item })
  const [saving, setSaving] = useState(false)

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
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2">
        <input
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          name="job_title"
          placeholder="Job Title"
          value={form.job_title}
          onChange={handleChange}
        />
        <input
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          name="company_name"
          placeholder="Company"
          value={form.company_name}
          onChange={handleChange}
        />
      </div>

      <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2">
        <input
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          name="start_date"
          placeholder="Start date (e.g. Jan 2022)"
          value={form.start_date || ''}
          onChange={handleChange}
        />
        <input
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          name="end_date"
          placeholder="End date (or leave blank if current)"
          value={form.end_date || ''}
          onChange={handleChange}
          disabled={form.is_current}
        />
      </div>

      <label className="mb-2 inline-flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={form.is_current} onChange={(e) => setForm({ ...form, is_current: e.target.checked })} />
        Currently working here
      </label>

      <p className="mb-2 text-sm font-medium text-slate-600">Responsibilities / Achievements</p>
      {(form.responsibilities || []).map((bullet, i) => (
        <div key={i} className="mb-2 flex gap-2">
          <input
            className="h-11 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            placeholder={`Bullet point ${i + 1}`}
            value={bullet}
            onChange={(e) => handleBulletChange(i, e.target.value)}
          />
          <button
            className="h-11 min-w-[44px] rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            onClick={() => removeBullet(i)}
          >
            ✕
          </button>
        </div>
      ))}

      <button
        className="mt-1 min-h-[44px] rounded-xl border border-dashed border-brand-400 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
        onClick={addBullet}
      >
        + Add bullet
      </button>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="min-h-[44px] rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          className="min-h-[44px] rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
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
  const [items, setItems] = useState(data || [])
  const [adding, setAdding] = useState(false)

  const handleSave = async (form) => {
    try {
      if (form.id) {
        const res = await updateExperience(form.id, form)
        setItems(items.map((i) => (i.id === form.id ? res.data : i)))
      } else {
        const res = await addExperience(form)
        setItems([...items.filter((i) => i.id), res.data])
        setAdding(false)
      }
      updateSection('experience', items)
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (id) => {
    try {
      await deleteExperience(id)
      const updated = items.filter((i) => i.id !== id)
      setItems(updated)
      updateSection('experience', updated)
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
          className="min-h-[44px] rounded-xl border border-dashed border-brand-400 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          onClick={() => setAdding(true)}
        >
          + Add Work Experience
        </button>
      )}
    </div>
  )
}