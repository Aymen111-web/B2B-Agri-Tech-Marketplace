<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'
import { useListingStore } from '@/stores/listing'

import { getCropImage, getAvatarImage, EMPTY_STATE_IMAGE } from '@/utils/imageHelper'

const auth = useAuthStore()
const cartStore = useCartStore()
const orderStore = useOrderStore()
const listingStore = useListingStore()
const router = useRouter()

const loading = ref(true)

onMounted(async () => {
  await Promise.all([
    cartStore.fetchCart(),
    orderStore.fetchMyOrders(),
    listingStore.fetchListings(),
  ])
  loading.value = false
})

const activeOrders = computed(() => {
  return orderStore.orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled')
})

const totalSpent = computed(() => {
  return orderStore.orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
})

const topCrops = computed(() => {
  return listingStore.listings.slice(0, 4)
})

function formatPrice(val) {
  if (val === undefined || val === null) return '0'
  const num = Number(val)
  return num % 1 === 0 ? num.toLocaleString('en-US') : num.toLocaleString('en-US', { maximumFractionDigits: 2 })
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
  if (s === 'confirmed' || s === 'completed') return 'status--success'
  if (s === 'pending' || s === 'pending_payment') return 'status--warning'
  if (s === 'cancelled') return 'status--danger'
  return 'status--info'
}
</script>

