<template>
  <div v-if="listing" class="w-full flex flex-col min-h-full bg-[#F8F9FA] dark:bg-[#0D1117] pb-28">
    <!-- Header -->
    <div class="px-4 py-3.5 bg-white dark:bg-[#161B22] border-b border-[#E2E4E7] dark:border-[#30363D] flex items-center justify-between sticky top-14 z-30 shadow-2xs">
      <div class="flex items-center gap-3">
        <button @click="$router.back()" class="w-9 h-9 rounded-xl border border-[#E2E4E7] dark:border-[#30363D] flex items-center justify-center hover:bg-[#F0F1F2] dark:hover:bg-[#21262D] transition-colors">
          <ArrowLeft class="w-5 h-5 text-[#1E2328] dark:text-[#F0F6FC]" />
        </button>
        <div>
          <h2 class="text-base font-black text-[#1E2328] dark:text-[#F0F6FC] tracking-tight">{{ $t('farmer.editListingTitle') }} #{{ listing.id }}</h2>
          <p class="text-[11px] text-[#5A6270] dark:text-[#8B949E]">Update crop availability, region, pricing, or description</p>
        </div>
      </div>
      <span class="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#0B57D0] dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 text-[11px] font-bold">
        Edit Mode
      </span>
    </div>

    <!-- Form Container -->
    <form @submit.prevent="handleSubmit" class="p-4 md:p-6 max-w-3xl mx-auto w-full space-y-6">
      <!-- Section 1: Crop & Location Details -->
      <div class="bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] rounded-2xl p-5 shadow-2xs space-y-4">
        <h3 class="text-sm font-black text-[#1E2328] dark:text-[#F0F6FC] uppercase tracking-wider border-b border-[#E2E4E7] dark:border-[#30363D] pb-3 flex items-center gap-2">
          <Wheat class="w-4 h-4 text-[#1E9444] dark:text-emerald-400" />
          <span>{{ $t('Crop Details') }}</span>
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Crop Name -->
          <div>
            <label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">{{ $t('farmer.cropName') }} <span class="text-red-500">*</span></label>
            <input 
              type="text" 
              required 
              v-model="cropName" 
              class="w-full px-3.5 py-2.5 bg-white dark:bg-[#0D1117] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-sm focus:outline-none focus:border-[#1E9444] font-medium" 
            />
          </div>

          <!-- Grade -->
          <div>
            <label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">{{ $t('farmer.cropGrade') }}</label>
            <select v-model="grade" class="w-full px-3.5 py-2.5 bg-white dark:bg-[#0D1117] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1E9444] cursor-pointer">
              <option value="Grade 1">Grade 1 (Premium Export)</option>
              <option value="Grade 2">Grade 2 (High Quality)</option>
              <option value="Export Quality">Export Quality</option>
              <option value="Premium">Premium Local</option>
              <option value="Standard">Standard Commercial</option>
            </select>
          </div>
        </div>

        <!-- Dynamic Ethiopian Region & Zone Selection -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 dark:border-[#30363D] pt-4">
          <!-- Region -->
          <div>
            <label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] flex items-center gap-1 mb-1">
              <MapPin class="w-3.5 h-3.5 text-[#1E9444] dark:text-emerald-400" />
              <span>{{ $t('Region') }} <span class="text-red-500">*</span></span>
            </label>
            <select v-model="region" class="w-full px-3.5 py-2.5 bg-white dark:bg-[#0D1117] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-xs font-bold focus:outline-none focus:border-[#1E9444] cursor-pointer">
              <option value="Amhara">{{ $t('Amhara') }}</option>
              <option value="Sidama">{{ $t('Sidama') }}</option>
              <option value="Oromia">{{ $t('Oromia') }}</option>
              <option value="SNNPR">{{ $t('SNNPR') }}</option>
              <option value="Tigray">{{ $t('Tigray') }}</option>
              <option value="Harari">{{ $t('Harari') }}</option>
              <option value="Somali">Somali</option>
              <option value="Afar">Afar</option>
              <option value="Benishangul-Gumuz">Benishangul-Gumuz</option>
              <option value="Gambela">Gambela</option>
              <option value="Dire Dawa">Dire Dawa</option>
              <option value="Addis Ababa">Addis Ababa</option>
            </select>
          </div>

          <!-- Zone / Place -->
          <div>
            <label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">Zone / Sub-Region / Woreda</label>
            <input 
              type="text" 
              v-model="zone" 
              placeholder="e.g. Awi Zone, Injibara / Yirgalem" 
              class="w-full px-3.5 py-2.5 bg-white dark:bg-[#0D1117] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1E9444]" 
            />
          </div>
        </div>
      </div>

      <!-- Section 2: Quantity & Pricing -->
      <div class="bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] rounded-2xl p-5 shadow-2xs space-y-4">
        <h3 class="text-sm font-black text-[#1E2328] dark:text-[#F0F6FC] uppercase tracking-wider border-b border-[#E2E4E7] dark:border-[#30363D] pb-3 flex items-center gap-2">
          <Coins class="w-4 h-4 text-[#1E9444] dark:text-emerald-400" />
          <span>{{ $t('Quantity & pricing') }}</span>
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">{{ $t('farmer.availableQuantityKg') }} (KG) <span class="text-red-500">*</span></label>
            <input type="number" required min="1" v-model.number="availableQty" class="w-full px-3.5 py-2.5 bg-white dark:bg-[#0D1117] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-sm font-bold focus:outline-none focus:border-[#1E9444]" />
          </div>
          <div>
            <label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">{{ $t('farmer.pricePerKgETB') }} (ETB) <span class="text-red-500">*</span></label>
            <input type="number" required min="1" step="0.01" v-model.number="pricePerKg" class="w-full px-3.5 py-2.5 bg-white dark:bg-[#0D1117] border border-[#E2E4E7] dark:border-[#30363D] rounded-xl text-sm font-black text-[#1E9444] dark:text-emerald-400 focus:outline-none focus:border-[#1E9444]" />
          </div>
        </div>

        <!-- Financial Potential Live Preview Card -->
        <div class="p-3.5 bg-[#EDFAF2] dark:bg-emerald-950/40 border border-[#C3EFCF] dark:border-emerald-800/60 rounded-xl flex items-center justify-between text-xs">
          <span class="text-[#0F5C2A] dark:text-emerald-300 font-bold flex items-center gap-1.5">
            <Sparkles class="w-4 h-4 text-[#1E9444] dark:text-emerald-400" /> 
            <span>{{ $t('Potential revenue preview:') }}</span>
          </span>
          <strong class="text-[#1E9444] dark:text-emerald-400 text-base font-black tracking-tight">
            {{ formatETB((availableQty || 0) * (pricePerKg || 0)) }}
          </strong>
        </div>
      </div>

      <!-- Section 3: Description -->
      <div class="bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] rounded-2xl p-5 shadow-2xs space-y-4">
        <h3 class="text-sm font-black text-[#1E2328] dark:text-[#F0F6FC] uppercase tracking-wider border-b border-[#E2E4E7] dark:border-[#30363D] pb-3">
          {{ $t('farmer.cropDescription') }}
        </h3>
        <textarea rows="4" v-model="description" class="w-full px-3.5 py-2.5 bg-white dark:bg-[#0D1117] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-xs font-medium min-h-[100px] focus:outline-none focus:border-[#1E9444]" />
      </div>

      <!-- Sticky Action Bar -->
      <div class="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#161B22] border-t border-[#E2E4E7] dark:border-[#30363D] p-4 max-w-3xl mx-auto shadow-lg flex gap-3">
        <button 
          type="button" 
          @click="openDeleteModal" 
          class="w-1/3 py-3.5 rounded-xl border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 font-bold text-xs hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Trash2 class="w-4 h-4" />
          <span>{{ $t('Delete') }}</span>
        </button>
        <button 
          type="submit" 
          :disabled="isSaving || !isModified" 
          class="w-2/3 py-3.5 rounded-xl bg-[#1E9444] text-white font-black text-xs shadow-md hover:bg-[#0F5C2A] flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#1E9444]"
        >
          <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
          <span>{{ isSaving ? $t('Saving...') : $t('Save Changes') }}</span>
        </button>
      </div>
    </form>

    <!-- Custom Delete Confirmation Modal (Sign Out Style) -->
    <DeleteListingModal 
      :isOpen="isDeleteModalOpen" 
      :listingTitle="listing ? ($t(listing.cropName) || listing.cropName) : ''" 
      :isDeleting="isDeleting" 
      @close="closeDeleteModal" 
      @confirm="confirmDelete" 
    />
  </div>
  <div v-else class="text-center py-16 bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] rounded-3xl max-w-md mx-auto my-12 p-8 shadow-2xs space-y-3">
    <p class="text-sm font-bold text-gray-700 dark:text-[#8B949E]">{{ $t('marketplace.listingNotFound') }}</p>
    <router-link to="/farmer/listings" class="inline-block px-4 py-2 bg-[#1E9444] text-white font-bold text-xs rounded-xl hover:bg-[#0F5C2A] transition-colors">
      {{ $t('farmer.myListingsTitle') }}
    </router-link>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Loader2, Wheat, MapPin, Coins, Sparkles, Trash2 } from 'lucide-vue-next'
