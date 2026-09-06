<template>
  <div class="space-y-5">
    <div><h1 class="text-[20px] font-black text-[#1E2328]">Marketplace</h1><p class="text-[13px] text-[#5A6270]">Browse verified Ethiopian agricultural produce</p></div>
    <div class="flex flex-wrap gap-2">
      <button v-for="cat in categories" :key="cat.value" @click="activeCategory = cat.value"
        :class="['px-4 py-2 rounded-full text-[13px] font-bold border transition-all', activeCategory === cat.value ? 'bg-[#1E9444] text-white border-[#1E9444]' : 'bg-white text-[#5A6270] border-[#E2E4E7] hover:border-[#1E9444]']">
        {{ cat.emoji }} {{ cat.label }}
      </button>
    </div>
    <input type="text" v-model="searchQuery" placeholder="Search crops, farmers, regions..." class="w-full px-4 py-3 bg-white border border-[#E2E4E7] rounded-xl text-[14px] focus:outline-none focus:border-[#1E9444]" />
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ListingCard v-for="listing in filteredListings" :key="listing.id" :listing="listing" />
    </div>
    <p v-if="filteredListings.length === 0" class="text-center text-[#5A6270] py-8">No listings found matching your criteria.</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useListings } from '@/composables/useListings'
import ListingCard from '@/components/shared/ListingCard.vue'

const { filterListings } = useListings()
const activeCategory = ref('all')
const searchQuery = ref('')

const categories = [
  { value: 'all', label: 'All', emoji: '🌍' }, { value: 'coffee', label: 'Coffee', emoji: '☕' },
  { value: 'grains', label: 'Grains', emoji: '🌾' }, { value: 'spices', label: 'Spices', emoji: '🌶️' },
  { value: 'oilseeds', label: 'Oilseeds', emoji: '🌱' }, { value: 'pulses', label: 'Pulses', emoji: '🫘' },
]

const filteredListings = computed(() => filterListings(activeCategory.value, searchQuery.value))
</script>
