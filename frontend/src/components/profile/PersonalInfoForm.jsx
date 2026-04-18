import { useState, useEffect } from 'react'
import { updatePersonal } from '../../api/profile'
import useProfileStore from '../../store/profileStore'

export default function PersonalInfoForm({ data }) {
  const { updatePersonal: updateStore } = useProfileStore()
  const [form, setForm] = useState({
    phone: '',
    location: '',
    linkedin_url: '',
    portfolio_url: '',
    professional_summary: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (data) {
      setForm({
        phone: data.phone || '',
        location: data.location || '',
        linkedin_url: data.linkedin_url || '',
        portfolio_url: data.portfolio_url || '',
        professional_summary: data.professional_summary || '',
      })
    }
  }, [data])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await updatePersonal(form)
      updateStore(res.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          name="phone"
          placeholder="Phone number"
          value={form.phone}
          onChange={handleChange}
        />
        <input
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          name="location"
          placeholder="Location (e.g. Karachi, Pakistan)"
          value={form.location}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          name="linkedin_url"
          placeholder="LinkedIn URL"
          value={form.linkedin_url}
          onChange={handleChange}
        />
        <input
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          name="portfolio_url"
          placeholder="Portfolio URL"
          value={form.portfolio_url}
          onChange={handleChange}
        />
      </div>

      <textarea
        className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        name="professional_summary"
        placeholder="Professional summary..."
        value={form.professional_summary}
        onChange={handleChange}
        rows={4}
      />

      <button
        className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        type="submit"
        disabled={saving}
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Personal Info'}
      </button>
    </form>
  )
}