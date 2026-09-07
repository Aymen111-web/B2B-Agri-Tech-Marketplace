<template>
  <div class="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
    <!-- Header Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border-b border-[#E2E4E7] pb-6 relative">
      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-1.5">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E9444] to-[#0F5C2A] flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <FileText class="w-5 h-5 text-white" />
          </div>
          <h1 class="text-[28px] font-black text-[#1E2328] tracking-tight">Capabilities Verification Queue</h1>
        </div>
        <p class="text-[14px] font-medium text-[#5A6270] max-w-xl">
          Audit producer specifications, business TIN numbers, farm size, crops, and supporting verification files before granting capability access.
        </p>
      </div>
      <div class="flex items-center gap-3 z-10">
        <div class="flex items-center bg-white border border-[#E2E4E7] rounded-xl p-1 shadow-xs">
          <span class="px-3 py-1.5 text-[11px] font-black uppercase text-[#1E2328]">Pending Queue:</span>
          <span class="px-2.5 py-1 bg-[#F0F1F2] text-[#1E2328] rounded-lg text-xs font-bold">{{ applications.length }}</span>
        </div>
        <button @click="loadApplications" :disabled="isLoading" 
          class="px-4 py-2.5 rounded-xl border border-[#E2E4E7] bg-white text-[13px] font-bold text-[#1E2328] hover:bg-[#F8F9FA] hover:shadow-md transition-all active:scale-95 flex items-center gap-2 group cursor-pointer">
          <RefreshCcw :class="['w-4 h-4 text-[#5A6270] group-hover:text-[#1E9444] transition-colors', isLoading && 'animate-spin']" /> 
          Refresh
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <div class="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-4 relative overflow-hidden border border-[#E2E4E7]/50">
        <Loader2 class="w-8 h-8 text-[#1E9444] animate-spin relative z-10" />
      </div>
      <p class="text-xs font-black text-[#1E2328] uppercase tracking-wider mt-2">Syncing Verification Queue</p>
      <p class="text-[11px] text-[#9BA1AA] font-bold mt-1">Fetching submitted capability forms...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="applications.length === 0" class="text-center py-20 bg-white border border-[#E2E4E7] rounded-[24px] px-8 shadow-sm">
      <div class="w-20 h-20 mx-auto bg-[#F8F9FA] rounded-full flex items-center justify-center shadow-inner mb-4 border border-[#E2E4E7]">
        <CheckCircle class="w-10 h-10 text-[#5A6270] opacity-40" />
      </div>
      <h3 class="text-[18px] font-extrabold text-[#1E2328] tracking-tight">Queue is Empty</h3>
      <p class="text-[13px] font-medium text-[#5A6270] mt-1.5 max-w-sm mx-auto">
        All submitted producer and buyer capability forms have been reviewed and audited.
      </p>
    </div>

    <!-- Applications List -->
    <div v-else class="space-y-4">
      <article v-for="app in applications" :key="app.id" 
        class="bg-white border border-[#E2E4E7] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
        
        <!-- Applicant Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div class="flex items-center gap-3.5">
            <div :class="[
              'w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border shadow-sm shrink-0', 
              app.capability_type === 'farmer' ? 'bg-emerald-50 text-[#0F5C2A] border-[#C3EFCF]' : 'bg-blue-50 text-blue-800 border-blue-200'
            ]">
              {{ app.user?.first_name?.[0] || app.user?.name?.[0] || 'U' }}
            </div>

            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-[16px] font-black text-[#1E2328]">
                  {{ getApplicantName(app) }}
                </h3>
                <span :class="[
                  'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider', 
                  app.capability_type === 'farmer' ? 'bg-[#EDFAF2] text-[#0F5C2A] border border-[#C3EFCF]' : 'bg-blue-50 text-blue-700 border border-blue-200'
                ]">
                  {{ app.capability_type === 'farmer' ? '🌾 Farmer Producer Request' : '🏢 Commercial Buyer Request' }}
                </span>
              </div>

              <div class="flex items-center gap-4 mt-1 text-xs text-[#5A6270] font-semibold flex-wrap">
                <span class="flex items-center gap-1"><Phone class="w-3.5 h-3.5 text-[#1E9444]" /> {{ app.user?.phone || 'No phone' }}</span>
                <span>•</span>
                <span class="flex items-center gap-1"><Calendar class="w-3.5 h-3.5 text-gray-400" /> Submitted: {{ formatDate(app.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Status or Actions -->
          <div class="flex items-center gap-2 self-end sm:self-center">
            <template v-if="app.status === 'pending'">
              <button @click="openDetailModal(app)" 
                class="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1E2328] text-xs font-extrabold transition-colors flex items-center gap-1.5 cursor-pointer">
                <Eye class="w-3.5 h-3.5" />
                <span>Audit Specifications</span>
              </button>
              <button @click="handleReject(app.id)" 
                class="px-4 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-extrabold transition-colors cursor-pointer">
                Reject
              </button>
              <button @click="handleApprove(app.id)" 
                class="px-4 py-2 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white text-xs font-black transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer">
                <Check class="w-4 h-4" />
                <span>Approve</span>
              </button>
            </template>
            <template v-else>
              <span :class="[
                'px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5',
                app.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              ]">
                <CheckCircle2 v-if="app.status === 'approved'" class="w-3.5 h-3.5" />
                <XCircle v-else class="w-3.5 h-3.5" />
                <span>{{ app.status }}</span>
              </span>
            </template>
          </div>
        </div>

        <!-- Form Details Grid (Rendered directly on card) -->
        <div class="bg-[#F8F9FA] border border-[#E2E4E7] rounded-2xl p-4 text-xs space-y-3">
          <div class="flex items-center justify-between border-b border-gray-200/60 pb-2">
            <span class="font-extrabold text-[#1E2328] uppercase text-[11px] tracking-wider flex items-center gap-1.5">
              <Building2 v-if="app.capability_type === 'buyer'" class="w-3.5 h-3.5 text-[#0B57D0]" />
              <Sprout v-else class="w-3.5 h-3.5 text-[#1E9444]" />
              <span>Submitted Capability Specifications</span>
            </span>
            <button @click="openDetailModal(app)" class="text-[#0B57D0] font-extrabold hover:underline text-[11px] cursor-pointer">
              Full Detail View &rarr;
            </button>
          </div>

          <!-- Farmer Specs -->
          <div v-if="app.capability_type === 'farmer'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="bg-white p-3 rounded-xl border border-gray-200">
              <span class="text-gray-500 font-bold block text-[10px] uppercase">Farm Size</span>
              <span class="font-black text-[#1E2328] text-sm">{{ getAppValue(app, 'farm_size', 'farmSize') ? getAppValue(app, 'farm_size', 'farmSize') + ' Hectares' : '10 Hectares' }}</span>
            </div>
            <div class="bg-white p-3 rounded-xl border border-gray-200">
              <span class="text-gray-500 font-bold block text-[10px] uppercase">Primary Crops</span>
              <span class="font-black text-[#1E9444] text-xs block truncate">{{ getAppValue(app, 'primary_crops', 'primaryCrops') || 'Coffee, Teff, Sesame' }}</span>
            </div>
            <div class="bg-white p-3 rounded-xl border border-gray-200">
              <span class="text-gray-500 font-bold block text-[10px] uppercase">Region / Location</span>
              <span class="font-bold text-[#1E2328] text-xs block truncate">{{ getAppValue(app, 'region') || app.user?.region || 'Addis Ababa' }}</span>
            </div>
            <div class="bg-white p-3 rounded-xl border border-gray-200">
              <span class="text-gray-500 font-bold block text-[10px] uppercase">Co-op Union / Farm</span>
              <span class="font-bold text-[#0B57D0] text-xs block truncate">{{ getAppValue(app, 'union_name', 'unionName') || 'Independent Farm' }}</span>
            </div>
          </div>

          <!-- Buyer Specs -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="bg-white p-3 rounded-xl border border-gray-200">
              <span class="text-gray-500 font-bold block text-[10px] uppercase">Business Name</span>
              <span class="font-black text-[#1E2328] text-xs block truncate">{{ getAppValue(app, 'company_name', 'companyName') || 'Not specified' }}</span>
            </div>
            <div class="bg-white p-3 rounded-xl border border-gray-200">
              <span class="text-gray-500 font-bold block text-[10px] uppercase">Business Type</span>
              <span class="font-bold text-[#0B57D0] text-xs capitalize block truncate">{{ getAppValue(app, 'business_type', 'businessType') || 'Wholesaler' }}</span>
            </div>
            <div class="bg-white p-3 rounded-xl border border-gray-200">
              <span class="text-gray-500 font-bold block text-[10px] uppercase">TIN Number</span>
              <span class="font-mono font-bold text-[#1E2328] text-xs block truncate">{{ getAppValue(app, 'tin_number', 'tinNumber') || 'Not specified' }}</span>
            </div>
            <div class="bg-white p-3 rounded-xl border border-gray-200">
              <span class="text-gray-500 font-bold block text-[10px] uppercase">Operating Region</span>
              <span class="font-bold text-[#1E2328] text-xs block truncate">{{ getAppValue(app, 'region') || 'Addis Ababa' }}</span>
            </div>
          </div>

          <!-- Supporting Documents Section -->
          <div class="pt-2 border-t border-gray-200/60 flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <Paperclip class="w-3.5 h-3.5 text-[#1E9444]" />
              <span class="font-extrabold text-[#1E2328] text-[11px]">Supporting Verification Documents:</span>
            </div>
            
            <div v-if="getDocsList(app).length > 0" class="flex items-center gap-2 flex-wrap">
              <a v-for="(doc, i) in getDocsList(app)" :key="i" :href="doc" target="_blank"
                class="px-3 py-1 rounded-lg bg-emerald-50 text-[#0F5C2A] border border-[#C3EFCF] hover:bg-emerald-100 text-[11px] font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs">
                <FileText class="w-3.5 h-3.5 text-[#1E9444]" />
                <span>{{ doc }}</span>
              </a>
            </div>
            <span v-else class="text-[11px] text-gray-500 font-bold italic">No document attached</span>
          </div>
        </div>
      </article>
    </div>

    <!-- SPECIFICATIONS AUDIT MODAL -->
    <div v-if="selectedApp" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="max-w-lg w-full bg-white rounded-3xl p-6 shadow-2xl space-y-5 text-[#1E2328] border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div :class="[
              'p-2.5 rounded-xl text-white font-bold',
              selectedApp.capability_type === 'farmer' ? 'bg-[#1E9444]' : 'bg-[#0B57D0]'
            ]">
              <Sprout v-if="selectedApp.capability_type === 'farmer'" class="w-5 h-5" />
              <Building2 v-else class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-black text-[#1E2328]">
                Audit {{ selectedApp.capability_type === 'farmer' ? 'Farmer Producer' : 'Commercial Buyer' }} Application
              </h3>
              <p class="text-[11px] text-[#5A6270]">Applicant: {{ getApplicantName(selectedApp) }} ({{ selectedApp.user?.phone }})</p>
            </div>
          </div>
          <button @click="selectedApp = null" class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Specifications Breakdown -->
        <div class="space-y-3 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-200">
          <h4 class="font-black text-[#1E2328] uppercase text-[11px] tracking-wider border-b pb-2 border-gray-200">
            Form Field Inputs Submitted by Applicant
          </h4>

          <template v-if="selectedApp.capability_type === 'farmer'">
            <div class="flex justify-between py-1.5 border-b border-gray-200/60">
              <span class="text-gray-600 font-bold">Farm Size (in Hectares):</span>
              <span class="font-black text-[#1E2328]">{{ getAppValue(selectedApp, 'farm_size', 'farmSize') ? getAppValue(selectedApp, 'farm_size', 'farmSize') + ' Hectares' : '10 Hectares' }}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-gray-200/60">
              <span class="text-gray-600 font-bold">Primary Crops Produced:</span>
              <span class="font-black text-[#1E9444]">{{ getAppValue(selectedApp, 'primary_crops', 'primaryCrops') || 'Coffee, Teff, Sesame' }}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-gray-200/60">
              <span class="text-gray-600 font-bold">Farming Region / Location:</span>
              <span class="font-bold text-[#1E2328]">{{ getAppValue(selectedApp, 'region') || selectedApp.user?.region || 'Addis Ababa' }}</span>
            </div>
            <div class="flex justify-between py-1.5">
              <span class="text-gray-600 font-bold">Co-op Union / Farm Name:</span>
              <span class="font-bold text-[#0B57D0]">{{ getAppValue(selectedApp, 'union_name', 'unionName') || 'Independent Producer' }}</span>
            </div>
          </template>

          <template v-else>
            <div class="flex justify-between py-1.5 border-b border-gray-200/60">
              <span class="text-gray-600 font-bold">Company / Business Name:</span>
              <span class="font-black text-[#1E2328]">{{ getAppValue(selectedApp, 'company_name', 'companyName') || 'Not specified' }}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-gray-200/60">
              <span class="text-gray-600 font-bold">Business Type:</span>
              <span class="font-bold text-[#0B57D0] capitalize">{{ getAppValue(selectedApp, 'business_type', 'businessType') || 'Wholesaler' }}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-gray-200/60">
              <span class="text-gray-600 font-bold">Tax Identification (TIN):</span>
              <span class="font-mono font-bold text-[#1E2328]">{{ getAppValue(selectedApp, 'tin_number', 'tinNumber') || 'Not specified' }}</span>
            </div>
            <div class="flex justify-between py-1.5">
              <span class="text-gray-600 font-bold">Operating Region / City:</span>
              <span class="font-bold text-[#1E2328]">{{ getAppValue(selectedApp, 'region') || 'Addis Ababa' }}</span>
            </div>
          </template>
        </div>

        <!-- Documents Section -->
        <div class="space-y-2 text-xs">
          <span class="font-extrabold text-[#1E2328] block">Attached Legal / Verification Documents:</span>
          <div v-if="getDocsList(selectedApp).length > 0" class="space-y-2">
            <div v-for="(doc, i) in getDocsList(selectedApp)" :key="i" class="p-3 bg-emerald-50 border border-[#C3EFCF] rounded-xl flex items-center justify-between">
              <div class="flex items-center gap-2 text-[#0F5C2A] font-bold">
                <FileText class="w-4 h-4 text-[#1E9444]" />
                <span>{{ doc }}</span>
              </div>
              <span class="px-2 py-0.5 bg-[#1E9444] text-white rounded text-[10px] font-black">Attached</span>
            </div>
          </div>
          <div v-else class="p-3 bg-gray-100 rounded-xl text-gray-500 font-bold italic text-center">
            No document attached with this application.
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="flex gap-2.5 pt-3 border-t border-gray-100">
          <button @click="handleReject(selectedApp.id); selectedApp = null" 
            class="flex-1 py-2.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold text-xs transition-colors cursor-pointer">
            Reject Application
          </button>
          <button @click="handleApprove(selectedApp.id); selectedApp = null" 
            class="flex-1 py-2.5 bg-[#1E9444] hover:bg-[#0F5C2A] text-white rounded-xl font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
            <Check class="w-4 h-4" />
            <span>Approve Capability</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  FileText, Check, Loader2, Phone, Calendar, Paperclip, CheckCircle, 
  RefreshCcw, CheckCircle2, XCircle, Eye, Building2, Sprout, X 
} from 'lucide-vue-next'
import { adminApi } from '@/services/adminService'
import { formatDate } from '@/utils/helpers'

const applications = ref([])
const isLoading = ref(true)
const selectedApp = ref(null)

const loadApplications = async () => {
  isLoading.value = true
  try {
    const res = await adminApi.fetchApplications()
    applications.value = res.data || res
  } catch (err) {
    applications.value = []
    alert(err.message || 'Failed to fetch applications from server.')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadApplications)

const getApplicantName = (app) => {
  const first = app.user?.first_name || ''
  const second = app.user?.second_name || ''
  const name = app.user?.name || ''
  return `${first} ${second}`.trim() || name || 'Applicant User'
}

const getAppValue = (app, key1, key2) => {
  const docs = app.supporting_documents
  if (docs && typeof docs === 'object' && !Array.isArray(docs)) {
    if (docs[key1] !== undefined) return docs[key1]
    if (key2 && docs[key2] !== undefined) return docs[key2]
    if (docs.application_data && typeof docs.application_data === 'object') {
      if (docs.application_data[key1] !== undefined) return docs.application_data[key1]
      if (key2 && docs.application_data[key2] !== undefined) return docs.application_data[key2]
    }
  }
  return null
}

const getDocsList = (app) => {
  const docs = app.supporting_documents
  if (Array.isArray(docs)) return docs
  if (docs && typeof docs === 'object') {
    if (Array.isArray(docs.files)) return docs.files
  }
  return []
}

const openDetailModal = (app) => {
  selectedApp.value = app
}

const handleApprove = async (id) => {
  try {
    await adminApi.approveApplication(id)
    loadApplications()
  } catch (err) {
    alert(err.message || 'Failed to approve application')
  }
}

const handleReject = async (id) => {
  const reason = prompt('Please enter the reason for rejection (this will be displayed to the applicant):')
  if (reason !== null && reason.trim()) {
    try {
      await adminApi.rejectApplication(id, reason.trim())
      loadApplications()
    } catch (err) {
      alert(err.message || 'Failed to reject application')
    }
  }
}
</script>
