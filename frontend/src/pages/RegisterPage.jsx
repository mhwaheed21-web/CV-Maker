import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register as registerApi, getMe } from '../api/auth'
import useAuthStore from '../store/authStore'
import useToastStore from '../store/toastStore'
import { Button, Input } from '../components/common'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { success } = useToastStore()
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = (values) => {
    const nextErrors = {}

    if (!values.full_name.trim()) {
      nextErrors.full_name = 'Full name is required.'
    }

    if (!values.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!values.password) {
      nextErrors.password = 'Password is required.'
    } else if (values.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    }

    return nextErrors
  }

  const canSubmit = Object.keys(validate(form)).length === 0 && !loading

  const handleChange = (e) => {
    const nextForm = { ...form, [e.target.name]: e.target.value }
    setForm(nextForm)
    setErrors((currentErrors) => ({ ...currentErrors, [e.target.name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setLoading(true)
    try {
      const res = await registerApi(form)
      const { access_token, refresh_token } = res.data
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      const meRes = await getMe()
      login(meRes.data, access_token, refresh_token)
      success('Account created', 'Your workspace is ready.')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-ubuntu-background via-ubuntu-surface to-ubuntu-aubergine/60 px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rounded-full bg-ubuntu-aubergine/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-12 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />

      <div className="surface-card relative z-10 w-full max-w-md p-8 sm:p-10">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">CV Maker</p>
          <h1 className="text-3xl font-bold tracking-tight text-ubuntu-text">Create Account</h1>
          <h2 className="mt-2 text-sm font-medium text-ubuntu-muted">Start building tailored CVs</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={form.full_name}
            onChange={handleChange}
            error={errors.full_name}
          />
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />

          <Button type="submit" loading={loading} className="mt-1 w-full" disabled={!canSubmit}>
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ubuntu-muted">
          Already have an account?{' '}
          <Link className="font-semibold text-brand-400 transition-all duration-250 ease-in-out hover:text-brand-300" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
