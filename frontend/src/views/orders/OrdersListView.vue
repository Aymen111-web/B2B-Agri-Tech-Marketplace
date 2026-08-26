<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const orderStore = useOrderStore()
const authStore = useAuthStore()

const activeTab = ref('')

onMounted(async () => {
  await loadOrders()
})

watch(activeTab, async () => {
  await loadOrders()
})

async function loadOrders() {
  const params = {}
  if (activeTab.value) {
    params.status = activeTab.value
  }
  await orderStore.fetchOrders(params)
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
  })
}

function getStatusBadgeClass(status) {
  const s = (status || '').toLowerCase()
  if (s === 'confirmed' || s === 'completed') return 'badge--success'
  if (s === 'pending_payment' || s === 'pending') return 'badge--warning'
  if (s === 'cancelled' || s === 'rejected') return 'badge--danger'
  return 'badge--info'
}
</script>

<template>
  <div class="orders-page">
    <div class="page-container">

      <!-- Header Section -->
      <div class="orders-header-card">
        <div class="header-badge">📋 Order History</div>
        <h1 class="header-title">My Produce Orders</h1>
        <p class="header-sub">
          Track fulfillment status across verified Ethiopian farmers and pay via Chapa hosted checkout.
        </p>

        <!-- Status Filter Action Bar -->
        <div class="filter-bar border-0 shadow-none p-0 mt-3">
          <div class="filter-group">
            <button
              class="btn-filter"
              :class="activeTab === '' ? 'btn-filter--primary' : 'btn-filter--clear'"
              @click="activeTab = ''"
            >
              All Orders
            </button>
            <button
              class="btn-filter"
              :class="activeTab === 'pending_payment' ? 'btn-filter--primary' : 'btn-filter--clear'"
              @click="activeTab = 'pending_payment'"
            >
              ⏳ Pending Payment
            </button>
            <button
              class="btn-filter"
              :class="activeTab === 'confirmed' ? 'btn-filter--primary' : 'btn-filter--clear'"
              @click="activeTab = 'confirmed'"
            >
              ✅ Confirmed
            </button>
            <button
              class="btn-filter"
              :class="activeTab === 'completed' ? 'btn-filter--primary' : 'btn-filter--clear'"
              @click="activeTab = 'completed'"
            >
              🎉 Completed
            </button>
            <button
              class="btn-filter"
              :class="activeTab === 'cancelled' ? 'btn-filter--primary' : 'btn-filter--clear'"
              @click="activeTab = 'cancelled'"
            >
              🛑 Cancelled
            </button>
          </div>
        </div>
      </div>

      <!-- Main Orders List -->
      <div class="orders-main-content">
        <!-- Error Alert -->
        <div v-if="orderStore.error" class="banner banner--error mb-4">
          <span>⚠️</span> {{ orderStore.error }}
        </div>

        <!-- Loading State -->
        <div v-if="orderStore.loading" class="state-card">
          <div class="spinner"></div>
          <p>Loading your orders...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="orderStore.orders.length === 0" class="state-card empty-card">
          <div class="empty-icon">📦</div>
          <h2>No Produce Orders Found</h2>
          <p>You haven't placed any orders matching this status filter yet.</p>
          <button class="btn-filter btn-filter--primary mt-4" @click="router.push('/listings')">
            Explore Produce Marketplace
          </button>
        </div>

        <!-- Orders Grid / List -->
        <div v-else class="orders-list">
          <div
            v-for="order in orderStore.orders"
            :key="order.id"
            class="order-card"
            @click="router.push(`/orders/${order.id}`)"
          >
            <div class="order-card__header">
              <div class="order-id-group">
                <span class="order-icon">📦</span>
                <div>
                  <h3 class="order-number">{{ order.order_number }}</h3>
                  <span class="placed-date">Placed on {{ formatDate(order.placed_at || order.created_at) }}</span>
                </div>
              </div>

              <span class="pill-badge" :class="{
                'pill-badge--green': order.status === 'confirmed' || order.status === 'completed',
                'pill-badge--gold': order.status === 'pending_payment' || order.status === 'pending',
                'pill-badge--red': order.status === 'cancelled' || order.status === 'rejected'
              }">
                {{ (order.status || 'PENDING').replace('_', ' ').toUpperCase() }}
              </span>
            </div>

            <div class="order-card__body">
              <div class="info-pill">
                <span>Fulfillments:</span>
                <strong>{{ order.fulfillments?.length || 1 }} Farmer Partner(s)</strong>
              </div>
              <div class="info-pill">
                <span>Payment:</span>
                <strong :class="order.payment?.status === 'confirmed' ? 'text-success' : 'text-warning'">
                  {{ (order.payment?.status || 'PENDING').toUpperCase() }}
                </strong>
              </div>
            </div>

            <div class="order-card__footer">
              <div class="total-wrap">
                <span class="total-label">Total Price:</span>
                <span class="total-amount">ETB {{ formatPrice(order.total_amount) }}</span>
              </div>

              <button class="btn-text">
                View Details & Pay →
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
.orders-page {
  min-height: 100vh;
  background: #f8fafc;
  color: #0f172a;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

<style scoped>
.orders-page {
  padding: 1.5rem;
  background: var(--surface);
  min-height: calc(100vh - 60px);
}

.page-container {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.orders-header-card {
  background: var(--surface-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.header-badge {
  display: inline-block;
  background: #e8f0fe;
  color: #1a73e8;
  font-weight: 800;
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  margin-bottom: 0.5rem;
}

.header-title { font-size: 1.6rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.35rem; }
.header-sub { color: var(--text-secondary); font-size: 0.9rem; font-weight: 500; }

.orders-main-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.state-card {
  background: var(--surface-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: var(--shadow-sm);
}
.empty-card .empty-icon { font-size: 3.5rem; margin-bottom: 1rem; }

.orders-list { display: flex; flex-direction: column; gap: 1rem; }

.order-card {
  background: var(--surface-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}
.order-card:hover {
  border-color: var(--brand-blue);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.order-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.order-id-group { display: flex; align-items: center; gap: 0.85rem; }
.order-icon { font-size: 1.6rem; }
.order-number { font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin: 0; }
.placed-date { font-size: 0.8rem; color: var(--text-muted); }

.order-card__body {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.info-pill {
  background: var(--surface);
  border: 1px solid var(--border-light);
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.825rem;
  color: var(--text-secondary);
  display: flex;
  gap: 0.4rem;
}
.info-pill strong { color: var(--text-primary); }

.order-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed var(--border);
  padding-top: 0.85rem;
}
.total-wrap { font-size: 0.875rem; color: var(--text-secondary); }
.total-amount { font-size: 1.15rem; font-weight: 800; color: #1e8e3e; margin-left: 0.5rem; }

.btn-text {
  background: none;
  border: none;
  color: var(--brand-blue);
  font-weight: 800;
  font-size: 0.875rem;
  cursor: pointer;
}

.banner--error { background: #fce8e6; color: #d93025; border: 1px solid #f8bbd0; padding: 0.85rem 1.25rem; border-radius: var(--radius-sm); }
.text-success { color: #1e8e3e; }
.text-warning { color: #f2994a; }
.mb-4 { margin-bottom: 1rem; }
.mt-4 { margin-top: 1rem; }

.spinner {
  width: 36px; height: 36px;
  border: 3px solid rgba(11, 79, 156, 0.2);
  border-top-color: var(--brand-blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite; margin: 0 auto 1rem;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
