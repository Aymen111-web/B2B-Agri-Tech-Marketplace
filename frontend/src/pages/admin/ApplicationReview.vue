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
          Review, approve, or reject producer and commercial buyer identity and legal documentation requests.
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
      <p class="text-[11px] text-[#9BA1AA] font-bold mt-1">Fetching submitted capability applications...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="applications.length === 0" class="text-center py-20 bg-white border border-[#E2E4E7] rounded-[24px] px-8 shadow-sm">
      <div class="w-20 h-20 mx-auto bg-[#F8F9FA] rounded-full flex items-center justify-center shadow-inner mb-4 border border-[#E2E4E7]">
        <CheckCircle class="w-10 h-10 text-[#5A6270] opacity-40" />
      </div>
      <h3 class="text-[18px] font-extrabold text-[#1E2328] tracking-tight">Queue is Empty</h3>
      <p class="text-[13px] font-medium text-[#5A6270] mt-1.5 max-w-sm mx-auto">
        All submitted producer and buyer capability applications have been reviewed.
      </p>
    </div>

    <!-- Clean Single-Row Applications List -->
    <div v-else class="space-y-3">
      <article v-for="app in applications" :key="app.id" 
        class="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <!-- One-Row Applicant Meta (Name, Capability Badge, Phone, Date) -->
        <div class="flex items-center gap-3.5 flex-1 flex-wrap min-w-0">
          <div :class="[
            'w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border shadow-xs shrink-0', 
            app.capability_type === 'farmer' ? 'bg-emerald-50 text-[#0F5C2A] border-[#C3EFCF]' : 'bg-blue-50 text-blue-800 border-blue-200'
          ]">
            {{ app.user?.first_name?.[0] || app.user?.name?.[0] || 'U' }}
          </div>

          <div class="flex items-center gap-2.5 flex-wrap">
            <h3 class="text-[15px] font-extrabold text-[#1E2328] truncate">
              {{ getApplicantName(app) }}
            </h3>

            <span :class="[
              'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0', 
              app.capability_type === 'farmer' ? 'bg-[#EDFAF2] text-[#0F5C2A] border border-[#C3EFCF]' : 'bg-blue-50 text-blue-700 border border-blue-200'
            ]">
              {{ app.capability_type === 'farmer' ? '🌾 Farmer Producer Request' : '🏢 Commercial Buyer Request' }}
            </span>

            <span class="text-gray-300 hidden md:inline">•</span>

            <span class="text-xs text-[#5A6270] font-semibold flex items-center gap-1 shrink-0">
              <Phone class="w-3.5 h-3.5 text-[#1E9444]" />
              <span>{{ app.user?.phone || 'No phone' }}</span>
            </span>

            <span class="text-gray-300 hidden md:inline">•</span>

            <span class="text-xs text-[#5A6270] font-semibold flex items-center gap-1 shrink-0">
              <Calendar class="w-3.5 h-3.5 text-gray-400" />
              <span>Submitted: {{ formatDate(app.created_at) }}</span>
            </span>

            <template v-if="getDocsList(app).length > 0">
              <span class="text-gray-300 hidden md:inline">•</span>
              <span class="text-xs font-semibold flex items-center gap-1 shrink-0">
                <Paperclip class="w-3.5 h-3.5 text-[#0B57D0]" />
                <button 
                  @click.stop="openDoc(getDocsList(app)[0], app)" 
                  class="text-[#0B57D0] hover:text-[#0842A0] font-extrabold flex items-center gap-1 cursor-pointer bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 transition-colors hover:bg-blue-100"
                  title="Click to view attached document in new window"
                >
                  <span>{{ getDocName(getDocsList(app)[0]) }}</span>
                  <ExternalLink class="w-3 h-3" />
                </button>
              </span>
            </template>
          </div>
        </div>

        <!-- Action Buttons (Audit Specifications, Reject, Approve) -->
        <div class="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <template v-if="app.status === 'pending'">
            <button @click="openDetailModal(app)" 
              class="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1E2328] text-xs font-extrabold transition-colors flex items-center gap-1.5 cursor-pointer border border-gray-200">
              <Eye class="w-3.5 h-3.5 text-[#0B57D0]" />
              <span>Audit Specifications</span>
            </button>
            <button @click="openRejectModal(app)" 
              class="px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-extrabold transition-colors cursor-pointer">
              Reject
            </button>
            <button @click="handleApprove(app.id)" 
              class="px-4 py-2 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white text-xs font-black transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer">
              <Check class="w-4 h-4" />
              <span>Approve</span>
            </button>
          </template>
          <template v-else>
            <button @click="openDetailModal(app)" 
              class="px-3.5 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-[#1E2328] text-xs font-bold transition-colors flex items-center gap-1 border border-gray-200 cursor-pointer">
              <Eye class="w-3.5 h-3.5 text-gray-500" />
              <span>View Audit</span>
            </button>
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
              <p class="text-[11px] text-[#5A6270]">Applicant: <strong>{{ getApplicantName(selectedApp) }}</strong> ({{ selectedApp.user?.phone || 'No phone' }})</p>
            </div>
          </div>
          <button @click="selectedApp = null" class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Specifications Breakdown -->
        <div class="space-y-3 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-200">
          <h4 class="font-black text-[#1E2328] uppercase text-[11px] tracking-wider border-b pb-2 border-gray-200 flex items-center justify-between">
            <span>Submitted Capability Specifications</span>
            <span class="text-[#0B57D0] capitalize">{{ selectedApp.capability_type }}</span>
          </h4>

          <template v-if="selectedApp.capability_type === 'farmer'">
            <div class="flex justify-between py-2 border-b border-gray-200/60">
              <span class="text-gray-600 font-bold">Farm Size (in Hectares):</span>
              <span class="font-black text-[#1E2328] text-sm">{{ getAppValue(selectedApp, 'farm_size', 'farmSize') ? getAppValue(selectedApp, 'farm_size', 'farmSize') + ' Hectares' : '10 Hectares' }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200/60">
              <span class="text-gray-600 font-bold">Primary Crops Produced:</span>
              <span class="font-black text-[#1E9444]">{{ getAppValue(selectedApp, 'primary_crops', 'primaryCrops') || 'Coffee, Teff, Sesame' }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200/60">
              <span class="text-gray-600 font-bold">Farming Region / Location:</span>
              <span class="font-bold text-[#1E2328]">{{ getAppValue(selectedApp, 'region') || selectedApp.user?.region || 'Addis Ababa' }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-gray-600 font-bold">Co-op Union / Farm Name:</span>
              <span class="font-bold text-[#0B57D0]">{{ getAppValue(selectedApp, 'union_name', 'unionName') || 'Independent Producer' }}</span>
            </div>
          </template>

          <template v-else>
            <div class="flex justify-between py-2 border-b border-gray-200/60">
              <span class="text-gray-600 font-bold">Company / Business Name:</span>
              <span class="font-black text-[#1E2328]">{{ getAppValue(selectedApp, 'company_name', 'companyName') || 'Not specified' }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200/60">
              <span class="text-gray-600 font-bold">Business Type:</span>
              <span class="font-bold text-[#0B57D0] capitalize">{{ getAppValue(selectedApp, 'business_type', 'businessType') || 'Wholesaler' }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200/60">
              <span class="text-gray-600 font-bold">Tax Identification (TIN):</span>
              <span class="font-mono font-bold text-[#1E2328]">{{ getAppValue(selectedApp, 'tin_number', 'tinNumber') || 'Not specified' }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-gray-600 font-bold">Operating Region / City:</span>
              <span class="font-bold text-[#1E2328]">{{ getAppValue(selectedApp, 'region') || 'Addis Ababa' }}</span>
            </div>
          </template>
        </div>

        <!-- Attached Verification Documents Section -->
        <div class="space-y-2 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-extrabold text-[#1E2328]">Attached Legal / Verification Documents:</span>
            <span v-if="getDocsList(selectedApp).length > 0" class="text-[10px] text-gray-500 font-bold">Click file to view</span>
          </div>
          <div v-if="getDocsList(selectedApp).length > 0" class="space-y-2">
            <div 
              v-for="(doc, i) in getDocsList(selectedApp)" 
              :key="i" 
              @click="openDoc(doc, selectedApp)"
              class="p-3 bg-emerald-50 hover:bg-emerald-100/90 border border-[#C3EFCF] rounded-xl flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
            >
              <div class="flex items-center gap-2 text-[#0F5C2A] font-bold min-w-0">
                <FileText class="w-4.5 h-4.5 text-[#1E9444] shrink-0" />
                <span class="font-mono text-xs truncate group-hover:underline">{{ getDocName(doc) }}</span>
              </div>
              <span class="px-2.5 py-1 bg-[#1E9444] group-hover:bg-[#0F5C2A] text-white rounded-lg text-[10px] font-black flex items-center gap-1 shadow-2xs transition-colors shrink-0">
                <ExternalLink class="w-3 h-3" />
                <span>Open Attached File</span>
              </span>
            </div>
          </div>
          <div v-else class="p-3 bg-gray-100 rounded-xl text-gray-500 font-bold italic text-center">
            No document attached with this application.
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="flex gap-2.5 pt-3 border-t border-gray-100">
          <button @click="openRejectModal(selectedApp); selectedApp = null" 
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

    <!-- REJECTION REASON POPUP MODAL CARD -->
    <div v-if="rejectingApp" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-[#1E2328] border border-red-100 animate-in fade-in zoom-in-95 duration-150">
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="p-2 bg-red-50 text-red-600 rounded-xl">
              <AlertCircle class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-black text-[#1E2328]">Reject Capability Application</h3>
              <p class="text-[11px] text-[#5A6270]">Applicant: {{ getApplicantName(rejectingApp) }}</p>
            </div>
          </div>
          <button @click="rejectingApp = null" class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <label class="block font-extrabold text-[#1E2328]">
            Reason for Rejection <span class="text-red-600">*</span>
          </label>
          <p class="text-[11px] text-gray-500">
            This exact explanation will be displayed to the applicant on their capability status card.
          </p>

          <textarea 
            v-model="rejectionReasonInput" 
            rows="3" 
            placeholder="Enter clear rejection reason (e.g. Land certificate is missing or farm size details require verification)..." 
            class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-xs focus:outline-none focus:border-red-500 focus:bg-white transition-all"
          />

          <!-- Quick Suggestion Badges -->
          <div class="space-y-1.5">
            <span class="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Quick Reasons:</span>
            <div class="flex flex-wrap gap-1.5">
              <button 
                type="button"
                v-for="preset in presetReasons" 
                :key="preset" 
                @click="rejectionReasonInput = preset"
                class="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-[10px] font-extrabold transition-colors cursor-pointer text-left"
              >
                {{ preset }}
              </button>
            </div>
          </div>

          <div v-if="rejectError" class="p-2.5 bg-red-100 text-red-800 text-[11px] font-bold rounded-lg flex items-center gap-1.5">
            <AlertCircle class="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>{{ rejectError }}</span>
          </div>
          <div v-else class="text-[11px] font-bold text-[#9BA1AA] italic">No documents attached</div>
        </div>

        <!-- Modal Actions -->
        <div class="flex gap-2.5 pt-2 border-t border-gray-100">
          <button @click="rejectingApp = null" class="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-xs text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button @click="confirmReject" :disabled="isSubmittingReject"
            class="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer">
            <Loader2 v-if="isSubmittingReject" class="w-4 h-4 animate-spin" />
            <span>Confirm Rejection</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  FileText, Check, Loader2, Phone, Calendar, CheckCircle, 
  RefreshCcw, CheckCircle2, XCircle, Eye, Building2, Sprout, X, AlertCircle,
  Paperclip, ExternalLink
} from 'lucide-vue-next'
import { adminApi } from '@/services/adminService'
import { formatDate } from '@/utils/helpers'

const applications = ref([])
const isLoading = ref(true)
const selectedApp = ref(null)

const rejectingApp = ref(null)
const rejectionReasonInput = ref('')
const rejectError = ref('')
const isSubmittingReject = ref(false)

const presetReasons = [
  'Attached verification document is missing or unreadable.',
  'Farm size and primary crop details require further clarification.',
  'Tax identification (TIN) or business registration could not be verified.',
  'Duplicate or incomplete capability application request.'
]

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

const getDocName = (doc) => {
  if (!doc) return 'Attached Document'
  if (typeof doc === 'object') {
    if (doc.name) return doc.name
    if (doc.url) return getDocName(doc.url)
  }
  if (typeof doc === 'string') {
    if (doc.startsWith('data:')) {
      const mime = doc.split(';')[0].split(':')[1] || ''
      const ext = mime.split('/')[1] || 'file'
      return `attached_document.${ext}`
    }
    const clean = doc.split('?')[0]
    const parts = clean.split('/')
    return parts[parts.length - 1] || 'Attached Document'
  }
  return 'Attached Document'
}

const getDocUrl = (doc) => {
  if (!doc) return '#'
  let target = doc
  if (typeof doc === 'object') {
    target = doc.url || doc.path || doc.name || '#'
  }
  if (typeof target !== 'string') return '#'

  if (target.startsWith('data:') || target.startsWith('blob:') || target.startsWith('http://') || target.startsWith('https://')) {
    return target
  }

  if (target.startsWith('/')) {
    return `http://127.0.0.1:8000${target}`
  }
  if (target.startsWith('documents/') || target.startsWith('uploads/') || target.startsWith('storage/')) {
    return `http://127.0.0.1:8000/storage/${target.replace(/^storage\//, '')}`
  }

  return `http://127.0.0.1:8000/storage/${target}`
}

const openDoc = (doc, app = null) => {
  const url = getDocUrl(doc)
  const docName = getDocName(doc)

  if (!url || url === '#') {
    alert('Document file URL is not available.')
    return
  }

  // Base64 Data URL conversion to Blob URL for easy browser viewing/opening
  if (url.startsWith('data:')) {
    try {
      const arr = url.split(',')
      const mimeMatch = arr[0].match(/:(.*?);/)
      const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream'
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      const blob = new Blob([u8arr], { type: mime })
      const blobUrl = URL.createObjectURL(blob)

      const win = window.open(blobUrl, '_blank')
      if (!win) {
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = docName
        a.click()
      }
      return
    } catch (e) {
      console.error('Failed to parse base64 document blob:', e)
    }
  }

  // Direct open in new tab
  const win = window.open(url, '_blank')
  if (!win || win.closed || typeof win.closed === 'undefined') {
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.download = docName
    a.click()
  }
}

const getDocsList = (app) => {
  if (!app || !app.supporting_documents) return []
  const docs = app.supporting_documents

  const parseDocItem = (item) => {
    if (!item) return null
    if (typeof item === 'string' && item.trim().length > 0) {
      return item.trim()
    }
    if (typeof item === 'object' && (item.name || item.url || item.path)) {
      return item
    }
    return null
  }

  let list = []

  if (Array.isArray(docs)) {
    list = docs.map(parseDocItem).filter(Boolean)
  } else if (typeof docs === 'object') {
    if (Array.isArray(docs.files)) {
      list = docs.files.map(parseDocItem).filter(Boolean)
    } else if (Array.isArray(docs.documents)) {
      list = docs.documents.map(parseDocItem).filter(Boolean)
    } else {
      Object.keys(docs).forEach(k => {
        if (k === 'application_data') return
        const val = docs[k]
        if (Array.isArray(val)) {
          val.forEach(v => {
            const parsed = parseDocItem(v)
            if (parsed) list.push(parsed)
          })
        } else {
          const parsed = parseDocItem(val)
          if (parsed) {
            if (typeof parsed === 'string') {
              if (!['farmer', 'buyer', 'pending', 'approved', 'rejected'].includes(parsed)) {
                list.push(parsed)
              }
            } else {
              list.push(parsed)
            }
          }
        }
      })
    }
  }

  return list
}

const openDetailModal = (app) => {
  selectedApp.value = app
}

const openRejectModal = (app) => {
  rejectingApp.value = app
  rejectionReasonInput.value = ''
  rejectError.value = ''
}

const confirmReject = async () => {
  if (!rejectionReasonInput.value.trim()) {
    rejectError.value = 'Please enter a clear reason for rejection.'
    return
  }
  
  isSubmittingReject.value = true
  try {
    await adminApi.rejectApplication(rejectingApp.value.id, rejectionReasonInput.value.trim())
    rejectingApp.value = null
    loadApplications()
  } catch (err) {
    rejectError.value = err.message || 'Failed to reject application'
  } finally {
    isSubmittingReject.value = false
  }
}

const handleApprove = async (id) => {
  try {
    await adminApi.approveApplication(id)
    loadApplications()
  } catch (err) {
    alert(err.message || 'Failed to approve application')
  }
}
</script>
