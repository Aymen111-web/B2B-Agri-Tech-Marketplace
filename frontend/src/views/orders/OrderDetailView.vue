<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { useAuthStore } from '@/stores/auth'
import { getCropImage, getAvatarImage } from '@/utils/imageHelper'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const authStore = useAuthStore()

const isCancelling = ref(false)
const processingFulfillmentId = ref(null)
const actionMsg = ref({ type: '', text: '' })

const order = computed(() => orderStore.currentOrder)

const acceptedFulfillments = computed(() => {
  return (order.value?.fulfillments || []).filter(f => f.status === 'accepted' || f.status === 'paid_in_escrow' || f.status === 'buyer_received' || f.status === 'completed')
})

const isPaymentUnlocked = computed(() => {
  if (!order.value) return false
  if (order.value.status === 'awaiting_buyer_payment') return true
  return acceptedFulfillments.value.length > 0
})

const acceptedTotal = computed(() => {
  if (!acceptedFulfillments.value.length) return Number(order.value?.total_amount || 0)
  return acceptedFulfillments.value.reduce((sum, f) => sum + Number(f.subtotal_amount || 0), 0)
})

const totalFulfillmentsCount = computed(() => {
  return (order.value?.fulfillments || []).length
})

onMounted(async () => {
  const id = route.params.id
  if (id) {
    await orderStore.fetchOrderDetails(id)
  }
})

