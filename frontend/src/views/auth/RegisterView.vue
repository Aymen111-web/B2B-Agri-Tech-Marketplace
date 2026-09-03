<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/components/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()

// Step 1: fill in details + request OTP
// Step 2: enter OTP code to complete registration
const step = ref(1)

const firstName = ref('')
const secondName = ref('')
const phone     = ref('')
const password  = ref('')
const confirm   = ref('')
const otpCode   = ref('')
const showPwd   = ref(false)
const showConf  = ref(false)
const otpSent   = ref(false)

// Client-side validation
const passwordsMatch = computed(() => password.value === confirm.value)
const passwordStrong = computed(() => password.value.length >= 8)

// Accepts: 09XXXXXXXX, 07XXXXXXXX, 9XXXXXXXX, 7XXXXXXXX, +251XXXXXXXXX
const phoneValid = computed(() => {
  const p = phone.value.trim()
  return /^\+251[0-9]{9}$/.test(p) ||
    (/^(09|07)[0-9]{8}$/).test(p) ||
    (/^(9|7)[0-9]{8}$/).test(p)
})

const step1Valid = computed(() =>
  firstName.value.trim() &&
  secondName.value.trim() &&
  phoneValid.value &&
  passwordStrong.value &&
  passwordsMatch.value
)

function normalizePhone(input) {
  let p = input.trim()
  if (p.startsWith('09') && p.length === 10) {
    return '+251' + p.substring(1)
  }
  if (p.startsWith('07') && p.length === 10) {
    return '+251' + p.substring(1)
  }
  if ((p.startsWith('9') || p.startsWith('7')) && p.length === 9) {
    return '+251' + p
  }
  return p
}

async function handleRequestOtp() {
  auth.clearError()

  if (!step1Valid.value) return

  const formattedPhone = normalizePhone(phone.value)
  phone.value = formattedPhone

  const ok = await auth.requestOtp(formattedPhone)
  if (ok) {
    otpSent.value = true
    step.value = 2
  }
}

async function handleRegister() {
  const formattedPhone = normalizePhone(phone.value)

  const ok = await auth.register({
    first_name:  firstName.value.trim(),
    second_name: secondName.value.trim(),
    phone:       formattedPhone,
    password:    password.value,
    code:        otpCode.value.trim() || undefined,
  })
  if (ok) {
    router.push('/dashboard')
  }
}

function goBack() {
  step.value = 1
  auth.clearError()
}
</script>

