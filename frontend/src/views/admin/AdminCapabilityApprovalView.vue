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
  background: #1e293b;
  color: #fff;
  padding: 2rem 1.5rem;
}
.admin-header__inner {
  max-width: 1200px;
  margin: 0 auto;
}
.back-btn {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 1rem;
}
.back-btn:hover { background: rgba(255, 255, 255, 0.25); }

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.admin-title { font-size: 1.75rem; font-weight: 700; }
.admin-sub { color: #94a3b8; font-size: 0.95rem; margin-top: 0.25rem; }
.admin-badge {
  background: #334155;
  color: #fbbf24;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid #475569;
}

.admin-main { padding: 2rem 1.5rem 0; }
.admin-container { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }

.banner {
  padding: 0.9rem 1.25rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
}
.banner--success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
.banner--error   { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

.controls-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-tabs { display: flex; gap: 0.5rem; }
.tab-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #f8fafc;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
}
.tab-btn.active {
  background: var(--brand-green);
  color: #fff;
  border-color: var(--brand-green);
}

.type-filter { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 600; }
.type-filter select {
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.875rem;
}

.table-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.state-msg { padding: 3rem; text-align: center; color: var(--text-secondary); }

.app-table-wrap { overflow-x: auto; }
.app-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
.app-table th {
  background: #f8fafc;
  padding: 0.85rem 1rem;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
}
.app-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: top;
}

.user-name { font-weight: 600; display: block; color: var(--text-primary); }
.user-id { font-size: 0.75rem; color: var(--text-secondary); }

.cap-type-badge {
  display: inline-block;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}
.cap-type-badge--farmer { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
.cap-type-badge--buyer  { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }

.date-cell { font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap; }

.doc-list { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.825rem; }
.doc-row strong { text-transform: capitalize; color: var(--text-secondary); }

.status-pill {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}
.status-pill--pending  { background: #fef3c7; color: #92400e; }
.status-pill--approved { background: #dcfce7; color: #166534; }
.status-pill--rejected { background: #fee2e2; color: #991b1b; }

.action-btns { display: flex; gap: 0.5rem; }
.btn-approve {
  padding: 0.4rem 0.8rem;
  background: #166534;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-approve:hover:not(:disabled) { background: #14532d; }

.btn-reject {
  padding: 0.4rem 0.8rem;
  background: #991b1b;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-reject:hover:not(:disabled) { background: #7f1d1d; }

.text-success { color: #166534; }
.text-danger  { color: #991b1b; }
.font-semibold { font-weight: 600; }
.text-muted   { color: var(--text-secondary); font-size: 0.8rem; }

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
  background: #fff;
  border-radius: 8px;
  padding: 1.75rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}
.modal-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
.modal-sub   { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.25rem; }

.form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.5rem; }
.form-group label { font-size: 0.85rem; font-weight: 600; }
.form-group textarea {
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;
}

.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
.btn-cancel {
  padding: 0.6rem 1.2rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-confirm-reject {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  background: #991b1b;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-confirm-reject:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
