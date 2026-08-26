<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useListingStore } from '@/stores/listing'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const listingStore = useListingStore()
const auth = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

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
    cartMessage.value = { type: 'success', text: `Added ${item.title} to cart!` }
  } else {
    cartMessage.value = { type: 'error', text: res.message || 'Failed to add.' }
  }

  setTimeout(() => {
    cartMessage.value = { type: '', text: '' }
  }, 3500)
}

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}

function formatPrice(val) {
  if (val === undefined || val === null) return '0'
  const num = Number(val)
  return num % 1 === 0 ? num.toLocaleString('en-US') : num.toLocaleString('en-US', { maximumFractionDigits: 2 })
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
import ThemeToggle from '@/components/ThemeToggle.vue'
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
          <router-link to="/dashboard" class="top-nav__link">
            Dashboard
          </router-link>
          <router-link to="/listings" class="top-nav__link active">
            Marketplace
          </router-link>
          <router-link v-if="auth.isAuthenticated" to="/cart" class="top-nav__link cart-link">
            🛒 Cart <span v-if="cartStore.itemCount > 0" class="cart-badge">{{ cartStore.itemCount }}</span>
          </router-link>
          <router-link v-if="auth.isAuthenticated" to="/orders" class="top-nav__link">
            My Orders
          </router-link>
          <router-link to="/capabilities/apply" class="top-nav__link">
            Capabilities
          </router-link>
          <router-link v-if="auth.isAdmin" to="/admin/capability-applications" class="top-nav__link">
            🛡️ Approvals
          </router-link>
          <ThemeToggle />
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
      <span>{{ cartMessage.type === 'error' ? '⚠️' : '✅' }}</span>
      <span>{{ cartMessage.text }}</span>
    </div>

    <!-- Search Hero Header -->
    <header class="listings-hero">
      <div class="listings-hero__inner">
        
        <div class="hero-header-flex">
          <div>
            <h1 class="hero-title">Produce Marketplace</h1>
            <p class="hero-sub">Direct wholesale trade from verified Ethiopian farms</p>
          </div>
          <div class="trust-chips">
            <span class="chip">🌾 Verified Farmers</span>
            <span class="chip">🔬 Inspected</span>
            <span class="chip">🚚 Direct Delivery</span>
          </div>
        </div>

        <!-- Search Bar & Controls -->
        <div class="search-box">
          <div class="search-input-wrap">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search crop or produce (e.g. Teff, Coffee, Tomatoes)..."
              @keyup.enter="handleSearch"
            />
            <button v-if="searchQuery" class="clear-btn" @click="clearSearch">✕</button>
            <button class="search-btn" @click="handleSearch">Search</button>
          </div>

          <div class="filter-controls">
            <div class="control-group">
              <label for="sort-select">Sort:</label>
              <select id="sort-select" v-model="selectedSort" @change="handleSortChange">
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>

            <label class="stock-toggle-label">
              <input type="checkbox" v-model="inStockOnly" />
              <span>In-Stock Only</span>
            </label>
          </div>
        </div>

        <!-- Category Pills -->
        <div class="category-pills-wrap">
          <div class="category-pills">
            <button
              class="pill"
              :class="{ active: selectedCategory === '' }"
              @click="handleCategorySelect('')"
            >
              🌱 All
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

    <!-- Produce Grid Section -->
    <main class="listings-main">
      <div class="listings-container">

        <!-- Loading State -->
        <div v-if="listingStore.loading" class="state-box">
          <div class="spinner"></div>
          <p class="state-title">Loading produce listings...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredListings.length === 0" class="state-box empty-state">
          <div class="empty-icon">🌾</div>
          <h3 class="state-title">No produce found</h3>
          <p class="state-sub">Try searching another crop or clear filters.</p>
          <button class="reset-btn" @click="handleCategorySelect(''); searchQuery = ''; inStockOnly = false; loadListings()">
            Reset Filters
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
            <!-- Card Top Row -->
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

            <!-- Title & Metadata -->
            <h3 class="produce-title">{{ item.title }}</h3>
            
            <div v-if="item.batch_number || item.quality_grade || item.harvest_date" class="batch-meta-row">
              <span v-if="item.batch_number" class="batch-code">#{{ item.batch_number }}</span>
              <span v-if="item.quality_grade" class="grade-chip">{{ item.quality_grade }}</span>
              <span v-if="item.harvest_date" class="harvest-date">{{ formatDate(item.harvest_date) }}</span>
            </div>

            <p v-if="item.description" class="produce-desc">
              {{ item.description }}
            </p>

            <!-- Farmer Name Row -->
            <div class="farmer-row">
              <span class="farmer-name">👨‍🌾 {{ item.farmer?.first_name }} {{ item.farmer?.second_name }}</span>
              <span class="farmer-verified">✓ Verified</span>
            </div>

            <!-- Price & Stock Footer -->
            <div class="card-footer">
              <div class="price-wrap">
                <span class="price-val">{{ formatPrice(item.price_per_unit) }} ETB</span>
                <span class="unit-val">/ {{ item.unit }}</span>
              </div>
              <div class="qty-info-row">
                <span>Avail: <strong>{{ item.quantity_available }} {{ item.unit }}s</strong></span>
                <span v-if="item.minimum_order_quantity">Min: {{ item.minimum_order_quantity }}</span>
              </div>
            </div>

            <!-- Actions -->
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
                Details →
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
.user-pill {
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.8rem;
  font-weight: 600;
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

/* Toast Alert */
.toast-alert {
  position: fixed;
  top: 68px;
  right: 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  border-radius: var(--radius-xs);
  font-size: 0.825rem;
  font-weight: 700;
  box-shadow: var(--shadow-md);
}
.toast-alert--success { background: #065f46; color: #ffffff; border: 1px solid #34d399; }
.toast-alert--error   { background: #991b1b; color: #ffffff; border: 1px solid #f87171; }

/* Hero Header */
.listings-hero {
  background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%);
  color: #fff;
  padding: 1.5rem 1.5rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.listings-hero__inner {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.15rem;
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

/* Search Box */
.search-box {
  display: flex;
  gap: 0.85rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.search-input-wrap {
  flex: 1;
  min-width: 260px;
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: var(--radius-xs);
  padding: 0.25rem 0.35rem 0.25rem 0.75rem;
  border: 1px solid var(--border);
}
.search-icon { font-size: 0.9rem; margin-right: 0.4rem; color: var(--text-muted); }
.search-input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.85rem;
  font-family: var(--font-sans);
  color: var(--text-primary);
  background: transparent;
}
.clear-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
}
.search-btn {
  background: var(--brand-green);
  color: #fff;
  border: none;
  border-radius: var(--radius-xs);
  padding: 0.45rem 1rem;
  font-weight: 700;
  font-size: 0.8125rem;
  cursor: pointer;
}
.search-btn:hover { background: var(--brand-green-dark); }

.filter-controls {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.control-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}
.control-group select {
  padding: 0.35rem 0.6rem;
  border-radius: var(--radius-xs);
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  outline: none;
  background: #ffffff;
  color: var(--text-primary);
}

.stock-toggle-label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  user-select: none;
}
.stock-toggle-label input[type="checkbox"] {
  accent-color: var(--brand-green);
}

/* Category Pills Carousel */
.category-pills-wrap {
  overflow-x: auto;
  padding-bottom: 0.15rem;
}
.category-pills {
  display: flex;
  gap: 0.4rem;
  white-space: nowrap;
}
.pill {
  background: rgba(255, 255, 255, 0.12) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  border-radius: var(--radius-full);
  padding: 0.25rem 0.75rem;
  font-size: 0.78125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}
.pill:hover {
  background: rgba(255, 255, 255, 0.24) !important;
  color: #ffffff !important;
}
.pill.active {
  background: #fbbf24 !important;
  color: #0f172a !important;
  border-color: #fbbf24 !important;
  font-weight: 800;
}

/* Produce Grid Section */
.listings-main { padding: 1.5rem 1.5rem 3.5rem; }
.listings-container { max-width: 1200px; margin: 0 auto; }

.state-box {
  background: var(--surface-card);
  border-radius: var(--radius-md);
  padding: 2.5rem 1.5rem;
  text-align: center;
  border: 1px solid var(--border);
}
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
.state-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
.state-sub   { font-size: 0.8125rem; color: var(--text-secondary); margin-top: 0.2rem; }
.empty-icon  { font-size: 2.5rem; margin-bottom: 0.5rem; }
.reset-btn {
  margin-top: 1rem;
  background: var(--brand-green);
  color: #fff;
  border: none;
  padding: 0.45rem 1rem;
  border-radius: var(--radius-xs);
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
}

/* Cards Layout */
.produce-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 1.15rem;
}

.produce-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.15rem;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xs);
  cursor: pointer;
  transition: all 0.15s ease;
}
.produce-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
  border-color: var(--brand-green-border);
}

