<template>
  <div class="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
    <!-- Notifications -->
    <div v-if="actionMessage" class="p-4 bg-[#EDFAF2] border border-[#C3EFCF] text-[#0F5C2A] rounded-xl font-bold text-[13px] flex items-center justify-between shadow-xs">
      <span class="flex items-center gap-2"><Check class="w-4 h-4 text-[#1E9444]" /> {{ actionMessage }}</span>
      <button @click="actionMessage = null" class="text-xs hover:underline cursor-pointer">{{ $t('admin.dismiss') }}</button>
    </div>

    <div v-if="error" class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold text-[13px] flex items-center justify-between shadow-xs">
      <span class="flex items-center gap-2"><AlertTriangle class="w-4 h-4 text-red-600" /> {{ error }}</span>
      <button @click="loadDashboardData" class="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 cursor-pointer">{{ $t('admin.retry') }}</button>
    </div>

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border-b border-[#E2E4E7] pb-6 relative">
      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-1.5">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-[#1E9444] text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity class="w-5 h-5" />
          </div>
          <h1 class="text-[28px] font-black text-[#1E2328] tracking-tight">{{ $t('admin.commandCenter') }}</h1>
        </div>
        <p class="text-[14px] font-medium text-[#5A6270] max-w-xl">
          {{ $t('admin.commandCenterSub') }}
        </p>
      </div>
      <div class="flex items-center gap-3 z-10 mt-4 sm:mt-0">
        <span class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDFAF2] text-[#0F5C2A] text-[12px] font-extrabold border border-[#C3EFCF] shadow-2xs">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1E9444] opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1E9444]"></span>
          </span>
          {{ $t('admin.liveOpsCore') }}
        </span>
        <button @click="loadDashboardData" :disabled="isLoading" 
          class="px-4 py-2 rounded-xl border border-[#E2E4E7] bg-white text-[13px] font-bold text-[#1E2328] hover:bg-[#F8F9FA] hover:shadow-md transition-all active:scale-95 flex items-center gap-2 group cursor-pointer">
          <RefreshCcw :class="['w-4 h-4 text-[#5A6270] group-hover:text-indigo-600 transition-colors', isLoading && 'animate-spin']" /> 
          {{ $t('admin.refresh') }}
        </button>
      </div>
      <div class="absolute right-0 top-0 w-72 h-32 bg-indigo-50/80 rounded-full blur-[80px] -z-0 opacity-60 pointer-events-none"></div>
    </div>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <div class="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-4 relative overflow-hidden border border-[#E2E4E7]/50">
        <div class="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-transparent opacity-50"></div>
        <Loader2 class="w-8 h-8 text-indigo-500 animate-spin relative z-10" />
      </div>
      <p class="text-xs font-black text-[#1E2328] uppercase tracking-wider mt-2">{{ $t('admin.connectingDataGrid') }}</p>
      <p class="text-[11px] text-[#9BA1AA] font-bold mt-1">{{ $t('admin.aggregatingMetrics') }}</p>
    </div>

    <template v-else>
      <!-- KPI cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="bg-white border border-[#E2E4E7] rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between overflow-hidden relative">
          <div class="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between text-[#5A6270] mb-4">
              <span class="text-[11px] font-extrabold uppercase tracking-wider">{{ $t('admin.gmvFacilitated') }}</span>
              <div class="w-10 h-10 rounded-2xl bg-[#EDFAF2] text-[#0F5C2A] flex items-center justify-center border border-[#C3EFCF] shadow-sm"><DollarSign class="w-5 h-5 text-[#1E9444]" /></div>
            </div>
            <span class="text-[28px] font-black text-[#1E9444] tracking-tight group-hover:scale-[1.02] transform origin-left transition-transform">{{ formatETB(kpis?.total_gmv || 0) }}</span>
          </div>
          <div class="pt-4 mt-6 border-t border-[#E2E4E7]/60 flex items-center justify-between text-[12px] font-bold text-[#5A6270] relative z-10">
            <span class="flex items-center gap-1.5"><TrendingUp class="w-4 h-4 text-[#1E9444]" /> {{ kpis?.total_orders || 0 }} {{ $t('admin.totalOrdersMetric') }}</span>
            <router-link to="/admin/orders" class="text-[#1E9444] hover:underline flex items-center gap-1">{{ $t('admin.viewOrders') }} <ArrowRight class="w-3 h-3 group-hover:translate-x-1 transition-transform"/></router-link>
          </div>
        </div>

        <div class="bg-white border border-[#E2E4E7] rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between overflow-hidden relative">
          <div class="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between text-[#5A6270] mb-4">
              <span class="text-[11px] font-extrabold uppercase tracking-wider text-amber-700">{{ $t('admin.verification') }}</span>
              <div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shadow-sm"><FileCheck class="w-5 h-5 text-amber-600" /></div>
            </div>
            <span class="text-[28px] font-black text-[#1E2328] tracking-tight group-hover:scale-[1.02] transform origin-left transition-transform">{{ kpis?.pending_applications || 0 }}</span>
          </div>
          <div class="pt-4 mt-6 border-t border-[#E2E4E7]/60 flex items-center justify-between text-[12px] font-bold text-[#5A6270] relative z-10">
            <span class="text-amber-700 font-semibold flex items-center gap-1.5"><AlertTriangle class="w-4 h-4" /> {{ $t('admin.actionRequired') }}</span>
            <router-link to="/admin/applications" class="text-amber-800 hover:underline flex items-center gap-1">{{ $t('admin.review') }} <ArrowRight class="w-3 h-3 group-hover:translate-x-1 transition-transform"/></router-link>
          </div>
        </div>

        <div class="bg-white border border-[#E2E4E7] rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between overflow-hidden relative">
           <div class="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between text-[#5A6270] mb-4">
              <span class="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">{{ $t('admin.activeListings') }}</span>
              <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 shadow-sm"><ListOrdered class="w-5 h-5 text-blue-600" /></div>
            </div>
            <span class="text-[28px] font-black text-[#1E2328] tracking-tight group-hover:scale-[1.02] transform origin-left transition-transform">{{ kpis?.active_listings || 0 }}</span>
          </div>
          <div class="pt-4 mt-6 border-t border-[#E2E4E7]/60 flex items-center justify-between text-[12px] font-bold text-[#5A6270] relative z-10">
            <span class="text-blue-700 font-semibold flex items-center gap-1.5"><ShoppingCart class="w-4 h-4" /> {{ $t('admin.liveMarket') }}</span>
            <router-link to="/admin/listings" class="text-blue-700 hover:underline flex items-center gap-1">{{ $t('admin.moderate') }} <ArrowRight class="w-3 h-3 group-hover:translate-x-1 transition-transform"/></router-link>
          </div>
        </div>

        <div class="bg-white border border-[#E2E4E7] rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between overflow-hidden relative">
          <div class="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between text-[#5A6270] mb-4">
              <span class="text-[11px] font-extrabold uppercase tracking-wider text-rose-700">{{ $t('admin.escrowDisputes') }}</span>
              <div class="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200 shadow-sm"><ShieldAlert class="w-5 h-5 text-rose-600" /></div>
            </div>
            <span class="text-[28px] font-black text-rose-600 tracking-tight group-hover:scale-[1.02] transform origin-left transition-transform">{{ kpis?.payment_exceptions_count || 0 }}</span>
          </div>
          <div class="pt-4 mt-6 border-t border-[#E2E4E7]/60 flex items-center justify-between text-[12px] font-bold text-[#5A6270] relative z-10">
            <span class="text-rose-700 font-semibold flex items-center gap-1.5"><Lock class="w-4 h-4" /> {{ $t('admin.fundsHeld') }}</span>
            <router-link to="/admin/disputes" class="text-rose-700 hover:underline flex items-center gap-1">{{ $t('admin.arbitrage') }} <ArrowRight class="w-3 h-3 group-hover:translate-x-1 transition-transform"/></router-link>
          </div>
        </div>
      </div>

      <!-- Secondary stats strip -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-0 bg-white border border-[#E2E4E7] p-1.5 rounded-[24px] shadow-sm mt-8">
        <div class="flex items-center gap-4 p-4 hover:bg-[#F8F9FA] rounded-2xl transition-colors cursor-default">
          <div class="w-12 h-12 rounded-2xl bg-[#EDFAF2] text-[#0F5C2A] flex items-center justify-center shrink-0 border border-[#C3EFCF] shadow-inner"><Users class="w-6 h-6 text-[#1E9444]" /></div>
          <div><span class="text-[11px] font-black text-[#9BA1AA] uppercase tracking-wider">{{ $t('admin.verifiedEcosystem') }}</span><p class="text-[15px] font-extrabold text-[#1E2328] mt-0.5">{{ kpis?.total_farmers || 0 }} {{ $t('admin.farmersCount') }} · {{ kpis?.total_buyers || 0 }} {{ $t('admin.buyersCount') }}</p></div>
        </div>
        <div class="flex items-center gap-4 p-4 border-t sm:border-t-0 sm:border-l border-[#E2E4E7]/60 hover:bg-[#F8F9FA] rounded-2xl transition-colors cursor-default">
          <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200 shadow-inner"><Clock class="w-6 h-6 text-amber-600" /></div>
          <div><span class="text-[11px] font-black text-[#9BA1AA] uppercase tracking-wider">{{ $t('admin.farmerPayouts') }}</span><p class="text-[15px] font-extrabold text-[#1E2328] mt-0.5">{{ formatETB(kpis?.pending_payouts_amount || 0) }} {{ $t('admin.pending') }}</p></div>
        </div>
        <div class="flex items-center gap-4 p-4 border-t sm:border-t-0 sm:border-l border-[#E2E4E7]/60 hover:bg-[#F8F9FA] rounded-2xl transition-colors cursor-default">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0 border border-blue-200 shadow-inner"><ShoppingBag class="w-6 h-6 text-blue-600" /></div>
          <div><span class="text-[11px] font-black text-[#9BA1AA] uppercase tracking-wider">{{ $t('admin.systemOrders') }}</span><p class="text-[15px] font-extrabold text-[#1E2328] mt-0.5">{{ kpis?.total_orders || 0 }} {{ $t('admin.completed') }}</p></div>
        </div>
      </div>

      <!-- Approvals and Audit feed -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        <div class="lg:col-span-7 bg-white border border-[#E2E4E7] rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div class="p-6 border-b border-[#E2E4E7]/60 flex items-center justify-between bg-gradient-to-r from-[#F8F9FA] to-white">
            <div>
              <h2 class="text-[17px] font-extrabold text-[#1E2328] tracking-tight">{{ $t('admin.pendingActionQueue') }}</h2>
              <p class="text-[12px] font-semibold text-[#9BA1AA] mt-1">{{ $t('admin.pendingActionQueueSub') }}</p>
            </div>
            <router-link to="/admin/applications" class="text-[12px] font-bold text-[#1E9444] hover:bg-[#EDFAF2] px-3 py-1.5 rounded-lg border border-transparent hover:border-[#C3EFCF] transition-all">{{ $t('admin.viewAllCount', { count: kpis?.pending_applications || 0 }) }}</router-link>
          </div>
          
          <div v-if="pendingApprovals.length === 0" class="p-12 text-center text-[#5A6270] my-auto flex flex-col items-center">
            <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <FileCheck class="w-8 h-8 text-[#1E9444] opacity-50" />
            </div>
            <h3 class="text-[16px] font-extrabold text-[#1E2328]">{{ $t('admin.clearQueue') }}</h3>
            <p class="text-[13px] font-medium mt-1">{{ $t('admin.clearQueueSub') }}</p>
          </div>
          
          <div v-else class="divide-y divide-[#E2E4E7]/60">
            <div v-for="app in pendingApprovals" :key="app.id" class="p-5 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors group">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-[#EDFAF2] text-indigo-700 flex items-center justify-center text-sm font-extrabold border border-indigo-100 shadow-2xs group-hover:scale-105 transition-transform">
                  {{ app.user?.first_name?.[0] || 'A' }}
                </div>
                <div>
                  <div class="flex flex-wrap items-center gap-2 mb-1">
                    <h4 class="text-[15px] font-extrabold text-[#1E2328]">{{ app.user?.first_name }} {{ app.user?.second_name }}</h4>
                    <span :class="['px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider', app.capability_type === 'farmer' ? 'bg-[#EDFAF2] text-[#0F5C2A] border border-[#C3EFCF]' : 'bg-blue-50 text-blue-700 border border-blue-200']">
                      {{ app.capability_type === 'farmer' ? $t('admin.farmerRequest') : $t('admin.buyerRequest') }}
                    </span>
                  </div>
                  <p class="text-[12px] font-medium text-[#5A6270] flex items-center gap-2">
                    <span class="flex items-center gap-1"><Phone class="w-3 h-3" /> {{ app.user?.phone || 'N/A' }}</span>
                    <span class="text-gray-300">|</span>
                    <span>{{ $t('admin.received') }} {{ formatDate(app.created_at) }}</span>
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2 opacity-0 lg:opacity-100 lg:group-hover:opacity-100 transition-opacity">
                <button @click="handleQuickApprove(app.id)" class="px-4 py-2 rounded-xl bg-gradient-to-tr from-[#1E9444] to-emerald-500 text-white font-bold text-[12px] hover:from-[#0F5C2A] flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"><Check class="w-3.5 h-3.5" /> {{ $t('admin.approve') }}</button>
                <button @click="handleQuickReject(app.id)" class="px-4 py-2 rounded-xl bg-white border border-rose-200 text-rose-600 font-bold text-[12px] hover:bg-rose-50 active:scale-95 transition-all shadow-sm cursor-pointer">{{ $t('admin.reject') }}</button>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-5 bg-white border border-[#E2E4E7] rounded-3xl shadow-sm overflow-hidden flex flex-col relative z-20">
          <div class="p-6 border-b border-[#E2E4E7]/60 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                <Activity class="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h2 class="text-[17px] font-extrabold text-[#1E2328] tracking-tight">{{ $t('admin.auditTrailLog') }}</h2>
                <p class="text-[11px] font-black uppercase text-[#9BA1AA] tracking-wider mt-0.5">{{ $t('admin.automatedEventTracking') }}</p>
              </div>
            </div>
          </div>
          <div class="p-4 overflow-y-auto h-[450px] relative scrollbar-hide">
            <p v-if="recentActivity.length === 0" class="text-center text-xs font-bold text-[#9BA1AA] py-12">{{ $t('admin.noRecentEvents') }}</p>
            
            <div class="absolute left-6 top-6 bottom-6 w-px bg-[#E2E4E7]/60 z-0 hidden sm:block"></div>
            
            <div class="relative z-10 flex flex-col gap-6 p-2">
              <div v-for="log in recentActivity" :key="log.id" class="flex items-start gap-4 text-sm group">
                <div class="w-6 h-6 rounded-full bg-white border-4 border-indigo-100 flex items-center justify-center shrink-0 mt-1 relative z-10 group-hover:border-indigo-300 transition-colors shadow-2xs">
                  <div class="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                </div>
                <div class="flex-1 min-w-0 bg-[#F8F9FA] rounded-2xl p-4 border border-[#E2E4E7]/60 group-hover:border-indigo-200 transition-colors">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <span class="font-bold text-[#1E2328] truncate">{{ log.action }}</span>
                    <span class="text-[10px] font-black uppercase tracking-wider text-[#9BA1AA] shrink-0">{{ formatDate(log.created_at) }}</span>
                  </div>
                  <p class="text-[12px] font-medium text-[#5A6270] truncate leading-relaxed">{{ $t('admin.byUser') }} {{ log.user?.name || $t('admin.systemAuto') }} <br/> {{ $t('admin.resource') }} <span class="font-bold text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded">{{ log.auditable_type || $t('admin.unknown') }} #{{ log.auditable_id }}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { FileCheck, ListOrdered, ShoppingBag, DollarSign, ShieldAlert, TrendingUp, Check, Activity, ArrowRight, Users, Clock, AlertTriangle, Loader2, RefreshCcw, Lock, ShoppingCart, Phone } from 'lucide-vue-next'
import { adminApi } from '@/services/adminService'
import { formatETB, formatDate } from '@/utils/helpers'
import { useLanguage } from '@/composables/useLanguage'

const { t } = useLanguage()

const kpis = ref(null)
const recentActivity = ref([])
const pendingApprovals = ref([])
const isLoading = ref(true)
const error = ref(null)
const actionMessage = ref(null)

const loadDashboardData = async () => {
  isLoading.value = true
  error.value = null
  try {
    const data = await adminApi.fetchDashboardStats()
    kpis.value = data.kpis
    recentActivity.value = data.recent_activity || []
    pendingApprovals.value = data.pending_approvals_preview || []
  } catch (err) {
    error.value = err.message || 'Failed to load dashboard metrics.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadDashboardData)

const handleQuickApprove = async (id) => {
  try {
    await adminApi.approveApplication(id)
    actionMessage.value = t('admin.verificationApproved')
    setTimeout(() => actionMessage.value = null, 4000)
    loadDashboardData()
  } catch (err) {
    alert(err.message || 'Failed to approve application.')
  }
}

const handleQuickReject = async (id) => {
  const reason = prompt(t('admin.specifyRejectionReason'))
  if (reason === null) return
  try {
    await adminApi.rejectApplication(id, reason || t('admin.docRequirementsNotMet'))
    actionMessage.value = t('admin.verificationDenied')
    setTimeout(() => actionMessage.value = null, 4000)
    loadDashboardData()
  } catch (err) {
    alert(err.message || 'Failed to reject application.')
  }
}
</script>