import { useListings } from '@/composables/useListings'
import { formatETB } from '@/utils/helpers'
import DeleteListingModal from '@/components/common/DeleteListingModal.vue'

const route = useRoute()
const router = useRouter()
const { getListingById, updateListing, deleteListing, refreshListings } = useListings()

const listing = computed(() => getListingById(route.params.id))
const cropName = ref('')
const grade = ref('Grade 1')
const region = ref('Amhara')
const zone = ref('')
const availableQty = ref(0)
const pricePerKg = ref(0)
const description = ref('')
const isSaving = ref(false)

const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)

const isModified = computed(() => {
  if (!listing.value) return false
  return (
    cropName.value !== (listing.value.cropName || '') ||
    grade.value !== (listing.value.grade || 'Grade 1') ||
    region.value !== (listing.value.region || 'Amhara') ||
    zone.value !== (listing.value.zone || '') ||
    Number(availableQty.value) !== Number(listing.value.availableQty || 0) ||
    Number(pricePerKg.value) !== Number(listing.value.pricePerKg || 0) ||
    description.value !== (listing.value.description || '')
  )
})

const loadListing = () => {
  if (listing.value) {
    cropName.value = listing.value.cropName || ''
    grade.value = listing.value.grade || 'Grade 1'
    region.value = listing.value.region || 'Amhara'
    zone.value = listing.value.zone || ''
    availableQty.value = listing.value.availableQty || 0
    pricePerKg.value = listing.value.pricePerKg || 0
    description.value = listing.value.description || ''
  }
}

onMounted(async () => {
  if (!listing.value) {
    await refreshListings()
  }
  loadListing()
})

watch(listing, loadListing, { immediate: true })

const handleSubmit = async () => {
  if (!listing.value) return
  isSaving.value = true
  try {
    await updateListing(listing.value.id, {
      cropName: cropName.value,
      grade: grade.value,
      region: region.value,
      zone: zone.value,
      availableQty: availableQty.value,
      pricePerKg: pricePerKg.value,
      description: description.value
    })
    router.push('/farmer/listings')
  } catch (err) {
    console.error('Failed to save listing changes:', err)
  } finally {
    isSaving.value = false
  }
}

const openDeleteModal = () => {
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  if (isDeleting.value) return
  isDeleteModalOpen.value = false
}

const confirmDelete = async () => {
  if (!listing.value) return
  isDeleting.value = true
  try {
    await deleteListing(listing.value.id)
    isDeleteModalOpen.value = false
    router.push('/farmer/listings')
  } finally {
    isDeleting.value = false
  }
}
</script>

