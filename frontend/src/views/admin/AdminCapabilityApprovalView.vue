<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCapabilityStore } from '@/stores/capability'

const auth = useAuthStore()
const capabilityStore = useCapabilityStore()
const router = useRouter()

const selectedStatus = ref('pending')
const selectedType = ref('')
const hideCards = ref(false)

const showRejectModal = ref(false)
const selectedAppForReject = ref(null)
const rejectionReason = ref('')
const processingId = ref(null)

const bannerSuccess = ref('')
const bannerError = ref('')

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

function handleApplyFilter() {
  loadApplications()
}

function handleClearFilter() {
  selectedStatus.value = ''
  selectedType.value = ''
  loadApplications()
}

async function handleApprove(app) {
  if (!confirm(`Are you sure you want to approve ${app.user?.first_name} ${app.user?.second_name}'s ${app.capability_type} capability?`)) {
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
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/* Computed KPI Metrics */
const totalAppsCount = computed(() => capabilityStore.adminApplications.length)
const pendingCount = computed(() => capabilityStore.adminApplications.filter(a => a.status === 'pending').length)
const approvedFarmerCount = computed(() => capabilityStore.adminApplications.filter(a => a.status === 'approved' && a.capability_type === 'farmer').length)
const approvedBuyerCount = computed(() => capabilityStore.adminApplications.filter(a => a.status === 'approved' && a.capability_type === 'buyer').length)
const rejectedCount = computed(() => capabilityStore.adminApplications.filter(a => a.status === 'rejected').length)

/* Donut Calculations */
const pendingPercent = computed(() => totalAppsCount.value ? Math.round((pendingCount.value / totalAppsCount.value) * 100) : 0)
const approvedPercent = computed(() => totalAppsCount.value ? Math.round(((approvedFarmerCount.value + approvedBuyerCount.value) / totalAppsCount.value) * 100) : 0)
const rejectedPercent = computed(() => totalAppsCount.value ? Math.round((rejectedCount.value / totalAppsCount.value) * 100) : 0)
</script>

<template>
  <div class="admin-dashboard-page">
    <div class="page-container">
      
      <!-- Banners -->
      <div v-if="bannerSuccess" class="banner banner--success">
        ✅ {{ bannerSuccess }}
      </div>
      <div v-if="bannerError" class="banner banner--error">
        ⚠️ {{ bannerError }}
      </div>

      <!-- Filter Controls Action Bar -->
      <div class="filter-bar">
        <div class="filter-group">
          <div class="filter-field">
            <select v-model="selectedStatus" class="filter-select" id="status-filter-select">
              <option value="">All Statuses</option>
              <option value="pending">⏳ Pending Approval</option>
              <option value="approved">✅ Approved</option>
              <option value="rejected">🛑 Rejected</option>
            </select>
          </div>

          <div class="filter-field">
            <select v-model="selectedType" class="filter-select" id="type-filter-select">
              <option value="">All Capability Types</option>
              <option value="farmer">🌾 Farmer</option>
              <option value="buyer">🏬 Business Buyer</option>
            </select>
          </div>

          <button class="btn-filter btn-filter--primary" @click="handleApplyFilter">
            <span>🔍 Filter</span>
          </button>
          
          <button class="btn-filter btn-filter--clear" @click="handleClearFilter">
            <span>❌ Clear</span>
          </button>
        </div>

        <div class="toggle-switch-wrap">
          <label class="switch">
            <input type="checkbox" v-model="hideCards" />
            <span class="slider"></span>
          </label>
          <span>Hide Cards</span>
        </div>
      </div>

      <!-- KPI Summary Cards (Hideable via Toggle) -->
      <div v-if="!hideCards" class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-info">
            <span class="kpi-label">Pending Approval</span>
            <span class="kpi-value">{{ pendingCount }}</span>
          </div>
          <div class="kpi-icon-box kpi-icon-box--yellow">⚡</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-info">
            <span class="kpi-label">Approved Farmers</span>
            <span class="kpi-value">{{ approvedFarmerCount }}</span>
          </div>
          <div class="kpi-icon-box kpi-icon-box--green">🌾</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-info">
            <span class="kpi-label">Approved Buyers</span>
            <span class="kpi-value">{{ approvedBuyerCount }}</span>
          </div>
          <div class="kpi-icon-box kpi-icon-box--blue">👤</div>
        </div>

        <div class="kpi-card kpi-card--accent-mint">
          <div class="kpi-info">
            <span class="kpi-label">Total Applications</span>
            <span class="kpi-value">{{ totalAppsCount }}</span>
          </div>
          <div class="kpi-icon-box kpi-icon-box--teal">📜</div>
        </div>
      </div>

      <!-- Main Section Grid: Royal Blue Table + Donut Chart -->
      <div class="dashboard-main-grid">
        
        <!-- Deep Royal Blue Table Card -->
        <div class="royal-table-card flex-table">
          <div class="royal-table-header">
            <div class="royal-table-title">
              <span>📋 Candidate Capability Applications</span>
              <span class="live-dot-wrap">
                <span class="live-dot"></span> Live
              </span>
            </div>
            <div class="royal-table-actions">
              <button class="royal-table-btn" @click="loadApplications" title="Reload Applications">
                🔄 Reload
              </button>
            </div>
          </div>

          <div v-if="capabilityStore.loading" class="state-msg">
            <div class="spinner"></div>
            <span>Loading applications...</span>
          </div>

          <div v-else-if="capabilityStore.adminApplications.length === 0" class="state-msg">
            <span>No capability applications found matching criteria.</span>
          </div>

          <div v-else class="app-table-wrap">
            <table class="royal-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Applicant</th>
                  <th>Phone Number</th>
                  <th>Type</th>
                  <th>Submitted Date</th>
                  <th>Status Progress</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(app, idx) in capabilityStore.adminApplications" :key="app.id">
                  <td class="font-bold">{{ idx + 1 }}</td>
                  <td>
                    <div class="user-info">
                      <span class="user-name">
                        {{ app.user?.first_name }} {{ app.user?.second_name }}
                      </span>
                      <span class="user-id">ID: #{{ app.user_id }}</span>
                    </div>
                  </td>
                  <td class="font-semibold">{{ app.user?.phone || '-' }}</td>
                  <td>
                    <span class="cap-type-pill" :class="`cap-type-pill--${app.capability_type}`">
                      {{ app.capability_type === 'farmer' ? '🌾 Farmer' : '🏬 Buyer' }}
                    </span>
                  </td>
                  <td class="date-cell">{{ formatDate(app.created_at) }}</td>
                  <td class="progress-cell">
                    <div class="progress-flex">
                      <span class="pill-badge" :class="{
                        'pill-badge--orange': app.status === 'pending',
                        'pill-badge--green': app.status === 'approved',
                        'pill-badge--red': app.status === 'rejected'
                      }">
                        {{ app.status.toUpperCase() }}
                      </span>
                      <div class="progress-bar-wrap">
                        <div class="progress-bar-fill" :class="{
                          'progress-bar-fill--gold': app.status === 'pending',
                          'progress-bar-fill--green': app.status === 'approved',
                          'progress-bar-fill--blue': app.status === 'rejected'
                        }" :style="{ width: app.status === 'approved' ? '100%' : (app.status === 'pending' ? '50%' : '10%') }"></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div v-if="app.status === 'pending'" class="action-btns">
                      <button
                        class="btn-action btn-action--approve"
                        :disabled="processingId === app.id"
                        @click="handleApprove(app)"
                      >
                        Approve
                      </button>
                      <button
                        class="btn-action btn-action--reject"
                        :disabled="processingId === app.id"
                        @click="openRejectModal(app)"
                      >
                        Reject
                      </button>
                    </div>
                    <span v-else-if="app.status === 'approved'" class="text-granted font-bold">
                      Approved ✓
                    </span>
                    <span v-else-if="app.status === 'rejected'" class="text-rejected font-bold">
                      Rejected ✗
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Donut & Percent Visual Analytics Card -->
        <div class="donut-card side-analytics">
          <h3 class="donut-card-title">Candidate Status in Percent</h3>
          <div class="donut-flex">
            <svg class="donut-chart-svg" viewBox="0 0 42 42">
              <circle class="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#e2e8f0" stroke-width="6"></circle>
              
              <!-- Pending segment (Orange) -->
              <circle
                class="donut-segment"
                cx="21" cy="21" r="15.91549430918954"
                fill="transparent"
                stroke="#f59e0b"
                stroke-width="6"
                :stroke-dasharray="`${pendingPercent} ${100 - pendingPercent}`"
                stroke-dashoffset="0"
              ></circle>
              
              <!-- Approved segment (Green) -->
              <circle
                class="donut-segment"
                cx="21" cy="21" r="15.91549430918954"
                fill="transparent"
                stroke="#10b981"
                stroke-width="6"
                :stroke-dasharray="`${approvedPercent} ${100 - approvedPercent}`"
                :stroke-dashoffset="`-${pendingPercent}`"
              ></circle>
            </svg>

            <div class="donut-legend">
              <div class="legend-item">
                <span class="legend-dot legend-dot--orange"></span>
                <span>Pending ({{ pendingPercent }}%)</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot legend-dot--green"></span>
                <span>Approved ({{ approvedPercent }}%)</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot legend-dot--red"></span>
                <span>Rejected ({{ rejectedPercent }}%)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- Rejection Reason Modal -->
    <div v-if="showRejectModal" class="modal-overlay">
      <div class="modal-card">
        <h3 class="modal-title">Reject Capability Application</h3>
        <p class="modal-sub">
          Please state the reason for rejecting {{ selectedAppForReject?.user?.first_name }}'s
          {{ selectedAppForReject?.capability_type }} capability request.
        </p>

        <div class="form-group">
          <label for="rejection-input">Rejection Reason *</label>
          <textarea
            id="rejection-input"
            v-model="rejectionReason"
            rows="4"
            placeholder="e.g. Invalid TIN number provided. Please re-submit with verified trade license documents."
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
.admin-dashboard-page {
  padding: 1.5rem;
  background: var(--surface);
  min-height: calc(100vh - 60px);
}

