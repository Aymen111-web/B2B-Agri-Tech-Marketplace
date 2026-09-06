<template>
  <div class="w-full flex flex-col min-h-full bg-white pb-24">
    <div class="px-4 py-3 bg-white border-b border-[#E2E4E7] flex items-center gap-3 sticky top-14 z-30">
      <button @click="$router.back()" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F0F1F2] transition-colors">
        <ArrowLeft class="w-5 h-5 text-[#1E2328]" />
      </button>
      <h2 class="text-[17px] font-bold text-[#1E2328]">Post a new listing</h2>
    </div>

    <form @submit.prevent="handleSubmit" class="p-5 space-y-6">
      <div class="space-y-4">
        <h3 class="text-[15px] font-bold text-[#1E2328] border-b border-[#E2E4E7] pb-2">Crop details</h3>
        <div><label class="text-[12px] font-bold text-[#1E2328] block mb-1">Crop Name</label><input type="text" required v-model="cropName" placeholder="e.g. Sidama Washed Coffee G1" class="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[14px] focus:outline-none focus:border-[#1E9444]" /></div>
        <div><label class="text-[12px] font-bold text-[#1E2328] block mb-1">Category</label>
          <select v-model="category" class="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[14px] focus:outline-none focus:border-[#1E9444]">
            <option value="coffee">☕ Coffee</option><option value="grains">🌾 Grains</option><option value="spices">🌿 Spices</option><option value="oilseeds">🥜 Oilseeds</option><option value="pulses">🫘 Pulses</option><option value="roots">🧅 Roots</option><option value="fruits">🍋 Fruits</option><option value="vegetables">🥬 Vegetables</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="text-[12px] font-bold text-[#1E2328] block mb-1">Grade</label>
            <select v-model="grade" class="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#1E9444]">
              <option value="Grade 1">Grade 1</option><option value="Grade 2">Grade 2</option><option value="Export Quality">Export Quality</option><option value="Premium">Premium</option><option value="Standard">Standard</option>
            </select>
          </div>
          <div><label class="text-[12px] font-bold text-[#1E2328] block mb-1">Process Method</label>
            <select v-model="processMethod" class="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#1E9444]">
              <option value="Washed">Washed</option><option value="Natural">Natural</option><option value="Honey">Honey</option><option value="N/A">N/A</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="text-[12px] font-bold text-[#1E2328] block mb-1">Region</label>
            <select v-model="region" class="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#1E9444]">
              <option value="SNNPR">SNNPR</option><option value="Oromia">Oromia</option><option value="Amhara">Amhara</option><option value="Tigray">Tigray</option><option value="Harari">Harari</option><option value="Sidama">Sidama</option>
            </select>
          </div>
          <div><label class="text-[12px] font-bold text-[#1E2328] block mb-1">Zone</label><input type="text" v-model="zone" placeholder="e.g. Sidama / Bale" class="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#1E9444]" /></div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="text-[15px] font-bold text-[#1E2328] border-b border-[#E2E4E7] pb-2">Quantity & pricing</h3>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="text-[12px] font-bold text-[#1E2328] block mb-1">Available Qty (kg)</label><input type="number" required v-model.number="availableQty" class="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[14px] focus:outline-none focus:border-[#1E9444]" /></div>
          <div><label class="text-[12px] font-bold text-[#1E2328] block mb-1">Min Order (kg)</label><input type="number" required v-model.number="minOrderQty" class="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[14px] focus:outline-none focus:border-[#1E9444]" /></div>
        </div>
        <div>
          <label class="text-[12px] font-bold text-[#1E2328] block mb-1">Price per kg (ETB)</label>
          <input type="number" required v-model.number="pricePerKg" class="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[14px] font-bold text-[#1E9444] focus:outline-none focus:border-[#1E9444]" />
          <div class="mt-2 p-2.5 bg-[#EDFAF2] border border-[#C3EFCF] rounded-lg flex items-center justify-between text-[12px]">
            <span class="text-[#0F5C2A] font-semibold flex items-center gap-1"><Sparkles class="w-3.5 h-3.5 text-[#1E9444]" /> Potential revenue preview:</span>
            <strong class="text-[#1E9444] text-[14px] font-extrabold">{{ formatETB((availableQty || 0) * (pricePerKg || 0)) }}</strong>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="text-[15px] font-bold text-[#1E2328] border-b border-[#E2E4E7] pb-2">Quality details</h3>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="text-[12px] font-bold text-[#1E2328] block mb-1">Harvest Date</label><input type="date" v-model="harvestDate" class="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#1E9444]" /></div>
          <div><label class="text-[12px] font-bold text-[#1E2328] block mb-1">Moisture % (optional)</label><input type="number" step="0.1" v-model.number="moistureContent" placeholder="11.0" class="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#1E9444]" /></div>
        </div>
        <div><label class="text-[12px] font-bold text-[#1E2328] block mb-1">Produce Description</label><textarea rows="4" v-model="description" placeholder="Describe crop origin, cupping notes..." class="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[13px] min-h-[120px] focus:outline-none focus:border-[#1E9444]" /></div>
      </div>

      <div class="space-y-3">
        <h3 class="text-[15px] font-bold text-[#1E2328] border-b border-[#E2E4E7] pb-2">Photos</h3>
        <div @click="photos.push('uploaded-photo')" class="border-2 border-dashed border-[#E2E4E7] rounded-xl p-6 text-center cursor-pointer hover:border-[#1E9444] transition-colors bg-[#F8F9FA]">
          <Camera class="w-8 h-8 text-[#9BA1AA] mx-auto mb-2" /><span class="text-[13px] font-bold text-[#1E9444] block">Tap to upload produce photos</span><span class="text-[11px] text-[#5A6270]">PNG, JPG up to 10MB</span>
        </div>
        <div v-if="photos.length > 0" class="flex gap-2">
          <div v-for="(_, i) in photos" :key="i" class="w-16 h-16 rounded-lg bg-[#1E9444]/10 border border-[#1E9444] flex items-center justify-center text-[#1E9444] text-[11px] font-bold">Photo #{{ i + 1 }}</div>
        </div>
      </div>

      <div class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E4E7] p-4 max-w-[480px] md:max-w-4xl mx-auto shadow-md">
        <button type="submit" :disabled="isSubmitting" class="w-full py-3.5 rounded-full bg-[#1E9444] text-white font-bold text-[15px] shadow-md hover:bg-[#0F5C2A] transition-all flex items-center justify-center gap-2">
          <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
          <span>{{ isSubmitting ? 'Submitting...' : 'Submit for review' }}</span>
        </button>
        <p class="text-[11px] text-[#5A6270] text-center mt-1.5 font-medium">An admin will verify and publish within 24h</p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Camera, Sparkles, Loader2 } from 'lucide-vue-next'
