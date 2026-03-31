import { useState } from 'react'
import { addCertification, updateCertification, deleteCertification } from '../../api/profile'
import useProfileStore from '../../store/profileStore'

function CertItem({ item, onSave, onDelete }) {
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
        <input style={styles.input} name="name" placeholder="Certification name" value={form.name} onChange={handleChange} />
        <input style={styles.input} name="issuer" placeholder="Issuer (e.g. Google, AWS)" value={form.issuer || ''} onChange={handleChange} />
      </div>
      <div style={styles.row}>
        <input style={styles.input} name="issue_date" placeholder="Issue date (e.g. Jan 2023)" value={form.issue_date || ''} onChange={handleChange} />
        <input style={styles.input} name="expiry_date" placeholder="Expiry date (optional)" value={form.expiry_date || ''} onChange={handleChange} />
      </div>
      <div style={styles.actions}>
        <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        <button style={styles.deleteBtn} onClick={() => onDelete(item.id)}>Delete</button>
      </div>
    </div>
  )
}

export default function CertificationsForm({ data }) {
  const { updateSection } = useProfileStore()
  const [items, setItems] = useState(data || [])
  const [adding, setAdding] = useState(false)

  const handleSave = async (form) => {
    try {
      if (form.id) {
        const res = await updateCertification(form.id, form)
        setItems(items.map((i) => (i.id === form.id ? res.data : i)))
      } else {
        const res = await addCertification(form)
        setItems([...items.filter((i) => i.id), res.data])
        setAdding(false)
      }
      updateSection('certifications', items)
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (id) => {
    try {
      await deleteCertification(id)
      const updated = items.filter((i) => i.id !== id)
      setItems(updated)
      updateSection('certifications', updated)
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
        <button style={styles.addBtn} onClick={() => setAdding(true)}>+ Add Certification</button>
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