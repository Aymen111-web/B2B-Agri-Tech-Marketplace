<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCapabilityStore } from '@/stores/capability'

const auth = useAuthStore()
const capabilityStore = useCapabilityStore()
const router = useRouter()

const selectedStatus = ref('pending')
const selectedType = ref('')

const showRejectModal = ref(false)
const selectedAppForReject = ref(null)
const rejectionReason = ref('')
const processingId = ref(null)

const bannerSuccess = ref('')
const bannerError = ref('')

async function handleLogout() {
  await auth.logout()
  router.push('/')
}

onMounted(async () => {
  if (!auth.isAdmin) {
    router.push('/dashboard')
    return
  }
  await loadApplications()
})

async function loadApplications() {
  const params = {}
  if (selectedStatus.value) params.status = selectedStatus.value
  if (selectedType.value) params.capability_type = selectedType.value
  await capabilityStore.fetchAdminApplications(params)
}

function handleStatusFilter(status) {
  selectedStatus.value = status
  loadApplications()
}

function handleTypeFilter(event) {
  selectedType.value = event.target.value
  loadApplications()
}

async function handleApprove(app) {
  if (!confirm(`Approve ${app.user?.first_name} ${app.user?.second_name}'s ${app.capability_type} capability?`)) {
    return
  }

  processingId.value = app.id
  bannerSuccess.value = ''
  bannerError.value = ''

  try {
    const res = await capabilityStore.approveApplication(app.id)
    bannerSuccess.value = res.message || 'Capability approved successfully.'
    await loadApplications()
  } catch (err) {
    bannerError.value = capabilityStore.error || 'Failed to approve application.'
  } finally {
    processingId.value = null
  }
}

function openRejectModal(app) {
  selectedAppForReject.value = app
  rejectionReason.value = ''
  showRejectModal.value = true
}

function closeRejectModal() {
  selectedAppForReject.value = null
  rejectionReason.value = ''
  showRejectModal.value = false
}

