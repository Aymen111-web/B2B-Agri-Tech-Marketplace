<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { useAuthStore } from '@/stores/auth'
import { getAvatarImage, getCropImage } from '@/utils/imageHelper'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const authStore = useAuthStore()

const isCancelling = ref(false)
const actionMsg = ref({ type: '', text: '' })

const order = computed(() => orderStore.currentOrder)

onMounted(async () => {
  const id = route.params.id
  if (id) {
    await orderStore.fetchOrderDetails(id)
  }
})

async function handleCancelOrder() {
  if (!order.value) return
  if (confirm('Are you sure you want to cancel this order? Stock will be released back to available inventory.')) {
    isCancelling.value = true
    actionMsg.value = { type: '', text: '' }

    const res = await orderStore.cancelOrder(order.value.id)
    isCancelling.value = false

    if (res.success) {
      actionMsg.value = { type: 'success', text: 'Order cancelled and reserved stock released.' }
    } else {
      actionMsg.value = { type: 'error', text: res.message }
    }
  }
}

function handlePayNow() {
  if (!order.value) return
  // Redirects to Chapa payment initiation (Step 7)
  router.push(`/orders/${order.value.id}/pay`)
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
  if (s === 'confirmed' || s === 'completed' || s === 'accepted') return 'badge--success'
  if (s === 'pending_payment' || s === 'pending') return 'badge--warning'
  if (s === 'cancelled' || s === 'rejected') return 'badge--danger'
  return 'badge--info'
}
</script>

