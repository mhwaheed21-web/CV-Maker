import { useState } from 'react'
import { addEducation, updateEducation, deleteEducation } from '../../api/profile'
import useProfileStore from '../../store/profileStore'

function EducationItem({ item, onSave, onDelete }) {
  const [form, setForm] = useState({ ...item })
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

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
          name="degree"
          placeholder="Degree (e.g. BSc Computer Science)"
          value={form.degree}
          onChange={handleChange}
        />
        <input
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          name="institution"
          placeholder="Institution"
          value={form.institution}
          onChange={handleChange}
        />
      </div>

      <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2">
        <input
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          name="graduation_year"
          placeholder="Graduation year"
          value={form.graduation_year || ''}
          onChange={handleChange}
        />
        <input
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          name="gpa"
          placeholder="GPA (optional)"
          value={form.gpa || ''}
          onChange={handleChange}
        />
      </div>

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

export default function EducationForm({ data }) {
  const { updateSection } = useProfileStore()
  const [items, setItems] = useState(data || [])
  const [adding, setAdding] = useState(false)

  const handleSave = async (form) => {
    try {
      if (form.id) {
        const res = await updateEducation(form.id, form)
        setItems(items.map((i) => (i.id === form.id ? res.data : i)))
      } else {
        const res = await addEducation(form)
        setItems([...items.filter((i) => i.id), res.data])
        setAdding(false)
      }
      updateSection('education', items)
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (id) => {
    try {
      await deleteEducation(id)
      const updated = items.filter((i) => i.id !== id)
      setItems(updated)
      updateSection('education', updated)
    } catch (err) { console.error(err) }
  }

  const newItem = { degree: '', institution: '', graduation_year: '', gpa: '', display_order: 0 }

  return (
    <div>
      {items.filter(i => i.id).map((item) => (
        <EducationItem key={item.id} item={item} onSave={handleSave} onDelete={handleDelete} />
      ))}
      {adding && <EducationItem item={newItem} onSave={handleSave} onDelete={() => setAdding(false)} />}
      {!adding && (
        <button
          className="min-h-[44px] rounded-xl border border-dashed border-brand-400 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          onClick={() => setAdding(true)}
        >
          + Add Education
        </button>
      )}
    </div>
  )
}