async function submitRejection() {
  if (!rejectionReason.value.trim()) {
    alert('Please enter a rejection reason.')
    return
  }

  const app = selectedAppForReject.value
  processingId.value = app.id
  bannerSuccess.value = ''
  bannerError.value = ''

  try {
    const res = await capabilityStore.rejectApplication(app.id, rejectionReason.value.trim())
    bannerSuccess.value = res.message || 'Application rejected successfully.'
    closeRejectModal()
    await loadApplications()
  } catch (err) {
    bannerError.value = capabilityStore.error || 'Failed to reject application.'
  } finally {
    processingId.value = null
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
import ThemeToggle from '@/components/ThemeToggle.vue'
</script>

<template>
  <div class="admin-cap-view">
    
    <!-- Top Navigation Bar -->
    <nav class="top-nav">
      <div class="top-nav__inner">
        <router-link to="/dashboard" class="top-nav__brand">
          🌿 Agri<strong>Market</strong>
        </router-link>
        <div class="top-nav__right">
          <router-link to="/dashboard" class="top-nav__link">
            Dashboard
          </router-link>
          <router-link to="/listings" class="top-nav__link">
            Marketplace
          </router-link>
          <router-link to="/admin/capability-applications" class="top-nav__link active">
            🛡️ Approvals
          </router-link>
          <ThemeToggle />
          <span class="user-pill">
            🛡️ {{ auth.user?.first_name }}
          </span>
          <button @click="handleLogout" class="top-nav__logout">
            Sign Out
          </button>
        </div>
      </div>
    </nav>

    <!-- Page Header -->
    <header class="admin-header">
      <div class="admin-header__inner">
        <div class="hero-header-flex">
          <div>
            <h1 class="hero-title">Capability Approvals Queue</h1>
            <p class="hero-sub">Review and verify Ethiopian farmer & business buyer registration requests</p>
          </div>
          <div class="trust-chips">
            <span class="chip">🛡️ Admin Verification</span>
            <span class="chip">📜 License Inspection</span>
            <span class="chip">⚡ Instant Grant</span>
          </div>
        </div>

        <!-- High Contrast Status Filter Tabs -->
        <div class="filter-tabs-wrap">
          <div class="hero-filter-tabs">
            <button
              class="tab-pill"
              :class="{ active: selectedStatus === 'pending' }"
              @click="handleStatusFilter('pending')"
            >
              ⏳ Pending Approval
            </button>
            <button
              class="tab-pill"
              :class="{ active: selectedStatus === 'approved' }"
              @click="handleStatusFilter('approved')"
            >
              ✅ Approved
            </button>
            <button
              class="tab-pill"
              :class="{ active: selectedStatus === 'rejected' }"
              @click="handleStatusFilter('rejected')"
            >
              🛑 Rejected
            </button>
            <button
              class="tab-pill"
              :class="{ active: selectedStatus === '' }"
              @click="handleStatusFilter('')"
            >
              All Applications
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="admin-main">
      <div class="admin-container">

        <!-- Banners -->
        <div v-if="bannerSuccess" class="alert alert-success">
          ✅ {{ bannerSuccess }}
        </div>
        <div v-if="bannerError" class="alert alert-error">
          ⚠️ {{ bannerError }}
        </div>

        <!-- Secondary Controls Bar -->
        <div class="controls-bar">
          <div class="type-filter">
            <label for="type-select">Capability Type:</label>
            <select id="type-select" :value="selectedType" @change="handleTypeFilter">
              <option value="">All Capability Types</option>
              <option value="farmer">🌾 Farmer</option>
              <option value="buyer">🏬 Business Buyer</option>
            </select>
          </div>
          <div class="stats-counter">
            Showing <strong>{{ capabilityStore.adminApplications.length }}</strong> application(s)
          </div>
        </div>

        <!-- Table Card -->
        <div class="table-card">
          <div v-if="capabilityStore.loading" class="state-box">
            <div class="spinner"></div>
            <p class="state-title">Loading capability requests...</p>
          </div>

          <div v-else-if="capabilityStore.adminApplications.length === 0" class="state-box empty-state">
            <div class="empty-icon">🛡️</div>
            <h3 class="state-title">No capability requests found</h3>
            <p class="state-sub">There are no applications matching the selected filters.</p>
          </div>

          <div v-else class="app-table-wrap">
            <table class="app-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Phone Number</th>
                  <th>Requested Capability</th>
                  <th>Submission Date</th>
                  <th>Verification Info</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="app in capabilityStore.adminApplications" :key="app.id">
                  <td>
                    <div class="user-info">
                      <span class="user-name">
                        {{ app.user?.first_name }} {{ app.user?.second_name }}
                      </span>
                      <span class="user-id">User ID: #{{ app.user_id }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="phone-num">{{ app.user?.phone || '-' }}</span>
                  </td>
                  <td>
                    <span class="cap-type-badge" :class="`cap-type-badge--${app.capability_type}`">
                      {{ app.capability_type === 'farmer' ? '🌾 Farmer' : '🏬 Business Buyer' }}
                    </span>
                  </td>
                  <td class="date-cell">{{ formatDate(app.created_at) }}</td>
                  <td>
                    <div v-if="app.supporting_documents" class="doc-list">
                      <div v-for="(val, key) in app.supporting_documents" :key="key" class="doc-row">
                        <strong>{{ key.replace(/_/g, ' ') }}:</strong> {{ val }}
                      </div>
                    </div>
                    <span v-else class="text-muted">No documents attached</span>
                  </td>
                  <td>
                    <span class="status-badge" :class="`badge--${app.status}`">
                      {{ app.status.toUpperCase() }}
                    </span>
                  </td>
                  <td>
                    <div v-if="app.status === 'pending'" class="action-btns">
                      <button
                        class="btn-approve"
                        :disabled="processingId === app.id"
                        @click="handleApprove(app)"
                      >
                        Approve
                      </button>
                      <button
                        class="btn-reject"
                        :disabled="processingId === app.id"
                        @click="openRejectModal(app)"
                      >
                        Reject
                      </button>
                    </div>
                    <span v-else-if="app.status === 'approved'" class="text-success font-semibold">
                      Granted ✓
                    </span>
                    <span v-else-if="app.status === 'rejected'" class="text-danger font-semibold">
                      Rejected ✗
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>

    <!-- Rejection Modal -->
    <div v-if="showRejectModal" class="modal-overlay">
      <div class="modal-card">
        <h3 class="modal-title">Reject Capability Request</h3>
        <p class="modal-sub">
          Please state the reason for rejecting {{ selectedAppForReject?.user?.first_name }}'s
          {{ selectedAppForReject?.capability_type }} request.
        </p>

        <div class="form-group">
          <label for="rejection-input">Rejection Reason *</label>
          <textarea
            id="rejection-input"
            v-model="rejectionReason"
            rows="3"
            placeholder="e.g. Invalid TIN number provided. Please re-submit with verified license."
          ></textarea>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="closeRejectModal">
            Cancel
          </button>
          <button
            class="btn-confirm-reject"
            :disabled="!rejectionReason.trim() || processingId !== null"
            @click="submitRejection"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.admin-cap-view {
  min-height: 100vh;
  background: var(--surface-alt);
}

/* Top Navigation Bar */
.top-nav {
  background: #064e3b;
  padding: 0 1.5rem;
  box-shadow: var(--shadow-xs);
}
.top-nav__inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.top-nav__brand {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  text-decoration: none;
}
.top-nav__brand strong { color: var(--brand-gold); }
.top-nav__right { display: flex; align-items: center; gap: 0.85rem; }
.top-nav__link {
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  font-size: 0.825rem;
  font-weight: 600;
  padding: 0.3rem 0.6rem;
  border-radius: var(--radius-xs);
  transition: all 0.15s ease;
}
.top-nav__link.active, .top-nav__link:hover {
  background: rgba(255,255,255,0.18);
  color: #fff;
}
.user-pill {
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.8rem;
  font-weight: 600;
}
.top-nav__logout {
  background: rgba(255,255,255,0.12);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: var(--radius-xs);
  padding: 0.3rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}
.top-nav__logout:hover { background: rgba(255,255,255,0.22); }

/* Hero Header */
.admin-header {
  background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%);
  color: #fff;
  padding: 1.5rem 1.5rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.admin-header__inner {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.hero-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.15rem;
  letter-spacing: -0.01em;
}
.hero-sub {
  color: #94a3b8;
  font-size: 0.85rem;
}

.trust-chips {
  display: flex;
  gap: 0.4rem;
}
.chip {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* Filter Tabs Carousel — High Contrast Styling */
.filter-tabs-wrap {
  overflow-x: auto;
  padding-bottom: 0.15rem;
}
.hero-filter-tabs {
  display: flex;
  gap: 0.4rem;
  white-space: nowrap;
}
.tab-pill {
  background: rgba(255, 255, 255, 0.15) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: var(--radius-full);
  padding: 0.35rem 0.95rem;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}
.tab-pill:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  color: #ffffff !important;
  border-color: #ffffff !important;
}
.tab-pill.active {
  background: #fbbf24 !important;
  color: #0f172a !important;
  border-color: #fbbf24 !important;
  font-weight: 800;
  box-shadow: 0 3px 10px rgba(251, 191, 36, 0.4);
}

/* Main Layout */
.admin-main {
  padding: 1.5rem 1.5rem 3.5rem;
}
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
  font-weight: 600;
}
.alert-success { background: var(--brand-green-light); color: var(--brand-green-dark); border: 1px solid var(--brand-green-border); }
.alert-error   { background: var(--error-bg); color: var(--error-dark); border: 1px solid var(--error-border); }

.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.65rem 1rem;
  font-size: 0.8125rem;
  box-shadow: var(--shadow-xs);
}
.type-filter {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  color: var(--text-secondary);
}
.type-filter select {
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  font-size: 0.8125rem;
  font-weight: 600;
  background: var(--surface);
  color: var(--text-primary);
  outline: none;
}
.stats-counter { color: var(--text-secondary); }

