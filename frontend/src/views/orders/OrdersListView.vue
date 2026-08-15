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
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}
.tab {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 0.5rem 1.1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.tab:hover { background: #e2e8f0; color: #0f172a; }
.tab.active {
  background: #10b981;
  color: #ffffff;
  border-color: #10b981;
}

/* Main Content */
.orders-main { max-width: 1000px; margin: 0 auto; padding: 2.5rem 1.5rem 4rem; }

.state-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.empty-card .empty-icon { font-size: 3.5rem; margin-bottom: 1rem; }

.orders-list { display: flex; flex-direction: column; gap: 1.25rem; }

/* Order Card */
.order-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.order-card:hover {
  background: #ffffff;
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.12);
  transform: translateY(-2px);
}

.order-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}
.order-id-group { display: flex; align-items: center; gap: 0.85rem; }
.order-icon { font-size: 1.75rem; }
.order-number { font-size: 1.15rem; font-weight: 700; color: #0f172a; margin: 0; }
.placed-date { font-size: 0.825rem; color: #64748b; }

.order-card__body {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.info-pill {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 0.85rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  color: #64748b;
  display: flex;
  gap: 0.5rem;
}
.info-pill strong { color: #0f172a; }

.order-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed #e2e8f0;
  padding-top: 1rem;
}
.total-wrap { font-size: 0.9rem; color: #64748b; }
.total-amount { font-size: 1.2rem; font-weight: 800; color: #15803d; margin-left: 0.5rem; }

.btn-text {
  background: none;
  border: none;
  color: #10b981;
  font-weight: 700;
  font-size: 0.9rem;
}

/* Status Badges */
.status-badge {
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
}
.badge--success { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.badge--warning { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
.badge--danger  { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
.badge--info    { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }

.text-success { color: #15803d; }
.text-warning { color: #b45309; }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600;
  text-decoration: none; cursor: pointer; border: none;
}
.btn--primary { background: #10b981; color: #ffffff; }
.btn--primary:hover { background: #059669; }
.btn--lg { padding: 0.9rem 1.75rem; font-size: 1.05rem; }

.spinner {
  width: 40px; height: 40px;
  border: 3px solid rgba(16, 185, 129, 0.2);
  border-top-color: #10b981; border-radius: 50%;
  animation: spin 0.8s linear infinite; margin: 0 auto 1rem;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
