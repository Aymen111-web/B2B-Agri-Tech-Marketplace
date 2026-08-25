<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth   = useAuthStore()
const router = useRouter()

// Reactive state
const activeTab = ref('marketplace') // marketplace, orders, fulfillments
const listings  = ref([])
const orders    = ref([])
const fulfillments = ref([])

// Active reservation timers (mapping order_id => formatted countdown)
const countdowns = ref({})
let timerInterval = null

// PIN & Inspection Modals state
const showPinModal = ref(false)
const selectedOrderPin = ref('')
const pinInput = ref('')
const pinVerifyOrderId = ref(null)
const pinVerifyMessage = ref('')

const showInspectModal = ref(false)
const selectedFulfillment = ref(null)
const inspectStatus = ref('accepted')
const acceptedQty = ref(0)
const rejectedQty = ref(0)
const inspectNotes = ref('')
const inspectMessage = ref('')

// Demo mock data initializer (falls back to backend API endpoints)
onMounted(() => {
  fetchDashboardData()
  timerInterval = setInterval(updateCountdowns, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

function fetchDashboardData() {
  // Sample initial data matching backend schemas
  listings.value = [
    {
      id: 101,
      title: 'Premium Red Teff - Batch #2026-A',
      category: 'Grains & Cereals',
      farmer_name: 'Ato Abebe Tessema (Ada\'a Cooperative)',
      price_per_unit: 5200.00,
      unit: 'quintal',
      quantity_available: 45.00,
      batch_number: 'TEFF-2026-001',
      harvest_date: '2026-08-20',
      quality_grade: 'Grade A Export',
      minimum_order_quantity: 2.00,
      reference_market_price: 5400.00,
    },
    {
      id: 102,
      title: 'Organic Hass Avocados - Wonchi Highlands',
      category: 'Fruits',
      farmer_name: 'Woynitu Farmers Alliance',
      price_per_unit: 140.00,
      unit: 'kg',
      quantity_available: 1200.00,
      batch_number: 'AVO-WON-88',
      harvest_date: '2026-08-22',
      quality_grade: 'Grade A Premium',
      minimum_order_quantity: 50.00,
      reference_market_price: 155.00,
    }
  ]

  orders.value = [
    {
      id: 1,
      order_number: 'ORD-2026-000492',
      status: 'pending_payment',
      payment_status: 'pending',
      delivery_status: 'pending',
      inspection_status: 'pending',
      payout_status: 'locked',
      total_amount: 10400.00,
      currency: 'ETB',
      delivery_pin: '849201',
      reservation_expires_at: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
    }
  ]

  fulfillments.value = [
    {
      id: 201,
      order_number: 'ORD-2026-000381',
      buyer_name: 'Grand Addis Hotel',
      status: 'completed',
      delivery_status: 'delivered',
      inspection_status: 'pending',
      payout_status: 'pending_inspection',
      subtotal_amount: 28000.00,
      accepted_quantity: 200,
      rejected_quantity: 0,
    }
  ]
}

function updateCountdowns() {
  const now = new Date().getTime()
  orders.value.forEach(order => {
    if (order.reservation_expires_at && order.status === 'pending_payment') {
      const expTime = new Date(order.reservation_expires_at).getTime()
      const diff = expTime - now

      if (diff <= 0) {
        countdowns.value[order.id] = 'EXPIRED'
        order.status = 'expired'
      } else {
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const secs = Math.floor((diff % (1000 * 60)) / 1000)
        countdowns.value[order.id] = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`
      }
    }
  })
}

function openPinModal(order) {
  selectedOrderPin.value = order.delivery_pin
  pinVerifyOrderId.value = order.id
  pinInput.value = ''
  pinVerifyMessage.value = ''
  showPinModal.value = true
}

function verifyPin() {
  if (pinInput.value === selectedOrderPin.value) {
    pinVerifyMessage.value = '✅ PIN Verified Successfully! Handoff Confirmed.'
    const target = orders.value.find(o => o.id === pinVerifyOrderId.value)
    if (target) target.delivery_status = 'delivered'
    setTimeout(() => { showPinModal.value = false }, 1200)
  } else {
    pinVerifyMessage.value = '❌ Invalid PIN! Please check buyer handoff code.'
  }
}

function openInspectModal(fulfillment) {
  selectedFulfillment.value = fulfillment
  inspectStatus.value = 'accepted'
  acceptedQty.value = fulfillment.accepted_quantity || 100
  rejectedQty.value = 0
  inspectNotes.value = ''
  inspectMessage.value = ''
  showInspectModal.value = true
}

function submitInspection() {
  if (!selectedFulfillment.value) return
  selectedFulfillment.value.inspection_status = inspectStatus.value
  if (inspectStatus.value === 'accepted') {
    selectedFulfillment.value.payout_status = 'eligible'
    inspectMessage.value = '✅ Inspection completed. Payout marked ELIGIBLE!'
  } else if (inspectStatus.value === 'partially_accepted') {
    selectedFulfillment.value.payout_status = 'eligible'
    inspectMessage.value = '⚠️ Partial acceptance saved. Accepted portion marked eligible for payout.'
  } else {
    selectedFulfillment.value.payout_status = 'rejected_refund'
    inspectMessage.value = '🚨 Produce rejected. Flagged for buyer refund.'
  }
  setTimeout(() => { showInspectModal.value = false }, 1500)
}

async function handleLogout() {
  await auth.logout()
  router.push('/')
}
</script>

<template>
  <div class="dashboard">
    <!-- Header Navbar -->
    <nav class="dash-nav">
      <div class="dash-nav__inner">
        <span class="dash-nav__brand">🌿 Agri<strong>Market</strong> B2B</span>
        <div class="dash-nav__center">
          <button :class="{ active: activeTab === 'marketplace' }" @click="activeTab = 'marketplace'">🌾 Listings</button>
          <button :class="{ active: activeTab === 'orders' }" @click="activeTab = 'orders'">📦 My Orders</button>
          <button :class="{ active: activeTab === 'fulfillments' }" @click="activeTab = 'fulfillments'">🚜 Fulfillments</button>
        </div>
        <div class="dash-nav__right">
          <span class="dash-nav__user">{{ auth.user?.first_name }} {{ auth.user?.second_name }}</span>
          <button class="dash-nav__logout" @click="handleLogout">Sign Out</button>
        </div>
      </div>
    </nav>

    <!-- Main Content Container -->
    <main class="dash-container">

      <!-- TAB 1: MARKETPLACE LISTINGS -->
      <section v-if="activeTab === 'marketplace'" class="tab-section">
        <div class="section-header">
          <h2>🌾 Ethiopian Agricultural Produce Batches</h2>
          <span class="badge badge-info">Spot & Forward Contracts</span>
        </div>

        <div class="grid-cards">
          <div v-for="item in listings" :key="item.id" class="card listing-card">
            <div class="card-header">
              <span class="category-badge">{{ item.category }}</span>
              <span class="grade-badge">{{ item.quality_grade }}</span>
            </div>
            <h3 class="card-title">{{ item.title }}</h3>
            <p class="farmer-name">🧑‍🌾 {{ item.farmer_name }}</p>

            <div class="metadata-grid">
              <div class="meta-item">
                <span class="meta-label">Batch No</span>
                <span class="meta-value">{{ item.batch_number }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Harvest Date</span>
                <span class="meta-value">{{ item.harvest_date }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">MOQ</span>
                <span class="meta-value">{{ item.minimum_order_quantity }} {{ item.unit }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Market Ref</span>
                <span class="meta-value strike">{{ item.reference_market_price }} ETB</span>
              </div>
            </div>

            <div class="price-row">
              <div class="price-tag">
                <span class="amount">{{ item.price_per_unit }}</span>
                <span class="currency">ETB / {{ item.unit }}</span>
              </div>
              <button class="btn btn-primary">Reserve Stock</button>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 2: BUYER ORDERS & RESERVATION TIMERS -->
      <section v-if="activeTab === 'orders'" class="tab-section">
        <div class="section-header">
          <h2>📦 Active Orders & Stock Reservations</h2>
        </div>

        <div v-for="order in orders" :key="order.id" class="card order-card">
          <div class="order-main-info">
            <div>
              <span class="order-num">{{ order.order_number }}</span>
              <span class="badge" :class="order.status === 'pending_payment' ? 'badge-warning' : 'badge-success'">
                {{ order.status.replace('_', ' ') }}
              </span>
            </div>
            <div class="order-timer" v-if="order.status === 'pending_payment'">
              ⏳ Stock Reservation Expires: <strong class="timer-digits">{{ countdowns[order.id] || '15m 00s' }}</strong>
            </div>
          </div>

          <div class="order-details-bar">
            <span>Total: <strong>{{ order.total_amount }} {{ order.currency }}</strong></span>
            <span>Delivery Status: <strong class="text-capitalize">{{ order.delivery_status }}</strong></span>
            <button class="btn btn-secondary btn-sm" @click="openPinModal(order)">🔑 Delivery PIN Verification</button>
          </div>
        </div>
      </section>

      <!-- TAB 3: FARMER FULFILLMENTS & PRODUCE INSPECTION -->
      <section v-if="activeTab === 'fulfillments'" class="tab-section">
        <div class="section-header">
          <h2>🚜 Produce Delivery & Quality Inspection</h2>
        </div>

        <div v-for="f in fulfillments" :key="f.id" class="card order-card">
          <div class="order-main-info">
            <div>
              <span class="order-num">{{ f.order_number }}</span>
              <span class="badge badge-info">Buyer: {{ f.buyer_name }}</span>
            </div>
            <div>
              Payout Status: <span class="badge" :class="f.payout_status === 'eligible' ? 'badge-success' : 'badge-warning'">{{ f.payout_status }}</span>
            </div>
          </div>

          <div class="order-details-bar">
            <span>Subtotal: <strong>{{ f.subtotal_amount }} ETB</strong></span>
            <button class="btn btn-primary btn-sm" @click="openInspectModal(f)">🔍 Perform Quality Inspection</button>
          </div>
        </div>
      </section>

    </main>

    <!-- MODAL 1: DELIVERY PIN HANDOFF -->
    <div v-if="showPinModal" class="modal-backdrop">
      <div class="modal-card">
        <h3>🔑 Secure 6-Digit Delivery Handoff PIN</h3>
        <p class="modal-sub">Provide this PIN to the farmer upon receiving produce handoff.</p>
        
        <div class="pin-display-box">
          <span class="pin-code">{{ selectedOrderPin }}</span>
        </div>

        <div class="pin-verify-form">
          <label>Farmer Verification Test:</label>
          <input type="text" v-model="pinInput" placeholder="Enter 6-digit PIN" maxlength="6" class="form-input"/>
          <button class="btn btn-success" @click="verifyPin">Verify Handoff PIN</button>
        </div>

        <p v-if="pinVerifyMessage" class="feedback-msg">{{ pinVerifyMessage }}</p>
        <button class="btn btn-text" @click="showPinModal = false">Close Window</button>
      </div>
    </div>

    <!-- MODAL 2: PRODUCE QUALITY INSPECTION -->
    <div v-if="showInspectModal" class="modal-backdrop">
      <div class="modal-card">
        <h3>🔍 Produce Quality Inspection</h3>
        <p class="modal-sub">Verify produce condition prior to releasing escrow payout to farmer.</p>

        <div class="form-group">
          <label>Inspection Outcome:</label>
          <select v-model="inspectStatus" class="form-select">
            <option value="accepted">Accepted (100% Quality Met)</option>
            <option value="partially_accepted">Partially Accepted (Partial Spoilage)</option>
            <option value="rejected">Rejected (Spoiled / Below Specification)</option>
          </select>
        </div>

        <div class="form-row" v-if="inspectStatus === 'partially_accepted'">
          <div class="form-group">
            <label>Accepted Quantity:</label>
            <input type="number" v-model="acceptedQty" class="form-input"/>
          </div>
          <div class="form-group">
            <label>Rejected Quantity:</label>
            <input type="number" v-model="rejectedQty" class="form-input"/>
          </div>
        </div>

        <div class="form-group">
          <label>Inspection Notes / Quality Remarks:</label>
          <textarea v-model="inspectNotes" placeholder="e.g. Moisture level optimal, 2 bags damaged in transit" class="form-textarea"></textarea>
        </div>

        <p v-if="inspectMessage" class="feedback-msg">{{ inspectMessage }}</p>

        <div class="modal-actions">
          <button class="btn btn-primary" @click="submitInspection">Complete Inspection</button>
          <button class="btn btn-text" @click="showInspectModal = false">Cancel</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.dashboard { min-height: 100vh; background: #f8fafc; color: #1e293b; font-family: system-ui, sans-serif; }
.dash-nav { background: #064e3b; color: #fff; padding: 0 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
.dash-nav__inner { max-width: 1280px; margin: 0 auto; height: 68px; display: flex; align-items: center; justify-content: space-between; }
.dash-nav__brand { font-size: 1.25rem; font-weight: 600; color: #f0fdf4; }
.dash-nav__brand strong { color: #f59e0b; }
.dash-nav__center { display: flex; gap: 0.5rem; }
.dash-nav__center button { background: transparent; border: none; color: #a7f3d0; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.dash-nav__center button.active, .dash-nav__center button:hover { background: rgba(255,255,255,0.15); color: #fff; }
.dash-nav__right { display: flex; align-items: center; gap: 1rem; }
.dash-nav__user { font-size: 0.9rem; color: #d1fae5; }
.dash-nav__logout { background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; }

.dash-container { max-width: 1280px; margin: 2rem auto; padding: 0 1.5rem; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
.section-header h2 { font-size: 1.5rem; font-weight: 700; color: #0f172a; }

.grid-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; }
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.listing-card { display: flex; flex-direction: column; justify-content: space-between; }
.card-header { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
.category-badge { background: #e0f2fe; color: #0369a1; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.5rem; border-radius: 4px; }
.grade-badge { background: #fef3c7; color: #b45309; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.5rem; border-radius: 4px; }
.card-title { font-size: 1.15rem; font-weight: 600; margin-bottom: 0.25rem; }
.farmer-name { font-size: 0.85rem; color: #64748b; margin-bottom: 1rem; }

.metadata-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; background: #f8fafc; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; }
.meta-item { display: flex; flex-direction: column; }
.meta-label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; }
.meta-value { font-size: 0.85rem; font-weight: 600; color: #334155; }
.strike { text-decoration: line-through; color: #94a3b8; }

.price-row { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
.price-tag .amount { font-size: 1.4rem; font-weight: 800; color: #047857; }
.price-tag .currency { font-size: 0.8rem; color: #64748b; margin-left: 0.25rem; }

.btn { padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; transition: background 0.2s; }
.btn-primary { background: #059669; color: #fff; }
.btn-primary:hover { background: #047857; }
.btn-secondary { background: #3b82f6; color: #fff; }
.btn-success { background: #10b981; color: #fff; }
.btn-sm { font-size: 0.85rem; padding: 0.4rem 0.75rem; }
.btn-text { background: transparent; color: #64748b; }

.order-card { margin-bottom: 1rem; }
.order-main-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.order-num { font-size: 1.1rem; font-weight: 700; margin-right: 0.75rem; }
.order-timer { background: #fff7ed; border: 1px solid #ffedd5; color: #c2410c; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.85rem; }
.timer-digits { font-family: monospace; font-size: 1rem; }
.order-details-bar { display: flex; align-items: center; justify-content: space-between; padding-top: 0.75rem; border-top: 1px solid #f1f5f9; }

.badge { font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.6rem; border-radius: 20px; text-transform: uppercase; }
.badge-info { background: #e0f2fe; color: #0284c7; }
.badge-warning { background: #fef3c7; color: #d97706; }
.badge-success { background: #dcfce7; color: #15803d; }

.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-card { background: #fff; width: 100%; max-width: 480px; padding: 2rem; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-sub { font-size: 0.85rem; color: #64748b; margin-bottom: 1.5rem; }
.pin-display-box { background: #f1f5f9; border: 2px dashed #cbd5e1; text-align: center; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; }
.pin-code { font-family: monospace; font-size: 2.2rem; font-weight: 800; letter-spacing: 0.5rem; color: #0f172a; }
.form-group { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem; }
.form-input, .form-select, .form-textarea { padding: 0.6rem 0.8rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; }
.form-textarea { min-height: 80px; }
.feedback-msg { margin-top: 1rem; font-weight: 600; font-size: 0.9rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
</style>
