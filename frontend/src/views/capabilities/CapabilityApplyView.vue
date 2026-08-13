<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCapabilityStore } from '@/stores/capability'

const auth = useAuthStore()
const capabilityStore = useCapabilityStore()
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
    successMessage.value = `Your ${selectedType.value === 'farmer' ? 'Farmer' : 'Business Buyer'} capability application has been submitted successfully for admin approval.`
    
    // Reset forms
    farmerForm.value = { farm_name: '', region: 'Oromia', location: '', farm_size_hectares: '', primary_crops: '', notes: '' }
    buyerForm.value = { business_name: '', business_type: 'restaurant', tin_number: '', city: '', address: '', notes: '' }
  } catch (err) {
    formError.value = capabilityStore.error || 'Failed to submit application.'
  } finally {
    submitting.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="cap-view">
    <!-- Header -->
    <header class="cap-header">
      <div class="cap-header__inner">
        <button class="back-btn" @click="router.push('/dashboard')">
          ← Back to Dashboard
        </button>
        <h1 class="cap-title">Marketplace Capability Applications</h1>
        <p class="cap-sub">
          Apply for Farmer or Business Buyer capabilities to start trading on the Ethiopian Farmers Market Platform.
        </p>
      </div>
    </header>

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

        <!-- Application Form -->
        <div class="form-card">
          <h2 class="section-title">Apply for a Capability</h2>

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

          <!-- Alert Messages -->
          <div v-if="successMessage" class="alert alert--success">
            ✅ {{ successMessage }}
          </div>
          <div v-if="formError" class="alert alert--error">
            ⚠️ {{ formError }}
          </div>

          <!-- Already Active Alert -->
          <div v-if="selectedType === 'farmer' && hasFarmerCapability" class="alert alert--info">
            ℹ️ You already have an active Farmer capability.
          </div>
          <div v-else-if="selectedType === 'buyer' && hasBuyerCapability" class="alert alert--info">
            ℹ️ You already have an active Business Buyer capability.
          </div>

          <!-- Pending Application Alert -->
          <div v-else-if="selectedType === 'farmer' && pendingFarmerApplication" class="alert alert--warning">
            ⏳ You have a pending Farmer capability application awaiting admin review.
          </div>
          <div v-else-if="selectedType === 'buyer' && pendingBuyerApplication" class="alert alert--warning">
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
                <label for="farm-location">Woreda / Town Location *</label>
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
                <label for="farm-crops">Primary Produce / Crops</label>
                <input
                  id="farm-crops"
                  type="text"
                  v-model="farmerForm.primary_crops"
                  placeholder="e.g. Tomatoes, Onions, Teff, Coffee, Avocado"
                />
              </div>

              <div class="form-group form-group--full">
                <label for="farm-notes">Additional Details / Cooperative Info</label>
                <textarea
                  id="farm-notes"
                  rows="3"
                  v-model="farmerForm.notes"
                  placeholder="Provide any additional details to verify your farm operation..."
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
                  <option value="institution">Institutional Buyer (School/Hospital)</option>
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
                  rows="3"
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

        <!-- Past Applications List -->
        <div class="history-card">
          <h2 class="section-title">Application History</h2>

          <div v-if="capabilityStore.loading" class="loading-state">
            Loading your applications...
          </div>

          <div v-else-if="capabilityStore.myApplications.length === 0" class="empty-state">
            You have not submitted any capability applications yet.
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
                    <span class="app-item__date">Submitted on {{ formatDate(app.created_at) }}</span>
                  </div>
                </div>

                <span class="status-tag" :class="`status-tag--${app.status}`">
                  {{ app.status.toUpperCase() }}
                </span>
              </div>

              <!-- Rejection Reason if rejected -->
              <div v-if="app.status === 'rejected' && app.rejection_reason" class="rejection-box">
                <strong>Rejection Reason:</strong> {{ app.rejection_reason }}
              </div>

              <!-- Application Details -->
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
  padding-bottom: 4rem;
}

.cap-header {
  background: var(--brand-green);
  color: #fff;
  padding: 2rem 1.5rem;
}
.cap-header__inner {
  max-width: 900px;
  margin: 0 auto;
}
.back-btn {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: background 0.2s;
}
.back-btn:hover { background: rgba(255, 255, 255, 0.25); }
.cap-title { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem; }
.cap-sub { color: rgba(255, 255, 255, 0.85); font-size: 0.95rem; }

.cap-main { padding: 2rem 1.5rem 0; }
.cap-container { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; }

.status-card, .form-card, .history-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.75rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--surface-alt);
}

.status-badges { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 600px) { .status-badges { grid-template-columns: 1fr; } }

.badge-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.badge-item--active {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.badge-icon { font-size: 1.75rem; }
.badge-info { display: flex; flex-direction: column; }
.badge-label { font-weight: 600; font-size: 0.95rem; color: var(--text-primary); }
.badge-status { font-size: 0.825rem; color: var(--text-secondary); }
.badge-item--active .badge-status { color: #166534; font-weight: 600; }

.type-selector { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.type-btn {
  flex: 1;
  padding: 0.8rem 1rem;
  border: 2px solid var(--border);
  border-radius: 8px;
  background: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}
.type-btn.active {
  border-color: var(--brand-green);
  background: #f0fdf4;
  color: var(--brand-green);
}

.alert {
  padding: 0.9rem 1.2rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}
.alert--success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
.alert--error   { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
.alert--info    { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
.alert--warning { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }

.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group--full { grid-column: 1 / -1; }
.form-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
.form-group input, .form-group select, .form-group textarea {
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  border-color: var(--brand-green);
}

.submit-btn {
  width: 100%;
  padding: 0.85rem;
  background: var(--brand-green);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.submit-btn:hover:not(:disabled) { background: #2d5a3f; }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.loading-state, .empty-state { text-align: center; color: var(--text-secondary); padding: 2rem; }

.app-list { display: flex; flex-direction: column; gap: 1rem; }
.app-item {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.25rem;
  background: #fafafa;
}
.app-item__main { display: flex; justify-content: space-between; align-items: center; }
.app-item__type { display: flex; align-items: center; gap: 0.8rem; }
.app-item__icon { font-size: 1.5rem; }
.app-item__title { display: block; font-weight: 600; font-size: 1rem; color: var(--text-primary); }
.app-item__date { font-size: 0.8rem; color: var(--text-secondary); }

.status-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}
.status-tag--pending  { background: #fef3c7; color: #92400e; }
.status-tag--approved { background: #dcfce7; color: #166534; }
.status-tag--rejected { background: #fee2e2; color: #991b1b; }

.rejection-box {
  margin-top: 0.8rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 0.65rem 0.9rem;
  border-radius: 6px;
  font-size: 0.85rem;
}

.doc-details {
  margin-top: 0.8rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.doc-chip {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}
.doc-chip__key { font-weight: 600; color: var(--text-secondary); text-transform: capitalize; margin-right: 0.25rem; }
.doc-chip__val { color: var(--text-primary); }
</style>
