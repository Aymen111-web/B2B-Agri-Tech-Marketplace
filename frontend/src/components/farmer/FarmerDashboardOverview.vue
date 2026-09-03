<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useListingStore } from '@/stores/listing'

import { getCropImage, getAvatarImage, EMPTY_STATE_IMAGE } from '@/utils/imageHelper'

const auth = useAuthStore()
const listingStore = useListingStore()
const router = useRouter()

const loading = ref(true)

onMounted(async () => {
  await listingStore.fetchMyListings()
  loading.value = false
})

const activeListings = computed(() => {
  return listingStore.myListings.filter(l => l.quantity_available > 0)
})

const totalReserved = computed(() => {
  return listingStore.myListings.reduce((sum, l) => sum + (l.quantity_reserved || 0), 0)
})

const totalInventoryValuation = computed(() => {
  return listingStore.myListings.reduce((sum, l) => sum + (Number(l.price_per_unit || 0) * Number(l.quantity_available || 0)), 0)
})

function formatPrice(val) {
  if (val === undefined || val === null) return '0'
  const num = Number(val)
  return num % 1 === 0 ? num.toLocaleString('en-US') : num.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="farmer-dash">
    
    <!-- Executive Hero Header -->
    <header class="farmer-hero">
      <div class="farmer-hero__inner">
        <div class="farmer-hero__content">
          <div class="status-pill">
            <span class="pulse-dot"></span>
            Certified Farmer Supplier
          </div>
          <h1 class="hero-title">
            <img :src="getAvatarImage('farmer')" class="farmer-title-avatar" /> Welcome, {{ auth.user?.first_name }} {{ auth.user?.second_name }}
          </h1>
          <p class="hero-sub">
            Ethiopian Produce Exchange Command Center • Manage crops, track reserved stocks & process fulfillments.
          </p>
        </div>

        <div class="hero-actions">
          <router-link to="/farmer/listings" class="action-btn action-btn--gold">
            + Publish New Crop
          </router-link>
          <router-link to="/farmer/fulfillments" class="action-btn action-btn--glass">
            Fulfillment Orders
          </router-link>
          <router-link to="/listings" class="action-btn action-btn--glass">
            Produce Exchange
          </router-link>
        </div>
      </div>
    </header>

    <!-- KPI Grid -->
    <div class="kpi-grid">
      
      <div class="kpi-card">
        <div class="kpi-card__header">
          <img src="/images/wheat_produce.jpg" class="kpi-img-icon crop-circle" alt="Active Stock" />
          <span class="kpi-badge kpi-badge--emerald">Active Stock</span>
        </div>
        <div class="kpi-val">{{ activeListings.length }}</div>
        <div class="kpi-lbl">Active Published Crops</div>
        <div class="kpi-sub">Out of {{ listingStore.myListings.length }} total listings</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card__header">
          <img src="/images/seeds_produce.svg" class="kpi-img-icon" alt="Reserved" />
          <span class="kpi-badge kpi-badge--amber">Buyer Reserved</span>
        </div>
        <div class="kpi-val">{{ totalReserved }}</div>
        <div class="kpi-lbl">Units Reserved in Orders</div>
        <div class="kpi-sub">Pending harvest & dispatch</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card__header">
          <img src="/images/coffee_produce.jpg" class="kpi-img-icon crop-circle" alt="Valuation" />
          <span class="kpi-badge kpi-badge--gold">Valuation</span>
        </div>
        <div class="kpi-val">{{ formatPrice(totalInventoryValuation) }} <span class="currency">ETB</span></div>
        <div class="kpi-lbl">Available Stock Value</div>
        <div class="kpi-sub">Current produce listing pool</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card__header">
          <img :src="getAvatarImage('farmer')" class="kpi-img-icon avatar-circle" alt="Portal Access" />
          <span class="kpi-badge kpi-badge--emerald">Portal Access</span>
        </div>
        <div class="kpi-val">Approved</div>
        <div class="kpi-lbl">Verified Supplier Capability</div>
        <div class="kpi-sub">B2B Wholesale Privileges</div>
      </div>

    </div>

    <!-- Main Content Section: Active Crops Table & Quick Actions -->
    <div class="dash-grid">
      
      <!-- Left Column: Active Crops Table -->
      <div class="content-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">My Published Harvest & Produce</h2>
            <p class="card-sub">Live inventory listed on the Ethiopian Agricultural Exchange</p>
          </div>
          <router-link to="/farmer/listings" class="link-btn">
            Manage All ({{ listingStore.myListings.length }}) →
          </router-link>
        </div>

        <div v-if="loading" class="state-box">
          Loading your crop inventory...
        </div>

        <div v-else-if="listingStore.myListings.length === 0" class="empty-state">
          <img :src="EMPTY_STATE_IMAGE" class="empty-farmer-img" alt="No crops" />
          <h3>No crop listings published yet</h3>
          <p>Publish your harvest now to reach verified wholesale business buyers across Ethiopia.</p>
          <router-link to="/farmer/listings" class="action-btn action-btn--gold mt-3">
            + Publish Produce Listing
          </router-link>
        </div>

        <div v-else class="table-wrap">
          <table class="produce-table">
            <thead>
              <tr>
                <th>Crop / Variety</th>
                <th>Category</th>
                <th>Price / Unit</th>
                <th>Available</th>
                <th>Reserved</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in listingStore.myListings.slice(0, 5)" :key="item.id">
                <td>
                  <div class="produce-name">{{ item.title }}</div>
                </td>
                <td>
                  <span class="cat-tag">{{ item.category?.name || 'Produce' }}</span>
                </td>
                <td class="price-col">
                  <strong>{{ formatPrice(item.price_per_unit) }}</strong>
                  <span class="unit-text">ETB / {{ item.unit }}</span>
                </td>
                <td>
                  <span class="qty-badge">{{ item.quantity_available }} {{ item.unit }}s</span>
                </td>
                <td>
                  <span :class="item.quantity_reserved > 0 ? 'reserved-badge' : 'text-muted'">
                    {{ item.quantity_reserved || 0 }} {{ item.unit }}s
                  </span>
                </td>
                <td>
                  <span class="status-pill-table" :class="`status--${item.status || 'active'}`">
                    {{ (item.status || 'active').toUpperCase() }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right Column: Quick Fulfillments & Guidelines -->
      <div class="side-panel">
        
        <div class="content-card">
          <div class="card-header">
            <h2 class="card-title">Fulfillment Orders</h2>
          </div>
          <p class="panel-desc">
            When business buyers place wholesale orders containing your crops, fulfillment order tasks appear here for packing & shipping.
          </p>
          <router-link to="/farmer/fulfillments" class="action-btn action-btn--emerald w-full">
            Open Fulfillment Queue →
          </router-link>
        </div>

        <div class="content-card card--accent">
          <h3 class="panel-title">Supplier Best Practices</h3>
          <ul class="tips-list">
            <li><strong>Keep Stock Updated:</strong> Regularly update quantities after harvesting or off-platform sales.</li>
            <li><strong>Batch Quality:</strong> Specify grade and moisture content in descriptions to command higher ETB rates.</li>
            <li><strong>Prompt Dispatch:</strong> Process reserved order items quickly to maintain top supplier rating.</li>
          </ul>
        </div>

      </div>

    </div>

  </div>
</template>

<style scoped>
.farmer-dash {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Hero Header */
.farmer-hero {
  background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  padding: 1.75rem 2rem;
  color: #ffffff;
  box-shadow: var(--shadow-md);
}

.farmer-hero__inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(16, 185, 129, 0.18);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 8px #34d399;
}

.hero-title {
  font-size: 1.6rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
  letter-spacing: -0.02em;
}

.hero-sub {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem 1.15rem;
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn--gold {
  background: var(--brand-gold);
  color: #0f172a;
}
.action-btn--gold:hover {
  background: var(--brand-gold-dark);
}

.action-btn--emerald {
  background: var(--brand-green);
  color: #ffffff;
}
.action-btn--emerald:hover {
  background: var(--brand-green-dark);
}

.action-btn--glass {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.action-btn--glass:hover {
  background: rgba(255, 255, 255, 0.22);
}

.w-full { width: 100%; }
.mt-3 { margin-top: 0.75rem; }

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.15rem;
}

.kpi-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  box-shadow: var(--shadow-xs);
}

.kpi-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.kpi-icon { font-size: 1.4rem; }

.kpi-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
}
.kpi-badge--emerald { background: var(--brand-green-light); color: var(--brand-green-dark); }
.kpi-badge--amber   { background: var(--brand-gold-light); color: var(--brand-gold-dark); }
.kpi-badge--gold    { background: #fef3c7; color: #92400e; }

.kpi-val {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.currency {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--brand-green);
}

.kpi-lbl {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: 0.35rem;
}

.kpi-sub {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.15rem;
}

/* Layout Grid */
.dash-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.25rem;
}

@media (max-width: 960px) {
  .dash-grid { grid-template-columns: 1fr; }
}

.content-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  box-shadow: var(--shadow-xs);
}

