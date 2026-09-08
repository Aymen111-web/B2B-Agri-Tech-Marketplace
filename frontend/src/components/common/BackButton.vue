<template>
  <router-link
    :to="to"
    :title="fullText"
    :aria-label="fullText"
    class="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#EEF2F6] hover:border-[#0B57D0] text-[#5A6270] hover:text-[#0B57D0] transition-all duration-150 cursor-pointer text-xs font-bold shadow-2xs select-none"
  >
    <span class="text-[13px] font-black transition-transform duration-150 group-hover:-translate-x-0.5" aria-hidden="true">←</span>
    <span class="tracking-tight">{{ label }}</span>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  to: {
    type: [String, Object],
    default: '/'
  }
})

const { t } = useLanguage()

const label = computed(() => {
  return t('common.back') || t('back') || 'Back'
})

const fullText = computed(() => `← ${label.value}`)
</script>
