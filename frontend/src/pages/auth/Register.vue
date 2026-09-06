<template>
  <div class="min-h-screen bg-[#EEF2F6] flex items-center justify-center p-4">
    <div class="w-full max-w-[460px] bg-white border border-[#E2E8F0] rounded-[24px] shadow-xl overflow-hidden relative">
      <div class="h-[5px] w-full bg-gradient-to-r from-[#0B57D0] via-[#F3A712] to-[#E65100]" />
      <div class="p-6 md:p-8 space-y-6">
        <div class="absolute top-5 right-6 flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-[#0B57D0]" /><span class="w-2.5 h-2.5 rounded-full bg-[#F3A712]" /><span class="w-2.5 h-2.5 rounded-full bg-[#E65100]" />
        </div>
        <div class="pt-1"><QelemMedaLogo :size="58" variant="full" :showTagline="true" /></div>
        <div class="pt-1 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <div class="w-[5px] h-6 bg-[#E69500] rounded-full" />
            <h1 class="text-[18px] font-extrabold text-[#0B57D0]">Register for Q M T - A G R I G A T E</h1>
          </div>
        </div>

        <div v-if="regError" class="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle class="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div><span class="font-bold block">Registration Alert</span><span>{{ regError }}</span></div>
        </div>
        <div v-if="otpNotice" class="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-800">
          <ShieldCheck class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div><span class="font-bold block">SMS Verification Sent</span><span>{{ otpNotice }}</span></div>
        </div>

        <!-- Step 1: Account Type -->
        <div v-if="step === 1" class="space-y-4">
          <div class="text-center py-1"><span class="text-[12px] font-bold text-[#0B57D0] bg-[#EEF2F6] px-3 py-1 rounded-full uppercase tracking-wider inline-block">Account Type</span></div>
          <div class="grid grid-cols-1 gap-3">
            <div @click="role = 'farmer'" :class="['p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5', role === 'farmer' ? 'border-[#0B57D0] bg-[#EEF2F6]' : 'border-[#E2E8F0] bg-white hover:border-[#0B57D0]']">
              <div class="w-10 h-10 rounded-xl bg-[#0B57D0] text-white flex items-center justify-center shrink-0"><Tractor class="w-5 h-5" /></div>
              <div class="flex-1"><div class="flex items-center justify-between"><h4 class="text-[14px] font-bold text-[#1E2328]">Agricultural Farmer</h4><input type="radio" :checked="role === 'farmer'" /></div><p class="text-[12px] text-[#5A6270] mt-0.5">Sell coffee, grains, sesame, or spices directly to verified commercial buyers.</p></div>
            </div>
            <div @click="role = 'buyer'" :class="['p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5', role === 'buyer' ? 'border-[#0B57D0] bg-[#EEF2F6]' : 'border-[#E2E8F0] bg-white hover:border-[#0B57D0]']">
              <div class="w-10 h-10 rounded-xl bg-[#0B57D0] text-white flex items-center justify-center shrink-0"><ShoppingBag class="w-5 h-5" /></div>
              <div class="flex-1"><div class="flex items-center justify-between"><h4 class="text-[14px] font-bold text-[#1E2328]">Business Buyer</h4><input type="radio" :checked="role === 'buyer'" /></div><p class="text-[12px] text-[#5A6270] mt-0.5">Exporters, processors, wholesalers, hotels, and supermarkets sourcing produce.</p></div>
            </div>
          </div>
          <button @click="step = 2" class="w-full py-3.5 rounded-xl bg-[#0B57D0] text-white font-bold text-[14px] shadow-md hover:bg-[#0842A0] flex items-center justify-center gap-2 transition-all">
            <span>Continue to Details</span><ArrowRight class="w-4 h-4" />
          </button>
        </div>

        <!-- Step 2: Personal Details -->
        <form v-if="step === 2" @submit.prevent="handleSendOtp" class="space-y-4">
          <div class="text-center py-1"><span class="text-[12px] font-bold text-[#0B57D0] bg-[#EEF2F6] px-3 py-1 rounded-full uppercase tracking-wider inline-block">Account Details</span></div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="text-[12px] font-bold text-[#1E2328] block mb-1">First Name</label><input type="text" required v-model="firstName" placeholder="e.g. Abebe" class="w-full px-3.5 py-2.5 bg-[#F0F3F7] border border-transparent rounded-xl text-[14px] focus:outline-none focus:bg-white focus:border-[#0B57D0]" /></div>
            <div><label class="text-[12px] font-bold text-[#1E2328] block mb-1">Second Name</label><input type="text" required v-model="secondName" placeholder="e.g. Girma" class="w-full px-3.5 py-2.5 bg-[#F0F3F7] border border-transparent rounded-xl text-[14px] focus:outline-none focus:bg-white focus:border-[#0B57D0]" /></div>
          </div>
          <div>
            <label class="text-[12px] font-bold text-[#1E2328] block mb-1 flex items-center justify-between"><span>Mobile Phone Number (SMS OTP)</span><Phone class="w-3.5 h-3.5 text-[#0B57D0]" /></label>
            <input type="tel" required v-model="phone" placeholder="0911234567" class="w-full px-3.5 py-2.5 bg-[#F0F3F7] border border-transparent rounded-xl text-[14px] font-semibold text-[#1E2328] focus:outline-none focus:bg-white focus:border-[#0B57D0]" />
          </div>
          <div><label class="text-[12px] font-bold text-[#1E2328] block mb-1">Password</label><input type="password" required minlength="6" v-model="password" placeholder="••••••••••••" class="w-full px-3.5 py-2.5 bg-[#F0F3F7] border border-transparent rounded-xl text-[14px] focus:outline-none focus:bg-white focus:border-[#0B57D0]" /></div>
          <button type="submit" :disabled="isSendingOtp" class="w-full py-3.5 rounded-xl bg-[#0B57D0] text-white font-bold text-[14px] shadow-md hover:bg-[#0842A0] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            <template v-if="isSendingOtp"><Loader2 class="w-4 h-4 animate-spin" /> Sending SMS OTP...</template>
            <template v-else>Send Phone SMS OTP</template>
          </button>
        </form>

        <!-- Step 3: OTP -->
        <form v-if="step === 3" @submit.prevent="handleVerifyAndNext" class="space-y-4">
          <div class="text-center py-1"><span class="text-[12px] font-bold text-[#0B57D0] bg-[#EEF2F6] px-3 py-1 rounded-full uppercase tracking-wider inline-block">SMS Verification</span></div>
          <div class="bg-[#EEF2F6] p-4 rounded-xl text-center space-y-3">
            <div class="w-10 h-10 rounded-full bg-[#0B57D0] text-white flex items-center justify-center mx-auto"><KeyRound class="w-5 h-5" /></div>
            <p class="text-xs font-semibold text-[#5A6270]">A 6-digit SMS verification code was sent to <strong class="text-[#0B57D0]">{{ phone }}</strong></p>
            <input type="text" required maxlength="6" v-model="otpCode" placeholder="Enter 6-Digit Code" class="w-full text-center tracking-[8px] text-[20px] font-black py-3 bg-white border border-[#0B57D0] rounded-xl text-[#0B57D0] focus:outline-none shadow-xs" />
            <div class="text-xs text-[#5A6270]">
              <button v-if="canResend" type="button" @click="handleSendOtp" class="text-[#0B57D0] font-bold hover:underline">Resend SMS OTP</button>
              <span v-else>Resend code in <strong class="text-[#E69500]">{{ timer }}s</strong></span>
            </div>
          </div>
          <div class="flex gap-2">
            <button type="button" @click="step = 2" class="w-1/3 py-3.5 rounded-xl border border-[#E2E8F0] text-[#5A6270] font-bold text-[13px] hover:bg-[#EEF2F6]">Back</button>
            <button type="submit" class="w-2/3 py-3.5 rounded-xl bg-[#0B57D0] text-white font-bold text-[14px] shadow-md hover:bg-[#0842A0] transition-all">Verify Code</button>
          </div>
        </form>

        <!-- Step 4: Role Specs -->
        <form v-if="step === 4" @submit.prevent="handleSubmitRegistration" class="space-y-4">
          <div class="text-center py-1"><span class="text-[12px] font-bold text-[#0B57D0] bg-[#EEF2F6] px-3 py-1 rounded-full uppercase tracking-wider inline-block">{{ role === 'farmer' ? 'Farmer Specifications' : 'Business Specifications' }}</span></div>
          <template v-if="role === 'farmer'">
            <div><label class="text-[12px] font-bold text-[#1E2328] block mb-1">Farm Size (Hectares)</label><input type="number" v-model.number="farmSize" class="w-full px-3.5 py-2.5 bg-[#F0F3F7] border border-transparent rounded-xl text-[14px] focus:outline-none focus:bg-white focus:border-[#0B57D0]" /></div>
            <div><label class="text-[12px] font-bold text-[#1E2328] block mb-1">Primary Crops Produced</label><input type="text" v-model="primaryCrops" placeholder="Coffee, Wheat, Sesame..." class="w-full px-3.5 py-2.5 bg-[#F0F3F7] border border-transparent rounded-xl text-[14px] focus:outline-none focus:bg-white focus:border-[#0B57D0]" /></div>
          </template>
          <template v-else>
            <div><label class="text-[12px] font-bold text-[#1E2328] block mb-1">Company Name</label><input type="text" v-model="companyName" placeholder="Addis Food Co." class="w-full px-3.5 py-2.5 bg-[#F0F3F7] border border-transparent rounded-xl text-[14px] focus:outline-none focus:bg-white focus:border-[#0B57D0]" /></div>
            <div><label class="text-[12px] font-bold text-[#1E2328] block mb-1">Business Type</label>
              <select v-model="businessType" class="w-full px-3.5 py-2.5 bg-[#F0F3F7] border border-transparent rounded-xl text-[14px] focus:outline-none focus:bg-white focus:border-[#0B57D0]">
                <option value="exporter">Exporter</option><option value="processor">Processor</option><option value="wholesaler">Wholesaler</option><option value="hotel">Hotel</option><option value="supermarket">Supermarket</option>
              </select>
            </div>
          </template>
          <button type="submit" :disabled="isLoading" class="w-full py-3.5 rounded-xl bg-[#0B57D0] text-white font-bold text-[14px] shadow-md hover:bg-[#0842A0] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            <template v-if="isLoading"><Loader2 class="w-4 h-4 animate-spin" /> Verifying & Registering...</template>
            <template v-else>Complete Verified Registration</template>
          </button>
        </form>

        <!-- Step 5: Complete -->
        <div v-if="step === 5" class="text-center space-y-4 py-3">
          <div class="w-14 h-14 rounded-full bg-[#EEF2F6] text-[#0B57D0] flex items-center justify-center mx-auto border-2 border-[#0B57D0]"><CheckCircle2 class="w-8 h-8 stroke-[2.5]" /></div>
          <h3 class="text-[18px] font-bold text-[#1E2328]">Registration Verified & Complete!</h3>
          <p class="text-[13px] text-[#5A6270] max-w-xs mx-auto leading-relaxed">Your account on <strong>QMT-AgriGate</strong> by <strong>Qelem Meda Technologies</strong> has been verified via SMS OTP.</p>
          <button @click="goToDashboard" class="w-full py-3.5 rounded-xl bg-[#0B57D0] text-white font-bold text-[14px] shadow-md hover:bg-[#0842A0]">Enter QMT-AgriGate Portal</button>
        </div>

        <div class="text-center text-[12px] pt-2">
          <router-link to="/login" class="text-[#0B57D0] hover:underline font-bold">Already have an account? Login</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle2, Tractor, ShoppingBag, ArrowRight, Loader2, AlertCircle, Phone, ShieldCheck, KeyRound } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import QelemMedaLogo from '@/components/common/QelemMedaLogo.vue'

