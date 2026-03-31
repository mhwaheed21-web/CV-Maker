import { useState, useEffect } from 'react'
import { upsertSkills } from '../../api/profile'
import useProfileStore from '../../store/profileStore'

export default function SkillsForm({ data }) {
  const { updateSection } = useProfileStore()
  const [skills, setSkills] = useState(data || [])
  const [newSkill, setNewSkill] = useState({ name: '', category: 'technical', proficiency: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setSkills(data || []) }, [data])

  const addSkill = () => {
    if (!newSkill.name.trim()) return
    setSkills([...skills, { ...newSkill, id: `temp-${Date.now()}` }])
    setNewSkill({ name: '', category: 'technical', proficiency: '' })
  }

  const removeSkill = (id) => setSkills(skills.filter((s) => s.id !== id))

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = skills.map(({ name, category, proficiency }) => ({ name, category, proficiency }))
      const res = await upsertSkills(payload)
      setSkills(res.data)
      updateSection('skills', res.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div style={styles.tagContainer}>
        {skills.map((skill) => (
          <span key={skill.id} style={styles.tag}>
            {skill.name}
            <button style={styles.tagRemove} onClick={() => removeSkill(skill.id)}>✕</button>
          </span>
        ))}
      </div>
      <div style={styles.addRow}>
        <input
          style={styles.input}
          placeholder="Skill name"
          value={newSkill.name}
          onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && addSkill()}
        />
        <select style={styles.select} value={newSkill.category} onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}>
          <option value="technical">Technical</option>
          <option value="soft">Soft</option>
        </select>
        <button style={styles.addBtn} onClick={addSkill}>Add</button>
      </div>
      <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Skills'}
      </button>
    </div>
  )
}

const styles = {
  tagContainer: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' },
  tag: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', background: '#e0e7ff', color: '#3730a3', fontSize: '13px' },
  tagRemove: { background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', fontSize: '12px' },
  addRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
  input: { flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  select: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  addBtn: { padding: '10px 16px', borderRadius: '8px', background: '#f3f4f6', border: '1px solid #ddd', cursor: 'pointer', fontSize: '14px' },
  saveBtn: { padding: '10px 20px', borderRadius: '8px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px' },
}