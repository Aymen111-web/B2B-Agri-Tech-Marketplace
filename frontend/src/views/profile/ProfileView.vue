<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppSidebar from '@/components/AppSidebar.vue'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('personal') // 'personal', 'security', 'payment'

// Personal Info Form State
const firstName = ref('')
const secondName = ref('')
const phone = ref('')
const photoFile = ref(null)
const photoPreview = ref(null)

// Security / Password Form State
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// Farmer Payment Destination Form State
const bankCode = ref('telebirr')
const bankName = ref('Telebirr')
const accountName = ref('')
const accountNumber = ref('')

const isSaving = ref(false)
const toast = ref({ type: '', text: '' })

const isFarmer = computed(() => {
  const caps = authStore.user?.capabilities || []
  return caps.some(c => c.capability_type === 'farmer' && c.status === 'active') || authStore.user?.is_admin
})

const bankOptions = [
  { code: 'telebirr', name: 'Telebirr Mobile Money' },
  { code: 'cbe', name: 'Commercial Bank of Ethiopia (CBE)' },
  { code: 'dashen', name: 'Dashen Bank' },
  { code: 'awash', name: 'Awash Bank' },
  { code: 'abyssinia', name: 'Bank of Abyssinia' },
  { code: 'coop', name: 'Cooperative Bank of Oromia' },
  { code: 'hibret', name: 'Hibret Bank' },
  { code: 'zemen', name: 'Zemen Bank' },
]

onMounted(async () => {
  await authStore.fetchProfile()
  populateForm()
})

function populateForm() {
  const u = authStore.user
  if (!u) return

  firstName.value = u.first_name || ''
  secondName.value = u.second_name || ''
  phone.value = u.phone || ''

  photoPreview.value = u.profile_photo_url || null

  bankCode.value = u.bank_code || 'telebirr'
  bankName.value = u.bank_name || 'Telebirr Mobile Money'
  accountName.value = u.account_name || ''
  accountNumber.value = u.account_number || ''
}

function handlePhotoSelect(event) {
  const file = event.target.files[0]
  if (file) {
    photoFile.value = file
    photoPreview.value = URL.createObjectURL(file)
  }
}

function handleBankChange() {
  const selected = bankOptions.find(b => b.code === bankCode.value)
  if (selected) {
    bankName.value = selected.name
  }
}

async function savePersonalInfo() {
  isSaving.value = true
  toast.value = { type: '', text: '' }

  try {
    let res
    if (photoFile.value) {
      const formData = new FormData()
      formData.append('first_name', firstName.value)
      formData.append('second_name', secondName.value)
      formData.append('phone', phone.value)
      formData.append('profile_photo', photoFile.value)
      res = await authStore.updateProfile(formData)
    } else {
      res = await authStore.updateProfile({
        first_name: firstName.value,
        second_name: secondName.value,
        phone: phone.value,
      })
    }

    if (res.success) {
      toast.value = { type: 'success', text: 'Personal details updated successfully!' }
      photoFile.value = null
    } else {
      toast.value = { type: 'error', text: res.message }
    }
  } catch (err) {
    toast.value = { type: 'error', text: 'Failed to update personal details.' }
  } finally {
    isSaving.value = false
  }
}

async function savePassword() {
  if (!newPassword.value || newPassword.value.length < 6) {
    toast.value = { type: 'error', text: 'New password must be at least 6 characters long.' }
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    toast.value = { type: 'error', text: 'New password and confirmation do not match.' }
    return
  }

  isSaving.value = true
  toast.value = { type: '', text: '' }

  const res = await authStore.updateProfile({
    current_password: currentPassword.value,
    new_password: newPassword.value,
  })

  isSaving.value = false

  if (res.success) {
    toast.value = { type: 'success', text: 'Password changed successfully!' }
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } else {
    toast.value = { type: 'error', text: res.message }
  }
}

