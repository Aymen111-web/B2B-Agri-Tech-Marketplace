<template>
  <div class="w-full flex flex-col min-h-full pb-8 max-w-5xl mx-auto space-y-5">
    <div class="bg-gradient-to-r from-[#062E15] via-[#0F5C2A] to-[#0B57D0] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-[#E69500]/20 rounded-full blur-2xl pointer-events-none" />
      <div class="flex items-center gap-4 relative z-10">
        <div class="w-16 h-16 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-3xl font-black text-white shrink-0">
          {{ farmer?.name?.[0] || 'D' }}
        </div>
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-white tracking-tight">{{ farmer?.name || 'Dawit Bekele' }}</h1>
          <p class="text-xs text-[#C3EFCF] mt-0.5 font-medium flex items-center gap-1.5">
            <ShieldCheck class="w-4 h-4 text-[#E69500]" />
            <span>{{ farmer?.region || 'Not specified' }} Region Agricultural Member</span>
          </p>
        </div>
      </div>
    </div>

    <div class="bg-white border border-[#E2E4E7] rounded-2xl p-6 shadow-xs space-y-6">
      <h3 class="text-base font-black text-[#1E2328] border-b border-gray-100 pb-3">Producer Identity & Verification</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div class="bg-[#F8F9FA] p-4 rounded-xl border border-[#E2E4E7]"><span class="text-[#5A6270] font-bold block mb-1">Full Registered Name</span><span class="text-sm font-black text-[#1E2328]">{{ farmer?.name || farmer?.first_name || 'Loading...' }}</span></div>
        <div class="bg-[#F8F9FA] p-4 rounded-xl border border-[#E2E4E7]"><span class="text-[#5A6270] font-bold block mb-1">Mobile Phone (SMS Channel)</span><span class="text-sm font-black text-[#1E2328]">{{ farmer?.phone || 'Loading...' }}</span></div>
        <div class="bg-[#F8F9FA] p-4 rounded-xl border border-[#E2E4E7]"><span class="text-[#5A6270] font-bold block mb-1">Agricultural Region</span><span class="text-sm font-black text-[#1E9444]">{{ farmer?.region || 'Sidama Region, Hawassa Zuria' }}</span></div>
        <div class="bg-[#F8F9FA] p-4 rounded-xl border border-[#E2E4E7]"><span class="text-[#5A6270] font-bold block mb-1">Farm Size (Hectares)</span><span class="text-sm font-black text-[#1E2328]">{{ farmer?.farmSize ? farmer.farmSize + ' Hectares' : 'Not specified' }}</span></div>
        <div class="bg-[#F8F9FA] p-4 rounded-xl border border-[#E2E4E7]"><span class="text-[#5A6270] font-bold block mb-1">Primary Crops</span><span class="text-sm font-black text-[#1E2328]">{{ farmer?.crops?.join(', ') || 'Not specified' }}</span></div>
        <div class="bg-[#F8F9FA] p-4 rounded-xl border border-[#E2E4E7]"><span class="text-[#5A6270] font-bold block mb-1">Co-op Union Membership</span><span class="text-sm font-black text-[#0B57D0]">{{ farmer?.union || 'Independent Producer' }}</span></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ShieldCheck } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'

const { user } = useAuth()
const farmer = computed(() => user.value)
</script>
