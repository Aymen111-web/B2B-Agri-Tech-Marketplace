import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Total item count in cart
  const itemCount = computed(() => {
    return items.value.reduce((total, item) => total + (Number(item.quantity) || 0), 0)
  })

  // Total monetary value of cart (ETB)
  const cartTotal = computed(() => {
    return items.value.reduce((total, item) => {
      const price = Number(item.price_snapshot) || Number(item.listing?.price_per_unit) || 0
      const qty = Number(item.quantity) || 0
      return total + (price * qty)
    }, 0)
  })

  // Group cart items by Farmer for transparent multi-farmer fulfillment
  const itemsByFarmer = computed(() => {
    const grouped = {}
    for (const item of items.value) {
      const farmerId = item.listing?.farmer_id || item.listing?.farmer?.id || 'unknown'
      const farmerName = item.listing?.farmer 
        ? `${item.listing.farmer.first_name} ${item.listing.farmer.second_name}`
        : 'Farmer'

      if (!grouped[farmerId]) {
        grouped[farmerId] = {
          farmerId,
          farmerName,
          items: [],
          subtotal: 0,
        }
      }
      const price = Number(item.price_snapshot) || Number(item.listing?.price_per_unit) || 0
      const subtotal = price * Number(item.quantity)
      grouped[farmerId].items.push(item)
      grouped[farmerId].subtotal += subtotal
    }
    return Object.values(grouped)
  })

  /**
   * Fetch buyer's cart items from backend API.
   * GET /api/cart
   */
  async function fetchCart() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/cart')
      const data = response.data.cart_items || response.data.data || response.data || []
      items.value = Array.isArray(data) ? data : []
      return items.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch cart.'
      console.error('Cart fetch error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Add a produce listing to buyer cart.
   * POST /api/cart
   */
  async function addToCart(listingId, quantity = 1) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/cart', {
        listing_id: listingId,
        quantity: Number(quantity),
      })
      await fetchCart()
      return { success: true, message: response.data.message || 'Item added to cart.' }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart.'
      error.value = msg
      return { success: false, message: msg }
    } finally {
      loading.value = false
    }
  }

  /**
   * Update quantity of an existing cart item.
   * PUT /api/cart/{id}
   */
  async function updateQuantity(cartItemId, quantity) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/cart/${cartItemId}`, {
        quantity: Number(quantity),
      })
      await fetchCart()
      return { success: true, message: response.data.message || 'Cart updated.' }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update item quantity.'
      error.value = msg
      return { success: false, message: msg }
    } finally {
      loading.value = false
    }
  }

  /**
   * Remove a single item from buyer cart.
   * DELETE /api/cart/{id}
   */
  async function removeFromCart(cartItemId) {
    loading.value = true
    error.value = null
    try {
      const response = await api.delete(`/cart/${cartItemId}`)
      await fetchCart()
      return { success: true, message: response.data.message || 'Item removed from cart.' }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove item.'
      error.value = msg
      return { success: false, message: msg }
    } finally {
      loading.value = false
    }
  }

  /**
   * Clear all items from buyer cart.
   * DELETE /api/cart
   */
  async function clearCart() {
    loading.value = true
    error.value = null
    try {
      const response = await api.delete('/cart/clear')
      items.value = []
      return { success: true, message: response.data.message || 'Cart cleared.' }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to clear cart.'
      error.value = msg
      return { success: false, message: msg }
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    loading,
    error,
    itemCount,
    cartTotal,
    itemsByFarmer,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  }
})
