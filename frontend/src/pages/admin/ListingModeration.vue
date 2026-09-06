<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E4E7] pb-5">
      <div>
        <h1 class="text-[24px] font-extrabold text-[#1E2328]">Listing Quality Moderation & Oversight</h1>
        <p class="text-[13px] text-[#5A6270]">Inspect produce details, grade compliance, and toggle live listing visibility</p>
      </div>
      <button @click="loadListings" class="px-3 py-1.5 rounded-lg border border-[#E2E4E7] bg-white text-[12px] font-bold text-[#1E2328] hover:bg-[#F8F9FA]">Refresh Listings</button>
    </div>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-12"><Loader2 class="w-8 h-8 text-[#1E9444] animate-spin" /><p class="text-xs font-bold text-[#5A6270] mt-2">Loading marketplace listings...</p></div>

    <div v-else class="space-y-3">
      <div v-for="item in listings" :key="item.id" class="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-xl bg-[#F8F9FA] border border-[#E2E4E7] flex items-center justify-center text-2xl shrink-0">{{ item.cropEmoji || '☕' }}</div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-[#1E2328]">{{ item.cropName }}</h3>
              <span :class="['px-2 py-0.5 rounded-full text-[10px] font-bold', item.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700']">{{ item.isActive ? 'Active / Live' : 'Suspended' }}</span>
            </div>
            <p class="text-xs text-[#5A6270] mt-0.5">Farmer: {{ item.farmer?.name || 'Producer' }} · Grade: {{ item.grade }} · Region: {{ item.region }}</p>
          </div>
        </div>
        <div class="text-right flex items-center gap-4">
          <div>
            <span class="text-xs font-black text-[#1E9444] block">{{ formatETB(item.pricePerKg) }}/kg</span>
            <span class="text-[11px] text-[#5A6270]">{{ item.availableQty?.toLocaleString() }} kg stock</span>
          </div>
          <button @click="toggleStatus(item.id)" :class="['px-3 py-1.5 rounded-xl text-xs font-bold transition-all', item.isActive ? 'border border-amber-300 text-amber-700 hover:bg-amber-50' : 'bg-[#1E9444] text-white hover:bg-[#0F5C2A]']">
            {{ item.isActive ? 'Suspend' : 'Activate' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { adminApi } from '@/services/adminService'
import { formatETB } from '@/utils/helpers'

const listings = ref([])
const isLoading = ref(true)

const loadListings = async () => {
  isLoading.value = true
  try {
    listings.value = await adminApi.fetchListings()
  } catch {
    listings.value = [
      { id: '1', cropName: 'Sidama Coffee Grade 1', cropEmoji: '☕', pricePerKg: 120, availableQty: 10000, grade: 'Grade 1', region: 'Sidama', isActive: true, farmer: { name: 'Dawit Bekele' } },
      { id: '2', cropName: 'Bale Red Teff Special', cropEmoji: '🌾', pricePerKg: 95, availableQty: 25000, grade: 'Export Quality', region: 'Oromia', isActive: true, farmer: { name: 'Girma Taddesse' } },
    ]
  } finally {
    isLoading.value = false
  }
}

onMounted(loadListings)

const toggleStatus = async (id) => {
  await adminApi.toggleListingStatus(id)
  loadListings()
}
</script>
