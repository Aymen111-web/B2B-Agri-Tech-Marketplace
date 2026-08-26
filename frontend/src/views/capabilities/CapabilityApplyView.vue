<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCapabilityStore } from '@/stores/capability'
import { useCartStore } from '@/stores/cart'

const auth = useAuthStore()
const capabilityStore = useCapabilityStore()
const cartStore = useCartStore()
const router = useRouter()

const selectedType = ref('farmer') // 'farmer' or 'buyer'

// Farmer application fields
const farmerForm = ref({
  farm_name: '',
  region: 'Oromia',
  location: '',
  farm_size_hectares: '',
  primary_crops: '',
  notes: '',
})

// Buyer application fields
const buyerForm = ref({
  business_name: '',
  business_type: 'restaurant',
  tin_number: '',
  city: '',
  address: '',
  notes: '',
})

const submitting = ref(false)
const successMessage = ref('')
const formError = ref('')

const activeCapabilities = computed(() => {
  const caps = auth.user?.capabilities || []
  return caps.filter(c => c.status === 'active').map(c => c.capability_type)
})

const hasFarmerCapability = computed(() => activeCapabilities.value.includes('farmer'))
const hasBuyerCapability = computed(() => activeCapabilities.value.includes('buyer'))

const pendingFarmerApplication = computed(() => {
  return capabilityStore.myApplications.find(a => a.capability_type === 'farmer' && a.status === 'pending')
})

const pendingBuyerApplication = computed(() => {
  return capabilityStore.myApplications.find(a => a.capability_type === 'buyer' && a.status === 'pending')
})

onMounted(async () => {
  await capabilityStore.fetchMyApplications()
  if (auth.isAuthenticated) {
    await cartStore.fetchCart()
  }
})

async function handleSubmit() {
  submitting.value = true
  successMessage.value = ''
  formError.value = ''

  try {
    let docs = {}
    if (selectedType.value === 'farmer') {
      if (!farmerForm.value.farm_name || !farmerForm.value.location) {
        formError.value = 'Please fill in all required farm fields.'
        submitting.value = false
        return
      }
      docs = { ...farmerForm.value }
    } else {
      if (!buyerForm.value.business_name || !buyerForm.value.tin_number) {
        formError.value = 'Please provide business name and TIN number.'
        submitting.value = false
        return
      }
      docs = { ...buyerForm.value }
    }

    await capabilityStore.submitApplication(selectedType.value, docs)
    successMessage.value = `Your ${selectedType.value === 'farmer' ? 'Farmer' : 'Business Buyer'} capability application has been submitted for admin review.`
    
    // Reset forms
    farmerForm.value = { farm_name: '', region: 'Oromia', location: '', farm_size_hectares: '', primary_crops: '', notes: '' }
    buyerForm.value = { business_name: '', business_type: 'restaurant', tin_number: '', city: '', address: '', notes: '' }
  } catch (err) {
    formError.value = capabilityStore.error || 'Failed to submit application.'
  } finally {
    submitting.value = false
  }
}

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
import ThemeToggle from '@/components/ThemeToggle.vue'
</script>