<template>
  <div class="order-detail-page">
    <!-- Navbar -->
    <nav class="top-nav">
      <div class="top-nav__inner">
        <router-link to="/" class="top-nav__brand">
          <img src="/images/agri_placeholder.svg" class="nav-brand-img" alt="AgriMarket" />
          Agri<strong>Market</strong>
        </router-link>

        <div class="top-nav__right">
          <router-link to="/orders" class="top-nav__link">
            ← My Orders
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

    <!-- Main Content -->
    <main class="detail-main">
      <div class="detail-container">
        <!-- Loading -->
        <div v-if="orderStore.loading && !order" class="state-card">
          <div class="spinner"></div>
          <p>Loading order details...</p>
        </div>

        <!-- Not Found -->
        <div v-else-if="!order" class="state-card">
          <h2>Order Not Found</h2>
          <p>We could not locate the requested order details.</p>
          <router-link to="/orders" class="btn btn--primary mt-4">
            View All Orders
          </router-link>
        </div>

        <!-- Order Content -->
        <div v-else class="order-content">
          <!-- Header Banner -->
          <div class="order-header-card">
            <div class="order-header-flex">
              <div>
                <div class="order-number-wrap">
                  <h1 class="order-number">{{ order.order_number }}</h1>
                  <span :class="['status-badge', getStatusBadgeClass(order.status)]">
                    {{ (order.status || 'PENDING').replace('_', ' ').toUpperCase() }}
                  </span>
                </div>
                <p class="order-placed-at">Placed on {{ formatDate(order.placed_at || order.created_at) }}</p>
              </div>

              <div class="order-total-box">
                <span class="total-label">Total Payable</span>
                <span class="total-val">ETB {{ formatPrice(order.total_amount) }}</span>
              </div>
            </div>

            <!-- Action Toast -->
            <div v-if="actionMsg.text" :class="['alert-toast', actionMsg.type === 'error' ? 'alert-toast--error' : 'alert-toast--success']" class="mt-4">
              <span>{{ actionMsg.text }}</span>
            </div>
          </div>

          <!-- Content Grid -->
          <div class="detail-grid mt-6">
            <!-- Left Column: Farmer Fulfillments & Items -->
            <div class="fulfillments-col">
              <h2 class="section-heading">Farmer Fulfillment Records</h2>

              <div
                v-for="fulfillment in (order.fulfillments || [])"
                :key="fulfillment.id"
                class="fulfillment-card"
              >
                <div class="fulfillment-header">
                  <div class="farmer-meta">
                    <img :src="getAvatarImage('farmer')" class="user-pill-avatar" alt="Farmer" />
                    <div>
                      <h3 class="farmer-title">
                        Farmer: {{ fulfillment.farmer ? `${fulfillment.farmer.first_name} ${fulfillment.farmer.second_name}` : `ID #${fulfillment.farmer_id}` }}
                      </h3>
                      <span class="fulfillment-id">Fulfillment Row #{{ fulfillment.id }}</span>
                    </div>
                  </div>
                  <span :class="['status-badge', getStatusBadgeClass(fulfillment.status)]">
                    {{ (fulfillment.status || 'PENDING').toUpperCase() }}
                  </span>
                </div>

                <div class="fulfillment-body">
                  <div v-for="item in (fulfillment.items || order.items || [])" :key="item.id" class="item-row">
                    <div class="item-info">
                      <img :src="getCropImage(item.listing?.crop_type || item.listing?.title)" class="item-crop-thumb" alt="Crop" />
                      <div>
                        <h4 class="item-name">{{ item.listing?.title || 'Produce Listing' }}</h4>
                        <span class="item-meta">
                          {{ item.quantity }} {{ item.listing?.unit || 'unit' }}s × ETB {{ formatPrice(item.unit_price) }}
                        </span>
                      </div>
                    </div>
                    <div class="item-price">
                      ETB {{ formatPrice(item.subtotal || (item.quantity * item.unit_price)) }}
                    </div>
                  </div>
                </div>

                <div class="fulfillment-footer">
                  <span>Fulfillment Subtotal:</span>
                  <strong>ETB {{ formatPrice(fulfillment.subtotal_amount) }}</strong>
                </div>
              </div>
            </div>

            <!-- Right Column: Payment & Order Actions -->
            <div class="summary-col">
              <div class="payment-card">
                <h3 class="card-title">Payment & Status</h3>

                <div class="payment-meta">
                  <div class="meta-row">
                    <span>Payment Status:</span>
                    <strong :class="order.payment?.status === 'confirmed' ? 'text-success' : 'text-warning'">
                      {{ (order.payment?.status || 'PENDING').toUpperCase() }}
                    </strong>
                  </div>
                  <div class="meta-row">
                    <span>Payment Channel:</span>
                    <span>Chapa Hosted Checkout</span>
                  </div>
                  <div v-if="order.payment?.confirmed_at" class="meta-row">
                    <span>Confirmed At:</span>
                    <span>{{ formatDate(order.payment.confirmed_at) }}</span>
                  </div>
                </div>

                <div class="divider"></div>

                <!-- Pay Button (If pending payment) -->
                <div v-if="order.status === 'pending_payment'" class="action-box">
                  <div class="chapa-badge">Chapa Payment</div>
                  <button @click="handlePayNow" class="btn btn--primary btn--block btn--lg">
                    Pay Now via Chapa (ETB {{ formatPrice(order.total_amount) }}) →
                  </button>

                  <button
                    @click="handleCancelOrder"
                    :disabled="isCancelling"
                    class="btn btn--danger-outline btn--block mt-3"
                  >
                    Cancel Order & Release Stock
                  </button>
                </div>

                <div v-else-if="order.status === 'confirmed'" class="confirmed-box">
                  Payment Confirmed via Signed Chapa Webhook! Fulfillment processing is active.
                </div>

                <div v-else-if="order.status === 'cancelled'" class="cancelled-box">
                  This order was cancelled. Reserved stock has been released back to farmers.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.order-detail-page {
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
  font-size: 1.25rem; font-weight: 700; color: #fff; text-decoration: none; display: flex; align-items: center; gap: 0.35rem;
}
.nav-brand-img { width: 24px; height: 24px; border-radius: 4px; object-fit: cover; }
.user-pill-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid #bbf7d0; }
.item-crop-thumb { width: 36px; height: 36px; border-radius: 6px; object-fit: cover; border: 1px solid #e2e8f0; }
.top-nav__brand strong { color: #ecfdf5; }
.top-nav__right { display: flex; gap: 1.25rem; align-items: center; }
.top-nav__link { color: rgba(255, 255, 255, 0.9); text-decoration: none; font-weight: 500; }
.top-nav__link:hover { color: #fff; }

/* Main Container */
.detail-main { max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.5rem 4rem; }

.state-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Order Header Card */
.order-header-card {
  background: #ffffff;
  border: 1px solid #bbf7d0;
  border-radius: 1rem;
  padding: 1.75rem 2rem;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.06);
}
.order-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}
.order-number-wrap { display: flex; align-items: center; gap: 1rem; }
.order-number { font-size: 1.85rem; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
.order-placed-at { color: #64748b; font-size: 0.9rem; margin-top: 0.35rem; }

.order-total-box { text-align: right; }
.total-label { display: block; font-size: 0.85rem; color: #64748b; }
.total-val { font-size: 1.75rem; font-weight: 800; color: #15803d; }

/* Grid Layout */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 2rem;
}
@media (max-width: 960px) { .detail-grid { grid-template-columns: 1fr; } }

.section-heading { font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 1.25rem; }

/* Fulfillment Card */
.fulfillment-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.fulfillment-header {
  background: #f8fafc;
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}
.farmer-meta { display: flex; align-items: center; gap: 0.75rem; }
.farmer-title { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0; }
.fulfillment-id { font-size: 0.75rem; color: #64748b; }

.fulfillment-body { padding: 1rem 1.25rem; }
.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px dashed #e2e8f0;
}
.item-row:last-child { border-bottom: none; }
.item-info { display: flex; align-items: center; gap: 0.75rem; }
.item-name { font-size: 0.95rem; font-weight: 600; color: #0f172a; margin: 0 0 0.2rem; }
.item-meta { font-size: 0.825rem; color: #64748b; }
.item-price { font-weight: 700; color: #15803d; }

.fulfillment-footer {
  background: #f8fafc;
  padding: 0.85rem 1.25rem;
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #475569;
  border-top: 1px solid #e2e8f0;
}

/* Payment Sidebar Card */
.payment-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.75rem;
  position: sticky;
  top: 90px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.card-title { font-size: 1.2rem; font-weight: 700; color: #0f172a; margin-bottom: 1.25rem; }
.payment-meta { display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.9rem; }
.meta-row { display: flex; justify-content: space-between; color: #64748b; }
.divider { height: 1px; background: #e2e8f0; margin: 1.25rem 0; }

.chapa-badge {
  background: #dcfce7;
  color: #15803d;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.3rem 0.65rem;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 0.75rem;
}

.confirmed-box {
  background: #dcfce7;
  border: 1px solid #bbf7d0;
  color: #15803d;
  padding: 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
}

.cancelled-box {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
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

/* Buttons */
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600;
  text-decoration: none; cursor: pointer; border: none;
}
.btn--primary { background: #10b981; color: #ffffff; }
.btn--primary:hover { background: #059669; }
.btn--danger-outline {
  background: transparent;
  border: 1px solid #fca5a5;
  color: #dc2626;
}
.btn--danger-outline:hover { background: #fee2e2; }
.btn--block { width: 100%; }
.btn--lg { padding: 0.9rem 1.75rem; font-size: 1.05rem; }

.text-success { color: #15803d; }
.text-warning { color: #b45309; }

.alert-toast {
  padding: 0.85rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.alert-toast--success { background: #dcfce7; border: 1px solid #bbf7d0; color: #15803d; }
.alert-toast--error { background: #fee2e2; border: 1px solid #fecaca; color: #991b1b; }

.spinner {
  width: 40px; height: 40px;
  border: 3px solid rgba(16, 185, 129, 0.2);
  border-top-color: #10b981; border-radius: 50%;
  animation: spin 0.8s linear infinite; margin: 0 auto 1rem;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
