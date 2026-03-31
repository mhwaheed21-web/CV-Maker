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
    <div style={styles.item}>
      <div style={styles.row}>
        <input style={styles.input} name="name" placeholder="Project name" value={form.name} onChange={handleChange} />
        <input style={styles.input} name="url" placeholder="URL (optional)" value={form.url || ''} onChange={handleChange} />
      </div>
      <textarea style={styles.textarea} name="description" placeholder="Project description" value={form.description || ''} onChange={handleChange} rows={3} />
      <div style={styles.techRow}>
        {form.technologies.map((t, i) => (
          <span key={i} style={styles.tag}>{t} <button style={styles.tagRemove} onClick={() => removeTech(i)}>✕</button></span>
        ))}
      </div>
      <div style={styles.row}>
        <input style={styles.input} placeholder="Add technology" value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTech()} />
        <button style={styles.addBtn} onClick={addTech}>Add</button>
      </div>
      <div style={styles.actions}>
        <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        <button style={styles.deleteBtn} onClick={() => onDelete(item.id)}>Delete</button>
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
        <button style={styles.addBtn} onClick={() => setAdding(true)}>+ Add Project</button>
      )}
    </div>
  )
}

const styles = {
  item: { background: '#f9f9f9', border: '1px solid #eee', borderRadius: '8px', padding: '16px', marginBottom: '12px' },
  row: { display: 'flex', gap: '12px', marginBottom: '8px' },
  input: { flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  textarea: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', marginBottom: '8px' },
  techRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' },
  tag: { display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', background: '#e0f2fe', color: '#0369a1', fontSize: '12px' },
  tagRemove: { background: 'none', border: 'none', cursor: 'pointer', color: '#0369a1', fontSize: '11px' },
  actions: { display: 'flex', gap: '8px', marginTop: '12px' },
  saveBtn: { padding: '8px 16px', borderRadius: '8px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px' },
  deleteBtn: { padding: '8px 16px', borderRadius: '8px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px' },
  addBtn: { padding: '8px 16px', borderRadius: '8px', border: '1px dashed #2563eb', background: '#fff', color: '#2563eb', cursor: 'pointer', fontSize: '14px', marginTop: '8px' },
}