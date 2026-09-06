<template>
  <div class="space-y-8">
    <div v-if="actionMessage" class="p-4 bg-[#EDFAF2] border border-[#C3EFCF] text-[#0F5C2A] rounded-xl font-bold text-[13px] flex items-center justify-between shadow-xs">
      <span class="flex items-center gap-2"><Check class="w-4 h-4 text-[#1E9444]" /> {{ actionMessage }}</span>
      <button @click="actionMessage = null" class="text-xs hover:underline">Dismiss</button>
    </div>

    <div v-if="error" class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold text-[13px] flex items-center justify-between shadow-xs">
      <span class="flex items-center gap-2"><AlertTriangle class="w-4 h-4 text-red-600" /> {{ error }}</span>
      <button @click="loadDashboardData" class="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700">Retry</button>
    </div>

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E4E7] pb-5">
      <div>
        <h1 class="text-[26px] font-extrabold text-[#1E2328] tracking-tight">Admin Executive Command Center</h1>
        <p class="text-[13px] text-[#5A6270] mt-1 font-medium">Real-time B2B marketplace monitoring, verification queue, escrow audit, and security overview.</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EDFAF2] text-[#0F5C2A] text-[12px] font-extrabold border border-[#C3EFCF]">
          <span class="w-2 h-2 rounded-full bg-[#1E9444] animate-ping" /> Live Operations
        </span>
        <button @click="loadDashboardData" class="px-3 py-1.5 rounded-lg border border-[#E2E4E7] bg-white text-[12px] font-bold text-[#1E2328] hover:bg-[#F8F9FA] transition-colors">Refresh Data</button>
      </div>
    </div>

    <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-[300px] space-y-3">
      <Loader2 class="w-8 h-8 text-[#1E9444] animate-spin" />
      <p class="text-xs font-bold text-[#5A6270]">Loading real-time admin metrics...</p>
    </div>

    <template v-else>
      <!-- KPI cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white border border-[#E2E4E7] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-[#5A6270]">
              <span class="text-[11px] font-extrabold uppercase tracking-wider">GMV Facilitated</span>
              <div class="w-9 h-9 rounded-xl bg-[#EDFAF2] text-[#0F5C2A] flex items-center justify-center border border-[#C3EFCF]"><DollarSign class="w-5 h-5 text-[#1E9444]" /></div>
            </div>
            <span class="text-[26px] font-extrabold text-[#1E9444] mt-3 block tracking-tight">{{ formatETB(kpis?.total_gmv || 0) }}</span>
          </div>
          <div class="pt-3 mt-3 border-t border-[#E2E4E7]/60 flex items-center justify-between text-[11px] font-bold text-[#5A6270]">
            <span class="flex items-center gap-1"><TrendingUp class="w-3.5 h-3.5 text-[#1E9444]" /> {{ kpis?.total_orders || 0 }} Total Orders</span>
            <router-link to="/admin/orders" class="text-[#1E9444] hover:underline">View Orders</router-link>
          </div>
        </div>

        <div class="bg-white border border-[#E2E4E7] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-[#5A6270]">
              <span class="text-[11px] font-extrabold uppercase tracking-wider">Pending Verification</span>
              <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200"><FileCheck class="w-5 h-5 text-amber-600" /></div>
            </div>
            <span class="text-[26px] font-extrabold text-[#1E2328] mt-3 block tracking-tight">{{ kpis?.pending_applications || 0 }}</span>
          </div>
          <div class="pt-3 mt-3 border-t border-[#E2E4E7]/60 flex items-center justify-between text-[11px] font-bold text-[#5A6270]">
            <span class="text-amber-700 font-semibold">Requires Inspection</span>
            <router-link to="/admin/applications" class="text-[#1E9444] hover:underline flex items-center gap-1">Review Queue <ArrowRight class="w-3 h-3" /></router-link>
          </div>
        </div>

        <div class="bg-white border border-[#E2E4E7] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-[#5A6270]">
              <span class="text-[11px] font-extrabold uppercase tracking-wider">Active Listings</span>
              <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200"><ListOrdered class="w-5 h-5 text-blue-600" /></div>
            </div>
            <span class="text-[26px] font-extrabold text-[#1E2328] mt-3 block tracking-tight">{{ kpis?.active_listings || 0 }}</span>
          </div>
          <div class="pt-3 mt-3 border-t border-[#E2E4E7]/60 flex items-center justify-between text-[11px] font-bold text-[#5A6270]">
            <span class="text-blue-700 font-semibold">Live Commodities</span>
            <router-link to="/admin/listings" class="text-blue-600 hover:underline flex items-center gap-1">Moderate <ArrowRight class="w-3 h-3" /></router-link>
          </div>
        </div>

        <div class="bg-white border border-[#E2E4E7] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-[#5A6270]">
              <span class="text-[11px] font-extrabold uppercase tracking-wider">Escrow & Disputes</span>
              <div class="w-9 h-9 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center border border-orange-200"><ShieldAlert class="w-5 h-5 text-orange-600" /></div>
            </div>
            <span class="text-[26px] font-extrabold text-orange-600 mt-3 block tracking-tight">{{ kpis?.payment_exceptions_count || 0 }}</span>
          </div>
          <div class="pt-3 mt-3 border-t border-[#E2E4E7]/60 flex items-center justify-between text-[11px] font-bold text-[#5A6270]">
            <span class="text-orange-700 font-semibold">Active Claims</span>
            <router-link to="/admin/disputes" class="text-orange-600 hover:underline flex items-center gap-1">Dispute Center <ArrowRight class="w-3 h-3" /></router-link>
          </div>
        </div>
      </div>

      <!-- Secondary stats strip -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white border border-[#E2E4E7] p-4 rounded-2xl shadow-xs">
        <div class="flex items-center gap-3.5 p-2">
          <div class="w-10 h-10 rounded-xl bg-[#EDFAF2] text-[#0F5C2A] flex items-center justify-center shrink-0 border border-[#C3EFCF]"><Users class="w-5 h-5 text-[#1E9444]" /></div>
          <div><span class="text-[11px] font-extrabold text-[#5A6270] uppercase">Verified Ecosystem</span><p class="text-[14px] font-extrabold text-[#1E2328]">{{ kpis?.total_farmers || 0 }} Farmers · {{ kpis?.total_buyers || 0 }} Buyers</p></div>
        </div>
        <div class="flex items-center gap-3.5 p-2 border-t sm:border-t-0 sm:border-l border-[#E2E4E7] pt-3 sm:pt-0">
          <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200"><Clock class="w-5 h-5 text-amber-600" /></div>
          <div><span class="text-[11px] font-extrabold text-[#5A6270] uppercase">Pending Farmer Payouts</span><p class="text-[14px] font-extrabold text-[#1E2328]">{{ formatETB(kpis?.pending_payouts_amount || 0) }} ({{ kpis?.pending_payouts_count || 0 }} pending)</p></div>
        </div>
        <div class="flex items-center gap-3.5 p-2 border-t sm:border-t-0 sm:border-l border-[#E2E4E7] pt-3 sm:pt-0">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0 border border-blue-200"><ShoppingBag class="w-5 h-5 text-blue-600" /></div>
          <div><span class="text-[11px] font-extrabold text-[#5A6270] uppercase">System Orders</span><p class="text-[14px] font-extrabold text-[#1E2328]">{{ kpis?.total_orders || 0 }} Total Orders Handled</p></div>
        </div>
      </div>

      <!-- Approvals and Audit feed -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-7 bg-white border border-[#E2E4E7] rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div class="p-5 border-b border-[#E2E4E7] flex items-center justify-between bg-[#F8F9FA]">
            <div><h2 class="text-[15px] font-bold text-[#1E2328]">Pending Verification Approvals</h2><p class="text-[11px] text-[#5A6270]">1-Click approval queue for newly submitted capability requests.</p></div>
            <router-link to="/admin/applications" class="text-[12px] font-bold text-[#1E9444] hover:underline">View All ({{ kpis?.pending_applications || 0 }})</router-link>
          </div>
          <div v-if="pendingApprovals.length === 0" class="p-8 text-center text-[#5A6270] my-auto">
            <FileCheck class="w-10 h-10 text-[#1E9444] mx-auto mb-2 opacity-40" />
            <p class="text-[13px] font-bold">No pending capability applications!</p>
          </div>
          <div v-else class="divide-y divide-[#E2E4E7]">
            <div v-for="app in pendingApprovals" :key="app.id" class="p-4 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-[#EDFAF2] text-[#0F5C2A] flex items-center justify-center text-xs font-extrabold border border-[#C3EFCF]">{{ app.user?.first_name?.[0] || 'A' }}</div>
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="text-[13px] font-bold text-[#1E2328]">{{ app.user?.first_name }} {{ app.user?.second_name }}</h4>
                    <span :class="['px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase', app.capability_type === 'farmer' ? 'bg-[#EDFAF2] text-[#0F5C2A]' : 'bg-blue-50 text-blue-700']">{{ app.capability_type }}</span>
                  </div>
                  <p class="text-[11px] text-[#5A6270]">Phone: {{ app.user?.phone || 'N/A' }} · Submitted: {{ formatDate(app.created_at) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button @click="handleQuickApprove(app.id)" class="px-3 py-1.5 rounded-lg bg-[#1E9444] text-white font-bold text-[11px] hover:bg-[#0F5C2A] flex items-center gap-1 shadow-2xs"><Check class="w-3.5 h-3.5" /> Approve</button>
                <button @click="handleQuickReject(app.id)" class="px-3 py-1.5 rounded-lg border border-red-500 text-red-600 font-bold text-[11px] hover:bg-red-50">Reject</button>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-5 bg-white border border-[#E2E4E7] rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div class="p-5 border-b border-[#E2E4E7] bg-[#F8F9FA] flex items-center justify-between">
            <div class="flex items-center gap-2"><Activity class="w-4 h-4 text-[#1E9444]" /><h2 class="text-[15px] font-bold text-[#1E2328]">Live System Audit Feed</h2></div>
            <span class="text-[10px] font-bold px-2 py-0.5 bg-[#EDFAF2] text-[#0F5C2A] rounded-full">Security Audit</span>
          </div>
          <div class="p-4 divide-y divide-gray-100 overflow-y-auto max-h-[360px]">
            <p v-if="recentActivity.length === 0" class="text-center text-xs text-[#5A6270] py-6">No recent audit logs available.</p>
            <div v-for="log in recentActivity" :key="log.id" class="py-2.5 flex items-start gap-2.5 text-xs">
              <div class="w-2 h-2 rounded-full bg-[#1E9444] mt-1.5 shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-1"><span class="font-bold text-[#1E2328] truncate">{{ log.action }}</span><span class="text-[10px] text-[#9BA1AA] shrink-0">{{ formatDate(log.created_at) }}</span></div>
                <p class="text-[11px] text-[#5A6270] truncate mt-0.5">By: {{ log.user?.name || 'System / Admin' }} · Resource: {{ log.auditable_type }} #{{ log.auditable_id }}</p>
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
import { FileCheck, ListOrdered, ShoppingBag, DollarSign, ShieldAlert, TrendingUp, Check, Activity, ArrowRight, Users, Clock, AlertTriangle, Loader2 } from 'lucide-vue-next'
import { adminApi } from '@/services/adminService'
import { formatETB, formatDate } from '@/utils/helpers'

const kpis = ref(null)
const recentActivity = ref([])
const pendingApprovals = ref([])
const isLoading = ref(true)
const error = ref(null)
const actionMessage = ref(null)

const loadDashboardData = async () => {
  isLoading.value = true; error.value = null
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
    actionMessage.value = `Application #${id} approved successfully!`
    setTimeout(() => actionMessage.value = null, 4000)
    loadDashboardData()
  } catch (err) {
    alert(err.message || 'Failed to approve application.')
  }
}

const handleQuickReject = async (id) => {
  const reason = prompt('Please specify a rejection reason:')
  if (reason === null) return
  try {
    await adminApi.rejectApplication(id, reason || 'Document requirements not met.')
    actionMessage.value = `Application #${id} rejected.`
    setTimeout(() => actionMessage.value = null, 4000)
    loadDashboardData()
  } catch (err) {
    alert(err.message || 'Failed to reject application.')
  }
}
</script>
