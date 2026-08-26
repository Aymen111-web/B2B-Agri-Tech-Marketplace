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
          <router-link to="/capabilities/apply" class="dash-nav__link">
            Capabilities
          </router-link>
          <router-link v-if="auth.isAdmin" to="/admin/capability-applications" class="dash-nav__link dash-nav__link--admin">
            🛡️ Admin Approvals
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
          
          <!-- Farmer Card -->
          <div class="dash-card" :class="{ 'dash-card--active': hasFarmerCapability }">
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

          <!-- Buyer Card -->
          <div class="dash-card" :class="{ 'dash-card--active': hasBuyerCapability }">
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
            <h3 class="dash-card__title">Admin Governance & Approvals</h3>
            <p class="dash-card__desc">
              Review capability applications from farmers and business buyers, oversee accounts, and manage platform logs.
            </p>
            <div class="dash-card__actions">
              <button class="btn btn--admin" @click="router.push('/admin/capability-applications')">
                Review Pending Applications
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
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-xs);
  transition: all 0.15s ease;
}
.dash-nav__link:hover { background: rgba(255,255,255,0.12); color: #fff; }
.dash-nav__link--admin { background: rgba(251,191,36,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); }

.dash-nav__user { color: rgba(255,255,255,.8); font-size: 0.85rem; font-weight: 600; }
.dash-nav__logout {
  background: rgba(255,255,255,.12); color: #fff; border: 1px solid rgba(255,255,255,.2);
  border-radius: var(--radius-xs); padding: 0.35rem 0.85rem; font-size: 0.8125rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s ease;
}
.dash-nav__logout:hover { background: rgba(255,255,255,.22); }

.dash-main { flex: 1; padding: 2rem 1.5rem; }
.dash-content { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }

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
.admin-tag {
  background: var(--brand-gold-light); color: var(--brand-gold-dark);
  padding: 0.3rem 0.75rem; border-radius: var(--radius-full);
  font-weight: 700; font-size: 0.75rem; border: 1px solid var(--brand-gold-border);
}

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
.dash-card--admin-portal { border-color: var(--border); background: var(--surface-card); }

.dash-card__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; }
.dash-card__icon {
  width: 44px; height: 44px; border-radius: var(--radius-sm);
  background: var(--surface-alt); display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; border: 1px solid var(--border-subtle);
}
.dash-card__status { font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); }
.status--granted { background: var(--brand-green-light); color: var(--brand-green-dark); border: 1px solid var(--brand-green-border); }
.status--none    { background: var(--surface-alt); color: var(--text-muted); border: 1px solid var(--border); }
.status--admin   { background: var(--brand-gold-light); color: var(--brand-gold-dark); border: 1px solid var(--brand-gold-border); }

.dash-card__title { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.4rem; }
.dash-card__desc  { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.55; margin-bottom: 1.25rem; flex: 1; }

.dash-card__actions { margin-top: auto; }

.buyer-actions-flex { display: flex; gap: 0.6rem; }
.buyer-actions-flex .btn { flex: 1; }

.text-granted { font-size: 0.85rem; font-weight: 600; color: var(--brand-green-dark); }
</style>
