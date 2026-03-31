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
    <div style={styles.item}>
      <div style={styles.row}>
        <input style={styles.input} name="degree" placeholder="Degree (e.g. BSc Computer Science)" value={form.degree} onChange={handleChange} />
        <input style={styles.input} name="institution" placeholder="Institution" value={form.institution} onChange={handleChange} />
      </div>
      <div style={styles.row}>
        <input style={styles.input} name="graduation_year" placeholder="Graduation year" value={form.graduation_year || ''} onChange={handleChange} />
        <input style={styles.input} name="gpa" placeholder="GPA (optional)" value={form.gpa || ''} onChange={handleChange} />
      </div>
      <div style={styles.actions}>
        <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        <button style={styles.deleteBtn} onClick={() => onDelete(item.id)}>Delete</button>
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
        <button style={styles.addBtn} onClick={() => setAdding(true)}>+ Add Education</button>
      )}
    </div>
  )
}

const styles = {
  item: { background: '#f9f9f9', border: '1px solid #eee', borderRadius: '8px', padding: '16px', marginBottom: '12px' },
  row: { display: 'flex', gap: '12px', marginBottom: '8px' },
  input: { flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  actions: { display: 'flex', gap: '8px', marginTop: '12px' },
  saveBtn: { padding: '8px 16px', borderRadius: '8px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px' },
  deleteBtn: { padding: '8px 16px', borderRadius: '8px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px' },
  addBtn: { padding: '8px 16px', borderRadius: '8px', border: '1px dashed #2563eb', background: '#fff', color: '#2563eb', cursor: 'pointer', fontSize: '14px', marginTop: '8px' },
}