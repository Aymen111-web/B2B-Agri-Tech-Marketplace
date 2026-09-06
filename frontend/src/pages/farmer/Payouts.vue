<template>
  <div class="w-full flex flex-col min-h-full pb-8 max-w-5xl mx-auto space-y-5">
    <div class="bg-gradient-to-r from-[#062E15] via-[#0F5C2A] to-[#0B57D0] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-[#E69500]/20 rounded-full blur-2xl pointer-events-none" />
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-white tracking-tight">Escrow Payouts & Earnings</h1>
          <p class="text-xs text-[#C3EFCF] mt-1 font-medium">Automatic settlement via CBE / Telebirr upon buyer delivery confirmation</p>
        </div>
        <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-left sm:text-right shrink-0">
          <span class="text-[10px] font-extrabold text-[#C3EFCF] uppercase tracking-wider block">Available Balance</span>
          <span class="text-xl font-black text-[#E69500] block mt-0.5">{{ formatETB(farmer?.totalEarned || 890000) }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs space-y-1">
        <span class="text-xs font-bold text-[#5A6270]">Total Settled</span>
        <h3 class="text-2xl font-black text-[#1E9444]">{{ formatETB(720000) }}</h3>
        <p class="text-[10px] text-[#5A6270] font-medium">Released to Bank Account</p>
      </div>
      <div class="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs space-y-1">
        <span class="text-xs font-bold text-[#5A6270]">Locked in Escrow</span>
        <h3 class="text-2xl font-black text-[#E69500]">{{ formatETB(170000) }}</h3>
        <p class="text-[10px] text-[#5A6270] font-medium">Awaiting Buyer Delivery Confirmation</p>
      </div>
      <div class="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs space-y-1">
        <span class="text-xs font-bold text-[#5A6270]">Payout Method</span>
        <h3 class="text-base font-black text-[#1E2328]">Commercial Bank of Ethiopia</h3>
        <p class="text-[10px] text-[#1E9444] font-bold">CBE A/C: 1000****8921 (Verified)</p>
      </div>
    </div>

    <div class="bg-white border border-[#E2E4E7] rounded-2xl p-5 shadow-xs space-y-4">
      <h3 class="text-base font-black text-[#1E2328] border-b border-gray-100 pb-3 flex items-center justify-between">
        <span>Recent Payout History</span>
        <DollarSign class="w-5 h-5 text-[#1E9444]" />
      </h3>
      <div class="space-y-2.5">
        <div v-for="(payout, i) in recentPayouts" :key="i" class="p-3.5 bg-[#F8F9FA] border border-[#E2E4E7] rounded-xl flex items-center justify-between text-xs">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-50 text-[#1E9444] border border-emerald-100 flex items-center justify-center font-black"><CheckCircle2 class="w-5 h-5" /></div>
            <div>
              <h4 class="font-bold text-[#1E2328]">{{ payout.reference }}</h4>
              <p class="text-[#5A6270]">{{ payout.description }} · {{ payout.date }}</p>
            </div>
          </div>
          <div class="text-right">
            <span class="font-black text-[#1E9444] block text-sm">{{ formatETB(payout.amount) }}</span>
            <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Settled</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { DollarSign, CheckCircle2 } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { formatETB } from '@/utils/helpers'

const { user } = useAuth()
const farmer = computed(() => user.value)

const recentPayouts = [
  { reference: 'CBE-TX-990182', description: 'Escrow Release for Order #ORD-8910 (Sidama Coffee 2,000kg)', date: '2026-03-01', amount: 340000 },
  { reference: 'CBE-TX-984421', description: 'Escrow Release for Order #ORD-8854 (Teff Special 3,500kg)', date: '2026-02-22', amount: 380000 },
]
</script>
