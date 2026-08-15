<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFulfillmentStore } from '@/stores/fulfillment'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const fulfillmentStore = useFulfillmentStore()
const authStore = useAuthStore()

const activeTab = ref('')
const processingId = ref(null)
const actionToast = ref({ type: '', text: '' })

onMounted(async () => {
  await loadFulfillments()
})

watch(activeTab, async () => {
  await loadFulfillments()
})

async function loadFulfillments() {
  const params = {}
  if (activeTab.value) {
    params.status = activeTab.value
  }
  await fulfillmentStore.fetchFulfillments(params)
}

async function handleAccept(id) {
  processingId.value = id
  actionToast.value = { type: '', text: '' }

  const res = await fulfillmentStore.acceptFulfillment(id)
  processingId.value = null

  if (res.success) {
    actionToast.value = { type: 'success', text: 'Order fulfillment accepted!' }
  } else {
    actionToast.value = { type: 'error', text: res.message }
  }
}

async function handleReject(id) {
  const reason = prompt('Please provide a reason for rejecting this order fulfillment (Stock will be released back to inventory):')
  if (reason === null) return // user cancelled prompt

  processingId.value = id
  actionToast.value = { type: '', text: '' }

  const res = await fulfillmentStore.rejectFulfillment(id, reason)
  processingId.value = null

  if (res.success) {
    actionToast.value = { type: 'success', text: 'Fulfillment rejected and stock released back to inventory.' }
  } else {
    actionToast.value = { type: 'error', text: res.message }
  }
}

async function handleComplete(id) {
  if (!confirm('Confirm produce delivery & physical handoff completion?')) return

  processingId.value = id
  actionToast.value = { type: '', text: '' }

  const res = await fulfillmentStore.completeFulfillment(id)
  processingId.value = null

  if (res.success) {
    actionToast.value = { type: 'success', text: 'Order fulfillment marked as completed!' }
  } else {
    actionToast.value = { type: 'error', text: res.message }
  }
}