.page-container {
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.banner {
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 700;
}
.banner--success { background: #e6f4ea; color: #1e8e3e; border: 1px solid #b7e1cd; }
.banner--error   { background: #fce8e6; color: #d93025; border: 1px solid #f8bbd0; }

/* Dashboard Main Grid Layout */
.dashboard-main-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.25rem;
  align-items: start;
}

@media (max-width: 1024px) {
  .dashboard-main-grid {
    grid-template-columns: 1fr;
  }
}

.live-dot-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.85);
  margin-left: 0.75rem;
  font-weight: 600;
}

.live-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px #10b981;
}

.state-msg {
  padding: 3rem;
  text-align: center;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
}

.spinner {
  width: 32px; height: 32px;
  border: 3px solid rgba(11, 79, 156, 0.2);
  border-top-color: var(--brand-blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.user-info { display: flex; flex-direction: column; }
.user-name { font-weight: 700; color: var(--text-primary); }
.user-id { font-size: 0.725rem; color: var(--text-muted); }

.cap-type-pill {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
}
.cap-type-pill--farmer { background: #e6f4ea; color: #1e8e3e; }
.cap-type-pill--buyer  { background: #e8f0fe; color: #1a73e8; }

.date-cell { font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap; }

.progress-cell { min-width: 170px; }
.progress-flex { display: flex; flex-direction: column; gap: 0.35rem; }

.action-btns { display: flex; gap: 0.4rem; }
.btn-action {
  padding: 0.35rem 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-action--approve { background: #0b4f9c; color: #ffffff; }
.btn-action--approve:hover:not(:disabled) { background: #083b76; }
.btn-action--reject  { background: #e53935; color: #ffffff; }
.btn-action--reject:hover:not(:disabled)  { background: #c62828; }

.text-granted { color: #1e8e3e; }
.text-rejected { color: #d93025; }

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 1000;
}
.modal-card {
  background: var(--surface-card);
  border-radius: var(--radius-md);
  padding: 1.75rem;
  max-width: 500px;
  width: 100%;
  box-shadow: var(--shadow-lg);
}
.modal-title { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--text-primary); }
.modal-sub   { font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1.25rem; }

.form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.5rem; }
.form-group label { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); }
.form-group textarea {
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  outline: none;
  background: var(--surface-card);
  color: var(--text-primary);
}

.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
.btn-cancel {
  padding: 0.6rem 1.2rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-card);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
}
.btn-confirm-reject {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: var(--radius-sm);
  background: #e53935;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
}
.btn-confirm-reject:disabled { opacity: 0.5; cursor: not-allowed; }
</style>

