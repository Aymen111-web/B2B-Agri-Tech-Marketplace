<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AdminDashboardOverview from '@/components/admin/AdminDashboardOverview.vue'
import FarmerDashboardOverview from '@/components/farmer/FarmerDashboardOverview.vue'
import BuyerDashboardOverview from '@/components/buyer/BuyerDashboardOverview.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const auth   = useAuthStore()
const router = useRouter()

const activeCapabilities = computed(() => {
  const caps = auth.user?.capabilities || []
  return caps.filter(c => c.status === 'active').map(c => c.capability_type)
})

const hasFarmerCapability = computed(() => activeCapabilities.value.includes('farmer'))
const hasBuyerCapability = computed(() => activeCapabilities.value.includes('buyer'))

async function handleLogout() {
  await auth.logout()
  router.push('/')
}
</script>

<template>
  <div class="dashboard">
    <!-- Top Navigation Bar -->
    <nav class="dash-nav">
      <div class="dash-nav__inner">
        <div class="dash-nav__left">
          <router-link to="/dashboard" class="dash-nav__brand">
            🌿 Agri<strong>Market</strong>
          </router-link>
        </div>
        <div class="dash-nav__right">
          <router-link to="/dashboard" class="dash-nav__link dash-nav__link--active">
            Dashboard
          </router-link>
          <router-link to="/listings" class="dash-nav__link">
            Marketplace
          </router-link>
          <router-link to="/capabilities/apply" class="dash-nav__link">
            Capabilities
          </router-link>
          <router-link v-if="auth.isAdmin" to="/admin/capability-applications" class="dash-nav__link dash-nav__link--admin">
            🛡️ Approvals
          </router-link>
          <ThemeToggle />
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
      <div class="dash-content">

        <!-- Admin View: Render Executive Command Center -->
        <AdminDashboardOverview v-if="auth.isAdmin" />

        <!-- Farmer View: Render Farmer Command Center -->
        <FarmerDashboardOverview v-else-if="hasFarmerCapability" />

        <!-- Buyer View: Render Buyer Command Center -->
        <BuyerDashboardOverview v-else />

      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard { min-height: 100vh; display: flex; flex-direction: column; background: var(--surface-alt); }

.dash-nav {
  background: #064e3b;
  padding: 0 1.5rem;
  box-shadow: var(--shadow-xs);
}
.dash-nav__inner {
  max-width: 1200px; margin: 0 auto; height: 60px;
  display: flex; align-items: center; justify-content: space-between;
}
.dash-nav__brand { color: #fff; font-size: 1.15rem; font-weight: 700; text-decoration: none; }
.dash-nav__brand strong { color: var(--brand-gold); }
.dash-nav__right { display: flex; align-items: center; gap: 1rem; }
.dash-nav__link {
  color: rgba(255,255,255,0.88) !important;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-xs);
  transition: all 0.15s ease;
}
.dash-nav__link:hover {
  background: rgba(255,255,255,0.18) !important;
  color: #ffffff !important;
}
.dash-nav__link--active {
  background: rgba(255,255,255,0.18) !important;
  color: #ffffff !important;
}
.dash-nav__link--admin {
  background: rgba(251,191,36,0.18) !important;
  color: #fbbf24 !important;
  border: 1px solid rgba(251,191,36,0.3);
}
.dash-nav__link--admin:hover, .dash-nav__link--admin.router-link-active {
  background: #fbbf24 !important;
  color: #0f172a !important;
}

.dash-nav__user { color: rgba(255,255,255,.8); font-size: 0.85rem; font-weight: 600; }
.dash-nav__logout {
  background: rgba(255,255,255,.12); color: #fff; border: 1px solid rgba(255,255,255,.2);
  border-radius: var(--radius-xs); padding: 0.35rem 0.85rem; font-size: 0.8125rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s ease;
}
.dash-nav__logout:hover { background: rgba(255,255,255,.22); }

.dash-main { flex: 1; padding: 2rem 1.5rem; }
.dash-content { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }

.dash-welcome {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.5rem 1.75rem;
  box-shadow: var(--shadow-xs);
}
.dash-welcome__header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
.dash-welcome__title { font-size: 1.4rem; color: var(--text-primary); margin-bottom: 0.25rem; font-weight: 700; }
.dash-welcome__sub { color: var(--text-secondary); font-size: 0.875rem; }
.status-badge { font-weight: 700; color: var(--brand-green-dark); letter-spacing: 0.02em; }

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.25rem;
}

.dash-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.dash-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: rgba(16, 185, 129, 0.3); }

.dash-card--active { border-color: var(--brand-green-border); background: var(--surface-card); }

.dash-card__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; }
.dash-card__icon {
  width: 44px; height: 44px; border-radius: var(--radius-sm);
  background: var(--surface-alt); display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; border: 1px solid var(--border-subtle);
}
.dash-card__status { font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); }
.status--granted { background: var(--brand-green-light); color: var(--brand-green-dark); border: 1px solid var(--brand-green-border); }
.status--none    { background: var(--surface-alt); color: var(--text-muted); border: 1px solid var(--border); }

.dash-card__title { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.4rem; }
.dash-card__desc  { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.55; margin-bottom: 1.25rem; flex: 1; }

.dash-card__actions { margin-top: auto; }

.buyer-actions-flex { display: flex; gap: 0.6rem; }
.buyer-actions-flex .btn { flex: 1; }
</style>
