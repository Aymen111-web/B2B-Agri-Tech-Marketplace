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
  <AuthLayout title="Sign In" subtitle="Welcome back! Sign in to your account.">
    <form id="login-form" class="auth-form" @submit.prevent="handleLogin" novalidate>

      <!-- Error banner -->
      <Transition name="fade">
        <div v-if="auth.error" class="auth-form__error" role="alert" id="login-error">
          {{ auth.error }}
          <button type="button" class="auth-form__error-close" @click="auth.clearError" aria-label="Dismiss">×</button>
        </div>
      </Transition>

      <!-- Phone -->
      <div class="form-group">
        <label for="login-phone" class="form-label">Phone Number</label>
        <div class="input-wrap">
          <svg class="input-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          <input
            id="login-phone"
            v-model="phone"
            type="tel"
            class="form-input"
            placeholder="0911223344 or +251..."
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
          <svg class="input-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <input
            id="login-password"
            v-model="password"
            :type="showPwd ? 'text' : 'password'"
            class="form-input form-input--padded-right"
            placeholder="Enter your password"
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
            <svg v-if="showPwd" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
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
        <RouterLink to="/register" class="auth-form__link" id="login-to-register">Create account</RouterLink>
      </p>
    </form>
  </AuthLayout>
</template>

<style scoped>
@import '@/assets/auth-form.css';
</style>
