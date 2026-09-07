<template>
  <div class="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border-b border-[#E2E4E7] pb-6 relative">
      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-1.5">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShoppingBag class="w-5 h-5 text-white" />
          </div>
          <h1 class="text-[28px] font-black text-[#1E2328] tracking-tight">Order & Escrow Audit Center</h1>
        </div>
        <p class="text-[14px] font-medium text-[#5A6270] max-w-xl">
          Monitor marketplace transactions, track delivery milestones, and oversee escrow holding status.
        </p>
      </div>
      <div class="flex items-center gap-3 z-10">
        <div class="flex items-center bg-white border border-[#E2E4E7] rounded-xl p-1 shadow-xs">
          <span class="px-3 py-1.5 text-[11px] font-black uppercase text-[#1E2328]">Total Orders:</span>
          <span class="px-2.5 py-1 bg-[#F0F1F2] text-[#1E2328] rounded-lg text-xs font-bold">{{ orders.length }}</span>
        </div>
        <button @click="loadOrders" :disabled="isLoading" 
          class="px-4 py-2.5 rounded-xl border border-[#E2E4E7] bg-white text-[13px] font-bold text-[#1E2328] hover:bg-[#F8F9FA] hover:shadow-md transition-all active:scale-95 flex items-center gap-2 group">
          <RefreshCcw :class="['w-4 h-4 text-[#5A6270] group-hover:text-blue-600 transition-colors', isLoading && 'animate-spin']" /> 
          Refresh
        </button>
      </div>
      <div class="absolute right-0 top-0 w-64 h-32 bg-blue-50 rounded-full blur-[80px] -z-0 opacity-60"></div>
    </div>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <div class="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-4 relative overflow-hidden border border-[#E2E4E7]/50">
        <div class="absolute inset-0 bg-gradient-to-tr from-blue-100 to-transparent opacity-50"></div>
        <Loader2 class="w-8 h-8 text-blue-500 animate-spin relative z-10" />
      </div>
      <p class="text-xs font-black text-[#1E2328] uppercase tracking-wider mt-2">Syncing Transactions</p>
      <p class="text-[11px] text-[#9BA1AA] font-bold mt-1">Fetching latest marketplace orders...</p>
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-20 bg-white border border-[#E2E4E7] rounded-[24px] px-8 shadow-sm relative overflow-hidden group">
      <div class="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-50 z-0 transition-opacity group-hover:opacity-100"></div>
      <div class="relative z-10">
        <div class="w-20 h-20 mx-auto bg-[#F8F9FA] rounded-full flex items-center justify-center shadow-inner mb-4 border border-[#E2E4E7]">
          <ShoppingBag class="w-10 h-10 text-[#5A6270] opacity-40" />
        </div>
        <h3 class="text-[18px] font-extrabold text-[#1E2328] tracking-tight">No Orders Found</h3>
        <p class="text-[13px] font-medium text-[#5A6270] mt-1.5 max-w-sm mx-auto">
          There are currently no active transactions matching your filter criteria.
        </p>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 gap-5 relative z-10">
      <article v-for="order in orders" :key="order.id" 
        class="bg-white border border-[#E2E4E7] rounded-3xl p-6 lg:p-8 shadow-sm hover:shadow-xl transition-all group lg:flex lg:flex-col lg:gap-6">
        
        <div class="flex flex-col lg:flex-row items-start justify-between gap-4 border-b border-[#E2E4E7]/60 pb-6">
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-100 border border-blue-200 flex items-center justify-center shrink-0 shadow-sm text-blue-700">
              <ShoppingBag class="w-6 h-6" />
            </div>
            
            <div>
              <div class="flex flex-wrap sm:items-center gap-3">
                <h3 class="text-[19px] font-extrabold text-[#1E2328] group-hover:text-blue-700 transition-colors">
                  Order #{{ order.order_number || order.id }}
                </h3>
                <span :class="['inline-flex w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xs', statusColor(order.status)]">
                  {{ order.status ? order.status.replace('_', ' ') : 'Processing' }}
                </span>
                
                <span v-if="order.payment_status" :class="['inline-flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border', 
                  order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200']">
                  <CreditCard class="w-3 h-3" /> {{ order.payment_status }}
                </span>
              </div>
              
              <div class="flex items-center gap-4 mt-2 text-[13px] font-semibold text-[#5A6270]">
                <span class="flex items-center gap-1.5"><User class="w-4 h-4 opacity-70 text-blue-600" /> Buyer: {{ order.buyer?.first_name || 'Anonymous' }} {{ order.buyer?.second_name || '' }}</span>
                <span class="text-[#E2E4E7] text-lg font-light">|</span>
                <span class="flex items-center gap-1.5 text-orange-700 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100"><Tractor class="w-4 h-4" /> Farmers Involved: {{ order.fulfillments?.length || 1 }}</span>
              </div>
            </div>
          </div>
          
          <div class="lg:text-right flex flex-col justify-center">
            <span class="text-[11px] font-black uppercase tracking-widest text-[#9BA1AA] mb-0.5">Total Escrow Value</span>
            <span class="text-[24px] font-black text-[#1E9444] tracking-tight">{{ formatETB(order.total_amount) }}</span>
            <span class="text-[12px] font-bold text-[#5A6270] flex items-center lg:justify-end gap-1.5 mt-1">
              <Calendar class="w-3.5 h-3.5" /> {{ formatDate(order.placed_at || order.created_at || new Date()) }}
            </span>
          </div>
        </div>

        <div class="mt-4 lg:mt-0 grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#F8F9FA] p-5 rounded-2xl border border-[#E2E4E7]/60">
          <div>
            <span class="text-[10px] uppercase font-black text-[#9BA1AA] block mb-1">Items Requested</span>
            <span class="font-extrabold text-[#1E2328] text-[14px]">{{ order.items?.reduce((acc, it) => acc + (it.quantity || 0), 0)?.toLocaleString() || 0 }} total items</span>
          </div>
          <div>
            <span class="text-[10px] uppercase font-black text-[#9BA1AA] block mb-1">Inspection Status</span>
            <span class="font-extrabold text-indigo-700 text-[14px] capitalize">{{ order.inspection_status || 'Pending' }}</span>
          </div>
          <div>
            <span class="text-[10px] uppercase font-black text-[#9BA1AA] block mb-1">Delivery Escrow</span>
            <span class="font-extrabold text-amber-600 text-[14px] capitalize">{{ order.delivery_status || 'Awaiting Transport' }}</span>
          </div>
          <div>
            <span class="text-[10px] uppercase font-black text-[#9BA1AA] block mb-1">Farmer Payout</span>
            <span :class="['font-extrabold text-[14px] capitalize', order.payout_status === 'completed' ? 'text-emerald-700' : 'text-rose-600']">{{ order.payout_status || 'Withheld' }}</span>
          </div>
        </div>

        <div class="mt-6 border-t border-[#E2E4E7]/60 pt-6">
          <OrderTimeline :status="order.status" />
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ShoppingBag, Loader2, RefreshCcw, CreditCard, User, Tractor, Calendar } from 'lucide-vue-next'
import { adminApi } from '@/services/adminService'
import { formatETB, formatDate } from '@/utils/helpers'
import OrderTimeline from '@/components/shared/OrderTimeline.vue'

const orders = ref([])
const isLoading = ref(true)

const loadOrders = async () => {
  isLoading.value = true
  try {
    const res = await adminApi.fetchOrders()
    orders.value = res.data || res
  } catch (err) {
    orders.value = []
    alert(err.message || 'Failed to fetch orders from server.')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadOrders)

const statusColor = (status) => {
  const map = { 
    pending_payment: 'bg-amber-100 text-amber-800 border border-amber-200',
    placed: 'bg-blue-100 text-blue-800 border border-blue-200', 
    in_transit: 'bg-indigo-100 text-indigo-800 border border-indigo-200', 
    delivered: 'bg-teal-100 text-teal-800 border border-teal-200', 
    completed: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    cancelled: 'bg-red-100 text-red-800 border border-red-200'
  }
  return status ? (map[status] || 'bg-gray-100 text-gray-700 border border-gray-300') : 'bg-gray-100'
}
</script>
