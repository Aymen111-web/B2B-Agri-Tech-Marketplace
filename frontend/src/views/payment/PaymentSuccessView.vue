<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const verification = ref(null)
const errorMsg = ref('')

const txRef = computed(() => route.query.tx_ref || route.query.trx_ref)
const refId = computed(() => route.query.ref_id || verification.value?.chapa_data?.reference || verification.value?.chapa_data?.ref_id)
const receiptUrl = computed(() => {
  if (refId.value) {
    return `https://chapa.link/payment-receipt/${refId.value}`
  }
  return verification.value?.receipt_url || null
})

onMounted(async () => {
  if (!txRef.value) {
    loading.value = false
    return
  }

  try {
    const res = await api.get(`/payments/verify/${txRef.value}`)
    verification.value = res.data
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Payment verification could not be completed automatically.'
  } finally {
    loading.value = false
  }
})

function formatPrice(val) {
  if (!val) return '0.00'
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<template>
  <div class="payment-success-page">
    <nav class="top-nav">
      <div class="top-nav__inner">
        <router-link to="/" class="top-nav__brand">
          <img src="/images/agri_placeholder.svg" class="nav-brand-img" alt="AgriMarket" />
          Agri<strong>Market</strong>
        </router-link>
      </div>
    </nav>

    <main class="success-main">
      <div class="success-card">
        <!-- Loading State -->
        <div v-if="loading" class="state-box">
          <div class="spinner"></div>
          <h2>Verifying Payment Status...</h2>
          <p>Please wait while we confirm your transaction with Chapa payment gateway.</p>
        </div>

        <!-- Success State -->
        <div v-else-if="verification && verification.status === 'success'" class="state-box">
          <div class="icon-circle icon-circle--success">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>

          <h1 class="success-title">Payment Confirmed!</h1>
          <p class="success-sub font-medium">Your transaction was processed successfully in Chapa test mode.</p>

          <div class="info-card">
            <div class="info-row">
              <span>Transaction Ref:</span>
              <strong class="font-mono">{{ txRef }}</strong>
            </div>
            <div class="info-row" v-if="verification.payment?.amount">
              <span>Amount Paid:</span>
              <strong class="text-success">ETB {{ formatPrice(verification.payment.amount) }}</strong>
            </div>
            <div class="info-row" v-if="refId">
              <span>Chapa Ref ID:</span>
              <span class="badge badge--chapa">{{ refId }}</span>
            </div>
            <div class="info-row">
              <span>Status:</span>
              <span class="badge badge--success">VERIFIED & CONFIRMED</span>
            </div>
          </div>

          <div class="actions-flex mt-6">
            <a
              v-if="receiptUrl"
              :href="receiptUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn--chapa btn--lg"
            >
              📄 View Official Chapa Digital Receipt ↗
            </a>

            <router-link
              v-if="verification.payment?.order_id"
              :to="`/orders/${verification.payment.order_id}`"
              class="btn btn--primary btn--lg"
            >
              View Order Details →
            </router-link>

            <router-link to="/orders" class="btn btn--outline btn--lg">
              My Orders
            </router-link>
          </div>
        </div>

        <!-- Unverified / Pending / Failed State -->
        <div v-else class="state-box">
          <div class="icon-circle icon-circle--warning">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>

          <h1 class="warning-title">Payment Verification Pending</h1>
          <p class="warning-sub">{{ errorMsg || 'Your payment status is being processed by the system.' }}</p>

          <div class="info-card mt-4" v-if="txRef">
            <div class="info-row">
              <span>Transaction Ref:</span>
              <strong class="font-mono">{{ txRef }}</strong>
            </div>
          </div>

          <div class="actions-flex mt-6">
            <router-link to="/orders" class="btn btn--primary btn--lg">
              Return to My Orders
            </router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.payment-success-page {
  min-height: 100vh;
  background: #f8fafc;
  color: #0f172a;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

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
.top-nav__brand strong { color: #ecfdf5; }

.success-main {
  max-width: 720px;
  margin: 4rem auto;
  padding: 0 1.5rem;
}

.success-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  padding: 3.5rem 2.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  text-align: center;
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}
.icon-circle--success {
  background: #dcfce7;
  color: #16a34a;
}
.icon-circle--warning {
  background: #fef3c7;
  color: #d97706;
}

.success-title {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.5rem;
}
.success-sub {
  color: #475569;
  font-size: 1.05rem;
  margin-bottom: 2rem;
}

.warning-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.5rem;
}
.warning-sub {
  color: #64748b;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.info-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.85rem;
  padding: 1.25rem 1.5rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
}

.badge {
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
}
.badge--success { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.badge--chapa { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; font-family: monospace; }

.actions-flex {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
}
@media (min-width: 600px) {
  .actions-flex {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.5rem;
  border-radius: 0.6rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
}
.btn--primary {
  background: #10b981;
  color: #ffffff;
}
.btn--primary:hover {
  background: #059669;
}
.btn--chapa {
  background: #0284c7;
  color: #ffffff;
}
.btn--chapa:hover {
  background: #0369a1;
}
.btn--outline {
  background: transparent;
  border: 1px solid #cbd5e1;
  color: #334155;
}
.btn--outline:hover {
  background: #f1f5f9;
}
.btn--lg {
  font-size: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(16, 185, 129, 0.2);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1.5rem;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.font-mono { font-family: monospace; }
.text-success { color: #16a34a; }
.mt-4 { margin-top: 1rem; }
.mt-6 { margin-top: 1.5rem; }
</style>