.card--accent {
  background: var(--surface-alt);
  border-color: var(--border);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
}

.card-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
}

.card-sub {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.1rem;
}

.link-btn {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--brand-green);
  text-decoration: none;
}
.link-btn:hover { text-decoration: underline; }

.state-box, .empty-state {
  padding: 3rem 1.5rem;
  text-align: center;
  color: var(--text-secondary);
}

.empty-icon { font-size: 3rem; display: block; margin-bottom: 0.75rem; }

/* Table */
.table-wrap { overflow-x: auto; }
.produce-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; }
.produce-table th {
  padding: 0.65rem 0.85rem;
  background: var(--surface-alt);
  font-weight: 700;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
}
.produce-table td {
  padding: 0.75rem 0.85rem;
  border-bottom: 1px solid var(--border-subtle);
  vertical-align: middle;
}

.produce-name { font-weight: 700; color: var(--text-primary); }

.cat-tag {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-xs);
  background: var(--surface-alt);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.price-col strong { color: var(--brand-green); font-size: 0.95rem; }
.unit-text { font-size: 0.75rem; color: var(--text-secondary); margin-left: 0.2rem; }

.qty-badge { font-weight: 700; color: var(--text-primary); }

.reserved-badge {
  font-weight: 700;
  color: var(--brand-gold-dark);
  background: var(--brand-gold-light);
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.text-muted { color: var(--text-muted); }

.status-pill-table {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
}
.status--active { background: var(--brand-green-light); color: var(--brand-green-dark); }
.status--sold_out { background: var(--error-bg); color: var(--error); }
.status--inactive { background: var(--surface-alt); color: var(--text-muted); }

/* Side Panel */
.side-panel { display: flex; flex-direction: column; gap: 1.25rem; }

.panel-desc {
  font-size: 0.825rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.panel-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.tips-list {
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.45;
}
.tips-list strong { color: var(--text-primary); }

/* Image Styling */
.farmer-title-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-right: 0.35rem; border: 1px solid rgba(255,255,255,0.4); }
.kpi-img-icon { width: 28px; height: 28px; object-fit: contain; }
.kpi-img-icon.crop-circle { border-radius: 50%; object-fit: cover; }
.kpi-img-icon.avatar-circle { border-radius: 50%; object-fit: cover; }
.empty-farmer-img { width: 100px; height: 85px; margin: 0 auto 0.5rem; display: block; }
</style>
