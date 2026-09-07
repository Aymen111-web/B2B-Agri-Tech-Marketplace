<template>
  <div class="space-y-6 max-w-2xl mx-auto pb-12">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-[#E2E4E7] pb-3">
      <div class="flex items-center gap-3">
        <router-link to="/buyer/cart" class="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
          <ArrowLeft class="w-5 h-5" />
        </router-link>
        <div>
          <h1 class="text-lg font-black text-[#1E2328]">Procurement Batch Checkout</h1>
          <p class="text-xs text-[#5A6270]">Review selected produce batches & total Chapa Escrow payable</p>
        </div>
      </div>

      <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-[#1E9444] border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
        <ShieldCheck class="w-3.5 h-3.5" /> Chapa Protected
      </span>
    </div>

    <!-- Main Content Container -->
    <div v-if="checkoutItems.length > 0" class="space-y-6">
      
      <!-- Selected Produce Batches List Card -->
      <div class="bg-white border border-[#E2E4E7] rounded-2xl p-5 shadow-2xs space-y-4">
        <div class="flex justify-between items-center border-b border-gray-100 pb-3">
          <span class="text-xs font-black text-[#1E2328] uppercase tracking-wider">
            Selected Produce Batches ({{ checkoutItems.length }})
          </span>
          <router-link to="/buyer/cart" class="text-xs font-bold text-[#0B57D0] hover:underline">
            Edit Cart Items
          </router-link>
        </div>

        <div class="space-y-4 divide-y divide-gray-100">
          <div 
            v-for="item in checkoutItems" 
            :key="item.id || item.listing?.id"
            class="pt-3 first:pt-0 space-y-3"
          >
            <div class="flex items-start gap-3">
              <div class="w-12 h-12 bg-[#F8F9FA] border border-gray-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                {{ item.listing?.cropEmoji || '🌾' }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="px-2 py-0.5 rounded bg-blue-50 text-[#0B57D0] text-[10px] font-bold">
                    {{ item.listing?.grade || 'Grade 1' }}
                  </span>
                </div>
                <h3 class="text-sm font-bold text-[#1E2328] truncate">{{ item.listing?.cropName }}</h3>
                <p class="text-[11px] text-[#5A6270]">
                  {{ item.listing?.farmer?.name || 'Producer' }} · {{ item.listing?.region || 'Ethiopia' }}
                </p>
              </div>

              <div class="text-right shrink-0">
                <span class="text-xs font-black text-[#1E9444]">
                  {{ formatETB((item.listing?.pricePerKg || 0) * (item.quantityKg || 100)) }}
                </span>
                <span class="text-[10px] text-gray-400 block">
                  {{ formatETB(item.listing?.pricePerKg) }}/kg
                </span>
              </div>
            </div>

            <!-- Quantity Controls per Item -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between bg-[#F8F9FA] p-3 rounded-xl border border-gray-100 text-xs gap-3">
              <span class="text-gray-500 font-medium">Sourcing Volume:</span>
              <div class="flex items-center gap-2">
                <!-- Minus Button -->
                <button 
                  type="button"
                  @click="updateQty(item, (item.quantityKg || 1) - 1)"
                  :disabled="(item.quantityKg || 1) <= 1"
                  class="w-10 h-10 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 disabled:opacity-40 rounded-xl font-black text-lg flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                  title="Decrease volume by 1"
                >
                  -
                </button>

                <!-- Input Box -->
                <input 
                  type="number" 
                  :value="item.quantityKg || 1"
                  @input="updateQty(item, $event.target.value)"
                  min="1"
                  :max="item.listing?.availableQty !== undefined && item.listing?.availableQty !== null ? Math.max(item.listing.availableQty, 1) : 100000"
                  step="1"
                  class="w-20 py-2 bg-white border border-[#E2E4E7] focus:border-[#0B57D0] focus:outline-none font-black text-[#1E2328] text-center rounded-xl text-sm shadow-2xs"
                />

                <!-- Plus Button -->
                <button 
                  type="button"
                  @click="updateQty(item, (item.quantityKg || 1) + 1)"
                  :disabled="(item.quantityKg || 1) >= (item.listing?.availableQty !== undefined && item.listing?.availableQty !== null ? item.listing.availableQty : 100000)"
                  class="w-10 h-10 bg-[#0B57D0]/10 text-[#0B57D0] hover:bg-[#0B57D0] hover:text-white border border-[#0B57D0]/30 disabled:opacity-40 rounded-xl font-black text-lg flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                  title="Increase volume by 1"
                >
                  +
                </button>

                <!-- Unit Dropdown -->
                <select 
                  :value="item.unit || 'KG'" 
                  @change="handleUnitChange(item, $event.target.value)"
                  class="px-2.5 py-2 bg-white border border-[#E2E4E7] focus:border-[#0B57D0] focus:outline-none font-bold text-[#1E2328] rounded-xl text-xs shadow-2xs cursor-pointer"
                >
                  <option value="KG">KG</option>
                  <option value="Quintals">Quintals (100 KG)</option>
                  <option value="Litres">Litres (L)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Target Delivery Logistics Hub Selector -->
      <div class="bg-white border border-[#E2E4E7] rounded-2xl p-5 shadow-2xs space-y-2">
        <label class="text-xs font-bold text-[#1E2328]">Target Delivery Hub</label>
        <select 
          v-model="selectedHub" 
          class="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E2E4E7] rounded-xl text-xs font-semibold text-[#1E2328] focus:border-[#0B57D0] focus:outline-none"
        >
          <option value="" disabled>Select Delivery Destination (Loading...)</option>
          <option v-for="hub in availableHubs" :key="hub.id" :value="hub.id">{{ hub.name }}</option>
        </select>
      </div>

      <!-- Financial Breakdown Box -->
      <div class="bg-white border border-[#E2E4E7] rounded-2xl p-5 shadow-2xs space-y-3">
        <h4 class="text-xs font-bold text-[#1E2328] uppercase border-b border-gray-100 pb-2">Financial Breakdown</h4>

        <div class="space-y-2 text-xs">
          <div 
            v-for="item in checkoutItems" 
            :key="`sum-${item.id || item.listing?.id}`"
            class="flex justify-between text-[#5A6270]"
          >
            <span>{{ item.listing?.cropName }} ({{ (item.quantityKg || 1).toLocaleString() }} {{ item.unit || 'KG' }})</span>
            <span class="font-bold text-[#1E2328]">
              {{ formatETB(getItemSubtotal(item)) }}
            </span>
          </div>

          <div class="flex justify-between text-[#5A6270]">
            <span>Chapa Escrow Fee & Inspection</span>
            <span class="font-bold text-emerald-600">Included</span>
          </div>

          <div class="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center text-sm font-black">
            <span class="text-[#1E2328]">Total Payable ETB</span>
            <span class="text-[#1E9444] text-xl">{{ formatETB(totalPayableETB) }}</span>
          </div>
        </div>
      </div>

      <!-- Chapa Escrow Protection Banner -->
      <p class="text-[11px] text-[#5A6270] flex items-center gap-2 bg-[#EDFAF2] p-3.5 rounded-xl border border-[#C3EFCF]">
        <Lock class="w-4 h-4 text-[#1E9444] shrink-0" />
        <span>Funds locked in Chapa Escrow. Payment released to farmers ONLY after driver delivery PIN handoff.</span>
      </p>

      <!-- Pay Action Button -->
      <button 
        @click="handleCheckout" 
        :disabled="isProcessing || totalPayableETB <= 0"
        class="w-full py-4 rounded-xl bg-[#1E9444] text-white font-bold text-sm shadow-md hover:bg-[#0F5C2A] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <Loader2 v-if="isProcessing" class="w-4 h-4 animate-spin" />
        <span v-else class="flex items-center gap-2">
          <Lock class="w-4 h-4" />
          <span>Proceed to Chapa Escrow Payment ({{ formatETB(totalPayableETB) }})</span>
        </span>
      </button>

    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-white border border-[#E2E4E7] rounded-2xl p-6 text-[#5A6270] space-y-3">
      <p>No produce batches selected for checkout.</p>
      <router-link to="/buyer/marketplace" class="text-[#0B57D0] font-bold text-xs hover:underline">
        Browse Produce Marketplace
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ShieldCheck, Lock, Loader2 } from 'lucide-vue-next'
import { useListings } from '@/composables/useListings'
import { useOrders } from '@/composables/useOrders'
import { useAuth } from '@/composables/useAuth'
import { useCart } from '@/composables/useCart'
import { api } from '@/services/api'
import { formatETB } from '@/utils/helpers'

const route = useRoute()
const router = useRouter()
const { getListingById, listings } = useListings()
const { placeOrder } = useOrders()
const { user } = useAuth()
const { selectedItems, cartItems, updateQuantity, updateUnit, getItemSubtotal, clearCart } = useCart()

const isProcessing = ref(false)
const selectedHub = ref('')
const availableHubs = ref([]) // To be populated by backend

const checkoutItems = computed(() => {
  // 1. If explicit listing ID passed in URL path
  if (route.params.id) {
    const singleListing = getListingById(route.params.id)
    if (singleListing) {
      return [{
        id: `single-${singleListing.id}`,
        listing: singleListing,
        quantityKg: 1,
        unit: 'KG'
      }]
    }
  }

  // 2. Return selected items from cart if any selected
  if (selectedItems.value.length > 0) {
    return selectedItems.value
  }

  // 3. Return all items in cart if none selected
  if (cartItems.value.length > 0) {
    return cartItems.value
  }

  return []
})

const updateQty = (item, newQty) => {
  const parsed = parseInt(newQty)
  if (item.id && !item.id.startsWith('single-') && !item.id.startsWith('default-')) {
    updateQuantity(item.id, parsed)
  } else {
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

const handleUnitChange = (item, newUnit) => {
  if (item.id && !item.id.startsWith('single-') && !item.id.startsWith('default-')) {
    updateUnit(item.id, newUnit)
  } else {
    item.unit = newUnit
  }
}

const totalPayableETB = computed(() => {
  return checkoutItems.value.reduce((sum, item) => {
    return sum + getItemSubtotal(item)
  }, 0)
})

const handleCheckout = async () => {
  if (checkoutItems.value.length === 0) return
  isProcessing.value = true

  try {
    const firstListing = checkoutItems.value[0]?.listing
    const rawId = firstListing?.id ? String(firstListing.id).replace(/[^0-9]/g, '') : ''
    const cleanListingId = parseInt(rawId) || 2
    const targetQty = checkoutItems.value[0]?.quantityKg ?? 500

    // 1. Reserve stock & create order on backend
    let orderId = null
    const checkoutRes = await api.checkoutOrder({ 
      listing_id: cleanListingId, 
      quantity_kg: targetQty
    }).catch((err) => {
      throw err // Properly throw error up to catch block for alerting
    })

    if (checkoutRes?.order?.id) {
      orderId = checkoutRes.order.id
    }

    // 2. Sync local order placement state for all items
    checkoutItems.value.forEach(item => {
      if (item.listing) {
        placeOrder(item.listing, user.value, item.quantityKg || 100)
      }
    })

    // 3. Call backend Chapa payment initiation API if real order created
    if (orderId) {
      const payRes = await api.initiateOrderPayment(orderId).catch((err) => {
        throw err // Properly throw error up to catch block for alerting
      })

      // Clear checkout items from cart
      clearCart()

      // 4. Direct redirect to Chapa hosted payment checkout URL (e.g. https://checkout.chapa.co/...)
      if (payRes && payRes.checkout_url) {
        window.location.href = payRes.checkout_url
        return
      }
    }

    // 5. Fallback error if we couldn't proceed
    throw new Error('Payment Initiation Failed: Order could not be created or payment URL was empty.')
  } catch (err) {
    alert(err.message || 'Payment initiation failed.')
  } finally {
    isProcessing.value = false
  }
}
</script>