async function savePaymentDestination() {
  if (!accountName.value || !accountNumber.value) {
    toast.value = { type: 'error', text: 'Please provide both Account Name and Account Number.' }
    return
  }

  isSaving.value = true
  toast.value = { type: '', text: '' }

  const res = await authStore.updateProfile({
    bank_code: bankCode.value,
    bank_name: bankName.value,
    account_name: accountName.value,
    account_number: accountNumber.value,
  })

  isSaving.value = false

  if (res.success) {
    toast.value = { type: 'success', text: 'Payment destination and Chapa Subaccount updated successfully!' }
  } else {
    toast.value = { type: 'error', text: res.message }
  }
}
</script>

<template>
  <div class="app-layout">
    <AppSidebar />

    <div class="main-wrapper">
      <main class="profile-page">
        <!-- Header -->
        <header class="profile-header">
          <div class="header-inner">
            <div class="user-hero">
              <div class="avatar-box">
                <img v-if="photoPreview" :src="photoPreview" alt="Profile Avatar" class="avatar-img" />
                <div v-else class="avatar-placeholder">
                  {{ authStore.user?.first_name?.[0] || '👤' }}
                </div>
              </div>

              <div class="user-meta">
                <h1 class="user-title">
                  {{ authStore.user?.first_name }} {{ authStore.user?.second_name }}
                </h1>
                <p class="user-sub">
                  📞 {{ authStore.user?.phone }} &nbsp;|&nbsp;
                  <span v-if="authStore.user?.is_admin" class="badge badge--gold">Admin</span>
                  <span v-else-if="isFarmer" class="badge badge--green">Verified Farmer</span>
                  <span v-else class="badge badge--blue">Business Buyer</span>
                </p>
              </div>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <div class="profile-container">
          <!-- Notification Toast -->
          <div v-if="toast.text" :class="['alert-toast', toast.type === 'error' ? 'alert-toast--error' : 'alert-toast--success']" class="mb-6">
            <span>{{ toast.type === 'error' ? '⚠️' : '✅' }}</span>
            <span>{{ toast.text }}</span>
          </div>

          <!-- Navigation Tabs -->
          <div class="profile-tabs">
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'personal' }"
              @click="activeTab = 'personal'"
            >
              👤 Personal Details & Photo
            </button>

            <button
              class="tab-btn"
              :class="{ active: activeTab === 'security' }"
              @click="activeTab = 'security'"
            >
              🔒 Security & Password
            </button>

            <button
              v-if="isFarmer"
              class="tab-btn"
              :class="{ active: activeTab === 'payment' }"
              @click="activeTab = 'payment'"
            >
              💳 Farmer Payment Subaccount
            </button>
          </div>

          <!-- TAB 1: Personal Details -->
          <div v-if="activeTab === 'personal'" class="card-box">
            <h2 class="card-heading">Edit Personal Information</h2>
            <p class="card-sub">Update your account name, phone number, and profile photo avatar.</p>

            <form @submit.prevent="savePersonalInfo" class="form-grid">
              <!-- Avatar Upload -->
              <div class="form-group full-width">
                <label class="form-label">Profile Photo / Avatar</label>
                <div class="photo-upload-flex">
                  <div class="preview-box">
                    <img v-if="photoPreview" :src="photoPreview" alt="Avatar Preview" class="preview-img" />
                    <span v-else class="preview-placeholder">👤</span>
                  </div>
                  <div>
                    <input type="file" @change="handlePhotoSelect" accept="image/*" class="file-input" id="photo-upload" />
                    <label for="photo-upload" class="btn btn--outline btn--sm">
                      📁 Choose New Photo
                    </label>
                    <p class="help-text mt-1">Supports JPG, PNG, WEBP (Max 5MB)</p>
                  </div>
                </div>
              </div>

              <!-- First Name -->
              <div class="form-group">
                <label class="form-label">First Name</label>
                <input v-model="firstName" type="text" required class="form-input" placeholder="e.g. Abebe" />
              </div>

              <!-- Second Name -->
              <div class="form-group">
                <label class="form-label">Second Name</label>
                <input v-model="secondName" type="text" required class="form-input" placeholder="e.g. Bikila" />
              </div>

              <!-- Phone Number -->
              <div class="form-group full-width">
                <label class="form-label">Phone Number</label>
                <input v-model="phone" type="text" required class="form-input" placeholder="0911223344" />
              </div>

              <div class="form-actions full-width">
                <button type="submit" :disabled="isSaving" class="btn btn--primary">
                  {{ isSaving ? 'Saving Changes...' : 'Save Profile Details ✅' }}
                </button>
              </div>
            </form>
          </div>

          <!-- TAB 2: Security & Password -->
          <div v-else-if="activeTab === 'security'" class="card-box">
            <h2 class="card-heading">Change Account Password</h2>
            <p class="card-sub">Ensure your account uses a strong, secure password.</p>

            <form @submit.prevent="savePassword" class="form-stack">
              <div class="form-group">
                <label class="form-label">Current Password</label>
                <input v-model="currentPassword" type="password" required class="form-input" placeholder="••••••••" />
              </div>

              <div class="form-group">
                <label class="form-label">New Password</label>
                <input v-model="newPassword" type="password" required class="form-input" placeholder="At least 6 characters" />
              </div>

              <div class="form-group">
                <label class="form-label">Confirm New Password</label>
                <input v-model="confirmPassword" type="password" required class="form-input" placeholder="Re-type new password" />
              </div>

              <div class="form-actions">
                <button type="submit" :disabled="isSaving" class="btn btn--primary">
                  {{ isSaving ? 'Updating Password...' : 'Update Password 🔐' }}
                </button>
              </div>
            </form>
          </div>

          <!-- TAB 3: Farmer Payment Destination (Chapa Subaccount) -->
          <div v-else-if="activeTab === 'payment' && isFarmer" class="card-box">
            <div class="settlement-badge-box">
              <span v-if="authStore.user?.chapa_subaccount_id" class="sub-status sub-status--active">
                ✅ Chapa Subaccount Active: <strong>{{ authStore.user.chapa_subaccount_id }}</strong>
              </span>
              <span v-else class="sub-status sub-status--pending">
                ⚠️ Payment Destination Needed for Direct Settlement
              </span>
            </div>

            <h2 class="card-heading mt-2">Farmer Payment Destination (Chapa Direct Settlement)</h2>
            <p class="card-sub">
              Specify your Telebirr or Bank Account details. 100% of sales funds from buyers will settle directly to this account via Chapa.
            </p>

            <form @submit.prevent="savePaymentDestination" class="form-stack">
              <!-- Bank / Provider Selection -->
              <div class="form-group">
                <label class="form-label">Bank / Payment Provider</label>
                <select v-model="bankCode" @change="handleBankChange" class="form-select">
                  <option v-for="b in bankOptions" :key="b.code" :value="b.code">
                    {{ b.name }}
                  </option>
                </select>
              </div>

              <!-- Account Name -->
              <div class="form-group">
                <label class="form-label">Account Holder Name (Must match bank/Telebirr name)</label>
                <input v-model="accountName" type="text" required class="form-input" placeholder="e.g. Abebe Bikila" />
              </div>

              <!-- Account Number -->
              <div class="form-group">
                <label class="form-label">Account Number / Telebirr Phone Number</label>
                <input v-model="accountNumber" type="text" required class="form-input" placeholder="100012345678 or 0911223344" />
                <p v-if="authStore.user?.account_number_masked" class="help-text mt-1">
                  Currently Saved: <strong>{{ authStore.user.account_number_masked }}</strong>
                </p>
              </div>

              <div class="info-callout mt-4">
                🔒 <strong>Direct Settlement Guarantee:</strong> Your account credentials and numbers are encrypted and synchronized with Chapa Subaccounts. The platform never holds your funds.
              </div>

              <div class="form-actions mt-4">
                <button type="submit" :disabled="isSaving" class="btn btn--primary">
                  {{ isSaving ? 'Syncing Subaccount...' : 'Save Payment Destination 💳' }}
                </button>
              </div>
            </form>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout { display: flex; min-height: 100vh; background: var(--surface); color: var(--text-primary); }