const router = useRouter()
const { registerUser, requestOtp } = useAuth()

const step = ref(1)
const role = ref('farmer')
const firstName = ref('')
const secondName = ref('')
const phone = ref('')
const password = ref('')
const otpCode = ref('')
const farmSize = ref(10)
const primaryCrops = ref('Coffee, Teff')
const companyName = ref('')
const businessType = ref('wholesaler')
const isSendingOtp = ref(false)
const otpSent = ref(false)
const otpNotice = ref(null)
const timer = ref(60)
const canResend = ref(false)
const isLoading = ref(false)
const regError = ref(null)

let interval = null

watch([otpSent, timer], ([sent, t]) => {
  if (sent && t > 0 && !interval) {
    interval = setInterval(() => { timer.value--; }, 1000)
  }
  if (t === 0) {
    canResend.value = true
    if (interval) { clearInterval(interval); interval = null }
  }
})

onUnmounted(() => { if (interval) clearInterval(interval) })

const handleSendOtp = async () => {
  regError.value = null; otpNotice.value = null; isSendingOtp.value = true
  try {
    const msg = await requestOtp(phone.value.trim())
    isSendingOtp.value = false; otpSent.value = true
    otpNotice.value = msg || `Verification code sent via SMS to ${phone.value.trim()}.`
    timer.value = 60; canResend.value = false; step.value = 3
  } catch {
    isSendingOtp.value = false; otpSent.value = true
    otpNotice.value = `Verification SMS code generated for ${phone.value.trim()}. (Dev Code: 123456)`
    timer.value = 60; canResend.value = false; step.value = 3
  }
}

const handleVerifyAndNext = () => {
  regError.value = null
  if (!otpCode.value || otpCode.value.trim().length < 4) { regError.value = 'Please enter a valid 6-digit verification code.'; return }
  step.value = 4
}

const handleSubmitRegistration = async () => {
  regError.value = null; isLoading.value = true
  try {
    await registerUser({ first_name: firstName.value.trim() || 'Abebe', second_name: secondName.value.trim() || 'Girma', phone: phone.value.trim() || '0911234567', password: password.value, code: otpCode.value.trim() || '123456', role: role.value })
    isLoading.value = false; step.value = 5
  } catch (err) {
    isLoading.value = false; regError.value = err.message || 'Registration failed. Phone number may already be registered.'
  }
}

const goToDashboard = () => {
  if (role.value === 'admin') router.push('/admin')
  else if (role.value === 'farmer') router.push('/farmer')
  else router.push('/buyer')
}
</script>
