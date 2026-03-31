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
    <div style={styles.item}>
      <div style={styles.row}>
        <input style={styles.input} name="job_title" placeholder="Job Title" value={form.job_title} onChange={handleChange} />
        <input style={styles.input} name="company_name" placeholder="Company" value={form.company_name} onChange={handleChange} />
      </div>
      <div style={styles.row}>
        <input style={styles.input} name="start_date" placeholder="Start date (e.g. Jan 2022)" value={form.start_date || ''} onChange={handleChange} />
        <input style={styles.input} name="end_date" placeholder="End date (or leave blank if current)" value={form.end_date || ''} onChange={handleChange} disabled={form.is_current} />
      </div>
      <label style={styles.checkbox}>
        <input type="checkbox" checked={form.is_current} onChange={(e) => setForm({ ...form, is_current: e.target.checked })} />
        Currently working here
      </label>
      <p style={styles.label}>Responsibilities / Achievements</p>
      {(form.responsibilities || []).map((bullet, i) => (
        <div key={i} style={styles.bulletRow}>
          <input style={{ ...styles.input, flex: 1 }} placeholder={`Bullet point ${i + 1}`} value={bullet} onChange={(e) => handleBulletChange(i, e.target.value)} />
          <button style={styles.removeBtn} onClick={() => removeBullet(i)}>✕</button>
        </div>
      ))}
      <button style={styles.addBtn} onClick={addBullet}>+ Add bullet</button>
      <div style={styles.actions}>
        <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        <button style={styles.deleteBtn} onClick={() => onDelete(item.id)}>Delete</button>
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
        <button style={styles.addBtn} onClick={() => setAdding(true)}>+ Add Work Experience</button>
      )}
    </div>
  )
}

const styles = {
  item: { background: '#f9f9f9', border: '1px solid #eee', borderRadius: '8px', padding: '16px', marginBottom: '12px' },
  row: { display: 'flex', gap: '12px', marginBottom: '8px' },
  input: { flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  label: { fontSize: '13px', color: '#555', marginBottom: '6px' },
  checkbox: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '8px' },
  bulletRow: { display: 'flex', gap: '8px', marginBottom: '6px' },
  removeBtn: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', color: '#ef4444' },
  addBtn: { padding: '8px 16px', borderRadius: '8px', border: '1px dashed #2563eb', background: '#fff', color: '#2563eb', cursor: 'pointer', fontSize: '14px', marginTop: '8px' },
  actions: { display: 'flex', gap: '8px', marginTop: '12px' },
  saveBtn: { padding: '8px 16px', borderRadius: '8px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px' },
  deleteBtn: { padding: '8px 16px', borderRadius: '8px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px' },
}