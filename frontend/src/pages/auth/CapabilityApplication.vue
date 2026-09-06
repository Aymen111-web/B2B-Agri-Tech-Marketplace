<template>
  <div class="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
    <div class="w-full max-w-[480px] bg-white border border-[#E2E4E7] rounded-2xl p-6 shadow-md space-y-6">
      <div class="flex items-center gap-3">
        <button @click="$router.back()" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F0F1F2]"><ArrowLeft class="w-5 h-5 text-[#1E2328]" /></button>
        <div><h2 class="text-[18px] font-bold text-[#1E2328]">Capability Application</h2><p class="text-[12px] text-[#5A6270]">Legal document verification upload & role upgrade</p></div>
      </div>
      <div v-if="submitError" class="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-red-700">
        <AlertCircle class="w-4 h-4 text-red-600 shrink-0 mt-0.5" /><div><span class="font-bold block">Application Alert</span><span>{{ submitError }}</span></div>
      </div>
      <form v-if="!isComplete" @submit.prevent="handleSubmit" class="space-y-5">
        <div>
          <label class="text-[12px] font-bold text-[#1E2328] block mb-1.5">Applying for Capability</label>
          <div class="grid grid-cols-2 gap-2 text-[13px] font-bold">
            <button type="button" @click="capRole = 'farmer'" :class="['py-2.5 rounded-xl border transition-all', capRole === 'farmer' ? 'bg-[#EDFAF2] border-[#1E9444] text-[#1E9444]' : 'bg-white border-[#E2E4E7] text-[#5A6270]']">Farmer Producer</button>
            <button type="button" @click="capRole = 'buyer'" :class="['py-2.5 rounded-xl border transition-all', capRole === 'buyer' ? 'bg-[#EDFAF2] border-[#1E9444] text-[#1E9444]' : 'bg-white border-[#E2E4E7] text-[#5A6270]']">Commercial Buyer</button>
          </div>
        </div>
        <div>
          <label class="text-[12px] font-bold text-[#1E2328] block mb-1.5">{{ capRole === 'farmer' ? 'Land Ownership Certificate / Kebele ID' : 'Trade License / TIN Registration Certificate' }}</label>
          <div @click="handleUpload" class="border-2 border-dashed border-[#E2E4E7] rounded-xl p-6 text-center cursor-pointer hover:border-[#1E9444] transition-colors bg-[#F8F9FA]">
            <Upload class="w-8 h-8 text-[#1E9444] mx-auto mb-2" /><span class="text-[13px] font-bold text-[#1E9444] block">Tap to attach document (PDF, PNG, JPG)</span><span class="text-[11px] text-[#5A6270]">Max file size 15MB</span>
          </div>
        </div>
        <div v-if="uploadedFiles.length > 0" class="space-y-2">
          <span class="text-[12px] font-bold text-[#1E2328]">Uploaded Documents:</span>
          <div v-for="(file, i) in uploadedFiles" :key="i" class="p-3 bg-[#EDFAF2] border border-[#C3EFCF] rounded-xl flex items-center justify-between text-[12px]">
            <div class="flex items-center gap-2 text-[#0F5C2A] font-bold"><FileText class="w-4 h-4" /><span>{{ file }}</span></div>
            <span class="text-[#1E9444] font-bold">Attached</span>
          </div>
        </div>
        <button type="submit" :disabled="uploadedFiles.length === 0 || isSubmitting" class="w-full py-3.5 rounded-full bg-[#1E9444] text-white font-bold text-[15px] shadow-md hover:bg-[#0F5C2A] disabled:opacity-50 btn-hover flex items-center justify-center gap-2">
          <template v-if="isSubmitting"><Loader2 class="w-4 h-4 animate-spin" /> Submitting Application...</template>
          <template v-else>Submit Verification Application</template>
        </button>
      </form>
      <div v-else class="text-center py-6 space-y-4">
        <div class="w-14 h-14 rounded-full bg-[#EDFAF2] text-[#1E9444] flex items-center justify-center mx-auto border-2 border-[#1E9444]"><ShieldCheck class="w-8 h-8 stroke-[2.5]" /></div>
        <h3 class="text-[18px] font-bold text-[#1E2328]">Application Submitted!</h3>
        <p class="text-[13px] text-[#5A6270]">Your request for <strong>{{ capRole === 'farmer' ? 'Farmer Producer' : 'Commercial Buyer' }}</strong> capability has been submitted to our moderation queue.</p>
        <button @click="$router.push(user?.role === 'farmer' ? '/farmer' : '/buyer')" class="w-full py-3 rounded-full bg-[#1E9444] text-white font-bold text-[14px]">Return to Dashboard</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Upload, FileText, ArrowLeft, ShieldCheck, AlertCircle, Loader2 } from 'lucide-vue-next'
import { api } from '@/services/api'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { user, isAuthenticated } = useAuth()
const capRole = ref('farmer')
const uploadedFiles = ref([])
const isSubmitting = ref(false)
const isComplete = ref(false)
const submitError = ref(null)

const handleUpload = () => {
  const docName = capRole.value === 'farmer' ? `land_certificate_${Date.now().toString().slice(-4)}.pdf` : `business_license_${Date.now().toString().slice(-4)}.pdf`
  uploadedFiles.value.push(docName)
}

const handleSubmit = async () => {
  submitError.value = null
  if (!isAuthenticated.value) { router.push('/login'); return }
  if (uploadedFiles.value.length === 0) { submitError.value = 'Please attach at least one supporting verification document.'; return }
  isSubmitting.value = true
  try {
    await api.submitCapabilityApplication({ capability_type: capRole.value, supporting_documents: uploadedFiles.value })
    isSubmitting.value = false; isComplete.value = true
  } catch (err) {
    isSubmitting.value = false; submitError.value = err.message || 'Failed to submit application.'
  }
}
</script>
