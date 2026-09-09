<template>
  <div class="space-y-6 pb-6">
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E4E7] dark:border-[#30363D] pb-4">
      <div>
        <h1 class="text-2xl font-black text-[#1E2328] dark:text-[#F0F6FC] tracking-tight">
          {{ $t('orders.title') }} 📦
        </h1>
        <p class="text-xs text-[#5A6270] dark:text-[#8B949E] mt-0.5">
          {{ $t('orders.subtitle') }}
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
      <div class="bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] rounded-2xl p-4 shadow-2xs">
        <div class="flex items-center justify-between text-[#5A6270] dark:text-[#8B949E]">
          <span class="text-[11px] font-bold uppercase">{{ $t('orders.totalOrders') }}</span>
          <Package class="w-4 h-4 text-[#0B57D0] dark:text-blue-400" />
        </div>
        <p class="text-2xl font-black text-[#1E2328] dark:text-[#F0F6FC] mt-1">{{ orders.length }}</p>
        <span class="text-[11px] text-[#5A6270] dark:text-[#8B949E] font-medium">{{ $t('B2B procurement batches') }}</span>
      </div>

      <div class="bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] rounded-2xl p-4 shadow-2xs">
        <div class="flex items-center justify-between text-[#5A6270] dark:text-[#8B949E]">
          <span class="text-[11px] font-bold uppercase">{{ $t('orders.activeShipments') }}</span>
          <Truck class="w-4 h-4 text-[#E69500]" />
        </div>
        <p class="text-2xl font-black text-[#1E2328] dark:text-[#F0F6FC] mt-1">{{ activeShipmentsCount }}</p>
        <span class="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">{{ $t('En route or dispatched') }}</span>
      </div>

      <div class="bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] rounded-2xl p-4 shadow-2xs">
        <div class="flex items-center justify-between text-[#5A6270] dark:text-[#8B949E]">
          <span class="text-[11px] font-bold uppercase">{{ $t('orders.escrowLocked') }}</span>
          <ShieldCheck class="w-4 h-4 text-[#1E9444] dark:text-emerald-400" />
        </div>
        <p class="text-2xl font-black text-[#1E2328] dark:text-[#F0F6FC] mt-1">{{ formatETB(totalEscrowLockedETB) }}</p>
        <span class="text-[11px] text-[#1E9444] dark:text-emerald-400 font-semibold">{{ $t('Secured capital') }}</span>
      </div>

      <div class="bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] rounded-2xl p-4 shadow-2xs">
        <div class="flex items-center justify-between text-[#5A6270] dark:text-[#8B949E]">
          <span class="text-[11px] font-bold uppercase">{{ $t('orders.completed') }}</span>
          <CheckCircle2 class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p class="text-2xl font-black text-[#1E2328] dark:text-[#F0F6FC] mt-1">{{ completedOrdersCount }}</p>
        <span class="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">{{ $t('Funds released to farmer') }}</span>
      </div>
    </div>

    <!-- Filter Tabs & Search Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <!-- Tabs -->
      <div class="flex flex-wrap gap-2">
        <button v-for="tab in filterTabs" :key="tab.value" @click="activeTab = tab.value"
          :class="['px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border cursor-pointer flex items-center gap-1.5',
            activeTab === tab.value ? 'bg-[#0B57D0] text-white border-[#0B57D0] shadow-xs' : 'bg-white dark:bg-[#161B22] text-[#5A6270] dark:text-[#8B949E] border-[#E2E4E7] dark:border-[#30363D] hover:border-[#0B57D0]']">
          <span>{{ $t(tab.label) }}</span>
          <span v-if="getTabCount(tab.value) > 0" 
            :class="['px-1.5 py-0.2 rounded-full text-[10px] font-bold', activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-[#21262D] text-[#5A6270] dark:text-[#8B949E]']">
            {{ getTabCount(tab.value) }}
          </span>
        </button>
      </div>

      <!-- Search Input -->
      <div class="w-full sm:w-64">
        <div class="relative">
          <Search class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 absolute left-3 top-2.5" />
          <input type="text" v-model="searchQuery" :placeholder="$t('orders.searchOrders')" 
            class="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] rounded-xl text-xs font-bold text-[#1E2328] dark:text-[#F0F6FC] focus:outline-none focus:border-[#0B57D0] shadow-2xs" />
        </div>
      </div>
    </div>

    <!-- Orders List -->
    <div v-if="filteredOrders.length === 0" class="text-center py-12 bg-white dark:bg-[#161B22] rounded-2xl border border-[#E2E4E7] dark:border-[#30363D] space-y-2">
      <Package class="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto" />
      <p class="font-bold text-sm text-[#1E2328] dark:text-[#F0F6FC]">{{ $t('orders.noOrdersTitle') }}</p>
      <p class="text-xs text-[#5A6270] dark:text-[#8B949E]">{{ $t('orders.noOrdersSub') }}</p>
      <router-link to="/buyer/marketplace" class="inline-block mt-2 px-4 py-2 bg-[#E69500] text-white rounded-xl text-xs font-extrabold hover:bg-[#D48900]">
        Go to Marketplace
      </router-link>
    </div>

    <!-- Redesigned B2B Compact Horizontal Order Cards -->
    <div v-else class="space-y-4">
      <div class="space-y-2.5">
        <div v-for="order in paginatedOrders" :key="order.id" 
          class="bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] rounded-xl px-4 py-3 shadow-2xs hover:border-[#0B57D0]/50 transition-all">
          
          <!-- Main Compact Horizontal Row -->
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <!-- Left: Crop Avatar + Produce & Parties -->
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 sm:w-10 sm:h-10 bg-[#EDFAF2] dark:bg-emerald-950/40 rounded-xl flex items-center justify-center text-xl border border-[#C3EFCF] dark:border-emerald-800/60 shrink-0 shadow-2xs">
                {{ order.listing?.cropEmoji || '🌾' }}
              </div>
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h4 class="text-sm font-black text-[#1E2328] dark:text-[#F0F6FC]">
                    {{ $t(order.listing?.cropName) || $t('Produce Batch') }}
                  </h4>
                  <span class="px-1.5 py-0.2 rounded bg-gray-100 dark:bg-[#21262D] text-[#5A6270] dark:text-[#8B949E] text-[10px] font-bold">
                    {{ order.quantityKg?.toLocaleString() }} kg
                  </span>
                  <span class="text-xs font-mono font-bold text-[#1E2328] dark:text-[#F0F6FC]">
                    #{{ order.displayId }}
                  </span>
                  <span :class="['px-2 py-0.5 rounded-full text-[10px] font-black capitalize border shadow-2xs', statusBadgeClass(order.status || 'placed')]">
                    {{ formatStatusLabel(order.status) }}
                  </span>
                </div>
                
                <div class="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-[11px] text-[#5A6270] dark:text-[#8B949E]">
                  <span>{{ $t('orders.farmer') }}: <strong class="text-[#1E2328] dark:text-[#F0F6FC]">{{ order.farmer?.name || 'Dawit Bekele' }}</strong></span>
                  <span class="text-gray-300 dark:text-gray-600">•</span>
                  <span>{{ $t('Region') }}: <strong class="text-[#1E2328] dark:text-[#F0F6FC]">{{ order.listing?.region || 'Oromia' }}</strong></span>
                  <span class="text-gray-300 dark:text-gray-600 hidden sm:inline">•</span>
                  <span class="font-mono text-[10px] hidden sm:inline">{{ order.escrowReference }}</span>
                </div>
              </div>
            </div>

            <!-- Middle / Right: Escrow + Price + Actions -->
            <div class="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-[#30363D]">
              <!-- Escrow Tag -->
              <div class="flex items-center gap-1.5 text-[#0F5C2A] dark:text-emerald-300 bg-[#EDFAF2] dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-[#C3EFCF] dark:border-emerald-800/60 text-[11px] font-bold">
                <ShieldCheck class="w-3.5 h-3.5 text-[#1E9444] dark:text-emerald-400" />
                <span>Escrow Secured</span>
              </div>

              <!-- Price -->
              <div class="text-right min-w-[85px]">
                <span class="text-sm sm:text-base font-black text-[#0B57D0] dark:text-blue-400 tracking-tight block">
                  {{ formatETB(order.totalAmountETB || 0) }}
                </span>
              </div>

              <!-- Quick Actions based on order status -->
              <!-- Enter PIN for Driver handoff / Dispute -->
              <div v-if="order.status === 'in_transit' || order.status === 'dispatched'" class="flex items-center gap-1.5 shrink-0">
                <button 
                  @click="openDeliveryModal(order)" 
                  class="px-3 py-1.5 bg-[#E69500] text-white rounded-xl text-xs font-bold hover:bg-[#D48900] transition-colors shadow-2xs flex items-center gap-1 shrink-0 cursor-pointer">
                  <Key class="w-3.5 h-3.5" />
                  <span>Enter PIN</span>
                </button>
                <button 
                  @click="openDisputeModal(order)" 
                  class="px-2.5 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-2xs flex items-center gap-1 shrink-0 cursor-pointer"
                  title="Report quality mismatch or issue">
                  <AlertTriangle class="w-3.5 h-3.5" />
                  <span>Dispute</span>
                </button>
              </div>

              <!-- Paid in Escrow - Awaiting Farmer Dispatch -->
              <div v-else-if="order.status === 'paid_in_escrow'" class="flex items-center gap-1.5 shrink-0">
                <span class="px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-1">
                  <Clock class="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>Awaiting Dispatch</span>
                </span>
                <button 
                  @click="openDisputeModal(order)" 
                  class="px-2 py-1 bg-gray-50 dark:bg-[#21262D] text-red-600 dark:text-red-400 border border-gray-200 dark:border-[#30363D] rounded-xl text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  title="Dispute escrow">
                  <AlertTriangle class="w-3.5 h-3.5" />
                  <span>Dispute</span>
                </button>
              </div>

              <!-- Escrow Disputed Status -->
              <div v-else-if="order.status === 'disputed' || order.isDisputed" class="flex items-center gap-1.5 shrink-0">
                <span class="px-2.5 py-1.5 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 rounded-xl text-xs font-bold flex items-center gap-1">
                  <AlertCircle class="w-3.5 h-3.5 text-red-600" />
                  <span>Escrow Frozen (Under Review)</span>
                </span>
              </div>

              <!-- Dispute Escrow Button for Paid/In-Transit/Delivered Orders -->
              <button v-if="['paid_in_escrow', 'in_transit', 'dispatched', 'delivered', 'completed', 'inspection_rejected'].includes(order.status)"
                @click="openDisputeModal(order)"
                class="px-2.5 py-1.5 border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-1 shrink-0 cursor-pointer"
                title="Report Quality/Delivery Issue">
                <AlertTriangle class="w-3.5 h-3.5" />
                <span>Dispute Escrow</span>
              </button>

              <!-- Payment Needed -->
              <div v-else-if="['pending_payment', 'awaiting_buyer_payment', 'placed'].includes(order.status)" class="flex items-center gap-1.5 shrink-0">
                <button @click="verifyPayment(order)" 
                  class="px-2.5 py-1.5 bg-white dark:bg-[#161B22] text-[#0B57D0] dark:text-blue-400 border border-[#0B57D0] dark:border-blue-400 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer">
                  <RefreshCw v-if="isVerifyingPayment === (order.displayId || order.id)" class="w-3.5 h-3.5 animate-spin" />
                  <span v-else>Verify</span>
                </button>
                <button @click="handlePayment(order)" 
                  class="px-3 py-1.5 bg-[#0B57D0] text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer">
                  <CreditCard class="w-3.5 h-3.5" />
                  <span>{{ isProcessingPayment === (order.displayId || order.id) ? '...' : 'Pay Chapa' }}</span>
                </button>
              </div>

              <!-- Toggle Lifecycle Drawer -->
              <button @click="toggleLifecycleDrawer(order.id)" 
                class="p-1.5 rounded-lg bg-gray-100 dark:bg-[#21262D] hover:bg-gray-200 dark:hover:bg-[#30363D] text-[#1E2328] dark:text-[#F0F6FC] transition-colors cursor-pointer"
                :title="expandedLifecycleOrders[order.id] ? 'Hide Progress' : 'View Order Lifecycle'">
                <ChevronDown :class="['w-4 h-4 transition-transform duration-200', expandedLifecycleOrders[order.id] ? 'rotate-180' : '']" />
              </button>
            </div>
          </div>

          <!-- Admin Fraud / Resolution Verdict Banner for Buyer -->
          <div v-if="order.dispute" class="mt-3 p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 space-y-1.5 animate-in fade-in duration-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 font-extrabold text-xs text-rose-800 dark:text-rose-300">
                <ShieldAlert class="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Admin Dispute Inspection & Verdict</span>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                Status: {{ order.dispute.status }}
              </span>
            </div>

            <div v-if="order.dispute.resolutionNotes" class="p-2.5 bg-white dark:bg-[#161B22] rounded-lg border border-rose-100 dark:border-rose-900/30 text-xs space-y-0.5">
              <span class="block font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[9px]">Official Admin Findings & Resolution Notes</span>
              <p class="font-medium text-[#1E2328] dark:text-[#F0F6FC]">{{ order.dispute.resolutionNotes }}</p>
            </div>
          </div>

          <!-- Collapsible Order Lifecycle Drawer -->
          <div v-if="expandedLifecycleOrders[order.id]" class="mt-3 pt-3 border-t border-gray-100 dark:border-[#30363D] space-y-2 animate-in fade-in duration-200">
            <OrderTimeline :status="order.status" />
            <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#5A6270] dark:text-[#8B949E] pt-1">
              <span>{{ $t('Chapa Escrow Ref') }}: <strong class="font-mono text-[#1E2328] dark:text-[#F0F6FC]">{{ order.escrowReference }}</strong></span>
              <span v-if="order.status === 'delivered' || order.status === 'completed'" class="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 class="w-3.5 h-3.5" /> Delivery verified & funds released to farmer.
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Controls -->
      <Pagination 
        :currentPage="currentPage" 
        :totalPages="totalPages" 
        :totalItems="filteredOrders.length" 
        :itemsPerPage="itemsPerPage" 
        @update:currentPage="currentPage = $event" 
      />
    </div>

    <!-- Delivery Confirmation & PIN Modal -->
    <div v-if="selectedOrderForPIN" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white dark:bg-[#161B22] border dark:border-[#30363D] rounded-2xl p-6 shadow-2xl space-y-4 text-[#1E2328] dark:text-[#F0F6FC]">
        <div class="flex items-center justify-between border-b dark:border-[#30363D] pb-3">
          <div class="flex items-center gap-2">
            <ShieldCheck class="w-5 h-5 text-[#1E9444] dark:text-emerald-400" />
            <h3 class="text-base font-bold">{{ $t('orders.confirmDelivery') }}</h3>
          </div>
          <button @click="selectedOrderForPIN = null" class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-2 text-xs">
          <p class="text-[#5A6270] dark:text-[#8B949E]">
            {{ $t('orders.handoffInstruction') }}
            <span class="font-bold text-[#1E2328] dark:text-[#F0F6FC]">{{ $t(selectedOrderForPIN.listing?.cropName) }}</span>.
          </p>
          <div class="p-3 bg-[#F8F9FA] dark:bg-[#21262D] rounded-xl space-y-1">
            <div class="flex justify-between font-semibold">
              <span>{{ $t('orders.orderId') }}:</span>
              <span class="font-bold">#{{ selectedOrderForPIN?.displayId || selectedOrderForPIN?.id }}</span>
            </div>
            <div class="flex justify-between font-semibold">
              <span>{{ $t('Escrow Release Payout') }}:</span>
              <span class="text-[#0B57D0] font-black">{{ formatETB(selectedOrderForPIN.totalAmountETB) }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-xs font-bold text-[#1E2328] dark:text-[#F0F6FC]">{{ $t('orders.deliveryPin') }}</label>
          <input type="text" v-model="deliveryPin" maxlength="6" placeholder="e.g. 8921" 
            class="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] rounded-xl text-center text-lg font-black tracking-widest focus:outline-none focus:border-[#0B57D0] dark:text-[#F0F6FC]" />
        </div>

        <div class="flex gap-2 pt-2">
          <button @click="selectedOrderForPIN = null" :disabled="isSubmittingPin" class="flex-1 py-2.5 border border-gray-300 dark:border-[#30363D] text-[#1E2328] dark:text-[#F0F6FC] rounded-xl font-bold text-xs hover:bg-gray-50 dark:hover:bg-[#21262D] cursor-pointer">
            {{ $t('Cancel') }}
          </button>
          <button @click="submitDeliveryPin" :disabled="isSubmittingPin" class="flex-1 py-2.5 bg-[#1E9444] text-white rounded-xl font-bold text-xs hover:bg-[#0F5C2A] shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
            <RefreshCw v-if="isSubmittingPin" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ isSubmittingPin ? 'Verifying...' : 'Confirm & Release Payout' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- FILE DISPUTE / ESCROW EXCEPTION MODAL -->
    <div v-if="selectedOrderForDispute" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white dark:bg-[#161B22] border border-gray-100 dark:border-[#30363D] rounded-3xl p-6 shadow-2xl space-y-4 text-[#1E2328] dark:text-[#F0F6FC]">
        <div class="flex items-center justify-between border-b dark:border-[#30363D] pb-3">
          <div class="flex items-center gap-2">
            <div class="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-800/40">
              <ShieldAlert class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-black text-[#1E2328] dark:text-[#F0F6FC]">Report Issue / Dispute Escrow</h3>
              <p class="text-[11px] text-[#5A6270] dark:text-[#8B949E]">Order #{{ selectedOrderForDispute.displayId || selectedOrderForDispute.id }}</p>
            </div>
          </div>
          <button @click="closeDisputeModal" class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div class="space-y-1">
            <label class="font-bold text-[#1E2328] dark:text-[#F0F6FC]">Claim Category</label>
            <select v-model="disputeCategory" class="w-full px-3 py-2 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-[#30363D] rounded-xl font-bold dark:text-[#F0F6FC]">
              <option value="produce_damaged">Produce Damaged / Spoiled in Transit</option>
              <option value="quality_mismatch">Produce Quality Mismatch / Damaged Batch</option>
              <option value="delivery_delay">Major Delivery Delay / Non-Arrival</option>
              <option value="wrong_quantity">Quantity Shortfall / Weight Deficit</option>
              <option value="dispute">General Financial Dispute</option>
              <option value="other">Other Transport Exception</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="font-bold text-[#1E2328] dark:text-[#F0F6FC]">Incident Description & Audit Evidence</label>
            <textarea v-model="disputeDescription" rows="4" placeholder="Provide detailed explanation of the produce condition, photos, or delivery failure..."
              class="w-full p-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-[#30363D] rounded-xl text-xs font-medium focus:outline-none focus:border-rose-500 dark:text-[#F0F6FC]"></textarea>
          </div>
        </div>

        <div class="flex gap-2 pt-2 border-t border-gray-100 dark:border-[#30363D]">
          <button @click="closeDisputeModal" class="flex-1 py-2.5 border border-gray-200 dark:border-[#30363D] text-[#1E2328] dark:text-[#F0F6FC] rounded-xl font-bold text-xs hover:bg-gray-50 dark:hover:bg-[#21262D] cursor-pointer">
            Cancel
          </button>
          <button @click="submitDispute" :disabled="isSubmittingDispute" class="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer">
            <Loader2 v-if="isSubmittingDispute" class="w-4 h-4 animate-spin" />
            <span>{{ isSubmittingDispute ? 'Freezing Escrow...' : 'Submit Dispute Claim' }}</span>
          </button>
        </div>
      </div>
    </div>


    <!-- Chapa Payment Progress & Live Verification Modal -->
    <div v-if="activePaymentOrder" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div class="max-w-md w-full bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] rounded-2xl p-6 shadow-2xl space-y-4 text-[#1E2328] dark:text-[#F0F6FC]">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-[#30363D] pb-3">
          <div class="flex items-center gap-2">
            <div :class="activePaymentStatus === 'success' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-[#1E9444] dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-950/50 text-[#0B57D0] dark:text-blue-400'" class="w-8 h-8 rounded-xl flex items-center justify-center">
              <CheckCircle2 v-if="activePaymentStatus === 'success'" class="w-5 h-5" />
              <CreditCard v-else class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-base font-bold leading-tight">
                {{ activePaymentStatus === 'success' ? 'Payment Verified & Secured' : 'Chapa Payment in Progress' }}
              </h3>
              <p class="text-[11px] text-[#5A6270] dark:text-[#8B949E]">
                {{ activePaymentStatus === 'success' ? 'Escrow funds successfully locked' : 'Waiting for confirmation in new tab' }}
              </p>
            </div>
          </div>
          <button @click="closePaymentModal" class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Order Snapshot Details -->
        <div class="p-3 bg-[#F8F9FA] dark:bg-[#21262D] rounded-xl border border-gray-100 dark:border-[#30363D] space-y-1.5 text-xs">
          <div class="flex justify-between font-semibold text-[#5A6270] dark:text-[#8B949E]">
            <span>{{ $t('orders.orderId') }}:</span>
            <span class="font-bold text-[#1E2328] dark:text-[#F0F6FC]">#{{ activePaymentOrder.displayId || activePaymentOrder.id }}</span>
          </div>
          <div class="flex justify-between font-semibold">
            <span class="text-[#5A6270] dark:text-[#8B949E]">Order Total:</span>
            <span class="text-[#0B57D0] dark:text-blue-400 font-black">{{ formatETB(activePaymentOrder.totalAmountETB || activePaymentOrder.total_amount || 0) }}</span>
          </div>
          <div v-if="activePaymentResult?.receipt_url || activePaymentResult?.payment?.receipt_url" class="flex justify-between font-semibold pt-1 border-t border-gray-200 dark:border-[#30363D]">
            <span class="text-[#5A6270] dark:text-[#8B949E]">Chapa Receipt:</span>
            <a :href="activePaymentResult.receipt_url || activePaymentResult.payment.receipt_url" target="_blank" class="text-[#0B57D0] dark:text-blue-400 hover:underline flex items-center gap-1 font-bold">
              <span>View Online Receipt</span>
              <ExternalLink class="w-3 h-3" />
            </a>
          </div>
        </div>

        <!-- State 1: Awaiting / Verifying -->
        <div v-if="activePaymentStatus !== 'success'" class="space-y-3 pt-1">
          <div class="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs">
            <RefreshCw class="w-4 h-4 text-[#0B57D0] dark:text-blue-400 animate-spin shrink-0" />
            <div class="text-[#1E2328] dark:text-[#F0F6FC] leading-relaxed">
              <span class="font-bold block">Chapa checkout is open in another tab</span>
              <span class="text-[11px] text-[#5A6270] dark:text-[#8B949E]">
                Complete your payment in the Chapa tab. We will automatically detect and lock your escrow payment here without reloading or redirecting you. Keep the receipt tab open to view or download it!
              </span>
            </div>
          </div>

          <div v-if="activePaymentErrorMessage" class="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-800 dark:text-amber-300 text-xs">
            {{ activePaymentErrorMessage }}
          </div>

          <div class="flex flex-col gap-2 pt-1">
            <button 
              @click="checkActivePayment(true)" 
              :disabled="activePaymentStatus === 'verifying'"
              class="w-full py-2.5 bg-[#0B57D0] text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw :class="['w-3.5 h-3.5', activePaymentStatus === 'verifying' ? 'animate-spin' : '']" />
              <span>{{ activePaymentStatus === 'verifying' ? 'Checking status...' : 'Check Payment Status Now' }}</span>
            </button>
            <div class="flex gap-2">
              <button 
                @click="reopenPaymentTab" 
                class="flex-1 py-2 border border-gray-300 dark:border-[#30363D] text-[#1E2328] dark:text-[#F0F6FC] rounded-xl font-bold text-xs hover:bg-gray-50 dark:hover:bg-[#21262D] flex items-center justify-center gap-1 cursor-pointer"
              >
                <ExternalLink class="w-3.5 h-3.5" />
                <span>Re-open Tab</span>
              </button>
              <button 
                @click="closePaymentModal" 
                class="flex-1 py-2 border border-gray-300 dark:border-[#30363D] text-[#5A6270] dark:text-[#8B949E] rounded-xl font-bold text-xs hover:bg-gray-50 dark:hover:bg-[#21262D] cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>

        <!-- State 2: Success! -->
        <div v-else class="space-y-3 pt-1">
          <div class="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs">
            <ShieldCheck class="w-5 h-5 text-[#1E9444] dark:text-emerald-400 shrink-0" />
            <div class="text-[#1E2328] dark:text-[#F0F6FC] leading-relaxed">
              <span class="font-bold text-[#1E9444] dark:text-emerald-400 block">Funds Protected in Escrow</span>
              <span class="text-[11px] text-[#5A6270] dark:text-[#8B949E]">
                Payment has been confirmed. Your produce order is active and funds will only be released to the farmer after PIN delivery handoff.
              </span>
            </div>
          </div>

          <div class="p-2.5 bg-blue-50/60 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30 text-[11px] text-[#5A6270] dark:text-[#8B949E] flex items-center gap-2">
            <FileText class="w-4 h-4 text-[#0B57D0] dark:text-blue-400 shrink-0" />
            <span>Your official Chapa receipt tab remains open in your browser so you can view, save, or download it whenever you want.</span>
          </div>

          <div class="flex gap-2 pt-1">
            <a 
              v-if="activePaymentResult?.receipt_url || activePaymentResult?.payment?.receipt_url"
              :href="activePaymentResult.receipt_url || activePaymentResult.payment.receipt_url" 
              target="_blank"
              class="flex-1 py-2.5 bg-white dark:bg-[#161B22] border border-[#0B57D0] dark:border-blue-400 text-[#0B57D0] dark:text-blue-400 rounded-xl font-bold text-xs hover:bg-blue-50 dark:hover:bg-blue-950/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink class="w-3.5 h-3.5" />
              <span>Chapa Receipt</span>
            </a>
            <button 
              @click="closePaymentModal" 
              class="flex-1 py-2.5 bg-[#1E9444] text-white rounded-xl font-bold text-xs hover:bg-[#0F5C2A] shadow-2xs transition-colors cursor-pointer"
            >
              Done / View Orders
            </button>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Store, ShieldCheck, CheckCircle2, Package, Truck, Key, Search, ChevronDown, X, CreditCard, Clock, RefreshCw, ExternalLink, FileText, AlertTriangle, AlertCircle, ShieldAlert, Loader2 } from 'lucide-vue-next'
import { useOrders } from '@/composables/useOrders'
import { useAlertModal } from '@/composables/useAlertModal'
import { formatETB } from '@/utils/helpers'
import { api } from '@/services/api'
import OrderTimeline from '@/components/shared/OrderTimeline.vue'
import Pagination from '@/components/common/Pagination.vue'

const { orders, confirmDelivery, refreshOrders } = useOrders()
const { showAlert } = useAlertModal()

const activeTab = ref('all')
const searchQuery = ref('')
const selectedOrderForPIN = ref(null)
const deliveryPin = ref('')
const isSubmittingPin = ref(false)
const currentPage = ref(1)
const itemsPerPage = 6

// Dispute Modal State
const selectedOrderForDispute = ref(null)
const disputeCategory = ref('produce_damaged')
const disputeDescription = ref('')
const isSubmittingDispute = ref(false)

const openDisputeModal = (order) => {
  selectedOrderForDispute.value = order
  disputeCategory.value = 'produce_damaged'
  disputeDescription.value = ''
}

const closeDisputeModal = () => {
  selectedOrderForDispute.value = null
  disputeDescription.value = ''
  isSubmittingDispute.value = false
}

const submitDispute = async () => {
  if (!selectedOrderForDispute.value) return
  if (!disputeDescription.value.trim()) {
    showAlert({ title: 'Description Required', message: 'Please provide details about the quality or delivery issue.', type: 'warning' })
    return
  }
  
  isSubmittingDispute.value = true
  const targetOrder = selectedOrderForDispute.value
  const orderDbId = targetOrder.orderId || targetOrder.id
  
  try {
    const payload = {
      order_id: orderDbId,
      type: disputeCategory.value,
      description: disputeDescription.value.trim()
    }
    await api.filePaymentException(payload)
    
    if (typeof targetOrder === 'object') {
      targetOrder.status = 'disputed'
      targetOrder.isDisputed = true
      targetOrder.payoutStatus = 'locked'
    }
    
    showAlert({
      title: 'Escrow Frozen & Disputed',
      message: 'A dispute has been filed and escrow payout is frozen. Platform administrators will arbitrate your case.',
      type: 'success'
    })
    closeDisputeModal()
    await refreshOrders()
  } catch (err) {
    showAlert({
      title: 'Dispute Submission Failed',
      message: err.message || 'Failed to file dispute. Please try again.',
      type: 'error'
    })
  } finally {
    isSubmittingDispute.value = false
  }
}

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

const totalPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage) || 1)

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredOrders.value.slice(start, start + itemsPerPage)
})

watch([activeTab, searchQuery], () => {
  currentPage.value = 1
})

const statusBadgeClass = (status) => {
  const map = {
    placed: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
    pending_payment: 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/60',
    pending_farmer_approval: 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/60',
    awaiting_buyer_payment: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/60',
    paid_in_escrow: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    confirmed: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
    dispatched: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    in_transit: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700/60',
    delivered: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    completed: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700/60',
    disputed: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60',
  }
  return map[status] || 'bg-gray-100 dark:bg-[#21262D] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#30363D]'
}

const formatStatusLabel = (status) => {
  const map = {
    delivered: 'Completed Handoff',
    completed: 'Completed Handoff',
    paid_in_escrow: 'Paid in Escrow',
    awaiting_buyer_payment: 'Awaiting Payment',
    pending_payment: 'Pending Payment',
    in_transit: 'In Transit',
    dispatched: 'Dispatched',
  }
  return map[status] || (status || 'placed').replace(/_/g, ' ')
}

const openDeliveryModal = (order) => {
  selectedOrderForPIN.value = order
  deliveryPin.value = ''
}

const submitDeliveryPin = async () => {
  if (selectedOrderForPIN.value) {
    const targetOrder = selectedOrderForPIN.value
    if (!deliveryPin.value || deliveryPin.value.trim().length < 4) {
      showAlert({ title: 'Invalid PIN', message: 'Please enter a valid 6-digit delivery PIN.', type: 'warning' })
      return
    }
    isSubmittingPin.value = true
    try {
      const orderDbId = targetOrder.orderId || targetOrder.id
      await confirmDelivery(orderDbId, deliveryPin.value.trim())
      if (typeof targetOrder === 'object') {
        targetOrder.status = 'completed'
        targetOrder.escrowStatus = 'released'
        targetOrder.payoutStatus = 'released'
      }
      showAlert({ 
        title: 'Handoff Confirmed', 
        message: 'Delivery PIN verified successfully! Escrow funds have been released to the farmer.', 
        type: 'success' 
      })
      selectedOrderForPIN.value = null
      deliveryPin.value = ''
      await refreshOrders()
    } catch (err) {
      showAlert({ 
        title: 'Verification Failed', 
        message: err.response?.data?.message || err.message || 'Invalid delivery PIN. Please check the code with the driver and try again.', 
        type: 'error' 
      })
    } finally {
      isSubmittingPin.value = false
    }
  }
}

const isProcessingPayment = ref(null)
const isVerifyingPayment = ref(null)

// Active payment tracking state
const activePaymentOrder = ref(null)
const activePaymentCheckoutUrl = ref(null)
const activePaymentStatus = ref('awaiting') // 'awaiting' | 'verifying' | 'success'
const activePaymentResult = ref(null)
const activePaymentErrorMessage = ref(null)
let paymentPollingInterval = null

const stopPaymentPolling = () => {
  if (paymentPollingInterval) {
    clearInterval(paymentPollingInterval)
    paymentPollingInterval = null
  }
}

const checkActivePayment = async (isManual = false) => {
  if (!activePaymentOrder.value) return
  const targetId = activePaymentOrder.value.displayId || activePaymentOrder.value.id
  if (isManual) {
    activePaymentStatus.value = 'verifying'
    activePaymentErrorMessage.value = null
  }
  
  try {
    const res = await api.verifyPendingPaymentForOrder(targetId)
    const isSuccess = res && (
      res.status === 'success' || 
      res.message?.toLowerCase().includes('verified') || 
      res.payment?.status === 'confirmed'
    )
    if (isSuccess) {
      stopPaymentPolling()
      activePaymentStatus.value = 'success'
      activePaymentResult.value = res
      
      if (activePaymentOrder.value) {
        activePaymentOrder.value.status = 'paid_in_escrow'
        activePaymentOrder.value.escrowStatus = 'held'
      }
      await refreshOrders()
    } else if (isManual) {
      activePaymentStatus.value = 'awaiting'
      activePaymentErrorMessage.value = res?.message || 'Payment is still processing on Chapa.'
    }
  } catch (err) {
    if (isManual) {
      activePaymentStatus.value = 'awaiting'
      activePaymentErrorMessage.value = err.message || 'Payment is not yet confirmed. Please complete the steps in the Chapa tab.'
    }
  }
}

const startPaymentPolling = (targetId) => {
  stopPaymentPolling()
  let ticks = 0
  paymentPollingInterval = setInterval(async () => {
    ticks++
    if (ticks > 100 || !activePaymentOrder.value || activePaymentStatus.value === 'success') {
      stopPaymentPolling()
      return
    }
    await checkActivePayment(false)
  }, 3000)
}

const reopenPaymentTab = () => {
  if (activePaymentCheckoutUrl.value) {
    window.open(activePaymentCheckoutUrl.value, '_blank')
  }
}

const closePaymentModal = () => {
  stopPaymentPolling()
  activePaymentOrder.value = null
  activePaymentCheckoutUrl.value = null
  activePaymentStatus.value = 'awaiting'
  activePaymentResult.value = null
  activePaymentErrorMessage.value = null
}

const handleTabFocus = () => {
  if (activePaymentOrder.value && activePaymentStatus.value === 'awaiting') {
    checkActivePayment(false)
  }
}

onMounted(() => {
  window.addEventListener('focus', handleTabFocus)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      handleTabFocus()
    }
  })
})

