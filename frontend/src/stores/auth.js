import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

/**
 * Auth store — manages authentication state for the application.
 *
 * Endpoints used:
 *   POST /api/auth/request-otp   — request OTP for a phone number
 *   POST /api/auth/register      — register with name, phone, password, OTP code
 *   POST /api/auth/login         — login with phone + password
 *   POST /api/auth/logout        — revoke current Sanctum token
 */
export const useAuthStore = defineStore('auth', () => {
  // ── State ──────────────────────────────────────────────────
  const user  = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'))
  const token = ref(localStorage.getItem('auth_token') || null)
  const loading = ref(false)
  const error   = ref(null)

  // ── Getters ────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.is_admin === true)

  // ── Helpers ────────────────────────────────────────────────
  function setSession(userData, authToken) {
    user.value  = userData
    token.value = authToken
    localStorage.setItem('auth_user',  JSON.stringify(userData))
    localStorage.setItem('auth_token', authToken)
  }

  function clearSession() {
    user.value  = null
    token.value = null
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
  }

  function clearError() {
    error.value = null
  }

  // ── Actions ────────────────────────────────────────────────

  /**
   * Request an OTP for a phone number (used during registration).
   * POST /api/auth/request-otp
   */
  async function requestOtp(phone) {
    loading.value = true
    error.value   = null
    try {
      await api.post('/auth/request-otp', { phone })
      return true
    } catch (err) {
      error.value = extractErrorMessage(err, 'Failed to send verification code.')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Register a new user.
   * POST /api/auth/register
   * Body: { first_name, second_name, phone, password, code }
   */
  async function register(payload) {
    loading.value = true
    error.value   = null
    try {
      const response = await api.post('/auth/register', payload)
      const { user: userData, token: authToken } = response.data
      setSession(userData, authToken)
      return true
    } catch (err) {
      error.value = extractErrorMessage(err, 'Registration failed. Please try again.')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Log in with phone + password.
   * POST /api/auth/login
   */
  async function login(phone, password) {
    loading.value = true
    error.value   = null
    try {
      const response = await api.post('/auth/login', { phone, password })
      const { user: userData, token: authToken } = response.data
      setSession(userData, authToken)
      return true
    } catch (err) {
      error.value = extractErrorMessage(err, 'Invalid credentials. Please try again.')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Log out — revokes the Sanctum token on the backend.
   * POST /api/auth/logout
   */
  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch {
      // Revoke locally even if backend call fails.
    } finally {
      clearSession()
    }
  }

  // ── Error extraction helper ───────────────────────────────
  function extractErrorMessage(err, fallback) {
    const data = err.response?.data
    if (!data) return fallback

    // Laravel validation errors: { errors: { field: ['msg'] } }
    if (data.errors) {
      const first = Object.values(data.errors).flat()[0]
      if (first) return first
    }
    // Laravel single-field errors
    if (data.error) return data.error
    if (data.message) return data.message

    return fallback
  }

  /**
   * Fetch current user profile.
   * GET /api/profile
   */
  async function fetchProfile() {
    if (!token.value) return null
    try {
      const response = await api.get('/profile')
      const userData = response.data.data || response.data
      user.value = userData
      localStorage.setItem('auth_user', JSON.stringify(userData))
      return userData
    } catch {
      return null
    }
  }

  /**
   * Update current user profile (supports text fields, photo upload, and payment info).
   * POST /api/profile or PUT /api/profile
   */
  async function updateProfile(payload) {
    loading.value = true
    error.value   = null
    try {
      let response
      if (payload instanceof FormData) {
        response = await api.post('/profile', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        response = await api.put('/profile', payload)
      }
      const updatedUser = response.data.user || response.data.data || response.data
      user.value = updatedUser
      localStorage.setItem('auth_user', JSON.stringify(updatedUser))
      return { success: true, message: response.data.message || 'Profile updated successfully.' }
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to update profile.')
      error.value = msg
      return { success: false, message: msg }
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    requestOtp,
    register,
    login,
    logout,
    fetchProfile,
    updateProfile,
    clearError,
  }
})
