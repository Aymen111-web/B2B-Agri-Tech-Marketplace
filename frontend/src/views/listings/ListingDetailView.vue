<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useListingStore } from '@/stores/listing'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const listingStore = useListingStore()
const auth = useAuthStore()
const cartStore = useCartStore()
const route = useRoute()
const router = useRouter()

const listing = computed(() => listingStore.currentListing)
const orderQty = ref(1)
const isAddingCart = ref(false)
const cartMsg = ref({ type: '', text: '' })

onMounted(async () => {
  const id = route.params.id
  if (id) {
    await listingStore.fetchListingDetails(id)
  }
  if (auth.isAuthenticated) {
    await cartStore.fetchCart()
  }
})

async function handleAddToCart() {
  if (!auth.isAuthenticated) {
    router.push('/login')
    return
  }
  if (!listing.value) return

  isAddingCart.value = true
  cartMsg.value = { type: '', text: '' }

  const res = await cartStore.addToCart(listing.value.id, orderQty.value)
  isAddingCart.value = false

  if (res.success) {
    cartMsg.value = { type: 'success', text: `Added ${orderQty.value} ${listing.value.unit}(s) to your cart!` }
  } else {
    cartMsg.value = { type: 'error', text: res.message }
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
import { getCropImage, getAvatarImage } from '@/utils/imageHelper'
</script>

<template>
  <div class="detail-page">
    <!-- Navbar -->
    <nav class="top-nav">
      <div class="top-nav__inner">
        <button class="back-btn" @click="router.push('/listings')">
          ← Back to Produce Marketplace
        </button>
        <div class="top-nav__right">
        </div>
      </div>
    </nav>

    <main class="detail-main">
      <div class="detail-container">

        <div v-if="listingStore.loading" class="loading-state">
          Loading produce details...
        </div>

        <div v-else-if="!listing" class="error-state">
          <h3>Produce listing not found.</h3>
          <button class="back-btn-alt" @click="router.push('/listings')">
            Return to Marketplace
          </button>
        </div>

        <div v-else class="detail-content">

          <!-- Main Produce Card -->
          <div class="main-card">
            <!-- Produce Crop Banner -->
            <div class="detail-hero-banner">
              <img :src="getCropImage(listing)" class="detail-hero-img" :alt="listing.title" />
            </div>

            <div class="card-header-flex">
              <div>
                <span class="category-badge">
                  <img :src="getCropImage(listing.category?.name)" class="cat-badge-thumb" />
                  <span>{{ listing.category?.name || 'Produce' }}</span>
                </span>
                <h1 class="produce-title">{{ listing.title }}</h1>
                <p class="produce-sub">Published by verified Ethiopian agricultural producer</p>
              </div>

              <div class="price-box">
                <span class="price-num">{{ formatPrice(listing.price_per_unit) }} ETB</span>
                <span class="price-unit">per {{ listing.unit }}</span>
              </div>
            </div>

            <hr class="divider" />

            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Available Stock</span>
                <span class="info-val">
                  <strong>{{ listing.quantity_available }}</strong> {{ listing.unit }}s
                </span>
              </div>

              <div class="info-item">
                <span class="info-label">Reserved Stock</span>
                <span class="info-val">
                  {{ listing.quantity_reserved || 0 }} {{ listing.unit }}s
                </span>
              </div>

              <div class="info-item">
                <span class="info-label">Status</span>
                <span class="status-pill" :class="listing.quantity_available > 0 ? 'status--active' : 'status--sold'">
                  {{ listing.quantity_available > 0 ? 'ACTIVE IN STOCK' : 'SOLD OUT' }}
                </span>
              </div>

              <div class="info-item">
                <span class="info-label">Listing Date</span>
                <span class="info-val">{{ formatDate(listing.created_at) }}</span>
              </div>
            </div>

            <div class="desc-box">
              <h3 class="desc-title">Crop & Harvest Description</h3>
              <p class="desc-text">
                {{ listing.description || 'No detailed description provided by farmer. Quality guaranteed by platform verified status.' }}
              </p>
            </div>
          </div>

          <!-- Farmer Profile Card -->
          <div class="farmer-card">
            <h3 class="side-title">Producer Information</h3>

            <div class="farmer-profile">
              <img :src="getAvatarImage('farmer')" class="avatar-photo" alt="Farmer Avatar" />
              <div>
                <h4 class="farmer-fullname">
                  {{ listing.farmer?.first_name }} {{ listing.farmer?.second_name }}
                </h4>
                <span class="verified-tag">✓ Platform Verified Farmer</span>
              </div>
            </div>

            <div class="farmer-meta">
              <div class="meta-row">
                <span class="meta-key">Account Status:</span>
                <span class="meta-val text-success">Active</span>
              </div>
              <div class="meta-row">
                <span class="meta-key">Marketplace ID:</span>
                <span class="meta-val">#FARM-{{ listing.farmer?.id }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-key">Phone Contact:</span>
                <span class="meta-val phone-highlight">📞 {{ listing.farmer?.phone || 'Not provided' }}</span>
              </div>
              <div class="meta-row" v-if="listing.farmer?.account_number || listing.farmer?.account_number_masked">
                <span class="meta-key">Payment Account:</span>
                <span class="meta-val acc-highlight">
                  💳 {{ listing.farmer?.bank_name || 'Telebirr/Bank' }}: 
                  <strong>{{ listing.farmer?.account_number || listing.farmer?.account_number_masked }}</strong>
                </span>
              </div>
            </div>

            <div class="order-prompt">
              <!-- Toast Notification Alert -->
              <div v-if="cartMsg.text" :class="['detail-toast', cartMsg.type === 'error' ? 'detail-toast--error' : 'detail-toast--success']">
                <span>{{ cartMsg.type === 'error' ? '⚠️' : '✅' }}</span>
                <span>{{ cartMsg.text }}</span>
              </div>

              <p class="prompt-text">
                Direct trade order from verified <strong>Business Buyer</strong> account.
              </p>
              <button
                v-if="!auth.isAuthenticated"
                class="btn-primary"
                @click="router.push('/login')"
              >
                Sign In to Order
              </button>
              <button
                v-else-if="!auth.user?.capabilities?.some(c => c.capability_type === 'buyer' && c.status === 'active')"
                class="btn-secondary"
                @click="router.push('/capabilities/apply')"
              >
                Apply for Buyer Capability
              </button>
              <div v-else class="add-cart-action-group">
                <div class="qty-field">
                  <label for="detail-qty">Quantity ({{ listing.unit }}):</label>
                  <input
                    id="detail-qty"
                    type="number"
                    step="0.1"
                    min="0.1"
                    :max="listing.quantity_available"
                    v-model="orderQty"
                    class="qty-input-box"
                  />
                </div>
                <button
                  class="btn-primary"
                  :disabled="isAddingCart || listing.quantity_available <= 0"
                  @click="handleAddToCart"
                >
                  {{ isAddingCart ? 'Adding...' : 'Add to Cart' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Price History Section -->
          <div class="history-section">
            <h2 class="section-title">Price History & Rate Transparency</h2>
            <p class="section-sub">
              Historical record of prices set by the farmer for {{ listing.title }}.
            </p>

            <div v-if="!listing.priceHistory || listing.priceHistory.length === 0" class="no-history">
              Initial listing price: <strong>{{ formatPrice(listing.price_per_unit) }} ETB / {{ listing.unit }}</strong>
            </div>

            <div v-else class="history-table-wrap">
              <table class="history-table">
                <thead>
                  <tr>
                    <th>Effective Date</th>
                    <th>Price / Unit (ETB)</th>
                    <th>Unit</th>
                    <th>Recorded Change</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(ph, idx) in listing.priceHistory" :key="ph.id || idx">
                    <td>{{ formatDate(ph.effective_at || ph.created_at) }}</td>
                    <td class="price-cell">{{ formatPrice(ph.price_per_unit) }} ETB</td>
                    <td>/ {{ listing.unit }}</td>
                    <td>
                      <span v-if="idx === listing.priceHistory.length - 1" class="tag-initial">
                        Initial Listed Rate
                      </span>
                      <span v-else class="tag-update">
                        Price Update
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </main>
  </div>
</template>

<style scoped>
.detail-page { min-height: 100vh; background: var(--surface-alt); padding-bottom: 4rem; }

.top-nav { background: var(--brand-green); padding: 0 1.5rem; }
.top-nav__inner {
  max-width: 1100px; margin: 0 auto; height: 64px;
  display: flex; align-items: center; justify-content: space-between;
}
.back-btn {
  background: rgba(255,255,255,0.15); color: #fff;
  border: 1px solid rgba(255,255,255,0.3); padding: 0.4rem 0.9rem;
  border-radius: 6px; font-size: 0.85rem; font-weight: 500; cursor: pointer;
}
.top-nav__link { color: #fff; text-decoration: none; font-size: 0.9rem; font-weight: 500; }

.detail-main { padding: 2.5rem 1.5rem 0; }
.detail-container { max-width: 1100px; margin: 0 auto; }

.loading-state, .error-state { text-align: center; padding: 4rem; color: var(--text-secondary); }

.detail-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.75rem;
}
@media (max-width: 800px) { .detail-content { grid-template-columns: 1fr; } }

.main-card, .farmer-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.detail-hero-banner {
  width: 100%; height: 220px; border-radius: 8px; overflow: hidden;
  margin-bottom: 1.25rem; background: var(--surface-alt);
}
.detail-hero-img { width: 100%; height: 100%; object-fit: cover; }

.card-header-flex { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
.category-badge {
  background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0;
  padding: 0.25rem 0.65rem; border-radius: 999px; font-size: 0.8rem; font-weight: 700;
  display: inline-flex; align-items: center; gap: 0.35rem; margin-bottom: 0.5rem;
}
.cat-badge-thumb { width: 18px; height: 18px; border-radius: 50%; object-fit: cover; }
.produce-title { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem; }
.produce-sub { color: var(--text-secondary); font-size: 0.9rem; }

.price-box { text-align: right; background: #f8fafc; padding: 0.85rem 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; }
.price-num { display: block; font-size: 1.5rem; font-weight: 800; color: var(--brand-green); }
.price-unit { font-size: 0.8rem; color: var(--text-secondary); }

.divider { margin: 1.5rem 0; border: none; border-top: 1px solid var(--border); }

.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; margin-bottom: 1.5rem; }
.info-item { display: flex; flex-direction: column; gap: 0.25rem; }
.info-label { font-size: 0.8rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; }
.info-val { font-size: 1.05rem; color: var(--text-primary); }

.status-pill { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; width: fit-content; }
.status--active { background: #dcfce7; color: #166534; }
.status--sold   { background: #fee2e2; color: #991b1b; }

.desc-box { background: #fafafa; padding: 1.25rem; border-radius: 8px; border: 1px solid #f1f5f9; }
.desc-title { font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary); }
.desc-text { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; }

.side-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 1.25rem; border-bottom: 2px solid var(--surface-alt); padding-bottom: 0.5rem; }
.farmer-profile { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem; }
.avatar-photo { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 2px solid var(--brand-green-border); }
.avatar-icon { font-size: 2.25rem; background: #f0fdf4; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.farmer-fullname { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); }
.verified-tag { font-size: 0.75rem; color: var(--brand-green); font-weight: 600; }

.farmer-meta { display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.85rem; margin-bottom: 1.5rem; background: #fafafa; padding: 0.85rem; border-radius: 6px; }
.meta-row { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
.meta-key { color: var(--text-secondary); }
.meta-val { font-weight: 600; color: var(--text-primary); text-align: right; }
.phone-highlight { font-weight: 700; color: #0d9488; }
.acc-highlight { font-size: 0.8rem; color: #047857; }
.acc-highlight strong { font-weight: 800; color: #064e3b; }
.text-success { color: #166534; }

.order-prompt { text-align: center; }
.prompt-text { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.4; }
.btn-primary { width: 100%; padding: 0.75rem; background: var(--brand-green); color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-secondary { width: 100%; padding: 0.75rem; background: #1e293b; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }

.history-section { grid-column: 1 / -1; background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 1.75rem; margin-top: 1rem; }
.section-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem; }
.section-sub { color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1.25rem; }

.history-table-wrap { overflow-x: auto; }
.history-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
.history-table th { background: #f8fafc; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); color: var(--text-secondary); font-weight: 600; }
.history-table td { padding: 0.85rem 1rem; border-bottom: 1px solid #f1f5f9; }
.price-cell { font-weight: 700; color: var(--brand-green); }
.tag-initial { background: #eff6ff; color: #1e40af; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
.tag-update  { background: #fef3c7; color: #92400e; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }

.cart-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.cart-badge {
  background: #ef4444;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: 9999px;
  line-height: 1;
}

.detail-toast {
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.detail-toast--success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}
.detail-toast--error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.add-cart-action-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.qty-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-primary);
  font-weight: 600;
}
.qty-input-box {
  width: 90px;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  text-align: center;
  font-weight: 700;
  font-size: 0.95rem;
}
</style>
