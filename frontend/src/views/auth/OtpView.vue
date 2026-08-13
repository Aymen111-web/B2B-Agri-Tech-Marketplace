<script setup>
/**
 * Standalone OTP verification page.
 * This route (/verify-otp) is intentionally kept separate from the register flow
 * for cases where a user needs to re-verify their phone number independently.
 *
 * The two-step registration already embeds OTP inline (see RegisterView.vue).
 * This view is a standalone fallback that can be navigated to directly.
 */
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AuthLayout from '@/components/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

// Phone may be passed via query param from another page
const phone   = ref(route.query.phone || '')
const code    = ref('')
const loading = ref(false)
const error   = ref(null)
const success  = ref(false)

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
    subtitle="Enter the 6-digit code we sent to your number"
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
        <div class="otp-info__icon">📲</div>
        <p class="otp-info__text">
          A code was sent to<br/>
          <strong>{{ phone || 'your phone number' }}</strong>
        </p>
      </div>

      <!-- OTP input — display only; actual verification handled in RegisterView -->
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
  background: var(--brand-green-light);
  border: 1px solid var(--brand-green);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}
.otp-info__icon { font-size: 2rem; margin-bottom: .5rem; }
.otp-info__text { color: var(--text-secondary); font-size: .95rem; line-height: 1.6; }
.otp-info__text strong { color: var(--text-primary); }

.form-input--otp {
  text-align: center;
  font-size: 1.8rem;
  letter-spacing: .4rem;
  font-weight: 700;
  padding-left: 1rem;
}
</style>
