<template>
  <div class="min-h-screen bg-[#EEF2F6] flex items-center justify-center p-4">
    <div class="w-full max-w-[520px] bg-white border border-[#E2E8F0] rounded-[24px] shadow-xl overflow-hidden relative">
      <!-- Top Color Accent Bar -->
      <div class="h-[5px] w-full bg-gradient-to-r from-[#0B57D0] via-[#E69500] to-[#1E9444]" />

      <div class="p-6 md:p-8 space-y-6">
        <!-- Header with Back Button -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-4">
          <div class="flex items-center gap-3">
            <button @click="$router.back()" class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-[#1E2328] transition-colors cursor-pointer">
              <ArrowLeft class="w-5 h-5" />
            </button>
            <div>
              <h1 class="text-[18px] font-black text-[#1E2328] tracking-tight">
                {{ isComplete || hasPending ? 'Capability Application Status' : 'Apply for New Capability' }}
              </h1>
              <p class="text-[12px] text-[#5A6270]">Upgrade your account capabilities on QMT AgriGate</p>
            </div>
          </div>
        </div>

        <!-- Alert Banner for Errors -->
        <div v-if="submitError" class="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-red-700">
          <AlertCircle class="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span class="font-black block">Application Alert</span>
            <span>{{ submitError }}</span>
          </div>
        </div>

        <!-- APPLICATION FORM (If no pending application & not complete) -->
        <form v-if="!isComplete && !hasPending" @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Step 1: Select Capability Type -->
          <div>
            <label class="text-[12px] font-bold text-[#1E2328] block mb-2">Select Capability to Apply For</label>
            <div class="grid grid-cols-2 gap-3 text-xs">
              <!-- Farmer Button -->
              <div 
                @click="capRole = 'farmer'" 
                :class="[
                  'p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 text-center',
                  capRole === 'farmer' ? 'border-[#1E9444] bg-[#EDFAF2] text-[#0F5C2A] font-black shadow-2xs' : 'border-[#E2E8F0] bg-white text-[#5A6270] hover:border-gray-300 font-bold'
                ]"
              >
                <div :class="['w-9 h-9 rounded-xl flex items-center justify-center', capRole === 'farmer' ? 'bg-[#1E9444] text-white' : 'bg-gray-100 text-gray-600']">
                  <Tractor class="w-5 h-5" />
                </div>
                <span>Farmer Producer</span>
              </div>

              <!-- Buyer Button -->
              <div 
                @click="capRole = 'buyer'" 
                :class="[
                  'p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 text-center',
                  capRole === 'buyer' ? 'border-[#0B57D0] bg-[#EEF2F6] text-[#0B57D0] font-black shadow-2xs' : 'border-[#E2E8F0] bg-white text-[#5A6270] hover:border-gray-300 font-bold'
                ]"
              >
                <div :class="['w-9 h-9 rounded-xl flex items-center justify-center', capRole === 'buyer' ? 'bg-[#0B57D0] text-white' : 'bg-gray-100 text-gray-600']">
                  <ShoppingBag class="w-5 h-5" />
                </div>
                <span>Commercial Buyer</span>
              </div>
            </div>
          </div>

          <!-- Step 2: Capability Form Fields -->
          <div class="pt-2 border-t border-gray-100 space-y-4">
            <!-- FARMER FORM FIELDS -->
            <template v-if="capRole === 'farmer'">
              <div>
                <label class="text-[12px] font-extrabold text-[#1E2328] block mb-1">Farm Size (in Hectares)</label>
                <input 
                  type="number" 
                  required 
                  min="0.5" 
                  step="0.5"
                  v-model.number="farmSize" 
                  placeholder="e.g. 12.5" 
                  class="w-full px-3.5 py-2.5 bg-[#F0F3F7] border border-transparent rounded-xl text-[14px] font-bold text-[#1E2328] focus:outline-none focus:bg-white focus:border-[#1E9444] transition-all" 
                />
              </div>

              <div>
                <label class="text-[12px] font-extrabold text-[#1E2328] block mb-1">Primary Crops Produced</label>
                <input 
                  type="text" 
                  required 
                  v-model="primaryCrops" 
                  placeholder="e.g. Sidama Coffee, White Teff, Sesame" 
                  class="w-full px-3.5 py-2.5 bg-[#F0F3F7] border border-transparent rounded-xl text-[14px] font-bold text-[#1E2328] focus:outline-none focus:bg-white focus:border-[#1E9444] transition-all" 
                />
              </div>

              <div>
                <label class="text-[12px] font-extrabold text-[#1E2328] block mb-1">Farming Region / Union Location</label>
                <select v-model="region" class="w-full px-3.5 py-2.5 bg-[#F0F3F7] border border-transparent rounded-xl text-[14px] font-bold text-[#1E2328] focus:outline-none focus:bg-white focus:border-[#1E9444] transition-all">
                  <option value="SNNPR">Sidama / SNNPR</option>
                  <option value="Oromia">Oromia</option>
                  <option value="Amhara">Amhara</option>
                  <option value="Tigray">Tigray</option>
                  <option value="Somali">Somali</option>
                  <option value="Afar">Afar</option>
                  <option value="Benishangul">Benishangul-Gumuz</option>
                  <option value="Gambela">Gambela</option>
                  <option value="Addis Ababa">Addis Ababa</option>
                </select>
              </div>

              <div>
                <label class="text-[12px] font-extrabold text-[#1E2328] block mb-1">Co-op Union / Farm Name (Optional)</label>
                <input 
                  type="text" 
                  v-model="unionName" 
                  placeholder="e.g. Sidama Coffee Farmers Cooperative Union" 
                  class="w-full px-3.5 py-2.5 bg-[#F0F3F7] border border-transparent rounded-xl text-[14px] font-bold text-[#1E2328] focus:outline-none focus:bg-white focus:border-[#1E9444] transition-all" 
                />
              </div>
            </template>

            <!-- BUYER FORM FIELDS -->
            <template v-else>
              <div>
                <label class="text-[12px] font-extrabold text-[#1E2328] block mb-1">Company / Business Name</label>
                <input 
                  type="text" 
                  required 
                  v-model="companyName" 
                  placeholder="e.g. Addis Grain Processing Co." 
                  class="w-full px-3.5 py-2.5 bg-[#F0F3F7] border border-transparent rounded-xl text-[14px] font-bold text-[#1E2328] focus:outline-none focus:bg-white focus:border-[#0B57D0] transition-all" 
                />
              </div>

              <div>
                <label class="text-[12px] font-extrabold text-[#1E2328] block mb-1">Business Type</label>
                <select v-model="businessType" class="w-full px-3.5 py-2.5 bg-[#F0F3F7] border border-transparent rounded-xl text-[14px] font-bold text-[#1E2328] focus:outline-none focus:bg-white focus:border-[#0B57D0] transition-all">
                  <option value="exporter">Agricultural Exporter</option>
                  <option value="processor">Food Processor / Mill</option>
                  <option value="wholesaler">Bulk Wholesaler</option>
                  <option value="supermarket">Supermarket Chain</option>
                  <option value="hotel">Hotel / Restaurant Group</option>
                  <option value="distributor">Regional Distributor</option>
                </select>
              </div>

              <div>
                <label class="text-[12px] font-extrabold text-[#1E2328] block mb-1">Tax Identification Number (TIN)</label>
                <input 
                  type="text" 
                  v-model="tinNumber" 
                  placeholder="e.g. 0098765432" 
                  class="w-full px-3.5 py-2.5 bg-[#F0F3F7] border border-transparent rounded-xl text-[14px] font-mono font-bold text-[#1E2328] focus:outline-none focus:bg-white focus:border-[#0B57D0] transition-all" 
                />
              </div>

              <div>
                <label class="text-[12px] font-extrabold text-[#1E2328] block mb-1">Operating Region / City</label>
                <select v-model="region" class="w-full px-3.5 py-2.5 bg-[#F0F3F7] border border-transparent rounded-xl text-[14px] font-bold text-[#1E2328] focus:outline-none focus:bg-white focus:border-[#0B57D0] transition-all">
                  <option value="Addis Ababa">Addis Ababa</option>
                  <option value="Oromia">Oromia</option>
                  <option value="Amhara">Amhara</option>
                  <option value="SNNPR">Sidama / SNNPR</option>
                  <option value="Dire Dawa">Dire Dawa</option>
                  <option value="Tigray">Tigray</option>
                </select>
              </div>
            </template>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            :disabled="isSubmitting" 
            :class="[
              'w-full py-3.5 rounded-2xl text-white font-extrabold text-[15px] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50',
              capRole === 'farmer' ? 'bg-[#1E9444] hover:bg-[#0F5C2A]' : 'bg-[#0B57D0] hover:bg-[#0842A0]'
            ]"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            <span>Submit {{ capRole === 'farmer' ? 'Farmer Producer' : 'Commercial Buyer' }} Application</span>
          </button>
        </form>

        <!-- PENDING ADMIN APPROVAL SCREEN -->
        <div v-else class="text-center py-4 space-y-5">
          <div class="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div class="absolute inset-0 bg-amber-100 rounded-full animate-ping opacity-25" />
            <div class="w-20 h-20 rounded-full bg-amber-50 border-2 border-[#E69500] text-[#E69500] flex items-center justify-center shadow-md relative z-10">
              <Clock class="w-10 h-10 stroke-[2.5]" />
            </div>
          </div>

          <div class="space-y-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-[#E69500] border border-amber-200">
              <span class="w-2 h-2 rounded-full bg-[#E69500] animate-pulse" />
              <span>Application Pending Admin Approval</span>
            </span>

            <h3 class="text-[19px] font-black text-[#1E2328]">Wait for Administrator Review</h3>
            <p class="text-[13px] text-[#5A6270] max-w-md mx-auto leading-relaxed">
              Your application for <strong>{{ capRole === 'farmer' ? 'Farmer Producer' : 'Commercial Buyer' }}</strong> capability has been submitted and is currently awaiting admin verification.
            </p>
          </div>

          <div class="p-4 bg-[#FFFBEB] border border-amber-200 rounded-2xl text-left space-y-2 text-xs">
            <div class="flex items-center gap-2 text-amber-900 font-extrabold">
              <ShieldCheck class="w-4 h-4 text-[#E69500]" />
              <span>What happens next?</span>
            </div>
            <ul class="space-y-1 text-amber-950 font-medium text-[11px] list-disc list-inside leading-normal">
              <li>Our platform administration team reviews your capability details.</li>
              <li>Please wait for administrator approval before accessing role-specific pages.</li>
              <li>Once approved, full access to the capability dashboard and features will automatically be granted.</li>
            </ul>
          </div>

          <button 
            @click="goToDashboard" 
            class="w-full py-3.5 rounded-2xl bg-[#0B57D0] hover:bg-[#0842A0] text-white font-extrabold text-[14px] shadow-md transition-colors cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ShieldCheck, AlertCircle, Loader2, Tractor, ShoppingBag, Clock } from 'lucide-vue-next'
