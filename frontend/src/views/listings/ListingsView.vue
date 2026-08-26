<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useListingStore } from '@/stores/listing'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const listingStore = useListingStore()
const auth = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()
const route = useRoute()

const searchQuery = ref('')
const selectedCategory = ref('')
const selectedSort = ref('newest')
const inStockOnly = ref(false)
const addingCartId = ref(null)
const cartMessage = ref({ type: '', text: '' })

onMounted(async () => {
  await listingStore.fetchCategories()
  await loadListings()
  if (auth.isAuthenticated) {
    await cartStore.fetchCart()
  }
})

async function loadListings() {
  const params = {
    sort: selectedSort.value,
  }
  if (searchQuery.value.trim()) {
    params.search = searchQuery.value.trim()
  }
  if (selectedCategory.value) {
    params.category_id = selectedCategory.value
  }
  await listingStore.fetchListings(params)
}

function handleCategorySelect(catId) {
  selectedCategory.value = catId
  loadListings()
}

function handleSearch() {
  loadListings()
}

function clearSearch() {
  searchQuery.value = ''
  loadListings()
}

function handleSortChange() {
  loadListings()
}

const filteredListings = computed(() => {
  let list = listingStore.listings || []
  if (inStockOnly.value) {
    list = list.filter(item => item.status === 'active' && item.quantity_available > 0)
  }
  return list
})

async function handleAddToCart(item) {
  if (!auth.isAuthenticated) {
    router.push('/login')
    return
  }
  addingCartId.value = item.id
  cartMessage.value = { type: '', text: '' }

  const res = await cartStore.addToCart(item.id, 1)
  addingCartId.value = null

  if (res.success) {
    cartMessage.value = { type: 'success', text: `Added ${item.title} to your cart!` }
  } else {
    cartMessage.value = { type: 'error', text: res.message || 'Failed to add item to cart.' }
  }

  setTimeout(() => {
    cartMessage.value = { type: '', text: '' }
  }, 4000)
}

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}

