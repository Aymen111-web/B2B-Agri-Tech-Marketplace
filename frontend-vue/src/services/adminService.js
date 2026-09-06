import { getAuthToken } from './api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function adminRequest(endpoint, options = {}) {
    const token = getAuthToken()

    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const primaryUrl = `${API_BASE_URL}${endpoint}`

    try {
        let response = await fetch(primaryUrl, { ...options, headers })

        if (response.status === 404 && API_BASE_URL === '/api') {
            const fallbackUrl = `http://127.0.0.1:8000/api${endpoint}`
            const fallbackRes = await fetch(fallbackUrl, { ...options, headers }).catch(() => null)
            if (fallbackRes && fallbackRes.ok) {
                response = fallbackRes
            }
        }

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
            const errorMessage = data?.error || data?.message || `HTTP ${response.status}: Request failed`
            throw new Error(errorMessage)
        }

        return data
    } catch (err) {
        if (API_BASE_URL === '/api') {
            try {
                const directUrl = `http://127.0.0.1:8000/api${endpoint}`
                const directRes = await fetch(directUrl, { ...options, headers })
                const data = await directRes.json().catch(() => ({}))
                if (!directRes.ok) {
                    throw new Error(data?.error || data?.message || `HTTP ${directRes.status}: Request failed`)
                }
                return data
            } catch (fallbackErr) {
                throw new Error(fallbackErr.message || err.message || 'Server request failed')
            }
        }
        throw err
    }
}

export const adminApi = {
    async fetchDashboardStats() {
        return adminRequest('/admin/dashboard/stats')
    },

    async fetchApplications(params) {
        const queryStr = params ? new URLSearchParams(params).toString() : ''
        return adminRequest(`/admin/capability-applications${queryStr ? `?${queryStr}` : ''}`)
    },

    async approveApplication(id) {
        return adminRequest(`/admin/capability-applications/${id}/approve`, { method: 'POST' })
    },

    async rejectApplication(id, rejection_reason) {
        return adminRequest(`/admin/capability-applications/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ rejection_reason }),
        })
    },

    async fetchListings(params) {
        const queryStr = params ? new URLSearchParams(params).toString() : ''
        return adminRequest(`/admin/listings${queryStr ? `?${queryStr}` : ''}`)
    },

    async moderateListing(id, status) {
        return adminRequest(`/admin/listings/${id}/moderate`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        })
    },

    async fetchOrders(params) {
        const queryStr = params ? new URLSearchParams(params).toString() : ''
        return adminRequest(`/admin/orders${queryStr ? `?${queryStr}` : ''}`)
    },

    async fetchPaymentExceptions(params) {
        const queryStr = params ? new URLSearchParams(params).toString() : ''
        return adminRequest(`/admin/payment-exceptions${queryStr ? `?${queryStr}` : ''}`)
    },

    async investigatePaymentException(id) {
        return adminRequest(`/admin/payment-exceptions/${id}/investigate`, { method: 'POST' })
    },

    async resolvePaymentException(id, resolution_notes) {
        return adminRequest(`/admin/payment-exceptions/${id}/resolve`, {
            method: 'POST',
            body: JSON.stringify({ resolution_notes }),
        })
    },

    async rejectPaymentException(id, resolution_notes) {
        return adminRequest(`/admin/payment-exceptions/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ resolution_notes }),
        })
    },

    async fetchUsers(params) {
        const queryStr = params ? new URLSearchParams(params).toString() : ''
        return adminRequest(`/admin/users${queryStr ? `?${queryStr}` : ''}`)
    },

    async fetchUserStats() {
        return adminRequest('/admin/users/stats')
    },

    async suspendUser(userId) {
        return adminRequest(`/admin/users/${userId}/suspend`, { method: 'POST' })
    },

    async activateUser(userId) {
        return adminRequest(`/admin/users/${userId}/activate`, { method: 'POST' })
    },
}
