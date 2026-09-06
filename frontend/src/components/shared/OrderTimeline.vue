<template>
  <div :class="['w-full bg-[#F8F9FA] rounded-2xl p-4 border border-[#E2E4E7]', className]">
    <div class="flex items-center justify-between pb-3 border-b border-[#E2E4E7] mb-3">
      <div class="flex items-center gap-2">
        <ShieldCheck class="w-4 h-4 text-[#1E9444]" />
        <span class="text-xs font-bold text-[#1E2328]">Order & Escrow Lifecycle</span>
      </div>
      <span class="text-[11px] font-semibold text-[#5A6270]">
        Stage {{ activeStepIndex + 1 }} of {{ steps.length }}
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
              Current Stage
            </span>
          </div>
          <p :class="['text-[11px]', (isDone(idx) || isActive(idx)) ? 'text-[#5A6270]' : 'text-gray-400']">
            {{ step.description }}
          </p>
        </div>

        <!-- Right Side Badge / Detail -->
        <div class="shrink-0 text-right">
          <span v-if="isDone(idx)" class="text-[10px] font-bold text-[#1E9444] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Completed
          </span>
          <span v-else-if="isActive(idx)" class="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            In Progress
          </span>
          <span v-else class="text-[10px] font-medium text-gray-400">
            Pending
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Check, ShieldCheck } from 'lucide-vue-next'

const props = defineProps({
  status: { type: String, required: true },
  className: { type: String, default: '' },
})

const steps = [
  { 
    key: 'placed', 
    title: 'Order Placed & Contract Locked', 
    description: 'Purchase terms and crop batch reserved with regional co-op.' 
  },
  { 
    key: 'confirmed', 
    title: 'Chapa Escrow Secured', 
    description: 'Procurement capital deposited in Chapa protected escrow account.' 
  },
  { 
    key: 'dispatched', 
    title: 'Dispatched from Primary Union', 
    description: 'Crop quality inspected and loaded on logistics truck.' 
  },
  { 
    key: 'in_transit', 
    title: 'Live Highway Transit', 
    description: 'En route to local delivery destination with driver assigned.' 
  },
  { 
    key: 'delivered', 
    title: 'Handover & Escrow Payout', 
    description: 'Physical receipt verified via 4-digit PIN to release funds to farmer.' 
  },
]

const statusStepMap = {
  placed: 0,
  confirmed: 1,
  dispatched: 2,
  in_transit: 3,
  delivered: 4,
  completed: 4,
  disputed: 2,
}

const activeStepIndex = computed(() => statusStepMap[props.status] ?? 0)

const isDone = (idx) => idx < activeStepIndex.value || props.status === 'completed'
const isActive = (idx) => idx === activeStepIndex.value && props.status !== 'completed'
</script>
