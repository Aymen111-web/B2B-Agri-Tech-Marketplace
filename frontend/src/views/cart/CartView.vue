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
  if (confirm('Are you sure you want to remove this item from your cart?')) {
    updatingId.value = cartItemId
    await cartStore.removeFromCart(cartItemId)
    updatingId.value = null
  }
}

async function handleClearCart() {
  if (confirm('Are you sure you want to clear your entire cart?')) {
    await cartStore.clearCart()
  }
}

function proceedToCheckout() {
  // Navigate to checkout (Step 5 order creation)
  router.push('/checkout')
}

function getCategoryIcon(unit) {
  const u = (unit || '').toLowerCase()
  if (u === 'litre' || u === 'liter') return '🥛'
  if (u === 'quintal' || u === 'kg' || u === 'ton') return '🌾'
  if (u === 'crate') return '📦'
  return '🥬'
}
</script>

<template>
  <div class="cart-page">
    <!-- Navbar -->
    <nav class="top-nav">
      <div class="top-nav__inner">
        <router-link to="/" class="top-nav__brand">
          🌿 Agri<strong>Market</strong>
        </router-link>

        <div class="top-nav__right">
          <router-link to="/listings" class="top-nav__link">
            Browse Produce
          </router-link>
          <router-link v-if="authStore.isAuthenticated" to="/dashboard" class="top-nav__link">
            Dashboard
          </router-link>
          <router-link v-else to="/login" class="top-nav__btn">
            Sign In
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Page Header -->
    <header class="cart-header">
      <div class="cart-header__inner">
        <div class="cart-header__badge">🛒 Business Buyer Cart</div>
        <h1 class="cart-header__title">Review Your Produce Order</h1>
        <p class="cart-header__sub">
          Items are organized by farmer. Check stock quantities and proceed safely to order checkout.
        </p>
      </div>
    </header>

    <!-- Main Cart Content -->
    <main class="cart-main">
      <div class="cart-container">
        <!-- Error Alert -->
        <div v-if="cartStore.error" class="alert alert--error mb-6">
          <span>⚠️</span> {{ cartStore.error }}
        </div>

        <!-- Loading State -->
        <div v-if="cartStore.loading && cartStore.items.length === 0" class="state-card">
          <div class="spinner"></div>
          <p>Loading your cart items...</p>
        </div>

        <!-- Empty Cart State -->
        <div v-else-if="cartStore.items.length === 0" class="state-card empty-card">
          <div class="empty-icon">🛒</div>
          <h2>Your Cart is Currently Empty</h2>
          <p>You haven't added any produce items to your business cart yet.</p>
          <router-link to="/listings" class="btn btn--primary btn--lg mt-4">
            Explore Marketplace Produce
          </router-link>
        </div>

        <!-- Cart Grid (Items + Summary) -->
        <div v-else class="cart-grid">
          <!-- Left Column: Items grouped by Farmer -->
          <div class="cart-items-section">
            <div class="cart-section-header">
              <h2>Order Items ({{ cartStore.itemCount }} total items)</h2>
              <button @click="handleClearCart" class="btn-text btn-text--danger">
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
                    <span class="farmer-badge">Direct Source</span>
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
                        ETB {{ Number(item.price_snapshot || item.listing?.price_per_unit || 0).toFixed(2) }}
                      </span>
                      <span class="unit-tag">/ {{ item.listing?.unit || 'unit' }}</span>
                      <span v-if="item.listing?.quantity_available !== undefined" class="stock-tag">
                        ({{ item.listing.quantity_available }} {{ item.listing.unit }} available)
                      </span>
                    </div>
                  </div>

                  <div class="item-quantity">
                    <label :for="'qty-' + item.id" class="qty-label">Quantity</label>
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
                        :id="'qty-' + item.id"
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
                    <div class="subtotal-label">Subtotal</div>
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

          <!-- Right Column: Order Summary Sidebar -->
          <div class="cart-summary-section">
            <div class="summary-card">
              <h3 class="summary-title">Order Summary</h3>

              <div class="summary-rows">
                <div class="summary-row">
                  <span>Total Items</span>
                  <span>{{ cartStore.itemCount }}</span>
                </div>
                <div class="summary-row">
                  <span>Farmers Involved</span>
                  <span>{{ cartStore.itemsByFarmer.length }}</span>
                </div>
                <div class="summary-row summary-row--highlight">
                  <span>Subtotal</span>
                  <span>ETB {{ cartStore.cartTotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
                </div>
                <div class="summary-row">
                  <span>Platform Fee</span>
                  <span class="text-free">FREE (Direct Handoff)</span>
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
                ℹ️ <strong>Multi-Farmer Fulfillment:</strong> Upon order checkout, separate fulfillment requests will automatically be routed to each farmer for approval.
              </div>

              <button
                @click="proceedToCheckout"
                class="btn btn--primary btn--block btn--lg mt-6"
                id="cart-checkout-btn"
              >
                Proceed to Checkout →
              </button>

              <router-link to="/listings" class="btn btn--outline btn--block mt-3">
                Continue Shopping
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
  background-color: #f8fafc;
  color: #0f172a;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Top Nav */
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
}
.top-nav__brand strong {
  color: #ecfdf5;
}
.top-nav__right {
  display: flex;
  gap: 1.25rem;
  align-items: center;
}
.top-nav__link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}
.top-nav__link:hover, .top-nav__link.active {
  color: #fff;
}
.top-nav__btn {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
}

