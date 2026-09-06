<template>
  <div :class="['w-full py-2', className]">
    <div class="flex items-center justify-between relative">
      <div class="absolute top-3.5 left-4 right-4 h-0.5 bg-[#E2E4E7] -z-0" />
      <div v-for="(step, idx) in steps" :key="step.key" class="flex flex-col items-center relative z-10 flex-1">
        <div v-if="idx > 0" :class="['absolute top-3.5 right-1/2 left-[-50%] h-0.5 -z-10', idx < activeStepIndex ? 'bg-[#1E9444]' : 'bg-[#E2E4E7]']" />

        <!-- Done -->
        <div v-if="isDone(idx)" class="w-7 h-7 rounded-full bg-[#1E9444] text-white flex items-center justify-center shadow-sm">
          <Check class="w-4 h-4 stroke-[3]" />
        </div>
        <!-- Active -->
        <div v-else-if="isActive(idx)" class="w-7 h-7 rounded-full border-2 border-[#1E9444] bg-white flex items-center justify-center relative">
          <div class="w-2.5 h-2.5 rounded-full bg-[#1E9444] animate-pulse" />
        </div>
        <!-- Upcoming -->
        <div v-else class="w-7 h-7 rounded-full border-2 border-[#E2E4E7] bg-white flex items-center justify-center">
          <div class="w-2 h-2 rounded-full bg-[#9BA1AA]" />
        </div>

        <span :class="['text-[11px] mt-1.5 font-medium', (isDone(idx) || isActive(idx)) ? 'text-[#1E2328] font-semibold' : 'text-[#9BA1AA]']">
          {{ step.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'

const props = defineProps({
  status: { type: String, required: true },
  className: { type: String, default: '' },
})

const steps = [
  { key: 'placed', label: 'Ordered' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'in_transit', label: 'In transit' },
  { key: 'delivered', label: 'Delivered' },
]

const statusStepMap = {
  placed: 0, confirmed: 0, dispatched: 1, in_transit: 2,
  delivered: 3, completed: 3, disputed: 1,
}

const activeStepIndex = computed(() => statusStepMap[props.status] ?? 0)

const isDone = (idx) => idx < activeStepIndex.value || props.status === 'completed'
const isActive = (idx) => idx === activeStepIndex.value && props.status !== 'completed'
</script>
