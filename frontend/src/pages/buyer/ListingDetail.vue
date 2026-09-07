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
          <template v-if="isAuthenticated">
            <button 
              @click="goToDashboard" 
              class="px-4 py-2.5 rounded-xl bg-[#EDFAF2] text-[#0F5C2A] border border-[#C3EFCF] hover:bg-[#D8F6E0] text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <User class="w-4 h-4 text-[#1E9444]" />
              <span>Dashboard</span>
            </button>
          </template>

          <template v-else>
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
              <span>Register as Buyer</span>
            </router-link>
          </template>
        </div>
      </div>
    </header>

    <div :class="[isStandalone ? 'max-w-3xl mx-auto px-4 py-8 flex-1 w-full space-y-6' : 'space-y-6 max-w-3xl']">
      <button @click="$router.back()" class="text-[13px] text-[#1E9444] font-bold hover:underline cursor-pointer">← Back to Marketplace</button>

      <div v-if="listing" class="bg-white border border-[#E2E4E7] rounded-2xl overflow-hidden shadow-sm">
        
        <!-- Native Images Gallery or Emoji Fallback -->
        <div v-if="listing.images && listing.images.length > 0" class="flex flex-col">
          <div class="h-64 md:h-80 w-full overflow-hidden bg-black flex items-center justify-center">
            <img :src="listing.images[activeImageIndex]" class="max-h-full max-w-full object-contain object-center" />
          </div>
          <div v-if="listing.images.length > 1" class="flex gap-2 p-3 overflow-x-auto bg-[#F8F9FA] border-b border-[#E2E4E7]">
            <img 
              v-for="(img, idx) in listing.images" :key="idx" 
              :src="img" 
              @click="activeImageIndex = idx"
              class="w-16 h-16 object-cover rounded-lg cursor-pointer border-2 transition-all"
              :class="activeImageIndex === idx ? 'border-[#1E9444] shadow-md opacity-100' : 'border-[#E2E4E7] opacity-60 hover:opacity-100'" 
            />
          </div>
        </div>
        <div v-else class="h-48 bg-gradient-to-br from-[#062E15] to-[#1E9444] flex items-center justify-center">
          <span class="text-7xl">{{ listing.cropEmoji }}</span>
        </div>
        
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h1 class="text-[20px] font-black text-[#1E2328]">{{ listing.cropName }}</h1>
            <VerifiedBadge v-if="listing.isVerified" />
          </div>

          <p class="text-[13px] text-[#5A6270] leading-relaxed">{{ listing.description }}</p>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px]">
            <div class="bg-[#F8F9FA] p-3 rounded-xl">
              <span class="font-bold text-[#5A6270] block text-[11px]">Price</span>
              <span class="font-black text-[#1E9444]">{{ formatETB(listing.pricePerKg) }}/kg</span>
            </div>
            <div class="bg-[#F8F9FA] p-3 rounded-xl">
              <span class="font-bold text-[#5A6270] block text-[11px]">Available</span>
              <span class="font-black text-[#1E2328]">{{ listing.availableQty?.toLocaleString() }} kg</span>
            </div>
            <div class="bg-[#F8F9FA] p-3 rounded-xl">
              <span class="font-bold text-[#5A6270] block text-[11px]">Grade</span>
              <span class="font-bold text-[#1E2328]">{{ listing.grade }}</span>
            </div>
            <div class="bg-[#F8F9FA] p-3 rounded-xl">
              <span class="font-bold text-[#5A6270] block text-[11px]">Region</span>
              <span class="font-bold text-[#1E2328]">{{ listing.region }}</span>
            </div>
          </div>

          <EscrowBanner />

          <!-- Purchase / Checkout Action Button -->
          <button 
            @click="handleCheckoutClick" 
            class="block w-full py-3.5 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white font-extrabold text-[15px] text-center shadow-md transition-all cursor-pointer"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>

      <div v-else class="text-center py-12 bg-white rounded-2xl border border-gray-200 p-6 space-y-2">
        <p class="text-[#5A6270] font-bold">Listing not found.</p>
        <router-link to="/marketplace" class="text-[#1E9444] font-bold hover:underline inline-block">Browse Marketplace</router-link>
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
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, UserPlus } from 'lucide-vue-next'
import { useListings } from '@/composables/useListings'
import { useAuth } from '@/composables/useAuth'
import { formatETB } from '@/utils/helpers'
import QelemMedaLogo from '@/components/common/QelemMedaLogo.vue'
import VerifiedBadge from '@/components/shared/VerifiedBadge.vue'
import EscrowBanner from '@/components/shared/EscrowBanner.vue'
import BuyerAuthModal from '@/components/shared/BuyerAuthModal.vue'

const route = useRoute()
const router = useRouter()
const { getListingById } = useListings()
const { isAuthenticated, user } = useAuth()

const listing = computed(() => getListingById(route.params.id))
const activeImageIndex = ref(0)
const showAuthModal = ref(false)

const isStandalone = computed(() => !route.path.startsWith('/buyer'))

watch(listing, () => activeImageIndex.value = 0)

function goToDashboard() {
  if (user.value?.role === 'farmer') router.push('/farmer')
  else if (user.value?.role === 'admin') router.push('/admin')
  else router.push('/buyer')
}

function handleCheckoutClick() {
  if (!isAuthenticated.value) {
    showAuthModal.value = true
  } else {
    router.push(`/buyer/checkout/${listing.value.id}`)
  }
}
</script>
