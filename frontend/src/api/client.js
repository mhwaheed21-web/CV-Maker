import axios from 'axios'
import useToastStore from '../store/toastStore'

function formatValidationMessage(detail) {
  if (typeof detail === 'string') return detail

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const path = Array.isArray(item.loc) ? item.loc.filter(Boolean).join('.') : ''
        const message = item.msg || 'Invalid value'
        return path ? `${path}: ${message}` : message
      })
      .join('\n')
  }

  return 'Validation failed'
}

const client = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const toastStore = useToastStore.getState()
    const original = error.config || {}
    const requestUrl = original.url || ''
    const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register') || requestUrl.includes('/auth/refresh')

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const res = await axios.post('/api/v1/auth/refresh', {
            refresh_token: refreshToken,
          })
          const { access_token, refresh_token } = res.data
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)
          original.headers.Authorization = `Bearer ${access_token}`
          return client(original)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      } else {
        localStorage.clear()
        window.location.href = '/login'
      }
    }

    if (error.response?.status === 401 && isAuthEndpoint) {
      toastStore.error('Authentication failed', error.response.data?.detail || 'Invalid credentials or expired session.', {
        duration: 4000,
      })
    } else if (error.response?.status === 422) {
      toastStore.error('Validation error', formatValidationMessage(error.response.data?.detail), { duration: 4000 })
    } else if (!error.response) {
      toastStore.error('Network error', 'Unable to reach the server. Please try again.', { duration: 4000 })
    } else if (error.response?.status >= 500) {
      toastStore.error('Server error', error.response.data?.detail || 'Something went wrong on the server.', {
        duration: 4000,
      })
    }

    return Promise.reject(error)
  }
)

export default client