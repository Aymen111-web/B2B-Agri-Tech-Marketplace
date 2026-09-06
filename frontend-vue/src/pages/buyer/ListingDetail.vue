<template>
  <div v-if="listing" class="space-y-6 max-w-3xl">
    <button @click="$router.back()" class="text-[13px] text-[#1E9444] font-bold hover:underline">← Back to Marketplace</button>
    <div class="bg-white border border-[#E2E4E7] rounded-2xl overflow-hidden shadow-sm">
      <div class="h-48 bg-gradient-to-br from-[#062E15] to-[#1E9444] flex items-center justify-center"><span class="text-7xl">{{ listing.cropEmoji }}</span></div>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between"><h1 class="text-[20px] font-black text-[#1E2328]">{{ listing.cropName }}</h1><VerifiedBadge v-if="listing.isVerified" /></div>
        <p class="text-[13px] text-[#5A6270]">{{ listing.description }}</p>
        <div class="grid grid-cols-2 gap-3 text-[13px]">
          <div class="bg-[#F8F9FA] p-3 rounded-xl"><span class="font-bold text-[#5A6270] block text-[11px]">Price</span><span class="font-black text-[#1E9444]">{{ formatETB(listing.pricePerKg) }}/kg</span></div>
          <div class="bg-[#F8F9FA] p-3 rounded-xl"><span class="font-bold text-[#5A6270] block text-[11px]">Available</span><span class="font-black text-[#1E2328]">{{ listing.availableQty.toLocaleString() }} kg</span></div>
          <div class="bg-[#F8F9FA] p-3 rounded-xl"><span class="font-bold text-[#5A6270] block text-[11px]">Grade</span><span class="font-bold text-[#1E2328]">{{ listing.grade }}</span></div>
          <div class="bg-[#F8F9FA] p-3 rounded-xl"><span class="font-bold text-[#5A6270] block text-[11px]">Region</span><span class="font-bold text-[#1E2328]">{{ listing.region }}</span></div>
        </div>
        <EscrowBanner />
        <router-link :to="`/buyer/checkout/${listing.id}`" class="block w-full py-3.5 rounded-xl bg-[#1E9444] text-white font-bold text-[15px] text-center shadow-md hover:bg-[#0F5C2A]">Proceed to Checkout</router-link>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-12"><p class="text-[#5A6270]">Listing not found.</p><router-link to="/buyer/marketplace" class="text-[#1E9444] font-bold">Browse Marketplace</router-link></div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useListings } from '@/composables/useListings'
import { formatETB } from '@/utils/helpers'
import VerifiedBadge from '@/components/shared/VerifiedBadge.vue'
import EscrowBanner from '@/components/shared/EscrowBanner.vue'

const route = useRoute()
const { getListingById } = useListings()
const listing = computed(() => getListingById(route.params.id))
</script>
