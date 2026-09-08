<template>
  <div class="w-full flex flex-col min-h-full pb-8 max-w-5xl mx-auto space-y-5">
    <!-- HEADER BANNER -->
    <div class="bg-gradient-to-r from-[#062E15] via-[#0F5C2A] to-[#0B57D0] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-[#E69500]/20 rounded-full blur-2xl pointer-events-none" />
      <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-[#0B57D0]/30 rounded-full blur-2xl pointer-events-none" />

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-black text-white tracking-tight">{{ $t('farmer.payoutsHubTitle') }}</h1>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-black uppercase tracking-wider">{{ $t('badges.escrowProtected') }}</span>
          </div>
          <p class="text-xs text-[#C3EFCF] mt-1 font-medium">{{ $t('farmer.payoutsHubSub') }}</p>
        </div>

        <button 
          @click="showAccountModal = true" 
          class="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <CreditCard class="w-4 h-4 text-[#E69500]" />
          <span>{{ $t('Payout Account Settings') }}</span>
        </button>
      </div>
    </div>

    <!-- STAT CARDS -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <!-- Available for Withdrawal -->
      <div class="bg-white border border-[#E2E4E7] rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
        <div class="absolute top-0 left-0 right-0 h-1 bg-[#1E9444]" />
        <div class="flex items-start justify-between">
          <div>
            <span class="text-xs font-bold text-[#5A6270]">{{ $t('farmer.availableBalance') }}</span>
            <h3 class="text-2xl font-black text-[#1E9444] mt-1">{{ formatETB(availableBalanceETB) }}</h3>
          </div>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-[#1E9444] border border-emerald-100 flex items-center justify-center shrink-0">
            <Wallet class="w-5 h-5" />
          </div>
        </div>
        <div class="flex items-center justify-between pt-1 border-t border-gray-100">
          <span class="text-[11px] text-[#5A6270] font-medium">{{ $t('Escrow Released') }}</span>
          <button 
            @click="handleWithdraw" 
            :disabled="availableBalanceETB <= 0" 
            class="px-3 py-1 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
          >
            {{ $t('Withdraw Now') }}
          </button>
        </div>
      </div>

      <!-- Locked in Escrow -->
      <div class="bg-white border border-[#E2E4E7] rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
        <div class="absolute top-0 left-0 right-0 h-1 bg-[#F5B73A]" />
        <div class="flex items-start justify-between">
          <div>
            <span class="text-xs font-bold text-[#5A6270]">{{ $t('farmer.pendingEscrow') }}</span>
            <h3 class="text-2xl font-black text-[#1E2328] mt-1">{{ formatETB(pendingEscrowETB) }}</h3>
          </div>
          <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Lock class="w-5 h-5" />
          </div>
        </div>
        <div class="flex items-center justify-between pt-1 border-t border-gray-100">
          <span class="text-[11px] text-[#5A6270] font-medium">{{ pendingEscrowOrdersCount }} {{ $t('active escrow orders') }}</span>
          <span class="text-[10px] font-bold text-amber-700">{{ $t('Awaiting Buyer Confirm') }}</span>
        </div>
      </div>

      <!-- Total Lifetime Earnings -->
      <div class="bg-white border border-[#E2E4E7] rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
        <div class="absolute top-0 left-0 right-0 h-1 bg-[#0B57D0]" />
        <div class="flex items-start justify-between">
          <div>
            <span class="text-xs font-bold text-[#5A6270]">{{ $t('farmer.lifetimeEarnings') }}</span>
            <h3 class="text-2xl font-black text-[#0B57D0] mt-1">{{ formatETB(totalLifetimeEarned) }}</h3>
          </div>
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-[#0B57D0] border border-blue-100 flex items-center justify-center shrink-0">
            <CheckCircle2 class="w-5 h-5" />
          </div>
        </div>
        <div class="flex items-center justify-between pt-1 border-t border-gray-100">
          <span class="text-[11px] text-[#5A6270] font-medium">{{ $t('Disbursed to Bank') }}</span>
          <span class="text-[10px] font-bold text-blue-700">{{ $t('Verified Direct Deposit') }}</span>
        </div>
      </div>
    </div>

    <!-- PAYOUT ACCOUNT DISPLAY BAR -->
    <div class="bg-white border border-[#E2E4E7] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-[#062E15] text-[#E69500] flex items-center justify-center font-bold shrink-0">
          <BuildingBank class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h4 class="text-xs font-extrabold text-[#1E2328]">{{ $t('Connected Withdrawal Account') }}</h4>
            <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">{{ $t('Active') }}</span>
          </div>
          <p class="text-xs text-[#5A6270] mt-0.5">
            {{ payoutAccount.provider }} ({{ payoutAccount.accountName }}) · <span class="font-mono font-bold">{{ maskAccount(payoutAccount.accountNumber) }}</span>
          </p>
        </div>
      </div>
      <button 
        @click="showAccountModal = true" 
        class="text-xs font-bold text-[#1E9444] hover:text-[#0F5C2A] flex items-center gap-1 cursor-pointer self-start sm:self-auto"
      >
        <span>{{ $t('Change Method') }}</span>
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>

    <!-- TRANSACTIONS & ESCROW LIST -->
    <div class="bg-white border border-[#E2E4E7] rounded-2xl p-5 shadow-xs space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <h3 class="text-sm sm:text-base font-black text-[#1E2328]">{{ $t('farmer.payoutHistory') }}</h3>
          <p class="text-xs text-[#5A6270]">{{ $t('Detailed status of all order funds, escrow holds, and completed disbursements') }}</p>
        </div>

        <!-- FILTER TABS -->
        <div class="flex items-center gap-1.5 bg-[#F8F9FA] p-1 rounded-xl border border-gray-200 self-start sm:self-auto">
          <button 
            v-for="tab in filterTabs" 
            :key="tab.value" 
            @click="activeFilter = tab.value"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
              activeFilter === tab.value ? 'bg-white text-[#1E2328] shadow-2xs border border-gray-200' : 'text-[#5A6270] hover:text-[#1E2328]'
            ]"
          >
            {{ $t(tab.label) }}
          </button>
        </div>
      </div>

      <!-- EMPTY STATE -->
      <div v-if="filteredPayouts.length === 0" class="text-center py-12 text-[#5A6270] border border-dashed border-gray-200 rounded-xl p-6">
        <Receipt class="w-10 h-10 text-gray-300 mx-auto mb-2" />
        <p class="text-sm font-bold text-[#1E2328]">{{ $t('No payout records found') }}</p>
        <p class="text-xs text-[#5A6270] mt-1">{{ $t('Order payouts will appear here when buyers place produce orders with escrow.') }}</p>
      </div>

      <!-- LIST OF PAYOUT ITEMS -->
      <div v-else class="space-y-3">
        <div 
          v-for="item in filteredPayouts" 
          :key="item.id" 
          class="border border-[#E2E4E7] rounded-2xl p-4 hover:border-[#1E9444] transition-all bg-[#F8F9FA] space-y-3"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/60 pb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                {{ item.cropEmoji || '🌾' }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-xs font-black text-[#1E2328]">{{ $t(item.cropName) || $t('Produce Order') }}</h4>
                  <span class="text-[11px] font-mono text-[#5A6270] bg-white px-2 py-0.5 rounded border border-gray-200">#{{ item.orderId }}</span>
                </div>
                <p class="text-[11px] text-[#5A6270] mt-0.5">
                  {{ $t('orders.buyer') }}: <span class="font-bold text-gray-800">{{ item.buyerName }}</span> · {{ $t('Chapa Escrow Ref') }}: <span class="font-mono text-gray-600">{{ item.escrowRef }}</span>
                </p>
              </div>
            </div>

            <div class="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <div class="text-right">
                <span class="text-xs font-black text-[#1E2328] block">{{ formatETB(item.amountETB) }}</span>
                <span class="text-[10px] text-[#5A6270] font-medium">{{ formatDate(item.date) }}</span>
              </div>
              <span :class="['px-3 py-1 rounded-full text-xs font-black capitalize border', getStatusClass(item.status)]">
                {{ $t(getStatusLabel(item.status)) }}
              </span>
            </div>
          </div>

          <!-- ESCROW & PAYOUT DETAILS FOOTER -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#5A6270] bg-white p-2.5 rounded-xl border border-gray-200/80">
            <div class="flex items-center gap-2">
              <ShieldCheck class="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{{ $t('Release Condition:') }} <strong class="text-gray-800">{{ item.releaseCondition }}</strong></span>
            </div>
            
            <div class="flex items-center gap-2 self-end sm:self-auto">
              <span v-if="item.status === 'released'" class="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 class="w-4 h-4 text-emerald-600" /> {{ $t('Funds Ready in Wallet') }}
              </span>
              <span v-else-if="item.status === 'paid'" class="text-blue-700 font-bold flex items-center gap-1">
                <BuildingBank class="w-4 h-4 text-blue-600" /> {{ $t('Paid to') }} {{ payoutAccount.provider }}
              </span>
              <span v-else class="text-amber-700 font-bold flex items-center gap-1">
                <Clock class="w-4 h-4 text-amber-600" /> {{ $t('orders.escrowLocked') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- WITHDRAWAL MODAL -->
    <div v-if="showWithdrawModal" class="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-gray-100">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet class="w-4 h-4" />
            </div>
            <h3 class="text-base font-black text-[#1E2328]">{{ $t('farmer.requestWithdrawal') }}</h3>
          </div>
          <button @click="showWithdrawModal = false" class="text-gray-400 hover:text-gray-600 font-bold cursor-pointer">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1">
            <span class="text-[#5A6270] block font-medium">{{ $t('farmer.withdrawalAmount') }}</span>
            <p class="text-2xl font-black text-[#1E9444]">{{ formatETB(availableBalanceETB) }}</p>
          </div>

          <div class="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1">
            <span class="text-[#5A6270] block font-medium">{{ $t('farmer.payoutMethod') }}</span>
            <p class="font-bold text-[#1E2328]">{{ payoutAccount.provider }} - {{ payoutAccount.accountName }}</p>
            <p class="font-mono text-gray-600">{{ payoutAccount.accountNumber }}</p>
          </div>

          <p class="text-[11px] text-[#5A6270] leading-relaxed">
            {{ $t('Funds will be transferred directly via Instant Interbank API. Settlement takes 1-5 minutes for Telebirr / CBE Birr.') }}
          </p>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button @click="showWithdrawModal = false" class="px-4 py-2 rounded-xl text-xs font-bold text-[#5A6270] hover:bg-gray-100 cursor-pointer">
            {{ $t('Cancel') }}
          </button>
          <button 
            @click="confirmWithdrawal" 
            :disabled="isProcessingWithdrawal" 
            class="px-5 py-2.5 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <Loader2 v-if="isProcessingWithdrawal" class="w-4 h-4 animate-spin" />
            <span>{{ isProcessingWithdrawal ? $t('Processing Disbursement...') : $t('farmer.requestWithdrawal') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ACCOUNT SETTINGS MODAL -->
    <div v-if="showAccountModal" class="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-gray-100">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-blue-50 text-[#0B57D0] flex items-center justify-center">
              <CreditCard class="w-4 h-4" />
            </div>
            <h3 class="text-base font-black text-[#1E2328]">{{ $t('Payout Account Settings') }}</h3>
          </div>
          <button @click="showAccountModal = false" class="text-gray-400 hover:text-gray-600 font-bold cursor-pointer">✕</button>
        </div>

        <form @submit.prevent="saveAccountSettings" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-[#1E2328] mb-1">{{ $t('farmer.payoutMethod') }}</label>
            <select v-model="editAccountForm.provider" class="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-[#1E9444] focus:outline-none">
              <option value="Commercial Bank of Ethiopia (CBE)">Commercial Bank of Ethiopia (CBE)</option>
              <option value="Telebirr Mobile Money">Telebirr Mobile Money</option>
              <option value="CBE Birr">CBE Birr</option>
              <option value="Awash International Bank">Awash International Bank</option>
              <option value="Dashen Bank">Dashen Bank</option>
              <option value="Bank of Abyssinia">Bank of Abyssinia</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-[#1E2328] mb-1">{{ $t('marketplace.holder') }}</label>
            <input 
              v-model="editAccountForm.accountName" 
              type="text" 
              required 
              placeholder="e.g. Dawit Bekele" 
              class="w-full p-2.5 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-[#1E9444] focus:outline-none" 
            />
          </div>

          <div>
            <label class="block font-bold text-[#1E2328] mb-1">{{ $t('Account Number / Telebirr Phone') }}</label>
            <input 
              v-model="editAccountForm.accountNumber" 
              type="text" 
              required 
              placeholder="1000123456789 or +251 912 345 678" 
              class="w-full p-2.5 rounded-xl border border-gray-300 font-mono font-bold focus:ring-2 focus:ring-[#1E9444] focus:outline-none" 
            />
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button type="button" @click="showAccountModal = false" class="px-4 py-2 rounded-xl text-xs font-bold text-[#5A6270] hover:bg-gray-100 cursor-pointer">
              {{ $t('Cancel') }}
            </button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white text-xs font-bold transition-all cursor-pointer shadow-xs">
              {{ $t('Save Account Details') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- TOAST NOTIFICATION -->
    <div 
      v-if="toastMessage" 
      class="fixed bottom-6 right-6 z-50 bg-[#062E15] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-emerald-500/30 flex items-center gap-2 animate-bounce"
    >
      <CheckCircle2 class="w-4 h-4 text-[#E69500]" />
      <span>{{ $t(toastMessage) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  Wallet, Lock, CheckCircle2, CreditCard, ShieldCheck, 
  Receipt, Clock, ChevronRight, Loader2, Landmark as BuildingBank 
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useOrders } from '@/composables/useOrders'
import { api } from '@/services/api'
import { formatETB, formatDate } from '@/utils/helpers'

const { user } = useAuth()
const farmer = computed(() => user.value)
const { orders } = useOrders()

const activeFilter = ref('all')
const showWithdrawModal = ref(false)
const showAccountModal = ref(false)
const isProcessingWithdrawal = ref(false)
const toastMessage = ref('')

const filterTabs = [
  { label: 'All Payouts', value: 'all' },
  { label: 'Pending Escrow', value: 'pending' },
  { label: 'Released Funds', value: 'released' },
  { label: 'Paid Out', value: 'paid' },
]

// Payout Account state stored in localStorage or default
const defaultAccount = {
  provider: 'Commercial Bank of Ethiopia (CBE)',
  accountName: farmer.value?.name || 'Dawit Bekele',
  accountNumber: '1000492817264',
}

const payoutAccount = ref({ ...defaultAccount })
const editAccountForm = ref({ ...defaultAccount })

onMounted(() => {
  const savedAcc = localStorage.getItem('agri_farmer_payout_account')
  if (savedAcc) {
    try {
      payoutAccount.value = JSON.parse(savedAcc)
      editAccountForm.value = { ...payoutAccount.value }
    } catch { /* ignore */ }
  } else if (farmer.value?.name) {
    payoutAccount.value.accountName = farmer.value.name
    editAccountForm.value.accountName = farmer.value.name
  }

  fetchBackendPayouts()
})

const backendPayouts = ref([])
async function fetchBackendPayouts() {
  try {
    const res = await api.fetchPayouts()
    if (res && res.data && Array.isArray(res.data)) {
      backendPayouts.value = res.data
    }
  } catch {
    // API optional fallback
  }
}

// Compute payouts from local orders + backend payouts
const farmerOrders = computed(() => {
  return orders.value.filter(o => o.farmerId === farmer.value?.id || o.farmer?.name === farmer.value?.name || true)
})

const payoutRecords = computed(() => {
  const list = []

  // Map orders into payout entries
  farmerOrders.value.forEach(order => {
    let status = 'pending'
    if (order.escrowStatus === 'released' || order.status === 'completed' || order.status === 'delivered') {
      status = 'released'
    }

    list.push({
      id: `PAY-${order.id}`,
      orderId: order.id,
      cropName: order.listing?.cropName || 'Produce Batch',
      cropEmoji: order.listing?.cropEmoji || '🌾',
      buyerName: order.buyer?.name || 'Commercial Buyer',
      escrowRef: order.escrowReference || `CHP-TX-${Math.floor(10000000 + Math.random() * 90000000)}`,
      amountETB: Number(order.totalAmountETB || 0),
      status: status,
      releaseCondition: 'Buyer Delivery Confirmation & Produce Quality Inspection',
      date: order.completedAt || order.placedAt || new Date(),
    })
  })

  // Add historical paid items if available
  if (list.length === 0) {
    list.push(
      {
        id: 'PAY-ORD-8919',
        orderId: 'ORD-8919',
        cropName: 'Bale Durum Wheat',
        cropEmoji: '🌾',
        buyerName: 'Addis Supply Co.',
        escrowRef: 'CHP-TX-77610092',
        amountETB: 140000,
        status: 'paid',
        releaseCondition: 'Delivered & Inspected Grade A Wheat',
        date: new Date('2024-02-14T16:25:00'),
      },
      {
        id: 'PAY-ORD-8921',
        orderId: 'ORD-8921',
        cropName: 'Sidama Washed Coffee G1',
        cropEmoji: '☕',
        buyerName: 'Addis Supply Co.',
        escrowRef: 'CHP-TX-88901234',
        amountETB: 170000,
        status: 'pending',
        releaseCondition: 'Awaiting Final Buyer Receipt',
        date: new Date('2024-02-28T10:30:00'),
      }
    )
  }

  return list
})

const availableBalanceETB = computed(() => {
  return payoutRecords.value
    .filter(p => p.status === 'released')
    .reduce((sum, p) => sum + p.amountETB, 0)
})

const pendingEscrowETB = computed(() => {
  return payoutRecords.value
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amountETB, 0)
})

const pendingEscrowOrdersCount = computed(() => {
  return payoutRecords.value.filter(p => p.status === 'pending').length
})

const totalLifetimeEarned = computed(() => {
  const base = farmer.value?.totalEarned || 890000
  const paid = payoutRecords.value
    .filter(p => p.status === 'paid' || p.status === 'released')
    .reduce((sum, p) => sum + p.amountETB, 0)
  return Math.max(base, paid)
})

const filteredPayouts = computed(() => {
  if (activeFilter.value === 'all') return payoutRecords.value
  return payoutRecords.value.filter(p => p.status === activeFilter.value)
})

function getStatusClass(status) {
  if (status === 'released') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (status === 'paid') return 'bg-blue-50 text-blue-700 border-blue-200'
  return 'bg-amber-50 text-amber-700 border-amber-200'
}

function getStatusLabel(status) {
  if (status === 'released') return 'Escrow Released'
  if (status === 'paid') return 'Paid Out'
  return 'Held in Escrow'
}

function maskAccount(accNum) {
  if (!accNum) return ''
  if (accNum.length <= 4) return accNum
  return '•••• ' + accNum.slice(-4)
}

function handleWithdraw() {
  if (availableBalanceETB.value <= 0) return
  showWithdrawModal.value = true
}

async function confirmWithdrawal() {
  isProcessingWithdrawal.value = true
  await new Promise(r => setTimeout(r, 1200))
  
  // Mark released items as paid
  payoutRecords.value.forEach(p => {
    if (p.status === 'released') p.status = 'paid'
  })

  isProcessingWithdrawal.value = false
  showWithdrawModal.value = false
  triggerToast(`Successfully requested withdrawal to ${payoutAccount.value.provider}`)
}

function saveAccountSettings() {
  payoutAccount.value = { ...editAccountForm.value }
  localStorage.setItem('agri_farmer_payout_account', JSON.stringify(payoutAccount.value))
  showAccountModal.value = false
  triggerToast('Payout account updated successfully')
}

function triggerToast(msg) {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 4000)
}
</script>
