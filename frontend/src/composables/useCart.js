import { ref, computed, watch } from 'vue'
import { api, getAuthToken } from '@/services/api'

const INITIAL_CART_ITEMS = [
    {
        id: 'cart-1',
        listingId: 1,
        listing: {
            id: 1,
            cropName: 'Sidama Washed Coffee G1',
            cropEmoji: '☕',
            grade: 'Grade 1',
            region: 'SNNPR',
            pricePerKg: 85,
            availableQty: 12000,
            minOrderQty: 500,
            farmer: { name: 'Dawit Bekele' }
        },
        quantityKg: 5,
        unit: 'KG',
        selected: true
    },
    {
        id: 'cart-2',
        listingId: 3,
        listing: {
            id: 3,
            cropName: 'Bale Durum Wheat',
            cropEmoji: '🌾',
            grade: 'Grade A',
            region: 'Oromia',
            pricePerKg: 28,
            availableQty: 55000,
            minOrderQty: 1000,
            farmer: { name: 'Abebe Girma' }
        },
        quantityKg: 10,
        unit: 'Quintals',
        selected: true
    }
]

const cartItems = ref([])
const isLoaded = ref(false)

function loadCartFromStorage() {
    const saved = localStorage.getItem('agri_cart_items')
    if (saved) {
        try {
            cartItems.value = JSON.parse(saved)
            isLoaded.value = true
            return
        } catch { /* ignore */ }
    }
    cartItems.value = []
    isLoaded.value = true
}

export function useCart() {
    if (!isLoaded.value) {
        loadCartFromStorage()
    }

    watch(cartItems, (val) => {
        localStorage.setItem('agri_cart_items', JSON.stringify(val))
    }, { deep: true })

    const addToCart = (listing, quantityKg = null, unit = 'KG') => {
        const qty = quantityKg || 1
        const existingIndex = cartItems.value.findIndex(item => item.listingId === listing.id || item.listing?.id === listing.id)

        if (existingIndex > -1) {
            cartItems.value[existingIndex].quantityKg += qty
            cartItems.value[existingIndex].selected = true
        } else {
            cartItems.value.unshift({
                id: `cart-${Date.now()}`,
                listingId: listing.id,
                listing,
                quantityKg: qty,
                unit: unit || 'KG',
                selected: true
            })
        }
    }

    const removeFromCart = (cartItemId) => {
        cartItems.value = cartItems.value.filter(item => item.id !== cartItemId)
    }

    const updateQuantity = (cartItemId, newQty) => {
        const item = cartItems.value.find(i => i.id === cartItemId)
        if (item) {
            const parsed = parseInt(newQty)
            const max = item.listing?.availableQty !== undefined && item.listing?.availableQty !== null ? item.listing.availableQty : 100000
            if (isNaN(parsed) || parsed < 1) {
                item.quantityKg = 1
            } else if (parsed > max) {
                item.quantityKg = Math.max(max, 1)
            } else {
                item.quantityKg = parsed
            }
        }
    }

    const updateUnit = (cartItemId, newUnit) => {
        const item = cartItems.value.find(i => i.id === cartItemId)
        if (item) {
            item.unit = newUnit
        }
    }

    const getItemSubtotal = (item) => {
        if (!item || !item.listing) return 0
        const price = item.listing.pricePerKg || 0
        const qty = item.quantityKg || 1
        if (item.unit === 'Quintals') {
            return price * 100 * qty
        }
        return price * qty
    }

    const toggleSelect = (cartItemId) => {
        const item = cartItems.value.find(i => i.id === cartItemId)
        if (item) {
            item.selected = !item.selected
        }
    }

    const selectAll = (val = true) => {
        cartItems.value.forEach(item => { item.selected = val })
    }

    const clearCart = () => {
        cartItems.value = []
    }

    const selectedItems = computed(() => cartItems.value.filter(i => i.selected))
    const selectedCount = computed(() => selectedItems.value.length)
    const totalCartCount = computed(() => cartItems.value.length)

    const selectedSubtotal = computed(() => {
        return selectedItems.value.reduce((sum, item) => {
            return sum + getItemSubtotal(item)
        }, 0)
    })

    return {
        cartItems,
        selectedItems,
        selectedCount,
        totalCartCount,
        selectedSubtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateUnit,
        getItemSubtotal,
        toggleSelect,
        selectAll,
        clearCart
    }
}