<template>
  <div class="cap-view">
    
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
          <router-link to="/cart" class="top-nav__link">
            🛒 Cart <span v-if="cartStore.itemCount > 0" class="cart-badge">{{ cartStore.itemCount }}</span>
          </router-link>
          <router-link v-if="auth.isAuthenticated" to="/orders" class="top-nav__link">
            My Orders
          </router-link>
          <router-link v-if="auth.isAuthenticated" to="/dashboard" class="top-nav__link">
            Dashboard
          </router-link>
          <ThemeToggle />
          <button v-if="auth.isAuthenticated" @click="handleLogout" class="top-nav__logout">
            Sign Out
          </button>
          <router-link v-else to="/login" class="top-nav__btn">
            Sign In
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Page Header -->
    <header class="cap-header">
      <div class="cap-header__inner">
        <div class="hero-header-flex">
          <div>
            <h1 class="hero-title">Marketplace Capabilities</h1>
            <p class="hero-sub">Apply for Farmer or Business Buyer capabilities to trade on the B2B Produce Exchange</p>
          </div>
          <div class="trust-chips">
            <span class="chip">🌾 Direct Wholesale</span>
            <span class="chip">🏬 Commercial Buyer</span>
            <span class="chip">⚡ Quick Admin Review</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="cap-main">
      <div class="cap-container">

        <!-- Active Status Summary -->
        <div class="status-card">
          <h2 class="section-title">Your Current Status</h2>
          <div class="status-badges">
            <div class="badge-item" :class="{ 'badge-item--active': hasFarmerCapability }">
              <span class="badge-icon">🌾</span>
              <div class="badge-info">
                <span class="badge-label">Farmer Capability</span>
                <span class="badge-status">{{ hasFarmerCapability ? 'Active & Approved' : 'Not Granted' }}</span>
              </div>
            </div>

            <div class="badge-item" :class="{ 'badge-item--active': hasBuyerCapability }">
              <span class="badge-icon">🏬</span>
              <div class="badge-info">
                <span class="badge-label">Business Buyer Capability</span>
                <span class="badge-status">{{ hasBuyerCapability ? 'Active & Approved' : 'Not Granted' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Application Form Card -->
        <div class="form-card">
          <h2 class="section-title">Apply for Capability</h2>

          <!-- Type Selector -->
          <div class="type-selector">
            <button
              class="type-btn"
              :class="{ active: selectedType === 'farmer' }"
              @click="selectedType = 'farmer'"
            >
              🌾 Apply as Farmer
            </button>
            <button
              class="type-btn"
              :class="{ active: selectedType === 'buyer' }"
              @click="selectedType = 'buyer'"
            >
              🏬 Apply as Business Buyer
            </button>
          </div>

          <!-- Alert Banners -->
          <div v-if="successMessage" class="alert alert-success">
            ✅ {{ successMessage }}
          </div>
          <div v-if="formError" class="alert alert-error">
            ⚠️ {{ formError }}
          </div>

          <!-- Active Info Banners -->
          <div v-if="selectedType === 'farmer' && hasFarmerCapability" class="alert alert-info">
            ℹ️ You already have an active Farmer capability.
          </div>
          <div v-else-if="selectedType === 'buyer' && hasBuyerCapability" class="alert alert-info">
            ℹ️ You already have an active Business Buyer capability.
          </div>

          <!-- Pending Info Banners -->
          <div v-else-if="selectedType === 'farmer' && pendingFarmerApplication" class="alert alert-warning">
            ⏳ You have a pending Farmer capability application awaiting admin review.
          </div>
          <div v-else-if="selectedType === 'buyer' && pendingBuyerApplication" class="alert alert-warning">
            ⏳ You have a pending Business Buyer capability application awaiting admin review.
          </div>

          <!-- Farmer Form -->
          <form
            v-else-if="selectedType === 'farmer'"
            @submit.prevent="handleSubmit"
            class="app-form"
          >
            <div class="form-grid">
              <div class="form-group">
                <label for="farm-name">Farm / Enterprise Name *</label>
                <input
                  id="farm-name"
                  type="text"
                  v-model="farmerForm.farm_name"
                  placeholder="e.g. Abyssinia Organic Farm"
                  required
                />
              </div>

              <div class="form-group">
                <label for="farm-region">Region *</label>
                <select id="farm-region" v-model="farmerForm.region" required>
                  <option value="Oromia">Oromia</option>
                  <option value="Amhara">Amhara</option>
                  <option value="SNNPR">SNNPR</option>
                  <option value="Sidama">Sidama</option>
                  <option value="Tigray">Tigray</option>
                  <option value="Afar">Afar</option>
                  <option value="Somali">Somali</option>
                  <option value="Benishangul-Gumuz">Benishangul-Gumuz</option>
                  <option value="Gambela">Gambela</option>
                  <option value="Harari">Harari</option>
                  <option value="Addis Ababa">Addis Ababa</option>
                  <option value="Dire Dawa">Dire Dawa</option>
                </select>
              </div>

              <div class="form-group">
                <label for="farm-location">Woreda / Location *</label>
                <input
                  id="farm-location"
                  type="text"
                  v-model="farmerForm.location"
                  placeholder="e.g. Bishoftu, East Shewa"
                  required
                />
              </div>

              <div class="form-group">
                <label for="farm-size">Farm Size (Hectares)</label>
                <input
                  id="farm-size"
                  type="number"
                  step="0.1"
                  v-model="farmerForm.farm_size_hectares"
                  placeholder="e.g. 5.5"
                />
              </div>

              <div class="form-group form-group--full">
                <label for="farm-crops">Primary Crops</label>
                <input
                  id="farm-crops"
                  type="text"
                  v-model="farmerForm.primary_crops"
                  placeholder="e.g. Teff, Wheat, Coffee, Tomatoes"
                />
              </div>

              <div class="form-group form-group--full">
                <label for="farm-notes">Additional Verification Notes</label>
                <textarea
                  id="farm-notes"
                  rows="2"
                  v-model="farmerForm.notes"
                  placeholder="Provide details to help verify your farm operation..."
                ></textarea>
              </div>
            </div>

            <button type="submit" class="submit-btn" :disabled="submitting">
              {{ submitting ? 'Submitting Application...' : 'Submit Farmer Application' }}
            </button>
          </form>

          <!-- Buyer Form -->
          <form
            v-else-if="selectedType === 'buyer'"
            @submit.prevent="handleSubmit"
            class="app-form"
          >
            <div class="form-grid">
              <div class="form-group">
                <label for="buyer-name">Company / Business Name *</label>
                <input
                  id="buyer-name"
                  type="text"
                  v-model="buyerForm.business_name"
                  placeholder="e.g. Rift Valley Hotel & Restaurant"
                  required
                />
              </div>

              <div class="form-group">
                <label for="buyer-type">Business Category *</label>
                <select id="buyer-type" v-model="buyerForm.business_type" required>
                  <option value="restaurant">Restaurant / Eatery</option>
                  <option value="hotel">Hotel / Hospitality</option>
                  <option value="wholesaler">Wholesaler / Distributor</option>
                  <option value="processor">Food Processor</option>
                  <option value="exporter">Agricultural Exporter</option>
                  <option value="retailer">Supermarket / Retailer</option>
                  <option value="institution">Institutional Buyer</option>
                </select>
              </div>

              <div class="form-group">
                <label for="buyer-tin">Tax Identification Number (TIN) *</label>
                <input
                  id="buyer-tin"
                  type="text"
                  v-model="buyerForm.tin_number"
                  placeholder="e.g. 0012345678"
                  required
                />
              </div>

              <div class="form-group">
                <label for="buyer-city">City / Region *</label>
                <input
                  id="buyer-city"
                  type="text"
                  v-model="buyerForm.city"
                  placeholder="e.g. Addis Ababa"
                  required
                />
              </div>

              <div class="form-group form-group--full">
                <label for="buyer-address">Business Address</label>
                <input
                  id="buyer-address"
                  type="text"
                  v-model="buyerForm.address"
                  placeholder="e.g. Bole Sub-city, Woreda 03"
                />
              </div>

              <div class="form-group form-group--full">
                <label for="buyer-notes">Purchase Volume & Notes</label>
                <textarea
                  id="buyer-notes"
                  rows="2"
                  v-model="buyerForm.notes"
                  placeholder="Describe your expected weekly or monthly purchase needs..."
                ></textarea>
              </div>
            </div>

            <button type="submit" class="submit-btn" :disabled="submitting">
              {{ submitting ? 'Submitting Application...' : 'Submit Buyer Application' }}
            </button>
          </form>

        </div>

        <!-- Past Applications History -->
        <div class="history-card">
          <h2 class="section-title">Application History</h2>

          <div v-if="capabilityStore.loading" class="state-box">
            <div class="spinner"></div>
            <p class="state-title">Loading applications...</p>
          </div>

          <div v-else-if="capabilityStore.myApplications.length === 0" class="state-box empty-state">
            <div class="empty-icon">📜</div>
            <h3 class="state-title">No applications submitted</h3>
            <p class="state-sub">You have not applied for any trading capabilities yet.</p>
          </div>

          <div v-else class="app-list">
            <div
              v-for="app in capabilityStore.myApplications"
              :key="app.id"
              class="app-item"
            >
              <div class="app-item__main">
                <div class="app-item__type">
                  <span class="app-item__icon">{{ app.capability_type === 'farmer' ? '🌾' : '🏬' }}</span>
                  <div>
                    <span class="app-item__title">
                      {{ app.capability_type === 'farmer' ? 'Farmer Capability' : 'Business Buyer Capability' }}
                    </span>
                    <span class="app-item__date">Submitted {{ formatDate(app.created_at) }}</span>
                  </div>
                </div>

                <span class="status-badge" :class="`badge--${app.status}`">
                  {{ app.status.toUpperCase() }}
                </span>
              </div>

              <div v-if="app.status === 'rejected' && app.rejection_reason" class="rejection-box">
                <strong>Rejection Reason:</strong> {{ app.rejection_reason }}
              </div>

              <div v-if="app.supporting_documents" class="doc-details">
                <div v-for="(val, key) in app.supporting_documents" :key="key" class="doc-chip">
                  <span class="doc-chip__key">{{ key.replace('_', ' ') }}:</span>
                  <span class="doc-chip__val">{{ val }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<style scoped>
.cap-view {
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
  max-width: 1000px;
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
.cap-header {
  background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%);
  color: #fff;
  padding: 1.5rem 1.5rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.cap-header__inner {
  max-width: 1000px;
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

/* Main Layout */
.cap-main { padding: 1.5rem 1.5rem 3.5rem; }
.cap-container { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.25rem; }

.status-card, .form-card, .history-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  box-shadow: var(--shadow-xs);
}

.section-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--border-subtle);
}

.status-badges { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; }
@media (max-width: 600px) { .status-badges { grid-template-columns: 1fr; } }

.badge-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
}
.badge-item--active {
  background: var(--brand-green-light);
  border-color: var(--brand-green-border);
}
.badge-icon { font-size: 1.5rem; }
.badge-info { display: flex; flex-direction: column; }
.badge-label { font-weight: 700; font-size: 0.875rem; color: var(--text-primary); }
.badge-status { font-size: 0.78125rem; color: var(--text-secondary); }
.badge-item--active .badge-status { color: var(--brand-green-dark); font-weight: 700; }

.type-selector { display: flex; gap: 0.6rem; margin-bottom: 1.15rem; }
.type-btn {
  flex: 1;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  background: var(--surface-alt);
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s ease;
}
.type-btn.active {
  border-color: var(--brand-green);
  background: var(--brand-green-light);
  color: var(--brand-green-dark);
}

.alert {
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-xs);
  font-size: 0.8125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
.alert-success { background: var(--brand-green-light); color: var(--brand-green-dark); border: 1px solid var(--brand-green-border); }
.alert-error   { background: var(--error-bg); color: var(--error-dark); border: 1px solid var(--error-border); }
.alert-info    { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.alert-warning { background: var(--brand-gold-light); color: var(--brand-gold-dark); border: 1px solid var(--brand-gold-border); }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
  margin-bottom: 1.15rem;
}
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }

