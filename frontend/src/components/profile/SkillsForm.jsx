import { useState, useEffect } from 'react'
import { upsertSkills } from '../../api/profile'
import useProfileStore from '../../store/profileStore'
import useToastStore from '../../store/toastStore'

export default function SkillsForm({ data }) {
  const { updateSection } = useProfileStore()
  const { success } = useToastStore()
  const [skills, setSkills] = useState(data || [])
  const [newSkill, setNewSkill] = useState({ name: '', category: 'technical', proficiency: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setSkills(data || []) }, [data])

  const addSkill = () => {
    if (!newSkill.name.trim()) {
      setErrors({ name: 'Skill name is required.' })
      return
    }

    setSkills([...skills, { ...newSkill, id: `temp-${Date.now()}` }])
    setNewSkill({ name: '', category: 'technical', proficiency: '' })
    setErrors({})
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
      success('Skills saved', 'Your skills were updated successfully.')
      setTimeout(() => setSaved(false), 2000)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill.id}
            className="inline-flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-100"
          >
            {skill.name}
            <button
              className="text-brand-300 transition-all duration-250 ease-in-out hover:text-brand-100"
              onClick={() => removeSkill(skill.id)}
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto]">
        <input
          className="h-11 w-full rounded-xl2 border border-ubuntu-border bg-ubuntu-surfaceAlt px-4 text-sm text-ubuntu-text outline-none transition-all duration-250 ease-in-out focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          placeholder="Skill name"
          value={newSkill.name}
          onChange={(e) => {
            setNewSkill({ ...newSkill, name: e.target.value })
            if (errors.name) {
              setErrors((currentErrors) => ({ ...currentErrors, name: undefined }))
            }
          }}
          onKeyDown={(e) => e.key === 'Enter' && addSkill()}
        />
        <select
          className="h-11 rounded-xl2 border border-ubuntu-border bg-ubuntu-surfaceAlt px-4 text-sm text-ubuntu-text outline-none transition-all duration-250 ease-in-out focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          value={newSkill.category}
          onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
        >
          <option value="technical">Technical</option>
          <option value="soft">Soft</option>
        </select>

        <button
          className="h-11 min-w-[44px] rounded-xl2 border border-brand-500 bg-transparent px-4 text-sm font-semibold text-brand-400 transition-all duration-250 ease-in-out hover:bg-brand-500/10"
          onClick={addSkill}
        >
          Add
        </button>
      </div>

      {errors.name && <p className="mb-2 text-xs font-medium text-red-400">{errors.name}</p>}

      <button
        className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl2 bg-brand-500 px-5 text-sm font-semibold text-white shadow-soft transition-all duration-250 ease-in-out hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-ubuntu-surface"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Skills'}
      </button>
    </div>
  )
}