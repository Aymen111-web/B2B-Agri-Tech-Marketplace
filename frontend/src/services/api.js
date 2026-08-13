import axios from 'axios'

/**
 * Axios instance pre-configured to talk to the Laravel backend.
 *
 * In development: requests go through Vite's proxy (/api → http://127.0.0.1:8000/api).
 * This eliminates CORS entirely since the browser sees all requests as same-origin.
 * Auth strategy: Sanctum token — stored in localStorage and sent as Bearer token.
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ── Request interceptor — attach the Sanctum token on every request ──
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor — surface errors consistently ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // On 401, clear stale credentials so the auth store can react.
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
    return Promise.reject(error)
  },
)

export default api
