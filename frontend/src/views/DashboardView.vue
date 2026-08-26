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
const hasBuyerCapability  = computed(() => activeCapabilities.value.includes('buyer'))

async function handleLogout() {
  await auth.logout()
  router.push('/')
}
</script>

<template>
  <div class="dashboard-page">
    <div class="dash-container">

      <!-- Welcome Hero Banner -->
      <div class="dash-welcome-card">
        <div class="welcome-left">
          <h1 class="welcome-title">
            Welcome back, {{ auth.user?.first_name || 'User' }}! 👋
          </h1>
          <p class="welcome-sub">
            Account Status: <span class="status-pill-badge status-pill-badge--green">{{ auth.user?.account_status || 'Active' }}</span>
          </p>
        </div>
        <div v-if="auth.isAdmin" class="admin-mode-tag">
          🛡️ Administrator Account
        </div>
      </div>

      <!-- KPI Summary Cards Grid -->
      <div class="kpi-grid">
        <div class="kpi-card" :class="{ 'kpi-card--accent-mint': hasFarmerCapability }">
          <div class="kpi-info">
            <span class="kpi-label">Farmer Produce Portal</span>
            <span class="kpi-value">{{ hasFarmerCapability ? 'ACTIVE' : 'INACTIVE' }}</span>
          </div>
          <div class="kpi-icon-box kpi-icon-box--green">🌾</div>
        </div>

        <div class="kpi-card" :class="{ 'kpi-card--accent-mint': hasBuyerCapability }">
          <div class="kpi-info">
            <span class="kpi-label">Business Buyer Portal</span>
            <span class="kpi-value">{{ hasBuyerCapability ? 'ACTIVE' : 'INACTIVE' }}</span>
          </div>
          <div class="kpi-icon-box kpi-icon-box--blue">🏬</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-info">
            <span class="kpi-label">Active Capabilities</span>
            <span class="kpi-value">{{ activeCapabilities.length }}</span>
          </div>
          <div class="kpi-icon-box kpi-icon-box--yellow">📜</div>
        </div>

        <div class="kpi-card" v-if="auth.isAdmin">
          <div class="kpi-info">
            <span class="kpi-label">Admin Governance</span>
            <span class="kpi-value">READY</span>
          </div>
          <div class="kpi-icon-box kpi-icon-box--teal">🛡️</div>
        </div>
      </div>

      <!-- Main Section: Capabilities Portals & Donut Analytics -->
      <div class="dash-main-grid">

        <!-- Portals Grid -->
        <div class="portals-column">
          
          <!-- Farmer Portal Card -->
          <div class="portal-card" :class="{ 'portal-card--active': hasFarmerCapability }">
            <div class="portal-header">
              <span class="portal-icon">🌾</span>
              <span class="pill-badge" :class="hasFarmerCapability ? 'pill-badge--green' : 'pill-badge--gold'">
                {{ hasFarmerCapability ? 'ACTIVE CAPABILITY' : 'NOT GRANTED' }}
              </span>
            </div>
            <h3 class="portal-title">Farmer Produce Portal</h3>
            <p class="portal-desc">
              List available crops, manage stock levels, configure unit pricing, and process buyer fulfillment orders.
            </p>
            <div class="portal-footer">
              <button
                v-if="!hasFarmerCapability"
                class="btn-filter btn-filter--primary"
                @click="router.push('/capabilities/apply')"
              >
                Apply for Farmer Capability
              </button>
              <button
                v-else
                class="btn-filter btn-filter--primary"
                @click="router.push('/farmer/listings')"
              >
                Manage Produce Listings →
              </button>
            </div>
          </div>

          <!-- Buyer Portal Card -->
          <div class="portal-card" :class="{ 'portal-card--active': hasBuyerCapability }">
            <div class="portal-header">
              <span class="portal-icon">🏬</span>
              <span class="pill-badge" :class="hasBuyerCapability ? 'pill-badge--green' : 'pill-badge--gold'">
                {{ hasBuyerCapability ? 'ACTIVE CAPABILITY' : 'NOT GRANTED' }}
              </span>
            </div>
            <h3 class="portal-title">Business Buyer Portal</h3>
            <p class="portal-desc">
              Browse verified farmer produce listings, manage shopping cart items, place multi-farmer orders, and settle payments.
            </p>
            <div class="portal-footer buyer-actions">
              <button
                v-if="!hasBuyerCapability"
                class="btn-filter btn-filter--primary"
                @click="router.push('/capabilities/apply')"
              >
                Apply for Buyer Capability
              </button>
              <template v-else>
                <button
                  class="btn-filter btn-filter--primary"
                  @click="router.push('/orders')"
                >
                  My Orders →
                </button>
                <button
                  class="btn-filter btn-filter--clear"
                  @click="router.push('/cart')"
                >
                  View Cart 🛒
                </button>
              </template>
            </div>
          </div>

          <!-- Admin Portal Card -->
          <div v-if="auth.isAdmin" class="portal-card portal-card--admin">
            <div class="portal-header">
              <span class="portal-icon">🛡️</span>
              <span class="pill-badge pill-badge--blue">
                SYSTEM ADMIN
              </span>
            </div>
            <h3 class="portal-title">Admin Governance & Approvals</h3>
            <p class="portal-desc">
              Review applicant verification documents, grant Farmer or Business Buyer capabilities, oversee accounts, and manage platform logs.
            </p>
            <div class="portal-footer">
              <button class="btn-filter btn-filter--primary" @click="router.push('/admin/capability-applications')">
                Review Pending Applications →
              </button>
            </div>
          </div>

        </div>

        <!-- Right Side: Status Overview Donut Card & Table Quick Access -->
        <div class="side-column">
          
          <div class="donut-card">
            <h3 class="donut-card-title">Portal Capability Status</h3>
            <div class="donut-flex">
              <svg class="donut-chart-svg" viewBox="0 0 42 42">
                <circle class="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#e2e8f0" stroke-width="6"></circle>
                <circle
                  class="donut-segment"
                  cx="21" cy="21" r="15.91549430918954"
                  fill="transparent"
                  stroke="#10b981"
                  stroke-width="6"
                  :stroke-dasharray="`${activeCapabilities.length * 50} ${100 - activeCapabilities.length * 50}`"
                  stroke-dashoffset="0"
                ></circle>
              </svg>

              <div class="donut-legend">
                <div class="legend-item">
                  <span class="legend-dot legend-dot--green"></span>
                  <span>Granted ({{ activeCapabilities.length }})</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot legend-dot--orange"></span>
                  <span>Available ({{ 2 - activeCapabilities.length }})</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Royal Table Shortcuts Card -->
          <div class="royal-table-card mt-4">
            <div class="royal-table-header">
              <span class="royal-table-title">⚡ Quick Portals Navigation</span>
            </div>
            <table class="royal-table">
              <tbody>
                <tr>
                  <td class="font-bold">🌾 Marketplace</td>
                  <td class="text-right">
                    <button class="royal-table-btn" @click="router.push('/listings')">Browse →</button>
                  </td>
                </tr>
                <tr>
                  <td class="font-bold">📋 My Orders</td>
                  <td class="text-right">
                    <button class="royal-table-btn" @click="router.push('/orders')">View →</button>
                  </td>
                </tr>
                <tr v-if="auth.isAdmin">
                  <td class="font-bold">🛡️ Governance</td>
                  <td class="text-right">
                    <button class="royal-table-btn" @click="router.push('/admin/capability-applications')">Manage →</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  padding: 1.5rem;
  background: var(--surface);
  min-height: calc(100vh - 60px);
}

