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
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.row}>
        <input style={styles.input} name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} />
        <input style={styles.input} name="location" placeholder="Location (e.g. Karachi, Pakistan)" value={form.location} onChange={handleChange} />
      </div>
      <div style={styles.row}>
        <input style={styles.input} name="linkedin_url" placeholder="LinkedIn URL" value={form.linkedin_url} onChange={handleChange} />
        <input style={styles.input} name="portfolio_url" placeholder="Portfolio URL" value={form.portfolio_url} onChange={handleChange} />
      </div>
      <textarea
        style={styles.textarea}
        name="professional_summary"
        placeholder="Professional summary..."
        value={form.professional_summary}
        onChange={handleChange}
        rows={4}
      />
      <button style={styles.button} type="submit" disabled={saving}>
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Personal Info'}
      </button>
    </form>
  )
}

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  row: { display: 'flex', gap: '12px' },
  input: { flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  textarea: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', resize: 'vertical' },
  button: { alignSelf: 'flex-start', padding: '10px 20px', borderRadius: '8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', fontSize: '14px', cursor: 'pointer' },
}