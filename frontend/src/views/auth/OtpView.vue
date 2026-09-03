<script setup>
/**
 * Standalone OTP verification page.
 */
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AuthLayout from '@/components/AuthLayout.vue'
import api from '@/services/api'

const router = useRouter()
const route  = useRoute()

const phone   = ref(route.query.phone || '')
const code    = ref('')
const loading = ref(false)
const error   = ref(null)
const success = ref(false)

async function requestNewOtp() {
  if (!phone.value) return
  error.value   = null
  loading.value = true
  try {
    await api.post('/auth/request-otp', { phone: phone.value })
    success.value = true
    setTimeout(() => { success.value = false }, 4000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to resend code.'
  } finally {
    loading.value = false
  }
}

function handleDone() {
  router.push('/login')
}
</script>

<template>
  <AuthLayout
    title="Verify your phone"
    subtitle="Enter the 6-digit code sent to your number"
    active-tab="otp"
  >
    <div class="auth-form">

      <!-- Error -->
      <Transition name="fade">
        <div v-if="error" class="auth-form__error" role="alert" id="otp-error">
          <span>⚠️</span> {{ error }}
          <button type="button" class="auth-form__error-close" @click="error = null">×</button>
        </div>
      </Transition>

      <!-- Success -->
      <Transition name="fade">
        <div v-if="success" class="auth-form__success" role="status" id="otp-success">
          ✅ Verification code resent successfully.
        </div>
      </Transition>

      <div class="otp-info">
        <svg class="otp-svg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
        <p class="otp-info__text">
          Code sent to <strong>{{ phone || 'your phone number' }}</strong>
        </p>
      </div>

      <!-- OTP input -->
      <div class="form-group">
        <label for="otp-code" class="form-label">Verification Code</label>
        <input
          id="otp-code"
          v-model="code"
          type="text"
          inputmode="numeric"
          maxlength="6"
          class="form-input form-input--otp"
          placeholder="000000"
          autocomplete="one-time-code"
        />
      </div>

      <button
        id="otp-done-btn"
        type="button"
        class="btn-submit"
        @click="handleDone"
        :disabled="code.length < 6"
      >
        Continue
      </button>

      <p class="auth-form__footer">
        Didn't receive a code?
        <button
          type="button"
          class="auth-form__link auth-form__link--btn"
          :disabled="loading || !phone"
          @click="requestNewOtp"
          id="otp-resend-btn"
        >
          {{ loading ? 'Sending…' : 'Resend' }}
        </button>
      </p>
    </div>
  </AuthLayout>
</template>

<style scoped>
@import '@/assets/auth-form.css';

.otp-info {
  text-align: center;
  background: var(--brand-green-light, #f0fdf4);
  border: 1px solid var(--brand-green, #1a6b3c);
  border-radius: var(--radius-md, 10px);
  padding: 1.1rem;
}
.otp-info__icon { font-size: 1.6rem; margin-bottom: .3rem; }
.otp-info__text { color: var(--text-secondary, #475569); font-size: .9rem; line-height: 1.5; }
.otp-info__text strong { color: var(--text-primary, #0f172a); }

.form-input--otp {
  text-align: center;
  font-size: 1.6rem;
  letter-spacing: .35rem;
  font-weight: 700;
  padding-left: 0.85rem;
}
</style>
