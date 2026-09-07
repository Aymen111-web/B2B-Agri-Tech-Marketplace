<template>
  <div class="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border-b border-[#E2E4E7] pb-6 relative">
      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-1.5">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <ShieldAlert class="w-5 h-5 text-white" />
          </div>
          <h1 class="text-[28px] font-black text-[#1E2328] tracking-tight">Dispute & Escrow Arbitrage</h1>
        </div>
        <p class="text-[14px] font-medium text-[#5A6270] max-w-xl">
          Review produce quality claims, transport exceptions, and safely resolve escrow funds.
        </p>
      </div>
      <div class="flex items-center gap-3 z-10">
        <div class="flex items-center bg-white border border-[#E2E4E7] rounded-xl p-1 shadow-xs">
          <span class="px-3 py-1.5 text-[11px] font-black uppercase text-[#1E2328]">Active Claims:</span>
          <span class="px-2.5 py-1 bg-[#F0F1F2] text-[#1E2328] rounded-lg text-xs font-bold">{{ disputes.length }}</span>
        </div>
        <button @click="loadDisputes" :disabled="isLoading" 
          class="px-4 py-2.5 rounded-xl border border-[#E2E4E7] bg-white text-[13px] font-bold text-[#1E2328] hover:bg-[#F8F9FA] hover:shadow-md transition-all active:scale-95 flex items-center gap-2 group">
          <RefreshCcw :class="['w-4 h-4 text-[#5A6270] group-hover:text-red-600 transition-colors', isLoading && 'animate-spin']" /> 
          Refresh
        </button>
      </div>
      <div class="absolute right-0 top-0 w-64 h-32 bg-red-50 rounded-full blur-[80px] -z-0 opacity-60"></div>
    </div>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <div class="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-4 relative overflow-hidden border border-[#E2E4E7]/50">
        <div class="absolute inset-0 bg-gradient-to-tr from-rose-100 to-transparent opacity-50"></div>
        <Loader2 class="w-8 h-8 text-rose-500 animate-spin relative z-10" />
      </div>
      <p class="text-xs font-black text-[#1E2328] uppercase tracking-wider mt-2">Syncing Exceptions</p>
      <p class="text-[11px] text-[#9BA1AA] font-bold mt-1">Retrieving system anomaly reports...</p>
    </div>

    <div v-else-if="disputes.length === 0" class="text-center py-20 bg-white border border-[#E2E4E7] rounded-[24px] px-8 shadow-sm relative overflow-hidden group">
      <div class="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-50 z-0 transition-opacity group-hover:opacity-100"></div>
      <div class="relative z-10">
        <div class="w-20 h-20 mx-auto bg-[#F8F9FA] rounded-full flex items-center justify-center shadow-inner mb-4 border border-[#E2E4E7]">
          <CheckCircle2 class="w-10 h-10 text-emerald-500 opacity-80" />
        </div>
        <h3 class="text-[18px] font-extrabold text-[#1E2328] tracking-tight">No Active Disputes</h3>
        <p class="text-[13px] font-medium text-[#5A6270] mt-1.5 max-w-sm mx-auto">
          All marketplace orders are progressing cleanly with zero escalations or claims reported.
        </p>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-5 relative z-10">
      <article v-for="d in disputes" :key="d.id" 
        class="bg-white border border-rose-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between">
        
        <div>
          <div class="flex items-start justify-between border-b border-rose-100 pb-4">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-50 to-red-100 text-rose-700 flex items-center justify-center font-bold shrink-0 border border-rose-200 shadow-2xs">
                <ShieldAlert class="w-5 h-5" />
              </div>
              <div class="min-w-0">
                <h3 class="text-[15px] font-extrabold text-[#1E2328] truncate">
                  Resolution Ticket #{{ d.id }}
                </h3>
                <p class="text-[11px] font-black uppercase tracking-wider text-rose-700 mt-0.5 truncate">
                  Reference Order #{{ d.order_id }}
                </p>
              </div>
            </div>
            <span class="shrink-0 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-rose-100 text-rose-800 shadow-2xs border border-rose-200">
              {{ d.status === 'pending' || d.status === 'pending_review' ? 'Needs Action' : d.status }}
            </span>
          </div>

          <div class="py-4">
            <div class="grid grid-cols-2 gap-4 mb-4 text-[12px]">
              <div>
                <span class="block font-bold text-[#9BA1AA] uppercase tracking-wider text-[10px] mb-1">Claim Type</span>
                <span class="font-bold text-[#1E2328] capitalize">{{ d.type ? d.type.replace('_', ' ') : 'General Exception' }}</span>
              </div>
              <div>
                <span class="block font-bold text-[#9BA1AA] uppercase tracking-wider text-[10px] mb-1">Filed By</span>
                <span class="font-bold text-[#1E2328]">{{ d.raised_user?.first_name || 'System Auto-Flag' }} {{ d.raised_user?.second_name || '' }}</span>
              </div>
            </div>

            <div class="bg-rose-50/50 p-4 rounded-xl border border-rose-100 relative overflow-hidden">
              <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-400 to-red-500"></div>
              <span class="block font-bold text-[#9BA1AA] uppercase tracking-wider text-[9px] mb-1">Incident Detail Report</span>
              <p class="text-[13px] font-medium text-[#1E2328] leading-relaxed">
                {{ d.description || 'No detailed description provided by the claimant.' }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-gray-100 mt-auto">
          <button @click="resolveDispute(d.id, 'refund_buyer')" 
            class="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border-2 border-orange-100 text-orange-700 text-[12px] font-bold hover:bg-orange-50 hover:border-orange-200 transition-colors shadow-2xs focus:ring-4 focus:ring-orange-100">
            Refund Buyer
          </button>
          <button @click="resolveDispute(d.id, 'release_farmer')" 
            class="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-tr from-[#1E9444] to-emerald-500 text-white text-[12px] font-bold hover:from-[#0F5C2A] hover:to-emerald-600 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all focus:ring-4 focus:ring-emerald-100">
            <Check class="w-4 h-4" /> Finalize Payout to Farmer
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ShieldAlert, Check, Loader2, RefreshCcw, CheckCircle2 } from 'lucide-vue-next'
import { adminApi } from '@/services/adminService'

const disputes = ref([])
const isLoading = ref(true)

const loadDisputes = async () => {
  isLoading.value = true
  try {
    const res = await adminApi.fetchPaymentExceptions()
    disputes.value = res.data || res
  } catch (err) {
    disputes.value = []
    alert(err.message || 'Failed to fetch disputes from server.')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadDisputes)

const resolveDispute = async (id, resolution) => {
  const isRefund = resolution === 'refund_buyer'
  if (confirm(`CRITICAL ESCROW ACTION: Are you sure you want to completely ${isRefund ? 'REFUND THE BUYER' : 'PAY OUT THE FARMER'} for this transaction? This cannot be easily reversed.`)) {
    try {
      const notes = prompt(`Please enter resolution/audit notes for ${isRefund ? 'refunding the buyer' : 'payout to farmer'}:`) || `Administratively resolved via ${resolution}`
      await adminApi.resolvePaymentException(id, notes)
      loadDisputes()
    } catch (err) {
      alert(err.message || 'Failed to resolve escalation')
    }
  }
}
</script>
