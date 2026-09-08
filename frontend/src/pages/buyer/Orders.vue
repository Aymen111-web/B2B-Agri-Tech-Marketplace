<template>
  <div class="space-y-6 pb-6">
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E4E7] pb-4">
      <div>
        <h1 class="text-2xl font-black text-[#1E2328] tracking-tight">
          Procurement <span class="text-[#0B57D0]">Orders & Escrow</span> 📦
        </h1>
        <p class="text-xs text-[#5A6270] mt-0.5">
          Track agricultural crop shipments, monitor Chapa escrow funds, and verify driver delivery PINs.
        </p>
      </div>

      <router-link to="/buyer/marketplace" 
        class="px-4 py-2 bg-[#E69500] text-white rounded-xl text-xs font-extrabold hover:bg-[#D48900] transition-colors self-start sm:self-auto flex items-center gap-1.5 shadow-2xs">
        <Store class="w-4 h-4" />
        <span>Source Produce</span>
      </router-link>
    </div>

    <!-- 4 Metrics Summary Bar -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div class="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-2xs">
        <div class="flex items-center justify-between text-[#5A6270]">
          <span class="text-[11px] font-bold uppercase">Total Orders</span>
          <Package class="w-4 h-4 text-[#0B57D0]" />
        </div>
        <p class="text-2xl font-black text-[#1E2328] mt-1">{{ orders.length }}</p>
        <span class="text-[11px] text-[#5A6270] font-medium">B2B procurement batches</span>
      </div>

      <div class="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-2xs">
        <div class="flex items-center justify-between text-[#5A6270]">
          <span class="text-[11px] font-bold uppercase">Active Shipments</span>
          <Truck class="w-4 h-4 text-[#E69500]" />
        </div>
        <p class="text-2xl font-black text-[#1E2328] mt-1">{{ activeShipmentsCount }}</p>
        <span class="text-[11px] text-amber-700 font-semibold">En route or dispatched</span>
      </div>

      <div class="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-2xs">
        <div class="flex items-center justify-between text-[#5A6270]">
          <span class="text-[11px] font-bold uppercase">Escrow Locked</span>
          <ShieldCheck class="w-4 h-4 text-[#1E9444]" />
        </div>
        <p class="text-2xl font-black text-[#1E2328] mt-1">{{ formatETB(totalEscrowLockedETB) }}</p>
        <span class="text-[11px] text-[#1E9444] font-semibold">Secured capital</span>
      </div>

      <div class="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-2xs">
        <div class="flex items-center justify-between text-[#5A6270]">
          <span class="text-[11px] font-bold uppercase">Completed</span>
          <CheckCircle2 class="w-4 h-4 text-emerald-600" />
        </div>
        <p class="text-2xl font-black text-[#1E2328] mt-1">{{ completedOrdersCount }}</p>
        <span class="text-[11px] text-emerald-700 font-semibold">Funds released to farmer</span>
      </div>
    </div>

    <!-- Filter Tabs & Search Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <!-- Tabs -->
      <div class="flex flex-wrap gap-2">
        <button v-for="tab in filterTabs" :key="tab.value" @click="activeTab = tab.value"
          :class="['px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border cursor-pointer flex items-center gap-1.5',
            activeTab === tab.value ? 'bg-[#0B57D0] text-white border-[#0B57D0] shadow-xs' : 'bg-white text-[#5A6270] border-[#E2E4E7] hover:border-[#0B57D0]']">
          <span>{{ tab.label }}</span>
          <span v-if="getTabCount(tab.value) > 0" 
            :class="['px-1.5 py-0.2 rounded-full text-[10px] font-bold', activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#5A6270]']">
            {{ getTabCount(tab.value) }}
          </span>
        </button>
      </div>

      <!-- Search Input -->
      <div class="w-full sm:w-64">
        <div class="relative">
          <Search class="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          <input type="text" v-model="searchQuery" placeholder="Search order ID, crop, farmer..." 
            class="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E2E4E7] rounded-xl text-xs font-bold text-[#1E2328] focus:outline-none focus:border-[#0B57D0] shadow-2xs" />
        </div>
      </div>
    </div>

    <!-- Orders List -->
    <div v-if="filteredOrders.length === 0" class="text-center py-12 bg-white rounded-2xl border border-[#E2E4E7] space-y-2">
      <Package class="w-10 h-10 text-gray-400 mx-auto" />
      <p class="font-bold text-sm text-[#1E2328]">No procurement orders found</p>
      <p class="text-xs text-[#5A6270]">Explore the marketplace to initiate a fresh agricultural procurement batch.</p>
      <router-link to="/buyer/marketplace" class="inline-block mt-2 px-4 py-2 bg-[#E69500] text-white rounded-xl text-xs font-extrabold hover:bg-[#D48900]">
        Go to Marketplace
      </router-link>
    </div>

    <!-- Redesigned B2B Order Card Hub -->
    <div v-else class="space-y-4">
      <div v-for="order in filteredOrders" :key="order.id" class="bg-white border border-[#E2E4E7] rounded-2xl shadow-2xs overflow-hidden transition-all hover:border-gray-300">
        <!-- Card Header -->
        <div class="p-5 border-b border-[#E2E4E7] space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-[#EDFAF2] rounded-2xl flex items-center justify-center text-2xl border border-[#C3EFCF] shrink-0">
                {{ order.listing?.cropEmoji || '🌾' }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-base font-black text-[#1E2328]">{{ order.listing?.cropName || 'Produce Batch' }}</h4>
                  <span class="px-2 py-0.5 bg-gray-100 text-[#5A6270] rounded-md text-[11px] font-bold">
                    {{ order.quantityKg?.toLocaleString() }} kg
                  </span>
                </div>
                <p class="text-xs text-[#5A6270] mt-0.5 flex flex-wrap items-center gap-2">
                  <span class="font-bold text-[#1E2328]">Order #{{ order.displayId }}</span>
                  <span>•</span>
                  <span>Farmer: <strong class="text-[#1E2328]">{{ order.farmer?.name || 'Dawit Bekele' }}</strong></span>
                  <span>•</span>
                  <span>Region: <strong class="text-[#1E2328]">{{ order.listing?.region || 'Oromia Co-op' }}</strong></span>
                </p>
              </div>
            </div>

            <!-- Price & Status Badge -->
            <div class="flex items-center gap-3 self-start sm:self-auto">
              <span :class="['px-3 py-1 rounded-full text-xs font-extrabold capitalize border shadow-2xs', statusBadgeClass(order.status || 'placed')]">
                {{ (order.status || 'placed').replace('_', ' ') }}
              </span>
              <span class="text-lg font-black text-[#0B57D0]">{{ formatETB(order.totalAmountETB || 0) }}</span>
            </div>
          </div>

          <!-- Escrow Guarantee Bar -->
          <div class="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
            <div class="flex items-center gap-2 text-[#0F5C2A] bg-[#EDFAF2] px-3 py-1.5 rounded-xl border border-[#C3EFCF]">
              <ShieldCheck class="w-4 h-4 text-[#1E9444]" />
              <span class="font-bold">Chapa Escrow Ref:</span>
              <span class="font-mono text-[11px] font-bold">{{ order.escrowReference }}</span>
            </div>

            <div class="flex items-center gap-2 text-xs">
              <button @click="toggleLifecycleDrawer(order.id)" 
                class="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1E2328] font-bold transition-colors flex items-center gap-1.5 cursor-pointer">
                <ChevronDown :class="['w-3.5 h-3.5 transition-transform', expandedLifecycleOrders[order.id] ? 'rotate-180' : '']" />
                <span>{{ expandedLifecycleOrders[order.id] ? 'Hide Progress' : 'View Order Lifecycle' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Inline PIN Action Box for Active Shipments -->
        <div v-if="order.status === 'in_transit' || order.status === 'dispatched'" 
          class="bg-amber-50/70 border-b border-amber-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-[#E69500] text-white flex items-center justify-center font-black">
              <Key class="w-4 h-4" />
            </div>
            <div>
              <p class="font-bold text-[#1E2328]">Driver Delivery PIN Verification Required</p>
              <p class="text-[11px] text-amber-800">
                Driver is delivering batch #{{ order.displayId }}. Enter PIN to release escrow payment.
              </p>
            </div>
          </div>
          <button @click="openDeliveryModal(order)" 
            class="px-4 py-2 bg-[#E69500] text-white rounded-xl font-extrabold hover:bg-[#D48900] transition-colors shadow-2xs flex items-center justify-center gap-1.5 shrink-0">
            <CheckCircle2 class="w-4 h-4" />
            <span>Enter Delivery PIN</span>
          </button>
        </div>

        <div v-else-if="order.status === 'awaiting_buyer_payment'" 
          class="bg-blue-50/70 border-b border-blue-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-[#0B57D0] text-white flex items-center justify-center font-black">
              <CreditCard class="w-4 h-4" />
            </div>
            <div>
              <p class="font-bold text-[#1E2328]">Payment Required (Escrow Lock)</p>
              <p class="text-[11px] text-blue-800">
                Farmer accepted the order. Please complete payment to secure funds in escrow.
              </p>
            </div>
          </div>
          <button @click="handlePayment(order.id)" 
            class="px-4 py-2 bg-[#0B57D0] text-white rounded-xl font-extrabold hover:bg-blue-800 transition-colors shadow-2xs flex items-center justify-center gap-1.5 shrink-0">
            <ShieldCheck class="w-4 h-4" />
            <span>{{ isProcessingPayment === order.id ? 'Loading...' : 'Pay with Chapa' }}</span>
          </button>
        </div>

        <div v-else-if="order.status === 'paid_in_escrow'" 
          class="bg-emerald-50/70 border-b border-emerald-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-[#1E9444] text-white flex items-center justify-center font-black">
              <Package class="w-4 h-4" />
            </div>
            <div>
              <p class="font-bold text-[#1E2328]">Payment Secured in Escrow</p>
              <p class="text-[11px] text-emerald-800">
                Waiting for the farmer to dispatch the shipment.
              </p>
            </div>
          </div>
        </div>

        <div v-else-if="order.status === 'pending_farmer_approval' || order.status === 'pending_payment'" 
          class="bg-gray-50/70 border-b border-gray-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-gray-200 text-gray-600 flex items-center justify-center font-black">
              <Clock class="w-4 h-4" />
            </div>
            <div>
              <p class="font-bold text-[#1E2328]">Awaiting Farmer Approval</p>
              <p class="text-[11px] text-gray-600">
                The farmer is reviewing the order. You can pay after they accept it.
              </p>
            </div>
          </div>
        </div>

        <div v-else-if="order.status === 'delivered' || order.status === 'completed'" 
          class="bg-emerald-50/70 border-b border-emerald-200/80 p-3 px-5 flex items-center gap-2 text-xs text-emerald-800 font-bold">
          <CheckCircle2 class="w-4 h-4 text-[#1E9444]" />
          <span>Delivery confirmed & Chapa Escrow funds released to farmer.</span>
        </div>

        <!-- Collapsible Vertical Lifecycle Drawer -->
        <div v-if="expandedLifecycleOrders[order.id]" class="p-5 bg-[#FAFAFA] border-t border-gray-100">
          <OrderTimeline :status="order.status" />
        </div>
      </div>
    </div>

    <!-- Delivery Confirmation & PIN Modal -->
    <div v-if="selectedOrderForPIN" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-2xl p-6 shadow-2xl space-y-4 text-[#1E2328]">
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center gap-2">
            <ShieldCheck class="w-5 h-5 text-[#1E9444]" />
            <h3 class="text-base font-bold">Confirm Delivery & Release Escrow</h3>
          </div>
          <button @click="selectedOrderForPIN = null" class="p-1 text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-2 text-xs">
          <p class="text-[#5A6270]">
            Please enter the 4-digit Driver Delivery PIN provided upon physical handover of 
            <span class="font-bold text-[#1E2328]">{{ selectedOrderForPIN.listing?.cropName }}</span>.
          </p>
          <div class="p-3 bg-[#F8F9FA] rounded-xl space-y-1">
            <div class="flex justify-between font-semibold">
              <span>Order ID:</span>
              <span class="font-bold">#{{ selectedOrderForPIN?.displayId || selectedOrderForPIN?.id }}</span>
            </div>
            <div class="flex justify-between font-semibold">
              <span>Escrow Release Payout:</span>
              <span class="text-[#0B57D0] font-black">{{ formatETB(selectedOrderForPIN.totalAmountETB) }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-xs font-bold text-[#1E2328]">4-Digit Delivery PIN</label>
          <input type="text" v-model="deliveryPin" maxlength="6" placeholder="e.g. 8921" 
            class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-center text-lg font-black tracking-widest focus:outline-none focus:border-[#0B57D0]" />
        </div>

        <div class="flex gap-2 pt-2">
          <button @click="selectedOrderForPIN = null" class="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold text-xs hover:bg-gray-50">
            Cancel
          </button>
          <button @click="submitDeliveryPin" class="flex-1 py-2.5 bg-[#1E9444] text-white rounded-xl font-bold text-xs hover:bg-[#0F5C2A] shadow-2xs">
            Confirm & Release Payout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Store, ShieldCheck, CheckCircle2, Package, Truck, Key, Search, ChevronDown, X, CreditCard, Clock } from 'lucide-vue-next'
import { useOrders } from '@/composables/useOrders'
import { formatETB } from '@/utils/helpers'
import { api } from '@/services/api'
import OrderTimeline from '@/components/shared/OrderTimeline.vue'

const { orders, confirmDelivery } = useOrders()

const activeTab = ref('all')
const searchQuery = ref('')
const selectedOrderForPIN = ref(null)
const deliveryPin = ref('')

const expandedLifecycleOrders = ref({})

const toggleLifecycleDrawer = (orderId) => {
  expandedLifecycleOrders.value[orderId] = !expandedLifecycleOrders.value[orderId]
}

const filterTabs = [
  { label: 'All Orders', value: 'all' },
  { label: 'Active Shipments', value: 'active' },
  { label: 'Completed Deliveries', value: 'completed' },
]

const activeShipmentsCount = computed(() => {
  return orders.value.filter(o => ['placed', 'confirmed', 'dispatched', 'in_transit'].includes(o.status)).length
})

const completedOrdersCount = computed(() => {
  return orders.value.filter(o => ['delivered', 'completed'].includes(o.status)).length
})

const totalEscrowLockedETB = computed(() => {
  return orders.value.reduce((acc, o) => acc + (o.totalAmountETB || 0), 0)
})

const getTabCount = (tab) => {
  if (tab === 'active') return activeShipmentsCount.value
  if (tab === 'completed') return completedOrdersCount.value
  return orders.value.length
}

const filteredOrders = computed(() => {
  let result = orders.value

  if (activeTab.value === 'active') {
    result = result.filter(o => ['placed', 'confirmed', 'dispatched', 'in_transit'].includes(o.status))
  } else if (activeTab.value === 'completed') {
    result = result.filter(o => ['delivered', 'completed'].includes(o.status))
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(o => 
      String(o.id || '').toLowerCase().includes(q) ||
      (o.listing?.cropName || '').toLowerCase().includes(q) ||
      (o.farmer?.name || '').toLowerCase().includes(q) ||
      (o.escrowReference || '').toLowerCase().includes(q)
    )
  }

  return result
})

const statusBadgeClass = (status) => {
  const map = {
    placed: 'bg-blue-50 text-blue-700 border-blue-200',
    pending_payment: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    pending_farmer_approval: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    awaiting_buyer_payment: 'bg-orange-50 text-orange-700 border-orange-200',
    paid_in_escrow: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    confirmed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dispatched: 'bg-amber-50 text-amber-700 border-amber-200',
    in_transit: 'bg-amber-100 text-amber-800 border-amber-300',
    delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    disputed: 'bg-red-50 text-red-700 border-red-200',
  }
  return map[status] || 'bg-gray-100 text-gray-700 border-gray-200'
}

const openDeliveryModal = (order) => {
  selectedOrderForPIN.value = order
  deliveryPin.value = ''
}

const submitDeliveryPin = () => {
  if (selectedOrderForPIN.value) {
    confirmDelivery(selectedOrderForPIN.value.id, deliveryPin.value)
    selectedOrderForPIN.value = null
    deliveryPin.value = ''
  }
}

const isProcessingPayment = ref(null)

const handlePayment = async (orderId) => {
  if (isProcessingPayment.value) return
  isProcessingPayment.value = orderId
  
  try {
    const numericId = String(orderId).replace('ORD-', '')
    const res = await api.initiateOrderPayment(numericId)
    if (res.checkout_url) {
      window.location.href = res.checkout_url
    }
  } catch (err) {
    alert(err.message || 'Payment initiation failed. Please try again.')
  } finally {
    isProcessingPayment.value = null
  }
}
</script>
