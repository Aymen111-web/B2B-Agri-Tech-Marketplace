<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCapabilityStore } from '@/stores/capability'
import api from '@/services/api'

import { getAvatarImage, EMPTY_STATE_IMAGE } from '@/utils/imageHelper'

const router = useRouter()
const authStore = useAuthStore()
const capabilityStore = useCapabilityStore()

const loading = ref(true)
const error = ref('')
const successBanner = ref('')
const errorBanner = ref('')

const statsData = ref({
  kpis: {
    total_gmv: 0,
    total_orders: 0,
    total_farmers: 0,
    total_buyers: 0,
    pending_applications: 0,
    active_listings: 0,
    pending_payouts_count: 0,
    pending_payouts_amount: 0,
    payment_exceptions_count: 0,
  },
  recent_activity: [],
  pending_approvals_preview: [],
  category_distribution: [],
})

const processingAppId = ref(null)

onMounted(async () => {
  await fetchDashboardStats()
})

async function fetchDashboardStats() {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get('/admin/dashboard/stats')
    statsData.value = response.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load admin dashboard analytics.'
  } finally {
    loading.value = false
  }
}

function formatMoney(amount) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0)
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getActionColorClass(action) {
  if (!action) return 'action-default'
  if (action.includes('approved') || action.includes('created') || action.includes('completed')) return 'action-success'
  if (action.includes('rejected') || action.includes('failed') || action.includes('deleted')) return 'action-danger'
  if (action.includes('updated') || action.includes('pending')) return 'action-warning'
  return 'action-info'
}

async function quickApprove(app) {
  if (!confirm(`Approve ${app.user?.first_name} ${app.user?.second_name}'s ${app.capability_type} capability?`)) {
    return
  }
  processingAppId.value = app.id
  successBanner.value = ''
  errorBanner.value = ''
  try {
    await capabilityStore.approveApplication(app.id)
    successBanner.value = `Approved ${app.user?.first_name}'s ${app.capability_type} application!`
    await fetchDashboardStats()
  } catch (err) {
    errorBanner.value = capabilityStore.error || 'Failed to approve application.'
  } finally {
    processingAppId.value = null
  }
}

async function quickReject(app) {
  const reason = prompt(`Reason for rejecting ${app.user?.first_name}'s request:`, 'Documentation requirements not met')
  if (!reason) return

  processingAppId.value = app.id
  successBanner.value = ''
  errorBanner.value = ''
  try {
    await capabilityStore.rejectApplication(app.id, reason)
    successBanner.value = `Rejected application for ${app.user?.first_name}.`
    await fetchDashboardStats()
  } catch (err) {
    errorBanner.value = capabilityStore.error || 'Failed to reject application.'
  } finally {
    processingAppId.value = null
  }
}
</script>