function formatPrice(val) {
  if (val === undefined || val === null) return '0.00'
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function getCategoryIcon(catName) {
  const name = (catName || '').toLowerCase()
  if (name.includes('grain') || name.includes('cereal') || name.includes('wheat') || name.includes('teff')) return '🌾'
  if (name.includes('vegetable') || name.includes('tomato')) return '🥦'
  if (name.includes('fruit') || name.includes('avocado')) return '🍎'
  if (name.includes('coffee')) return '☕'
  if (name.includes('pulse') || name.includes('bean') || name.includes('lentil')) return '🫘'
  if (name.includes('oil') || name.includes('seed') || name.includes('sesame')) return '🌻'
  if (name.includes('dairy') || name.includes('milk')) return '🥛'
  if (name.includes('honey') || name.includes('spice')) return '🍯'
  return '📦'
}
</script>

<template>
  <div class="listings-page">
    
    <!-- Top Navigation Bar -->
    <nav class="top-nav">
      <div class="top-nav__inner">
        <router-link to="/dashboard" class="top-nav__brand">
          🌿 Agri<strong>Market</strong>
        </router-link>
        <div class="top-nav__right">
          <router-link to="/listings" class="top-nav__link active">
            Browse Marketplace
          </router-link>
          <router-link v-if="auth.isAuthenticated" to="/cart" class="top-nav__link cart-link">
            🛒 Cart <span v-if="cartStore.itemCount > 0" class="cart-badge">{{ cartStore.itemCount }}</span>
          </router-link>
          <router-link v-if="auth.isAuthenticated" to="/orders" class="top-nav__link">
            My Orders
          </router-link>
          <router-link v-if="auth.isAuthenticated" to="/dashboard" class="top-nav__link">
            Dashboard
          </router-link>
          <span v-if="auth.isAuthenticated" class="user-pill">
            👤 {{ auth.user?.first_name }}
          </span>
          <button v-if="auth.isAuthenticated" @click="handleLogout" class="top-nav__logout">
            Sign Out
          </button>
          <router-link v-else to="/login" class="top-nav__btn">
            Sign In
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Floating Toast Notification -->
    <div v-if="cartMessage.text" :class="['toast-alert', cartMessage.type === 'error' ? 'toast-alert--error' : 'toast-alert--success']">
      <span class="toast-icon">{{ cartMessage.type === 'error' ? '⚠️' : '✅' }}</span>
      <span class="toast-text">{{ cartMessage.text }}</span>
    </div>

    <!-- Search Hero Header -->
    <header class="listings-hero">
      <div class="listings-hero__inner">
        
        <!-- Marketplace Trust Badges -->
        <div class="hero-badges-row">
          <span class="trust-badge">🌾 100% Verified Ethiopian Farmers</span>
          <span class="trust-badge">🔬 Guaranteed Quality Inspection</span>
          <span class="trust-badge">🚚 Batch Delivery Traceability</span>
        </div>

        <h1 class="hero-title">Ethiopian B2B Produce Exchange</h1>
        <p class="hero-sub">
          Direct wholesale trade connecting verified agricultural producers with commercial buyers across Ethiopia.
        </p>

        <!-- Search & Control Panel Bar -->
        <div class="search-box">
          <div class="search-input-wrap">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search produce by title or crop type (e.g. White Teff, Harar Coffee, Organic Tomatoes)..."
              @keyup.enter="handleSearch"
            />
            <button v-if="searchQuery" class="clear-btn" @click="clearSearch" title="Clear search">✕</button>
            <button class="search-btn" @click="handleSearch">Search Produce</button>
          </div>

          <div class="filter-controls">
            <!-- Sort Selector -->
            <div class="control-group">
              <label for="sort-select">Sort By:</label>
              <select id="sort-select" v-model="selectedSort" @change="handleSortChange">
                <option value="newest">Newest Listed</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="oldest">Oldest Listed</option>
              </select>
            </div>

            <!-- In-Stock Toggle -->
            <label class="stock-toggle-label">
              <input type="checkbox" v-model="inStockOnly" />
              <span>In-Stock Only</span>
            </label>
          </div>
        </div>

        <!-- Category Filter Pill Carousel -->
        <div class="category-pills-wrap">
          <div class="category-pills">
            <button
              class="pill"
              :class="{ active: selectedCategory === '' }"
              @click="handleCategorySelect('')"
            >
              🌱 All Produce Categories
            </button>
            <button
              v-for="cat in listingStore.categories"
              :key="cat.id"
              class="pill"
              :class="{ active: selectedCategory === cat.id }"
              @click="handleCategorySelect(cat.id)"
            >
              {{ getCategoryIcon(cat.name) }} {{ cat.name }}
            </button>
          </div>
        </div>

      </div>
    </header>

    <!-- Produce Cards Section -->
    <main class="listings-main">
      <div class="listings-container">

        <!-- Loading State -->
        <div v-if="listingStore.loading" class="state-box">
          <div class="spinner"></div>
          <p class="state-title">Fetching verified produce listings...</p>
          <p class="state-sub">Gathering crop stock and live pricing from Ethiopian farms</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredListings.length === 0" class="state-box empty-state">
          <div class="empty-icon">🌾</div>
          <h3 class="state-title">No produce listings found</h3>
          <p class="state-sub">Try searching for a different crop name or reset your category filters.</p>
          <button class="reset-btn" @click="handleCategorySelect(''); searchQuery = ''; inStockOnly = false; loadListings()">
            🔄 Reset All Filters
          </button>
        </div>

        <!-- Produce Cards Grid -->
        <div v-else class="produce-grid">
          <div
            v-for="item in filteredListings"
            :key="item.id"
            class="produce-card"
            @click="router.push(`/listings/${item.id}`)"
          >
            <!-- Card Header Tags -->
            <div class="card-badge-wrap">
              <span class="category-tag">
                {{ getCategoryIcon(item.category?.name) }} {{ item.category?.name || 'Produce' }}
              </span>
              <span v-if="item.status === 'active' && item.quantity_available > 0" class="stock-tag status--in-stock">
                In Stock
              </span>
              <span v-else class="stock-tag status--sold-out">
                Sold Out
              </span>
            </div>

            <!-- Title & Batch Info -->
            <h3 class="produce-title">{{ item.title }}</h3>
            
            <div class="batch-meta-row">
              <span v-if="item.batch_number" class="batch-code">
                Batch #{{ item.batch_number }}
              </span>
              <span v-if="item.quality_grade" class="grade-chip">
                {{ item.quality_grade }}
              </span>
              <span v-if="item.harvest_date" class="harvest-date">
                Harvested {{ formatDate(item.harvest_date) }}
              </span>
            </div>

            <p class="produce-desc">
              {{ item.description || 'Fresh produce batch direct from verified Ethiopian farm with guaranteed quality inspection.' }}
            </p>

            <!-- Farmer Profile Info Box -->
            <div class="farmer-info">
              <span class="farmer-avatar">👨‍🌾</span>
              <div class="farmer-details">
                <span class="farmer-name">
                  {{ item.farmer?.first_name }} {{ item.farmer?.second_name }}
                </span>
                <span class="farmer-verified">✓ Verified Supplier</span>
              </div>
            </div>

            <!-- Price & Stock Footer -->
            <div class="card-footer">
              <div class="price-wrap">
                <span class="price-val">{{ formatPrice(item.price_per_unit) }} ETB</span>
                <span class="unit-val">/ {{ item.unit }}</span>
              </div>
              <div class="qty-info-row">
                <span class="qty-avail">Stock: <strong>{{ item.quantity_available }} {{ item.unit }}s</strong></span>
                <span v-if="item.minimum_order_quantity" class="moq-tag">
                  Min Order: {{ item.minimum_order_quantity }} {{ item.unit }}s
                </span>
              </div>
            </div>

            <!-- Interactive Action Buttons -->
            <div class="card-actions">
              <button
                v-if="item.status === 'active' && item.quantity_available > 0"
                class="add-cart-btn"
                :disabled="addingCartId === item.id"
                @click.stop="handleAddToCart(item)"
              >
                <span v-if="addingCartId === item.id" class="btn-spinner"></span>
                <span v-else>🛒 Add to Cart</span>
              </button>
              <button class="view-btn">
                Inspect Batch →
              </button>
            </div>

          </div>
        </div>

      </div>
    </main>

  </div>
</template>

<style scoped>
.listings-page {
  min-height: 100vh;
  background: var(--surface-alt);
}

/* Top Navigation Bar */
.top-nav {
  background: #064e3b;
  padding: 0 1.5rem;
  box-shadow: var(--shadow-xs);
}
.top-nav__inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.top-nav__brand {
  color: #fff;
  font-size: 1.15rem;
  font-weight: 700;
  text-decoration: none;
}
.top-nav__brand strong { color: var(--brand-gold); }
.top-nav__right { display: flex; align-items: center; gap: 1rem; }
.top-nav__link {
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-xs);
  transition: all 0.15s ease;
}
.top-nav__link.active, .top-nav__link:hover {
  background: rgba(255,255,255,0.18);
  color: #fff;
}
.cart-link {
  position: relative;
}
.cart-badge {
  background: var(--brand-gold);
  color: #0f172a;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-full);
  margin-left: 0.25rem;
}
.user-pill {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.82rem;
  font-weight: 600;
}
.top-nav__logout {
  background: rgba(255,255,255,0.12);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: var(--radius-xs);
  padding: 0.35rem 0.85rem;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}
