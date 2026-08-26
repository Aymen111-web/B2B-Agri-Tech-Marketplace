<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useListingStore } from '@/stores/listing'

const auth = useAuthStore()
const listingStore = useListingStore()
const router = useRouter()

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const selectedListing = ref(null)

const form = ref({
  category_id: '',
  title: '',
  description: '',
  unit: 'kg',
  price_per_unit: '',
  quantity_available: '',
})

const editForm = ref({
  id: null,
  category_id: '',
  title: '',
  description: '',
  unit: 'kg',
  price_per_unit: '',
  quantity_available: '',
  status: 'active',
})

const submitting = ref(false)
const bannerSuccess = ref('')
const bannerError = ref('')

const isFarmerApproved = computed(() => {
  return auth.user?.capabilities?.some(c => c.capability_type === 'farmer' && c.status === 'active')
})

onMounted(async () => {
  if (!auth.isAuthenticated) {
    router.push('/login')
    return
  }
  if (!isFarmerApproved.value && !auth.isAdmin) {
    router.push('/capabilities/apply')
    return
  }
  await listingStore.fetchCategories()
  await loadMyListings()
})

async function loadMyListings() {
  await listingStore.fetchMyListings()
}

function openCreateModal() {
  bannerSuccess.value = ''
  bannerError.value = ''
  form.value = {
    category_id: listingStore.categories[0]?.id || '',
    title: '',
    description: '',
    unit: 'kg',
    price_per_unit: '',
    quantity_available: '',
  }
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
}

async function handleCreateSubmit() {
  if (!form.value.title || !form.value.price_per_unit || !form.value.quantity_available) {
    alert('Please fill in produce title, price, and available stock.')
    return
  }

  submitting.value = true
  bannerSuccess.value = ''
  bannerError.value = ''

  try {
    const payload = {
      category_id: form.value.category_id ? Number(form.value.category_id) : null,
      title: form.value.title,
      description: form.value.description,
      unit: form.value.unit,
      price_per_unit: Number(form.value.price_per_unit),
      quantity_available: Number(form.value.quantity_available),
    }
    const res = await listingStore.createListing(payload)
    bannerSuccess.value = res.message || 'Produce listing published successfully!'
    closeCreateModal()
    await loadMyListings()
  } catch (err) {
    bannerError.value = listingStore.error || 'Failed to publish produce listing.'
  } finally {
    submitting.value = false
  }
}

function openEditModal(item) {
  selectedListing.value = item
  bannerSuccess.value = ''
  bannerError.value = ''
  editForm.value = {
    id: item.id,
    category_id: item.category_id || '',
    title: item.title,
    description: item.description || '',
    unit: item.unit,
    price_per_unit: item.price_per_unit,
    quantity_available: item.quantity_available,
    status: item.status || 'active',
  }
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  selectedListing.value = null
}

async function handleEditSubmit() {
  submitting.value = true
  bannerSuccess.value = ''
  bannerError.value = ''

  try {
    const payload = {
      category_id: editForm.value.category_id ? Number(editForm.value.category_id) : null,
      title: editForm.value.title,
      description: editForm.value.description,
      unit: editForm.value.unit,
      price_per_unit: Number(editForm.value.price_per_unit),
      quantity_available: Number(editForm.value.quantity_available),
      status: editForm.value.status,
    }

    const res = await listingStore.updateListing(editForm.value.id, payload)
    bannerSuccess.value = res.message || 'Produce listing updated successfully.'
    closeEditModal()
    await loadMyListings()
  } catch (err) {
    bannerError.value = listingStore.error || 'Failed to update produce listing.'
  } finally {
    submitting.value = false
  }
}

async function handleDelete(item) {
  if (item.quantity_reserved > 0) {
    alert(`Cannot delete '${item.title}' while ${item.quantity_reserved} units are reserved for pending buyer orders.`)
    return
  }

  if (!confirm(`Are you sure you want to remove '${item.title}' from your listings?`)) {
    return
  }

  bannerSuccess.value = ''
  bannerError.value = ''
  try {
    const res = await listingStore.deleteListing(item.id)
    bannerSuccess.value = res.message || 'Listing removed successfully.'
    await loadMyListings()
  } catch (err) {
    bannerError.value = listingStore.error || 'Failed to delete produce listing.'
  }
}