<template>
  <div class="admin-dashboard-overview">
    
    <!-- Hero / Status Banner -->
    <div class="hero-banner">
      <div class="hero-content">
        <div class="hero-left">
          <div class="status-chip">
            <span class="pulse-dot"></span>
            <span>Platform Operational</span>
          </div>
          <h1 class="hero-title">
            Executive Command Center
          </h1>
          <p class="hero-subtitle">
            Welcome back, <strong>{{ authStore.user?.first_name }}</strong>. Here is the real-time health and performance of the B2B Agri-Tech Marketplace.
          </p>
        </div>
        <div class="hero-actions">
          <button class="btn btn-refresh" @click="fetchDashboardStats" :disabled="loading">
            Refresh Stats
          </button>
          <router-link to="/admin/capability-applications" class="btn btn-primary-gold">
            Review Approvals Queue
            <span v-if="statsData.kpis.pending_applications > 0" class="badge-count">
              {{ statsData.kpis.pending_applications }}
            </span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Alert Messages -->
    <div v-if="successBanner" class="alert alert-success">
      ✅ {{ successBanner }}
    </div>
    <div v-if="errorBanner" class="alert alert-error">
      ⚠️ {{ errorBanner }}
    </div>
    <div v-if="error" class="alert alert-error">
      🚨 {{ error }}
    </div>

    <!-- 6 KPI Metric Cards Grid -->
    <div class="kpi-grid">

      <!-- GMV Card -->
      <div class="kpi-card kpi-card--emerald">
        <div class="kpi-card__top">
          <img src="/images/coffee_produce.jpg" class="admin-kpi-img crop-circle" alt="GMV" />
          <span class="kpi-tag">Gross Volume</span>
        </div>
        <div class="kpi-card__value">
          <span class="currency-unit">ETB</span> {{ formatMoney(statsData.kpis.total_gmv) }}
        </div>
        <div class="kpi-card__sub">
          Total orders volume ({{ statsData.kpis.total_orders }} orders placed)
        </div>
      </div>

      <!-- Verified Farmers Card -->
      <div class="kpi-card">
        <div class="kpi-card__top">
          <img :src="getAvatarImage('farmer')" class="admin-kpi-img avatar-circle" alt="Farmers" />
          <span class="kpi-tag">Agri Sellers</span>
        </div>
        <div class="kpi-card__value">
          {{ statsData.kpis.total_farmers }}
        </div>
        <div class="kpi-card__sub">
          Active verified farmer accounts
        </div>
      </div>

      <!-- Verified Buyers Card -->
      <div class="kpi-card">
        <div class="kpi-card__top">
          <img :src="getAvatarImage('buyer')" class="admin-kpi-img avatar-circle" alt="Buyers" />
          <span class="kpi-tag">Wholesale Buyers</span>
        </div>
        <div class="kpi-card__value">
          {{ statsData.kpis.total_buyers }}
        </div>
        <div class="kpi-card__sub">
          Active verified business buyers
        </div>
      </div>

      <!-- Pending Applications Queue -->
      <div class="kpi-card" :class="{ 'kpi-card--warn': statsData.kpis.pending_applications > 0 }">
        <div class="kpi-card__top">
          <img src="/images/seeds_produce.svg" class="admin-kpi-img" alt="Approvals" />
          <span class="kpi-tag">Approvals Queue</span>
        </div>
        <div class="kpi-card__value">
          {{ statsData.kpis.pending_applications }}
        </div>
        <div class="kpi-card__sub">
          Pending capability requests
        </div>
      </div>

      <!-- Pending Farmer Payouts Pool -->
      <div class="kpi-card">
        <div class="kpi-card__top">
          <svg class="kpi-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
          <span class="kpi-tag">Farmer Escrow</span>
        </div>
        <div class="kpi-card__value">
          <span class="currency-unit">ETB</span> {{ formatMoney(statsData.kpis.pending_payouts_amount) }}
        </div>
        <div class="kpi-card__sub">
          {{ statsData.kpis.pending_payouts_count }} pending settlements
        </div>
      </div>

      <!-- Payment Exception Disputes -->
      <div class="kpi-card" :class="{ 'kpi-card--alert': statsData.kpis.payment_exceptions_count > 0 }">
        <div class="kpi-card__top">
          <svg class="kpi-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <span class="kpi-tag">Disputes Watch</span>
        </div>
        <div class="kpi-card__value">
          {{ statsData.kpis.payment_exceptions_count }}
        </div>
        <div class="kpi-card__sub">
          Unresolved payment exceptions
        </div>
      </div>

    </div>

    <!-- Main Two-Column Content Layout -->
    <div class="dashboard-body">

      <!-- Left Column: Quick Approvals + Category Breakdown -->
      <div class="body-col body-col--main">
        
        <!-- Quick Capability Approvals Table -->
        <div class="panel-card">
          <div class="panel-card__header">
            <div>
              <h3 class="panel-title">
                Pending Verification Queue
              </h3>
              <p class="panel-sub">
                Quick 1-click approvals for farmer & buyer application requests
              </p>
            </div>
            <router-link to="/admin/capability-applications" class="view-all-link">
              View All Applications →
            </router-link>
          </div>

          <div v-if="loading" class="panel-loading">
            Loading verification queue...
          </div>

          <div v-else-if="statsData.pending_approvals_preview.length === 0" class="panel-empty">
            <p>No pending capability applications require approval!</p>
          </div>

          <div v-else class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Phone</th>
                  <th>Requested Capability</th>
                  <th>Submitted</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="app in statsData.pending_approvals_preview" :key="app.id">
                  <td>
                    <div class="user-cell">
                      <span class="user-avatar">
                        {{ app.user?.first_name?.[0] || 'U' }}
                      </span>
                      <div>
                        <div class="user-name">
                          {{ app.user?.first_name }} {{ app.user?.second_name }}
                        </div>
                        <div class="user-id">User ID: #{{ app.user_id }}</div>
                      </div>
                    </div>
                  </td>
                  <td>{{ app.user?.phone || '-' }}</td>
                  <td>
                    <span class="role-chip" :class="`role-chip--${app.capability_type}`">
                      {{ app.capability_type === 'farmer' ? 'Farmer' : 'Business Buyer' }}
                    </span>
                  </td>
                  <td class="date-text">{{ formatDate(app.created_at) }}</td>
                  <td class="text-right">
                    <div class="quick-btns">
                      <button
                        class="btn-quick-approve"
                        :disabled="processingAppId === app.id"
                        @click="quickApprove(app)"
                      >
                        Approve
                      </button>
                      <button
                        class="btn-quick-reject"
                        :disabled="processingAppId === app.id"
                        @click="quickReject(app)"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Crop Categories Breakdown -->
        <div class="panel-card">
          <div class="panel-card__header">
            <div>
              <h3 class="panel-title">
                Active Crop Produce Categories
              </h3>
              <p class="panel-sub">
                Distribution of active crop listings across marketplace categories
              </p>
            </div>
            <span class="listings-badge">
              Total {{ statsData.kpis.active_listings }} Active Listings
            </span>
          </div>

          <div class="categories-list">
            <div
              v-for="cat in statsData.category_distribution"
              :key="cat.id"
              class="cat-row"
            >
              <div class="cat-info">
                <span class="cat-name">{{ cat.name }}</span>
                <span class="cat-count">{{ cat.active_listings }} listings</span>
              </div>
              <div class="cat-bar-bg">
                <div
                  class="cat-bar-fill"
                  :style="{
                    width: statsData.kpis.active_listings > 0
                      ? `${Math.min(100, Math.max(8, (cat.active_listings / statsData.kpis.active_listings) * 100))}%`
                      : '0%'
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Right Column: Real-time Audit Timeline & Quick Hub -->
      <div class="body-col body-col--side">
        
        <!-- Live Audit Timeline -->
        <div class="panel-card">
          <div class="panel-card__header">
            <div>
              <h3 class="panel-title">
                Real-Time Audit Feed
              </h3>
              <p class="panel-sub">
                Live system event trail
              </p>
            </div>
          </div>

          <div v-if="loading" class="panel-loading">
            Loading activity stream...
          </div>

          <div v-else-if="statsData.recent_activity.length === 0" class="panel-empty">
            <p>No recent audit logs available.</p>
          </div>

          <div v-else class="timeline-list">
            <div
              v-for="log in statsData.recent_activity"
              :key="log.id"
              class="timeline-item"
            >
              <div class="timeline-icon-wrap" :class="getActionColorClass(log.action)">
                <svg class="timeline-svg" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div class="timeline-body">
                <div class="timeline-action">
                  <strong>{{ log.action }}</strong>
                </div>
                <div class="timeline-meta">
                  <span class="timeline-user">
                    {{ log.user ? log.user.name : 'System / Guest' }}
                  </span>
                  <span class="timeline-time">• {{ formatDate(log.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Governance Quick Links -->
        <div class="panel-card panel-card--highlight">
          <h3 class="panel-title">
            Admin Governance Actions
          </h3>
          <p class="panel-sub">
            Direct access to core administration portals
          </p>

          <div class="gov-nav-grid">
            <router-link to="/admin/capability-applications" class="gov-link">
              <svg class="gov-svg" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <div class="gov-text">
                <strong>Capability Approvals</strong>
                <span>Review documents & grant farmer/buyer roles</span>
              </div>
            </router-link>
            <router-link to="/listings" class="gov-link">
              <svg class="gov-svg" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              <div class="gov-text">
                <strong>Produce Marketplace</strong>
                <span>Inspect crop listings & verify batches</span>
              </div>
            </router-link>
          </div>
        </div>

      </div>

    </div>

  </div>
</template>

<style scoped>
.admin-dashboard-overview {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Hero Banner */
.hero-banner {
  background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%);
  border-radius: var(--radius-md);
  padding: 1.75rem 2rem;
  color: #ffffff;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}
.hero-left {
  max-width: 680px;
}
.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.4);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 0.6rem;
}
.pulse-dot {
  width: 8px;
  height: 8px;
  background: #34d399;
  border-radius: 50%;
  box-shadow: 0 0 8px #34d399;
}
.hero-title {
  font-size: 1.65rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.4rem;
  letter-spacing: -0.01em;
}
.hero-subtitle {
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.5;
}
.hero-subtitle strong {
  color: #fbbf24;
}
.hero-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.15rem;
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease;
}
.btn-refresh {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.btn-refresh:hover {
  background: rgba(255, 255, 255, 0.22);
}
.btn-primary-gold {
  background: #fbbf24;
  color: #0f172a;
  border: none;
  position: relative;
}
.btn-primary-gold:hover {
  background: #f59e0b;
}
.badge-count {
  background: #ef4444;
  color: #fff;
  font-size: 0.7rem;
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-full);
  margin-left: 0.25rem;
}
.spin-icon {
  display: inline-block;
  animation: spin 1s infinite linear;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Alerts */
.alert {
  padding: 0.85rem 1.15rem;
  border-radius: var(--radius-xs);
  font-size: 0.875rem;
  font-weight: 600;
}
.alert-success { background: var(--brand-green-light); color: var(--brand-green-dark); border: 1px solid var(--brand-green-border); }
.alert-error   { background: var(--error-bg); color: var(--error-dark); border: 1px solid var(--error-border); }

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.15rem;
}
.kpi-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.25rem 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  box-shadow: var(--shadow-xs);
  transition: all 0.2s ease;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--brand-green);
}
.kpi-card--emerald {
  border-left: 4px solid var(--brand-green);
}
.kpi-card--warn {
  border-left: 4px solid #f59e0b;
  background: rgba(245, 158, 11, 0.03);
}
.kpi-card--alert {
  border-left: 4px solid #ef4444;
  background: rgba(239, 68, 68, 0.03);
}