onUnmounted(() => {
  stopPaymentPolling()
  window.removeEventListener('focus', handleTabFocus)
})

const verifyPayment = async (order) => {
  const targetId = typeof order === 'object' ? (order.displayId || order.id) : order
  if (isVerifyingPayment.value) return
  isVerifyingPayment.value = targetId
  
  try {
    const res = await api.verifyPendingPaymentForOrder(targetId)
    const isSuccess = res && (
      res.status === 'success' || 
      res.message?.toLowerCase().includes('verified') || 
      res.payment?.status === 'confirmed' ||
      res.order?.payment_status === 'paid'
    )
    if (isSuccess) {
      showAlert({ 
        title: 'Payment Confirmed', 
        message: res.message || 'Payment confirmed and funds secured in escrow! The farmer has been notified.', 
        type: 'success' 
      })
      if (typeof order === 'object') {
        order.status = 'paid_in_escrow'
        order.escrowStatus = 'held'
        order.paymentStatus = 'paid'
      }
      await refreshOrders()
    } else {
      showAlert({ 
        title: 'Payment Incomplete', 
        message: res?.message || 'Payment is still processing on Chapa. Please complete the steps in the tester tab.', 
        type: 'warning' 
      })
    }
  } catch (err) {
    showAlert({ 
      title: 'Payment Verification Status', 
      message: err.message || 'Payment is not yet verified. Please complete payment in the Chapa tester and try again.', 
      type: 'warning' 
    })
  } finally {
    isVerifyingPayment.value = null
  }
}

