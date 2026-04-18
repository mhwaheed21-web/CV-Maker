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
      <div className="mb-3 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill.id}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
          >
            {skill.name}
            <button
              className="text-indigo-500 transition hover:text-indigo-700"
              onClick={() => removeSkill(skill.id)}
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto]">
        <input
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          placeholder="Skill name"
          value={newSkill.name}
          onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && addSkill()}
        />
        <select
          className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          value={newSkill.category}
          onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
        >
          <option value="technical">Technical</option>
          <option value="soft">Soft</option>
        </select>

        <button
          className="h-11 min-w-[44px] rounded-xl border border-slate-300 bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          onClick={addSkill}
        >
          Add
        </button>
      </div>

      <button
        className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Skills'}
      </button>
    </div>
  )
}