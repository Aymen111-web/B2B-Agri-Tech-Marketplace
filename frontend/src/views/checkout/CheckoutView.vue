<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()
const authStore = useAuthStore()

const isSubmitting = ref(false)
const checkoutError = ref('')

onMounted(async () => {
  await cartStore.fetchCart()
  if (cartStore.items.length === 0) {
    router.push('/cart')
  }
})

async function handlePlaceOrder() {
  if (cartStore.items.length === 0) {
    checkoutError.value = 'Your cart is empty.'
    return
  }

  isSubmitting.value = true
  checkoutError.value = ''

  const result = await orderStore.checkout()
  isSubmitting.value = false

  if (result.success && result.order) {
    // Successfully placed order, navigate to Order Details / Confirmation page
    router.push(`/orders/${result.order.id}`)
  } else {
    checkoutError.value = result.message || 'Failed to place order. Please try again.'
  }
}
</script>

<template>
  <div class="checkout-page">
    <!-- Navbar -->
    <nav class="top-nav">
      <div class="top-nav__inner">
        <router-link to="/" class="top-nav__brand">
          🌿 Agri<strong>Market</strong>
        </router-link>

        <div class="top-nav__right">
          <router-link to="/cart" class="top-nav__link">
            ← Back to Cart
          </router-link>
          <router-link v-if="authStore.isAuthenticated" to="/dashboard" class="top-nav__link">
            Dashboard
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Header -->
    <header class="checkout-header">
      <div class="checkout-header__inner">
        <div class="header-badge">🔒 Concurrency-Safe Checkout</div>
        <h1 class="header-title">Confirm Produce Order</h1>
        <p class="header-sub">
          Review your multi-farmer produce items. Reserving stock will lock quantities atomically in the database.
        </p>
      </div>
    </header>

    <!-- Content -->
    <main class="checkout-main">
      <div class="checkout-container">
        <!-- Error Alert -->
        <div v-if="checkoutError" class="alert alert--error mb-6">
          <span>⚠️</span> {{ checkoutError }}
        </div>

        <div class="checkout-grid">
          <!-- Left Column: Items grouped by farmer -->
          <div class="order-items-col">
            <h2 class="col-title">Order Items Breakdown</h2>

            <div
              v-for="group in cartStore.itemsByFarmer"
              :key="group.farmerId"
              class="farmer-card"
            >
              <div class="farmer-card__header">
                <span class="farmer-icon">👨‍🌾</span>
                <div>
                  <h3 class="farmer-name">Farmer: {{ group.farmerName }}</h3>
                  <span class="fulfillment-badge">Fulfillment Group #{{ group.farmerId }}</span>
                </div>
              </div>

              <div class="farmer-card__items">
                <div v-for="item in group.items" :key="item.id" class="checkout-item-row">
                  <div class="item-title-wrap">
                    <span class="item-title">{{ item.listing?.title || 'Produce Listing' }}</span>
                    <span class="item-unit">({{ item.listing?.unit }})</span>
                  </div>
                  <div class="item-qty">
                    {{ item.quantity }} {{ item.listing?.unit }}s × ETB {{ Number(item.price_snapshot || item.listing?.price_per_unit || 0).toFixed(2) }}
                  </div>
                  <div class="item-subtotal">
                    ETB {{ (Number(item.price_snapshot || item.listing?.price_per_unit || 0) * Number(item.quantity)).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                  </div>
                </div>
              </div>

              <div class="farmer-card__footer">
                <span>Farmer Fulfillment Subtotal:</span>
                <strong>ETB {{ group.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</strong>
              </div>
            </div>
          </div>

          <!-- Right Column: Checkout Summary & Action -->
          <div class="order-summary-col">
            <div class="summary-card">
              <h3 class="summary-title">Payment & Reservation Summary</h3>

              <div class="summary-rows">
                <div class="summary-row">
                  <span>Total Items:</span>
                  <span>{{ cartStore.itemCount }} items</span>
                </div>
                <div class="summary-row">
                  <span>Fulfillment Partners:</span>
                  <span>{{ cartStore.itemsByFarmer.length }} Farmer(s)</span>
                </div>
                <div class="summary-row">
                  <span>Currency:</span>
                  <span>ETB (Ethiopian Birr)</span>
                </div>
              </div>

              <div class="divider"></div>

              <div class="total-row">
                <span>Total Order Amount</span>
                <span class="total-price">
                  ETB {{ cartStore.cartTotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </span>
              </div>

              <div class="stock-lock-box">
                <div class="box-icon">⚡</div>
                <div class="box-text">
                  <strong>Atomic Stock Locking:</strong> Upon confirmation, available stock will be deducted and placed in <em>reserved state</em> atomically across all involved listings.
                </div>
              </div>

              <button
                @click="handlePlaceOrder"
                :disabled="isSubmitting || cartStore.items.length === 0"
                class="btn btn--primary btn--block btn--lg mt-6"
                id="confirm-checkout-btn"
              >
                <span v-if="isSubmitting" class="inline-spinner"></span>
                <span v-else>Confirm Order & Reserve Stock →</span>
              </button>

              <p class="terms-note">
                By placing this order, you agree to the platform's facilitated marketplace direct handoff terms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: #0d131a;
  color: #f1f5f9;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Nav */
.top-nav {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}
.top-nav__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.top-nav__brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
}
.top-nav__brand strong { color: #10b981; }
.top-nav__right { display: flex; gap: 1.25rem; align-items: center; }
.top-nav__link { color: #94a3b8; text-decoration: none; font-weight: 500; }
.top-nav__link:hover { color: #10b981; }

/* Header */
.checkout-header {
  background: linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, transparent 100%);
  padding: 3rem 1.5rem 2rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.checkout-header__inner { max-width: 800px; margin: 0 auto; }
.header-badge {
  display: inline-block;
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  margin-bottom: 0.75rem;
  border: 1px solid rgba(52, 211, 153, 0.3);
}
.header-title { font-size: 2.25rem; font-weight: 800; margin-bottom: 0.5rem; }
.header-sub { color: #94a3b8; font-size: 1rem; }

/* Main */
.checkout-main { max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.5rem 4rem; }
.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
}
@media (max-width: 960px) { .checkout-grid { grid-template-columns: 1fr; } }

.col-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 1.25rem; }

.farmer-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  overflow: hidden;
}
.farmer-card__header {
  background: rgba(15, 23, 42, 0.6);
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.farmer-icon { font-size: 1.5rem; }
.farmer-name { font-size: 1rem; font-weight: 700; margin: 0; }
.fulfillment-badge { font-size: 0.75rem; color: #94a3b8; }

.farmer-card__items { padding: 1rem 1.25rem; }
.checkout-item-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.06);
}
.checkout-item-row:last-child { border-bottom: none; }
.item-title { font-weight: 600; }
.item-unit { color: #94a3b8; font-size: 0.85rem; margin-left: 0.25rem; }
.item-qty { color: #94a3b8; font-size: 0.9rem; }
.item-subtotal { font-weight: 700; color: #34d399; }

.farmer-card__footer {
  background: rgba(15, 23, 42, 0.4);
  padding: 0.85rem 1.25rem;
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

/* Summary Card */
.summary-card {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 1rem;
  padding: 1.75rem;
  position: sticky;
  top: 90px;
}
.summary-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 1.25rem; }
.summary-rows { display: flex; flex-direction: column; gap: 0.75rem; }
.summary-row { display: flex; justify-content: space-between; color: #94a3b8; font-size: 0.95rem; }
.divider { height: 1px; background: rgba(255, 255, 255, 0.08); margin: 1.25rem 0; }

.total-row { display: flex; justify-content: space-between; align-items: center; font-size: 1.1rem; font-weight: 700; }
.total-price { color: #34d399; font-size: 1.5rem; }

.stock-lock-box {
  display: flex;
  gap: 0.75rem;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 0.5rem;
  padding: 0.85rem;
  margin-top: 1.25rem;
  font-size: 0.82rem;
  color: #cbd5e1;
  line-height: 1.4;
}
.box-icon { font-size: 1.2rem; color: #34d399; }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: none;
}
.btn--primary { background: #10b981; color: #064e3b; }
.btn--primary:hover { background: #34d399; }
.btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--block { width: 100%; }
.btn--lg { padding: 0.9rem 1.75rem; font-size: 1.05rem; }

.terms-note { font-size: 0.75rem; color: #64748b; margin-top: 1rem; text-align: center; line-height: 1.4; }

.alert--error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 0.85rem 1.25rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.inline-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(6, 78, 59, 0.3);
  border-top-color: #064e3b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
