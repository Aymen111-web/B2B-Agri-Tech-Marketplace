<script setup>
import { ref, onMounted, watch } from 'vue'
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

function handleSortChange() {
  loadListings()
}

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
    cartMessage.value = { type: 'error', text: res.message }
  }

  setTimeout(() => {
    cartMessage.value = { type: '', text: '' }
  }, 4000)
}

function formatPrice(val) {
  if (val === undefined || val === null) return '0.00'
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function getCategoryIcon(catName) {
  const name = (catName || '').toLowerCase()
  if (name.includes('grain') || name.includes('cereal') || name.includes('wheat')) return '🌾'
  if (name.includes('vegetable') || name.includes('tomato')) return '🥦'
  if (name.includes('fruit') || name.includes('avocado')) return '🍎'
  if (name.includes('coffee')) return '☕'
  if (name.includes('pulse') || name.includes('bean')) return '🫘'
  if (name.includes('oil')) return '🌻'
  if (name.includes('dairy') || name.includes('milk')) return '🥛'
  if (name.includes('honey') || name.includes('bee')) return '🍯'
  return '📦'
}
</script>

<template>
  <div class="listings-page">
    <!-- Navbar -->
    <nav class="top-nav">
      <div class="top-nav__inner">
        <router-link to="/" class="top-nav__brand">
          🌿 Agri<strong>Market</strong>
        </router-link>
        <div class="top-nav__right">
          <router-link to="/listings" class="top-nav__link active">
            Browse Produce
          </router-link>
          <router-link v-if="auth.isAuthenticated" to="/cart" class="top-nav__link cart-link">
            🛒 Cart <span v-if="cartStore.itemCount > 0" class="cart-badge">{{ cartStore.itemCount }}</span>
          </router-link>
          <router-link v-if="auth.isAuthenticated" to="/dashboard" class="top-nav__link">
            Dashboard
          </router-link>
          <router-link v-else to="/login" class="top-nav__btn">
            Sign In
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Search Hero Header -->
    <header class="listings-hero">
      <div class="listings-hero__inner">
        <h1 class="hero-title">Ethiopian Farmers Produce Marketplace</h1>
        <p class="hero-sub">
          Direct trade from verified Ethiopian farmers with transparent pricing and real-time stock levels.
        </p>

        <!-- Search & Filter Controls -->
        <div class="search-box">
          <div class="search-input-wrap">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search produce (e.g. White Wheat, Tomatoes, Harar Coffee)..."
              @keyup.enter="handleSearch"
            />
            <button class="search-btn" @click="handleSearch">Search</button>
          </div>

          <div class="sort-wrap">
            <label for="sort-select">Sort by:</label>
            <select id="sort-select" v-model="selectedSort" @change="handleSortChange">
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        <!-- Category Filter Pills -->
        <div class="category-pills">
          <button
            class="pill"
            :class="{ active: selectedCategory === '' }"
            @click="handleCategorySelect('')"
          >
            All Produce
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
    </header>

    <!-- Produce Grid Section -->
    <main class="listings-main">
      <div class="listings-container">

        <!-- Toast Notification Alert -->
        <div v-if="cartMessage.text" :class="['toast-alert', cartMessage.type === 'error' ? 'toast-alert--error' : 'toast-alert--success']">
          <span>{{ cartMessage.type === 'error' ? '⚠️' : '✅' }}</span>
          <span>{{ cartMessage.text }}</span>
        </div>

        <div v-if="listingStore.loading" class="state-box">
          <div class="spinner"></div>
          <p>Loading fresh produce listings...</p>
        </div>

        <div v-else-if="listingStore.listings.length === 0" class="state-box empty-state">
          <div class="empty-icon">🌾</div>
          <h3>No produce listings found</h3>
          <p>Try searching for a different crop or clearing your category filters.</p>
          <button class="reset-btn" @click="handleCategorySelect(''); searchQuery = ''; loadListings()">
            Clear Filters
          </button>
        </div>

        <div v-else class="produce-grid">
          <div
            v-for="item in listingStore.listings"
            :key="item.id"
            class="produce-card"
            @click="router.push(`/listings/${item.id}`)"
          >
            <div class="card-badge-wrap">
              <span class="category-tag">
                {{ getCategoryIcon(item.category?.name) }} {{ item.category?.name || 'Produce' }}
              </span>
              <span v-if="item.status === 'active'" class="stock-tag status--in-stock">
                In Stock
              </span>
              <span v-else class="stock-tag status--sold-out">
                Sold Out
              </span>
            </div>

            <h3 class="produce-title">{{ item.title }}</h3>
            <p class="produce-desc">{{ item.description || 'Fresh produce harvested by verified Ethiopian farm.' }}</p>

            <div class="farmer-info">
              <span class="farmer-icon">👨‍🌾</span>
              <span class="farmer-name">
                {{ item.farmer?.first_name }} {{ item.farmer?.second_name }}
              </span>
              <span class="verified-icon" title="Verified Farmer">✓</span>
            </div>

            <div class="card-footer">
              <div class="price-wrap">
                <span class="price-val">{{ formatPrice(item.price_per_unit) }} ETB</span>
                <span class="unit-val">/ {{ item.unit }}</span>
              </div>
              <div class="qty-avail">
                Available: <strong>{{ item.quantity_available }} {{ item.unit }}s</strong>
              </div>
            </div>

            <div class="card-actions">
              <button
                v-if="item.status === 'active'"
                class="add-cart-btn"
                :disabled="addingCartId === item.id"
                @click.stop="handleAddToCart(item)"
              >
                🛒 Add to Cart
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
  transition: all 0.15s ease;
}
.top-nav__link.active, .top-nav__link:hover { color: #fff; }
.top-nav__btn {
  background: rgba(255,255,255,0.12);
  color: #fff;
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-xs);
  text-decoration: none;
  font-size: 0.8125rem;
  font-weight: 600;
  border: 1px solid rgba(255,255,255,0.2);
  transition: all 0.15s ease;
}
.top-nav__btn:hover { background: rgba(255,255,255,0.2); }

