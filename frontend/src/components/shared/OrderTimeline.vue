<template>
  <div :class="['w-full bg-[#F8F9FA] rounded-2xl p-4 border border-[#E2E4E7]', className]">
    <div class="flex items-center justify-between pb-3 border-b border-[#E2E4E7] mb-3">
      <div class="flex items-center gap-2">
        <ShieldCheck class="w-4 h-4 text-[#1E9444]" />
        <span class="text-xs font-bold text-[#1E2328]">{{ $t('orders.timeline') }}</span>
      </div>
      <span class="text-[11px] font-semibold text-[#5A6270]">
        {{ $t('auth.stepOf') }} {{ activeStepIndex + 1 }} / {{ steps.length }}
      </span>
    </div>

    <!-- Vertical Timeline List -->
    <div class="relative pl-6 space-y-4">
      <!-- Vertical connecting line -->
      <div class="absolute top-2 bottom-2 left-2.5 w-0.5 bg-[#E2E4E7] -z-0" />

      <div v-for="(step, idx) in steps" :key="step.key" class="relative z-10 flex items-start justify-between gap-3 group">
        <!-- Step Icon / Indicator -->
        <div :class="[
          'absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all',
          isDone(idx) ? 'bg-[#1E9444] border-[#1E9444] text-white shadow-xs' :
          isActive(idx) ? 'bg-white border-[#1E9444] text-[#1E9444] ring-4 ring-emerald-100' :
          'bg-white border-[#E2E4E7] text-gray-400'
        ]">
          <Check v-if="isDone(idx)" class="w-3 h-3 stroke-[3]" />
          <span v-else-if="isActive(idx)" class="w-2 h-2 rounded-full bg-[#1E9444] animate-pulse" />
          <span v-else>{{ idx + 1 }}</span>
        </div>

        <div class="flex-1 space-y-0.5">
          <div class="flex items-center gap-2">
            <h5 :class="['text-xs font-bold', (isDone(idx) || isActive(idx)) ? 'text-[#1E2328]' : 'text-gray-400']">
              {{ step.title }}
            </h5>
            <span v-if="isActive(idx)" class="px-2 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              {{ $t('common.active') }}
            </span>
          </div>
          <p :class="['text-[11px]', (isDone(idx) || isActive(idx)) ? 'text-[#5A6270]' : 'text-gray-400']">
            {{ step.description }}
          </p>
        </div>

        <!-- Right Side Badge / Detail -->
        <div class="shrink-0 text-right">
          <span v-if="isDone(idx)" class="text-[10px] font-bold text-[#1E9444] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            {{ $t('common.completed') }}
          </span>
          <span v-else-if="isActive(idx)" class="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            {{ $t('common.processing') }}
          </span>
          <span v-else class="text-[10px] font-medium text-gray-400">
            {{ $t('common.pending') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Check, ShieldCheck } from 'lucide-vue-next'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  status: { type: String, required: true },
  className: { type: String, default: '' },
})

const { t } = useLanguage()

const steps = computed(() => [
  { 
    key: 'placed', 
    title: 'Order Request Submitted', 
    description: 'Purchase terms sent to regional farmer for approval.' 
  },
  { 
    key: 'accepted', 
    title: 'Farmer Approved & Awaiting Escrow', 
    description: 'Contract terms accepted. Commercial buyer must fund escrow to continue.' 
  },
  { 
    key: 'paid_in_escrow', 
    title: 'Chapa Escrow Capital Secured', 
    description: 'Procurement capital securely deposited in Chapa protected escrow account.' 
  },
  { 
    key: 'dispatched', 
    title: 'Dispatched & Live Transit', 
    description: 'Crop quality inspected and loaded on logistics truck toward destination.' 
  },
  { 
    key: 'delivered', 
    title: 'Handoff & Escrow Payout Released', 
    description: 'Physical receipt verified via 4-digit PIN to release funds to farmer.' 
  },
])

const statusStepMap = {
  placed: 0,
  pending: 0,
  
  accepted: 1,
  pending_payment: 1,
  pending_farmer_approval: 1,
  awaiting_buyer_payment: 1,

  paid_in_escrow: 2,
  confirmed: 2,

  dispatched: 3,
  
  in_transit: 4,
  buyer_received: 4,
  
  delivered: 4,
  completed: 4,
  disputed: 2,
}

const activeStepIndex = computed(() => statusStepMap[props.status] ?? 0)

const isDone = (idx) => idx < activeStepIndex.value || props.status === 'completed'
const isActive = (idx) => idx === activeStepIndex.value && props.status !== 'completed'
</script>
