<template>
  <div :class="[isStandalone ? 'min-h-screen bg-[#F8F9FA] dark:bg-[#0D1117] text-[#1E2328] dark:text-[#F0F6FC] flex flex-col' : '']">
    <!-- Standalone Header for Public Visitors -->
    <header v-if="isStandalone" class="sticky top-0 z-40 bg-white/95 dark:bg-[#161B22]/95 backdrop-blur-md border-b border-[#E2E4E7] dark:border-[#30363D] shadow-2xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-3">
          <QelemMedaLogo :size="40" variant="full" />
        </router-link>

        <nav class="hidden md:flex items-center gap-8 text-xs font-bold text-[#5A6270] dark:text-[#8B949E]">
          <router-link to="/" class="hover:text-[#1E9444] transition-colors">{{ t('home') }}</router-link>
          <router-link to="/#how-it-works" class="hover:text-[#1E9444] transition-colors">{{ t('howItWorks') }}</router-link>
        </nav>

        <div class="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
          <router-link 
            to="/login" 
            class="px-4 py-2.5 rounded-xl border border-[#E2E4E7] dark:border-[#30363D] hover:border-[#1E9444] text-[#1E2328] dark:text-[#F0F6FC] hover:text-[#1E9444] text-xs font-extrabold transition-all cursor-pointer bg-white dark:bg-[#161B22]"
          >
            {{ t('login') }}
          </router-link>
          <router-link 
            to="/register?role=buyer" 
            class="px-4 py-2.5 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus class="w-4 h-4" />
            <span>{{ t('signUp') }}</span>
          </router-link>
          <button 
            v-if="isAuthenticated"
            @click="goToDashboard" 
            class="px-4 py-2.5 rounded-xl bg-[#EDFAF2] dark:bg-emerald-950/40 text-[#0F5C2A] dark:text-emerald-300 border border-[#C3EFCF] dark:border-emerald-800/60 hover:bg-[#D8F6E0] text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <User class="w-4 h-4 text-[#1E9444] dark:text-emerald-400" />
            <span>{{ t('dashboard') }}</span>
          </button>
        </div>
      </div>
    </header>

    <div :class="[isStandalone ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6' : 'space-y-6 pb-6']">
      <!-- Top Search Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E4E7] dark:border-[#30363D] pb-5">
        <!-- Search Input -->
        <div class="w-full sm:w-80">
          <div class="relative">
            <Search class="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-3" />
            <input 
              type="text" 
              v-model="searchQuery" 
              :placeholder="t('searchPlaceholder')" 
              class="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] text-[#1E2328] dark:text-[#F0F6FC] placeholder-gray-400 dark:placeholder-gray-500 rounded-xl text-xs font-bold focus:outline-none focus:border-[#E69500] shadow-2xs" 
            />
          </div>
        </div>
      </div>

      <!-- Category Filter Chips -->
      <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <button 
          v-for="cat in categories" 
          :key="cat.value" 
          @click="activeCategory = cat.value"
          :class="['px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-2xs group', 
            activeCategory === cat.value 
              ? 'bg-[#1E9444] text-white border-[#1E9444] shadow-xs' 
              : 'bg-white dark:bg-[#161B22] text-[#5A6270] dark:text-[#8B949E] border-[#E2E4E7] dark:border-[#30363D] hover:border-[#1E9444] hover:text-[#1E2328] dark:hover:text-[#F0F6FC]']"
        >
          <div class="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-black/10 bg-gray-100 dark:bg-[#21262D] flex items-center justify-center">
            <img v-if="cat.image" :src="cat.image" :alt="cat.label" class="w-full h-full object-cover group-hover:scale-110 transition-transform" />
            <span v-else class="text-[10px]">{{ cat.emoji }}</span>
          </div>
          <span>{{ t(cat.key, cat.label) }}</span>
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
      <div v-else class="text-center text-[#5A6270] dark:text-[#8B949E] py-12 bg-white dark:bg-[#161B22] rounded-2xl border border-[#E2E4E7] dark:border-[#30363D] space-y-2">
        <p class="font-bold text-base text-[#1E2328] dark:text-[#F0F6FC]">{{ t('noListingsFound') }}</p>
        <p class="text-xs">{{ t('tryAdjusting') }}</p>
        <button 
          @click="activeCategory = 'all'; searchQuery = ''" 
          class="mt-2 px-4 py-2 bg-[#E69500] text-white font-extrabold text-xs rounded-xl hover:bg-[#D48900] transition-colors shadow-2xs cursor-pointer"
        >
          {{ t('resetFilters') }}
        </button>
      </div>
    </div>

    <!-- Standalone Footer for Public Visitors -->
    <footer v-if="isStandalone" class="bg-[#041D0D] text-white border-t border-emerald-900/40 py-8 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-[#C3EFCF] flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 Qelem Meda Technologies (QMT). Ethiopian B2B Agri-Tech Marketplace.</p>
        <div class="flex items-center gap-4">
          <router-link to="/" class="hover:text-white">{{ t('home') }}</router-link>
          <router-link to="/login" class="hover:text-white">{{ t('login') }}</router-link>
          <router-link to="/register?role=buyer" class="hover:text-white">{{ t('registerCommercialBuyer') }}</router-link>
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
import { useLanguage } from '@/composables/useLanguage'
import QelemMedaLogo from '@/components/common/QelemMedaLogo.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import LanguageToggle from '@/components/common/LanguageToggle.vue'
import ListingCard from '@/components/shared/ListingCard.vue'
import BuyerAuthModal from '@/components/shared/BuyerAuthModal.vue'
import { CATEGORY_PHOTOS } from '@/utils/categoryImages'

const route = useRoute()
const router = useRouter()
const { filterListings } = useListings()
const { isAuthenticated, user } = useAuth()
const { t } = useLanguage()

const activeCategory = ref('all')
const searchQuery = ref('')
const showAuthModal = ref(false)

const isStandalone = computed(() => !route.path.startsWith('/buyer'))

const categories = [
  { value: 'all', key: 'allCrops', label: 'All Crops', emoji: '🌾', image: null },
  { value: 'coffee', key: 'coffee', label: 'Coffee', emoji: '☕', image: CATEGORY_PHOTOS.coffee },
  { value: 'grains', key: 'grains', label: 'Grains', emoji: '🌾', image: CATEGORY_PHOTOS.grains },
  { value: 'spices', key: 'spices', label: 'Spices', emoji: '🌶️', image: CATEGORY_PHOTOS.spices },
  { value: 'oilseeds', key: 'oilseeds', label: 'Oilseeds', emoji: '🥜', image: CATEGORY_PHOTOS.oilseeds },
  { value: 'pulses', key: 'pulses', label: 'Pulses', emoji: '🫘', image: CATEGORY_PHOTOS.pulses },
  { value: 'vegetables', key: 'vegetables', label: 'Vegetables', emoji: '🥬', image: CATEGORY_PHOTOS.vegetables },
  { value: 'fruits', key: 'fruits', label: 'Fruits', emoji: '🍋', image: CATEGORY_PHOTOS.fruits },
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
