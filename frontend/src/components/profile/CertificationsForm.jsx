import { useState } from 'react'
import { addCertification, updateCertification, deleteCertification } from '../../api/profile'
import useProfileStore from '../../store/profileStore'
import useToastStore from '../../store/toastStore'

function CertItem({ item, onSave, onDelete }) {
  const [form, setForm] = useState({ ...item })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async () => {
    const nextErrors = {}

    if (!form.name.trim()) {
      nextErrors.name = 'Certification name is required.'
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
            errors.name ? 'border-red-400 focus:border-red-500' : 'border-ubuntu-border focus:border-brand-500'
          }`}
          name="name"
          placeholder="Certification name"
          value={form.name}
          onChange={(e) => {
            handleChange(e)
            if (errors.name) {
              setErrors((currentErrors) => ({ ...currentErrors, name: undefined }))
            }
          }}
        />
        <input
          className="h-11 w-full rounded-xl2 border border-ubuntu-border bg-ubuntu-surface px-4 text-sm text-ubuntu-text outline-none transition-all duration-250 ease-in-out focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          name="issuer"
          placeholder="Issuer (e.g. Google, AWS)"
          value={form.issuer || ''}
          onChange={handleChange}
        />
      </div>

      {errors.name && <p className="mb-2 text-xs font-medium text-red-400">{errors.name}</p>}

      <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2">
        <input
          className="h-11 w-full rounded-xl2 border border-ubuntu-border bg-ubuntu-surface px-4 text-sm text-ubuntu-text outline-none transition-all duration-250 ease-in-out focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          name="issue_date"
          placeholder="Issue date (e.g. Jan 2023)"
          value={form.issue_date || ''}
          onChange={handleChange}
        />
        <input
          className="h-11 w-full rounded-xl2 border border-ubuntu-border bg-ubuntu-surface px-4 text-sm text-ubuntu-text outline-none transition-all duration-250 ease-in-out focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          name="expiry_date"
          placeholder="Expiry date (optional)"
          value={form.expiry_date || ''}
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

export default function CertificationsForm({ data }) {
  const { updateSection } = useProfileStore()
  const { success } = useToastStore()
  const [items, setItems] = useState(data || [])
  const [adding, setAdding] = useState(false)

  const handleSave = async (form) => {
    try {
      if (form.id) {
        const res = await updateCertification(form.id, form)
        const updated = items.map((i) => (i.id === form.id ? res.data : i))
        setItems(updated)
        updateSection('certifications', updated)
        success('Certification saved', 'Your certification was updated successfully.')
      } else {
        const res = await addCertification(form)
        const updated = [...items.filter((i) => i.id), res.data]
        setItems(updated)
        updateSection('certifications', updated)
        setAdding(false)
        success('Certification added', 'A new certification was added.')
      }
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (id) => {
    try {
      await deleteCertification(id)
      const updated = items.filter((i) => i.id !== id)
      setItems(updated)
      updateSection('certifications', updated)
      success('Certification deleted', 'The certification was removed from your profile.')
    } catch (err) { console.error(err) }
  }

  const newItem = { name: '', issuer: '', issue_date: '', expiry_date: '' }

  return (
    <div>
      {items.filter(i => i.id).map((item) => (
        <CertItem key={item.id} item={item} onSave={handleSave} onDelete={handleDelete} />
      ))}
      {adding && <CertItem item={newItem} onSave={handleSave} onDelete={() => setAdding(false)} />}
      {!adding && (
        <button
          className="min-h-[44px] rounded-xl2 border border-dashed border-brand-400 bg-brand-500/5 px-4 py-2 text-sm font-semibold text-brand-300 transition-all duration-250 ease-in-out hover:bg-brand-500/10"
          onClick={() => setAdding(true)}
        >
          + Add Certification
        </button>
      )}
    </div>
  )
}