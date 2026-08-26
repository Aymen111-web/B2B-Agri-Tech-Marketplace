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

function handleStatusFilter(status) {
  selectedStatus.value = status
  loadApplications()
}

function handleTypeFilter(event) {
  selectedType.value = event.target.value
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
</script>

<template>
  <div class="admin-cap-view">
    <!-- Header -->
    <header class="admin-header">
      <div class="admin-header__inner">
        <button class="back-btn" @click="router.push('/dashboard')">
          ← Back to Dashboard
        </button>
        <div class="header-flex">
          <div>
            <h1 class="admin-title">Admin — Capability Review & Approval</h1>
            <p class="admin-sub">
              Review applicant verification details and grant Farmer or Business Buyer capabilities.
            </p>
          </div>
          <span class="admin-badge">🛡️ Admin Mode</span>
        </div>
      </div>
    </header>

    <main class="admin-main">
      <div class="admin-container">

        <!-- Banners -->
        <div v-if="bannerSuccess" class="banner banner--success">
          ✅ {{ bannerSuccess }}
        </div>
        <div v-if="bannerError" class="banner banner--error">
          ⚠️ {{ bannerError }}
        </div>

        <!-- Filter Controls -->
        <div class="controls-card">
          <div class="filter-tabs">
            <button
              class="tab-btn"
              :class="{ active: selectedStatus === 'pending' }"
              @click="handleStatusFilter('pending')"
            >
              Pending Approval
            </button>
            <button
              class="tab-btn"
              :class="{ active: selectedStatus === 'approved' }"
              @click="handleStatusFilter('approved')"
            >
              Approved
            </button>
            <button
              class="tab-btn"
              :class="{ active: selectedStatus === 'rejected' }"
              @click="handleStatusFilter('rejected')"
            >
              Rejected
            </button>
            <button
              class="tab-btn"
              :class="{ active: selectedStatus === '' }"
              @click="handleStatusFilter('')"
            >
              All Applications
            </button>
          </div>

          <div class="type-filter">
            <label for="type-select">Filter by Type:</label>
            <select id="type-select" :value="selectedType" @change="handleTypeFilter">
              <option value="">All Capability Types</option>
              <option value="farmer">🌾 Farmer</option>
              <option value="buyer">🏬 Business Buyer</option>
            </select>
          </div>
        </div>

        <!-- Applications Table / Cards -->
        <div class="table-card">
          <div v-if="capabilityStore.loading" class="state-msg">
            Loading applications...
          </div>

          <div v-else-if="capabilityStore.adminApplications.length === 0" class="state-msg">
            No capability applications found matching current criteria.
          </div>

          <div v-else class="app-table-wrap">
            <table class="app-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Phone Number</th>
                  <th>Requested Capability</th>
                  <th>Submission Date</th>
                  <th>Verification Info / Documents</th>
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
                      <span class="user-id">ID: #{{ app.user_id }}</span>
                    </div>
                  </td>
                  <td>{{ app.user?.phone || '-' }}</td>
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
                    <span class="status-pill" :class="`status-pill--${app.status}`">
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
.admin-cap-view {
  min-height: 100vh;
  background: var(--surface-alt);
  padding-bottom: 4rem;
}

.admin-header {
  background: #0f172a;
  color: #fff;
  padding: 1.75rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.admin-header__inner {
  max-width: 1200px;
  margin: 0 auto;
}
.back-btn {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-xs);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 0.85rem;
  transition: all 0.15s ease;
}
.back-btn:hover { background: rgba(255, 255, 255, 0.2); }

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}
.admin-title { font-size: 1.5rem; font-weight: 700; color: #fff; }
.admin-sub { color: #94a3b8; font-size: 0.875rem; margin-top: 0.2rem; }
.admin-badge {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.admin-main { padding: 1.75rem 1.5rem 0; }
.admin-container { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.25rem; }

.banner {
  padding: 0.75rem 1.15rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 600;
}
.banner--success { background: var(--brand-green-light); color: var(--brand-green-dark); border: 1px solid var(--brand-green-border); }
.banner--error   { background: var(--error-bg); color: var(--error-dark); border: 1px solid var(--error-border); }

.controls-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.85rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  box-shadow: var(--shadow-xs);
}

.filter-tabs {
  display: flex;
  gap: 0.35rem;
  background: var(--surface-alt);
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}
.tab-btn {
  padding: 0.4rem 0.85rem;
  border: none;
  border-radius: var(--radius-xs);
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}
.tab-btn.active {
  background: var(--surface);
  color: var(--brand-green-dark);
  box-shadow: var(--shadow-xs);
  font-weight: 700;
}

.type-filter { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); }
.type-filter select {
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  font-size: 0.8125rem;
  background: var(--surface);
  color: var(--text-primary);
  outline: none;
}

.table-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.state-msg { padding: 3rem; text-align: center; color: var(--text-secondary); font-size: 0.9rem; }

.app-table-wrap { overflow-x: auto; }
.app-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem; }
.app-table th {
  background: var(--surface-alt);
  padding: 0.75rem 1rem;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
}
.app-table td {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--border-subtle);
  vertical-align: top;
}

.user-name { font-weight: 700; display: block; color: var(--text-primary); }
.user-id { font-size: 0.75rem; color: var(--text-muted); }

.cap-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
}
.cap-type-badge--farmer { background: var(--brand-green-light); color: var(--brand-green-dark); border: 1px solid var(--brand-green-border); }
.cap-type-badge--buyer  { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }

.date-cell { font-size: 0.8125rem; color: var(--text-secondary); white-space: nowrap; }

.doc-list { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.8125rem; }
.doc-row strong { text-transform: capitalize; color: var(--text-secondary); }

.action-btns { display: flex; gap: 0.4rem; }
.btn-approve {
  padding: 0.35rem 0.75rem;
  background: var(--brand-green);
  color: #fff;
  border: none;
  border-radius: var(--radius-xs);
  font-size: 0.78125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-approve:hover:not(:disabled) { background: var(--brand-green-dark); }

.btn-reject {
  padding: 0.35rem 0.75rem;
  background: var(--error-bg);
  color: var(--error-dark);
  border: 1px solid var(--error-border);
  border-radius: var(--radius-xs);
  font-size: 0.78125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-reject:hover:not(:disabled) { background: var(--error); color: #fff; }

.text-success { color: var(--brand-green-dark); }
.text-danger  { color: var(--error-dark); }
.font-semibold { font-weight: 600; }
.text-muted   { color: var(--text-muted); font-size: 0.8rem; }

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
  padding: 1.5rem;
  max-width: 480px;
  width: 100%;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border);
}
.modal-title { font-size: 1.15rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-primary); }
.modal-sub   { font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1.25rem; }

.form-group { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1.25rem; }
.form-group label { font-size: 0.8125rem; font-weight: 600; color: var(--text-primary); }
.form-group textarea {
  padding: 0.65rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  font-size: 0.875rem;
  font-family: var(--font-sans);
  background: var(--surface);
  color: var(--text-primary);
  outline: none;
}
.form-group textarea:focus { border-color: var(--brand-green); }

.modal-actions { display: flex; justify-content: flex-end; gap: 0.6rem; }
.btn-cancel {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  background: var(--surface-alt);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-confirm-reject {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius-xs);
  background: var(--error);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
}
.btn-confirm-reject:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
