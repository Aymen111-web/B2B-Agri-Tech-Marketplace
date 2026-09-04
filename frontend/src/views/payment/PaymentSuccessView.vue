<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const loading = ref(true)
const payment = ref(null)
const orderId = ref(null)
const txRef = ref('')

onMounted(async () => {
  let storedSession = null
  try {
    const raw = sessionStorage.getItem('pending_payment')
    if (raw) storedSession = JSON.parse(raw)
  } catch (e) {}

  txRef.value = route.query.tx_ref || route.query.trx_ref || storedSession?.tx_ref || ''
  orderId.value = route.query.order_id || storedSession?.order_id || null

  if (txRef.value) {
    try {
      const res = await api.get(`/payments/verify/${txRef.value}`)
      payment.value = res.data?.payment || null
      orderId.value = orderId.value || res.data?.payment?.order_id || null
    } catch (err) {
      if (err.response?.data?.payment) payment.value = err.response.data.payment
    } finally {
      sessionStorage.removeItem('pending_payment')
    }
  }
  loading.value = false
})

function formatPrice(val) {
  if (val === undefined || val === null) return '0.00'
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<template>
  <div class="success-page">
    <nav class="top-nav">
      <div class="top-nav__inner">
        <router-link to="/" class="top-nav__brand">
          <img src="/images/agri_placeholder.svg" class="nav-brand-img" alt="AgriMarket" />
          Agri<strong>Market</strong>
        </router-link>
      </div>
    </nav>

    <main class="main-content">
      <div class="card">
        <div v-if="loading" class="state-loading">
          <div class="spinner"></div>
          <h2>Verifying payment status...</h2>
        </div>

        <div v-else class="state-done">
          <div class="check-icon">✓</div>
          <h1 class="title">Payment Confirmed</h1>
          <p class="subtitle">Your transaction has been processed and recorded via Chapa.</p>

          <div v-if="txRef || payment" class="details-box">
            <div class="detail-row" v-if="txRef">
              <span>Transaction Ref:</span>
              <strong>{{ txRef }}</strong>
            </div>
            <div class="detail-row" v-if="payment?.amount">
              <span>Amount Paid:</span>
              <strong class="text-green">ETB {{ formatPrice(payment.amount) }}</strong>
            </div>
            <div class="detail-row">
              <span>Status:</span>
              <strong class="badge-success">CONFIRMED & SETTLED</strong>
            </div>
          </div>

          <div class="actions">
            <router-link v-if="orderId" :to="`/orders/${orderId}`" class="btn btn-primary">
              View Order Details →
            </router-link>
            <router-link v-else to="/orders" class="btn btn-secondary">
              Go to My Orders
            </router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.success-page {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Inter', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
}
.top-nav {
  background: #10b981;
  padding: 0 1.5rem;
}
.top-nav__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 0;
  display: flex;
  align-items: center;
}
.top-nav__brand {
  font-size: 1.25rem; font-weight: 700; color: #fff; text-decoration: none; display: flex; align-items: center; gap: 0.35rem;
}
.nav-brand-img { width: 24px; height: 24px; border-radius: 4px; object-fit: cover; }
.top-nav__brand strong { color: #ecfdf5; }

.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 3rem 2rem;
  text-align: center;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.check-icon {
  width: 64px; height: 64px;
  background: #dcfce7; color: #16a34a;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 1.75rem; font-weight: bold; margin: 0 auto 1.25rem;
}
.title { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0 0 0.5rem; }
.subtitle { font-size: 0.9rem; color: #64748b; margin: 0 0 1.5rem; }

.details-box {
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.5rem;
  padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem;
}
.detail-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: #64748b; }
.detail-row strong { color: #0f172a; font-family: monospace; }
.text-green { color: #16a34a !important; font-weight: 700; }
.badge-success { background: #dcfce7; color: #15803d; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.75rem; }

.actions { display: flex; flex-direction: column; gap: 0.75rem; }
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; text-decoration: none; border: none; cursor: pointer;
}
.btn-primary { background: #10b981; color: #ffffff; }
.btn-primary:hover { background: #059669; }
.btn-secondary { background: #e2e8f0; color: #334155; }
.btn-secondary:hover { background: #cbd5e1; }

.spinner {
  width: 40px; height: 40px;
  border: 3px solid rgba(16, 185, 129, 0.2); border-top-color: #10b981;
  border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
