<template>
  <span :class="['inline-flex items-center font-semibold text-[11px] rounded-full px-2 py-0.5 bg-[#FFF8EC] text-[#D88C0A] border border-[#FFE5A5]', className]">
    {{ $t(grade) || grade }}
  </span>
</template>

<script setup>
defineProps({
  grade: { type: String, required: true },
  className: { type: String, default: '' },
})
</script>
