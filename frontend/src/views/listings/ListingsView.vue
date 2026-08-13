<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useListingStore } from '@/stores/listing'
import { useAuthStore } from '@/stores/auth'

const listingStore = useListingStore()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const searchQuery = ref('')
const selectedCategory = ref('')
const selectedSort = ref('newest')

onMounted(async () => {
  await listingStore.fetchCategories()
  await loadListings()
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

function formatPrice(val) {
  if (val === undefined || val === null) return '0.00'
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function getCategoryIcon(catName) {
  const name = (catName || '').toLowerCase()
  if (name.includes('grain') || name.includes('teff')) return '🌾'
  if (name.includes('vegetable') || name.includes('tomato')) return '🥦'
  if (name.includes('fruit') || name.includes('avocado')) return '🍎'
  if (name.includes('coffee')) return '☕'
  if (name.includes('pulse') || name.includes('bean')) return '🫘'
  if (name.includes('oil')) return '🌻'
  if (name.includes('spice')) return '🌶️'
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
              placeholder="Search produce (e.g. White Teff, Tomatoes, Harar Coffee)..."
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

            <button class="view-btn">
              View Details & Pricing →
            </button>
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
  background: var(--brand-green);
  padding: 0 1.5rem;
}
.top-nav__inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.top-nav__brand {
  color: #fff;
  font-size: 1.25rem;
  font-weight: 700;
  text-decoration: none;
}
.top-nav__brand strong { color: var(--brand-gold); }
.top-nav__right { display: flex; align-items: center; gap: 1.25rem; }
.top-nav__link {
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}
.top-nav__link.active, .top-nav__link:hover { color: #fff; }
.top-nav__btn {
  background: rgba(255,255,255,0.15);
  color: #fff;
  padding: 0.4rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
}

.listings-hero {
  background: linear-gradient(135deg, #1b3d2b 0%, #2d5a3f 100%);
  color: #fff;
  padding: 3rem 1.5rem 2.5rem;
}
.listings-hero__inner {
  max-width: 1200px;
  margin: 0 auto;
}
.hero-title { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
.hero-sub { color: rgba(255,255,255,0.85); font-size: 1rem; margin-bottom: 1.75rem; max-width: 700px; }

.search-box {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}
.search-input-wrap {
  flex: 1;
  min-width: 300px;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  padding: 0.35rem 0.5rem 0.35rem 0.9rem;
}
.search-icon { font-size: 1.1rem; margin-right: 0.5rem; }
.search-input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.95rem;
  color: var(--text-primary);
}
.search-btn {
  background: var(--brand-green);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.55rem 1.25rem;
  font-weight: 600;
  cursor: pointer;
}

.sort-wrap { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; }
.sort-wrap select {
  padding: 0.55rem 0.85rem;
  border-radius: 6px;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  outline: none;
}

.category-pills { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.pill {
  background: rgba(255,255,255,0.12);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 999px;
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.pill.active, .pill:hover {
  background: var(--brand-gold);
  color: #1e293b;
  border-color: var(--brand-gold);
  font-weight: 700;
}

.listings-main { padding: 2.5rem 1.5rem 4rem; }
.listings-container { max-width: 1200px; margin: 0 auto; }

.state-box {
  background: #fff;
  border-radius: 12px;
  padding: 4rem 2rem;
  text-align: center;
  border: 1px solid var(--border);
  color: var(--text-secondary);
}
.empty-icon { font-size: 3.5rem; margin-bottom: 1rem; }
.reset-btn {
  margin-top: 1.25rem;
  background: var(--brand-green);
  color: #fff;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.produce-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 1.75rem;
}

.produce-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.produce-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}

.card-badge-wrap { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; }
.category-tag {
  background: #f1f5f9;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
}
.stock-tag { font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px; }
.status--in-stock  { background: #dcfce7; color: #166534; }
.status--sold-out { background: #fee2e2; color: #991b1b; }

.produce-title { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.4rem; }
.produce-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 1.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.farmer-info {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.825rem;
  color: var(--text-secondary);
  background: #fafafa;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  margin-bottom: 1.25rem;
}
.farmer-name { font-weight: 600; color: var(--text-primary); }
.verified-icon { color: var(--brand-green); font-weight: 700; }

.card-footer {
  margin-top: auto;
  border-top: 1px dashed var(--border);
  padding-top: 0.85rem;
  margin-bottom: 1rem;
}
.price-wrap { display: flex; align-items: baseline; gap: 0.25rem; }
.price-val { font-size: 1.35rem; font-weight: 800; color: var(--brand-green); }
.unit-val { font-size: 0.85rem; color: var(--text-secondary); }
.qty-avail { font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem; }
.qty-avail strong { color: var(--text-primary); }

.view-btn {
  width: 100%;
  padding: 0.65rem;
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-primary);
  transition: background 0.2s;
}
.produce-card:hover .view-btn {
  background: var(--brand-green);
  color: #fff;
  border-color: var(--brand-green);
}
</style>
