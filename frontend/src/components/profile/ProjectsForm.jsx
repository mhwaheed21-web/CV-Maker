import { useState } from 'react'
import { addProject, updateProject, deleteProject } from '../../api/profile'
import useProfileStore from '../../store/profileStore'
import useToastStore from '../../store/toastStore'

function ProjectItem({ item, onSave, onDelete }) {
  const [form, setForm] = useState({ ...item, technologies: item.technologies || [] })
  const [saving, setSaving] = useState(false)
  const [techInput, setTechInput] = useState('')
  const [errors, setErrors] = useState({})

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const addTech = () => {
    if (!techInput.trim()) {
      setErrors((currentErrors) => ({ ...currentErrors, technologies: 'Enter a technology name first.' }))
      return
    }
    setForm({ ...form, technologies: [...form.technologies, techInput.trim()] })
    setTechInput('')
    setErrors((currentErrors) => ({ ...currentErrors, technologies: undefined }))
  }

  const removeTech = (index) => {
    setForm({ ...form, technologies: form.technologies.filter((_, i) => i !== index) })
  }

  const handleSave = async () => {
    const nextErrors = {}

    if (!form.name.trim()) {
      nextErrors.name = 'Project name is required.'
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
          placeholder="Project name"
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
          name="url"
          placeholder="URL (optional)"
          value={form.url || ''}
          onChange={handleChange}
        />
      </div>

      {errors.name && <p className="mb-2 text-xs font-medium text-red-400">{errors.name}</p>}

      <textarea
        className="mb-2 min-h-24 w-full rounded-xl2 border border-ubuntu-border bg-ubuntu-surface px-4 py-3 text-sm text-ubuntu-text outline-none transition-all duration-250 ease-in-out focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
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
            className="inline-flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-100"
          >
            {t}
            <button className="text-brand-300 transition-all duration-250 ease-in-out hover:text-brand-100" onClick={() => removeTech(i)}>
              ✕
            </button>
          </span>
        ))}
      </div>

      <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
        <input
          className="h-11 w-full rounded-xl2 border border-ubuntu-border bg-ubuntu-surface px-4 text-sm text-ubuntu-text outline-none transition-all duration-250 ease-in-out focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          placeholder="Add technology"
          value={techInput}
          onChange={(e) => setTechInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTech()}
        />
        <button
          className="h-11 min-w-[44px] rounded-xl2 border border-brand-500 bg-transparent px-4 text-sm font-semibold text-brand-400 transition-all duration-250 ease-in-out hover:bg-brand-500/10"
          onClick={addTech}
        >
          Add
        </button>
      </div>

      {errors.technologies && <p className="mb-2 text-xs font-medium text-red-400">{errors.technologies}</p>}

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

export default function ProjectsForm({ data }) {
  const { updateSection } = useProfileStore()
  const { success } = useToastStore()
  const [items, setItems] = useState(data || [])
  const [adding, setAdding] = useState(false)

  const handleSave = async (form) => {
    try {
      if (form.id) {
        const res = await updateProject(form.id, form)
        const updated = items.map((i) => (i.id === form.id ? res.data : i))
        setItems(updated)
        updateSection('projects', updated)
        success('Project saved', 'Your project was updated successfully.')
      } else {
        const res = await addProject(form)
        const updated = [...items.filter((i) => i.id), res.data]
        setItems(updated)
        updateSection('projects', updated)
        setAdding(false)
        success('Project added', 'A new project was added to your profile.')
      }
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (id) => {
    try {
      await deleteProject(id)
      const updated = items.filter((i) => i.id !== id)
      setItems(updated)
      updateSection('projects', updated)
      success('Project deleted', 'The project was removed from your profile.')
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
          className="min-h-[44px] rounded-xl2 border border-dashed border-brand-400 bg-brand-500/5 px-4 py-2 text-sm font-semibold text-brand-300 transition-all duration-250 ease-in-out hover:bg-brand-500/10"
          onClick={() => setAdding(true)}
        >
          + Add Project
        </button>
      )}
    </div>
  )
}