<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div 
          @click.stop 
          class="w-full max-w-md bg-white border border-[#E2E4E7] rounded-3xl p-6 shadow-2xl space-y-5 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Top Accent Line -->
          <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#062E15] via-[#1E9444] to-[#E69500]" />

          <!-- Close Icon -->
          <button 
            @click="close" 
            class="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X class="w-5 h-5" />
          </button>

          <!-- Header Icon -->
          <div class="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-[#E69500] flex items-center justify-center mx-auto shadow-2xs">
            <ShoppingBag class="w-7 h-7 stroke-[2.2]" />
          </div>

          <!-- Content -->
          <div class="space-y-2">
            <h3 class="text-xl font-black text-[#1E2328] tracking-tight">Ready to buy?</h3>
            <p class="text-xs text-[#5A6270] leading-relaxed max-w-xs mx-auto">
              Create a Buyer account to purchase products directly from Ethiopian farmers and suppliers.
            </p>
          </div>

          <!-- Benefits Pills -->
          <div class="grid grid-cols-2 gap-2 text-left bg-[#F8F9FA] p-3 rounded-2xl border border-gray-100 text-[11px]">
            <div class="flex items-center gap-1.5 text-gray-700 font-medium">
              <ShieldCheck class="w-4 h-4 text-[#1E9444] shrink-0" />
              <span>Chapa Escrow Protected</span>
            </div>
            <div class="flex items-center gap-1.5 text-gray-700 font-medium">
              <CheckCircle2 class="w-4 h-4 text-[#1E9444] shrink-0" />
              <span>Direct Co-op Pricing</span>
            </div>
          </div>

          <!-- Buttons -->
          <div class="space-y-2.5 pt-1">
            <button 
              @click="handleRegister" 
              class="w-full py-3.5 px-4 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus class="w-4 h-4" />
              <span>Register as Buyer</span>
            </button>

            <button 
              @click="close" 
              class="w-full py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 text-[#5A6270] font-bold text-xs transition-colors cursor-pointer"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { X, ShoppingBag, ShieldCheck, CheckCircle2, UserPlus } from 'lucide-vue-next'

const props = defineProps({
  isOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])
const router = useRouter()

const close = () => {
  emit('close')
}

const handleRegister = () => {
  emit('close')
  router.push('/register?role=buyer')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