async function handleCancelOrder() {
  if (!order.value) return
  if (confirm('Are you sure you want to cancel this order? Reserved stock will be released back.')) {
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

async function handleConfirmReceived(fulfillmentId) {
  if (!confirm('Confirm physical inspection and produce receipt for this fulfillment?')) return

  processingFulfillmentId.value = fulfillmentId
  actionMsg.value = { type: '', text: '' }

  try {
    const response = await api.post(`/fulfillments/${fulfillmentId}/confirm-received`)
    actionMsg.value = { type: 'success', text: response.data.message || 'Inspection confirmed! You can now pay the farmer.' }
    await orderStore.fetchOrderDetails(route.params.id)
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to confirm receipt.'
    actionMsg.value = { type: 'error', text: msg }
  } finally {
    processingFulfillmentId.value = null
  }
}

async function handlePayFarmer(fulfillmentId) {
  processingFulfillmentId.value = fulfillmentId
  actionMsg.value = { type: '', text: '' }

  try {
    const response = await api.post(`/fulfillments/${fulfillmentId}/pay`)
    const checkoutUrl = response.data.checkout_url
    const txRef = response.data.payment?.chapa_tx_ref

    if (checkoutUrl) {
      // Save tx_ref & order_id to sessionStorage so PaymentSuccessView can retrieve
      // them when Chapa redirects back WITHOUT query params
      sessionStorage.setItem('pending_payment', JSON.stringify({
        tx_ref:   txRef,
        order_id: order.value?.id,
      }))
      actionMsg.value = { type: 'success', text: 'Redirecting to Chapa Hosted Checkout...' }
      window.location.href = checkoutUrl
    } else {
      actionMsg.value = { type: 'error', text: 'Checkout URL was not returned by payment gateway.' }
    }
  } catch (err) {
    const msg = err.response?.data?.message || 'Unable to initiate payment to farmer subaccount.'
    actionMsg.value = { type: 'error', text: msg }
  } finally {
    processingFulfillmentId.value = null
  }
}

const isPayingOrder = ref(false)

async function handlePayOrder() {
  if (!order.value) return
  isPayingOrder.value = true
  actionMsg.value = { type: '', text: '' }

  try {
    const response = await api.post(`/orders/${order.value.id}/pay`)
    const checkoutUrl = response.data.checkout_url
    const txRef = response.data.payment?.chapa_tx_ref

    if (checkoutUrl) {
      sessionStorage.setItem('pending_payment', JSON.stringify({
        tx_ref:   txRef,
        order_id: order.value.id,
      }))
      actionMsg.value = { type: 'success', text: 'Redirecting to Chapa Hosted Checkout...' }
      window.location.href = checkoutUrl
    } else {
      actionMsg.value = { type: 'error', text: 'Checkout URL was not returned by payment gateway.' }
    }
  } catch (err) {
    const msg = err.response?.data?.message || 'Unable to initiate order payment.'
    actionMsg.value = { type: 'error', text: msg }
  } finally {
    isPayingOrder.value = false
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
  if (s === 'completed' || s === 'buyer_received') return 'badge--success'
  if (s === 'accepted' || s === 'pending') return 'badge--warning'
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

            <!-- Completed Payment & Escrow Success Banner -->
            <div v-if="order.status === 'completed' || order.status === 'paid_in_escrow' || order.payment_status === 'paid'" class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mt-4 flex items-center justify-between gap-3 shadow-sm">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
                  ✓
                </div>
                <div>
                  <h4 class="font-bold text-emerald-950 text-base">
                    {{ order.status === 'completed' ? '🎉 Order Completed & Escrow Settled!' : '🔒 Escrow Payment Confirmed' }}
                  </h4>
                  <p class="text-xs text-emerald-700">
                    Funds safely secured via Chapa Escrow. Produce handoff and inspection status verified.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Content Grid -->
          <div class="detail-grid mt-6">
            <!-- Left Column: Farmer Fulfillments & Items -->
            <div class="fulfillments-col">
              <h2 class="section-heading">Farmer Direct Settlement Fulfillments</h2>

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
                    {{ (fulfillment.status || 'PENDING').replace('_', ' ').toUpperCase() }}
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
                  <div class="subtotal-info">
                    <span>Fulfillment Amount:</span>
                    <strong>ETB {{ formatPrice(fulfillment.subtotal_amount) }}</strong>
                  </div>

                  <!-- Fulfillment Actions: Instant Auto-Complete Settlement -->
                  <div class="fulfillment-actions">
                    <!-- Case 1: Farmer Accepted -> Buyer can Pay via Chapa! -->
                    <template v-if="fulfillment.status === 'accepted'">
                      <button
                        @click="handlePayFarmer(fulfillment.id)"
                        :disabled="processingFulfillmentId === fulfillment.id"
                        class="btn btn--chapa btn--sm"
                      >
                        <span v-if="processingFulfillmentId === fulfillment.id" class="spinner-sm"></span>
                        <span v-else>🔒 Pay ETB {{ formatPrice(fulfillment.subtotal_amount) }} via Chapa →</span>
                      </button>
                    </template>

                    <!-- Case 2: Completed / Settled -->
                    <template v-else-if="fulfillment.status === 'completed' || fulfillment.status === 'paid_in_escrow' || fulfillment.status === 'buyer_received'">
                      <span class="text-success font-bold text-xs">🎉 Order Completed & Settled</span>
                    </template>

                    <!-- Case 5: Pending Farmer Acceptance -->
                    <template v-else-if="fulfillment.status === 'pending' || fulfillment.status === 'pending_farmer_approval'">
                      <div class="flex items-center gap-2">
                        <span class="text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md font-medium">
                          ⏳ Awaiting Farmer Acceptance
                        </span>
                        <button disabled class="btn btn--disabled btn--sm cursor-not-allowed opacity-50">
                          🔒 Payment Locked
                        </button>
                      </div>
                    </template>

                    <!-- Case 6: Rejected -->
                    <template v-else-if="fulfillment.status === 'rejected'">
                      <span class="text-xs bg-red-100 text-red-800 px-2.5 py-1 rounded-md font-medium">
                        ❌ Farmer Declined (Stock Released)
                      </span>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Payment Policy Summary -->
            <div class="summary-col">
              <div class="payment-card">
                <h3 class="card-title">Order Payment & Settlement</h3>

                <!-- Escrow Payment Status Box -->
                <div v-if="order.payment_status !== 'confirmed' && order.status !== 'completed' && order.status !== 'cancelled'" class="mb-4">
                  
                  <!-- State A: Payment Locked (Waiting for Farmer Approval) -->
                  <div v-if="!isPaymentUnlocked" class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 mb-3">
                    <div class="flex items-center gap-2 font-bold text-amber-900 text-base mb-1">
                      <span>⏳</span>
                      <span>Awaiting Farmer Acceptance</span>
                    </div>
                    <p class="text-xs text-amber-700 leading-relaxed mb-3">
                      Payment is locked until the farmer confirms their stock is available. You will be notified as soon as payment is unlocked.
                    </p>
                    <button
                      disabled
                      class="w-full py-3 px-4 rounded-lg bg-gray-200 text-gray-500 font-semibold text-sm cursor-not-allowed border border-gray-300 shadow-inner flex items-center justify-center gap-2"
                    >
                      <span>🔒</span>
                      <span>Payment Locked (Waiting for Farmer)</span>
                    </button>
                  </div>

                  <!-- State B: Payment Unlocked (Farmer Accepted) -->
                  <div v-else class="pay-banner">
                    <div class="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2 flex items-center gap-2">
                      <span>✅</span>
                      <span v-if="totalFulfillmentsCount > 1">
                        {{ acceptedFulfillments.length }} of {{ totalFulfillmentsCount }} Farmers Confirmed Stock!
                      </span>
                      <span v-else>
                        Farmer confirmed stock availability!
                      </span>
                    </div>
                    <p class="pay-banner-text text-xs text-gray-600 mb-3">
                      Secure accepted produce by paying into escrow. Funds are safely held until delivery and inspection.
                    </p>
                    <button
                      @click="handlePayOrder"
                      :disabled="isPayingOrder"
                      class="btn btn--chapa btn--block btn--lg"
                    >
                      <span v-if="isPayingOrder" class="spinner-sm"></span>
                      <span v-else>🔒 Pay ETB {{ formatPrice(acceptedTotal) }} to Escrow →</span>
                    </button>
                  </div>
                </div>

                <div class="payment-meta">
                  <div class="meta-row">
                    <span>Model:</span>
                    <strong>Direct Chapa Subaccount</strong>
                  </div>
                  <div class="meta-row">
                    <span>Platform Commission:</span>
                    <strong class="text-success">0 ETB (100% to Farmer)</strong>
                  </div>
                  <div class="meta-row">
                    <span>Logistics:</span>
                    <span>Buyer Transportation</span>
                  </div>
                </div>

                <div class="divider"></div>

                <div class="info-box">
                  🔍 <strong>Inspection & Settlement:</strong> For direct farmer fulfillments, inspect produce upon delivery, click <strong>"Confirm Received"</strong>, and then click <strong>"Pay Farmer"</strong> to trigger settlement.
                </div>


                <button
                  v-if="order.status === 'pending_payment' || order.status === 'processing'"
                  @click="handleCancelOrder"
                  :disabled="isCancelling"
                  class="btn btn--danger-outline btn--block mt-4"
                >
                  Cancel Order & Release Stock
                </button>
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
.btn--chapa { background: #0284c7; color: #ffffff; font-weight: 700; }
.btn--chapa:hover { background: #0369a1; }
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

/* Receipt Modal Styles */
.receipt-backdrop {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
}
.receipt-modal {
  background: #ffffff;
  border-radius: 1.25rem;
  max-width: 650px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  display: flex; flex-direction: column;
}
.receipt-header {
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex; justify-content: space-between; align-items: center;
  background: #f8fafc;
  border-top-left-radius: 1.25rem; border-top-right-radius: 1.25rem;
}
.receipt-brand { display: flex; align-items: center; gap: 0.75rem; }
.receipt-logo { width: 36px; height: 36px; border-radius: 6px; object-fit: cover; }
.receipt-close-btn {
  background: transparent; border: none; font-size: 1.75rem; color: #64748b; cursor: pointer; line-height: 1;
}
.receipt-close-btn:hover { color: #0f172a; }

.receipt-body { padding: 1.5rem 1.75rem; }
.receipt-status-banner {
  background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 0.75rem;
  padding: 0.85rem 1.25rem; display: flex; align-items: center; gap: 0.85rem; margin-bottom: 1.25rem;
}
.status-shield { font-size: 1.5rem; }

.receipt-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;
  background: #f8fafc; padding: 1rem; border-radius: 0.75rem; border: 1px solid #e2e8f0;
}
.receipt-meta-item { display: flex; flex-direction: column; gap: 0.15rem; }
.meta-label { font-size: 0.75rem; color: #64748b; font-weight: 500; }

.receipt-divider { height: 1px; background: #e2e8f0; margin: 1.25rem 0; }
.receipt-section-title { font-size: 0.9rem; font-weight: 700; color: #0f172a; margin-bottom: 0.75rem; }

.receipt-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.receipt-table th { text-align: left; padding: 0.5rem 0; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: 600; }
.receipt-table td { padding: 0.65rem 0; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
.text-right { text-align: right; }

.receipt-summary { display: flex; flex-direction: column; gap: 0.5rem; }
.summary-row { display: flex; justify-content: space-between; font-size: 0.9rem; color: #475569; }
.summary-row--total { font-size: 1.05rem; padding-top: 0.5rem; border-top: 1px dashed #cbd5e1; color: #0f172a; }

.receipt-footer {
  padding: 1.25rem 1.75rem; background: #f8fafc; border-top: 1px solid #e2e8f0;
  display: flex; justify-content: flex-end; gap: 0.75rem;
  border-bottom-left-radius: 1.25rem; border-bottom-right-radius: 1.25rem;
}

@media print {
  body * { visibility: hidden; }
  .receipt-modal, .receipt-modal * { visibility: visible; }
  .receipt-modal { position: absolute; left: 0; top: 0; width: 100%; max-width: 100%; box-shadow: none; }
  .receipt-footer, .receipt-close-btn { display: none !important; }
}
</style>