.dash-container {
  max-width: 1250px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.dash-welcome-card {
  background: var(--surface-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 1.5rem 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
}

.welcome-title { font-size: 1.6rem; font-weight: 800; color: var(--text-primary); }
.welcome-sub { color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem; font-weight: 600; }

.status-pill-badge {
  display: inline-block;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
}
.status-pill-badge--green { background: #e6f4ea; color: #1e8e3e; }

.admin-mode-tag {
  background: #fef7e0;
  color: #f2994a;
  padding: 0.45rem 0.9rem;
  border-radius: var(--radius-sm);
  font-weight: 800;
  font-size: 0.85rem;
  border: 1px solid #fde68a;
}

.dash-main-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.25rem;
  align-items: start;
}

@media (max-width: 1024px) {
  .dash-main-grid {
    grid-template-columns: 1fr;
  }
}

.portals-column {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.portal-card {
  background: var(--surface-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s, box-shadow 0.2s;
}

.portal-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.portal-card--active { border-color: #b7e1cd; }
.portal-card--admin  { border-color: var(--border); }

.portal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
}

.portal-icon { font-size: 1.8rem; }
.portal-title { font-size: 1.2rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem; }
.portal-desc  { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1.25rem; }

.portal-footer { margin-top: auto; }
.buyer-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }

.mt-4 { margin-top: 1rem; }
.text-right { text-align: right; }
</style>