.kpi-card__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.kpi-icon {
  font-size: 1.35rem;
}
.kpi-tag {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}
.kpi-card__value {
  font-size: 1.55rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}
.currency-unit {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--brand-green-dark);
}
.kpi-card__sub {
  font-size: 0.78125rem;
  color: var(--text-secondary);
}

/* Two-Column Layout */
.dashboard-body {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.25rem;
}
@media (max-width: 1024px) {
  .dashboard-body {
    grid-template-columns: 1fr;
  }
}

.body-col {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Panel Card */
.panel-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.35rem;
  box-shadow: var(--shadow-xs);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.panel-card--highlight {
  background: var(--surface-alt);
  border-color: var(--border);
}

.panel-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.panel-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
}
.panel-sub {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-top: 0.15rem;
}
.view-all-link {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--brand-green);
  text-decoration: none;
}
.view-all-link:hover {
  text-decoration: underline;
}
.listings-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.65rem;
  border-radius: var(--radius-full);
  background: var(--brand-green-light);
  color: var(--brand-green-dark);
}

.panel-loading, .panel-empty {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.875rem;
}
.empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
}

/* Data Table */
.table-responsive {
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
.data-table th {
  background: var(--surface-alt);
  padding: 0.65rem 0.85rem;
  font-weight: 700;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
}
.data-table td {
  padding: 0.75rem 0.85rem;
  border-bottom: 1px solid var(--border-subtle);
  vertical-align: middle;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--brand-green);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}
