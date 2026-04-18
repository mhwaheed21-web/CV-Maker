import { useState } from 'react'
import { addProject, updateProject, deleteProject } from '../../api/profile'
import useProfileStore from '../../store/profileStore'

function ProjectItem({ item, onSave, onDelete }) {
  const [form, setForm] = useState({ ...item, technologies: item.technologies || [] })
  const [saving, setSaving] = useState(false)
  const [techInput, setTechInput] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const addTech = () => {
    if (!techInput.trim()) return
    setForm({ ...form, technologies: [...form.technologies, techInput.trim()] })
    setTechInput('')
  }

  const removeTech = (index) => {
    setForm({ ...form, technologies: form.technologies.filter((_, i) => i !== index) })
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
          name="name"
          placeholder="Project name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          name="url"
          placeholder="URL (optional)"
          value={form.url || ''}
          onChange={handleChange}
        />
      </div>

      <textarea
        className="mb-2 min-h-24 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        name="description"
        placeholder="Project description"
        value={form.description || ''}
        onChange={handleChange}
        rows={3}
      />

      <div className="mb-2 flex flex-wrap gap-2">
        {form.technologies.map((t, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
          >
            {t}
            <button className="text-sky-600 transition hover:text-sky-800" onClick={() => removeTech(i)}>
              ✕
            </button>
          </span>
        ))}
      </div>

      <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
        <input
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          placeholder="Add technology"
          value={techInput}
          onChange={(e) => setTechInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTech()}
        />
        <button
          className="h-11 min-w-[44px] rounded-xl border border-slate-300 bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          onClick={addTech}
        >
          Add
        </button>
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

export default function ProjectsForm({ data }) {
  const { updateSection } = useProfileStore()
  const [items, setItems] = useState(data || [])
  const [adding, setAdding] = useState(false)

  const handleSave = async (form) => {
    try {
      if (form.id) {
        const res = await updateProject(form.id, form)
        setItems(items.map((i) => (i.id === form.id ? res.data : i)))
      } else {
        const res = await addProject(form)
        setItems([...items.filter((i) => i.id), res.data])
        setAdding(false)
      }
      updateSection('projects', items)
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (id) => {
    try {
      await deleteProject(id)
      const updated = items.filter((i) => i.id !== id)
      setItems(updated)
      updateSection('projects', updated)
    } catch (err) { console.error(err) }
  }

  const newItem = { name: '', description: '', technologies: [], url: '', display_order: 0 }

  return (
    <div>
      {items.filter(i => i.id).map((item) => (
        <ProjectItem key={item.id} item={item} onSave={handleSave} onDelete={handleDelete} />
      ))}
      {adding && <ProjectItem item={newItem} onSave={handleSave} onDelete={() => setAdding(false)} />}
      {!adding && (
        <button
          className="min-h-[44px] rounded-xl border border-dashed border-brand-400 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          onClick={() => setAdding(true)}
        >
          + Add Project
        </button>
      )}
    </div>
  )
}