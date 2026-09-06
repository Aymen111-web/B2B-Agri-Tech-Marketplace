<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E4E7] pb-5">
      <div>
        <h1 class="text-[24px] font-extrabold text-[#1E2328]">Order & Escrow Audit Center</h1>
        <p class="text-[13px] text-[#5A6270]">Monitor marketplace transactions, delivery milestones, and escrow status</p>
      </div>
      <button @click="loadOrders" class="px-3 py-1.5 rounded-lg border border-[#E2E4E7] bg-white text-[12px] font-bold text-[#1E2328] hover:bg-[#F8F9FA]">Refresh Orders</button>
    </div>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-12"><Loader2 class="w-8 h-8 text-[#1E9444] animate-spin" /><p class="text-xs font-bold text-[#5A6270] mt-2">Loading marketplace orders...</p></div>

    <div v-else class="space-y-3">
      <div v-for="order in orders" :key="order.id" class="bg-white border border-[#E2E4E7] rounded-2xl p-5 shadow-xs space-y-3">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold"><ShoppingBag class="w-5 h-5" /></div>
            <div>
              <h3 class="text-sm font-bold text-[#1E2328]">Order #{{ order.id }}</h3>
              <p class="text-xs text-[#5A6270]">Buyer: {{ order.buyer?.name || 'Buyer' }} · Farmer: {{ order.farmer?.name || 'Farmer' }}</p>
            </div>
          </div>
          <span :class="['px-3 py-1 rounded-full text-xs font-bold capitalize', statusColor(order.status)]">{{ order.status }}</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8F9FA] p-3 rounded-xl text-xs">
          <div><span class="text-[#5A6270] block font-medium">Quantity</span><span class="font-bold text-[#1E2328]">{{ order.quantityKg?.toLocaleString() }} kg</span></div>
          <div><span class="text-[#5A6270] block font-medium">Total Amount</span><span class="font-black text-[#1E9444]">{{ formatETB(order.totalAmountETB) }}</span></div>
          <div><span class="text-[#5A6270] block font-medium">Escrow Status</span><span class="font-bold text-amber-600 capitalize">{{ order.escrowStatus || 'held' }}</span></div>
          <div><span class="text-[#5A6270] block font-medium">Placed Date</span><span class="font-semibold text-[#1E2328]">{{ formatDate(order.createdAt || new Date()) }}</span></div>
        </div>

        <OrderTimeline :status="order.status" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ShoppingBag, Loader2 } from 'lucide-vue-next'
import { adminApi } from '@/services/adminService'
import { formatETB, formatDate } from '@/utils/helpers'
import OrderTimeline from '@/components/shared/OrderTimeline.vue'

const orders = ref([])
const isLoading = ref(true)

const loadOrders = async () => {
  isLoading.value = true
  try {
    orders.value = await adminApi.fetchOrders()
  } catch {
    orders.value = []
    alert('Failed to fetch orders from server.')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadOrders)

const statusColor = (status) => {
  const map = { placed: 'bg-blue-100 text-blue-700', in_transit: 'bg-amber-100 text-amber-700', delivered: 'bg-emerald-100 text-emerald-700', completed: 'bg-emerald-100 text-emerald-700' }
  return map[status] || 'bg-gray-100 text-gray-700'
}
</script>