.user-name {
  font-weight: 700;
  color: var(--text-primary);
}
.user-id {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.role-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 700;
}
.role-chip--farmer { background: var(--brand-green-light); color: var(--brand-green-dark); }
.role-chip--buyer  { background: #eff6ff; color: #1d4ed8; }

.date-text {
  font-size: 0.78125rem;
  color: var(--text-secondary);
}
.text-right {
  text-align: right;
}

.quick-btns {
  display: flex;
  gap: 0.35rem;
  justify-content: flex-end;
}
.btn-quick-approve {
  padding: 0.25rem 0.65rem;
  background: var(--brand-green);
  color: #fff;
  border: none;
  border-radius: var(--radius-xs);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}
.btn-quick-approve:hover:not(:disabled) { background: var(--brand-green-dark); }

.btn-quick-reject {
  padding: 0.25rem 0.65rem;
  background: var(--error-bg);
  color: var(--error-dark);
  border: 1px solid var(--error-border);
  border-radius: var(--radius-xs);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}
.btn-quick-reject:hover:not(:disabled) { background: var(--error); color: #fff; }

/* Categories Progress List */
.categories-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.cat-row {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.cat-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8125rem;
}
.cat-name {
  font-weight: 600;
  color: var(--text-primary);
}
.cat-count {
  font-weight: 700;
  color: var(--text-muted);
}
.cat-bar-bg {
  height: 8px;
  background: var(--surface-alt);
  border-radius: var(--radius-full);
  overflow: hidden;
  border: 1px solid var(--border-subtle);
}
.cat-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: var(--radius-full);
  transition: width 0.4s ease;
}

/* Timeline Feed */
.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.timeline-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}
.timeline-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  flex-shrink: 0;
  background: var(--surface-alt);
  border: 1px solid var(--border);
}
.action-success { background: var(--brand-green-light); border-color: var(--brand-green-border); }
.action-danger  { background: var(--error-bg); border-color: var(--error-border); }
.action-warning { background: #fef3c7; border-color: #fde68a; }

.timeline-body {
  flex: 1;
  overflow: hidden;
}
.timeline-action {
  font-size: 0.8125rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.timeline-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.1rem;
}
.timeline-user {
  font-weight: 600;
}

/* Governance Links */
.gov-nav-grid {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.5rem;
}
.gov-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.15s ease;
}
.gov-link:hover {
  border-color: var(--brand-green);
  transform: translateX(3px);
}
.gov-icon {
  font-size: 1.25rem;
}
.gov-text strong {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
}
.gov-text span {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* Image Styling */
.admin-kpi-img { width: 28px; height: 28px; object-fit: contain; }
.admin-kpi-img.crop-circle { border-radius: 50%; object-fit: cover; }
.admin-kpi-img.avatar-circle { border-radius: 50%; object-fit: cover; }
</style>
