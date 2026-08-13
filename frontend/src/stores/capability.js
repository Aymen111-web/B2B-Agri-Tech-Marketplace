import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import { useAuthStore } from './auth'

export const useCapabilityStore = defineStore('capability', () => {
  const myApplications = ref([])
  const adminApplications = ref([])
  const pagination = ref({ currentPage: 1, lastPage: 1, total: 0 })
  const loading = ref(false)
  const error = ref(null)

  function clearError() {
    error.value = null
  }

  /**
   * Fetch logged-in user's capability applications.
   * GET /api/capability-applications/my
   */
  async function fetchMyApplications() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/capability-applications/my')
      myApplications.value = response.data.applications || []
      return myApplications.value
    } catch (err) {
      error.value = extractErrorMessage(err, 'Failed to fetch your applications.')
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Submit a new capability application (farmer or buyer).
   * POST /api/capability-applications
   */
  async function submitApplication(capabilityType, supportingDocuments = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/capability-applications', {
        capability_type: capabilityType,
        supporting_documents: supportingDocuments,
      })
      await fetchMyApplications()
      // Refresh user store to keep state in sync
      const auth = useAuthStore()
      if (auth.user) {
        const userRes = await api.get('/user')
        auth.setSession(userRes.data.data || userRes.data, auth.token)
      }
      return response.data
    } catch (err) {
      error.value = extractErrorMessage(err, 'Failed to submit application.')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Admin: fetch capability applications with optional filtering.
   * GET /api/admin/capability-applications
   */
  async function fetchAdminApplications(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/admin/capability-applications', { params })
      adminApplications.value = response.data.data || []
      pagination.value = {
        currentPage: response.data.meta?.current_page || 1,
        lastPage: response.data.meta?.last_page || 1,
        total: response.data.meta?.total || adminApplications.value.length,
      }
      return adminApplications.value
    } catch (err) {
      error.value = extractErrorMessage(err, 'Failed to fetch capability applications.')
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Admin: approve a pending application.
   * POST /api/admin/capability-applications/{id}/approve
   */
  async function approveApplication(id) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post(`/admin/capability-applications/${id}/approve`)
      await fetchAdminApplications()
      return response.data
    } catch (err) {
      error.value = extractErrorMessage(err, 'Failed to approve application.')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Admin: reject a pending application.
   * POST /api/admin/capability-applications/{id}/reject
   */
  async function rejectApplication(id, rejectionReason) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post(`/admin/capability-applications/${id}/reject`, {
        rejection_reason: rejectionReason,
      })
      await fetchAdminApplications()
      return response.data
    } catch (err) {
      error.value = extractErrorMessage(err, 'Failed to reject application.')
      throw err
    } finally {
      loading.value = false
    }
  }

  function extractErrorMessage(err, fallback) {
    const data = err.response?.data
    if (!data) return fallback
    if (data.errors) {
      const first = Object.values(data.errors).flat()[0]
      if (first) return first
    }
    if (data.message) return data.message
    if (data.error) return data.error
    return fallback
  }

  return {
    myApplications,
    adminApplications,
    pagination,
    loading,
    error,
    clearError,
    fetchMyApplications,
    submitApplication,
    fetchAdminApplications,
    approveApplication,
    rejectApplication,
  }
})
