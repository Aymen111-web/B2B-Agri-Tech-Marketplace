<template>
  <div class="w-full flex flex-col min-h-full pb-8 max-w-5xl mx-auto space-y-5">
    <div class="bg-gradient-to-r from-[#062E15] via-[#0F5C2A] to-[#0B57D0] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-[#E69500]/20 rounded-full blur-2xl pointer-events-none" />
      <div class="flex items-center justify-between relative z-10">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-white tracking-tight">{{ $t('orders.farmerOrdersTitle') || 'Received Orders' }}</h1>
          <p class="text-xs text-[#C3EFCF] mt-1 font-medium">{{ $t('orders.farmerOrdersSub') || 'Orders placed by commercial buyers with escrow protection' }}</p>
        </div>
      </div>
    </div>

    <div v-if="orders.length === 0" class="text-center py-12 text-[#5A6270] dark:text-[#8B949E] bg-white dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] rounded-2xl p-6">
      <p>{{ $t('orders.noOrdersTitle') }}</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="order in orders" :key="order.id" class="bg-white dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] rounded-2xl p-5 shadow-xs space-y-3">
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-[#30363D] pb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40 flex items-center justify-center font-bold text-lg">
              <Package class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm font-black text-[#1E2328]">{{ $t('orders.orderId') }} #{{ order.displayId }}</h3>
              <p class="text-xs text-[#5A6270]">{{ $t('orders.buyer') }}: {{ order.buyer?.name || $t('Commercial Buyer') }} · {{ formatDate(order.createdAt || order.placedAt || order.created_at) }}</p>
            </div>
          </div>
          <span :class="['px-3 py-1 rounded-full text-xs font-black capitalize', statusBadgeClass(order.status)]">{{ $t(order.status) }}</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8F9FA] dark:bg-[#21262D] border border-transparent dark:border-[#30363D] p-3 rounded-xl text-xs">
          <div><span class="text-[#5A6270] dark:text-[#8B949E] block font-medium">{{ $t('orders.crop') }}</span><span class="font-bold text-[#1E2328] dark:text-[#F0F6FC]">{{ $t(order.listing?.cropName) || $t('Produce') }}</span></div>
          <div><span class="text-[#5A6270] dark:text-[#8B949E] block font-medium">{{ $t('cart.quantity') }}</span><span class="font-bold text-[#1E2328] dark:text-[#F0F6FC]">{{ order.quantityKg?.toLocaleString() }} kg</span></div>
          <div><span class="text-[#5A6270] dark:text-[#8B949E] block font-medium">{{ $t('orders.amount') }}</span><span class="font-black text-[#1E9444] dark:text-emerald-400">{{ formatETB(order.totalAmountETB) }}</span></div>
          <div><span class="text-[#5A6270] dark:text-[#8B949E] block font-medium">{{ $t('Escrow Status') }}</span><span class="font-bold text-amber-600 dark:text-amber-400 capitalize">{{ $t(order.escrowStatus || 'held') }}</span></div>
        </div>

        <OrderTimeline :status="order.status" />

        <div v-if="order.status === 'placed' || order.status === 'pending'" class="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-[#30363D]">
          <button @click="updateOrderStatus(order.id, 'accepted', 'Farmer accepted order parameters')" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer">
            <CheckCircle2 class="w-4 h-4" /><span>{{ $t('Accept Order') || 'Accept Order' }}</span>
          </button>
        </div>

        <div v-if="order.status === 'paid_in_escrow'" class="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button @click="dispatchOrder(order.id)" class="px-4 py-2 rounded-xl bg-[#1E9444] text-white text-xs font-bold hover:bg-[#0F5C2A] flex items-center gap-1.5 shadow-2xs">
            <Truck class="w-4 h-4" /><span>{{ $t('Dispatch Shipment') }}</span>
          </button>
        </div>

        <!-- Escrow PIN Box for Farmer -->
        <div v-if="order.status === 'in_transit' || order.status === 'dispatched' || order.status === 'accepted'" 
          class="bg-[#EDFAF2] dark:bg-emerald-950/30 border border-[#C3EFCF] dark:border-emerald-800/50 p-4 rounded-xl mt-3 flex items-center justify-between shadow-2xs">
          <div>
            <h4 class="text-xs font-black text-[#0F5C2A] uppercase tracking-wider">{{ $t('orders.deliveryPin') }}</h4>
            <p class="text-[11px] text-[#1E9444] mt-0.5">{{ $t('orders.handoffInstruction') }}</p>
          </div>
          <div class="px-4 py-1.5 bg-white dark:bg-[#161B22] rounded-lg border border-[#C3EFCF] dark:border-emerald-800/50 shadow-sm select-all">
            <span class="text-lg font-black tracking-widest text-[#1E2328] dark:text-[#F0F6FC]">{{ order.deliveryPin || 'PENDING' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Package, Truck, CheckCircle2 } from 'lucide-vue-next'
import { useOrders } from '@/composables/useOrders'
import { formatETB, formatDate } from '@/utils/helpers'
import OrderTimeline from '@/components/shared/OrderTimeline.vue'

const { orders, dispatchOrder, updateOrderStatus } = useOrders()

const statusBadgeClass = (status) => {
  const map = {
    placed: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60',
    dispatched: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60',
    in_transit: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60',
    delivered: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60',
    completed: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
  }
  return map[status] || 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
}
</script>
