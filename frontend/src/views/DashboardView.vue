<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
    <nav class="dash-nav">
      <div class="dash-nav__inner">
        <div class="dash-nav__left">
          <router-link to="/dashboard" class="dash-nav__brand">
            🌿 Agri<strong>Market</strong>
          </router-link>
        </div>
        <div class="dash-nav__right">
          <router-link to="/listings" class="dash-nav__link">
            Browse Marketplace
          </router-link>
          <router-link v-if="!auth.isAdmin" to="/capabilities/apply" class="dash-nav__link">
            Capabilities
          </router-link>
          <router-link v-if="auth.isAdmin" to="/admin/capability-applications" class="dash-nav__link dash-nav__link--admin">
            🛡️ Admin Approvals
          </router-link>
          <router-link v-if="auth.isAdmin" to="/admin/users" class="dash-nav__link dash-nav__link--admin">
            👥 User Accounts
          </router-link>
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
        <!-- Welcome banner -->
        <div class="dash-welcome">
          <div class="dash-welcome__header">
            <div>
              <h1 class="dash-welcome__title">
                Welcome back, {{ auth.user?.first_name }}! 👋
              </h1>
              <p class="dash-welcome__sub">
                Account Status: <span class="status-badge">{{ auth.user?.account_status }}</span>
              </p>
            </div>
            <div v-if="auth.isAdmin" class="admin-tag">
              Administrator
            </div>
          </div>
        </div>

        <!-- Capability Cards Grid -->
        <div class="cards-grid">
          
          <!-- Farmer Card (Non-Admin only) -->
          <div v-if="!auth.isAdmin" class="dash-card" :class="{ 'dash-card--active': hasFarmerCapability }">
            <div class="dash-card__header">
              <span class="dash-card__icon">🌾</span>
              <span class="dash-card__status" :class="hasFarmerCapability ? 'status--granted' : 'status--none'">
                {{ hasFarmerCapability ? 'Active Capability' : 'Not Granted' }}
              </span>
            </div>
            <h3 class="dash-card__title">Farmer Produce Portal</h3>
            <p class="dash-card__desc">
              List available crops, manage stock, set prices, and process buyer fulfillment orders.
            </p>
            <div class="dash-card__actions">
              <button
                v-if="!hasFarmerCapability"
                class="btn btn--primary"
                @click="router.push('/capabilities/apply')"
              >
                Apply for Farmer Capability
              </button>

              <button
                v-else
                class="btn btn--primary"
                @click="router.push('/farmer/listings')"
              >
                Manage Produce Listings →
              </button>
            </div>
          </div>

          <!-- Buyer Card (Non-Admin only) -->
          <div v-if="!auth.isAdmin" class="dash-card" :class="{ 'dash-card--active': hasBuyerCapability }">
            <div class="dash-card__header">
              <span class="dash-card__icon">🏬</span>
              <span class="dash-card__status" :class="hasBuyerCapability ? 'status--granted' : 'status--none'">
                {{ hasBuyerCapability ? 'Active Capability' : 'Not Granted' }}
              </span>
            </div>
            <h3 class="dash-card__title">Business Buyer Portal</h3>
            <p class="dash-card__desc">
              Browse verified farmer listings, manage cart items, place multi-farmer orders, and pay securely.
            </p>
            <div class="dash-card__actions">
              <button
                v-if="!hasBuyerCapability"
                class="btn btn--primary"
                @click="router.push('/capabilities/apply')"
              >
                Apply for Buyer Capability
              </button>
              <div v-else class="buyer-actions-flex">
                <button
                  class="btn btn--primary"
                  @click="router.push('/orders')"
                >
                  My Orders →
                </button>
                <button
                  class="btn btn--outline"
                  @click="router.push('/cart')"
                >
                  View Cart 🛒
                </button>
              </div>
            </div>
          </div>

          <!-- Admin Portal Card (If Admin) -->
          <div v-if="auth.isAdmin" class="dash-card dash-card--admin-portal">
            <div class="dash-card__header">
              <span class="dash-card__icon">🛡️</span>
              <span class="dash-card__status status--admin">
                System Admin
              </span>
            </div>
            <h3 class="dash-card__title">Capability Approvals</h3>
            <p class="dash-card__desc">
              Review capability applications from farmers and business buyers, verify trade licenses, and grant platform access.
            </p>
            <div class="dash-card__actions">
              <button class="btn btn--admin" @click="router.push('/admin/capability-applications')">
                Review Pending Applications →
              </button>
            </div>
          </div>

          <!-- Admin Users Card (If Admin) -->
          <div v-if="auth.isAdmin" class="dash-card dash-card--admin-portal">
            <div class="dash-card__header">
              <span class="dash-card__icon">👥</span>
              <span class="dash-card__status status--admin">
                System Admin
              </span>
            </div>
            <h3 class="dash-card__title">User Accounts & Subscriptions</h3>
            <p class="dash-card__desc">
              Manage all registered farmer and buyer accounts, audit Chapa Subaccounts, and toggle active/inactive subscription statuses.
            </p>
            <div class="dash-card__actions">
              <button class="btn btn--admin" @click="router.push('/admin/users')">
                Manage User Accounts →
              </button>
            </div>
          </div>

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
.dash-nav__brand { color: #fff; font-size: 1.2rem; font-weight: 600; text-decoration: none; }
.dash-nav__brand strong { color: var(--brand-gold); }
.dash-nav__right { display: flex; align-items: center; gap: 1.25rem; }
.dash-nav__link {
  color: rgba(255,255,255,0.9);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  transition: background 0.2s;
}
.dash-nav__link:hover { background: rgba(255,255,255,0.15); }
.dash-nav__link--admin { background: rgba(251,191,36,0.2); color: #fbbf24; border: 1px solid rgba(251,191,36,0.4); }

.dash-nav__user { color: rgba(255,255,255,.8); font-size: .9rem; font-weight: 500; }
.dash-nav__logout {
  background: rgba(255,255,255,.15); color: #fff; border: 1px solid rgba(255,255,255,.3);
  border-radius: 8px; padding: .4rem 1rem; font-size: .85rem; font-weight: 600;
  cursor: pointer; transition: background .2s;
}
.dash-nav__logout:hover { background: rgba(255,255,255,.25); }

.dash-main {
  flex: 1; padding: 2.5rem 1.5rem;
}
.dash-content { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; }

.dash-welcome {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.75rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}
.dash-welcome__header { display: flex; justify-content: space-between; align-items: center; }
.dash-welcome__title { font-size: 1.6rem; color: var(--text-primary); margin-bottom: 0.4rem; font-weight: 700; }
.dash-welcome__sub { color: var(--text-secondary); font-size: 0.9rem; }
.status-badge { text-transform: uppercase; font-weight: 700; color: var(--brand-green); }
.admin-tag { background: #fef3c7; color: #92400e; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 700; font-size: 0.85rem; }

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.dash-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  transition: transform 0.2s, box-shadow 0.2s;
}
.dash-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.06); }

.dash-card--active { border-color: #bbf7d0; background: #fafdfb; }
.dash-card--admin-portal { border-color: #cbd5e1; background: #f8fafc; }

.dash-card__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.dash-card__icon { font-size: 2rem; }
.dash-card__status { font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 999px; }
.status--granted { background: #dcfce7; color: #166534; }
.status--none    { background: #f1f5f9; color: #64748b; }
.status--admin   { background: #fef3c7; color: #92400e; }

.dash-card__title { font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.6rem; }
.dash-card__desc  { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1.5rem; flex: 1; }

.dash-card__actions { margin-top: auto; }

.btn {
  width: 100%;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background 0.2s;
}
.btn--primary { background: var(--brand-green); color: #fff; }
.btn--primary:hover { background: #2d5a3f; }
.btn--admin   { background: #1e293b; color: #fff; }
.btn--admin:hover { background: #0f172a; }
.btn--outline { background: transparent; border: 1px solid var(--border); color: var(--text-primary); }
.btn--outline:hover { background: #f8fafc; }

.buyer-actions-flex { display: flex; gap: 0.75rem; }

.text-granted { font-size: 0.9rem; font-weight: 600; color: #166534; }
</style>
