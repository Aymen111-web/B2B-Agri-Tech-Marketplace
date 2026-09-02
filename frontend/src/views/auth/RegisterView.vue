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
          <span>⚠️</span> {{ auth.error }}
          <button type="button" class="auth-form__error-close" @click="auth.clearError">×</button>
        </div>
      </Transition>

      <!-- First Name -->
      <div class="form-group">
        <label for="reg-first-name" class="form-label">First Name</label>
        <div class="input-wrap">
          <span class="input-icon">👤</span>
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
          <span class="input-icon">👤</span>
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
          <span class="input-icon">📱</span>
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
          <span class="input-icon">🔒</span>
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
          >{{ showPwd ? '🙈' : '👁️' }}</button>
        </div>
        <p v-if="password && !passwordStrong" class="form-hint form-hint--error">
          Must be at least 8 characters.
        </p>
      </div>

      <div class="form-group">
        <label for="reg-confirm" class="form-label">Confirm Password</label>
        <div class="input-wrap">
          <span class="input-icon">🔒</span>
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
          >{{ showConf ? '🙈' : '👁️' }}</button>
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
          <span>⚠️</span> {{ auth.error }}
          <button type="button" class="auth-form__error-close" @click="auth.clearError">×</button>
        </div>
      </Transition>

      <div class="otp-info">
        <div class="otp-info__icon">📲</div>
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
