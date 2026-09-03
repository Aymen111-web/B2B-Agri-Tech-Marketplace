<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'
import { useAuthStore } from '@/stores/auth'
import { getAvatarImage } from '@/utils/imageHelper'

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
          <img src="/images/agri_placeholder.svg" class="nav-brand-img" alt="AgriMarket" />
          Agri<strong>Market</strong>
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
        <div class="header-badge">Concurrency-Safe Checkout</div>
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
          {{ checkoutError }}
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
                <img :src="getAvatarImage('farmer')" class="farmer-icon-img" alt="Farmer" />
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
                <svg class="box-svg" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
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
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.nav-brand-img { width: 24px; height: 24px; border-radius: 4px; object-fit: cover; }
.farmer-icon-img { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid #bbf7d0; }
.box-svg { color: #15803d; flex-shrink: 0; }
.top-nav__brand strong { color: #ecfdf5; }
.top-nav__right { display: flex; gap: 1.25rem; align-items: center; }
.top-nav__link { color: rgba(255, 255, 255, 0.9); text-decoration: none; font-weight: 500; }
.top-nav__link:hover { color: #fff; }

/* Header */
.checkout-header {
  background: #ffffff;
  padding: 2.5rem 1.5rem 2rem;
  text-align: center;
  border-bottom: 1px solid #e2e8f0;
}
.checkout-header__inner { max-width: 800px; margin: 0 auto; }
.header-badge {
  display: inline-block;
  background: #dcfce7;
  color: #15803d;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  margin-bottom: 0.75rem;
  border: 1px solid #bbf7d0;
}
.header-title { font-size: 2rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem; }
.header-sub { color: #64748b; font-size: 1rem; }

/* Main */
.checkout-main { max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.5rem 4rem; }
.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
}
@media (max-width: 960px) { .checkout-grid { grid-template-columns: 1fr; } }

.col-title { font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 1.25rem; }

.farmer-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.farmer-card__header {
  background: #f8fafc;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}
.farmer-icon { font-size: 1.5rem; }
.farmer-name { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0; }
.fulfillment-badge { font-size: 0.75rem; color: #64748b; }

.farmer-card__items { padding: 1rem 1.25rem; }
.checkout-item-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px dashed #e2e8f0;
}
.checkout-item-row:last-child { border-bottom: none; }
.item-title { font-weight: 600; color: #0f172a; }
.item-unit { color: #64748b; font-size: 0.85rem; margin-left: 0.25rem; }
.item-qty { color: #64748b; font-size: 0.9rem; }
.item-subtotal { font-weight: 700; color: #15803d; }

.farmer-card__footer {
  background: #f8fafc;
  padding: 0.85rem 1.25rem;
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #475569;
  border-top: 1px solid #e2e8f0;
}

/* Summary Card */
.summary-card {
  background: #ffffff;
  border: 1px solid #bbf7d0;
  border-radius: 1rem;
  padding: 1.75rem;
  position: sticky;
  top: 90px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08);
}
.summary-title { font-size: 1.2rem; font-weight: 700; color: #0f172a; margin-bottom: 1.25rem; }
.summary-rows { display: flex; flex-direction: column; gap: 0.75rem; }
.summary-row { display: flex; justify-content: space-between; color: #64748b; font-size: 0.95rem; }
.divider { height: 1px; background: #e2e8f0; margin: 1.25rem 0; }

.total-row { display: flex; justify-content: space-between; align-items: center; font-size: 1.1rem; font-weight: 700; color: #0f172a; }
.total-price { color: #15803d; font-size: 1.5rem; }

.stock-lock-box {
  display: flex;
  gap: 0.75rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.5rem;
  padding: 0.85rem;
  margin-top: 1.25rem;
  font-size: 0.82rem;
  color: #166534;
  line-height: 1.4;
}
.box-icon { font-size: 1.2rem; color: #15803d; }

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
.btn--primary { background: #10b981; color: #ffffff; }
.btn--primary:hover { background: #059669; }
.btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--block { width: 100%; }
.btn--lg { padding: 0.9rem 1.75rem; font-size: 1.05rem; }

.terms-note { font-size: 0.75rem; color: #94a3b8; margin-top: 1rem; text-align: center; line-height: 1.4; }

.alert--error {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 0.85rem 1.25rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.inline-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
