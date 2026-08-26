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
    <!-- Navbar -->
    <nav class="top-nav">
      <div class="top-nav__inner">
        <router-link to="/" class="top-nav__brand">
          🌿 Agri<strong>Market</strong>
        </router-link>

        <div class="top-nav__right">
          <router-link to="/cart" class="top-nav__link">
            🛒 Cart
          </router-link>
          <router-link to="/listings" class="top-nav__link">
            Browse Marketplace
          </router-link>
          <router-link v-if="authStore.isAuthenticated" to="/dashboard" class="top-nav__link">
            Dashboard
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Header -->
    <header class="orders-header">
      <div class="orders-header__inner">
        <div class="header-badge">📋 Order History</div>
        <h1 class="header-title">My Produce Orders</h1>
        <p class="header-sub">
          Track fulfillment status across verified Ethiopian farmers and pay via Chapa hosted checkout.
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
            :class="{ active: activeTab === 'pending_payment' }"
            @click="activeTab = 'pending_payment'"
          >
            ⏳ Pending Payment
          </button>
          <button
            class="tab"
            :class="{ active: activeTab === 'confirmed' }"
            @click="activeTab = 'confirmed'"
          >
            ✅ Confirmed
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
            :class="{ active: activeTab === 'cancelled' }"
            @click="activeTab = 'cancelled'"
          >
            🛑 Cancelled
          </button>
        </div>
      </div>
    </header>

    <!-- Main Orders List -->
    <main class="orders-main">
      <div class="orders-container">

        <!-- Error Alert -->
        <div v-if="orderStore.error" class="alert alert--error mb-6">
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
          <router-link to="/listings" class="btn btn--primary btn--lg mt-4">
            Explore Produce Marketplace
          </router-link>
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

              <span :class="['status-badge', getStatusBadgeClass(order.status)]">
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
    </main>
  </div>
</template>

<style scoped>
.orders-page {
  min-height: 100vh;
  background: #f8fafc;
  color: #0f172a;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Nav */
.top-nav {
  background: #10b981;
  padding: 0 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.top-nav__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.top-nav__brand {
  font-size: 1.25rem; font-weight: 700; color: #fff; text-decoration: none;
}
.top-nav__brand strong { color: #ecfdf5; }
.top-nav__right { display: flex; gap: 1.25rem; align-items: center; }
.top-nav__link { color: rgba(255, 255, 255, 0.9); text-decoration: none; font-weight: 500; }
.top-nav__link:hover { color: #fff; }

/* Header */
.orders-header {
  background: #ffffff;
  padding: 2.5rem 1.5rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}
.orders-header__inner { max-width: 1000px; margin: 0 auto; }
.header-badge {
  display: inline-block;
  background: #dcfce7;
  color: #15803d; font-weight: 700; font-size: 0.85rem;
  padding: 0.35rem 0.85rem; border-radius: 9999px; margin-bottom: 0.75rem;
  border: 1px solid #bbf7d0;
}
.header-title { font-size: 2rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem; }
.header-sub { color: #64748b; font-size: 1rem; margin-bottom: 2rem; }

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 0.35rem;
  overflow-x: auto;
  padding: 0.25rem;
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}
.tab {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-xs);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}
.tab:hover { color: var(--text-primary); }
.tab.active {
  background: var(--surface);
  color: var(--brand-green-dark);
  box-shadow: var(--shadow-xs);
  font-weight: 700;
}

/* Main Content */
.orders-main { max-width: 1000px; margin: 0 auto; padding: 2rem 1.5rem 3.5rem; }

.state-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 3.5rem 2rem;
  text-align: center;
  box-shadow: var(--shadow-xs);
}
.empty-card .empty-icon { font-size: 3rem; margin-bottom: 0.85rem; }

.orders-list { display: flex; flex-direction: column; gap: 1rem; }

/* Order Card */
.order-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.25rem 1.35rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: var(--shadow-sm);
}
.order-card:hover {
  border-color: rgba(16, 185, 129, 0.35);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.order-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.order-id-group { display: flex; align-items: center; gap: 0.75rem; }
.order-icon { font-size: 1.5rem; }
.order-number { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin: 0; }
.placed-date { font-size: 0.8125rem; color: var(--text-muted); }

.order-card__body {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.info-pill {
  background: var(--surface-alt);
  border: 1px solid var(--border-subtle);
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-xs);
  font-size: 0.8125rem;
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
.total-amount { font-size: 1.15rem; font-weight: 800; color: var(--brand-green-dark); margin-left: 0.4rem; }

.btn-text {
  background: none;
  border: none;
  color: var(--brand-green-dark);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}

/* Status Badges */
.status-badge {
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.badge--success { background: var(--brand-green-light); color: var(--brand-green-dark); border: 1px solid var(--brand-green-border); }
.badge--warning { background: var(--brand-gold-light); color: var(--brand-gold-dark); border: 1px solid var(--brand-gold-border); }
.badge--danger  { background: var(--error-bg); color: var(--error-dark); border: 1px solid var(--error-border); }
.badge--info    { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }

.text-success { color: var(--brand-green-dark); }
.text-warning { color: var(--brand-gold-dark); }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0.6rem 1.25rem; border-radius: var(--radius-sm); font-weight: 700;
  text-decoration: none; cursor: pointer; border: none; font-size: 0.875rem;
  transition: all 0.15s ease;
}
.btn--primary { background: var(--brand-green); color: #ffffff; }
.btn--primary:hover { background: var(--brand-green-dark); }
.btn--lg { padding: 0.75rem 1.5rem; font-size: 0.95rem; }

.spinner {
  width: 36px; height: 36px;
  border: 3px solid rgba(16, 185, 129, 0.2);
  border-top-color: var(--brand-green); border-radius: 50%;
  animation: spin 0.8s linear infinite; margin: 0 auto 0.85rem;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
