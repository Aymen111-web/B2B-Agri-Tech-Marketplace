<template>
  <div class="space-y-6">
    <div><h1 class="text-[22px] font-black text-[#1E2328]">Welcome back, {{ user?.name?.split(' ')[0] || 'Buyer' }} 👋</h1><p class="text-[13px] text-[#5A6270] mt-1">Your procurement dashboard at a glance</p></div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div v-for="stat in stats" :key="stat.label" class="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-2xs">
        <p class="text-[11px] font-bold text-[#5A6270] uppercase tracking-wider">{{ stat.label }}</p>
        <p class="text-[22px] font-black text-[#1E2328] mt-1">{{ stat.value }}</p>
      </div>
    </div>
    <div>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-[16px] font-bold text-[#1E2328]">Featured Listings</h2>
        <router-link to="/buyer/marketplace" class="text-[13px] font-bold text-[#1E9444] hover:underline">View All →</router-link>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ListingCard v-for="listing in listings.slice(0, 3)" :key="listing.id" :listing="listing" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useListings } from '@/composables/useListings'
import { api } from '@/services/api'
import { formatETB } from '@/utils/helpers'
import ListingCard from '@/components/shared/ListingCard.vue'

const { user } = useAuth()
const { listings } = useListings()

const stats = ref([
  { label: 'Active Orders', value: '0' },
  { label: 'Total Spent', value: 'ETB 0' },
  { label: 'Suppliers', value: '0' },
  { label: 'Saved Items', value: '0' },
])

onMounted(async () => {
  try {
    const data = await api.fetchBuyerDashboardStats()
    if (data) {
      stats.value = [
        { label: 'Active Orders', value: String(data.active_orders || data.activeOrders || 0) },
        { label: 'Total Spent', value: formatETB(data.total_spent || data.totalSpent || 0) },
        { label: 'Suppliers', value: String(data.suppliers || data.unique_farmers || 0) },
        { label: 'Saved Items', value: String(data.saved_items || 0) },
      ]
    }
  } catch { /* use defaults */ }
})
</script>