function formatPrice(val) {
  if (val === undefined || val === null) return '0.00'
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusBadgeClass(status) {
  const s = (status || '').toLowerCase()
  if (s === 'completed' || s === 'accepted') return 'badge--success'
  if (s === 'pending') return 'badge--warning'
  if (s === 'rejected' || s === 'cancelled') return 'badge--danger'
  return 'badge--info'
}
</script>

<template>
  <div class="fulfillment-portal-page">
    <!-- Header -->
    <header class="portal-header">
      <div class="portal-header__inner">
        <div class="header-badge">🚜 Farmer Fulfillment Portal</div>
        <h1 class="header-title">Produce Fulfillment Orders</h1>
        <p class="header-sub">
          Manage buyer orders for your farm produce. Accept orders, release stock on rejection, or confirm handoff.
        </p>

        <!-- Status Filter Tabs -->
        <div class="filter-tabs">
          <button
            class="tab"
            :class="{ active: activeTab === '' }"
            @click="activeTab = ''"
          >
            All Orders
          </button>
          <button
            class="tab"
            :class="{ active: activeTab === 'pending' }"
            @click="activeTab = 'pending'"
          >
            ⏳ Pending Action
          </button>
          <button
            class="tab"
            :class="{ active: activeTab === 'accepted' }"
            @click="activeTab = 'accepted'"
          >
            ✅ Accepted
          </button>
          <button
            class="tab"
            :class="{ active: activeTab === 'completed' }"
            @click="activeTab = 'completed'"
          >
            🎉 Completed
          </button>
          <button
            class="tab"
            :class="{ active: activeTab === 'rejected' }"
            @click="activeTab = 'rejected'"
          >
            🛑 Rejected
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="portal-main">
      <div class="portal-container">
        <!-- Toast Feedback -->
        <div v-if="actionToast.text" :class="['alert-toast', actionToast.type === 'error' ? 'alert-toast--error' : 'alert-toast--success']" class="mb-6">
          <span>{{ actionToast.type === 'error' ? '⚠️' : '✅' }}</span>
          <span>{{ actionToast.text }}</span>
        </div>

        <!-- Error Alert -->
        <div v-if="fulfillmentStore.error" class="alert alert--error mb-6">
          <span>⚠️</span> {{ fulfillmentStore.error }}
        </div>

        <!-- Loading State -->
        <div v-if="fulfillmentStore.loading && fulfillmentStore.fulfillments.length === 0" class="state-card">
          <div class="spinner"></div>
          <p>Loading your fulfillment orders...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="fulfillmentStore.fulfillments.length === 0" class="state-card empty-card">
          <div class="empty-icon">🌾</div>
          <h2>No Fulfillment Orders</h2>
          <p>You do not have any produce fulfillment requests matching this tab filter.</p>
          <router-link to="/farmer/listings" class="btn btn--primary mt-4">
            Manage My Crop Listings →
          </router-link>
        </div>

        <!-- Fulfillments List -->
        <div v-else class="fulfillments-list">
          <div
            v-for="fulfillment in fulfillmentStore.fulfillments"
            :key="fulfillment.id"
            class="fulfillment-card"
          >
            <!-- Card Header -->
            <div class="fulfillment-card__header">
              <div class="order-meta">
                <span class="order-icon">📦</span>
                <div>
                  <h3 class="order-number">
                    {{ fulfillment.order?.order_number || `Order #${fulfillment.order_id}` }}
                  </h3>
                  <span class="order-date">
                    Placed: {{ formatDate(fulfillment.created_at || fulfillment.order?.placed_at) }}
                  </span>
                </div>
              </div>

              <span :class="['status-badge', getStatusBadgeClass(fulfillment.status)]">
                {{ (fulfillment.status || 'PENDING').toUpperCase() }}
              </span>
            </div>

            <!-- Buyer Summary -->
            <div class="buyer-box">
              <span class="buyer-icon">👨‍💼</span>
              <div class="buyer-info">
                <strong>Buyer:</strong>
                <span>
                  {{ fulfillment.order?.buyer ? `${fulfillment.order.buyer.first_name} ${fulfillment.order.buyer.second_name}` : `Buyer ID #${fulfillment.order?.buyer_id || 'N/A'}` }}
                </span>
              </div>
            </div>

            <!-- Items Breakdown -->
            <div class="fulfillment-items">
              <div
                v-for="item in (fulfillment.items || [])"
                :key="item.id"
                class="item-row"
              >
                <div class="item-main">
                  <span class="item-title">{{ item.listing?.title || 'Farm Produce' }}</span>
                  <span class="item-unit">({{ item.listing?.unit || 'unit' }})</span>
                </div>
                <div class="item-qty">
                  {{ item.quantity }} {{ item.listing?.unit }}s × ETB {{ formatPrice(item.unit_price) }}
                </div>
                <div class="item-total">
                  ETB {{ formatPrice(item.subtotal || (item.quantity * item.unit_price)) }}
                </div>
              </div>
            </div>

            <!-- Card Footer & Action Buttons -->
            <div class="fulfillment-card__footer">
              <div class="total-box">
                <span>Fulfillment Total:</span>
                <strong class="total-amount">
                  ETB {{ formatPrice(fulfillment.subtotal_amount) }}
                </strong>
              </div>

              <div class="action-buttons">
                <!-- Accept & Reject (If Pending) -->
                <template v-if="fulfillment.status === 'pending'">
                  <button
                    @click="handleAccept(fulfillment.id)"
                    :disabled="processingId === fulfillment.id"
                    class="btn btn--success btn--sm"
                  >
                    Accept Order ✅
                  </button>

                  <button
                    @click="handleReject(fulfillment.id)"
                    :disabled="processingId === fulfillment.id"
                    class="btn btn--danger-outline btn--sm"
                  >
                    Reject & Release Stock 🛑
                  </button>
                </template>

                <!-- Complete (If Accepted) -->
                <template v-else-if="fulfillment.status === 'accepted'">
                  <button
                    @click="handleComplete(fulfillment.id)"
                    :disabled="processingId === fulfillment.id"
                    class="btn btn--primary btn--sm"
                  >
                    Mark as Delivered & Completed 🎉
                  </button>
                </template>

                <!-- Complete Status Badge (If Completed) -->
                <template v-else-if="fulfillment.status === 'completed'">
                  <span class="completed-tag">🎉 Handoff Completed</span>
                </template>

                <!-- Rejected Status Note -->
                <template v-else-if="fulfillment.status === 'rejected'">
                  <span class="rejected-tag">Stock Released Back</span>
                </template>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<style scoped>
.fulfillment-portal-page {
  min-height: 100vh;
  background: var(--surface);
  color: var(--text-primary);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  transition: background 0.3s, color 0.3s;
}

/* Header */
.portal-header {
  background: var(--surface-card);
  padding: 2.5rem 1.5rem 1.5rem;
  border-bottom: 1px solid var(--border);
  transition: background 0.3s, border-color 0.3s;
}
.portal-header__inner { max-width: 1000px; margin: 0 auto; }
.header-badge {
  display: inline-block;
  background: var(--brand-green-light);
  color: var(--brand-green-dark);
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  margin-bottom: 0.75rem;
}
.header-title { font-size: 2rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem; }
.header-sub { color: var(--text-secondary); font-size: 1rem; margin-bottom: 2rem; }

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}
.tab {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 0.5rem 1.1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.tab:hover { background: var(--border); color: var(--text-primary); }
.tab.active {
  background: var(--brand-green);
  color: #ffffff;
  border-color: var(--brand-green);
}

/* Main Content */
.portal-main { max-width: 1000px; margin: 0 auto; padding: 2.5rem 1.5rem 4rem; }

.state-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: 1rem;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: var(--shadow-sm);
}
.empty-card .empty-icon { font-size: 3.5rem; margin-bottom: 1rem; }

