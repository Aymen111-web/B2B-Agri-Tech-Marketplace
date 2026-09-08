<template>
  <div class="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border-b border-[#E2E4E7] dark:border-[#30363D] pb-6 relative">
      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-1.5">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShoppingBag class="w-5 h-5 text-white" />
          </div>
          <h1 class="text-[28px] font-black text-[#1E2328] dark:text-[#F0F6FC] tracking-tight">{{ $t('admin.orderAuditTitle') }}</h1>
        </div>
        <p class="text-[14px] font-medium text-[#5A6270] dark:text-[#8B949E] max-w-xl">
          {{ $t('admin.orderAuditSub') }}
        </p>
      </div>
      <div class="flex items-center gap-3 z-10">
        <div class="flex items-center bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] rounded-xl p-1 shadow-xs">
          <span class="px-3 py-1.5 text-[11px] font-black uppercase text-[#1E2328] dark:text-[#F0F6FC]">{{ $t('admin.totalOrdersCount') }}</span>
          <span class="px-2.5 py-1 bg-[#F0F1F2] dark:bg-[#21262D] text-[#1E2328] dark:text-[#F0F6FC] rounded-lg text-xs font-bold">{{ orders.length }}</span>
        </div>
        <button @click="loadOrders" :disabled="isLoading" 
          class="px-4 py-2.5 rounded-xl border border-[#E2E4E7] dark:border-[#30363D] bg-white dark:bg-[#161B22] text-[13px] font-bold text-[#1E2328] dark:text-[#F0F6FC] hover:bg-[#F8F9FA] dark:hover:bg-[#21262D] hover:shadow-md transition-all active:scale-95 flex items-center gap-2 group cursor-pointer">
          <RefreshCcw :class="['w-4 h-4 text-[#5A6270] dark:text-[#8B949E] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors', isLoading && 'animate-spin']" /> 
          {{ $t('admin.refresh') }}
        </button>
      </div>
      <div class="absolute right-0 top-0 w-64 h-32 bg-blue-50 dark:bg-blue-950/20 rounded-full blur-[80px] -z-0 opacity-60"></div>
    </div>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <div class="w-16 h-16 rounded-2xl bg-white dark:bg-[#161B22] shadow-xl flex items-center justify-center mb-4 relative overflow-hidden border border-[#E2E4E7]/50 dark:border-[#30363D]">
        <div class="absolute inset-0 bg-gradient-to-tr from-blue-100 dark:from-blue-950/40 to-transparent opacity-50"></div>
        <Loader2 class="w-8 h-8 text-blue-500 animate-spin relative z-10" />
      </div>
      <p class="text-xs font-black text-[#1E2328] dark:text-[#F0F6FC] uppercase tracking-wider mt-2">{{ $t('admin.syncingTransactions') }}</p>
      <p class="text-[11px] text-[#9BA1AA] dark:text-[#8B949E] font-bold mt-1">{{ $t('admin.fetchingLatestOrders') }}</p>
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-20 bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] rounded-[24px] px-8 shadow-sm relative overflow-hidden group">
      <div class="absolute inset-0 bg-gradient-to-br from-gray-50 to-white dark:from-[#21262D] dark:to-[#161B22] opacity-50 z-0 transition-opacity group-hover:opacity-100"></div>
      <div class="relative z-10">
        <div class="w-20 h-20 mx-auto bg-[#F8F9FA] dark:bg-[#21262D] rounded-full flex items-center justify-center shadow-inner mb-4 border border-[#E2E4E7] dark:border-[#30363D]">
          <ShoppingBag class="w-10 h-10 text-[#5A6270] dark:text-[#8B949E] opacity-40" />
        </div>
        <h3 class="text-[18px] font-extrabold text-[#1E2328] dark:text-[#F0F6FC] tracking-tight">{{ $t('admin.noOrdersFoundTitle') }}</h3>
        <p class="text-[13px] font-medium text-[#5A6270] dark:text-[#8B949E] mt-1.5 max-w-sm mx-auto">
          {{ $t('admin.noOrdersFoundSub') }}
        </p>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 gap-5 relative z-10">
      <article v-for="order in orders" :key="order.id" 
        class="bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] rounded-3xl p-6 lg:p-8 shadow-sm hover:shadow-xl transition-all group lg:flex lg:flex-col lg:gap-6">
        
        <div class="flex flex-col lg:flex-row items-start justify-between gap-4 border-b border-[#E2E4E7]/60 dark:border-[#30363D] pb-6">
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 dark:from-blue-950/40 to-sky-100 dark:to-sky-950/40 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center shrink-0 shadow-sm text-blue-700 dark:text-blue-300">
              <ShoppingBag class="w-6 h-6" />
            </div>
            
            <div>
              <div class="flex flex-wrap sm:items-center gap-3">
                <h3 class="text-[19px] font-extrabold text-[#1E2328] dark:text-[#F0F6FC] group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                  {{ $t('orders.orderNumber') }} #{{ order.order_number || order.id }}
                </h3>
                <span :class="['inline-flex w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xs', statusColor(order.status)]">
                  {{ $t(order.status || 'processing') }}
                </span>
                
                <span v-if="order.payment_status" :class="['inline-flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border', 
                  order.payment_status === 'paid' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50']">
                  <CreditCard class="w-3 h-3" /> {{ $t(order.payment_status) }}
                </span>
              </div>
              
              <div class="flex items-center gap-4 mt-2 text-[13px] font-semibold text-[#5A6270] dark:text-[#8B949E]">
                <span class="flex items-center gap-1.5"><User class="w-4 h-4 opacity-70 text-blue-600 dark:text-blue-400" /> {{ $t('buyer.roleBuyer') }}: {{ order.buyer?.first_name || $t('common.anonymous') }} {{ order.buyer?.second_name || '' }}</span>
                <span class="text-[#E2E4E7] dark:text-[#30363D] text-lg font-light">|</span>
                <span class="flex items-center gap-1.5 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-lg border border-orange-100 dark:border-orange-800/40"><Tractor class="w-4 h-4" /> {{ $t('admin.farmersInvolved') }} {{ order.fulfillments?.length || 1 }}</span>
              </div>
            </div>
          </div>
          
          <div class="lg:text-right flex flex-col justify-center">
            <span class="text-[11px] font-black uppercase tracking-widest text-[#9BA1AA] dark:text-[#8B949E] mb-0.5">{{ $t('admin.totalEscrowValue') }}</span>
            <span class="text-[24px] font-black text-[#1E9444] dark:text-emerald-400 tracking-tight">{{ formatETB(order.total_amount) }}</span>
            <span class="text-[12px] font-bold text-[#5A6270] dark:text-[#8B949E] flex items-center lg:justify-end gap-1.5 mt-1">
              <Calendar class="w-3.5 h-3.5" /> {{ formatDate(order.placed_at || order.created_at || new Date()) }}
            </span>
          </div>
        </div>

        <div class="mt-4 lg:mt-0 grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#F8F9FA] dark:bg-[#21262D] p-5 rounded-2xl border border-[#E2E4E7]/60 dark:border-[#30363D]">
          <div>
            <span class="text-[10px] uppercase font-black text-[#9BA1AA] dark:text-[#8B949E] block mb-1">{{ $t('admin.itemsRequested') }}</span>
            <span class="font-extrabold text-[#1E2328] dark:text-[#F0F6FC] text-[14px]">{{ $t('admin.totalItemsCount', { count: order.items?.reduce((acc, it) => acc + (it.quantity || 0), 0)?.toLocaleString() || 0 }) }}</span>
          </div>
          <div>
            <span class="text-[10px] uppercase font-black text-[#9BA1AA] dark:text-[#8B949E] block mb-1">{{ $t('admin.inspectionStatus') }}</span>
            <span class="font-extrabold text-indigo-700 dark:text-indigo-300 text-[14px] capitalize">{{ $t(order.inspection_status || 'pending') }}</span>
          </div>
          <div>
            <span class="text-[10px] uppercase font-black text-[#9BA1AA] dark:text-[#8B949E] block mb-1">{{ $t('admin.deliveryEscrow') }}</span>
            <span class="font-extrabold text-amber-600 dark:text-amber-400 text-[14px] capitalize">{{ $t(order.delivery_status || 'admin.awaitingTransport') }}</span>
          </div>
          <div>
            <span class="text-[10px] uppercase font-black text-[#9BA1AA] dark:text-[#8B949E] block mb-1">{{ $t('admin.farmerPayout') }}</span>
            <span :class="['font-extrabold text-[14px] capitalize', order.payout_status === 'completed' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400']">{{ $t(order.payout_status || 'admin.withheld') }}</span>
          </div>
        </div>

        <div class="mt-6 border-t border-[#E2E4E7]/60 dark:border-[#30363D] pt-6">
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
  } finally {
    isLoading.value = false
  }
}

onMounted(loadOrders)

const statusColor = (status) => {
  const map = { 
    pending_payment: 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60',
    placed: 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60', 
    in_transit: 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60', 
    delivered: 'bg-teal-100 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60', 
    completed: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60',
    cancelled: 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/60'
  }
  return status ? (map[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700') : 'bg-gray-100 dark:bg-gray-800'
}
</script>