const handlePayment = async (order) => {
  const targetId = typeof order === 'object' ? (order.displayId || order.id) : order
  if (isProcessingPayment.value) return
  isProcessingPayment.value = targetId
  
  // Open new tab synchronously during click to prevent browser popup blockers
  const paymentTab = window.open('about:blank', '_blank')
  
  try {
    const res = await api.initiateOrderPayment(targetId)
    if (res && res.checkout_url) {
      if (paymentTab && !paymentTab.closed) {
        paymentTab.location.href = res.checkout_url
      } else {
        window.open(res.checkout_url, '_blank')
      }
      
      const foundOrder = typeof order === 'object' ? order : (orders.value.find(o => (o.displayId || o.id) == targetId) || { id: targetId })
      activePaymentOrder.value = foundOrder
      activePaymentCheckoutUrl.value = res.checkout_url
      activePaymentStatus.value = 'awaiting'
      activePaymentResult.value = null
      activePaymentErrorMessage.value = null
      
      startPaymentPolling(targetId)
    } else {
      if (paymentTab && !paymentTab.closed) paymentTab.close()
      alert(res?.message || 'Payment initiation failed. Please try again.')
    }
  } catch (err) {
    showAlert({ 
      title: 'Payment Initiation Error', 
      message: err.message || 'Payment initiation failed. Please try again.', 
      type: 'error' 
    })
  } finally {
    isProcessingPayment.value = null
  }
}
</script>
