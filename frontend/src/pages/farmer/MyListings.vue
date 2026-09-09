<template>
  <div class="w-full flex flex-col min-h-full pb-8 max-w-5xl mx-auto space-y-5">
    <div class="bg-gradient-to-r from-[#062E15] via-[#0F5C2A] to-[#0B57D0] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-[#E69500]/20 rounded-full blur-2xl pointer-events-none" />
      <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-[#0B57D0]/30 rounded-full blur-2xl pointer-events-none" />
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-black text-white tracking-tight">My Produce Listings</h1>
            <Sparkles class="w-5 h-5 text-[#E69500]" />
          </div>
          <p class="text-xs text-[#C3EFCF] mt-1 font-medium">Manage and track your active crop inventory on QMT Marketplace</p>
        </div>
        <router-link to="/farmer/listings/new" class="px-4 py-2.5 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer">
          <Plus class="w-4 h-4 stroke-[2.5]" /><span>Post New Listing</span>
        </router-link>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-1">
      <div class="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
        <button @click="statusFilter = 'all'" :class="['px-4 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer', statusFilter === 'all' ? 'bg-[#1E9444] border-[#1E9444] text-white shadow-2xs' : 'bg-white dark:bg-[#161B22] border-[#E2E4E7] dark:border-[#30363D] text-[#5A6270] dark:text-[#8B949E] hover:bg-gray-50 dark:hover:bg-[#21262D]']">
          {{ $t('farmer.allListings') }} ({{ displayListings.length }})
        </button>
        <button @click="statusFilter = 'live'" :class="['px-4 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer', statusFilter === 'live' ? 'bg-[#EDFAF2] dark:bg-emerald-950/40 border-[#C3EFCF] dark:border-emerald-800/60 text-[#0F5C2A] dark:text-emerald-300 shadow-2xs' : 'bg-white dark:bg-[#161B22] border-[#E2E4E7] dark:border-[#30363D] text-[#5A6270] dark:text-[#8B949E] hover:bg-gray-50 dark:hover:bg-[#21262D]']">
          {{ $t('farmer.liveProduce') }} ({{ displayListings.filter(l => l.isActive).length }})
        </button>
        <button @click="statusFilter = 'pending'" :class="['px-4 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer', statusFilter === 'pending' ? 'bg-[#FFF8EC] dark:bg-amber-950/40 border-[#F5B73A] dark:border-amber-800/60 text-[#D88C0A] dark:text-amber-300 shadow-2xs' : 'bg-white dark:bg-[#161B22] border-[#E2E4E7] dark:border-[#30363D] text-[#5A6270] dark:text-[#8B949E] hover:bg-gray-50 dark:hover:bg-[#21262D]']">
          {{ $t('farmer.pendingReview') }} (0)
        </button>
      </div>
      <div class="text-xs text-[#5A6270] dark:text-[#8B949E] font-bold self-end sm:self-auto">
        {{ $t('farmer.showingActiveItems', { count: filteredListings.length }) }}
      </div>
    </div>

    <!-- EMPTY STATE FOR FARMER WITH NO LISTINGS -->
    <div v-if="filteredListings.length === 0" class="text-center py-16 bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] rounded-3xl p-8 shadow-2xs">
      <div class="w-16 h-16 mx-auto bg-[#EDFAF2] dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center mb-3 border border-[#C3EFCF] dark:border-emerald-800/60">
        <Sprout class="w-8 h-8 text-[#1E9444] dark:text-emerald-400" />
      </div>
      <h3 class="text-base font-extrabold text-[#1E2328] dark:text-[#F0F6FC]">{{ $t('farmer.noListingsFound') }}</h3>
      <p class="text-xs text-[#5A6270] dark:text-[#8B949E] mt-1 max-w-sm mx-auto font-medium">
        {{ $t('farmer.noListingsSub') }}
      </p>
      <router-link to="/farmer/listings/new" class="inline-flex items-center gap-2 mt-4 px-4.5 py-2.5 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer">
        <Plus class="w-4 h-4 stroke-[2.5]" />
        <span>{{ $t('farmer.postFirstListing') }}</span>
      </router-link>
    </div>

    <div v-else class="space-y-4">
      <div class="space-y-3">
        <div v-for="item in paginatedListings" :key="item.id" class="bg-gradient-to-br from-[#FFFBF7] via-white to-[#FFFBF7] dark:from-[#161B22] dark:via-[#161B22] dark:to-[#161B22] border border-[#FBE3D0] dark:border-[#30363D] rounded-3xl p-5 shadow-xs hover:border-[#E69500] transition-all space-y-4">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3.5">
              <div class="w-14 h-14 rounded-2xl bg-white dark:bg-[#21262D] border border-[#FBE3D0] dark:border-[#30363D] flex items-center justify-center text-2xl shrink-0 shadow-2xs overflow-hidden">
                <img v-if="getListingImage(item)" :src="getListingImage(item)" class="w-full h-full object-cover" />
                <span v-else>{{ item.cropEmoji }}</span>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-black text-[#1E2328] dark:text-[#F0F6FC]">{{ item.cropName }}</h3>
                  <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1"><CheckCircle2 class="w-3 h-3 text-[#1E9444] dark:text-emerald-400" /> {{ $t('badges.verifiedGrade') }}</span>
                </div>
                <p class="text-xs text-[#5A6270] dark:text-[#8B949E] mt-0.5 font-medium">{{ $t(farmer?.region) || item.region || 'Sidama' }} {{ $t('Region') }} · {{ $t(item.grade) || 'Grade 1' }}</p>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-black bg-[#EDFAF2] dark:bg-emerald-950/40 text-[#0F5C2A] dark:text-emerald-300 border border-[#C3EFCF] dark:border-emerald-800/60">{{ $t('badges.live') }}</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/80 dark:bg-[#21262D] p-3.5 rounded-2xl border border-orange-100/60 dark:border-[#30363D] text-xs">
            <div><span class="text-[#5A6270] dark:text-[#8B949E] font-medium block">{{ $t('marketplace.pricePerKg') }}</span><span class="font-black text-[#1E9444] dark:text-emerald-400 text-sm mt-0.5 block">{{ formatETB(item.pricePerKg) }}/{{ $t('kg') }}</span></div>
            <div><span class="text-[#5A6270] dark:text-[#8B949E] font-medium block">{{ $t('marketplace.availableQuantity') }}</span><span class="font-black text-[#1E2328] dark:text-[#F0F6FC] text-sm mt-0.5 block">{{ item.availableQty?.toLocaleString() }} kg</span></div>
            <div class="col-span-2 sm:col-span-1"><span class="text-[#5A6270] dark:text-[#8B949E] font-medium block">{{ $t('farmer.minimumOrderQuantity') }}</span><span class="font-bold text-[#1E2328] dark:text-[#F0F6FC] text-xs mt-0.5 block">{{ item.minOrderQty ? `${item.minOrderQty.toLocaleString()} kg` : '500 kg' }}</span></div>
          </div>

          <div class="flex items-center justify-between pt-1 border-t border-orange-100/60 text-xs">
            <span class="text-[#5A6270] font-medium flex items-center gap-1"><Package class="w-3.5 h-3.5 text-[#1E9444]" /><span>{{ $t('Batch') }} #{{ String(item.id || '').slice(-6) }} · {{ $t('farmer.liveOnMarketplace') }}</span></span>
            <div class="flex items-center gap-2">
              <button @click="handleDelete(item.id)" class="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-[#161B22] hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs">
                <Trash2 class="w-3.5 h-3.5" /><span>{{ $t('common.delete') || 'Delete' }}</span>
              </button>
              <router-link :to="`/farmer/listings/edit/${item.id}`" class="px-3.5 py-1.5 rounded-xl border border-[#FBE3D0] bg-white hover:bg-orange-50/50 text-[#1E9444] font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs">
                <Edit2 class="w-3.5 h-3.5" /><span>{{ $t('Edit Details') }}</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Controls -->
      <Pagination 
        :currentPage="currentPage" 
        :totalPages="totalPages" 
        :totalItems="filteredListings.length" 
        :itemsPerPage="itemsPerPage" 
        @update:currentPage="currentPage = $event" 
        @refresh="refreshListings"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Plus, Edit2, Package, CheckCircle2, Sparkles, Trash2, Sprout } from 'lucide-vue-next'
import { useListings } from '@/composables/useListings'
import { useAuth } from '@/composables/useAuth'
import { formatETB } from '@/utils/helpers'
import Pagination from '@/components/common/Pagination.vue'

const { listings, deleteListing, refreshListings } = useListings()
const { user } = useAuth()
const farmer = computed(() => user.value)
const statusFilter = ref('all')

const currentPage = ref(1)
const itemsPerPage = 6

const handleDelete = async (id) => {
  if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
    await deleteListing(id)
  }
}

const getListingImage = (item) => {
  const img = item.primaryImage || 
              (item.images && item.images.length > 0 ? item.images[0] : null) || 
              item.image_url || 
              item.image_path
  if (!img) return null
  if (typeof img === 'string') {
    if (img.startsWith('http') || img.startsWith('blob:') || img.startsWith('data:')) return img
    return `http://127.0.0.1:8000/storage/${img.replace(/^\/?storage\//, '')}`
  }
  return null
}

const farmerListings = computed(() => {
  if (!farmer.value) return []
  return listings.value.filter(l => 
    String(l.farmerId) === String(farmer.value.id) || 
    String(l.farmer?.id) === String(farmer.value.id) || 
    (farmer.value.phone && l.farmer?.phone === farmer.value.phone)
  )
})
const displayListings = computed(() => farmerListings.value.length > 0 ? farmerListings.value : listings.value.slice(0, 4))
const filteredListings = computed(() => displayListings.value.filter(l => {
  if (statusFilter.value === 'live') return l.isActive
  if (statusFilter.value === 'pending') return !l.isActive
  return true
}))

const totalPages = computed(() => Math.ceil(filteredListings.value.length / itemsPerPage) || 1)

const paginatedListings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredListings.value.slice(start, start + itemsPerPage)
})

// Reset to page 1 when filter changes
watch(statusFilter, () => {
  currentPage.value = 1
})
</script>