.fulfillments-list { display: flex; flex-direction: column; gap: 1.5rem; }

/* Fulfillment Card */
.fulfillment-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
}
.fulfillment-card:hover {
  border-color: var(--brand-green);
  box-shadow: var(--shadow-md);
}

.fulfillment-card__header {
  background: var(--surface-alt);
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
}
.order-meta { display: flex; align-items: center; gap: 0.85rem; }
.order-icon { font-size: 1.5rem; }
.order-number { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0; }
.order-date { font-size: 0.8rem; color: var(--text-muted); }

.buyer-box {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--surface);
  padding: 0.75rem 1.25rem;
  border-bottom: 1px dashed var(--border);
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.buyer-info strong { color: var(--text-primary); margin-right: 0.35rem; }

.fulfillment-items { padding: 1rem 1.25rem; }
.item-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 0.65rem 0;
  border-bottom: 1px dashed var(--border);
}
.item-row:last-child { border-bottom: none; }
.item-title { font-weight: 600; color: var(--text-primary); }
.item-unit { color: var(--text-muted); font-size: 0.85rem; margin-left: 0.25rem; }
.item-qty { color: var(--text-secondary); font-size: 0.9rem; }
.item-total { font-weight: 700; color: var(--brand-green); }

.fulfillment-card__footer {
  background: var(--surface-alt);
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
  gap: 1rem;
}
.total-box { font-size: 0.95rem; color: var(--text-secondary); }
.total-amount { font-size: 1.3rem; color: var(--brand-green); margin-left: 0.5rem; }

.action-buttons { display: flex; gap: 0.75rem; align-items: center; }

/* Badges & Tags */
.status-badge {
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
}
.badge--success { background: var(--brand-green-light); color: var(--brand-green-dark); border: 1px solid var(--brand-green); }
.badge--warning { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
.badge--danger  { background: var(--error-bg); color: var(--error); border: 1px solid #fecaca; }
.badge--info    { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }

.completed-tag { color: var(--brand-green); font-weight: 700; font-size: 0.9rem; }
.rejected-tag  { color: var(--text-muted); font-weight: 600; font-size: 0.85rem; }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0.6rem 1.25rem; border-radius: 0.5rem; font-weight: 600;
  text-decoration: none; cursor: pointer; border: none; transition: all 0.2s;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--primary { background: var(--brand-green); color: #ffffff; }
.btn--primary:hover { background: var(--brand-green-dark); }
.btn--success { background: #16a34a; color: #ffffff; }
.btn--success:hover { background: #15803d; }
.btn--danger-outline {
  background: transparent;
  border: 1px solid var(--error);
  color: var(--error);
}
.btn--danger-outline:hover { background: var(--error-bg); }
.btn--sm { padding: 0.5rem 1rem; font-size: 0.85rem; }

.alert-toast {
  padding: 0.85rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.alert-toast--success { background: var(--brand-green-light); border: 1px solid var(--brand-green); color: var(--brand-green-dark); }
.alert-toast--error { background: var(--error-bg); border: 1px solid var(--error); color: var(--error); }

.spinner {
  width: 40px; height: 40px;
  border: 3px solid var(--brand-green-light);
  border-top-color: var(--brand-green); border-radius: 50%;
  animation: spin 0.8s linear infinite; margin: 0 auto 1rem;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
