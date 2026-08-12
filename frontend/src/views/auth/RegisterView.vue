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
const step1Valid = computed(() =>
  firstName.value.trim() &&
  secondName.value.trim() &&
  phone.value.trim() &&
  passwordStrong.value &&
  passwordsMatch.value
)

async function handleRequestOtp() {
  auth.clearError()

  if (!step1Valid.value) return

  const ok = await auth.requestOtp(phone.value.trim())
  if (ok) {
    otpSent.value = true
    step.value = 2
  }
}

async function handleRegister() {
  const ok = await auth.register({
    first_name:  firstName.value.trim(),
    second_name: secondName.value.trim(),
    phone:       phone.value.trim(),
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
  <AuthLayout
    title="Create your account"
    subtitle="Join Ethiopia's premier agri marketplace"
  >
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

      <!-- First name -->
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

      <!-- Second name -->
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
            placeholder="e.g. 0911223344"
            required
            autocomplete="tel"
          />
        </div>
      </div>

      <!-- Password -->
      <div class="form-group">
        <label for="reg-password" class="form-label">Password</label>
        <div class="input-wrap">
          <span class="input-icon">🔒</span>
          <input
            id="reg-password"
            v-model="password"
            :type="showPwd ? 'text' : 'password'"
            class="form-input form-input--padded-right"
            placeholder="Minimum 8 characters"
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
          Password must be at least 8 characters.
        </p>
      </div>

      <!-- Confirm password -->
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
          We sent a 6-digit verification code to<br/>
          <strong>{{ phone }}</strong>
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
