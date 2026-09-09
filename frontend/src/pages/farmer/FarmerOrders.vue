<template>
  <div class="w-full flex flex-col min-h-full pb-8 max-w-5xl mx-auto space-y-4">
    <div class="bg-gradient-to-r from-[#062E15] via-[#0F5C2A] to-[#0B57D0] text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-[#E69500]/20 rounded-full blur-2xl pointer-events-none" />
      <div class="flex items-center justify-between relative z-10">
        <div>
          <h1 class="text-lg sm:text-xl font-black text-white tracking-tight">{{ $t('orders.farmerOrdersTitle') || 'Received Orders' }}</h1>
          <p class="text-xs text-[#C3EFCF] mt-0.5 font-medium">{{ $t('orders.farmerOrdersSub') || 'Orders placed by commercial buyers with escrow protection' }}</p>
        </div>
        <div class="px-3 py-1 bg-white/10 backdrop-blur-xs rounded-xl border border-white/20 text-xs font-bold text-white">
          {{ orders.length }} {{ $t('Total Orders') }}
        </div>
      </div>
    </div>

    <div v-if="orders.length === 0" class="text-center py-12 text-[#5A6270] dark:text-[#8B949E] bg-white dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] rounded-2xl p-6">
      <Package class="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-2 opacity-50" />
      <p class="font-bold text-sm text-[#1E2328] dark:text-[#F0F6FC]">{{ $t('orders.noOrdersTitle') }}</p>
    </div>

    <div v-else class="space-y-4">
      <div class="space-y-2.5">
        <div v-for="order in paginatedOrders" :key="order.id" 
          class="bg-white dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] rounded-xl px-4 py-3 shadow-2xs hover:border-[#1E9444]/50 transition-all">
          
          <!-- Compact Main Row -->
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <!-- Left: Icon + Order Batch & Buyer Info -->
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40 flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                <Package class="w-4 h-4" />
              </div>
              
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="text-sm font-black text-[#1E2328] dark:text-[#F0F6FC]">
                    #{{ order.displayId || order.id }}
                  </h3>
                  <span :class="['px-2 py-0.5 rounded-full text-[10px] font-black capitalize border shadow-2xs', statusBadgeClass(order.status)]">
                    {{ formatStatusLabel(order.status) }}
                  </span>
                  <span class="text-[11px] text-[#5A6270] dark:text-[#8B949E] font-medium">
                    {{ formatDate(order.createdAt || order.placedAt || order.created_at) }}
                  </span>
                </div>
                
                <div class="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-[11px] text-[#5A6270] dark:text-[#8B949E]">
                  <span>{{ $t('orders.buyer') }}: <strong class="text-[#1E2328] dark:text-[#F0F6FC]">{{ order.buyer?.name || $t('Commercial Buyer') }}</strong></span>
                  <span class="text-gray-300 dark:text-gray-600">•</span>
                  <span>{{ $t('orders.crop') }}: <strong class="text-[#1E2328] dark:text-[#F0F6FC]">{{ $t(order.listing?.cropName) || $t('Produce') }}</strong></span>
                  <span class="px-1.5 py-0.2 rounded bg-gray-100 dark:bg-[#21262D] font-bold text-[#1E2328] dark:text-[#F0F6FC] text-[10px]">
                    {{ order.quantityKg?.toLocaleString() }} kg
                  </span>
                </div>
              </div>
            </div>

            <!-- Middle / Right: Escrow + Price + Action Buttons -->
            <div class="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-[#30363D]">
              <!-- Escrow Status Pill -->
              <span v-if="order.status === 'disputed' || order.isDisputed" class="px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/40 text-[11px] font-bold capitalize">
                {{ $t('Escrow') }}: Frozen
              </span>
              <span v-else class="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40 text-[11px] font-bold capitalize">
                {{ $t('Escrow') }}: {{ $t(order.escrowStatus || 'held') }}
              </span>

              <!-- Simple Clean Delivery PIN Pill -->
              <div v-if="order.deliveryPin"
                @click.stop="copyPin(order.deliveryPin)"
                class="flex items-center gap-2 px-3 py-1 bg-[#EDFAF2] dark:bg-emerald-950/60 border border-[#C3EFCF] dark:border-emerald-800/80 rounded-xl cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all shadow-2xs group"
                :title="$t('Click to copy handover PIN for delivery driver')">
                <span class="text-[11px] font-black uppercase text-[#0F5C2A] dark:text-emerald-300">Driver PIN:</span>
                <span class="font-mono text-base font-black text-[#1E9444] dark:text-emerald-400 tracking-widest">{{ order.deliveryPin }}</span>
                <span class="ml-0.5 p-1 rounded-lg bg-[#1E9444] text-white flex items-center justify-center shrink-0">
                  <Check v-if="copiedPin === order.deliveryPin" class="w-3.5 h-3.5" />
                  <Copy v-else class="w-3.5 h-3.5" />
                </span>
              </div>

              <!-- Price -->
              <div class="text-right min-w-[80px]">
                <span class="text-sm sm:text-base font-black text-[#1E9444] dark:text-emerald-400 tracking-tight block">
                  {{ formatETB(order.totalAmountETB) }}
                </span>
              </div>

              <!-- Action Buttons -->
              <span v-if="order.status === 'disputed' || order.isDisputed" 
                class="px-2.5 py-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 rounded-xl flex items-center gap-1 shrink-0">
                <AlertTriangle class="w-3.5 h-3.5 text-red-600" />
                <span>Escrow Disputed</span>
              </span>

              <button v-else-if="order.status === 'placed' || order.status === 'pending'" 
                @click="updateOrderStatus(order.id, 'accepted', 'Farmer accepted order parameters')" 
                class="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer">
                <CheckCircle2 class="w-3.5 h-3.5" />
                <span>{{ $t('Accept') }}</span>
              </button>

              <button v-else-if="order.status === 'paid_in_escrow'" 
                @click="dispatchOrder(order.id)" 
                class="px-3 py-1.5 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer">
                <Truck class="w-3.5 h-3.5" />
                <span>{{ $t('Dispatch Produce') }}</span>
              </button>

              <span v-else-if="order.status === 'dispatched' || order.status === 'in_transit'" 
                class="px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-800/40 rounded-xl flex items-center gap-1 shrink-0">
                <Truck class="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>In Transit</span>
              </span>

              <span v-else-if="order.status === 'completed' || order.status === 'delivered'" 
                class="px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40 rounded-xl flex items-center gap-1 shrink-0">
                <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
                <span>Payout Released</span>
              </span>

              <!-- Timeline Toggle -->
              <button @click="toggleTimeline(order.id)" 
                class="p-1.5 rounded-lg bg-[#F0F1F2] dark:bg-[#21262D] hover:bg-gray-200 dark:hover:bg-[#30363D] text-[#1E2328] dark:text-[#F0F6FC] transition-colors cursor-pointer"
                :title="expandedOrderIds[order.id] ? 'Hide Progress' : 'View Order Timeline'">
                <ChevronDown :class="['w-4 h-4 transition-transform duration-200', expandedOrderIds[order.id] ? 'rotate-180' : '']" />
              </button>
            </div>
          </div>

          <!-- Collapsible Timeline Drawer -->
          <div v-if="expandedOrderIds[order.id]" class="mt-3 pt-3 border-t border-gray-100 dark:border-[#30363D] space-y-2 animate-in fade-in duration-200">
            <div v-if="order.status === 'disputed' || order.isDisputed" class="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle class="w-4 h-4 shrink-0 text-red-600" />
              <span>This order has an active quality or delivery dispute. Escrow funds will remain safely locked until platform admins finalize arbitration.</span>
            </div>

            <OrderTimeline :status="order.status" />

            <div v-if="order.deliveryPin && order.status !== 'completed'" class="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/40 text-xs text-[#1E2328] dark:text-[#F0F6FC] flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <Key class="w-4 h-4 text-[#0B57D0] dark:text-blue-400 shrink-0" />
                <span>{{ $t('Driver Handoff PIN (Provide to your transport driver)') }}:</span>
              </div>
              <strong class="font-mono font-black text-sm text-[#1E9444] dark:text-emerald-400 tracking-widest bg-[#EDFAF2] dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-[#C3EFCF] dark:border-emerald-800/50 select-all">{{ order.deliveryPin }}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <Pagination 
        :currentPage="currentPage" 
        :totalPages="totalPages" 
        :totalItems="orders.length" 
        :itemsPerPage="itemsPerPage" 
        @update:currentPage="currentPage = $event" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Package, Truck, CheckCircle2, ChevronDown, Key, Copy, Check, AlertTriangle, Clock } from 'lucide-vue-next'
