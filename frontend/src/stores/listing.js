import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useListingStore = defineStore('listing', () => {
  const listings = ref([])
  const currentListing = ref(null)
  const myListings = ref([])
  const categories = ref([])
  const pagination = ref({ currentPage: 1, lastPage: 1, total: 0 })
  const loading = ref(false)
  const error = ref(null)

  function clearError() {
    error.value = null
  }

  /**
   * Fetch categories.
   * GET /api/categories
   */
  async function fetchCategories() {
    try {
      const response = await api.get('/categories')
      categories.value = response.data.data || response.data || []
      return categories.value
    } catch (err) {
      console.error('Failed to fetch categories:', err)
      return []
    }
  }

  /**
   * Fetch public listings with search, category filter, sorting.
   * GET /api/listings?search=...&category_id=...&sort=...
   */
  async function fetchListings(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/listings', { params })
      listings.value = response.data.data || response.data || []
      pagination.value = {
        currentPage: response.data.meta?.current_page || 1,
        lastPage: response.data.meta?.last_page || 1,
        total: response.data.meta?.total || listings.value.length,
      }
      return listings.value
    } catch (err) {
      error.value = extractErrorMessage(err, 'Failed to load produce listings.')
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch a single listing by ID (includes price history).
   * GET /api/listings/{id}
   */
  async function fetchListingDetails(id) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/listings/${id}`)
      currentListing.value = response.data.listing || response.data
      return currentListing.value
    } catch (err) {
      error.value = extractErrorMessage(err, 'Failed to load listing details.')
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch authenticated farmer's own listings.
   * GET /api/listings/my
   */
  async function fetchMyListings(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/listings/my', { params })
      myListings.value = response.data.data || response.data || []
      return myListings.value
    } catch (err) {
      error.value = extractErrorMessage(err, 'Failed to fetch your listings.')
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new produce listing (Farmer only).
   * POST /api/listings
   */
  async function createListing(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/listings', payload)
      await fetchMyListings()
      return response.data
    } catch (err) {
      error.value = extractErrorMessage(err, 'Failed to create produce listing.')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing listing.
   * PUT /api/listings/{id}
   */
  async function updateListing(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/listings/${id}`, payload)
      await fetchMyListings()
      return response.data
    } catch (err) {
      error.value = extractErrorMessage(err, 'Failed to update produce listing.')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Soft-delete a produce listing.
   * DELETE /api/listings/{id}
   */
  async function deleteListing(id) {
    loading.value = true
    error.value = null
    try {
      const response = await api.delete(`/listings/${id}`)
      await fetchMyListings()
      return response.data
    } catch (err) {
      error.value = extractErrorMessage(err, 'Failed to remove listing.')
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
    listings,
    currentListing,
    myListings,
    categories,
    pagination,
    loading,
    error,
    clearError,
    fetchCategories,
    fetchListings,
    fetchListingDetails,
    fetchMyListings,
    createListing,
    updateListing,
    deleteListing,
  }
})
