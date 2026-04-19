import { useState } from 'react'
import { addEducation, updateEducation, deleteEducation } from '../../api/profile'
import useProfileStore from '../../store/profileStore'
import useToastStore from '../../store/toastStore'

function EducationItem({ item, onSave, onDelete }) {
  const [form, setForm] = useState({ ...item })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async () => {
    const nextErrors = {}

    if (!form.degree.trim()) {
      nextErrors.degree = 'Degree is required.'
    }

    if (!form.institution.trim()) {
      nextErrors.institution = 'Institution is required.'
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
            errors.degree ? 'border-red-400 focus:border-red-500' : 'border-ubuntu-border focus:border-brand-500'
          }`}
          name="degree"
          placeholder="Degree (e.g. BSc Computer Science)"
          value={form.degree}
          onChange={(e) => {
            handleChange(e)
            if (errors.degree) {
              setErrors((currentErrors) => ({ ...currentErrors, degree: undefined }))
            }
          }}
        />
        <input
          className={`h-11 w-full rounded-xl2 border bg-ubuntu-surface px-4 text-sm text-ubuntu-text outline-none transition-all duration-250 ease-in-out focus:ring-2 focus:ring-brand-500/20 ${
            errors.institution ? 'border-red-400 focus:border-red-500' : 'border-ubuntu-border focus:border-brand-500'
          }`}
          name="institution"
          placeholder="Institution"
          value={form.institution}
          onChange={(e) => {
            handleChange(e)
            if (errors.institution) {
              setErrors((currentErrors) => ({ ...currentErrors, institution: undefined }))
            }
          }}
        />
      </div>

      {(errors.degree || errors.institution) && (
        <div className="mb-2 space-y-1">
          {errors.degree && <p className="text-xs font-medium text-red-400">{errors.degree}</p>}
          {errors.institution && <p className="text-xs font-medium text-red-400">{errors.institution}</p>}
        </div>
      )}

      <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2">
        <input
          className="h-11 w-full rounded-xl2 border border-ubuntu-border bg-ubuntu-surface px-4 text-sm text-ubuntu-text outline-none transition-all duration-250 ease-in-out focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          name="graduation_year"
          placeholder="Graduation year"
          value={form.graduation_year || ''}
          onChange={handleChange}
        />
        <input
          className="h-11 w-full rounded-xl2 border border-ubuntu-border bg-ubuntu-surface px-4 text-sm text-ubuntu-text outline-none transition-all duration-250 ease-in-out focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          name="gpa"
          placeholder="GPA (optional)"
          value={form.gpa || ''}
          onChange={handleChange}
        />
      </div>

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

export default function EducationForm({ data }) {
  const { updateSection } = useProfileStore()
  const { success } = useToastStore()
  const [items, setItems] = useState(data || [])
  const [adding, setAdding] = useState(false)

  const handleSave = async (form) => {
    try {
      if (form.id) {
        const res = await updateEducation(form.id, form)
        const updated = items.map((i) => (i.id === form.id ? res.data : i))
        setItems(updated)
        updateSection('education', updated)
        success('Education saved', 'Your education details were updated successfully.')
      } else {
        const res = await addEducation(form)
        const updated = [...items.filter((i) => i.id), res.data]
        setItems(updated)
        updateSection('education', updated)
        setAdding(false)
        success('Education added', 'A new education entry was added.')
      }
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (id) => {
    try {
      await deleteEducation(id)
      const updated = items.filter((i) => i.id !== id)
      setItems(updated)
      updateSection('education', updated)
      success('Education deleted', 'The entry was removed from your profile.')
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
          className="min-h-[44px] rounded-xl2 border border-dashed border-brand-400 bg-brand-500/5 px-4 py-2 text-sm font-semibold text-brand-300 transition-all duration-250 ease-in-out hover:bg-brand-500/10"
          onClick={() => setAdding(true)}
        >
          + Add Education
        </button>
      )}
    </div>
  )
}