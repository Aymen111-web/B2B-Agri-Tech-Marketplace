<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E4E7] pb-5">
      <div>
        <h1 class="text-[24px] font-extrabold text-[#1E2328]">Capability Application Verification Queue</h1>
        <p class="text-[13px] text-[#5A6270]">Review and verify producer & commercial buyer legal documentation</p>
      </div>
      <button @click="loadApplications" class="px-3 py-1.5 rounded-lg border border-[#E2E4E7] bg-white text-[12px] font-bold text-[#1E2328] hover:bg-[#F8F9FA]">Refresh Queue</button>
    </div>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-12"><Loader2 class="w-8 h-8 text-[#1E9444] animate-spin" /><p class="text-xs font-bold text-[#5A6270] mt-2">Loading applications...</p></div>

    <div v-else-if="applications.length === 0" class="text-center py-12 bg-white border border-[#E2E4E7] rounded-2xl p-8 space-y-2">
      <FileText class="w-12 h-12 text-[#1E9444] mx-auto opacity-40" />
      <h3 class="text-base font-bold text-[#1E2328]">Queue Empty</h3>
      <p class="text-xs text-[#5A6270]">No pending producer or buyer applications requiring inspection.</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="app in applications" :key="app.id" class="bg-white border border-[#E2E4E7] rounded-2xl p-5 shadow-xs space-y-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[#EDFAF2] text-[#0F5C2A] flex items-center justify-center font-bold border border-[#C3EFCF]">{{ app.user?.first_name?.[0] || 'U' }}</div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold text-[#1E2328]">{{ app.user?.first_name }} {{ app.user?.second_name }}</h3>
                <span :class="['px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase', app.capability_type === 'farmer' ? 'bg-[#EDFAF2] text-[#0F5C2A]' : 'bg-blue-50 text-blue-700']">{{ app.capability_type }}</span>
              </div>
              <p class="text-xs text-[#5A6270]">Phone: {{ app.user?.phone }} · Submitted: {{ formatDate(app.created_at) }}</p>
            </div>
          </div>
          <span :class="['px-3 py-1 rounded-full text-xs font-bold capitalize', app.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : app.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800']">{{ app.status }}</span>
        </div>

        <div v-if="app.supporting_documents && app.supporting_documents.length > 0" class="bg-[#F8F9FA] p-3.5 rounded-xl border border-[#E2E4E7] space-y-2 text-xs">
          <span class="font-bold text-[#1E2328]">Attached Documents:</span>
          <div class="flex flex-wrap gap-2">
            <span v-for="(doc, i) in app.supporting_documents" :key="i" class="px-3 py-1 rounded-lg bg-white border border-[#E2E4E7] font-semibold text-[#0B57D0] flex items-center gap-1.5"><FileText class="w-3.5 h-3.5" /> {{ doc }}</span>
          </div>
        </div>

        <div v-if="app.status === 'pending'" class="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button @click="handleReject(app.id)" class="px-4 py-2 rounded-xl border border-red-300 text-red-600 text-xs font-bold hover:bg-red-50">Reject</button>
          <button @click="handleApprove(app.id)" class="px-4 py-2 rounded-xl bg-[#1E9444] text-white text-xs font-bold hover:bg-[#0F5C2A] flex items-center gap-1 shadow-2xs"><Check class="w-4 h-4" /> Approve Capability</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { FileText, Check, Loader2 } from 'lucide-vue-next'
import { adminApi } from '@/services/adminService'
import { formatDate } from '@/utils/helpers'

const applications = ref([])
const isLoading = ref(true)

const loadApplications = async () => {
  isLoading.value = true
  try {
    applications.value = await adminApi.fetchApplications()
  } catch {
    applications.value = []
    alert('Failed to fetch applications from server.')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadApplications)

const handleApprove = async (id) => {
  await adminApi.approveApplication(id)
  loadApplications()
}

const handleReject = async (id) => {
  const reason = prompt('Rejection reason:')
  if (reason !== null) {
    await adminApi.rejectApplication(id, reason)
    loadApplications()
  }
}
</script>
