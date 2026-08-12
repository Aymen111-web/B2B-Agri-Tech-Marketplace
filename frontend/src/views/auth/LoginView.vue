<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/components/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()

const phone    = ref('')
const password = ref('')
const showPwd  = ref(false)

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

async function handleLogin() {
  const formattedPhone = normalizePhone(phone.value)
  const ok = await auth.login(formattedPhone, password.value)
  if (ok) router.push('/dashboard')
}
</script>

<template>
  <AuthLayout
    title="Welcome back"
    subtitle="Sign in to your Agri Market account"
  >
    <form id="login-form" class="auth-form" @submit.prevent="handleLogin" novalidate>

      <!-- Error banner -->
      <Transition name="fade">
        <div v-if="auth.error" class="auth-form__error" role="alert" id="login-error">
          <span>⚠️</span> {{ auth.error }}
          <button type="button" class="auth-form__error-close" @click="auth.clearError" aria-label="Dismiss">×</button>
        </div>
      </Transition>

      <!-- Phone -->
      <div class="form-group">
        <label for="login-phone" class="form-label">Phone Number</label>
        <div class="input-wrap">
          <span class="input-icon">📱</span>
          <input
            id="login-phone"
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
        <div class="form-label-row">
          <label for="login-password" class="form-label">Password</label>
        </div>
        <div class="input-wrap">
          <span class="input-icon">🔒</span>
          <input
            id="login-password"
            v-model="password"
            :type="showPwd ? 'text' : 'password'"
            class="form-input form-input--padded-right"
            placeholder="Your password"
            required
            autocomplete="current-password"
          />
          <button
            type="button"
            class="input-toggle"
            @click="showPwd = !showPwd"
            :aria-label="showPwd ? 'Hide password' : 'Show password'"
            id="login-toggle-pwd"
          >
            {{ showPwd ? '🙈' : '👁️' }}
          </button>
        </div>
      </div>

      <!-- Submit -->
      <button
        id="login-submit"
        type="submit"
        class="btn-submit"
        :disabled="auth.loading || !phone || !password"
      >
        <span v-if="auth.loading" class="spinner" aria-hidden="true"></span>
        {{ auth.loading ? 'Signing in…' : 'Sign In' }}
      </button>

      <!-- Footer link -->
      <p class="auth-form__footer">
        Don't have an account?
        <RouterLink to="/register" class="auth-form__link" id="login-to-register">Create one</RouterLink>
      </p>
    </form>
  </AuthLayout>
</template>

<style scoped>
@import '@/assets/auth-form.css';
</style>