.card-badge-wrap { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; }
.category-tag {
  background: var(--surface-alt);
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-subtle);
}
.stock-tag { font-size: 0.72rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: var(--radius-full); }
.status--in-stock { background: var(--brand-green-light); color: var(--brand-green-dark); }
.status--sold-out  { background: var(--error-bg); color: var(--error-dark); }

.produce-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  line-height: 1.25;
}

.batch-meta-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.5rem;
  font-size: 0.72rem;
}
.batch-code { font-weight: 700; color: var(--text-muted); }
.grade-chip { color: var(--brand-gold-dark); font-weight: 700; }
.harvest-date { color: var(--text-muted); }

.produce-desc {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.farmer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78125rem;
  background: var(--surface-alt);
  padding: 0.35rem 0.6rem;
  border-radius: var(--radius-xs);
  margin-bottom: 0.75rem;
}
.farmer-name { font-weight: 600; color: var(--text-primary); }
.farmer-verified { color: var(--brand-green-dark); font-weight: 700; font-size: 0.72rem; }

.card-footer {
  margin-top: auto;
  border-top: 1px dashed var(--border-subtle);
  padding-top: 0.6rem;
  margin-bottom: 0.75rem;
}
.price-wrap { display: flex; align-items: baseline; gap: 0.2rem; }
.price-val { font-size: 1.2rem; font-weight: 800; color: var(--brand-green-dark); }
.unit-val { font-size: 0.78125rem; color: var(--text-secondary); }
.qty-info-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.15rem;
}

.card-actions {
  display: flex;
  gap: 0.4rem;
}
.add-cart-btn {
  flex: 1;
  padding: 0.45rem 0.65rem;
  background: var(--brand-green);
  color: #fff;
  border: none;
  border-radius: var(--radius-xs);
  font-weight: 700;
  font-size: 0.78125rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.add-cart-btn:hover:not(:disabled) { background: var(--brand-green-dark); }
.add-cart-btn:disabled { opacity: 0.6; }
.btn-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.view-btn {
  padding: 0.45rem 0.65rem;
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  font-weight: 600;
  font-size: 0.78125rem;
  color: var(--text-primary);
}
.view-btn:hover { background: var(--brand-green-light); color: var(--brand-green-dark); }
</style>
