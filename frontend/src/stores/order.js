import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import { useCartStore } from '@/stores/cart'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const currentOrder = ref(null)
  const loading = ref(false)
  const error = ref(null)

  /**
   * Perform concurrency-safe order checkout from cart.
   * POST /api/orders/checkout
   */
  async function checkout() {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/orders/checkout')
      currentOrder.value = response.data.order || response.data.data
      
      // Refresh cart state after successful checkout
      const cartStore = useCartStore()
      await cartStore.fetchCart()

      return {
        success: true,
        order: currentOrder.value,
        message: response.data.message || 'Order created successfully.',
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete checkout.'
      error.value = msg
      return { success: false, message: msg }
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch buyer's order history.
   * GET /api/orders?status=...
   */
  async function fetchOrders(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/orders', { params })
      const data = response.data.data || response.data.orders || response.data || []
      orders.value = Array.isArray(data) ? data : []
      return orders.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch orders.'
      console.error('Order fetch error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch details of a single order by ID.
   * GET /api/orders/{id}
   */
  async function fetchOrderDetails(id) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/orders/${id}`)
      currentOrder.value = response.data.order || response.data.data || response.data
      return currentOrder.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch order details.'
      console.error('Order details fetch error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Cancel an unpaid pending order and release reserved stock.
   * POST /api/orders/{id}/cancel
   */
  async function cancelOrder(id) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post(`/orders/${id}/cancel`)
      await fetchOrderDetails(id)
      return {
        success: true,
        message: response.data.message || 'Order cancelled successfully.',
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel order.'
      error.value = msg
      return { success: false, message: msg }
    } finally {
      loading.value = false
    }
  }

  return {
    orders,
    currentOrder,
    loading,
    error,
    checkout,
    fetchOrders,
    fetchOrderDetails,
    cancelOrder,
  }
})
