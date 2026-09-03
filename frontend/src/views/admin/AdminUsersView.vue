<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const auth = useAuthStore()
const router = useRouter()

const users = ref([])
const loading = ref(false)
const stats = ref({
  total_users: 0,
  active_users: 0,
  suspended_users: 0,
  verified_farmers: 0,
  verified_buyers: 0,
})

const filterStatus = ref('')
const filterCapability = ref('')
const searchQuery = ref('')
const processingUserId = ref(null)

const toastSuccess = ref('')
const toastError = ref('')

onMounted(async () => {
  if (!auth.isAdmin) {
    router.push('/dashboard')
    return
  }
  await fetchStats()
  await fetchUsers()
})

async function fetchStats() {
  try {
    const res = await api.get('/admin/users/stats')
    stats.value = res.data
  } catch (err) {
    //
  }
}

async function fetchUsers() {
  loading.value = true
  toastSuccess.value = ''
  toastError.value = ''

  try {
    const params = {}
    if (filterStatus.value) params.account_status = filterStatus.value
    if (filterCapability.value) params.capability = filterCapability.value
    if (searchQuery.value.trim()) params.search = searchQuery.value.trim()

    const res = await api.get('/admin/users', { params })
    users.value = res.data.data || res.data
  } catch (err) {
    toastError.value = err.response?.data?.message || 'Failed to fetch user list.'
  } finally {
    loading.value = false
  }
}

