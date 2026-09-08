<template>
  <div class="min-h-screen bg-[#EEF2F6] flex items-center justify-center p-4">
    <div class="w-full max-w-[430px] bg-white rounded-[24px] shadow-xl overflow-hidden border border-[#E2E8F0] relative">
      <div class="h-[5px] w-full bg-gradient-to-r from-[#0B57D0] via-[#F3A712] to-[#E69500]" />
      <div class="p-6 md:p-8 space-y-6">
        <div class="absolute top-5 right-6 flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-[#0B57D0]" />
          <span class="w-2.5 h-2.5 rounded-full bg-[#F3A712]" />
          <span class="w-2.5 h-2.5 rounded-full bg-[#E65100]" />
        </div>
        <div class="pt-1">
          <QelemMedaLogo :size="58" variant="full" :showTagline="true" />
        </div>
        <div class="flex items-center gap-2 pt-1 border-t border-gray-100">
          <div class="w-[5px] h-6 bg-[#E69500] rounded-full" />
          <h1 class="text-[18px] font-extrabold text-[#0B57D0]">{{ t('signInTitle') }}</h1>
        </div>

        <div v-if="authError" class="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-xs text-red-700">
          <AlertCircle class="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{{ authError }}</span>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="text-[12px] font-bold text-[#1E2328] block mb-1">{{ t('mobilePhone') }}</label>
            <input type="text" required placeholder="0911234567 or +251..." v-model="phoneOrEmail"
              class="w-full px-4 py-3 bg-[#F0F3F7] border border-transparent rounded-xl text-[14px] font-medium text-[#1E2328] placeholder-[#9BA1AA] focus:outline-none focus:bg-white focus:border-[#0B57D0] transition-all" />
          </div>
          <div>
            <label class="text-[12px] font-bold text-[#1E2328] block mb-1">{{ t('password') }}</label>
            <div class="relative">
              <input :type="showPassword ? 'text' : 'password'" required minlength="6" placeholder="••••••••" v-model="password"
                class="w-full pl-4 pr-11 py-3 bg-[#F0F3F7] border border-transparent rounded-xl text-[14px] font-medium text-[#1E2328] placeholder-[#9BA1AA] focus:outline-none focus:bg-white focus:border-[#0B57D0] transition-all" />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3.5 top-3.5 text-[#0B57D0] hover:opacity-80">
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>
          <button type="submit" :disabled="isLoading"
            class="w-full py-3.5 rounded-xl bg-[#0B57D0] text-white font-bold text-[15px] shadow-md hover:bg-[#0842A0] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            <template v-if="isLoading">
              <Loader2 class="w-4 h-4 animate-spin" /> {{ t('authenticating') }}
            </template>
            <template v-else>{{ t('signIn') }}</template>
          </button>
        </form>

        <div class="text-center pt-2 text-[13px]">
          <p class="text-[#5A6270]">
            {{ t('noAccount') }}
            <router-link to="/register" class="text-[#0B57D0] font-bold hover:underline">{{ t('registerNewAccount') }}</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useLanguage } from '@/composables/useLanguage'
import QelemMedaLogo from '@/components/common/QelemMedaLogo.vue'

const router = useRouter()
const { loginWithCredentials } = useAuth()
const { t } = useLanguage()

const phoneOrEmail = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const authError = ref(null)

const handleLogin = async () => {
  authError.value = null
  isLoading.value = true
  try {
    const user = await loginWithCredentials(phoneOrEmail.value.trim(), password.value)
    isLoading.value = false
    if (user.role === 'admin') router.push('/admin')
    else if (user.role === 'farmer') router.push('/farmer')
    else router.push('/buyer')
  } catch (err) {
    isLoading.value = false
    authError.value = err.message || 'Invalid phone or password. Please try again.'
  }
}
</script>
