<template>
  <div class="space-y-5">
    <h1 class="text-[20px] font-black text-[#1E2328]">My Orders</h1>
    <div v-if="orders.length === 0" class="text-center py-12 text-[#5A6270]"><p>No orders yet.</p><router-link to="/buyer/marketplace" class="text-[#1E9444] font-bold">Start Shopping</router-link></div>
    <div v-else class="space-y-3">
      <div v-for="order in orders" :key="order.id" class="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-2xs space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-[#F0F1F2] rounded-xl flex items-center justify-center text-xl">{{ order.listing?.cropEmoji || '🌾' }}</div>
            <div><h4 class="text-[14px] font-bold text-[#1E2328]">{{ order.listing?.cropName || 'Produce' }}</h4><p class="text-[12px] text-[#5A6270]">{{ order.id }} · {{ order.quantityKg?.toLocaleString() }} kg</p></div>
          </div>
          <span :class="['px-2.5 py-1 rounded-full text-[11px] font-bold capitalize', statusColor(order.status)]">{{ order.status }}</span>
        </div>
        <OrderTimeline :status="order.status" />
        <div class="flex items-center justify-between text-[13px]">
          <span class="font-black text-[#1E9444]">{{ formatETB(order.totalAmountETB) }}</span>
          <button v-if="order.status === 'in_transit' || order.status === 'dispatched'" @click="confirmDelivery(order.id)" class="px-4 py-2 rounded-xl bg-[#1E9444] text-white text-[12px] font-bold hover:bg-[#0F5C2A]">Confirm Delivery</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useOrders } from '@/composables/useOrders'
import { formatETB } from '@/utils/helpers'
import OrderTimeline from '@/components/shared/OrderTimeline.vue'

const { orders, confirmDelivery } = useOrders()

const statusColor = (status) => {
  const map = { placed: 'bg-blue-100 text-blue-700', dispatched: 'bg-amber-100 text-amber-700', in_transit: 'bg-amber-100 text-amber-700', delivered: 'bg-emerald-100 text-emerald-700', completed: 'bg-emerald-100 text-emerald-700', disputed: 'bg-red-100 text-red-700' }
  return map[status] || 'bg-gray-100 text-gray-700'
}
</script>
