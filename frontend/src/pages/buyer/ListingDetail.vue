<template>
  <div :class="[isStandalone ? 'min-h-screen bg-[#F8F9FA] text-[#1E2328] flex flex-col' : '']">
    <!-- Standalone Header for Public Visitors -->
    <header v-if="isStandalone" class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E4E7] shadow-2xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-3">
          <QelemMedaLogo :size="40" variant="full" />
        </router-link>

        <nav class="hidden md:flex items-center gap-8 text-xs font-bold text-[#5A6270]">
          <router-link to="/" class="hover:text-[#1E9444] transition-colors">{{ t('home') }}</router-link>
          <router-link to="/#how-it-works" class="hover:text-[#1E9444] transition-colors">{{ t('howItWorks') }}</router-link>
        </nav>

        <div class="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
          <router-link 
            v-if="!isAuthenticated"
            to="/login" 
            class="px-4 py-2.5 rounded-xl border border-[#E2E4E7] hover:border-[#1E9444] text-[#1E2328] hover:text-[#1E9444] text-xs font-extrabold transition-all cursor-pointer bg-white"
          >
            {{ t('login') }}
          </router-link>
          <router-link 
            v-if="!isAuthenticated"
            to="/register?role=buyer" 
            class="px-4 py-2.5 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus class="w-4 h-4" />
            <span>{{ t('signUp') }}</span>
          </router-link>
          <button 
            v-if="isAuthenticated"
            @click="goToDashboard" 
            class="px-4 py-2.5 rounded-xl bg-[#EDFAF2] text-[#0F5C2A] border border-[#C3EFCF] hover:bg-[#D8F6E0] text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <User class="w-4 h-4 text-[#1E9444]" />
            <span>{{ t('dashboard') }}</span>
          </button>
        </div>
      </div>
    </header>

    <div :class="[isStandalone ? 'max-w-3xl mx-auto px-4 py-8 flex-1 w-full space-y-6' : 'space-y-6 max-w-3xl']">
      <button @click="$router.back()" class="text-[13px] text-[#1E9444] font-bold hover:underline cursor-pointer">{{ t('backToMarketplace') }}</button>

      <div v-if="listing" class="bg-white border border-[#E2E4E7] rounded-2xl overflow-hidden shadow-sm">
        
        <!-- Native Images Gallery or Emoji Fallback -->
        <div v-if="displayImages.length > 0" class="flex flex-col">
          <div class="h-64 md:h-80 w-full overflow-hidden bg-black flex items-center justify-center">
            <img :src="displayImages[activeImageIndex]" class="max-h-full max-w-full object-contain object-center" />
          </div>
          <div v-if="displayImages.length > 1" class="flex gap-2 p-3 overflow-x-auto bg-[#F8F9FA] border-b border-[#E2E4E7]">
            <img 
              v-for="(img, idx) in displayImages" :key="idx" 
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
              <span class="font-bold text-[#5A6270] block text-[11px]">{{ t('price') }}</span>
              <span class="font-black text-[#1E9444]">{{ formatETB(listing.pricePerKg) }}{{ t('perKg') }}</span>
            </div>
            <div class="bg-[#F8F9FA] p-3 rounded-xl">
              <span class="font-bold text-[#5A6270] block text-[11px]">{{ t('availableStock') }}</span>
              <span class="font-black text-[#1E2328]">{{ listing.availableQty?.toLocaleString() }} kg</span>
            </div>
            <div class="bg-[#F8F9FA] p-3 rounded-xl">
              <span class="font-bold text-[#5A6270] block text-[11px]">{{ t('grade') }}</span>
              <span class="font-bold text-[#1E2328]">{{ listing.grade }}</span>
            </div>
            <div class="bg-[#F8F9FA] p-3 rounded-xl">
              <span class="font-bold text-[#5A6270] block text-[11px]">{{ t('region') }}</span>
              <span class="font-bold text-[#1E2328]">{{ listing.region }}</span>
            </div>
          </div>

          <!-- Producer & Payout Information Card -->
          <div class="bg-[#F4FBF7] border border-[#C3EFCF] rounded-2xl p-5 space-y-4 text-xs">
            <div class="flex items-center justify-between border-b border-[#C3EFCF]/60 pb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded-full bg-[#1E9444] text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                  {{ listing.farmer?.name?.[0] || 'F' }}
                </div>
                <div>
                  <h3 class="text-sm font-black text-[#0F5C2A] flex items-center gap-1.5">
                    <span>{{ listing.farmer?.name || 'Verified Farmer' }}</span>
                    <ShieldCheck class="w-4 h-4 text-[#1E9444]" />
                  </h3>
                  <p class="text-[11px] text-[#5A6270] font-medium">Verified Agricultural Producer • {{ listing.region }}</p>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#1E9444] text-white shadow-2xs">
                Verified Seller
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <!-- Farmer Phone -->
              <div class="bg-white p-3.5 rounded-xl border border-[#E2E4E7] flex items-center gap-3 shadow-2xs">
                <div class="p-2.5 bg-emerald-50 text-[#1E9444] rounded-xl shrink-0">
                  <Phone class="w-4 h-4" />
                </div>
                <div class="overflow-hidden">
                  <span class="text-[#5A6270] font-bold block text-[10px] uppercase tracking-wider">Farmer Direct Phone</span>
                  <a :href="'tel:' + (listing.farmer?.phone || '')" class="font-black text-[#1E2328] hover:text-[#1E9444] text-xs transition-colors block truncate">
                    {{ listing.farmer?.phone || '+251 912 345 678' }}
                  </a>
                </div>
              </div>

              <!-- Payout Account / CBE / Telebirr -->
              <div class="bg-white p-3.5 rounded-xl border border-[#E2E4E7] flex items-center gap-3 shadow-2xs">
                <div class="p-2.5 bg-blue-50 text-[#0B57D0] rounded-xl shrink-0">
                  <CreditCard class="w-4 h-4" />
                </div>
                <div class="overflow-hidden">
                  <span class="text-[#5A6270] font-bold block text-[10px] uppercase tracking-wider">Payout Account (CBE / Bank)</span>
                  <div class="font-black text-[#1E2328] text-xs flex items-center gap-1.5 truncate mt-0.5">
                    <span class="uppercase text-[9px] px-1.5 py-0.2 bg-blue-50 text-[#0B57D0] border border-blue-200 rounded font-black shrink-0">
                      {{ listing.farmer?.bank_code || listing.farmer?.bank_name || 'CBE' }}
                    </span>
                    <span class="font-mono text-xs">{{ listing.farmer?.account_number || listing.farmer?.account_number_masked || '1000123456789' }}</span>
                  </div>
                  <span v-if="listing.farmer?.account_name" class="text-[10px] text-gray-500 font-bold block truncate mt-0.5">
                    Holder: {{ listing.farmer.account_name }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <EscrowBanner />

          <!-- Purchase / Checkout Action Button -->
          <button 
            @click="handleCheckoutClick" 
            class="block w-full py-3.5 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white font-extrabold text-[15px] text-center shadow-md transition-all cursor-pointer"
          >
            {{ t('buyNow') }}
          </button>
        </div>
      </div>

      <div v-else class="text-center py-12 bg-white rounded-2xl border border-gray-200 p-6 space-y-2">
        <p class="text-[#5A6270] font-bold">{{ t('noListingsFound') }}</p>
        <router-link to="/marketplace" class="text-[#1E9444] font-bold hover:underline inline-block">{{ t('agriMarketplace') }}</router-link>
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
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, UserPlus, Phone, CreditCard, ShieldCheck, Building2 } from 'lucide-vue-next'
import { useListings } from '@/composables/useListings'
import { useAuth } from '@/composables/useAuth'
import { useLanguage } from '@/composables/useLanguage'
import { formatETB } from '@/utils/helpers'
import QelemMedaLogo from '@/components/common/QelemMedaLogo.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import LanguageToggle from '@/components/common/LanguageToggle.vue'
import VerifiedBadge from '@/components/shared/VerifiedBadge.vue'
import EscrowBanner from '@/components/shared/EscrowBanner.vue'
import BuyerAuthModal from '@/components/shared/BuyerAuthModal.vue'

const route = useRoute()
const router = useRouter()
const { getListingById } = useListings()
const { isAuthenticated, user } = useAuth()
const { t } = useLanguage()

const listing = computed(() => getListingById(route.params.id))
const activeImageIndex = ref(0)
const showAuthModal = ref(false)

const displayImages = computed(() => {
  if (!listing.value) return []
  const imgs = []
  if (listing.value.primaryImage) {
    imgs.push(listing.value.primaryImage)
  }
  if (Array.isArray(listing.value.images)) {
    listing.value.images.forEach(img => {
      const url = typeof img === 'string' ? img : (img?.image_path || img?.url)
      if (url) {
        const fullUrl = (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:'))
          ? url 
          : `http://127.0.0.1:8000/storage/${url.replace(/^\/?storage\//, '')}`
        if (!imgs.includes(fullUrl)) imgs.push(fullUrl)
      }
    })
  }
  if (imgs.length === 0 && (listing.value.image_url || listing.value.image_path)) {
    const url = listing.value.image_url || listing.value.image_path
    if (url) {
      const fullUrl = (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:'))
        ? url 
        : `http://127.0.0.1:8000/storage/${url.replace(/^\/?storage\//, '')}`
      if (!imgs.includes(fullUrl)) imgs.push(fullUrl)
    }
  }
  return imgs
})

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