<template>
  <AuthLayout title="Create Account" subtitle="Join Ethiopia's B2B Agri Marketplace">
    <!-- ── Step 1: Details ── -->
    <form
      v-if="step === 1"
      id="register-form-step1"
      class="auth-form"
      @submit.prevent="handleRequestOtp"
      novalidate
    >
      <Transition name="fade">
        <div v-if="auth.error" class="auth-form__error" role="alert" id="register-error">
          {{ auth.error }}
          <button type="button" class="auth-form__error-close" @click="auth.clearError">×</button>
        </div>
      </Transition>

      <!-- First Name -->
      <div class="form-group">
        <label for="reg-first-name" class="form-label">First Name</label>
        <div class="input-wrap">
          <svg class="input-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <input
            id="reg-first-name"
            v-model="firstName"
            type="text"
            class="form-input"
            placeholder="Abebe"
            required
            autocomplete="given-name"
          />
        </div>
      </div>

      <!-- Second Name -->
      <div class="form-group">
        <label for="reg-second-name" class="form-label">Second Name</label>
        <div class="input-wrap">
          <svg class="input-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <input
            id="reg-second-name"
            v-model="secondName"
            type="text"
            class="form-input"
            placeholder="Kebede"
            required
            autocomplete="family-name"
          />
        </div>
      </div>

      <!-- Phone -->
      <div class="form-group">
        <label for="reg-phone" class="form-label">Phone Number</label>
        <div class="input-wrap">
          <svg class="input-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          <input
            id="reg-phone"
            v-model="phone"
            type="tel"
            class="form-input"
            placeholder="0911223344 or +251..."
            required
            autocomplete="tel"
          />
        </div>
        <p v-if="phone && !phoneValid" class="form-hint form-hint--error">
          Format: 0911223344 or +251911223344
        </p>
      </div>

      <!-- Password & Confirm Password -->
      <div class="form-group">
        <label for="reg-password" class="form-label">Password</label>
        <div class="input-wrap">
          <svg class="input-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <input
            id="reg-password"
            v-model="password"
            :type="showPwd ? 'text' : 'password'"
            class="form-input form-input--padded-right"
            placeholder="At least 8 characters"
            required
            autocomplete="new-password"
          />
          <button
            type="button"
            class="input-toggle"
            @click="showPwd = !showPwd"
            :aria-label="showPwd ? 'Hide password' : 'Show password'"
            id="reg-toggle-pwd"
          >
            <svg v-if="showPwd" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
        </div>
        <p v-if="password && !passwordStrong" class="form-hint form-hint--error">
          Must be at least 8 characters.
        </p>
      </div>

      <div class="form-group">
        <label for="reg-confirm" class="form-label">Confirm Password</label>
        <div class="input-wrap">
          <svg class="input-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <input
            id="reg-confirm"
            v-model="confirm"
            :type="showConf ? 'text' : 'password'"
            class="form-input form-input--padded-right"
            placeholder="Re-enter password"
            required
            autocomplete="new-password"
          />
          <button
            type="button"
            class="input-toggle"
            @click="showConf = !showConf"
            :aria-label="showConf ? 'Hide' : 'Show'"
            id="reg-toggle-conf"
          >
            <svg v-if="showConf" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
        </div>
        <p v-if="confirm && !passwordsMatch" class="form-hint form-hint--error">
          Passwords do not match.
        </p>
      </div>

      <button
        id="reg-next-btn"
        type="submit"
        class="btn-submit"
        :disabled="auth.loading || !step1Valid"
      >
        <span v-if="auth.loading" class="spinner" aria-hidden="true"></span>
        {{ auth.loading ? 'Sending code…' : 'Continue — Send OTP' }}
      </button>

      <p class="auth-form__footer">
        Already have an account?
        <RouterLink to="/login" class="auth-form__link" id="reg-to-login">Sign in</RouterLink>
      </p>
    </form>

    <!-- ── Step 2: OTP verification ── -->
    <form
      v-else
      id="register-form-step2"
      class="auth-form"
      @submit.prevent="handleRegister"
      novalidate
    >
      <Transition name="fade">
        <div v-if="auth.error" class="auth-form__error" role="alert" id="register-otp-error">
          {{ auth.error }}
          <button type="button" class="auth-form__error-close" @click="auth.clearError">×</button>
        </div>
      </Transition>

      <div class="otp-info">
        <svg class="otp-svg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
        <p class="otp-info__text">
          Code sent to <strong>{{ phone }}</strong>
        </p>
      </div>

      <div class="form-group">
        <label for="reg-otp" class="form-label">Verification Code</label>
        <input
          id="reg-otp"
          v-model="otpCode"
          type="text"
          inputmode="numeric"
          maxlength="6"
          class="form-input form-input--otp"
          placeholder="000000"
          autocomplete="one-time-code"
          required
        />
      </div>

      <button
        id="reg-submit-btn"
        type="submit"
        class="btn-submit"
        :disabled="auth.loading || otpCode.length < 6"
      >
        <span v-if="auth.loading" class="spinner" aria-hidden="true"></span>
        {{ auth.loading ? 'Creating account…' : 'Verify & Create Account' }}
      </button>

      <p class="auth-form__footer">
        Wrong number?
        <button type="button" class="auth-form__link auth-form__link--btn" @click="goBack" id="reg-back-btn">
          Go back
        </button>
      </p>
    </form>
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
