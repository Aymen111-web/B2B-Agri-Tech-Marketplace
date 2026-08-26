<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const orderStore = useOrderStore()
const authStore = useAuthStore()
const cartStore = useCartStore()

const activeTab = ref('')

onMounted(async () => {
  await loadOrders()
  if (authStore.isAuthenticated) {
    await cartStore.fetchCart()
  }
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

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

function formatPrice(val) {
  if (val === undefined || val === null) return '0.00'
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getStatusBadgeClass(status) {
  const s = (status || '').toLowerCase()
  if (s === 'confirmed' || s === 'completed') return 'badge--success'
  if (s === 'pending_payment' || s === 'pending') return 'badge--warning'
  if (s === 'cancelled' || s === 'rejected') return 'badge--danger'
  return 'badge--info'
}
import ThemeToggle from '@/components/ThemeToggle.vue'
</script>

<template>
  <div class="orders-page">
    
    <!-- Top Navigation Bar -->
    <nav class="top-nav">
      <div class="top-nav__inner">
        <router-link to="/dashboard" class="top-nav__brand">
          🌿 Agri<strong>Market</strong>
        </router-link>
        <div class="top-nav__right">
          <router-link to="/listings" class="top-nav__link">
            Marketplace
          </router-link>
          <router-link to="/cart" class="top-nav__link">
            🛒 Cart <span v-if="cartStore.itemCount > 0" class="cart-badge">{{ cartStore.itemCount }}</span>
          </router-link>
          <router-link to="/orders" class="top-nav__link active">
            My Orders
          </router-link>
          <router-link v-if="authStore.isAuthenticated" to="/dashboard" class="top-nav__link">
            Dashboard
          </router-link>
          <ThemeToggle />
          <button v-if="authStore.isAuthenticated" @click="handleLogout" class="top-nav__logout">
            Sign Out
          </button>
          <router-link v-else to="/login" class="top-nav__btn">
            Sign In
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Page Header -->
    <header class="orders-header">
      <div class="orders-header__inner">
        <div class="hero-header-flex">
          <div>
            <h1 class="hero-title">My Orders</h1>
            <p class="hero-sub">Track wholesale produce fulfillments and payment status</p>
          </div>
          <div class="trust-chips">
            <span class="chip">📋 Order Tracking</span>
            <span class="chip">⚡ Escrow Protected</span>
            <span class="chip">🚚 Farmer Fulfillment</span>
          </div>
        </div>

        <!-- High Contrast Filter Tabs Carousel -->
        <div class="filter-tabs-wrap">
          <div class="hero-filter-tabs">
            <button
              class="tab-pill"
              :class="{ active: activeTab === '' }"
              @click="activeTab = ''"
            >
              All Orders
            </button>
            <button
              class="tab-pill"
              :class="{ active: activeTab === 'pending_payment' }"
              @click="activeTab = 'pending_payment'"
            >
              ⏳ Pending Payment
            </button>
            <button
              class="tab-pill"
              :class="{ active: activeTab === 'confirmed' }"
              @click="activeTab = 'confirmed'"
            >
              ✅ Confirmed
            </button>
            <button
              class="tab-pill"
              :class="{ active: activeTab === 'completed' }"
              @click="activeTab = 'completed'"
            >
              🎉 Completed
            </button>
            <button
              class="tab-pill"
              :class="{ active: activeTab === 'cancelled' }"
              @click="activeTab = 'cancelled'"
            >
              🛑 Cancelled
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="orders-main">
      <div class="orders-container">

        <!-- Alert Banner -->
        <div v-if="orderStore.error" class="alert alert-error">
          ⚠️ {{ orderStore.error }}
        </div>

        <!-- Loading State -->
        <div v-if="orderStore.loading" class="state-card">
          <div class="spinner"></div>
          <p class="state-title">Loading orders...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="orderStore.orders.length === 0" class="state-card empty-card">
          <div class="empty-icon">📦</div>
          <h3 class="state-title">No orders found</h3>
          <p class="state-sub">You have no orders matching this filter status.</p>
          <router-link to="/listings" class="btn btn-primary btn-lg mt-3">
            Explore Produce Marketplace →
          </router-link>
        </div>

        <!-- Orders List -->
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
                  <span class="placed-date">Placed {{ formatDate(order.placed_at || order.created_at) }}</span>
                </div>
              </div>

              <span :class="['status-badge', getStatusBadgeClass(order.status)]">
                {{ (order.status || 'PENDING').replace('_', ' ').toUpperCase() }}
              </span>
            </div>

            <div class="order-card__body">
              <div class="info-pill">
                <span>Fulfillments:</span>
                <strong>{{ order.fulfillments?.length || 1 }} Supplier(s)</strong>
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
                <span class="total-label">Total:</span>
                <span class="total-amount">ETB {{ formatPrice(order.total_amount) }}</span>
              </div>

              <button class="btn-text">
                View Order & Pay →
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
  background: var(--surface-alt);
}

/* Navigation Bar */
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
.cart-badge {
  background: var(--brand-gold);
  color: #0f172a;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.08rem 0.4rem;
  border-radius: var(--radius-full);
  margin-left: 0.2rem;
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
.top-nav__btn {
  background: var(--brand-gold);
  color: #0f172a;
  padding: 0.3rem 0.75rem;
  border-radius: var(--radius-xs);
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 700;
}

/* Hero Header */
.orders-header {
  background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%);
  color: #fff;
  padding: 1.5rem 1.5rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.orders-header__inner {
  max-width: 1000px;
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
.orders-main {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 3.5rem;
}

.alert-error {
  background: var(--error-bg);
  color: var(--error-dark);
  border: 1px solid var(--error-border);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
}

.state-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 2.5rem 1.5rem;
  text-align: center;
}
.empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
.state-title { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }
.state-sub { font-size: 0.825rem; color: var(--text-secondary); margin-top: 0.25rem; }

.orders-list { display: flex; flex-direction: column; gap: 0.85rem; }

/* Order Card */
.order-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.15rem;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: var(--shadow-xs);
}
.order-card:hover {
  border-color: var(--brand-green-border);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.order-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.order-id-group { display: flex; align-items: center; gap: 0.6rem; }
.order-icon { font-size: 1.25rem; }
.order-number { font-size: 1rem; font-weight: 800; color: var(--text-primary); margin: 0; }
.placed-date { font-size: 0.75rem; color: var(--text-muted); }

.order-card__body {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}
.info-pill {
  background: var(--surface-alt);
  border: 1px solid var(--border-subtle);
  padding: 0.3rem 0.6rem;
  border-radius: var(--radius-xs);
  font-size: 0.78125rem;
  color: var(--text-secondary);
  display: flex;
  gap: 0.35rem;
}
.info-pill strong { color: var(--text-primary); }

.order-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed var(--border-subtle);
  padding-top: 0.65rem;
}
.total-label { font-size: 0.8125rem; color: var(--text-secondary); }
.total-amount { font-size: 1.15rem; font-weight: 800; color: var(--brand-green-dark); margin-left: 0.35rem; }

.btn-text {
  background: none;
  border: none;
  color: var(--brand-green-dark);
  font-weight: 700;
  font-size: 0.8125rem;
  cursor: pointer;
}

/* Status Badges */
.status-badge {
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.badge--success { background: var(--brand-green-light); color: var(--brand-green-dark); }
.badge--warning { background: var(--brand-gold-light); color: var(--brand-gold-dark); }
.badge--danger  { background: var(--error-bg); color: var(--error-dark); }
.badge--info    { background: #eff6ff; color: #1d4ed8; }

.text-success { color: var(--brand-green-dark); }
.text-warning { color: var(--brand-gold-dark); }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0.5rem 1rem; border-radius: var(--radius-xs); font-weight: 700;
  text-decoration: none; cursor: pointer; border: none; font-size: 0.8125rem;
  transition: all 0.15s ease;
}
.btn-primary { background: var(--brand-green); color: #ffffff; }
.btn-primary:hover { background: var(--brand-green-dark); }
.btn-lg { padding: 0.65rem 1.25rem; font-size: 0.875rem; }
.mt-3 { margin-top: 0.75rem; }

.spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--brand-green); border-radius: 50%;
  animation: spin 0.8s linear infinite; margin: 0 auto 0.75rem;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