.top-nav__logout:hover { background: rgba(255,255,255,0.22); }
.top-nav__btn {
  background: var(--brand-gold);
  color: #0f172a;
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-xs);
  text-decoration: none;
  font-size: 0.8125rem;
  font-weight: 700;
}

/* Floating Toast Alert */
.toast-alert {
  position: fixed;
  top: 75px;
  right: 24px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 700;
  box-shadow: var(--shadow-lg);
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideIn {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.toast-alert--success { background: #065f46; color: #ffffff; border: 1px solid #34d399; }
.toast-alert--error   { background: #991b1b; color: #ffffff; border: 1px solid #f87171; }

/* Search Hero Header */
.listings-hero {
  background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%);
  color: #fff;
  padding: 2.25rem 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.listings-hero__inner {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-badges-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 0.85rem;
}
.trust-badge {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.9);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hero-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.35rem;
  letter-spacing: -0.01em;
}
.hero-sub {
  color: #94a3b8;
  font-size: 0.925rem;
  margin-bottom: 1.5rem;
  max-width: 720px;
  line-height: 1.5;
}

/* Search Box & Controls */
.search-box {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}
.search-input-wrap {
  flex: 1;
  min-width: 300px;
  display: flex;
  align-items: center;
  background: var(--surface-card);
  border-radius: var(--radius-sm);
  padding: 0.3rem 0.4rem 0.3rem 0.85rem;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}
.search-icon { font-size: 1rem; margin-right: 0.5rem; color: var(--text-muted); }
.search-input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.875rem;
  font-family: var(--font-sans);
  color: var(--text-primary);
  background: transparent;
}
.clear-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
}
.search-btn {
  background: var(--brand-green);
  color: #fff;
  border: none;
  border-radius: var(--radius-xs);
  padding: 0.55rem 1.25rem;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s ease;
}
.search-btn:hover { background: var(--brand-green-dark); }

.filter-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.control-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}
.control-group select {
  padding: 0.45rem 0.75rem;
  border-radius: var(--radius-xs);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 0.8125rem;
  font-weight: 600;
  outline: none;
  background: #ffffff;
  color: var(--text-primary);
}

.stock-toggle-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  user-select: none;
}
.stock-toggle-label input[type="checkbox"] {
  accent-color: var(--brand-green);
  width: 16px;
  height: 16px;
}