function formatPrice(val) {
  if (val === undefined || val === null) return '0'
  const num = Number(val)
  return num % 1 === 0 ? num.toLocaleString('en-US') : num.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
import ThemeToggle from '@/components/ThemeToggle.vue'

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="farmer-view">
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
          <router-link to="/listings" class="top-nav__link">
            Marketplace
          </router-link>
          <router-link to="/farmer/listings" class="top-nav__link active">
            Crop Listings
          </router-link>
          <router-link to="/farmer/fulfillments" class="top-nav__link">
            Fulfillments
          </router-link>
          <router-link to="/capabilities/apply" class="top-nav__link">
            Capabilities
          </router-link>
          <ThemeToggle />
          <span class="user-pill">
            👨‍🌾 {{ auth.user?.first_name }}
          </span>
          <button @click="handleLogout" class="top-nav__logout">
            Sign Out
          </button>
        </div>
      </div>
    </nav>

    <!-- Page Hero Header -->
    <header class="farmer-header">
      <div class="farmer-header__inner">
        <div class="header-flex">
          <div>
            <h1 class="farmer-title">🌾 Crop Inventory Management</h1>
            <p class="farmer-sub">
              Manage your harvest listings, adjust ETB rates per unit, and monitor stock availability.
            </p>
          </div>
          <div class="header-actions">
            <router-link to="/farmer/fulfillments" class="btn-fulfillment">
              🚜 Fulfillment Orders
            </router-link>
            <button class="btn-create" @click="openCreateModal">
              + Publish New Produce
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="farmer-main">
      <div class="farmer-container">

        <!-- Banners -->
        <div v-if="bannerSuccess" class="banner banner--success">
          ✅ {{ bannerSuccess }}
        </div>
        <div v-if="bannerError" class="banner banner--error">
          ⚠️ {{ bannerError }}
        </div>

        <!-- Summary Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-icon">📦</span>
            <div>
              <span class="stat-val">{{ listingStore.myListings.length }}</span>
              <span class="stat-lbl">Total Produce Listings</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🌱</span>
            <div>
              <span class="stat-val">
                {{ listingStore.myListings.filter(l => l.quantity_available > 0).length }}
              </span>
              <span class="stat-lbl">Active In Stock</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🔒</span>
            <div>
              <span class="stat-val">
                {{ listingStore.myListings.reduce((sum, l) => sum + (l.quantity_reserved || 0), 0) }}
              </span>
              <span class="stat-lbl">Units Reserved in Orders</span>
            </div>
          </div>
        </div>

        <!-- Listings Table -->
        <div class="table-card">
          <div class="table-header">
            <h2 class="card-title">My Published Crops & Produce</h2>
          </div>

          <div v-if="listingStore.loading" class="state-msg">
            Loading your produce listings...
          </div>

          <div v-else-if="listingStore.myListings.length === 0" class="empty-box">
            <div class="empty-icon">🌾</div>
            <h3>No produce listings yet</h3>
            <p>Click <strong>+ Publish New Produce</strong> above to list your harvest on the platform marketplace.</p>
          </div>

          <div v-else class="table-wrap">
            <table class="farmer-table">
              <thead>
                <tr>
                  <th>Produce & Category</th>
                  <th>Unit Price (ETB)</th>
                  <th>Available Stock</th>
                  <th>Reserved Stock</th>
                  <th>Published Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in listingStore.myListings" :key="item.id">
                  <td>
                    <div class="produce-info">
                      <span class="item-title">{{ item.title }}</span>
                      <span class="item-cat">{{ item.category?.name || 'Produce' }}</span>
                    </div>
                  </td>
                  <td class="price-cell">
                    <strong>{{ formatPrice(item.price_per_unit) }} ETB</strong>
                    <span class="unit-sub">/ {{ item.unit }}</span>
                  </td>
                  <td>
                    <strong>{{ item.quantity_available }}</strong> {{ item.unit }}s
                  </td>
                  <td>
                    <span :class="item.quantity_reserved > 0 ? 'text-warn font-semibold' : 'text-muted'">
                      {{ item.quantity_reserved || 0 }} {{ item.unit }}s
                    </span>
                  </td>
                  <td class="date-cell">{{ formatDate(item.created_at) }}</td>
                  <td>
                    <span class="status-badge" :class="`status-badge--${item.status || 'active'}`">
                      {{ (item.status || 'active').toUpperCase() }}
                    </span>
                  </td>
                  <td>
                    <div class="action-btns">
                      <button class="btn-action btn-edit" @click="openEditModal(item)">
                        Edit Rate / Stock
                      </button>
                      <button class="btn-action btn-delete" @click="handleDelete(item)">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal-card">
        <h3 class="modal-title">Publish New Produce Listing</h3>
        <p class="modal-sub">Fill in your crop details to list it on the Ethiopian Farmers Marketplace.</p>

        <form @submit.prevent="handleCreateSubmit" class="modal-form">
          <div class="form-group">
            <label for="create-cat">Produce Category *</label>
            <select id="create-cat" v-model="form.category_id" required>
              <option v-for="cat in listingStore.categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="create-title">Produce Title / Variety *</label>
            <input
              id="create-title"
              type="text"
              v-model="form.title"
              placeholder="e.g. White Teff - Grade A"
              required
            />
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label for="create-unit">Measurement Unit *</label>
              <select id="create-unit" v-model="form.unit" required>
                <option value="kg">kilograms (kg)</option>
                <option value="quintal">quintals (100 kg)</option>
                <option value="litre">litres (L)</option>
                <option value="crate">crates</option>
                <option value="ton">tons</option>
              </select>
            </div>

            <div class="form-group">
              <label for="create-price">Price per Unit (ETB) *</label>
              <input
                id="create-price"
                type="number"
                step="0.01"
                min="0.1"
                v-model="form.price_per_unit"
                placeholder="e.g. 4800.00"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="create-qty">Available Stock Quantity *</label>
            <input
              id="create-qty"
              type="number"
              min="1"
              v-model="form.quantity_available"
              placeholder="e.g. 50"
              required
            />
          </div>

          <div class="form-group">
            <label for="create-desc">Description / Quality Notes</label>
            <textarea
              id="create-desc"
              rows="3"
              v-model="form.description"
              placeholder="Describe harvest region, organic status, moisture level, etc."
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeCreateModal">Cancel</button>
            <button type="submit" class="btn-submit" :disabled="submitting">
              {{ submitting ? 'Publishing...' : 'Publish Produce Listing' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-card">
        <h3 class="modal-title">Edit Produce Listing</h3>
        <p class="modal-sub">
          Updating price will automatically record a new entry in your price history timeline.
        </p>

        <form @submit.prevent="handleEditSubmit" class="modal-form">
          <div class="form-group">
            <label for="edit-title">Produce Title *</label>
            <input id="edit-title" type="text" v-model="editForm.title" required />
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label for="edit-price">Price per Unit (ETB) *</label>
              <input
                id="edit-price"
                type="number"
                step="0.01"
                min="0.1"
                v-model="editForm.price_per_unit"
                required
              />
            </div>

            <div class="form-group">
              <label for="edit-qty">Available Stock Quantity *</label>
              <input
                id="edit-qty"
                type="number"
                min="0"
                v-model="editForm.quantity_available"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="edit-status">Status</label>
            <select id="edit-status" v-model="editForm.status">
              <option value="active">Active (Available for Buyers)</option>
              <option value="inactive">Inactive (Hidden)</option>
              <option value="sold_out">Sold Out</option>
            </select>
          </div>

          <div class="form-group">
            <label for="edit-desc">Description</label>
            <textarea id="edit-desc" rows="3" v-model="editForm.description"></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeEditModal">Cancel</button>
            <button type="submit" class="btn-submit" :disabled="submitting">
              {{ submitting ? 'Saving Changes...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<style scoped>
.farmer-view { min-height: 100vh; background: var(--surface-alt); padding-bottom: 4rem; }

.top-nav {
  background: #064e3b;
  padding: 0 1.5rem;
  box-shadow: var(--shadow-xs);
}
.top-nav__inner {
  max-width: 1200px; margin: 0 auto; height: 60px;
  display: flex; align-items: center; justify-content: space-between;
}
.top-nav__brand { color: #fff; font-size: 1.15rem; font-weight: 700; text-decoration: none; }
.top-nav__brand strong { color: var(--brand-gold); }
.top-nav__right { display: flex; align-items: center; gap: 0.85rem; }
.top-nav__link {
  color: rgba(255,255,255,0.88) !important;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-xs);
  transition: all 0.15s ease;
}
.top-nav__link.active {
  background: rgba(255,255,255,0.18) !important;
  color: #ffffff !important;
}
.user-pill {
  color: rgba(255,255,255,0.88);
  font-size: 0.825rem;
  font-weight: 600;
}
.top-nav__logout {
  background: rgba(255,255,255,0.12); color: #fff; border: 1px solid rgba(255,255,255,0.2);
  border-radius: var(--radius-xs); padding: 0.35rem 0.85rem; font-size: 0.8125rem; font-weight: 600;
  cursor: pointer;
}

.farmer-header {
  background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
  color: #fff;
  padding: 1.75rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.farmer-header__inner { max-width: 1200px; margin: 0 auto; }
.header-flex { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
.farmer-title { font-size: 1.5rem; font-weight: 800; }
.farmer-sub { color: rgba(255,255,255,0.82); font-size: 0.875rem; margin-top: 0.2rem; }

.header-actions { display: flex; gap: 0.75rem; align-items: center; }
.btn-fulfillment {
  background: rgba(255, 255, 255, 0.2); color: #fff; border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 700; font-size: 0.95rem; text-decoration: none;
  display: inline-flex; align-items: center; transition: background 0.2s;
}
.btn-fulfillment:hover { background: rgba(255, 255, 255, 0.3); }

.btn-create {
  background: var(--brand-gold); color: #1e293b; border: none;
  padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 700; font-size: 0.95rem; cursor: pointer;
}

.farmer-main { padding: 2rem 1.5rem 0; }
.farmer-container { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.75rem; }

.banner { padding: 0.9rem 1.25rem; border-radius: 8px; font-size: 0.95rem; font-weight: 500; }
.banner--success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
.banner--error   { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
@media (max-width: 700px) { .stats-grid { grid-template-columns: 1fr; } }

.stat-card {
  background: #fff; border: 1px solid var(--border); border-radius: 8px;
  padding: 1.25rem; display: flex; align-items: center; gap: 1rem;
}
.stat-icon { font-size: 2rem; }
.stat-val { display: block; font-size: 1.5rem; font-weight: 800; color: var(--brand-green); }
.stat-lbl { font-size: 0.825rem; color: var(--text-secondary); }

.table-card { background: #fff; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
.table-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); }
.card-title { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); }

.state-msg, .empty-box { padding: 4rem; text-align: center; color: var(--text-secondary); }
.empty-icon { font-size: 3.5rem; margin-bottom: 1rem; }

.table-wrap { overflow-x: auto; }
.farmer-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
.farmer-table th { background: #f8fafc; padding: 0.85rem 1rem; font-weight: 600; color: var(--text-secondary); border-bottom: 1px solid var(--border); }
.farmer-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }

.produce-info { display: flex; flex-direction: column; }
.item-title { font-weight: 700; color: var(--text-primary); }
.item-cat { font-size: 0.75rem; color: var(--text-secondary); }

.price-cell strong { color: var(--brand-green); font-size: 1rem; }
.unit-sub { font-size: 0.8rem; color: var(--text-secondary); }
.date-cell { font-size: 0.8rem; color: var(--text-secondary); }

.status-badge { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
.status-badge--active   { background: #dcfce7; color: #166534; }
.status-badge--inactive { background: #f1f5f9; color: #64748b; }
.status-badge--sold_out { background: #fee2e2; color: #991b1b; }

.action-btns { display: flex; gap: 0.5rem; }
.btn-action { padding: 0.4rem 0.75rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; border: none; }
.btn-edit { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
.btn-delete { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

.text-warn { color: #d97706; }
.text-muted { color: var(--text-secondary); }
.font-semibold { font-weight: 600; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; padding: 1.5rem; z-index: 1000; }
.modal-card { background: #fff; border-radius: 12px; padding: 1.75rem; max-width: 550px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
.modal-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.4rem; }
.modal-sub { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem; }

.modal-form { display: flex; flex-direction: column; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
.form-group label { font-size: 0.825rem; font-weight: 600; color: var(--text-primary); }
.form-group input, .form-group select, .form-group textarea {
  padding: 0.65rem 0.85rem; border: 1px solid var(--border); border-radius: 6px; font-size: 0.9rem; outline: none;
}
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }
.btn-cancel { padding: 0.6rem 1.2rem; border: 1px solid var(--border); border-radius: 6px; background: #fff; font-weight: 600; cursor: pointer; }
.btn-submit { padding: 0.6rem 1.25rem; border: none; border-radius: 6px; background: var(--brand-green); color: #fff; font-weight: 600; cursor: pointer; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
