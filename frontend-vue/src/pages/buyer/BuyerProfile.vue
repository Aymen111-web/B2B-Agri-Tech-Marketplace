<template>
  <div class="space-y-6 max-w-2xl">
    <h1 class="text-[20px] font-black text-[#1E2328]">Buyer Profile</h1>
    <div class="bg-white border border-[#E2E4E7] rounded-2xl p-6 space-y-4">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-[#1E9444] text-white flex items-center justify-center text-2xl font-bold">{{ user?.name?.[0] || 'U' }}</div>
        <div><h2 class="text-[18px] font-bold text-[#1E2328]">{{ user?.name }}</h2><p class="text-[13px] text-[#5A6270]">{{ user?.phone }}</p><p class="text-[12px] text-[#1E9444] font-bold">Commercial Buyer · {{ user?.region }}</p></div>
      </div>
      <div class="grid grid-cols-1 gap-3">
        <div class="bg-[#F8F9FA] p-4 rounded-xl"><span class="text-[11px] font-bold text-[#5A6270] block">Email</span><span class="text-[14px] font-semibold text-[#1E2328]">{{ user?.email }}</span></div>
        <div class="bg-[#F8F9FA] p-4 rounded-xl"><span class="text-[11px] font-bold text-[#5A6270] block">Account Status</span><span class="text-[14px] font-semibold text-[#1E9444] capitalize">{{ user?.status }}</span></div>
        <div class="bg-[#F8F9FA] p-4 rounded-xl"><span class="text-[11px] font-bold text-[#5A6270] block">Member Since</span><span class="text-[14px] font-semibold text-[#1E2328]">{{ formatDate(user?.createdAt || new Date()) }}</span></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'
import { formatDate } from '@/utils/helpers'
const { user } = useAuth()
</script>