async function toggleAccountStatus(user) {
  const isCurrentlyActive = user.account_status === 'active'
  const actionName = isCurrentlyActive ? 'deactivate (suspend)' : 'activate'
  
  if (!confirm(`Are you sure you want to ${actionName} account for ${user.first_name} ${user.second_name}?`)) {
    return
  }

  processingUserId.value = user.id
  toastSuccess.value = ''
  toastError.value = ''

  try {
    const endpoint = isCurrentlyActive
      ? `/admin/users/${user.id}/suspend`
      : `/admin/users/${user.id}/activate`
    
    const res = await api.post(endpoint)
    toastSuccess.value = res.data.message || `User account status updated to ${isCurrentlyActive ? 'suspended' : 'active'}.`
    
    await fetchStats()
    await fetchUsers()
  } catch (err) {
    toastError.value = err.response?.data?.message || 'Failed to update user account status.'
  } finally {
    processingUserId.value = null
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="admin-users-page">
    <!-- Header -->
    <header class="admin-header">
          <div class="header-inner">
            <div class="header-flex">
              <div>
                <span class="header-badge">🛡️ Admin Management</span>
                <h1 class="header-title">User Accounts & Platform Subscriptions</h1>
                <p class="header-sub">
                  Manage registered farmer and buyer accounts. Toggle active status based on platform fee payments.
                </p>
              </div>
            </div>

            <!-- Stats Bar -->
            <div class="stats-grid mt-4">
              <div class="stat-card">
                <span class="stat-label">Total Users</span>
                <span class="stat-val">{{ stats.total_users }}</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">Active Accounts</span>
                <span class="stat-val text-success">{{ stats.active_users }}</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">Inactive / Suspended</span>
                <span class="stat-val text-danger">{{ stats.suspended_users }}</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">Verified Farmers</span>
                <span class="stat-val text-brand">{{ stats.verified_farmers }}</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">Verified Buyers</span>
                <span class="stat-val text-info">{{ stats.verified_buyers }}</span>
              </div>
            </div>
          </div>
        </header>

        <div class="admin-container">
          <!-- Banners -->
          <div v-if="toastSuccess" class="alert-toast alert-toast--success mb-4">
            <span>✅</span> {{ toastSuccess }}
          </div>
          <div v-if="toastError" class="alert-toast alert-toast--error mb-4">
            <span>⚠️</span> {{ toastError }}
          </div>

          <!-- Controls & Filters -->
          <div class="controls-card mb-6">
            <div class="search-box">
              <input
                v-model="searchQuery"
                @keyup.enter="fetchUsers"
                type="text"
                class="form-input"
                placeholder="🔍 Search name or phone..."
              />
              <button @click="fetchUsers" class="btn btn--secondary">Search</button>
            </div>

            <div class="filter-group">
              <select v-model="filterStatus" @change="fetchUsers" class="form-select">
                <option value="">All Account Statuses</option>
                <option value="active">Active Accounts Only</option>
                <option value="suspended">Suspended / Inactive</option>
              </select>

              <select v-model="filterCapability" @change="fetchUsers" class="form-select">
                <option value="">All Capability Roles</option>
                <option value="farmer">Farmers</option>
                <option value="buyer">Buyers</option>
              </select>
            </div>
          </div>

          <!-- Users Table -->
          <div class="table-card">
            <div v-if="loading" class="state-msg">
              <div class="spinner"></div>
              <p>Loading accounts...</p>
            </div>

            <div v-else-if="users.length === 0" class="state-msg">
              <h3>No Accounts Found</h3>
              <p>No user accounts match the current filter criteria.</p>
            </div>

            <div v-else class="table-wrap">
              <table class="user-table">
                <thead>
                  <tr>
                    <th>User / Account</th>
                    <th>Phone Identity</th>
                    <th>Role Capabilities</th>
                    <th>Account Status</th>
                    <th>Joined Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="u in users" :key="u.id">
                    <td>
                      <div class="user-cell">
                        <div class="avatar-sm">
                          <img v-if="u.profile_photo_url" :src="u.profile_photo_url" alt="Avatar" class="avatar-img" />
                          <span v-else>{{ u.first_name?.[0] || '👤' }}</span>
                        </div>
                        <div>
                          <strong class="user-name">{{ u.first_name }} {{ u.second_name }}</strong>
                          <span class="user-id">User #{{ u.id }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="phone-num">📞 {{ u.phone }}</span>
                    </td>
                    <td>
                      <div class="caps-tags">
                        <span v-if="u.is_admin" class="tag tag--admin">Admin</span>
                        <template v-for="cap in (u.capabilities || [])" :key="cap.id">
                          <span v-if="cap.status === 'active'" :class="['tag', cap.capability_type === 'farmer' ? 'tag--farmer' : 'tag--buyer']">
                            {{ cap.capability_type === 'farmer' ? '🌾 Farmer' : '🏬 Buyer' }}
                          </span>
                        </template>
                      </div>
                    </td>

                    <td>
                      <span :class="['status-badge', u.account_status === 'active' ? 'badge--active' : 'badge--inactive']">
                        {{ (u.account_status || 'active').toUpperCase() }}
                      </span>
                    </td>
                    <td>{{ formatDate(u.created_at) }}</td>
                    <td>
                      <button
                        @click="toggleAccountStatus(u)"
                        :disabled="processingUserId === u.id || u.is_admin"
                        :class="['btn', 'btn--sm', u.account_status === 'active' ? 'btn--danger-outline' : 'btn--success']"
                      >
                        {{ u.account_status === 'active' ? 'Deactivate 🛑' : 'Activate Account ✅' }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
  </div>
</template>

<style scoped>
.admin-users-page { min-height: 100vh; padding-bottom: 4rem; background: var(--surface); }

.admin-header {
  background: #1e293b;
  color: #fff;
  padding: 2.5rem 2rem 1.75rem;
}
.header-inner { max-width: 1100px; margin: 0 auto; }
.header-badge { display: inline-block; background: #334155; color: #fbbf24; padding: 0.3rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem; }
.header-title { font-size: 1.85rem; font-weight: 800; margin: 0 0 0.35rem; }
.header-sub { color: #94a3b8; font-size: 0.95rem; margin: 0; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
.stat-card { background: #0f172a; border: 1px solid #334155; padding: 1rem; border-radius: 0.5rem; display: flex; flex-direction: column; }
.stat-label { font-size: 0.8rem; color: #94a3b8; font-weight: 600; }
.stat-val { font-size: 1.5rem; font-weight: 800; color: #fff; margin-top: 0.25rem; }

.admin-container { max-width: 1100px; margin: 2rem auto 0; padding: 0 1.5rem; }

.controls-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.search-box { display: flex; gap: 0.5rem; flex: 1; min-width: 280px; }
.filter-group { display: flex; gap: 0.75rem; }

.form-input, .form-select {
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.table-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.state-msg { padding: 4rem; text-align: center; color: var(--text-secondary); }

.table-wrap { overflow-x: auto; }
.user-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
.user-table th { background: var(--surface-alt); padding: 0.85rem 1rem; font-weight: 700; color: var(--text-secondary); border-bottom: 1px solid var(--border); }
.user-table td { padding: 0.9rem 1rem; border-bottom: 1px solid var(--border); vertical-align: middle; }

.user-cell { display: flex; align-items: center; gap: 0.75rem; }
.avatar-sm { width: 36px; height: 36px; border-radius: 50%; background: var(--brand-green); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; overflow: hidden; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.user-name { font-weight: 700; display: block; color: var(--text-primary); }
.user-id { font-size: 0.75rem; color: var(--text-muted); }

.phone-num { font-weight: 600; color: var(--text-secondary); }

.caps-tags { display: flex; gap: 0.35rem; flex-wrap: wrap; }
.tag { font-size: 0.75rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 4px; }
.tag--farmer { background: var(--brand-green-light); color: var(--brand-green-dark); }
.tag--buyer { background: #dbeafe; color: #1e40af; }
.tag--admin { background: #fef3c7; color: #92400e; }

.sub-info { display: flex; flex-direction: column; font-size: 0.8rem; }
.sub-id { font-weight: 700; color: var(--brand-green); }
.bank-name { color: var(--text-muted); }

.status-badge { padding: 0.25rem 0.65rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; }
.badge--active { background: var(--brand-green-light); color: var(--brand-green-dark); border: 1px solid var(--brand-green); }
.badge--inactive { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

.btn { display: inline-flex; align-items: center; justify-content: center; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--success { background: #16a34a; color: #fff; }
.btn--success:hover { background: #15803d; }
.btn--danger-outline { background: transparent; border: 1px solid var(--error); color: var(--error); }
.btn--danger-outline:hover { background: var(--error-bg); }
.btn--secondary { background: var(--border); color: var(--text-primary); }
.btn--sm { padding: 0.4rem 0.8rem; font-size: 0.8rem; }

.alert-toast { padding: 0.85rem 1.25rem; border-radius: 0.5rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }
.alert-toast--success { background: var(--brand-green-light); border: 1px solid var(--brand-green); color: var(--brand-green-dark); }
.alert-toast--error { background: var(--error-bg); border: 1px solid var(--error); color: var(--error); }

.text-success { color: #16a34a; }
.text-danger { color: #dc2626; }
.text-brand { color: var(--brand-green); }
.text-info { color: #2563eb; }
.text-muted { color: var(--text-muted); font-size: 0.85rem; }

.spinner { width: 32px; height: 32px; border: 3px solid var(--brand-green-light); border-top-color: var(--brand-green); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