/* Cart Header */
.cart-header {
  background: #ffffff;
  padding: 2.5rem 1.5rem 2rem;
  text-align: center;
  border-bottom: 1px solid #e2e8f0;
}
.cart-header__inner {
  max-width: 800px;
  margin: 0 auto;
}
.cart-header__badge {
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
.cart-header__title {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}
.cart-header__sub {
  color: #64748b;
  font-size: 1rem;
  line-height: 1.5;
}

/* Main Layout */
.cart-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
}
.state-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.empty-card .empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}
.empty-card h2 {
  font-size: 1.5rem;
  color: #0f172a;
  margin-bottom: 0.5rem;
}
.empty-card p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.cart-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 960px) {
  .cart-grid {
    grid-template-columns: 1fr;
  }
}

/* Farmer Group Card */
.cart-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}
.cart-section-header h2 {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
}
.btn-text--danger {
  background: none;
  border: none;
  color: #dc2626;
  font-weight: 600;
  cursor: pointer;
}
.btn-text--danger:hover {
  text-decoration: underline;
}

.farmer-group-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.farmer-group-header {
  background: #f8fafc;
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}
.farmer-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.farmer-avatar {
  font-size: 1.5rem;
}
.farmer-name {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}
.farmer-badge {
  font-size: 0.75rem;
  color: #15803d;
  background: #dcfce7;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}
.farmer-subtotal {
  font-size: 0.9rem;
  color: #475569;
}

/* Cart Item Row */
.cart-item-row {
  display: grid;
  grid-template-columns: 50px 1fr 140px 140px 40px;
  gap: 1rem;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
}
.cart-item-row:last-child {
  border-bottom: none;
}
.item-visual {
  width: 50px;
  height: 50px;
  background: #f0fdf4;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}
.item-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.25rem;
}
.item-meta {
  font-size: 0.85rem;
  color: #64748b;
}
.price-tag {
  color: #16a34a;
  font-weight: 700;
}
.stock-tag {
  color: #94a3b8;
  margin-left: 0.5rem;
}

.qty-control {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  overflow: hidden;
  margin-top: 0.25rem;
}
.qty-btn {
  background: #f1f5f9;
  border: none;
  color: #0f172a;
  width: 32px;
  height: 32px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
}
.qty-btn:hover:not(:disabled) {
  background: #e2e8f0;
}
.qty-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.qty-input {
  width: 50px;
  background: transparent;
  border: none;
  color: #0f172a;
  text-align: center;
  font-weight: 700;
  font-size: 0.95rem;
}

.subtotal-amount {
  font-weight: 700;
  color: #15803d;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.remove-btn:hover {
  opacity: 1;
}

/* Sidebar Summary */
.summary-card {
  background: #ffffff;
  border: 1px solid #bbf7d0;
  border-radius: 1rem;
  padding: 1.75rem;
  position: sticky;
  top: 90px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08);
}
.summary-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}
.summary-rows {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  color: #64748b;
  font-size: 0.95rem;
}
.summary-row--highlight {
  color: #0f172a;
  font-weight: 600;
}
.text-free {
  color: #16a34a;
  font-weight: 700;
}
.summary-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 1.25rem 0;
}
.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}
.total-amount {
  color: #15803d;
  font-size: 1.5rem;
}
.fulfillment-note {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.5rem;
  padding: 0.85rem;
  font-size: 0.82rem;
  color: #166534;
  margin-top: 1.25rem;
  line-height: 1.5;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}
.btn--primary {
  background: #10b981;
  color: #ffffff;
  border: none;
}
.btn--primary:hover {
  background: #059669;
  transform: translateY(-1px);
}
.btn--outline {
  background: transparent;
  border: 1px solid #cbd5e1;
  color: #0f172a;
}
.btn--outline:hover {
  background: #f8fafc;
}
.btn--block {
  width: 100%;
}
.btn--lg {
  padding: 0.9rem 1.75rem;
  font-size: 1.05rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(16, 185, 129, 0.2);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