import { api } from '@/services/api'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { user, isAuthenticated } = useAuth()

const capRole = ref(user.value?.role === 'buyer' ? 'farmer' : 'buyer')
const farmSize = ref(10)
const primaryCrops = ref('Coffee, Teff, Sesame')
const unionName = ref('')

const companyName = ref('')
const businessType = ref('wholesaler')
const tinNumber = ref('')
const region = ref('Addis Ababa')

const isSubmitting = ref(false)
const isComplete = ref(false)
const hasPending = ref(false)
const submitError = ref(null)

onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      const res = await api.fetchMyCapabilityApplications()
      const apps = Array.isArray(res) ? res : (res?.applications || [])
      const pendingApp = apps.find(a => a.status === 'pending')
      if (pendingApp) {
        capRole.value = pendingApp.capability_type || pendingApp.capabilityType || 'farmer'
        hasPending.value = true
        isComplete.value = true
      }
    } catch {
      // offline fallback
    }
  }
})

const handleSubmit = async () => {
  submitError.value = null

  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }

  isSubmitting.value = true

  try {
    const payload = {
      capability_type: capRole.value,
      application_data: capRole.value === 'farmer' ? {
        farm_size: farmSize.value,
        primary_crops: primaryCrops.value,
        region: region.value,
        union_name: unionName.value,
      } : {
        company_name: companyName.value,
        business_type: businessType.value,
        tin_number: tinNumber.value,
        region: region.value,
      }
    }

    await api.submitCapabilityApplication(payload)
    isSubmitting.value = false
    isComplete.value = true
    hasPending.value = true
  } catch (err) {
    isSubmitting.value = false
    submitError.value = err.message || 'Failed to submit capability application. Please try again.'
  }
}

const goToDashboard = () => {
  if (user.value?.role === 'farmer') router.push('/farmer')
  else if (user.value?.role === 'admin') router.push('/admin')
  else router.push('/buyer')
}
</script>
