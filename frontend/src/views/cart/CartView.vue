<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const updatingId = ref(null)

onMounted(async () => {
  await cartStore.fetchCart()
})

async function handleQuantityChange(item, newQty) {
  const qty = Number(newQty)
  if (qty <= 0) {
    await handleRemove(item.id)
    return
  }
  updatingId.value = item.id
  await cartStore.updateQuantity(item.id, qty)
  updatingId.value = null
}

async function handleRemove(cartItemId) {
  if (confirm('Remove item from cart?')) {
    updatingId.value = cartItemId
    await cartStore.removeFromCart(cartItemId)
    updatingId.value = null
  }
}

async function handleClearCart() {
  if (confirm('Clear entire cart?')) {
    await cartStore.clearCart()
  }
}

function proceedToCheckout() {
  router.push('/checkout')
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

function getCategoryIcon(unit) {
  const u = (unit || '').toLowerCase()
  if (u === 'litre' || u === 'liter') return '🥛'
  if (u === 'quintal' || u === 'kg' || u === 'ton') return '🌾'
  if (u === 'crate') return '📦'
  return '🥦'
}
</script>

<template>
  <div class="cart-page">
    
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
          <router-link to="/cart" class="top-nav__link active">
            🛒 Cart <span v-if="cartStore.itemCount > 0" class="cart-badge">{{ cartStore.itemCount }}</span>
          </router-link>
          <router-link v-if="authStore.isAuthenticated" to="/orders" class="top-nav__link">
            My Orders
          </router-link>
          <router-link v-if="authStore.isAuthenticated" to="/dashboard" class="top-nav__link">
            Dashboard
          </router-link>
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
    <header class="cart-header">
      <div class="cart-header__inner">
        <div class="hero-header-flex">
          <div>
            <h1 class="hero-title">Shopping Cart</h1>
            <p class="hero-sub">Review produce items grouped by farmer and proceed to checkout</p>
          </div>
          <div class="trust-chips">
            <span class="chip">🌾 Direct Farmer Source</span>
            <span class="chip">📦 Grouped by Supplier</span>
            <span class="chip">⚡ Secure Checkout</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="cart-main">
      <div class="cart-container">
        
        <!-- Alert Banner -->
        <div v-if="cartStore.error" class="alert alert-error">
          ⚠️ {{ cartStore.error }}
        </div>

        <!-- Loading State -->
        <div v-if="cartStore.loading && cartStore.items.length === 0" class="state-card">
          <div class="spinner"></div>
          <p class="state-title">Loading cart items...</p>
        </div>

        <!-- Empty Cart State -->
        <div v-else-if="cartStore.items.length === 0" class="state-card empty-card">
          <div class="empty-icon">🛒</div>
          <h3 class="state-title">Your cart is empty</h3>
          <p class="state-sub">Browse verified Ethiopian farmer produce and add items to your cart.</p>
          <router-link to="/listings" class="btn btn-primary btn-lg mt-3">
            Explore Produce Marketplace →
          </router-link>
        </div>

        <!-- Cart Grid Layout -->
        <div v-else class="cart-grid">
          
          <!-- Left Column: Items grouped by Farmer -->
          <div class="cart-items-section">
            <div class="cart-section-header">
              <h2>Order Items ({{ cartStore.itemCount }} {{ cartStore.itemCount === 1 ? 'item' : 'items' }})</h2>
              <button @click="handleClearCart" class="btn-clear">
                Clear Cart
              </button>
            </div>

            <!-- Grouped by Farmer -->
            <div
              v-for="group in cartStore.itemsByFarmer"
              :key="group.farmerId"
              class="farmer-group-card"
            >
              <div class="farmer-group-header">
                <div class="farmer-info">
                  <span class="farmer-avatar">👨‍🌾</span>
                  <div>
                    <h3 class="farmer-name">Farmer: {{ group.farmerName }}</h3>
                    <span class="farmer-badge">Direct Supplier</span>
                  </div>
                </div>
                <div class="farmer-subtotal">
                  Group Subtotal: <strong>ETB {{ group.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</strong>
                </div>
              </div>

              <div class="items-list">
                <div v-for="item in group.items" :key="item.id" class="cart-item-row">
                  <div class="item-visual">
                    <span class="item-icon">{{ getCategoryIcon(item.listing?.unit) }}</span>
                  </div>

                  <div class="item-details">
                    <h4 class="item-title">{{ item.listing?.title || 'Produce Listing' }}</h4>
                    <div class="item-meta">
                      <span class="price-tag">
                        {{ Number(item.price_snapshot || item.listing?.price_per_unit || 0).toFixed(2) }} ETB
                      </span>
                      <span class="unit-tag">/ {{ item.listing?.unit || 'unit' }}</span>
                      <span v-if="item.listing?.quantity_available !== undefined" class="stock-tag">
                        (Stock: {{ item.listing.quantity_available }} {{ item.listing.unit }}s)
                      </span>
                    </div>
                  </div>

                  <div class="item-quantity">
                    <div class="qty-control">
                      <button
                        type="button"
                        class="qty-btn"
                        :disabled="updatingId === item.id || Number(item.quantity) <= 1"
                        @click="handleQuantityChange(item, Number(item.quantity) - 1)"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        :value="item.quantity"
                        @change="handleQuantityChange(item, $event.target.value)"
                        class="qty-input"
                      />
                      <button
                        type="button"
                        class="qty-btn"
                        :disabled="updatingId === item.id || (item.listing && Number(item.quantity) >= Number(item.listing.quantity_available))"
                        @click="handleQuantityChange(item, Number(item.quantity) + 1)"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div class="item-subtotal">
                    <div class="subtotal-amount">
                      ETB {{ (Number(item.price_snapshot || item.listing?.price_per_unit || 0) * Number(item.quantity)).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                    </div>
                  </div>

                  <button
                    @click="handleRemove(item.id)"
                    class="remove-btn"
                    title="Remove item"
                    :disabled="updatingId === item.id"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Summary Card -->
          <div class="cart-summary-section">
            <div class="summary-card">
              <h3 class="summary-title">Order Summary</h3>

              <div class="summary-rows">
                <div class="summary-row">
                  <span>Total Items</span>
                  <span>{{ cartStore.itemCount }}</span>
                </div>
                <div class="summary-row">
                  <span>Suppliers Involved</span>
                  <span>{{ cartStore.itemsByFarmer.length }} {{ cartStore.itemsByFarmer.length === 1 ? 'farmer' : 'farmers' }}</span>
                </div>
                <div class="summary-row summary-row--highlight">
                  <span>Subtotal</span>
                  <span>ETB {{ cartStore.cartTotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
                </div>
                <div class="summary-row">
                  <span>Platform Fee</span>
                  <span class="text-free">FREE</span>
                </div>
              </div>

              <div class="summary-divider"></div>

              <div class="summary-total">
                <span>Total Payable</span>
                <span class="total-amount">
                  ETB {{ cartStore.cartTotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </span>
              </div>

              <div class="fulfillment-note">
                ℹ️ <strong>Multi-Farmer Dispatch:</strong> Order checkout automatically creates separate fulfillment requests for each farmer.
              </div>

              <button
                @click="proceedToCheckout"
                class="btn btn-primary btn-block btn-lg mt-4"
                id="cart-checkout-btn"
              >
                Proceed to Checkout →
              </button>

              <router-link to="/listings" class="btn btn-outline btn-block mt-2">
                ← Continue Shopping
              </router-link>
            </div>
          </div>

        </div>

      </div>
    </main>
  </div>
</template>

<style scoped>
.cart-page {
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
.cart-header {
  background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%);
  color: #fff;
  padding: 1.5rem 1.5rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.cart-header__inner {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 0.75rem;
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

/* Main Container */
.cart-main {
  padding: 1.5rem 1.5rem 3.5rem;
}
.cart-container {
  max-width: 1200px;
  margin: 0 auto;
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
  padding: 3rem 1.5rem;
  text-align: center;
}
.empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
.state-title { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }
.state-sub { font-size: 0.825rem; color: var(--text-secondary); margin-top: 0.25rem; }

/* Cart Grid */
.cart-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.25rem;
  align-items: start;
}
@media (max-width: 900px) {
  .cart-grid { grid-template-columns: 1fr; }
}

.cart-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.cart-section-header h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
}
.btn-clear {
  background: none;
  border: none;
  color: var(--error);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-clear:hover { text-decoration: underline; }

/* Farmer Group Card */
.farmer-group-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  margin-bottom: 1.15rem;
  overflow: hidden;
  box-shadow: var(--shadow-xs);
}
.farmer-group-header {
  background: var(--surface-alt);
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
}
.farmer-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.farmer-avatar { font-size: 1.1rem; }
.farmer-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}
.farmer-badge {
  font-size: 0.7rem;
  color: var(--brand-green-dark);
  background: var(--brand-green-light);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-weight: 600;
}
.farmer-subtotal {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

/* Item Rows */
.cart-item-row {
  display: grid;
  grid-template-columns: 40px 1fr 110px 110px 32px;
  gap: 0.75rem;
  align-items: center;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border-subtle);
}
.cart-item-row:last-child { border-bottom: none; }

.item-visual {
  width: 40px;
  height: 40px;
  background: var(--surface-alt);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}
.item-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.15rem;
}
.item-meta {
  font-size: 0.78125rem;
  color: var(--text-secondary);
}
.price-tag { color: var(--brand-green-dark); font-weight: 700; }
.unit-tag  { color: var(--text-secondary); }
.stock-tag { color: var(--text-muted); font-size: 0.72rem; margin-left: 0.25rem; }

.qty-control {
  display: flex;
  align-items: center;
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  overflow: hidden;
}
.qty-btn {
  background: transparent;
  border: none;
  color: var(--text-primary);
  width: 26px;
  height: 26px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
}
.qty-btn:hover:not(:disabled) { background: var(--border-subtle); }
.qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.qty-input {
  width: 40px;
  background: transparent;
  border: none;
  color: var(--text-primary);
  text-align: center;
  font-weight: 700;
  font-size: 0.8125rem;
}

.subtotal-amount {
  font-weight: 700;
  color: var(--brand-green-dark);
  font-size: 0.85rem;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  opacity: 0.7;
}
.remove-btn:hover { opacity: 1; }

/* Summary Sidebar */
.summary-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  position: sticky;
  top: 80px;
  box-shadow: var(--shadow-xs);
}
.summary-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.85rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
}
.summary-rows {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  font-size: 0.825rem;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
}
.summary-row--highlight { color: var(--text-primary); font-weight: 600; }
.text-free { color: var(--brand-green-dark); font-weight: 700; }
.summary-divider {
  height: 1px;
  background: var(--border);
  margin: 0.85rem 0;
}
.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}
.total-amount {
  color: var(--brand-green-dark);
  font-size: 1.25rem;
  font-weight: 800;
}
.fulfillment-note {
  background: var(--brand-green-light);
  border: 1px solid var(--brand-green-border);
  border-radius: var(--radius-xs);
  padding: 0.65rem;
  font-size: 0.75rem;
  color: var(--brand-green-dark);
  margin-top: 0.85rem;
  line-height: 1.4;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-xs);
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  font-size: 0.8125rem;
  transition: all 0.15s ease;
}
.btn-primary {
  background: var(--brand-green);
  color: #ffffff;
  border: none;
}
.btn-primary:hover { background: var(--brand-green-dark); }
.btn-outline {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-primary);
}
.btn-outline:hover { background: var(--surface-alt); }
.btn-block { width: 100%; text-align: center; }
.btn-lg { padding: 0.65rem 1.25rem; font-size: 0.875rem; }

.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 0.75rem; }
.mt-4 { margin-top: 1rem; }

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--brand-green);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 0.75rem;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
