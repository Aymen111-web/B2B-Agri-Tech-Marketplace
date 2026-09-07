<template>
  <div class="w-full flex flex-col min-h-full pb-8 max-w-5xl mx-auto space-y-5">
    <div class="bg-gradient-to-r from-[#062E15] via-[#0F5C2A] to-[#0B57D0] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-[#E69500]/20 rounded-full blur-2xl pointer-events-none" />
      <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-[#0B57D0]/30 rounded-full blur-2xl pointer-events-none" />
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-black text-white tracking-tight">{{ $t('farmer.myListingsTitle') }}</h1>
            <Sparkles class="w-5 h-5 text-[#E69500]" />
          </div>
          <p class="text-xs text-[#C3EFCF] mt-1 font-medium">{{ $t('farmer.myListingsSub') }}</p>
        </div>
        <router-link to="/farmer/listings/new" class="px-4 py-2.5 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer">
          <Plus class="w-4 h-4 stroke-[2.5]" /><span>{{ $t('farmer.postNewListing') }}</span>
        </router-link>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-1">
      <div class="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
        <button @click="statusFilter = 'all'" :class="['px-4 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer', statusFilter === 'all' ? 'bg-[#1E9444] border-[#1E9444] text-white shadow-2xs' : 'bg-white border-[#E2E4E7] text-[#5A6270] hover:bg-gray-50']">
          {{ $t('farmer.allListings') }} ({{ displayListings.length }})
        </button>
        <button @click="statusFilter = 'live'" :class="['px-4 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer', statusFilter === 'live' ? 'bg-[#EDFAF2] border-[#C3EFCF] text-[#0F5C2A] shadow-2xs' : 'bg-white border-[#E2E4E7] text-[#5A6270] hover:bg-gray-50']">
          {{ $t('farmer.liveProduce') }} ({{ displayListings.filter(l => l.isActive).length }})
        </button>
        <button @click="statusFilter = 'pending'" :class="['px-4 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer', statusFilter === 'pending' ? 'bg-[#FFF8EC] border-[#F5B73A] text-[#D88C0A] shadow-2xs' : 'bg-white border-[#E2E4E7] text-[#5A6270] hover:bg-gray-50']">
          {{ $t('farmer.pendingReview') }} (0)
        </button>
      </div>
      <div class="text-xs text-[#5A6270] font-bold self-end sm:self-auto">
        {{ $t('farmer.showingActiveItems', { count: filteredListings.length }) }}
      </div>
    </div>

    <!-- EMPTY STATE FOR FARMER WITH NO LISTINGS -->
    <div v-if="filteredListings.length === 0" class="text-center py-16 bg-white border border-[#E2E4E7] rounded-3xl p-8 shadow-2xs">
      <div class="w-16 h-16 mx-auto bg-[#EDFAF2] rounded-2xl flex items-center justify-center mb-3 border border-[#C3EFCF]">
        <Sprout class="w-8 h-8 text-[#1E9444]" />
      </div>
      <h3 class="text-base font-extrabold text-[#1E2328]">{{ $t('farmer.noListingsFound') }}</h3>
      <p class="text-xs text-[#5A6270] mt-1 max-w-sm mx-auto font-medium">
        {{ $t('farmer.noListingsSub') }}
      </p>
      <router-link to="/farmer/listings/new" class="inline-flex items-center gap-2 mt-4 px-4.5 py-2.5 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer">
        <Plus class="w-4 h-4 stroke-[2.5]" />
        <span>{{ $t('farmer.postFirstListing') }}</span>
      </router-link>
    </div>

    <div v-else class="space-y-3">
      <div v-for="item in filteredListings" :key="item.id" class="bg-gradient-to-br from-[#FFFBF7] via-white to-[#FFFBF7] border border-[#FBE3D0] rounded-3xl p-5 shadow-xs hover:border-[#E69500] transition-all space-y-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3.5">
            <div class="w-14 h-14 rounded-2xl bg-white border border-[#FBE3D0] flex items-center justify-center text-2xl shrink-0 shadow-2xs overflow-hidden">
              <img v-if="item.primaryImage || (item.images && item.images.length > 0)" :src="item.primaryImage || item.images[0]" class="w-full h-full object-cover" />
              <span v-else>{{ item.cropEmoji }}</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-black text-[#1E2328]">{{ $t(item.cropName) }}</h3>
                <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1"><CheckCircle2 class="w-3 h-3 text-[#1E9444]" /> {{ $t('badges.verifiedGrade') }}</span>
              </div>
              <p class="text-xs text-[#5A6270] mt-0.5 font-medium">{{ $t(farmer?.region) || 'Sidama' }} {{ $t('Region') }} · {{ $t(item.grade) || 'Grade 1' }}</p>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-black bg-[#EDFAF2] text-[#0F5C2A] border border-[#C3EFCF]">{{ $t('badges.live') }}</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/80 p-3.5 rounded-2xl border border-orange-100/60 text-xs">
          <div><span class="text-[#5A6270] font-medium block">{{ $t('marketplace.pricePerKg') }}</span><span class="font-black text-[#1E9444] text-sm mt-0.5 block">{{ formatETB(item.pricePerKg) }}/{{ $t('kg') }}</span></div>
          <div><span class="text-[#5A6270] font-medium block">{{ $t('marketplace.availableQuantity') }}</span><span class="font-black text-[#1E2328] text-sm mt-0.5 block">{{ item.availableQty?.toLocaleString() }} kg</span></div>
          <div class="col-span-2 sm:col-span-1"><span class="text-[#5A6270] font-medium block">{{ $t('farmer.minimumOrderQuantity') }}</span><span class="font-bold text-[#1E2328] text-xs mt-0.5 block">{{ item.minOrderQty ? `${item.minOrderQty.toLocaleString()} kg` : '500 kg' }}</span></div>
        </div>

        <div class="flex items-center justify-between pt-1 border-t border-orange-100/60 text-xs">
          <span class="text-[#5A6270] font-medium flex items-center gap-1"><Package class="w-3.5 h-3.5 text-[#1E9444]" /><span>{{ $t('Batch') }} #{{ String(item.id || '').slice(-6) }} · {{ $t('farmer.liveOnMarketplace') }}</span></span>
          <router-link :to="`/farmer/listings/edit/${item.id}`" class="px-3.5 py-1.5 rounded-xl border border-[#FBE3D0] bg-white hover:bg-orange-50/50 text-[#1E9444] font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs">
            <Edit2 class="w-3.5 h-3.5" /><span>{{ $t('Edit Details') }}</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, Edit2, Package, CheckCircle2, Sparkles, Sprout } from 'lucide-vue-next'
import { useListings } from '@/composables/useListings'
import { useAuth } from '@/composables/useAuth'
import { formatETB } from '@/utils/helpers'

const { listings } = useListings()
const { user } = useAuth()
const farmer = computed(() => user.value)
const statusFilter = ref('all')

const farmerListings = computed(() => {
  if (!farmer.value) return []
  return listings.value.filter(l => 
    String(l.farmerId) === String(farmer.value.id) || 
    String(l.farmer?.id) === String(farmer.value.id) || 
    (farmer.value.phone && l.farmer?.phone === farmer.value.phone)
  )
})

const displayListings = computed(() => farmerListings.value)
const filteredListings = computed(() => displayListings.value.filter(l => {
  if (statusFilter.value === 'live') return l.isActive
  if (statusFilter.value === 'pending') return !l.isActive
  return true
}))
</script>
