import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '@/lib/axios'

export const useFulfillmentStore = defineStore('fulfillment', () => {
  const fulfillments = ref([])
  const currentFulfillment = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  })

  /**
   * Fetch fulfillments assigned to logged-in farmer.
   */
  async function fetchFulfillments(params = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await axios.get('/api/fulfillments', { params })
      // Laravel JSON API Resource collection
      const data = res.data.data ? res.data.data : res.data
      fulfillments.value = data
      if (res.data.meta) {
        pagination.value = {
          currentPage: res.data.meta.current_page,
          lastPage: res.data.meta.last_page,
          total: res.data.meta.total,
        }
      }
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch fulfillment orders.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch details for a specific fulfillment row.
   */
  async function fetchFulfillmentDetails(id) {
    loading.value = true
    error.value = null
    try {
      const res = await axios.get(`/api/fulfillments/${id}`)
      currentFulfillment.value = res.data.fulfillment || res.data.data
      return { success: true, fulfillment: currentFulfillment.value }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch fulfillment details.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Accept pending fulfillment.
   */
  async function acceptFulfillment(id) {
    loading.value = true
    error.value = null
    try {
      const res = await axios.post(`/api/fulfillments/${id}/accept`)
      const updated = res.data.fulfillment || res.data.data
      
      // Update locally in array
      const idx = fulfillments.value.findIndex(f => f.id === id)
      if (idx !== -1) {
        fulfillments.value[idx] = updated
      }
      if (currentFulfillment.value?.id === id) {
        currentFulfillment.value = updated
      }
      return { success: true, message: 'Fulfillment accepted successfully!' }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to accept fulfillment.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Reject pending fulfillment and release reserved stock.
   */
  async function rejectFulfillment(id, rejectionReason = '') {
    loading.value = true
    error.value = null
    try {
      const res = await axios.post(`/api/fulfillments/${id}/reject`, {
        rejection_reason: rejectionReason,
      })
      const updated = res.data.fulfillment || res.data.data

      const idx = fulfillments.value.findIndex(f => f.id === id)
      if (idx !== -1) {
        fulfillments.value[idx] = updated
      }
      if (currentFulfillment.value?.id === id) {
        currentFulfillment.value = updated
      }
      return { success: true, message: 'Fulfillment rejected and stock released.' }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to reject fulfillment.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Complete accepted fulfillment upon physical produce delivery/handoff.
   */
  async function completeFulfillment(id) {
    loading.value = true
    error.value = null
    try {
      const res = await axios.post(`/api/fulfillments/${id}/complete`)
      const updated = res.data.fulfillment || res.data.data

      const idx = fulfillments.value.findIndex(f => f.id === id)
      if (idx !== -1) {
        fulfillments.value[idx] = updated
      }
      if (currentFulfillment.value?.id === id) {
        currentFulfillment.value = updated
      }
      return { success: true, message: 'Fulfillment marked as completed!' }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to complete fulfillment.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    fulfillments,
    currentFulfillment,
    loading,
    error,
    pagination,
    fetchFulfillments,
    fetchFulfillmentDetails,
    acceptFulfillment,
    rejectFulfillment,
    completeFulfillment,
  }
})
