<template>
  <div class="space-y-6 pb-6">
    <!-- Simplified Top Header & Search -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E4E7] pb-5">
      <div>
        <h1 class="text-2xl font-black text-[#1E2328] tracking-tight">
          Agricultural <span class="text-[#E69500]">Marketplace</span> 🌾
        </h1>
        <p class="text-xs text-[#5A6270] mt-0.5">
          Browse verified Ethiopian produce direct from regional co-op unions and primary producers.
        </p>
      </div>

      <!-- Search Input -->
      <div class="w-full sm:w-80">
        <div class="relative">
          <Search class="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input type="text" v-model="searchQuery" placeholder="Search crop name, region, farmer..." 
            class="w-full pl-9 pr-4 py-2 bg-white border border-[#E2E4E7] text-[#1E2328] placeholder-gray-400 rounded-xl text-xs font-bold focus:outline-none focus:border-[#E69500] shadow-2xs" />
        </div>
      </div>
    </div>

    <!-- Category Filter Chips - Logo Orange (#E69500) -->
    <div class="flex flex-wrap gap-2">
      <button v-for="cat in categories" :key="cat.value" @click="activeCategory = cat.value"
        :class="['px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs', 
          activeCategory === cat.value 
            ? 'bg-[#E69500] text-white border-[#E69500] shadow-xs' 
            : 'bg-white text-[#5A6270] border-[#E2E4E7] hover:border-[#E69500] hover:text-[#1E2328]']">
        <span>{{ cat.emoji }}</span>
        <span>{{ cat.label }}</span>
      </button>
    </div>

    <!-- Listings Grid -->
    <div v-if="filteredListings.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ListingCard v-for="listing in filteredListings" :key="listing.id" :listing="listing" />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center text-[#5A6270] py-12 bg-white rounded-2xl border border-[#E2E4E7] space-y-2">
      <p class="font-bold text-base text-[#1E2328]">No listings found matching your criteria</p>
      <p class="text-xs">Try selecting another crop category or clearing your search query.</p>
      <button @click="activeCategory = 'all'; searchQuery = ''" 
        class="mt-2 px-4 py-2 bg-[#E69500] text-white font-extrabold text-xs rounded-xl hover:bg-[#D48900] transition-colors shadow-2xs">
        Reset Filters
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Search } from 'lucide-vue-next'
import { useListings } from '@/composables/useListings'
import ListingCard from '@/components/shared/ListingCard.vue'

const route = useRoute()
const { filterListings } = useListings()
const activeCategory = ref('all')
const searchQuery = ref('')

const categories = [
  { value: 'all', label: 'All Crops', emoji: '🌍' },
  { value: 'coffee', label: 'Coffee', emoji: '☕' },
  { value: 'grains', label: 'Grains', emoji: '🌾' },
  { value: 'spices', label: 'Spices', emoji: '🌶️' },
  { value: 'oilseeds', label: 'Oilseeds', emoji: '🌱' },
  { value: 'pulses', label: 'Pulses', emoji: '🫘' },
]

const setCategoryFromQuery = () => {
  if (route.query.category) {
    const matched = categories.find(c => c.value === route.query.category)
    if (matched) {
      activeCategory.value = matched.value
    }
  }
}

onMounted(setCategoryFromQuery)
watch(() => route.query.category, setCategoryFromQuery)

const filteredListings = computed(() => filterListings(activeCategory.value, searchQuery.value))
</script>
