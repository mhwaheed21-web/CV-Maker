import { useState, useEffect } from 'react'
import { updatePersonal } from '../../api/profile'
import useProfileStore from '../../store/profileStore'
import useToastStore from '../../store/toastStore'

export default function PersonalInfoForm({ data }) {
  const { updatePersonal: updateStore } = useProfileStore()
  const { success } = useToastStore()
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
      success('Personal info saved', 'Your profile details were updated successfully.')
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
          className="h-11 w-full rounded-xl2 border border-ubuntu-border bg-ubuntu-surfaceAlt px-4 text-sm text-ubuntu-text outline-none transition-all duration-250 ease-in-out focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          name="phone"
          placeholder="Phone number"
          value={form.phone}
          onChange={handleChange}
        />
        <input
          className="h-11 w-full rounded-xl2 border border-ubuntu-border bg-ubuntu-surfaceAlt px-4 text-sm text-ubuntu-text outline-none transition-all duration-250 ease-in-out focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          name="location"
          placeholder="Location (e.g. Karachi, Pakistan)"
          value={form.location}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input
          className="h-11 w-full rounded-xl2 border border-ubuntu-border bg-ubuntu-surfaceAlt px-4 text-sm text-ubuntu-text outline-none transition-all duration-250 ease-in-out focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          name="linkedin_url"
          placeholder="LinkedIn URL"
          value={form.linkedin_url}
          onChange={handleChange}
        />
        <input
          className="h-11 w-full rounded-xl2 border border-ubuntu-border bg-ubuntu-surfaceAlt px-4 text-sm text-ubuntu-text outline-none transition-all duration-250 ease-in-out focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          name="portfolio_url"
          placeholder="Portfolio URL"
          value={form.portfolio_url}
          onChange={handleChange}
        />
      </div>

      <textarea
        className="min-h-28 w-full rounded-xl2 border border-ubuntu-border bg-ubuntu-surfaceAlt px-4 py-3 text-sm text-ubuntu-text outline-none transition-all duration-250 ease-in-out focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        name="professional_summary"
        placeholder="Professional summary..."
        value={form.professional_summary}
        onChange={handleChange}
        rows={4}
      />

      <button
        className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl2 bg-brand-500 px-5 text-sm font-semibold text-white shadow-soft transition-all duration-250 ease-in-out hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-ubuntu-surfaceAlt"
        type="submit"
        disabled={saving}
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Personal Info'}
      </button>
    </form>
  )
}