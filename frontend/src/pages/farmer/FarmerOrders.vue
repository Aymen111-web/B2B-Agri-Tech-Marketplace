<template>
  <div class="w-full flex flex-col min-h-full pb-8 max-w-5xl mx-auto space-y-5">
    <div class="bg-gradient-to-r from-[#062E15] via-[#0F5C2A] to-[#0B57D0] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-[#E69500]/20 rounded-full blur-2xl pointer-events-none" />
      <div class="flex items-center justify-between relative z-10">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-white tracking-tight">Received Orders</h1>
          <p class="text-xs text-[#C3EFCF] mt-1 font-medium">Orders placed by commercial buyers with escrow protection</p>
        </div>
      </div>
    </div>

    <div v-if="orders.length === 0" class="text-center py-12 text-[#5A6270] bg-white border border-[#E2E4E7] rounded-2xl p-6">
      <p>No orders received yet.</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="order in orders" :key="order.id" class="bg-white border border-[#E2E4E7] rounded-2xl p-5 shadow-xs space-y-3">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg"><Package class="w-5 h-5" /></div>
            <div>
              <h3 class="text-sm font-black text-[#1E2328]">Order #{{ order.id }}</h3>
              <p class="text-xs text-[#5A6270]">Buyer: {{ order.buyer?.name || 'Commercial Buyer' }} · {{ formatDate(order.createdAt || order.placedAt || order.created_at) }}</p>
            </div>
          </div>
          <span :class="['px-3 py-1 rounded-full text-xs font-black capitalize', statusBadgeClass(order.status)]">{{ order.status }}</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8F9FA] p-3 rounded-xl text-xs">
          <div><span class="text-[#5A6270] block font-medium">Crop</span><span class="font-bold text-[#1E2328]">{{ order.listing?.cropName || 'Produce' }}</span></div>
          <div><span class="text-[#5A6270] block font-medium">Quantity</span><span class="font-bold text-[#1E2328]">{{ order.quantityKg?.toLocaleString() }} kg</span></div>
          <div><span class="text-[#5A6270] block font-medium">Total Value</span><span class="font-black text-[#1E9444]">{{ formatETB(order.totalAmountETB) }}</span></div>
          <div><span class="text-[#5A6270] block font-medium">Escrow Status</span><span class="font-bold text-amber-600 capitalize">{{ order.escrowStatus || 'held' }}</span></div>
        </div>

        <OrderTimeline :status="order.status" />

        <div v-if="order.status === 'placed'" class="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button @click="dispatchOrder(order.id)" class="px-4 py-2 rounded-xl bg-[#1E9444] text-white text-xs font-bold hover:bg-[#0F5C2A] flex items-center gap-1.5 shadow-2xs">
            <Truck class="w-4 h-4" /><span>Dispatch Shipment</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Package, Truck } from 'lucide-vue-next'
import { useOrders } from '@/composables/useOrders'
import { formatETB, formatDate } from '@/utils/helpers'
import OrderTimeline from '@/components/shared/OrderTimeline.vue'

const { orders, dispatchOrder } = useOrders()

const statusBadgeClass = (status) => {
  const map = { placed: 'bg-blue-50 text-blue-700 border border-blue-200', dispatched: 'bg-amber-50 text-amber-700 border border-amber-200', in_transit: 'bg-amber-50 text-amber-700 border border-amber-200', delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200', completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200' }
  return map[status] || 'bg-gray-50 text-gray-700'
}
</script>
