<template>
  <div :class="[isStandalone ? 'min-h-screen bg-[#F8F9FA] text-[#1E2328] flex flex-col' : '']">
    <!-- Standalone Header for Public Visitors -->
    <header v-if="isStandalone" class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E4E7] shadow-2xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-3">
          <QelemMedaLogo :size="40" variant="full" />
        </router-link>

        <nav class="hidden md:flex items-center gap-8 text-xs font-bold text-[#5A6270]">
          <router-link to="/" class="hover:text-[#1E9444] transition-colors">Home</router-link>
          <router-link to="/#how-it-works" class="hover:text-[#1E9444] transition-colors">How It Works</router-link>
        </nav>

        <div class="flex items-center gap-3">
          <ThemeToggle />
          <router-link 
            to="/login" 
            class="px-4 py-2.5 rounded-xl border border-[#E2E4E7] hover:border-[#1E9444] text-[#1E2328] hover:text-[#1E9444] text-xs font-extrabold transition-all cursor-pointer bg-white"
          >
            Login
          </router-link>
          <router-link 
            to="/register?role=buyer" 
            class="px-4 py-2.5 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus class="w-4 h-4" />
            <span>Sign Up</span>
          </router-link>
          <button 
            v-if="isAuthenticated"
            @click="goToDashboard" 
            class="px-4 py-2.5 rounded-xl bg-[#EDFAF2] text-[#0F5C2A] border border-[#C3EFCF] hover:bg-[#D8F6E0] text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <User class="w-4 h-4 text-[#1E9444]" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>
    </header>

    <div :class="[isStandalone ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6' : 'space-y-6 pb-6']">
      <!-- Top Header & Search -->
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
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search crop name, region, farmer..." 
              class="w-full pl-9 pr-4 py-2 bg-white border border-[#E2E4E7] text-[#1E2328] placeholder-gray-400 rounded-xl text-xs font-bold focus:outline-none focus:border-[#E69500] shadow-2xs" 
            />
          </div>
        </div>
      </div>

      <!-- Category Filter Chips -->
      <div class="flex flex-wrap gap-2">
        <button 
          v-for="cat in categories" 
          :key="cat.value" 
          @click="activeCategory = cat.value"
          :class="['px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs', 
            activeCategory === cat.value 
              ? 'bg-[#E69500] text-white border-[#E69500] shadow-xs' 
              : 'bg-white text-[#5A6270] border-[#E2E4E7] hover:border-[#E69500] hover:text-[#1E2328]']"
        >
          <span>{{ cat.emoji }}</span>
          <span>{{ cat.label }}</span>
        </button>
      </div>

      <!-- Listings Grid -->
      <div v-if="filteredListings.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ListingCard 
          v-for="listing in filteredListings" 
          :key="listing.id" 
          :listing="listing" 
          @addToCart="handleCartAction"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center text-[#5A6270] py-12 bg-white rounded-2xl border border-[#E2E4E7] space-y-2">
        <p class="font-bold text-base text-[#1E2328]">No listings found matching your criteria</p>
        <p class="text-xs">Try selecting another crop category or clearing your search query.</p>
        <button 
          @click="activeCategory = 'all'; searchQuery = ''" 
          class="mt-2 px-4 py-2 bg-[#E69500] text-white font-extrabold text-xs rounded-xl hover:bg-[#D48900] transition-colors shadow-2xs cursor-pointer"
        >
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Standalone Footer for Public Visitors -->
    <footer v-if="isStandalone" class="bg-[#041D0D] text-white border-t border-emerald-900/40 py-8 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-[#C3EFCF] flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 Qelem Meda Technologies (QMT). Ethiopian B2B Agri-Tech Marketplace.</p>
        <div class="flex items-center gap-4">
          <router-link to="/" class="hover:text-white">Home</router-link>
          <router-link to="/login" class="hover:text-white">Login</router-link>
          <router-link to="/register?role=buyer" class="hover:text-white">Register as Buyer</router-link>
        </div>
      </div>
    </footer>

    <!-- BUYER AUTH RESTRICTION MODAL -->
    <BuyerAuthModal :isOpen="showAuthModal" @close="showAuthModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, User, UserPlus } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useListings } from '@/composables/useListings'
import QelemMedaLogo from '@/components/common/QelemMedaLogo.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import ListingCard from '@/components/shared/ListingCard.vue'
import BuyerAuthModal from '@/components/shared/BuyerAuthModal.vue'

const route = useRoute()
const router = useRouter()
const { filterListings } = useListings()
const { isAuthenticated, user } = useAuth()

const activeCategory = ref('all')
const searchQuery = ref('')
const showAuthModal = ref(false)

const isStandalone = computed(() => !route.path.startsWith('/buyer'))

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

function goToDashboard() {
  if (user.value?.role === 'farmer') router.push('/farmer')
  else if (user.value?.role === 'admin') router.push('/admin')
  else router.push('/buyer')
}

function handleCartAction() {
  if (!isAuthenticated.value) {
    showAuthModal.value = true
  }
}
</script>