/* Table Section */
.table-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-xs);
}

.state-box {
  padding: 3rem 1.5rem;
  text-align: center;
}
.empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
.state-title { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }
.state-sub { font-size: 0.825rem; color: var(--text-secondary); margin-top: 0.25rem; }

.app-table-wrap { overflow-x: auto; }
.app-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.825rem; }
.app-table th {
  background: var(--surface-alt);
  padding: 0.65rem 0.85rem;
  font-weight: 700;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
}
.app-table td {
  padding: 0.75rem 0.85rem;
  border-bottom: 1px solid var(--border-subtle);
  vertical-align: top;
}

.user-name { font-weight: 700; display: block; color: var(--text-primary); }
.user-id { font-size: 0.72rem; color: var(--text-muted); }
.phone-num { font-weight: 600; color: var(--text-secondary); }

.cap-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 700;
}
.cap-type-badge--farmer { background: var(--brand-green-light); color: var(--brand-green-dark); }
.cap-type-badge--buyer  { background: #eff6ff; color: #1d4ed8; }

.date-cell { font-size: 0.78125rem; color: var(--text-secondary); white-space: nowrap; }

.doc-list { display: flex; flex-direction: column; gap: 0.15rem; font-size: 0.78125rem; }
.doc-row strong { text-transform: capitalize; color: var(--text-secondary); }

.status-badge {
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.badge--pending  { background: var(--brand-gold-light); color: var(--brand-gold-dark); }
.badge--approved { background: var(--brand-green-light); color: var(--brand-green-dark); }
.badge--rejected { background: var(--error-bg); color: var(--error-dark); }

.action-btns { display: flex; gap: 0.35rem; }
.btn-approve {
  padding: 0.3rem 0.65rem;
  background: var(--brand-green);
  color: #fff;
  border: none;
  border-radius: var(--radius-xs);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}
.btn-approve:hover:not(:disabled) { background: var(--brand-green-dark); }

.btn-reject {
  padding: 0.3rem 0.65rem;
  background: var(--error-bg);
  color: var(--error-dark);
  border: 1px solid var(--error-border);
  border-radius: var(--radius-xs);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}
.btn-reject:hover:not(:disabled) { background: var(--error); color: #fff; }

.text-success { color: var(--brand-green-dark); }
.text-danger  { color: var(--error-dark); }
.font-semibold { font-weight: 600; }
.text-muted   { color: var(--text-muted); font-size: 0.78125rem; }

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 1000;
}
.modal-card {
  background: var(--surface-card);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  max-width: 440px;
  width: 100%;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border);
}
.modal-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.25rem; color: var(--text-primary); }
.modal-sub   { font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 1rem; }

.form-group { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 1rem; }
.form-group label { font-size: 0.78125rem; font-weight: 600; color: var(--text-primary); }
.form-group textarea {
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  font-size: 0.8125rem;
  font-family: var(--font-sans);
  background: var(--surface);
  color: var(--text-primary);
  outline: none;
}
.form-group textarea:focus { border-color: var(--brand-green); }

.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
.btn-cancel {
  padding: 0.45rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  background: var(--surface-alt);
  color: var(--text-primary);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-confirm-reject {
  padding: 0.45rem 0.85rem;
  border: none;
  border-radius: var(--radius-xs);
  background: var(--error);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
}
.btn-confirm-reject:disabled { opacity: 0.5; cursor: not-allowed; }

.spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--brand-green); border-radius: 50%;
  animation: spin 0.8s linear infinite; margin: 0 auto 0.75rem;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