.form-group { display: flex; flex-direction: column; gap: 0.3rem; }
.form-group--full { grid-column: 1 / -1; }
.form-group label { font-size: 0.78125rem; font-weight: 600; color: var(--text-primary); }
.form-group input, .form-group select, .form-group textarea {
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  font-size: 0.825rem;
  font-family: var(--font-sans);
  background: var(--surface);
  color: var(--text-primary);
  outline: none;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  border-color: var(--brand-green);
}

.submit-btn {
  width: 100%;
  padding: 0.65rem;
  background: var(--brand-green);
  color: #fff;
  border: none;
  border-radius: var(--radius-xs);
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.submit-btn:hover:not(:disabled) { background: var(--brand-green-dark); }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.state-box { padding: 2rem 1.5rem; text-align: center; }
.empty-icon { font-size: 2rem; margin-bottom: 0.35rem; }
.state-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
.state-sub { font-size: 0.78125rem; color: var(--text-secondary); margin-top: 0.15rem; }

.app-list { display: flex; flex-direction: column; gap: 0.75rem; }
.app-item {
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  padding: 0.85rem;
  background: var(--surface-alt);
}
.app-item__main { display: flex; justify-content: space-between; align-items: center; }
.app-item__type { display: flex; align-items: center; gap: 0.6rem; }
.app-item__icon { font-size: 1.25rem; }
.app-item__title { display: block; font-weight: 700; font-size: 0.875rem; color: var(--text-primary); }
.app-item__date { font-size: 0.75rem; color: var(--text-muted); }

.status-badge {
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}
.badge--pending  { background: var(--brand-gold-light); color: var(--brand-gold-dark); }
.badge--approved { background: var(--brand-green-light); color: var(--brand-green-dark); }
.badge--rejected { background: var(--error-bg); color: var(--error-dark); }

.rejection-box {
  margin-top: 0.6rem;
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  color: var(--error-dark);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-xs);
  font-size: 0.78125rem;
}

.doc-details {
  margin-top: 0.6rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.doc-chip {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  padding: 0.2rem 0.45rem;
  font-size: 0.75rem;
}
.doc-chip__key { font-weight: 600; color: var(--text-secondary); text-transform: capitalize; margin-right: 0.2rem; }
.doc-chip__val { color: var(--text-primary); }

.spinner {
  width: 28px; height: 28px;
  border: 3px solid var(--border);
  border-top-color: var(--brand-green); border-radius: 50%;
  animation: spin 0.8s linear infinite; margin: 0 auto 0.5rem;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