/* Category Pills Carousel */
.category-pills-wrap {
  overflow-x: auto;
  padding-bottom: 0.25rem;
}
.category-pills {
  display: flex;
  gap: 0.5rem;
  white-space: nowrap;
}
.pill {
  background: rgba(255, 255, 255, 0.15) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: var(--radius-full);
  padding: 0.35rem 0.95rem;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  backdrop-filter: blur(4px);
  user-select: none;
}
.pill:hover {
  background: rgba(255, 255, 255, 0.28) !important;
  color: #ffffff !important;
  border-color: #ffffff !important;
}
.pill.active {
  background: #fbbf24 !important;
  color: #0f172a !important;
  border-color: #fbbf24 !important;
  font-weight: 800;
  box-shadow: 0 3px 10px rgba(251, 191, 36, 0.4);
}

/* Produce Grid Section */
.listings-main { padding: 2rem 1.5rem 4rem; }
.listings-container { max-width: 1200px; margin: 0 auto; }

.state-box {
  background: var(--surface-card);
  border-radius: var(--radius-md);
  padding: 3.5rem 2rem;
  text-align: center;
  border: 1px solid var(--border);
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--brand-green);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.state-title { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem; }
.state-sub   { font-size: 0.875rem; color: var(--text-secondary); }
.empty-icon  { font-size: 3rem; margin-bottom: 0.85rem; }
.reset-btn {
  margin-top: 1.25rem;
  background: var(--brand-green);
  color: #fff;
  border: none;
  padding: 0.55rem 1.25rem;
  border-radius: var(--radius-xs);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}

/* Produce Grid & Card Layout */
.produce-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 1.35rem;
}

.produce-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.35rem;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}
.produce-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: rgba(16, 185, 129, 0.4);
}

.card-badge-wrap { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.category-tag {
  background: var(--surface-alt);
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--border);
}
.stock-tag { font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: var(--radius-full); }
.status--in-stock { background: var(--brand-green-light); color: var(--brand-green-dark); border: 1px solid var(--brand-green-border); }
.status--sold-out  { background: var(--error-bg); color: var(--error-dark); border: 1px solid var(--error-border); }

.produce-title {
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.35rem;
  line-height: 1.3;
}

.batch-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.6rem;
}
.batch-code {
  font-size: 0.72rem;
  font-weight: 700;
  font-family: monospace;
  color: var(--text-muted);
  background: var(--surface-alt);
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}
.grade-chip {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--brand-gold-dark);
  background: var(--brand-gold-light);
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}
.harvest-date {
  font-size: 0.72rem;
  color: var(--text-secondary);
}

.produce-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.45;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.farmer-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  background: var(--surface-alt);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-xs);
  margin-bottom: 1rem;
  border: 1px solid var(--border-subtle);
}
.farmer-avatar { font-size: 1.1rem; }
.farmer-details { display: flex; flex-direction: column; }
.farmer-name { font-weight: 700; color: var(--text-primary); font-size: 0.825rem; }
.farmer-verified { color: var(--brand-green-dark); font-size: 0.72rem; font-weight: 700; }

.card-footer {
  margin-top: auto;
  border-top: 1px dashed var(--border);
  padding-top: 0.75rem;
  margin-bottom: 0.85rem;
}
.price-wrap { display: flex; align-items: baseline; gap: 0.25rem; }
.price-val { font-size: 1.3rem; font-weight: 800; color: var(--brand-green-dark); letter-spacing: -0.01em; }
.unit-val { font-size: 0.8125rem; color: var(--text-secondary); font-weight: 600; }
.qty-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78125rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}
.qty-avail strong { color: var(--text-primary); }
.moq-tag { font-size: 0.72rem; font-weight: 600; color: var(--text-muted); }

.card-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.add-cart-btn {
  flex: 1;
  padding: 0.5rem 0.75rem;
  background: var(--brand-green);
  color: #fff;
  border: none;
  border-radius: var(--radius-xs);
  font-weight: 700;
  font-size: 0.8125rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
  box-shadow: var(--shadow-xs);
  display: flex;
  align-items: center;
  justify-content: center;
}
.add-cart-btn:hover:not(:disabled) {
  background: var(--brand-green-dark);
  transform: translateY(-1px);
}
.add-cart-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.view-btn {
  padding: 0.5rem 0.75rem;
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--text-primary);
  white-space: nowrap;
  transition: all 0.15s ease;
}
.view-btn:hover, .produce-card:hover .view-btn {
  background: var(--brand-green-light);
  color: var(--brand-green-dark);
  border-color: var(--brand-green-border);
}
</style>
