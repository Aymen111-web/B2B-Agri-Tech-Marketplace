<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E4E7] pb-5">
      <div>
        <h1 class="text-[24px] font-extrabold text-[#1E2328]">Dispute Resolution & Arbitrage Center</h1>
        <p class="text-[13px] text-[#5A6270]">Manage produce quality claims, transport exceptions, and escrow releases</p>
      </div>
      <button @click="loadDisputes" class="px-3 py-1.5 rounded-lg border border-[#E2E4E7] bg-white text-[12px] font-bold text-[#1E2328] hover:bg-[#F8F9FA]">Refresh Claims</button>
    </div>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-12"><Loader2 class="w-8 h-8 text-orange-600 animate-spin" /><p class="text-xs font-bold text-[#5A6270] mt-2">Loading active claims...</p></div>

    <div v-else-if="disputes.length === 0" class="text-center py-12 bg-white border border-[#E2E4E7] rounded-2xl p-8 space-y-2">
      <ShieldAlert class="w-12 h-12 text-orange-600 mx-auto opacity-40" />
      <h3 class="text-base font-bold text-[#1E2328]">No Active Disputes</h3>
      <p class="text-xs text-[#5A6270]">All marketplace orders are progressing cleanly with no buyer/farmer claims.</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="d in disputes" :key="d.id" class="bg-white border border-orange-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div class="flex items-center justify-between border-b border-orange-100 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold"><ShieldAlert class="w-5 h-5" /></div>
            <div>
              <h3 class="text-sm font-bold text-[#1E2328]">Dispute #{{ d.id }} · Order #{{ d.orderId }}</h3>
              <p class="text-xs text-[#5A6270]">Filed by: {{ d.filedBy }} · Reason: {{ d.reason }}</p>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">Pending Review</span>
        </div>

        <p class="text-xs text-[#1E2328] bg-orange-50/50 p-3 rounded-xl border border-orange-100">{{ d.details }}</p>

        <div class="flex justify-end gap-2 pt-2">
          <button @click="resolveDispute(d.id, 'refund_buyer')" class="px-4 py-2 rounded-xl border border-orange-300 text-orange-700 text-xs font-bold hover:bg-orange-50">Refund Buyer</button>
          <button @click="resolveDispute(d.id, 'release_farmer')" class="px-4 py-2 rounded-xl bg-[#1E9444] text-white text-xs font-bold hover:bg-[#0F5C2A] flex items-center gap-1 shadow-2xs"><Check class="w-4 h-4" /> Release Escrow to Farmer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ShieldAlert, Check, Loader2 } from 'lucide-vue-next'
import { adminApi } from '@/services/adminService'

const disputes = ref([])
const isLoading = ref(true)

const loadDisputes = async () => {
  isLoading.value = true
  try {
    disputes.value = await adminApi.fetchDisputes()
  } catch {
    disputes.value = []
    alert('Failed to fetch disputes from server.')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadDisputes)

const resolveDispute = async (id, resolution) => {
  if (confirm(`Confirm dispute resolution: ${resolution}?`)) {
    await adminApi.resolveDispute(id, resolution)
    loadDisputes()
  }
}
</script>
