<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AdminDashboardOverview from '@/components/admin/AdminDashboardOverview.vue'
import FarmerDashboardOverview from '@/components/farmer/FarmerDashboardOverview.vue'
import BuyerDashboardOverview from '@/components/buyer/BuyerDashboardOverview.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const auth   = useAuthStore()
const router = useRouter()

const showPinModal = ref(false)
const selectedOrderPin = ref('')
const pinInput = ref('')
const pinVerifyMessage = ref('')

const showInspectModal = ref(false)
const inspectStatus = ref('accepted')
const acceptedQty = ref(0)
const rejectedQty = ref(0)
const inspectNotes = ref('')
const inspectMessage = ref('')

function verifyPin() {}
function submitInspection() {}

const activeCapabilities = computed(() => {
  const caps = auth.user?.capabilities || []
  return caps.filter(c => c.status === 'active').map(c => c.capability_type)
})

const hasFarmerCapability = computed(() => activeCapabilities.value.includes('farmer'))
const hasBuyerCapability = computed(() => activeCapabilities.value.includes('buyer'))

async function handleLogout() {
  await auth.logout()
  router.push('/')
}
</script>

<template>
  <div class="dashboard">
    <!-- Top Navigation Bar -->
    <nav class="dash-nav">
      <div class="dash-nav__inner">
        <div class="dash-nav__left">
          <span class="dash-nav__title">Command Dashboard</span>
        </div>
        <div class="dash-nav__right">
          <ThemeToggle />
          <button id="logout-btn" class="dash-nav__logout" @click="handleLogout">
            Sign Out
          </button>
        </div>
      </div>
    </nav>

    <main class="dash-main">
      <div class="dash-content">
        <!-- Welcome banner (Shown for Admin or Users without active capabilities) -->
        <div v-if="auth.isAdmin || (!hasFarmerCapability && !hasBuyerCapability)" class="dash-welcome">
          <div class="dash-welcome__header">
            <div>
              <h1 class="dash-welcome__title">
                Welcome back, {{ auth.user?.first_name }}! 👋
              </h1>
              <div class="user-capability-badges">
                <span v-if="hasFarmerCapability" class="verified-badge verified-badge--farmer">
                  ✓ Verified Farmer Supplier
                </span>
                <span v-if="hasBuyerCapability" class="verified-badge verified-badge--buyer">
                  ✓ Verified Commercial Buyer
                </span>
              </div>
              <p class="dash-welcome__sub">
                Account Status: <span class="status-badge">{{ auth.user?.account_status }}</span>
              </p>
            </div>
            <div v-if="auth.isAdmin" class="admin-tag">
              Administrator
            </div>
          </div>
        </div>

        <!-- Capability Cards Grid (Shown for Admin or Users without active capabilities) -->
        <div v-if="auth.isAdmin || (!hasFarmerCapability && !hasBuyerCapability)" class="cards-grid">
          
          <!-- Farmer Card (Non-Admin only) -->
          <div v-if="!auth.isAdmin" class="dash-card" :class="{ 'dash-card--active': hasFarmerCapability }">
            <div class="dash-card__header">
              <span class="dash-card__icon">🌾</span>
              <span class="dash-card__status" :class="hasFarmerCapability ? 'status--granted' : 'status--none'">
                {{ hasFarmerCapability ? 'Active Capability' : 'Not Granted' }}
              </span>
            </div>
            <h3 class="dash-card__title">Farmer Produce Portal</h3>
            <p class="dash-card__desc">
              List available crops, manage stock, set prices, and process buyer fulfillment orders.
            </p>
            <div class="dash-card__actions">
              <button
                v-if="!hasFarmerCapability"
                class="btn btn--primary"
                @click="router.push('/capabilities/apply')"
              >
                Apply for Farmer Capability
              </button>

              <button
                v-else
                class="btn btn--primary"
                @click="router.push('/farmer/listings')"
              >
                Manage Produce Listings →
              </button>
            </div>
          </div>

          <!-- Buyer Card (Non-Admin only) -->
          <div v-if="!auth.isAdmin" class="dash-card" :class="{ 'dash-card--active': hasBuyerCapability }">
            <div class="dash-card__header">
              <span class="dash-card__icon">🏬</span>
              <span class="dash-card__status" :class="hasBuyerCapability ? 'status--granted' : 'status--none'">
                {{ hasBuyerCapability ? 'Active Capability' : 'Not Granted' }}
              </span>
            </div>
            <h3 class="dash-card__title">Business Buyer Portal</h3>
            <p class="dash-card__desc">
              Browse verified farmer listings, manage cart items, place multi-farmer orders, and pay securely.
            </p>
            <div class="dash-card__actions">
              <button
                v-if="!hasBuyerCapability"
                class="btn btn--primary"
                @click="router.push('/capabilities/apply')"
              >
                Apply for Buyer Capability
              </button>
              <div v-else class="buyer-actions-flex">
                <button
                  class="btn btn--primary"
                  @click="router.push('/orders')"
                >
                  My Orders →
                </button>
                <button
                  class="btn btn--outline"
                  @click="router.push('/cart')"
                >
                  View Cart 🛒
                </button>
              </div>
            </div>
          </div>

          <!-- Admin Portal Card (If Admin) -->
          <div v-if="auth.isAdmin" class="dash-card dash-card--admin-portal">
            <div class="dash-card__header">
              <span class="dash-card__icon">🛡️</span>
              <span class="dash-card__status status--admin">
                System Admin
              </span>
            </div>
            <h3 class="dash-card__title">Capability Approvals</h3>
            <p class="dash-card__desc">
              Review capability applications from farmers and business buyers, verify trade licenses, and grant platform access.
            </p>
            <div class="dash-card__actions">
              <button class="btn btn--admin" @click="router.push('/admin/capability-applications')">
                Review Pending Applications →
              </button>
            </div>
          </div>

          <!-- Admin Users Card (If Admin) -->
          <div v-if="auth.isAdmin" class="dash-card dash-card--admin-portal">
            <div class="dash-card__header">
              <span class="dash-card__icon">👥</span>
              <span class="dash-card__status status--admin">
                System Admin
              </span>
            </div>
            <h3 class="dash-card__title">User Accounts & Subscriptions</h3>
            <p class="dash-card__desc">
              Manage all registered farmer and buyer accounts, audit Chapa Subaccounts, and toggle active/inactive subscription statuses.
            </p>
            <div class="dash-card__actions">
              <button class="btn btn--admin" @click="router.push('/admin/users')">
                Manage User Accounts →
              </button>
            </div>
          </div>
        </div>

        <!-- Role Overview Section -->
        <AdminDashboardOverview v-if="auth.isAdmin" />
        <FarmerDashboardOverview v-else-if="hasFarmerCapability" />
        <BuyerDashboardOverview v-else-if="hasBuyerCapability" />

      </div>
    </main>

    <!-- MODAL 1: DELIVERY PIN HANDOFF -->
    <div v-if="showPinModal" class="modal-backdrop">
      <div class="modal-card">
        <h3>🔑 Secure 6-Digit Delivery Handoff PIN</h3>
        <p class="modal-sub">Provide this PIN to the farmer upon receiving produce handoff.</p>
        
        <div class="pin-display-box">
          <span class="pin-code">{{ selectedOrderPin }}</span>
        </div>

        <div class="pin-verify-form">
          <label>Farmer Verification Test:</label>
          <input type="text" v-model="pinInput" placeholder="Enter 6-digit PIN" maxlength="6" class="form-input"/>
          <button class="btn btn-success" @click="verifyPin">Verify Handoff PIN</button>
        </div>

        <p v-if="pinVerifyMessage" class="feedback-msg">{{ pinVerifyMessage }}</p>
        <button class="btn btn-text" @click="showPinModal = false">Close Window</button>
      </div>
    </div>

    <!-- MODAL 2: PRODUCE QUALITY INSPECTION -->
    <div v-if="showInspectModal" class="modal-backdrop">
      <div class="modal-card">
        <h3>🔍 Produce Quality Inspection</h3>
        <p class="modal-sub">Verify produce condition prior to releasing escrow payout to farmer.</p>

        <div class="form-group">
          <label>Inspection Outcome:</label>
          <select v-model="inspectStatus" class="form-select">
            <option value="accepted">Accepted (100% Quality Met)</option>
            <option value="partially_accepted">Partially Accepted (Partial Spoilage)</option>
            <option value="rejected">Rejected (Spoiled / Below Specification)</option>
          </select>
        </div>

        <div class="form-row" v-if="inspectStatus === 'partially_accepted'">
          <div class="form-group">
            <label>Accepted Quantity:</label>
            <input type="number" v-model="acceptedQty" class="form-input"/>
          </div>
          <div class="form-group">
            <label>Rejected Quantity:</label>
            <input type="number" v-model="rejectedQty" class="form-input"/>
          </div>
        </div>

        <div class="form-group">
          <label>Inspection Notes / Quality Remarks:</label>
          <textarea v-model="inspectNotes" placeholder="e.g. Moisture level optimal, 2 bags damaged in transit" class="form-textarea"></textarea>
        </div>

        <p v-if="inspectMessage" class="feedback-msg">{{ inspectMessage }}</p>

        <div class="modal-actions">
          <button class="btn btn-primary" @click="submitInspection">Complete Inspection</button>
          <button class="btn btn-text" @click="showInspectModal = false">Cancel</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.dashboard { min-height: 100vh; background: #f8fafc; color: #1e293b; font-family: system-ui, sans-serif; }
.dash-nav { background: #064e3b; color: #fff; padding: 0 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
.dash-nav__inner { max-width: 1280px; margin: 0 auto; height: 68px; display: flex; align-items: center; justify-content: space-between; }
.dash-nav__brand { font-size: 1.25rem; font-weight: 600; color: #f0fdf4; }
.dash-nav__brand strong { color: #f59e0b; }
.dash-nav__center { display: flex; gap: 0.5rem; }
.dash-nav__center button { background: transparent; border: none; color: #a7f3d0; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.dash-nav__center button.active, .dash-nav__center button:hover { background: rgba(255,255,255,0.15); color: #fff; }
.dash-nav__right { display: flex; align-items: center; gap: 1rem; }
.dash-nav__user { font-size: 0.9rem; color: #d1fae5; }
.dash-nav__logout { background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; }

.dash-nav {
  background: #064e3b;
  padding: 0 1.5rem;
  box-shadow: var(--shadow-xs);
}
.dash-nav__title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.01em;
}
.dash-nav__inner {
  max-width: 1200px; margin: 0 auto; height: 60px;
  display: flex; align-items: center; justify-content: space-between;
}
.dash-nav__brand { color: #fff; font-size: 1.15rem; font-weight: 700; text-decoration: none; display: flex; align-items: center; }
.nav-brand-img { width: 24px; height: 24px; border-radius: 4px; object-fit: cover; margin-right: 0.35rem; }
.dash-nav__brand strong { color: var(--brand-gold); }
.dash-nav__right { display: flex; align-items: center; gap: 1rem; }
.dash-nav__link {
  color: rgba(255,255,255,0.88) !important;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-xs);
  transition: all 0.15s ease;
}
.dash-nav__link:hover {
  background: rgba(255,255,255,0.18) !important;
  color: #ffffff !important;
}
.dash-nav__link--active {
  background: rgba(255,255,255,0.18) !important;
  color: #ffffff !important;
}
.dash-nav__link--admin {
  background: rgba(251,191,36,0.18) !important;
  color: #fbbf24 !important;
  border: 1px solid rgba(251,191,36,0.3);
}
.dash-nav__link--admin:hover, .dash-nav__link--admin.router-link-active {
  background: #fbbf24 !important;
  color: #0f172a !important;
}

.dash-nav__user { color: rgba(255,255,255,.8); font-size: 0.85rem; font-weight: 600; }
.dash-nav__logout {
  background: rgba(255,255,255,.12); color: #fff; border: 1px solid rgba(255,255,255,.2);
  border-radius: var(--radius-xs); padding: 0.35rem 0.85rem; font-size: 0.8125rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s ease;
}
.dash-nav__logout:hover { background: rgba(255,255,255,.22); }

.dash-main { flex: 1; padding: 2rem 1.5rem; }
.dash-content { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }

.dash-welcome {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.5rem 1.75rem;
  box-shadow: var(--shadow-xs);
}
.dash-welcome__header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
.dash-welcome__title { font-size: 1.4rem; color: var(--text-primary); margin-bottom: 0.25rem; font-weight: 700; }
.dash-welcome__sub { color: var(--text-secondary); font-size: 0.875rem; }
.status-badge { font-weight: 700; color: var(--brand-green-dark); letter-spacing: 0.02em; }

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.25rem;
}

.dash-card {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.dash-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: rgba(16, 185, 129, 0.3); }

.dash-card--active { border-color: var(--brand-green-border); background: var(--surface-card); }

.dash-card__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; }
.dash-card__icon {
  width: 44px; height: 44px; border-radius: var(--radius-sm);
  background: var(--surface-alt); display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; border: 1px solid var(--border-subtle);
}
.dash-card__status { font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); }
.status--granted { background: var(--brand-green-light); color: var(--brand-green-dark); border: 1px solid var(--brand-green-border); }
.status--none    { background: var(--surface-alt); color: var(--text-muted); border: 1px solid var(--border); }

.dash-card__title { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.4rem; }
.dash-card__desc  { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.55; margin-bottom: 1.25rem; flex: 1; }

.dash-card__actions { margin-top: auto; }

.buyer-actions-flex { display: flex; gap: 0.6rem; }
.buyer-actions-flex .btn { flex: 1; }

.user-capability-badges {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}
.verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.verified-badge--farmer {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
}
.verified-badge--buyer {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}
</style>