<template>
  <div class="buyer-dash">
    
    <!-- Executive Hero Header -->
    <header class="buyer-hero">
      <div class="buyer-hero__inner">
        <div class="buyer-hero__content">
          <div class="status-pill">
            <span class="pulse-dot"></span>
            Verified Commercial Buyer
          </div>
          <h1 class="hero-title">
            <img :src="getAvatarImage('buyer')" class="buyer-title-avatar" /> Welcome, {{ auth.user?.first_name }} {{ auth.user?.second_name }}
          </h1>
          <p class="hero-sub">
            Ethiopian B2B Produce Sourcing Portal • Order wholesale crops directly from verified farms across Ethiopia.
          </p>
        </div>

        <div class="hero-actions">
          <router-link to="/listings" class="action-btn action-btn--gold">
            Produce Marketplace
          </router-link>
          <router-link to="/cart" class="action-btn action-btn--glass">
            View Cart ({{ cartStore.itemCount }})
          </router-link>
          <router-link to="/orders" class="action-btn action-btn--glass">
            My Orders
          </router-link>
        </div>
      </div>
    </header>

    <!-- KPI Grid -->
    <div class="kpi-grid">
      
      <div class="kpi-card">
        <div class="kpi-card__header">
          <img src="/images/seeds_produce.svg" class="kpi-img-icon" alt="Orders" />
          <span class="kpi-badge kpi-badge--emerald">Orders</span>
        </div>
        <div class="kpi-val">{{ orderStore.orders.length }}</div>
        <div class="kpi-lbl">Total Placed Orders</div>
        <div class="kpi-sub">{{ activeOrders.length }} orders currently active</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card__header">
          <img src="/images/agri_placeholder.svg" class="kpi-img-icon" alt="Cart" />
          <span class="kpi-badge kpi-badge--gold">Cart</span>
        </div>
        <div class="kpi-val">{{ cartStore.itemCount }}</div>
        <div class="kpi-lbl">Items in Cart</div>
        <div class="kpi-sub">Subtotal: {{ formatPrice(cartStore.cartTotal) }} ETB</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card__header">
          <img src="/images/coffee_produce.jpg" class="kpi-img-icon crop-circle" alt="Procurement" />
          <span class="kpi-badge kpi-badge--amber">Procurement</span>
        </div>
        <div class="kpi-val">{{ formatPrice(totalSpent) }} <span class="currency">ETB</span></div>
        <div class="kpi-lbl">Total Produce Sourced</div>
        <div class="kpi-sub">Lifetime B2B trade volume</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card__header">
          <img :src="getAvatarImage('buyer')" class="kpi-img-icon avatar-circle" alt="Privileges" />
          <span class="kpi-badge kpi-badge--emerald">Privileges</span>
        </div>
        <div class="kpi-val">Verified</div>
        <div class="kpi-lbl">Commercial Sourcing</div>
        <div class="kpi-sub">Direct Farmer Access</div>
      </div>

    </div>

    <!-- Main Content Section: Featured Crops & Recent Orders -->
    <div class="dash-grid">
      
      <!-- Left Column: Featured Farm Crops -->
      <div class="content-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Available Wholesale Crops</h2>
            <p class="card-sub">Fresh produce listings available directly from verified Ethiopian farmers</p>
          </div>
          <router-link to="/listings" class="link-btn">
            Browse All Crops →
          </router-link>
        </div>

        <div v-if="loading" class="state-box">
          Loading marketplace crops...
        </div>

        <div v-else class="crops-grid">
          <div v-for="item in topCrops" :key="item.id" class="crop-item">
            <div class="crop-img-wrap">
              <img :src="getCropImage(item.title || item.category?.name)" class="crop-card-img" :alt="item.title" />
            </div>
            <div class="crop-header mt-2">
              <span class="crop-cat">{{ item.category?.name || 'Produce' }}</span>
              <span class="crop-farmer">
                <img :src="getAvatarImage('farmer')" class="farmer-mini-avatar" /> {{ item.farmer?.first_name || 'Farmer' }}
              </span>
            </div>
            <h4 class="crop-title">{{ item.title }}</h4>
            <div class="crop-price">
              <strong>{{ formatPrice(item.price_per_unit) }} ETB</strong>
              <span class="unit-sub">/ {{ item.unit }}</span>
            </div>
            <div class="crop-footer">
              <span class="stock-sub">{{ item.quantity_available }} {{ item.unit }}s in stock</span>
              <router-link to="/listings" class="buy-link">View Crop →</router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Recent Procurement Orders -->
      <div class="side-panel">
        
        <div class="content-card">
          <div class="card-header">
            <h2 class="card-title">Recent Orders</h2>
            <router-link to="/orders" class="link-btn">View All →</router-link>
          </div>

          <div v-if="orderStore.orders.length === 0" class="empty-panel">
            <img :src="EMPTY_STATE_IMAGE" class="empty-mini-img" alt="No orders" />
            <p>No procurement orders placed yet.</p>
            <router-link to="/listings" class="action-btn action-btn--emerald mt-2 w-full">
              Explore Produce Marketplace
            </router-link>
          </div>

          <div v-else class="orders-mini-list">
            <div
              v-for="order in orderStore.orders.slice(0, 4)"
              :key="order.id"
              class="order-mini-card"
            >
              <div class="order-mini-meta">
                <span class="order-no">{{ order.order_number }}</span>
                <span class="order-date">{{ formatDate(order.created_at) }}</span>
              </div>
              <div class="order-mini-row">
                <strong class="order-price">{{ formatPrice(order.total_amount) }} ETB</strong>
                <span class="status-pill-table" :class="getStatusBadgeClass(order.status)">
                  {{ (order.status || 'PENDING').replace('_', ' ').toUpperCase() }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="content-card card--accent">
          <h3 class="panel-title">Buyer Quality Guarantee</h3>
          <ul class="tips-list">
            <li><strong>Verified Farmers:</strong> All crop listings are tied to registered Ethiopian farmers.</li>
            <li><strong>Multi-Farmer Cart:</strong> Buy from multiple farms in a single transaction with separate fulfillment tracking.</li>
            <li><strong>Inspected Quality:</strong> Inspection badges verify produce standards before dispatch.</li>
          </ul>
        </div>

      </div>

    </div>

  </div>
</template>

<style scoped>
.buyer-dash {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Hero Header */
.buyer-hero {
  background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  padding: 1.75rem 2rem;
  color: #ffffff;
  box-shadow: var(--shadow-md);
}

.buyer-hero__inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(16, 185, 129, 0.18);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 8px #34d399;
}

.hero-title {
  font-size: 1.6rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
  letter-spacing: -0.02em;
}

.hero-sub {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem 1.15rem;
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn--gold {
  background: var(--brand-gold);
  color: #0f172a;
}
.action-btn--gold:hover {
  background: var(--brand-gold-dark);
}

.action-btn--emerald {
  background: var(--brand-green);
  color: #ffffff;
}
.action-btn--emerald:hover {
  background: var(--brand-green-dark);
}

.action-btn--glass {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.action-btn--glass:hover {
  background: rgba(255, 255, 255, 0.22);
}

.w-full { width: 100%; }
.mt-2 { margin-top: 0.5rem; }

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.15rem;
}

.kpi-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  box-shadow: var(--shadow-xs);
}

.kpi-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.kpi-icon { font-size: 1.4rem; }

.kpi-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
}
.kpi-badge--emerald { background: var(--brand-green-light); color: var(--brand-green-dark); }
.kpi-badge--amber   { background: var(--brand-gold-light); color: var(--brand-gold-dark); }
.kpi-badge--gold    { background: #fef3c7; color: #92400e; }

.kpi-val {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.currency {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--brand-green);
}

.kpi-lbl {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: 0.35rem;
}

.kpi-sub {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.15rem;
}

/* Layout Grid */
.dash-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.25rem;
}