.listings-hero {
  background: linear-gradient(135deg, #064e3b 0%, #047857 100%);
  color: #fff;
  padding: 2.5rem 1.5rem 2rem;
}
.listings-hero__inner {
  max-width: 1200px;
  margin: 0 auto;
}
.hero-title { font-size: 1.65rem; font-weight: 700; margin-bottom: 0.35rem; }
.hero-sub { color: rgba(255,255,255,0.85); font-size: 0.9rem; margin-bottom: 1.5rem; max-width: 650px; }

.search-box {
  display: flex;
  gap: 0.85rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}
.search-input-wrap {
  flex: 1;
  min-width: 280px;
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
.search-btn {
  background: var(--brand-green);
  color: #fff;
  border: none;
  border-radius: var(--radius-xs);
  padding: 0.5rem 1.15rem;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s ease;
}
.search-btn:hover { background: var(--brand-green-dark); }

.sort-wrap { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8125rem; color: rgba(255,255,255,0.9); font-weight: 600; }
.sort-wrap select {
  padding: 0.45rem 0.75rem;
  border-radius: var(--radius-xs);
  border: none;
  font-size: 0.8125rem;
  font-weight: 600;
  outline: none;
  background: #fff;
  color: var(--text-primary);
}

.category-pills { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.pill {
  background: rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.9);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: var(--radius-full);
  padding: 0.3rem 0.85rem;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}
.pill.active, .pill:hover {
  background: var(--brand-gold);
  color: #0f172a;
  border-color: var(--brand-gold);
  font-weight: 700;
}

.listings-main { padding: 2rem 1.5rem 3.5rem; }
.listings-container { max-width: 1200px; margin: 0 auto; }

.state-box {
  background: var(--surface-card);
  border-radius: var(--radius-md);
  padding: 3.5rem 2rem;
  text-align: center;
  border: 1px solid var(--border);
  color: var(--text-secondary);
}
.empty-icon { font-size: 3rem; margin-bottom: 0.85rem; }
.reset-btn {
  margin-top: 1rem;
  background: var(--brand-green);
  color: #fff;
  border: none;
  padding: 0.5rem 1.15rem;
  border-radius: var(--radius-xs);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}

.produce-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
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
}
.produce-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: rgba(16, 185, 129, 0.35);
}

.card-badge-wrap { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.category-tag {
  background: var(--surface-alt);
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--border);
}
.stock-tag { font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: var(--radius-full); }
.status--in-stock  { background: var(--brand-green-light); color: var(--brand-green-dark); border: 1px solid var(--brand-green-border); }
.status--sold-out { background: var(--error-bg); color: var(--error-dark); border: 1px solid var(--error-border); }

.produce-title { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.35rem; }
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
  gap: 0.4rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  background: var(--surface-alt);
  padding: 0.45rem 0.7rem;
  border-radius: var(--radius-xs);
  margin-bottom: 1rem;
  border: 1px solid var(--border-subtle);
}
.farmer-name { font-weight: 600; color: var(--text-primary); }
.verified-icon { color: var(--brand-green); font-weight: 700; }

.card-footer {
  margin-top: auto;
  border-top: 1px dashed var(--border);
  padding-top: 0.75rem;
  margin-bottom: 0.85rem;
}
.price-wrap { display: flex; align-items: baseline; gap: 0.25rem; }
.price-val { font-size: 1.25rem; font-weight: 800; color: var(--brand-green-dark); }
.unit-val { font-size: 0.8125rem; color: var(--text-secondary); }
.qty-avail { font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem; }
.qty-avail strong { color: var(--text-primary); }

.view-btn {
  width: 100%;
  padding: 0.55rem;
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-primary);
  transition: all 0.15s ease;
}
.produce-card:hover .view-btn {
  background: var(--brand-green);
  color: #fff;
  border-color: var(--brand-green);
}

.cart-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.cart-badge {
  background: var(--error);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-full);
  line-height: 1;
}

.toast-alert {
  padding: 0.75rem 1.15rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
}
.toast-alert--success {
  background: var(--brand-green-light);
  color: var(--brand-green-dark);
  border: 1px solid var(--brand-green-border);
}
.toast-alert--error {
  background: var(--error-bg);
  color: var(--error-dark);
  border: 1px solid var(--error-border);
}

.card-actions {
  display: flex;
  gap: 0.4rem;
}
.add-cart-btn {
  flex: 1;
  padding: 0.55rem;
  background: var(--brand-green);
  color: #fff;
  border: none;
  border-radius: var(--radius-xs);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s ease;
}
.add-cart-btn:hover {
  background: var(--brand-green-dark);
}
.add-cart-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