import { useListings } from '@/composables/useListings'
import { useAuth } from '@/composables/useAuth'
import { formatETB } from '@/utils/helpers'

const router = useRouter()
const { addListing } = useListings()
const { user } = useAuth()

const cropName = ref('')
const category = ref('coffee')
const grade = ref('Grade 1')
const processMethod = ref('Washed')
const region = ref('SNNPR')
const zone = ref('Sidama')
const availableQty = ref(5000)
const minOrderQty = ref(500)
const pricePerKg = ref(85)
const harvestDate = ref('2024-02-15')
const moistureContent = ref(11.0)
const description = ref('')
const photos = ref([])
const isSubmitting = ref(false)

const categoryEmojis = { coffee: '☕', grains: '🌾', spices: '🌿', oilseeds: '🥜', pulses: '🫘', roots: '🧅', fruits: '🍋', vegetables: '🥬' }

const handleSubmit = async () => {
  isSubmitting.value = true
  await addListing({
    farmerId: user.value?.id || 'farmer-1',
    farmer: user.value,
    cropName: cropName.value || 'Sidama Coffee Special Batch',
    cropEmoji: categoryEmojis[category.value] || '☕',
    category: category.value,
    grade: grade.value,
    region: region.value,
    zone: zone.value,
    process: processMethod.value,
    pricePerKg: pricePerKg.value || 85,
    availableQty: availableQty.value || 5000,
    minOrderQty: minOrderQty.value || 500,
    harvestDate: new Date(harvestDate.value),
    moistureContent: moistureContent.value || 11.0,
    description: description.value || 'Highland Ethiopian farm direct produce harvest.',
    images: photos.value,
    isActive: true,
    isVerified: true,
  })
  isSubmitting.value = false
  router.push('/farmer/listings')
}
</script>