@media (max-width: 960px) {
  .dash-grid { grid-template-columns: 1fr; }
}

.content-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  box-shadow: var(--shadow-xs);
}

.card--accent {
  background: var(--surface-alt);
  border-color: var(--border);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
}

.card-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
}

.card-sub {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.1rem;
}

.link-btn {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--brand-green);
  text-decoration: none;
}
.link-btn:hover { text-decoration: underline; }

.state-box {
  padding: 3rem 1.5rem;
  text-align: center;
  color: var(--text-secondary);
}

/* Crops Grid */
.crops-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.crop-item {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.crop-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  margin-bottom: 0.4rem;
}
.crop-cat { font-weight: 700; color: var(--brand-green-dark); }
.crop-farmer { color: var(--text-muted); }

.crop-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.4rem;
}

.crop-price strong {
  font-size: 1.1rem;
  color: var(--brand-green);
}
.unit-sub { font-size: 0.75rem; color: var(--text-secondary); }

.crop-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.85rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-subtle);
  font-size: 0.75rem;
}
.stock-sub { color: var(--text-secondary); }
.buy-link { font-weight: 700; color: var(--brand-green); text-decoration: none; }

/* Side Panel */
.side-panel { display: flex; flex-direction: column; gap: 1.25rem; }

.empty-panel {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
}
.empty-panel span { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }

.orders-mini-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.order-mini-card {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  padding: 0.75rem;
  font-size: 0.8rem;
}

.order-mini-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.35rem;
}
.order-no { font-weight: 700; color: var(--text-primary); }
.order-date { color: var(--text-muted); font-size: 0.72rem; }

.order-mini-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.order-price { color: var(--brand-green); font-size: 0.9rem; }

.status-pill-table {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
}
.status--success { background: var(--brand-green-light); color: var(--brand-green-dark); }
.status--warning { background: #fef3c7; color: #92400e; }
.status--danger  { background: var(--error-bg); color: var(--error); }
.status--info    { background: #dbeafe; color: #1e40af; }

.panel-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.tips-list {
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.45;
}
.tips-list strong { color: var(--text-primary); }

/* Image Styling */
.buyer-title-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-right: 0.35rem; border: 1px solid rgba(255,255,255,0.4); }
.kpi-img-icon { width: 28px; height: 28px; object-fit: contain; }
.kpi-img-icon.crop-circle { border-radius: 50%; object-fit: cover; }
.kpi-img-icon.avatar-circle { border-radius: 50%; object-fit: cover; }
.crop-img-wrap { width: 100%; height: 110px; border-radius: 6px; overflow: hidden; background: var(--surface-card); }
.crop-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s ease; }
.crop-item:hover .crop-card-img { transform: scale(1.04); }
.farmer-mini-avatar { width: 16px; height: 16px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-right: 0.2rem; }
.empty-mini-img { width: 90px; height: 75px; margin: 0 auto 0.5rem; display: block; }
</style>
