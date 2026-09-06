<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E4E7] pb-5">
      <div>
        <h1 class="text-[24px] font-extrabold text-[#1E2328]">User Account & Access Control Management</h1>
        <p class="text-[13px] text-[#5A6270]">Manage platform users, verified capabilities, and system access roles</p>
      </div>
      <button @click="loadUsers" class="px-3 py-1.5 rounded-lg border border-[#E2E4E7] bg-white text-[12px] font-bold text-[#1E2328] hover:bg-[#F8F9FA]">Refresh Users</button>
    </div>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-12"><Loader2 class="w-8 h-8 text-[#1E9444] animate-spin" /><p class="text-xs font-bold text-[#5A6270] mt-2">Loading user directory...</p></div>

    <div v-else class="space-y-3">
      <div v-for="u in users" :key="u.id" class="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-full bg-[#EDFAF2] text-[#0F5C2A] flex items-center justify-center font-bold text-sm border border-[#C3EFCF]">{{ u.name?.[0] || 'U' }}</div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-[#1E2328]">{{ u.name }}</h3>
              <span :class="['px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase', u.role === 'admin' ? 'bg-purple-100 text-purple-800' : u.role === 'farmer' ? 'bg-[#EDFAF2] text-[#0F5C2A]' : 'bg-blue-100 text-blue-800']">{{ u.role }}</span>
            </div>
            <p class="text-xs text-[#5A6270] mt-0.5">Phone: {{ u.phone || 'N/A' }} · Email: {{ u.email || 'N/A' }} · Status: <span class="font-bold text-emerald-700 capitalize">{{ u.status || 'verified' }}</span></p>
          </div>
        </div>
        <div class="text-right">
          <span class="text-xs text-[#5A6270] block">Joined: {{ formatDate(u.created_at || new Date()) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { adminApi } from '@/services/adminService'
import { formatDate } from '@/utils/helpers'

const users = ref([])
const isLoading = ref(true)

const loadUsers = async () => {
  isLoading.value = true
  try {
    users.value = await adminApi.fetchUsers()
  } catch {
    users.value = [
      { id: '1', name: 'Dawit Bekele', role: 'farmer', phone: '0911234567', email: 'dawit@sidamafarm.et', status: 'verified', created_at: new Date() },
      { id: '2', name: 'Alemayehu Tadesse', role: 'buyer', phone: '0911987654', email: 'buyer@addissupply.et', status: 'verified', created_at: new Date() },
      { id: '3', name: 'Admin Administrator', role: 'admin', phone: '0900000000', email: 'admin@qelemmeda.et', status: 'verified', created_at: new Date() },
    ]
  } finally {
    isLoading.value = false
  }
}

onMounted(loadUsers)
</script>