import { useOrders } from '@/composables/useOrders'
import { formatETB, formatDate } from '@/utils/helpers'
import OrderTimeline from '@/components/shared/OrderTimeline.vue'
import Pagination from '@/components/common/Pagination.vue'

const { orders, dispatchOrder, updateOrderStatus } = useOrders()

const expandedOrderIds = ref({})
const copiedPin = ref(null)

const toggleTimeline = (orderId) => {
  expandedOrderIds.value[orderId] = !expandedOrderIds.value[orderId]
}

const copyPin = (pin) => {
  if (!pin) return
  navigator.clipboard?.writeText(pin)
  copiedPin.value = pin
  setTimeout(() => {
    if (copiedPin.value === pin) copiedPin.value = null
  }, 2000)
}

const currentPage = ref(1)
const itemsPerPage = 6

const totalPages = computed(() => Math.ceil(orders.value.length / itemsPerPage) || 1)

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return orders.value.slice(start, start + itemsPerPage)
})

const statusBadgeClass = (status) => {
  const map = {
    placed: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
    pending: 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/60',
    accepted: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
    paid_in_escrow: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    dispatched: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    in_transit: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700/60',
    delivered: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    completed: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700/60',
    disputed: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60',
  }
  return map[status] || 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
}

const formatStatusLabel = (status) => {
  const map = {
    paid_in_escrow: 'Paid in Escrow',
    dispatched: 'Dispatched',
    in_transit: 'In Transit',
    completed: 'Completed',
    delivered: 'Delivered',
    disputed: 'Escrow Disputed',
  }
  return map[status] || (status || 'placed').replace(/_/g, ' ')
}
</script>

