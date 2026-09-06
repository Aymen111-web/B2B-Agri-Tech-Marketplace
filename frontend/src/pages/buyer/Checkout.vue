<template>
  <div class="space-y-6 max-w-2xl">
    <h1 class="text-[20px] font-black text-[#1E2328]">Checkout</h1>
    <div v-if="listing" class="bg-white border border-[#E2E4E7] rounded-2xl p-6 space-y-4">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 bg-[#F0F1F2] rounded-xl flex items-center justify-center text-3xl">{{ listing.cropEmoji }}</div>
        <div><h3 class="font-bold text-[15px] text-[#1E2328]">{{ listing.cropName }}</h3><p class="text-[12px] text-[#5A6270]">{{ listing.farmer?.name }} · {{ listing.region }}</p></div>
      </div>
      <div><label class="text-[12px] font-bold text-[#1E2328] block mb-1">Quantity (kg)</label>
        <input type="number" v-model.number="quantity" :min="listing.minOrderQty" :max="listing.availableQty" class="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E2E4E7] rounded-xl text-[14px] focus:border-[#1E9444] focus:outline-none" />
        <p class="text-[11px] text-[#5A6270] mt-1">Min: {{ listing.minOrderQty }} kg · Available: {{ listing.availableQty.toLocaleString() }} kg</p>
      </div>
      <div class="bg-[#EDFAF2] border border-[#C3EFCF] rounded-xl p-4 space-y-2">
        <div class="flex justify-between text-[13px]"><span class="text-[#5A6270]">Unit Price</span><span class="font-bold">{{ formatETB(listing.pricePerKg) }}/kg</span></div>
        <div class="flex justify-between text-[13px]"><span class="text-[#5A6270]">Quantity</span><span class="font-bold">{{ quantity.toLocaleString() }} kg</span></div>
        <div class="flex justify-between text-[15px] font-black border-t border-[#C3EFCF] pt-2"><span>Total</span><span class="text-[#1E9444]">{{ formatETB(listing.pricePerKg * quantity) }}</span></div>
      </div>
      <EscrowBanner />
      <button @click="handleCheckout" :disabled="isProcessing" class="w-full py-3.5 rounded-xl bg-[#1E9444] text-white font-bold text-[15px] shadow-md hover:bg-[#0F5C2A] disabled:opacity-50 flex items-center justify-center gap-2">
        <Loader2 v-if="isProcessing" class="w-4 h-4 animate-spin" />
        {{ isProcessing ? 'Processing...' : 'Place Order & Lock Funds' }}
      </button>
    </div>
    <div v-else class="text-center py-12 text-[#5A6270]">
      <p>No listing selected.</p>
      <router-link to="/buyer/marketplace" class="text-[#1E9444] font-bold">Browse Marketplace</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Loader2 } from 'lucide-vue-next'
import { useListings } from '@/composables/useListings'
import { useOrders } from '@/composables/useOrders'
import { useAuth } from '@/composables/useAuth'
import { api } from '@/services/api'
import { formatETB } from '@/utils/helpers'
import EscrowBanner from '@/components/shared/EscrowBanner.vue'

const route = useRoute()
const router = useRouter()
const { getListingById } = useListings()
const { placeOrder } = useOrders()
const { user } = useAuth()

const listing = computed(() => route.params.id ? getListingById(route.params.id) : null)
const quantity = ref(listing.value?.minOrderQty || 500)
const isProcessing = ref(false)

const handleCheckout = async () => {
  if (!listing.value) return
  isProcessing.value = true
  try {
    await api.checkoutOrder({ listing_id: listing.value.id, quantity_kg: quantity.value })
  } catch { /* fallback */ }
  placeOrder(listing.value, user.value, quantity.value)
  isProcessing.value = false
  router.push('/buyer/orders')
}
</script>
