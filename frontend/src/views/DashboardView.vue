<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth   = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push('/')
}
</script>

<template>
  <div class="dashboard">
    <nav class="dash-nav">
      <div class="dash-nav__inner">
        <span class="dash-nav__brand">🌿 Agri<strong>Market</strong></span>
        <div class="dash-nav__right">
          <span class="dash-nav__user">
            {{ auth.user?.first_name }} {{ auth.user?.second_name }}
          </span>
          <button id="logout-btn" class="dash-nav__logout" @click="handleLogout">
            Sign Out
          </button>
        </div>
      </div>
    </nav>
    <main class="dash-main">
      <div class="dash-placeholder">
        <div class="dash-placeholder__icon">🌾</div>
        <h1 class="dash-placeholder__title">
          Welcome, {{ auth.user?.first_name }}!
        </h1>
        <p class="dash-placeholder__sub">
          Your dashboard is being built. More features coming soon.
        </p>
        <div class="dash-placeholder__info">
          <strong>Account status:</strong> {{ auth.user?.account_status }}<br/>
          <strong>Admin:</strong> {{ auth.user?.is_admin ? 'Yes' : 'No' }}
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard { min-height: 100vh; display: flex; flex-direction: column; background: var(--surface-alt); }

.dash-nav {
  background: var(--brand-green);
  padding: 0 1.5rem;
}
.dash-nav__inner {
  max-width: 1200px; margin: 0 auto; height: 64px;
  display: flex; align-items: center; justify-content: space-between;
}
.dash-nav__brand { color: #fff; font-size: 1.2rem; font-weight: 600; }
.dash-nav__brand strong { color: var(--brand-gold); }
.dash-nav__right { display: flex; align-items: center; gap: 1.25rem; }
.dash-nav__user  { color: rgba(255,255,255,.8); font-size: .9rem; }
.dash-nav__logout {
  background: rgba(255,255,255,.15); color: #fff; border: 1px solid rgba(255,255,255,.3);
  border-radius: 8px; padding: .4rem 1rem; font-size: .85rem; font-weight: 600;
  cursor: pointer; transition: background .2s;
}
.dash-nav__logout:hover { background: rgba(255,255,255,.25); }

.dash-main {
  flex: 1; display: flex; align-items: center; justify-content: center; padding: 3rem 1.5rem;
}
.dash-placeholder { text-align: center; max-width: 480px; }
.dash-placeholder__icon  { font-size: 4rem; margin-bottom: 1.25rem; }
.dash-placeholder__title { font-size: 1.8rem; color: var(--text-primary); margin-bottom: .75rem; }
.dash-placeholder__sub   { color: var(--text-secondary); margin-bottom: 1.5rem; }
.dash-placeholder__info  {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-md); padding: 1.25rem;
  font-size: .9rem; color: var(--text-secondary); line-height: 2;
}
</style>
