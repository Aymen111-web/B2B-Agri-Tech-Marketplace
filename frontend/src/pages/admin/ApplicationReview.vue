<template>
  <div class="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border-b border-[#E2E4E7] pb-6 relative">
      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-1.5">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E9444] to-[#0F5C2A] flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <FileText class="w-5 h-5 text-white" />
          </div>
          <h1 class="text-[28px] font-black text-[#1E2328] tracking-tight">Capabilities Queue</h1>
        </div>
        <p class="text-[14px] font-medium text-[#5A6270] max-w-xl">
          Review, approve, or reject producer and commercial buyer identity and legal documentation requests.
        </p>
      </div>
      <div class="flex items-center gap-3 z-10">
        <div class="flex items-center bg-white border border-[#E2E4E7] rounded-xl p-1 shadow-xs">
          <span class="px-3 py-1.5 text-[11px] font-black uppercase text-[#1E2328]">Total Pending:</span>
          <span class="px-2.5 py-1 bg-[#F0F1F2] text-[#1E2328] rounded-lg text-xs font-bold">{{ applications.length }}</span>
        </div>
        <button @click="loadApplications" :disabled="isLoading" 
          class="px-4 py-2.5 rounded-xl border border-[#E2E4E7] bg-white text-[13px] font-bold text-[#1E2328] hover:bg-[#F8F9FA] hover:shadow-md transition-all active:scale-95 flex items-center gap-2 group">
          <RefreshCcw :class="['w-4 h-4 text-[#5A6270] group-hover:text-[#1E9444] transition-colors', isLoading && 'animate-spin']" /> 
          Refresh
        </button>
      </div>
      <div class="absolute right-0 top-0 w-64 h-32 bg-emerald-50 rounded-full blur-[80px] -z-0 opacity-60"></div>
    </div>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <div class="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-4 relative overflow-hidden border border-[#E2E4E7]/50">
        <div class="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-transparent opacity-50"></div>
        <Loader2 class="w-8 h-8 text-[#1E9444] animate-spin relative z-10" />
      </div>
      <p class="text-xs font-black text-[#1E2328] uppercase tracking-wider mt-2">Syncing Verification Queue</p>
      <p class="text-[11px] text-[#9BA1AA] font-bold mt-1">Fetching latest capability requests...</p>
    </div>

    <div v-else-if="applications.length === 0" class="text-center py-20 bg-white border border-[#E2E4E7] rounded-[24px] px-8 shadow-sm relative overflow-hidden group">
      <div class="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-50 z-0 transition-opacity group-hover:opacity-100"></div>
      <div class="relative z-10">
        <div class="w-20 h-20 mx-auto bg-[#F8F9FA] rounded-full flex items-center justify-center shadow-inner mb-4 border border-[#E2E4E7]">
          <CheckCircle class="w-10 h-10 text-[#5A6270] opacity-40" />
        </div>
        <h3 class="text-[18px] font-extrabold text-[#1E2328] tracking-tight">Queue is Empty</h3>
        <p class="text-[13px] font-medium text-[#5A6270] mt-1.5 max-w-sm mx-auto">
          All pending producer and buyer capability applications have been processed and fully audited.
        </p>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-5 relative z-10">
      <article v-for="app in applications" :key="app.id" 
        class="bg-white border md:border-[#E2E4E7] lg:border-transparent lg:border-b lg:border-b-[#E2E4E7] lg:rounded-none rounded-2xl p-5 lg:p-6 shadow-sm lg:shadow-none hover:shadow-xl lg:hover:bg-[#F8F9FA] transition-all group lg:flex lg:items-start lg:justify-between lg:gap-8">
        
        <div class="flex items-start gap-4 lg:gap-5 lg:w-[45%]">
          <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border shadow-sm shrink-0', 
            app.capability_type === 'farmer' ? 'bg-gradient-to-br from-[#EDFAF2] to-emerald-100 text-[#0F5C2A] border-[#C3EFCF]' : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-800 border-blue-200']">
            {{ app.user?.first_name?.[0] || app.user?.name?.[0] || 'U' }}
          </div>
          
          <div>
            <div class="flex sm:items-center flex-col sm:flex-row gap-2">
              <h3 class="text-[17px] font-extrabold text-[#1E2328] group-hover:text-emerald-700 transition-colors">
                {{ app.user?.first_name }} {{ app.user?.second_name }} {{ app.user?.name }}
              </h3>
              <span :class="['inline-flex w-fit px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-2xs', 
                app.capability_type === 'farmer' ? 'bg-[#EDFAF2] text-[#0F5C2A] border border-[#C3EFCF]' : 'bg-blue-50 text-blue-700 border border-blue-200']">
                {{ app.capability_type }} Request
              </span>
            </div>
            
            <div class="flex items-center gap-4 mt-2 text-[12px] font-semibold text-[#5A6270]">
              <span class="flex items-center gap-1.5"><Phone class="w-3.5 h-3.5 opacity-60" /> {{ app.user?.phone || 'No phone' }}</span>
              <span class="flex items-center gap-1.5"><Calendar class="w-3.5 h-3.5 opacity-60" /> {{ formatDate(app.created_at) }}</span>
            </div>
          </div>
        </div>

        <div class="mt-4 lg:mt-0 lg:w-[25%]">
          <div v-if="app.supporting_documents && app.supporting_documents.length > 0">
            <p class="text-[10px] font-black uppercase tracking-wider text-[#9BA1AA] mb-2">Attached Legal Documents</p>
            <div class="flex flex-wrap gap-2">
              <a v-for="(doc, i) in app.supporting_documents" :key="i" :href="doc" target="_blank"
                class="px-2.5 py-1.5 rounded-lg bg-[#F0F1F2] hover:bg-blue-50 hover:text-blue-700 border border-transparent hover:border-blue-200 text-[#1E2328] font-bold text-[11px] flex items-center gap-1.5 transition-colors max-w-full truncate shadow-2xs">
                <Paperclip class="w-3 h-3 shrink-0" /> <span class="truncate">Doc {{ i+1 }}</span>
              </a>
            </div>
          </div>
          <div v-else class="text-[11px] font-bold text-[#9BA1AA] italic">No documents attached</div>
        </div>

        <div class="mt-5 pt-5 border-t border-[#E2E4E7] lg:border-t-0 lg:mt-0 lg:pt-0 lg:w-[30%] flex flex-col lg:items-end justify-center">
          <span v-if="app.status !== 'pending'" :class="['inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider', 
            app.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700']">
            <CheckCircle2 v-if="app.status === 'approved'" class="w-3.5 h-3.5" />
            <XCircle v-else class="w-3.5 h-3.5" />
            {{ app.status }}
          </span>
          <div v-if="app.status === 'pending'" class="flex items-center gap-2 lg:justify-end w-full">
            <button @click="handleReject(app.id)" class="flex-1 lg:flex-none px-4 py-2.5 rounded-xl border-2 border-red-100 bg-white text-red-600 text-[12px] font-bold hover:bg-red-50 hover:border-red-200 transition-all focus:ring-4 focus:ring-red-100 active:scale-95">
              Reject
            </button>
            <button @click="handleApprove(app.id)" class="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-[#1E9444] text-white text-[12px] font-bold hover:bg-[#0F5C2A] transition-all shadow-md shadow-emerald-500/20 active:scale-95 focus:ring-4 focus:ring-emerald-100 flex items-center justify-center gap-1.5">
              <Check class="w-4 h-4" /> Approve
            </button>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { FileText, Check, Loader2, Phone, Calendar, Paperclip, CheckCircle, RefreshCcw, CheckCircle2, XCircle } from 'lucide-vue-next'
import { adminApi } from '@/services/adminService'
import { formatDate } from '@/utils/helpers'

const applications = ref([])
const isLoading = ref(true)

const loadApplications = async () => {
  isLoading.value = true
  try {
    const res = await adminApi.fetchApplications()
    // Gracefully handle paginated response wrappers vs flat arrays
    applications.value = res.data || res
  } catch (err) {
    applications.value = []
    alert(err.message || 'Failed to fetch applications from server.')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadApplications)

const handleApprove = async (id) => {
  try {
    await adminApi.approveApplication(id)
    loadApplications()
  } catch (err) {
    alert(err.message || 'Failed to approve application')
  }
}

const handleReject = async (id) => {
  const reason = prompt('Rejection reason (Please be clear for the applicant):')
  if (reason !== null) {
    try {
      await adminApi.rejectApplication(id, reason)
      loadApplications()
    } catch (err) {
      alert(err.message || 'Failed to reject application')
    }
  }
}
</script>
