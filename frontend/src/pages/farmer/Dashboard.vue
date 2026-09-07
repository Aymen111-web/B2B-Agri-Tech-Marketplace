<template>
  <div class="w-full flex flex-col min-h-full pb-8 max-w-5xl mx-auto space-y-5">
    <!-- WELCOME BANNER -->
    <div class="bg-gradient-to-r from-[#062E15] via-[#0F5C2A] to-[#0B57D0] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-[#E69500]/20 rounded-full blur-2xl pointer-events-none" />
      <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-[#0B57D0]/30 rounded-full blur-2xl pointer-events-none" />

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">
              Welcome back, {{ farmer?.name || farmer?.first_name || 'Loading...' }}
            </h2>
            <ShieldCheck class="w-5 h-5 text-[#E69500]" />
          </div>
          <p class="text-xs text-[#C3EFCF] mt-1 font-medium flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-[#E69500] animate-pulse" />
            <span>{{ farmer?.region || 'Not Set' }} Region Agricultural Member</span>
          </p>
        </div>

        <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 text-left sm:text-right shrink-0">
          <span class="text-[10px] font-extrabold text-[#C3EFCF] uppercase tracking-wider block flex items-center justify-start sm:justify-end gap-1">
            <Sparkles class="w-3 h-3 text-[#E69500]" /> Total Earned
          </span>
          <span class="text-xl font-black text-[#E69500] block leading-tight mt-0.5">
            {{ formatETB(farmer?.totalEarned || 0) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 6 METRIC STAT CARDS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
        <div class="absolute top-0 left-0 right-0 h-1 bg-[#1E9444]" />
        <div class="flex items-start justify-between">
          <div><span class="text-xs font-bold text-[#5A6270]">Active Produce Listings</span><h3 class="text-2xl font-black text-[#1E2328] mt-1">{{ activeCount }}</h3></div>
          <div class="w-9 h-9 rounded-xl bg-emerald-50 text-[#1E9444] border border-emerald-100 flex items-center justify-center shrink-0"><Zap class="w-5 h-5" /></div>
        </div>
        <span class="text-[10px] font-bold text-[#1E9444]">Live on QMT Marketplace</span>
      </div>

      <div class="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
        <div class="absolute top-0 left-0 right-0 h-1 bg-[#F5B73A]" />
        <div class="flex items-start justify-between">
          <div><span class="text-xs font-bold text-[#5A6270]">Regional Depots & Hubs</span><h3 class="text-2xl font-black text-[#1E2328] mt-1">0</h3></div>
          <div class="w-9 h-9 rounded-xl bg-amber-50 text-[#F5B73A] border border-amber-100 flex items-center justify-center shrink-0"><Building2 class="w-5 h-5" /></div>
        </div>
        <span class="text-[10px] font-bold text-amber-700">Supported Logistics</span>
      </div>

      <div class="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
        <div class="absolute top-0 left-0 right-0 h-1 bg-[#E6533C]" />
        <div class="flex items-start justify-between">
          <div><span class="text-xs font-bold text-[#5A6270]">Primary Union Co-ops</span><h3 class="text-2xl font-black text-[#1E2328] mt-1">{{ farmer?.union ? 1 : 0 }}</h3></div>
          <div class="w-9 h-9 rounded-xl bg-red-50 text-[#E6533C] border border-red-100 flex items-center justify-center shrink-0"><UserCheck class="w-5 h-5" /></div>
        </div>
        <span class="text-[10px] font-bold text-red-600">{{ farmer?.union || 'None' }}</span>
      </div>

      <div class="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
        <div class="absolute top-0 left-0 right-0 h-1 bg-[#14B8A6]" />
        <div class="flex items-start justify-between">
          <div><span class="text-xs font-bold text-[#5A6270]">Verified Buyers</span><h3 class="text-2xl font-black text-[#1E2328] mt-1">0</h3></div>
          <div class="w-9 h-9 rounded-xl bg-teal-50 text-[#14B8A6] border border-teal-100 flex items-center justify-center shrink-0"><Users class="w-5 h-5" /></div>
        </div>
        <span class="text-[10px] font-bold text-teal-700">Commercial Escrow Buyers</span>
      </div>

      <div class="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
        <div class="absolute top-0 left-0 right-0 h-1 bg-amber-400" />
        <div class="flex items-start justify-between">
          <div><span class="text-xs font-bold text-[#5A6270]">Orders Received</span><h3 class="text-2xl font-black text-[#1E2328] mt-1">{{ receivedOrdersCount }}</h3></div>
          <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0"><PackageCheck class="w-5 h-5" /></div>
        </div>
        <span class="text-[10px] font-bold text-amber-700">Pending Escrow Release: {{ formatETB(pendingPayoutETB) }}</span>
      </div>

      <div class="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
        <div class="absolute top-0 left-0 right-0 h-1 bg-[#E6533C]" />
        <div class="flex items-start justify-between">
          <div><span class="text-xs font-bold text-[#5A6270]">SMS Dispatch Notifications</span><h3 class="text-2xl font-black text-[#1E2328] mt-1">0</h3></div>
          <div class="w-9 h-9 rounded-xl bg-red-50 text-[#E6533C] border border-red-100 flex items-center justify-center shrink-0"><Smartphone class="w-5 h-5" /></div>
        </div>
        <span class="text-[10px] font-bold text-red-600">Active Mobile SMS Channel</span>
      </div>
    </div>

    <!-- LIVE ORDER TRANSIT STATUS CARD -->
    <div v-if="orders.length > 0 && orders[0].status === 'in_transit'" @click="$router.push('/farmer/orders')"
      class="w-full bg-[#EDFAF2] border border-[#C3EFCF] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#D8F6E0] transition-colors shadow-2xs">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-[#1E9444] text-white flex items-center justify-center shrink-0 shadow-xs"><Truck class="w-5 h-5" /></div>
        <div>
          <div class="flex items-center gap-2">
            <h4 class="text-xs font-extrabold text-[#0F5C2A]">Order #{{ orders[0].id }} in Transit</h4>
            <span class="px-2 py-0.5 rounded-full bg-[#1E9444] text-white text-[10px] font-extrabold">Escrow Secured</span>
          </div>
          <p class="text-[11px] text-[#5A6270] mt-0.5 font-medium">Batch on its way to buyer hub.</p>
        </div>
      </div>
      <ChevronRight class="w-5 h-5 text-[#1E9444] shrink-0" />
    </div>

    <!-- PRODUCE LISTINGS SECTION -->
    <div class="bg-white border border-[#E2E4E7] rounded-2xl p-5 shadow-xs space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full bg-[#1E9444] animate-pulse" />
          <h3 class="text-sm sm:text-base font-black text-[#1E2328]">Produce & Order Status</h3>
          <span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">• Live just now</span>
        </div>

        <div class="flex items-center gap-2">
          <router-link to="/farmer/listings" class="px-3.5 py-1.5 rounded-xl border border-gray-200 bg-[#F8F9FA] hover:bg-gray-100 text-xs font-bold text-[#1E2328] transition-colors flex items-center gap-1 cursor-pointer">
            <span>See All Listings</span><ChevronRight class="w-3.5 h-3.5 text-[#1E9444]" />
          </router-link>
          <router-link to="/farmer/listings/new" class="px-4 py-1.5 rounded-xl bg-[#1E9444] text-white font-bold text-xs shadow-xs hover:bg-[#0F5C2A] transition-colors flex items-center gap-1.5 cursor-pointer">
            <Plus class="w-4 h-4 stroke-[2.5]" /><span>Post New Listing</span>
          </router-link>
        </div>
      </div>

      <div v-if="displayListings.length === 0" class="text-[#5A6270] text-xs text-center py-5">
        You have no live listings.
      </div>
      <div v-else class="space-y-2.5">
        <div v-for="item in displayListings" :key="item.id" @click="$router.push(`/farmer/listings/edit/${item.id}`)"
          class="bg-[#F8F9FA] border border-[#E2E4E7] rounded-xl p-3.5 flex items-center justify-between hover:border-[#1E9444] hover:bg-white transition-all cursor-pointer shadow-2xs">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-2xl shrink-0 shadow-2xs">{{ item.cropEmoji }}</div>
            <div>
              <h4 class="text-xs font-black text-[#1E2328]">{{ item.cropName }}</h4>
              <p class="text-[11px] text-[#5A6270] mt-0.5">{{ farmer?.region || 'Not set' }} Region · Verified Harvest</p>
            </div>
          </div>
          <div class="text-right flex items-center gap-4">
            <div>
              <span class="text-xs font-black text-[#1E2328] block">{{ formatETB(item.pricePerKg) }}/kg</span>
              <span class="text-[10px] font-bold text-[#1E9444]">{{ item.availableQty?.toLocaleString() }} kg available</span>
            </div>
            <span class="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-black bg-[#EDFAF2] text-[#0F5C2A] border border-[#C3EFCF]">Live</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Plus, Truck, ChevronRight, Zap, Building2, UserCheck, Users, PackageCheck, Smartphone, ShieldCheck, Sparkles } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useListings } from '@/composables/useListings'
import { useOrders } from '@/composables/useOrders'
import { formatETB } from '@/utils/helpers'

const { user } = useAuth()
const farmer = computed(() => user.value)
const { listings } = useListings()
const { orders } = useOrders()

const farmerListings = computed(() => {
  if (!farmer.value) return []
  return listings.value.filter(l => 
    String(l.farmerId) === String(farmer.value.id) || 
    String(l.farmer?.id) === String(farmer.value.id) || 
    (farmer.value.phone && l.farmer?.phone === farmer.value.phone)
  )
})
const displayListings = computed(() => farmerListings.value.slice(0, 3))
const activeCount = computed(() => farmerListings.value.filter(l => l.isActive).length || 0)

const farmerOrders = computed(() => {
  if (!farmer.value) return []
  return orders.value.filter(o => 
    String(o.farmerId) === String(farmer.value.id) || 
    String(o.farmer?.id) === String(farmer.value.id) || 
    (farmer.value.phone && o.farmer?.phone === farmer.value.phone)
  )
})

const pendingPayoutETB = computed(() => farmerOrders.value.filter(o => o.escrowStatus === 'held').reduce((sum, o) => sum + (o.totalAmountETB || 0), 0) || 0)
const receivedOrdersCount = computed(() => farmerOrders.value.length || 0)
</script>
