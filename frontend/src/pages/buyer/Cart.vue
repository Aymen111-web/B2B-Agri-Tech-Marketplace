<template>
  <div class="space-y-6 max-w-4xl mx-auto pb-12">
    <!-- Top Header -->
    <div class="flex items-center justify-between border-b border-[#E2E4E7] pb-4">
      <div class="flex items-center gap-3">
        <router-link to="/buyer/marketplace" class="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
          <ArrowLeft class="w-5 h-5" />
        </router-link>
        <div>
          <h1 class="text-xl font-black text-[#1E2328] tracking-tight">Procurement Cart</h1>
          <p class="text-xs text-[#5A6270]">Select produce batches for bulk Chapa Escrow procurement</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button 
          v-if="cartItems.length > 0"
          @click="selectAll(!allSelected)" 
          class="text-xs font-bold text-[#0B57D0] hover:underline px-2 py-1"
        >
          {{ allSelected ? 'Deselect All' : 'Select All' }}
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="cartItems.length > 0" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- Cart Items List (7 cols) -->
      <div class="lg:col-span-7 space-y-4">
        <div 
          v-for="item in cartItems" 
          :key="item.id"
          :class="[
            'bg-white border rounded-2xl p-4 transition-all shadow-2xs space-y-3',
            item.selected ? 'border-[#0B57D0] ring-1 ring-[#0B57D0]/20' : 'border-[#E2E4E7]'
          ]"
        >
          <div class="flex items-start gap-3">
            <!-- Select Checkbox -->
            <input 
              type="checkbox" 
              :checked="item.selected" 
              @change="toggleSelect(item.id)" 
              class="mt-1.5 w-4 h-4 accent-[#0B57D0] rounded cursor-pointer shrink-0" 
            />

            <!-- Produce Image / Emoji -->
            <div class="w-14 h-14 bg-[#F8F9FA] border border-gray-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
              {{ item.listing?.cropEmoji || '🌾' }}
            </div>

            <!-- Item Details -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <h3 class="text-sm font-bold text-[#1E2328] truncate">{{ item.listing?.cropName || 'Produce Batch' }}</h3>
                <button @click="removeFromCart(item.id)" class="text-gray-400 hover:text-red-500 p-1">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>

              <p class="text-[11px] text-[#5A6270] mb-2">
                {{ item.listing?.farmer?.name || 'Producer' }} · {{ item.listing?.region || 'Ethiopia' }} · 
                <span class="font-bold text-[#0B57D0]">{{ item.listing?.grade || 'Grade 1' }}</span>
              </p>

              <!-- Quantity Selector, Unit & Price -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <!-- Minus Button -->
                    <button 
                      type="button"
                      @click="updateQuantity(item.id, item.quantityKg - 1)"
                      :disabled="item.quantityKg <= 1"
                      class="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 disabled:opacity-40 disabled:hover:bg-gray-100 rounded-xl font-black text-lg flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                      title="Decrease quantity by 1"
                    >
                      -
                    </button>
                    
                    <!-- Direct Quantity Input -->
                    <input 
                      type="number" 
                      :value="item.quantityKg"
                      @input="updateQuantity(item.id, $event.target.value)"
                      min="1"
                      :max="item.listing?.availableQty || 100000"
                      step="1"
                      class="w-20 py-2 bg-white border border-[#E2E4E7] focus:border-[#0B57D0] focus:outline-none font-black text-[#1E2328] text-center rounded-xl text-sm shadow-2xs"
                    />

                    <!-- Plus Button -->
                    <button 
                      type="button"
                      @click="updateQuantity(item.id, item.quantityKg + 1)"
                      :disabled="item.quantityKg >= (item.listing?.availableQty || 100000)"
                      class="w-10 h-10 bg-[#0B57D0]/10 text-[#0B57D0] hover:bg-[#0B57D0] hover:text-white border border-[#0B57D0]/30 disabled:opacity-40 rounded-xl font-black text-lg flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                      title="Increase quantity by 1"
                    >
                      +
                    </button>

                    <!-- Unit Selector Dropdown -->
                    <select 
                      :value="item.unit || 'KG'" 
                      @change="updateUnit(item.id, $event.target.value)"
                      class="px-2.5 py-2 bg-white border border-[#E2E4E7] focus:border-[#0B57D0] focus:outline-none font-bold text-[#1E2328] rounded-xl text-xs shadow-2xs cursor-pointer"
                    >
                      <option value="KG">KG</option>
                      <option value="Quintals">Quintals (100 KG)</option>
                      <option value="Litres">Litres (L)</option>
                    </select>
                  </div>

                  <span class="text-[10px] text-gray-400 block">
                    Available: {{ (item.listing?.availableQty || 10000).toLocaleString() }} kg stock
                  </span>
                </div>

                <div class="text-right shrink-0">
                  <span class="text-[10px] text-gray-400 block">{{ formatETB(item.listing?.pricePerKg) }}/kg</span>
                  <span class="font-black text-[#1E9444] text-base">
                    {{ formatETB(getItemSubtotal(item)) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Financial Summary & Bulk Checkout (5 cols) -->
      <div class="lg:col-span-5 space-y-6">
        <div class="bg-white border border-[#E2E4E7] rounded-2xl p-6 shadow-md space-y-5 sticky top-6">
          <h3 class="text-base font-bold text-[#1E2328] border-b border-gray-100 pb-3 flex items-center gap-2">
            <ShoppingCart class="w-4 h-4 text-[#0B57D0]" />
            <span>Procurement Batch Summary</span>
          </h3>

          <div class="space-y-3 text-xs">
            <div class="flex justify-between items-center text-[#5A6270]">
              <span>Selected Items</span>
              <span class="font-bold text-[#1E2328]">{{ selectedCount }} of {{ cartItems.length }} Batches</span>
            </div>

            <div class="flex justify-between items-center text-[#5A6270]">
              <span>Chapa Escrow Fee & Quality Check</span>
              <span class="font-bold text-emerald-600">Included (Free)</span>
            </div>

            <div class="border-t border-dashed border-gray-200 pt-3 flex justify-between items-end">
              <div>
                <span class="text-xs font-bold text-[#5A6270] block">Selected Subtotal</span>
                <span class="text-[10px] text-gray-400">Locked in Chapa Escrow</span>
              </div>
              <span class="text-2xl font-black text-[#1E9444] tracking-tight">
                {{ formatETB(selectedSubtotal) }}
              </span>
            </div>
          </div>

          <div class="bg-[#EDFAF2] border border-[#C3EFCF] rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-[#0F5C2A]">
            <ShieldCheck class="w-4 h-4 text-[#1E9444] shrink-0" />
            <span>Payments held securely in Chapa Escrow until physical delivery PIN verification.</span>
          </div>

          <button 
            @click="proceedToCheckout" 
            :disabled="selectedCount === 0"
            class="w-full py-4 rounded-xl bg-[#1E9444] text-white font-bold text-sm shadow-md hover:bg-[#0F5C2A] disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
          >
            <span>Proceed to Checkout Selected ({{ selectedCount }})</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Empty Cart View -->
    <div v-else class="text-center py-16 bg-white border border-[#E2E4E7] rounded-3xl p-8 max-w-md mx-auto space-y-4 shadow-2xs">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
        <ShoppingCart class="w-8 h-8" />
      </div>
      <h3 class="font-bold text-lg text-[#1E2328]">Your Cart is Empty</h3>
      <p class="text-xs text-[#5A6270]">Explore verified produce on the marketplace to create your procurement batch.</p>
      <router-link to="/buyer/marketplace" class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B57D0] text-white font-bold text-xs rounded-xl hover:bg-[#09429E] transition-colors shadow-2xs">
        Browse Produce Marketplace
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Trash2, ShoppingCart, ShieldCheck, ArrowRight } from 'lucide-vue-next'
import { useCart } from '@/composables/useCart'
import { formatETB } from '@/utils/helpers'

const router = useRouter()
const { cartItems, selectedItems, selectedCount, selectedSubtotal, removeFromCart, updateQuantity, updateUnit, getItemSubtotal, toggleSelect, selectAll } = useCart()

const allSelected = computed(() => {
  return cartItems.value.length > 0 && cartItems.value.every(i => i.selected)
})

const getItemStep = (item) => {
  const min = item.listing?.minOrderQty || 10
  if (min < 50) return 10
  if (min < 200) return 50
  if (min < 1000) return 100
  return 250
}

const proceedToCheckout = () => {
  if (selectedItems.value.length === 0) return
  router.push('/buyer/checkout')
}
</script>
