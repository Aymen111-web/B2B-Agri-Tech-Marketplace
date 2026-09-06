<template>
  <div v-if="listing" class="w-full flex flex-col min-h-full bg-white pb-24">
    <div class="px-4 py-3 bg-white border-b border-[#E2E4E7] flex items-center gap-3 sticky top-14 z-30">
      <button @click="$router.back()" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F0F1F2] transition-colors">
        <ArrowLeft class="w-5 h-5 text-[#1E2328]" />
      </button>
      <h2 class="text-[17px] font-bold text-[#1E2328]">Edit Listing #{{ listing.id }}</h2>
    </div>

    <form @submit.prevent="handleSubmit" class="p-5 space-y-6">
      <div class="space-y-4">
        <h3 class="text-[15px] font-bold text-[#1E2328] border-b border-[#E2E4E7] pb-2">Crop Details</h3>
        <div><label class="text-[12px] font-bold text-[#1E2328] block mb-1">Crop Name</label><input type="text" required v-model="cropName" class="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[14px] focus:outline-none focus:border-[#1E9444]" /></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="text-[12px] font-bold text-[#1E2328] block mb-1">Available Qty (kg)</label><input type="number" required v-model.number="availableQty" class="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[14px] focus:outline-none focus:border-[#1E9444]" /></div>
          <div><label class="text-[12px] font-bold text-[#1E2328] block mb-1">Price per kg (ETB)</label><input type="number" required v-model.number="pricePerKg" class="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[14px] font-bold text-[#1E9444] focus:outline-none focus:border-[#1E9444]" /></div>
        </div>
        <div><label class="text-[12px] font-bold text-[#1E2328] block mb-1">Description</label><textarea rows="4" v-model="description" class="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#1E9444]" /></div>
      </div>

      <div class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E4E7] p-4 max-w-[480px] md:max-w-4xl mx-auto shadow-md flex gap-3">
        <button type="button" @click="handleDelete" class="w-1/3 py-3.5 rounded-full border border-red-200 text-red-600 font-bold text-[14px] hover:bg-red-50">Delete</button>
        <button type="submit" :disabled="isSaving" class="w-2/3 py-3.5 rounded-full bg-[#1E9444] text-white font-bold text-[15px] shadow-md hover:bg-[#0F5C2A] flex items-center justify-center gap-2">
          <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
          <span>{{ isSaving ? 'Saving...' : 'Save Changes' }}</span>
        </button>
      </div>
    </form>
  </div>
  <div v-else class="text-center py-12 text-[#5A6270]">
    <p>Listing not found.</p>
    <router-link to="/farmer/listings" class="text-[#1E9444] font-bold">Back to My Listings</router-link>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Loader2 } from 'lucide-vue-next'
import { useListings } from '@/composables/useListings'

const route = useRoute()
const router = useRouter()
const { getListingById, updateListing, deleteListing } = useListings()

const listing = computed(() => getListingById(route.params.id))
const cropName = ref('')
const availableQty = ref(0)
const pricePerKg = ref(0)
const description = ref('')
const isSaving = ref(false)

const loadListing = () => {
  if (listing.value) {
    cropName.value = listing.value.cropName || ''
    availableQty.value = listing.value.availableQty || 0
    pricePerKg.value = listing.value.pricePerKg || 0
    description.value = listing.value.description || ''
  }
}

onMounted(loadListing)
watch(listing, loadListing)

const handleSubmit = async () => {
  if (!listing.value) return
  isSaving.value = true
  await updateListing(listing.value.id, {
    cropName: cropName.value,
    availableQty: availableQty.value,
    pricePerKg: pricePerKg.value,
    description: description.value
  })
  isSaving.value = false
  router.push('/farmer/listings')
}

const handleDelete = async () => {
  if (confirm('Are you sure you want to delete this listing?')) {
    await deleteListing(listing.value.id)
    router.push('/farmer/listings')
  }
}
</script>
