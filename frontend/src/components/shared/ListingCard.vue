<template>
  <!-- Row Variant -->
  <div v-if="variant === 'row'" @click="handleClick"
    :class="['flex items-center gap-3 p-3 bg-white border border-[#E2E4E7] rounded-2xl hover:border-[#1E9444] hover:bg-[#F8F9FA] transition-all cursor-pointer shadow-2xs group', className]">
    <div class="w-12 h-12 rounded-xl bg-[#F0F1F2] flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
      {{ listing.cropEmoji }}
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-1.5">
        <h4 class="text-[14px] font-bold text-[#1E2328] truncate">{{ listing.cropName }}</h4>
        <VerifiedBadge v-if="listing.isVerified" size="sm" />
      </div>
      <p class="text-[12px] text-[#5A6270] truncate font-medium">
        {{ listing.farmer?.name }} · <span class="text-[#1E9444] font-semibold">{{ listing.region }} Co-op</span>
      </p>
    </div>
    <div class="flex items-center gap-3 shrink-0">
      <div class="text-right">
        <span class="text-[15px] font-black text-[#1E9444] block">{{ formatETB(listing.pricePerKg) }}</span>
        <span class="text-[11px] text-[#5A6270] font-medium">/ kg</span>
      </div>
      <button type="button" @click.stop="handleCartClick"
        :class="['w-9 h-9 rounded-xl flex items-center justify-center transition-colors shadow-2xs cursor-pointer',
          isAddedToCart ? 'bg-emerald-600 text-white' : 'bg-emerald-50 hover:bg-[#1E9444] text-[#1E9444] hover:text-white border border-emerald-200']">
        <Check v-if="isAddedToCart" class="w-4 h-4" />
        <ShoppingCart v-else class="w-4 h-4" />
      </button>
    </div>
  </div>

  <!-- Grid Variant -->
  <div v-else @click="handleClick"
    :class="['bg-white border border-[#E2E4E7] rounded-3xl overflow-hidden hover:border-[#1E9444] transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md flex flex-col group', className]">
    <div :class="['h-[135px] bg-gradient-to-br relative flex items-center justify-center overflow-hidden', getCategoryGradient(listing.category)]">
      <div class="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
      <span class="text-6xl drop-shadow-lg select-none group-hover:scale-110 transition-transform duration-200 relative z-10">
        {{ listing.cropEmoji }}
      </span>
      <div class="absolute top-2.5 left-2.5 z-20">
        <VerifiedBadge v-if="listing.isVerified" size="sm" />
      </div>
      <div class="absolute top-2.5 right-2.5 z-20">
        <GradeBadge :grade="listing.grade" />
      </div>
    </div>

    <div class="p-4 flex flex-col flex-1 justify-between gap-3">
      <div>
        <h3 class="text-[15px] font-black text-[#1E2328] leading-tight line-clamp-1 group-hover:text-[#1E9444] transition-colors">
          {{ listing.cropName }}
        </h3>
        <p class="text-[12px] text-[#5A6270] mt-1 font-medium truncate flex items-center gap-1">
          <span class="text-gray-800 font-bold">{{ listing.farmer?.name }}</span>
          <span>·</span>
          <span class="text-[#1E9444] font-semibold">{{ listing.region }} Union</span>
        </p>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-[#F0F1F2]">
        <div>
          <span class="text-[16px] font-black text-[#1E9444] block leading-none">{{ formatETB(listing.pricePerKg) }}</span>
          <span class="text-[10px] text-[#5A6270] font-bold">
            {{ listing.availableQty >= 1000 ? `${(listing.availableQty / 1000).toFixed(1)} tons available` : `${listing.availableQty} kg available` }}
          </span>
        </div>
        <button type="button" @click.stop="handleCartClick"
          :class="['w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-2xs',
            isAddedToCart ? 'bg-emerald-700 text-white scale-105' : 'bg-[#EDFAF2] hover:bg-[#1E9444] text-[#1E9444] hover:text-white border border-[#C3EFCF] hover:shadow-xs']">
          <Check v-if="isAddedToCart" class="w-4 h-4 stroke-[2.5]" />
          <ShoppingCart v-else class="w-4 h-4 stroke-[2]" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingCart, Check } from 'lucide-vue-next'
import VerifiedBadge from './VerifiedBadge.vue'
import GradeBadge from './GradeBadge.vue'
import { formatETB } from '@/utils/helpers'
import { useCart } from '@/composables/useCart'

const props = defineProps({
  listing: { type: Object, required: true },
  variant: { type: String, default: 'grid' },
  className: { type: String, default: '' },
  isAddedToCart: { type: Boolean, default: false },
})

const emit = defineEmits(['addToCart'])
const router = useRouter()
const { cartItems, addToCart, removeFromCart } = useCart()

const isAddedToCart = computed(() => {
  if (props.isAddedToCart) return true
  return cartItems.value.some(item => 
    String(item.listingId) === String(props.listing.id) || 
    String(item.listing?.id) === String(props.listing.id)
  )
})

const getCategoryGradient = (category) => {
  const gradients = {
    coffee: 'from-[#3E2723] via-[#4E342E] to-[#0F5C2A]',
    grains: 'from-[#2E7D32] via-[#388E3C] to-[#1E9444]',
    spices: 'from-[#D84315] via-[#E64A19] to-[#BF360C]',
    oilseeds: 'from-[#F57F17] via-[#FB8C00] to-[#E65100]',
    pulses: 'from-[#5D4037] via-[#6D4C41] to-[#3E2723]',
    roots: 'from-[#6A1B9A] via-[#8E24AA] to-[#4A148C]',
    fruits: 'from-[#EF6C00] via-[#F57C00] to-[#E65100]',
    vegetables: 'from-[#1B5E20] via-[#2E7D32] to-[#1E9444]',
  }
  return gradients[category] || 'from-[#062E15] via-[#0F5C2A] to-[#1E9444]'
}

const handleClick = () => {
  router.push(`/buyer/listing/${props.listing.id}`)
}

const handleCartClick = (e) => {
  e?.stopPropagation?.()
  const existing = cartItems.value.find(item => 
    String(item.listingId) === String(props.listing.id) || 
    String(item.listing?.id) === String(props.listing.id)
  )

  if (existing) {
    removeFromCart(existing.id)
  } else {
    addToCart(props.listing)
  }
  emit('addToCart', props.listing, e)
}
</script>
