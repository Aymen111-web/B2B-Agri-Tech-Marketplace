<template>
  <div class="w-full flex flex-col min-h-full pb-8 max-w-5xl mx-auto space-y-4">
    <div class="bg-gradient-to-r from-[#062E15] via-[#0F5C2A] to-[#0B57D0] text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-[#E69500]/20 rounded-full blur-2xl pointer-events-none" />
      <div class="flex items-center justify-between relative z-10">
        <div>
          <h1 class="text-lg sm:text-xl font-black text-white tracking-tight">{{ $t('orders.farmerOrdersTitle') || 'Received Orders' }}</h1>
          <p class="text-xs text-[#C3EFCF] mt-0.5 font-medium">{{ $t('orders.farmerOrdersSub') || 'Orders placed by commercial buyers with escrow protection' }}</p>
        </div>
        <div class="px-3 py-1 bg-white/10 backdrop-blur-xs rounded-xl border border-white/20 text-xs font-bold text-white">
          {{ orders.length }} {{ $t('Total Orders') }}
        </div>
      </div>
    </div>

    <div v-if="orders.length === 0" class="text-center py-12 text-[#5A6270] dark:text-[#8B949E] bg-white dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] rounded-2xl p-6">
      <Package class="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-2 opacity-50" />
      <p class="font-bold text-sm text-[#1E2328] dark:text-[#F0F6FC]">{{ $t('orders.noOrdersTitle') }}</p>
    </div>

    <div v-else class="space-y-4">
      <div class="space-y-2.5">
        <div v-for="order in paginatedOrders" :key="order.id" 
          class="bg-white dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] rounded-xl px-4 py-3 shadow-2xs hover:border-[#1E9444]/50 transition-all">
          
          <!-- Compact Main Row -->
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <!-- Left: Icon + Order Batch & Buyer Info -->
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40 flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                <Package class="w-4 h-4" />
              </div>
              
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="text-sm font-black text-[#1E2328] dark:text-[#F0F6FC]">
                    #{{ order.displayId || order.id }}
                  </h3>
                  <span :class="['px-2 py-0.5 rounded-full text-[10px] font-black capitalize border shadow-2xs', statusBadgeClass(order.status)]">
                    {{ $t(order.status) }}
                  </span>
                  <span class="text-[11px] text-[#5A6270] dark:text-[#8B949E] font-medium">
                    {{ formatDate(order.createdAt || order.placedAt || order.created_at) }}
                  </span>
                </div>
                
                <div class="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-[11px] text-[#5A6270] dark:text-[#8B949E]">
                  <span>{{ $t('orders.buyer') }}: <strong class="text-[#1E2328] dark:text-[#F0F6FC]">{{ order.buyer?.name || $t('Commercial Buyer') }}</strong></span>
                  <span class="text-gray-300 dark:text-gray-600">•</span>
                  <span>{{ $t('orders.crop') }}: <strong class="text-[#1E2328] dark:text-[#F0F6FC]">{{ $t(order.listing?.cropName) || $t('Produce') }}</strong></span>
                  <span class="px-1.5 py-0.2 rounded bg-gray-100 dark:bg-[#21262D] font-bold text-[#1E2328] dark:text-[#F0F6FC] text-[10px]">
                    {{ order.quantityKg?.toLocaleString() }} kg
                  </span>
                </div>
              </div>
            </div>

            <!-- Middle / Right: Escrow + Price + Action Buttons -->
            <div class="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-[#30363D]">
              <!-- Escrow Status Pill -->
              <span v-if="order.status === 'disputed' || order.escrowStatus === 'disputed'" class="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 text-[11px] font-bold flex items-center gap-1">
                <ShieldAlert class="w-3 h-3 text-rose-600 dark:text-rose-400" />
                Escrow Disputed
              </span>
              <span v-else class="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40 text-[11px] font-bold capitalize">
                {{ $t('Escrow') }}: {{ $t(order.escrowStatus || 'held') }}
              </span>

              <!-- Simple Clean Delivery PIN Pill -->
              <div v-if="order.deliveryPin"
                @click.stop="copyPin(order.deliveryPin)"
                class="flex items-center gap-2 px-3 py-1 bg-[#EDFAF2] dark:bg-emerald-950/60 border border-[#C3EFCF] dark:border-emerald-800/80 rounded-xl cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all shadow-2xs group"
                :title="$t('Click to copy handover PIN')">
                <span class="text-[11px] font-black uppercase text-[#0F5C2A] dark:text-emerald-300">PIN:</span>
                <span class="font-mono text-base font-black text-[#1E9444] dark:text-emerald-400 tracking-widest">{{ order.deliveryPin }}</span>
                <span class="ml-0.5 p-1 rounded-lg bg-[#1E9444] text-white flex items-center justify-center shrink-0">
                  <Check v-if="copiedPin === order.deliveryPin" class="w-3.5 h-3.5" />
                  <Copy v-else class="w-3.5 h-3.5" />
                </span>
              </div>

              <!-- Price -->
              <div class="text-right min-w-[80px]">
                <span class="text-sm sm:text-base font-black text-[#1E9444] dark:text-emerald-400 tracking-tight block">
                  {{ formatETB(order.totalAmountETB) }}
                </span>
              </div>

              <!-- Action Buttons -->
              <button v-if="order.status === 'placed' || order.status === 'pending'" 
                @click="updateOrderStatus(order.id, 'accepted', 'Farmer accepted order parameters')" 
                class="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer">
                <CheckCircle2 class="w-3.5 h-3.5" />
                <span>{{ $t('Accept') }}</span>
              </button>

              <button v-else-if="order.status === 'paid_in_escrow'" 
                @click="dispatchOrder(order.id)" 
                class="px-3 py-1.5 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer">
                <Truck class="w-3.5 h-3.5" />
                <span>{{ $t('Dispatch') }}</span>
              </button>

              <!-- Timeline Toggle -->
              <button @click="toggleTimeline(order.id)" 
                class="p-1.5 rounded-lg bg-[#F0F1F2] dark:bg-[#21262D] hover:bg-gray-200 dark:hover:bg-[#30363D] text-[#1E2328] dark:text-[#F0F6FC] transition-colors cursor-pointer"
                :title="expandedOrderIds[order.id] ? 'Hide Progress' : 'View Order Timeline'">
                <ChevronDown :class="['w-4 h-4 transition-transform duration-200', expandedOrderIds[order.id] ? 'rotate-180' : '']" />
              </button>
            </div>
          </div>

          <!-- Admin Fraud / Resolution Verdict Banner for Farmer -->
          <div v-if="order.dispute" class="mt-3 p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 space-y-1.5 animate-in fade-in duration-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 font-extrabold text-xs text-rose-800 dark:text-rose-300">
                <ShieldAlert class="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Admin Arbitrage Report & Verdict</span>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                Status: {{ order.dispute.status }}
              </span>
            </div>
            
            <p v-if="order.dispute.description" class="text-xs text-[#1E2328] dark:text-[#F0F6FC]">
              <strong>Buyer Claim:</strong> {{ order.dispute.description }}
            </p>

            <div v-if="order.dispute.farmerResponse" class="p-2.5 bg-amber-50/70 dark:bg-amber-950/40 rounded-lg border border-amber-200/60 dark:border-amber-900/40 text-xs space-y-0.5">
              <span class="block font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider text-[9px]">Your Submitted Counter-Statement / Response</span>
              <p class="font-medium text-[#1E2328] dark:text-[#F0F6FC]">{{ order.dispute.farmerResponse }}</p>
            </div>

            <div v-else-if="['open', 'investigating'].includes(order.dispute.status)" class="pt-1">
              <button @click="openResponseModal(order.dispute)" class="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center gap-1 cursor-pointer">
                <MessageSquare class="w-3.5 h-3.5" />
                <span>Submit Counter-Statement to Admin</span>
              </button>
            </div>

            <div v-if="order.dispute.resolutionNotes" class="p-2.5 bg-white dark:bg-[#161B22] rounded-lg border border-rose-100 dark:border-rose-900/30 text-xs space-y-0.5">
              <span class="block font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[9px]">Official Admin Arbitrage Finding & Audit Notes</span>
              <p class="font-medium text-[#1E2328] dark:text-[#F0F6FC]">{{ order.dispute.resolutionNotes }}</p>
            </div>
          </div>

          <!-- Collapsible Timeline Drawer -->
          <div v-if="expandedOrderIds[order.id]" class="mt-3 pt-3 border-t border-gray-100 dark:border-[#30363D] space-y-2 animate-in fade-in duration-200">
            <OrderTimeline :status="order.status" />
            <p v-if="order.deliveryPin" class="text-xs font-medium text-[#5A6270] dark:text-[#8B949E] flex items-center gap-2 pt-1">
              <span>{{ $t('orders.handoffInstruction') }}:</span>
              <strong class="font-mono font-black text-sm text-[#1E9444] dark:text-emerald-400 tracking-widest bg-[#EDFAF2] dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-[#C3EFCF] dark:border-emerald-800/50 select-all">{{ order.deliveryPin }}</strong>
            </p>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <Pagination 
        :currentPage="currentPage" 
        :totalPages="totalPages" 
        :totalItems="orders.length" 
        :itemsPerPage="itemsPerPage" 
        @update:currentPage="currentPage = $event" 
      />
    </div>

    <!-- FARMER DISPUTE COUNTER-STATEMENT MODAL -->
    <div v-if="selectedDisputeForResponse" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white dark:bg-[#161B22] border border-gray-100 dark:border-[#30363D] rounded-3xl p-6 shadow-2xl space-y-4 text-[#1E2328] dark:text-[#F0F6FC]">
        <div class="flex items-center justify-between border-b dark:border-[#30363D] pb-3">
          <div class="flex items-center gap-2">
            <div class="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-800/40">
              <MessageSquare class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-black text-[#1E2328] dark:text-[#F0F6FC]">Submit Counter-Statement</h3>
              <p class="text-[11px] text-[#5A6270] dark:text-[#8B949E]">Provide your explanation or defense to the Admin</p>
            </div>
          </div>
          <button @click="selectedDisputeForResponse = null" class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div class="p-3 bg-gray-50 dark:bg-[#0D1117] rounded-xl border border-gray-200 dark:border-[#30363D]">
            <span class="block font-bold text-gray-500 dark:text-gray-400 text-[10px] uppercase">Buyer's Claim:</span>
            <p class="italic text-gray-700 dark:text-gray-300 mt-0.5">{{ selectedDisputeForResponse.description || 'No description provided.' }}</p>
          </div>

          <div class="space-y-1">
            <label class="font-bold text-[#1E2328] dark:text-[#F0F6FC]">Your Explanation / Excuse to Admin</label>
            <textarea v-model="farmerResponseText" rows="4" placeholder="Explain produce quality at harvest, weather/transport delays, or evidence..."
              class="w-full p-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-[#30363D] rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500 dark:text-[#F0F6FC]"></textarea>
          </div>
        </div>

        <div class="flex gap-2 pt-2 border-t border-gray-100 dark:border-[#30363D]">
          <button @click="selectedDisputeForResponse = null" class="flex-1 py-2.5 border border-gray-200 dark:border-[#30363D] text-[#1E2328] dark:text-[#F0F6FC] rounded-xl font-bold text-xs hover:bg-gray-50 dark:hover:bg-[#21262D]">
            Cancel
          </button>
          <button @click="submitFarmerResponse" :disabled="isSubmittingResponse" class="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer">
            <Loader2 v-if="isSubmittingResponse" class="w-4 h-4 animate-spin" />
            <span>Send to Admin</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Package, Truck, CheckCircle2, ChevronDown, Key, Copy, Check, ShieldAlert, MessageSquare, Loader2, X } from 'lucide-vue-next'
import { useOrders } from '@/composables/useOrders'
import { useAlertModal } from '@/composables/useAlertModal'
import { formatETB, formatDate } from '@/utils/helpers'
import { api } from '@/services/api'
import OrderTimeline from '@/components/shared/OrderTimeline.vue'
import Pagination from '@/components/common/Pagination.vue'

const { orders, dispatchOrder, updateOrderStatus, refreshOrders } = useOrders()
const { showAlert } = useAlertModal()

const expandedOrderIds = ref({})
const copiedPin = ref(null)
const selectedDisputeForResponse = ref(null)
const farmerResponseText = ref('')
const isSubmittingResponse = ref(false)

const openResponseModal = (dispute) => {
  selectedDisputeForResponse.value = dispute
  farmerResponseText.value = ''
}

const submitFarmerResponse = async () => {
  if (!selectedDisputeForResponse.value) return
  if (!farmerResponseText.value.trim()) {
    showAlert({ title: 'Response Required', message: 'Please enter your explanation or excuse for the admin.', type: 'warning' })
    return
  }

  isSubmittingResponse.value = true
  try {
    const disputeId = selectedDisputeForResponse.value.id
    await api.respondToPaymentException(disputeId, farmerResponseText.value)

    showAlert({
      title: 'Counter-Statement Submitted',
      message: 'Your explanation has been sent to the Admin for dispute review.',
      type: 'success'
    })

    selectedDisputeForResponse.value = null
    farmerResponseText.value = ''
    await refreshOrders()
  } catch (err) {
    showAlert({
      title: 'Submission Error',
      message: err.message || 'Failed to submit counter-statement to admin.',
      type: 'error'
    })
  } finally {
    isSubmittingResponse.value = false
  }
}

const toggleTimeline = (orderId) => {
  expandedOrderIds.value[orderId] = !expandedOrderIds.value[orderId]
}

const copyPin = (pin) => {
  if (!pin) return
  navigator.clipboard?.writeText(pin)
  copiedPin.value = pin
  setTimeout(() => {
    if (copiedPin.value === pin) copiedPin.value = null
  }, 2000)
}

const currentPage = ref(1)
const itemsPerPage = 6

const totalPages = computed(() => Math.ceil(orders.value.length / itemsPerPage) || 1)

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return orders.value.slice(start, start + itemsPerPage)
})

const statusBadgeClass = (status) => {
  const map = {
    placed: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
    dispatched: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    in_transit: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    delivered: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    completed: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
  }
  return map[status] || 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
}
</script>

