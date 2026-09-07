<template>
  <div class="relative" ref="toggleRef">
    <button 
      @click="isOpen = !isOpen" 
      type="button"
      :title="currentLang === 'en' ? 'ቋንቋ ቀይር / Change Language' : 'Change Language / ቋንቋ ቀይር'"
      class="px-2.5 py-1.5 rounded-xl border border-[#E2E4E7] dark:border-white/20 bg-white dark:bg-white/10 hover:bg-[#F0F1F2] dark:hover:bg-white/20 hover:border-[#0B57D0] transition-all cursor-pointer flex items-center gap-2 shadow-2xs group"
      aria-label="Change Language"
    >
      <!-- Translation Icon (White badge with A and 文 glyphs from requested design) -->
      <span class="inline-flex items-center justify-center shrink-0">
        <svg class="w-6 h-4 group-hover:scale-105 transition-transform duration-200" viewBox="0 0 28 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.75" y="0.75" width="26.5" height="16.5" rx="4" fill="white" stroke="#0B57D0" stroke-width="1.5" class="dark:fill-slate-800 dark:stroke-[#6EA8FE]" />
          <path d="M6.5 13.5L9.3 5.5H10.7L13.5 13.5M7.4 11.2H12.6" stroke="#0B57D0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="dark:stroke-[#6EA8FE]" />
          <path d="M20.2 5V6.6M16.5 7.2H24M21.2 8.4C20.2 10.3 18.2 11.9 16.5 12.9M18.8 8.6L23.5 13" stroke="#0B57D0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="dark:stroke-[#6EA8FE]" />
        </svg>
      </span>

      <!-- Language Label Indicator -->
      <span class="text-[11px] font-extrabold text-[#1E2328] dark:text-white tracking-wide">
        {{ currentLang === 'en' ? 'EN' : 'አማ' }}
      </span>

      <!-- Dropdown Chevron -->
      <ChevronDown :class="['w-3.5 h-3.5 text-gray-500 dark:text-gray-300 transition-transform duration-200', isOpen && 'rotate-180']" />
    </button>

    <!-- Language Selector Dropdown Menu -->
    <Transition name="fade-dropdown">
      <div 
        v-if="isOpen" 
        class="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-[#1E2328] border border-[#E2E4E7] dark:border-white/20 rounded-2xl shadow-xl p-1.5 z-50 text-xs"
      >
        <button 
          type="button"
          @click="selectLang('en')"
          :class="[
            'w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer',
            currentLang === 'en' 
              ? 'bg-[#EDFAF2] dark:bg-white/15 text-[#0F5C2A] dark:text-[#6EA8FE]' 
              : 'text-[#1E2328] dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10'
          ]"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm">🇬🇧</span>
            <span>English</span>
          </div>
          <Check v-if="currentLang === 'en'" class="w-4 h-4 text-[#1E9444] dark:text-[#6EA8FE]" />
        </button>

        <button 
          type="button"
          @click="selectLang('am')"
          :class="[
            'w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer',
            currentLang === 'am' 
              ? 'bg-[#EDFAF2] dark:bg-white/15 text-[#0F5C2A] dark:text-[#6EA8FE]' 
              : 'text-[#1E2328] dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10'
          ]"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm">🇪🇹</span>
            <span>አማርኛ (Amharic)</span>
          </div>
          <Check v-if="currentLang === 'am'" class="w-4 h-4 text-[#1E9444] dark:text-[#6EA8FE]" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronDown, Check } from 'lucide-vue-next'
import { useLanguage } from '@/composables/useLanguage'

const { currentLang, setLanguage } = useLanguage()
const isOpen = ref(false)
const toggleRef = ref(null)

function selectLang(lang) {
  setLanguage(lang)
  isOpen.value = false
}

function handleClickOutside(e) {
  if (toggleRef.value && !toggleRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.fade-dropdown-enter-active,
.fade-dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fade-dropdown-enter-from,
.fade-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.96);
}
</style>
