<template>
  <div class="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border-b border-[#E2E4E7] pb-6 relative">
      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-1.5">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <LayoutGrid class="w-5 h-5 text-white" />
          </div>
          <h1 class="text-[28px] font-black text-[#1E2328] tracking-tight">{{ $t('admin.listingModerationTitle') }}</h1>
        </div>
        <p class="text-[14px] font-medium text-[#5A6270] max-w-xl">
          {{ $t('admin.listingModerationSub') }}
        </p>
      </div>
      <div class="flex items-center gap-3 z-10">
        <div class="flex items-center bg-white border border-[#E2E4E7] rounded-xl p-1 shadow-xs">
          <span class="px-3 py-1.5 text-[11px] font-black uppercase text-[#1E2328]">{{ $t('admin.totalListings') }}</span>
          <span class="px-2.5 py-1 bg-[#F0F1F2] text-[#1E2328] rounded-lg text-xs font-bold">{{ listings.length }}</span>
        </div>
        <button @click="loadListings" :disabled="isLoading" 
          class="px-4 py-2.5 rounded-xl border border-[#E2E4E7] bg-white text-[13px] font-bold text-[#1E2328] hover:bg-[#F8F9FA] hover:shadow-md transition-all active:scale-95 flex items-center gap-2 group cursor-pointer">
          <RefreshCcw :class="['w-4 h-4 text-[#5A6270] group-hover:text-amber-600 transition-colors', isLoading && 'animate-spin']" /> 
          {{ $t('admin.refresh') }}
        </button>
      </div>
      <div class="absolute right-0 top-0 w-64 h-32 bg-amber-50 rounded-full blur-[80px] -z-0 opacity-60"></div>
    </div>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <div class="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-4 relative overflow-hidden border border-[#E2E4E7]/50">
        <div class="absolute inset-0 bg-gradient-to-tr from-amber-100 to-transparent opacity-50"></div>
        <Loader2 class="w-8 h-8 text-amber-500 animate-spin relative z-10" />
      </div>
      <p class="text-xs font-black text-[#1E2328] uppercase tracking-wider mt-2">{{ $t('admin.syncingListings') }}</p>
      <p class="text-[11px] text-[#9BA1AA] font-bold mt-1">{{ $t('admin.fetchingLatestItems') }}</p>
    </div>

    <div v-else-if="listings.length === 0" class="text-center py-20 bg-white border border-[#E2E4E7] rounded-[24px] px-8 shadow-sm relative overflow-hidden group">
      <div class="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-50 z-0 transition-opacity group-hover:opacity-100"></div>
      <div class="relative z-10">
        <div class="w-20 h-20 mx-auto bg-[#F8F9FA] rounded-full flex items-center justify-center shadow-inner mb-4 border border-[#E2E4E7]">
          <ShoppingBasket class="w-10 h-10 text-[#5A6270] opacity-40" />
        </div>
        <h3 class="text-[18px] font-extrabold text-[#1E2328] tracking-tight">{{ $t('admin.noListingsFound') }}</h3>
        <p class="text-[13px] font-medium text-[#5A6270] mt-1.5 max-w-sm mx-auto">
          {{ $t('admin.noListingsSub') }}
        </p>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-5 relative z-10">
      <article v-for="item in listings" :key="item.id" 
        class="bg-white border md:border-[#E2E4E7] lg:border-transparent lg:border-b lg:border-b-[#E2E4E7] lg:rounded-none rounded-2xl p-5 lg:p-6 shadow-sm lg:shadow-none hover:shadow-xl lg:hover:bg-[#F8F9FA] transition-all group lg:flex lg:items-center lg:justify-between lg:gap-8">
        
        <div class="flex items-start gap-4 lg:gap-5 lg:w-[45%]">
          <div class="w-14 h-14 rounded-2xl bg-[#F8F9FA] border border-[#E2E4E7] flex items-center justify-center text-3xl shrink-0 shadow-sm overflow-hidden relative">
            <img v-if="item.image_url" :src="item.image_url" class="absolute inset-0 w-full h-full object-cover" />
            <span v-else>🌾</span>
          </div>
          
          <div>
            <div class="flex sm:items-center flex-col sm:flex-row gap-2">
              <h3 class="text-[17px] font-extrabold text-[#1E2328] group-hover:text-amber-700 transition-colors">
                {{ item.title }}
              </h3>
              <span :class="['inline-flex w-fit px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-2xs', 
                item.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200']">
                {{ item.status === 'active' ? $t('admin.activeLive') : $t(item.status) }}
              </span>
            </div>
            
            <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-[12px] font-semibold text-[#5A6270]">
              <span class="flex items-center gap-1.5"><User class="w-3.5 h-3.5 opacity-60" /> {{ item.farmer?.name || item.farmer?.first_name || $t('common.anonymous') }}</span>
              <span class="flex items-center gap-1.5"><Award class="w-3.5 h-3.5 opacity-60" /> {{ $t('marketplace.grade') }}: {{ item.quality_grade || $t('common.standard') }}</span>
              <span class="flex items-center gap-1.5"><Calendar class="w-3.5 h-3.5 opacity-60" /> {{ formatDate(item.created_at) }}</span>
            </div>
          </div>
        </div>

        <div class="mt-4 lg:mt-0 lg:w-[25%] flex flex-col justify-center">
          <div class="flex flex-col gap-0.5">
            <span class="text-xs font-black uppercase tracking-wider text-[#9BA1AA]">{{ $t('admin.pricingAndInventory') }}</span>
            <span class="text-lg font-black text-[#1E9444] block">{{ formatETB(item.price_per_unit) }}<span class="text-[14px] text-[#5A6270]"> / {{ $t(item.unit) }}</span></span>
            <span class="text-[12px] font-bold text-[#5A6270]">{{ item.quantity_available?.toLocaleString() }} {{ $t(item.unit) }} {{ $t('admin.available') }}</span>
          </div>
        </div>

        <div class="mt-5 pt-5 border-t border-[#E2E4E7] lg:border-t-0 lg:mt-0 lg:pt-0 lg:w-[20%] flex lg:justify-end">
          <button @click="toggleStatus(item)" 
            :class="['w-full lg:w-auto px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer', 
            item.status === 'active' ? 'bg-white border-2 border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200' : 'bg-[#1E9444] text-white hover:bg-[#0F5C2A] shadow-emerald-500/20']">
            <template v-if="item.status === 'active'">
              <PauseCircle class="w-4 h-4" /> {{ $t('admin.suspend') }}
            </template>
            <template v-else>
              <PlayCircle class="w-4 h-4" /> {{ $t('admin.activate') }}
            </template>
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Loader2, LayoutGrid, ShoppingBasket, RefreshCcw, User, Award, Calendar, PauseCircle, PlayCircle } from 'lucide-vue-next'
import { adminApi } from '@/services/adminService'
import { formatETB, formatDate } from '@/utils/helpers'

const listings = ref([])
const isLoading = ref(true)

const loadListings = async () => {
  isLoading.value = true
  try {
    const res = await adminApi.fetchListings()
    listings.value = res.data || res
  } catch {
    listings.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(loadListings)

const toggleStatus = async (item) => {
  const newStatus = item.status === 'active' ? 'suspended' : 'active'
  try {
    await adminApi.moderateListing(item.id, newStatus)
    loadListings()
  } catch (err) {
    alert(err.message || 'Failed to moderate listing')
  }
}
</script>