.main-wrapper { flex: 1; margin-left: 260px; }
.profile-page { padding-bottom: 4rem; }

/* Header Banner */
.profile-header {
  background: var(--surface-card);
  border-bottom: 1px solid var(--border);
  padding: 2.5rem 2rem 1.75rem;
}
.header-inner { max-width: 900px; margin: 0 auto; }
.user-hero { display: flex; align-items: center; gap: 1.5rem; }

.avatar-box { width: 80px; height: 80px; border-radius: 50%; overflow: hidden; background: var(--brand-green); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md); border: 3px solid #ffffff; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-placeholder { font-size: 2.5rem; color: #fff; }

.user-title { font-size: 1.85rem; font-weight: 800; margin: 0 0 0.35rem; color: var(--text-primary); }
.user-sub { font-size: 0.95rem; color: var(--text-secondary); margin: 0; }

.badge { padding: 0.2rem 0.65rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; }
.badge--green { background: var(--brand-green-light); color: var(--brand-green-dark); }
.badge--blue { background: #dbeafe; color: #1e40af; }
.badge--gold { background: #fef3c7; color: #92400e; }

/* Container */
.profile-container { max-width: 900px; margin: 2rem auto 0; padding: 0 1.5rem; }

/* Tabs */
.profile-tabs { display: flex; gap: 0.75rem; margin-bottom: 1.75rem; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem; }
.tab-btn {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 0.65rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn:hover { background: var(--border); color: var(--text-primary); }
.tab-btn.active { background: var(--brand-green); color: #ffffff; border-color: var(--brand-green); }

/* Card Box */
.card-box {
  background: var(--surface-card);
  border: 1px solid var(--border);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}
.card-heading { font-size: 1.35rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.35rem; }
.card-sub { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.75rem; }

/* Form Layouts */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
.form-stack { display: flex; flex-direction: column; gap: 1.25rem; }
.full-width { grid-column: span 2; }

.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-label { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
.form-input, .form-select {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 0.95rem;
}
.form-input:focus, .form-select:focus { border-color: var(--brand-green); outline: none; }

.photo-upload-flex { display: flex; align-items: center; gap: 1.25rem; }
.preview-box { width: 60px; height: 60px; border-radius: 50%; overflow: hidden; background: var(--surface-alt); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; }
.preview-img { width: 100%; height: 100%; object-fit: cover; }
.preview-placeholder { font-size: 1.75rem; }
.file-input { display: none; }

.help-text { font-size: 0.8rem; color: var(--text-muted); }
.info-callout { background: var(--brand-green-light); border: 1px solid var(--brand-green); color: var(--brand-green-dark); padding: 0.85rem 1.25rem; border-radius: 0.5rem; font-size: 0.875rem; }

.settlement-badge-box { margin-bottom: 1rem; }
.sub-status { padding: 0.4rem 0.85rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 700; display: inline-block; }
.sub-status--active { background: var(--brand-green-light); color: var(--brand-green-dark); border: 1px solid var(--brand-green); }
.sub-status--pending { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }

.form-actions { display: flex; justify-content: flex-end; margin-top: 1rem; }
.btn { display: inline-flex; align-items: center; justify-content: center; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--primary { background: var(--brand-green); color: #ffffff; }
.btn--primary:hover { background: var(--brand-green-dark); }
.btn--outline { background: transparent; border: 1px solid var(--border); color: var(--text-primary); }
.btn--outline:hover { background: var(--surface-alt); }
.btn--sm { padding: 0.5rem 1rem; font-size: 0.85rem; }

.alert-toast { padding: 0.85rem 1.25rem; border-radius: 0.5rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }
.alert-toast--success { background: var(--brand-green-light); border: 1px solid var(--brand-green); color: var(--brand-green-dark); }
.alert-toast--error { background: var(--error-bg); border: 1px solid var(--error); color: var(--error); }
</style>
