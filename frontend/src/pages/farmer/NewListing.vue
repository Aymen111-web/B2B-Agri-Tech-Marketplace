<template>
  <div class="w-full flex flex-col min-h-full bg-white dark:bg-[#0D1117] pb-24">
    <div class="px-4 py-3 bg-white dark:bg-[#161B22] border-b border-[#E2E4E7] dark:border-[#30363D] flex items-center gap-3 sticky top-14 z-30">
      <button @click="$router.back()" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F0F1F2] dark:hover:bg-[#21262D] transition-colors">
        <ArrowLeft class="w-5 h-5 text-[#1E2328] dark:text-[#F0F6FC]" />
      </button>
      <h2 class="text-[17px] font-bold text-[#1E2328] dark:text-[#F0F6FC]">{{ $t('farmer.newListingTitle') }}</h2>
    </div>

    <form @submit.prevent="handleSubmit" class="p-5 space-y-6">
      <div v-if="submitError" class="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-2xl flex items-center gap-2.5 text-xs text-red-700 dark:text-red-400 font-bold">
        <AlertCircle class="w-4 h-4 text-red-600 shrink-0" />
        <span>{{ $t(submitError) }}</span>
      </div>

      <div class="space-y-4">
        <h3 class="text-[15px] font-bold text-[#1E2328] dark:text-[#F0F6FC] border-b border-[#E2E4E7] dark:border-[#30363D] pb-2">{{ $t('Crop Details') }}</h3>
        <div><label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">{{ $t('farmer.cropName') }}</label><input type="text" required v-model="cropName" placeholder="e.g. Sidama Washed Coffee G1" class="w-full px-3.5 py-2.5 bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-[14px] focus:outline-none focus:border-[#1E9444]" /></div>
        <div><label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">{{ $t('farmer.category') }}</label>
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl overflow-hidden border border-[#E2E4E7] dark:border-[#30363D] bg-gray-50 dark:bg-[#21262D] flex items-center justify-center shrink-0 shadow-2xs">
              <img v-if="selectedCategoryImage" :src="selectedCategoryImage" class="w-full h-full object-cover" />
              <span v-else class="text-lg">☕</span>
            </div>
            <select v-model="category" class="flex-1 px-3.5 py-2.5 bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-[14px] focus:outline-none focus:border-[#1E9444]">
              <option value="coffee"> {{ $t('Coffee') || 'Coffee' }}</option>
              <option value="grains">{{ $t('Grains') || 'Grains' }}</option>
              <option value="spices"> {{ $t('Spices') || 'Spices' }}</option>
              <option value="oilseeds"> {{ $t('Oilseeds') || 'Oilseeds' }}</option>
              <option value="pulses"> {{ $t('Pulses') || 'Pulses' }}</option>
              <option value="roots"> {{ $t('Roots') || 'Roots' }}</option>
              <option value="fruits"> {{ $t('Fruits') || 'Fruits' }}</option>
              <option value="vegetables"> {{ $t('Vegetables') || 'Vegetables' }}</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">{{ $t('farmer.cropGrade') }}</label>
            <select v-model="grade" class="w-full px-3.5 py-2.5 bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-[13px] focus:outline-none focus:border-[#1E9444]">
              <option value="Grade 1">Grade 1</option><option value="Grade 2">Grade 2</option><option value="Export Quality">Export Quality</option><option value="Premium">Premium</option><option value="Standard">Standard</option>
            </select>
          </div>
          <div><label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">{{ $t('Process Method') }}</label>
            <select v-model="processMethod" class="w-full px-3.5 py-2.5 bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-[13px] focus:outline-none focus:border-[#1E9444]">
              <option value="Washed">{{ $t('Washed') }}</option><option value="Natural">{{ $t('Natural') }}</option><option value="Honey">{{ $t('Honey') }}</option><option value="N/A">N/A</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">{{ $t('Region') }}</label>
            <select v-model="region" class="w-full px-3.5 py-2.5 bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-[13px] focus:outline-none focus:border-[#1E9444]">
              <option value="SNNPR">{{ $t('SNNPR') }}</option><option value="Oromia">{{ $t('Oromia') }}</option><option value="Amhara">{{ $t('Amhara') }}</option><option value="Tigray">{{ $t('Tigray') }}</option><option value="Harari">{{ $t('Harari') }}</option><option value="Sidama">{{ $t('Sidama') }}</option>
            </select>
          </div>
          <div><label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">{{ $t('Zone') }}</label><input type="text" v-model="zone" placeholder="e.g. Sidama / Bale" class="w-full px-3.5 py-2.5 bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-[13px] focus:outline-none focus:border-[#1E9444]" /></div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="text-[15px] font-bold text-[#1E2328] dark:text-[#F0F6FC] border-b border-[#E2E4E7] dark:border-[#30363D] pb-2">{{ $t('Quantity & pricing') }}</h3>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">{{ $t('farmer.availableQuantityKg') }}</label><input type="number" required v-model.number="availableQty" class="w-full px-3.5 py-2.5 bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-[14px] focus:outline-none focus:border-[#1E9444]" /></div>
          <div><label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">{{ $t('farmer.minimumOrderQuantity') }}</label><input type="number" required v-model.number="minOrderQty" class="w-full px-3.5 py-2.5 bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-[14px] focus:outline-none focus:border-[#1E9444]" /></div>
        </div>
        <div>
          <label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">{{ $t('farmer.pricePerKgETB') }}</label>
          <input type="number" required v-model.number="pricePerKg" class="w-full px-3.5 py-2.5 bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] rounded-xl text-[14px] font-bold text-[#1E9444] dark:text-emerald-400 focus:outline-none focus:border-[#1E9444]" />
          <div class="mt-2 p-2.5 bg-[#EDFAF2] dark:bg-emerald-950/40 border border-[#C3EFCF] dark:border-emerald-800/60 rounded-lg flex items-center justify-between text-[12px]">
            <span class="text-[#0F5C2A] dark:text-emerald-300 font-semibold flex items-center gap-1"><Sparkles class="w-3.5 h-3.5 text-[#1E9444] dark:text-emerald-400" /> {{ $t('Potential revenue preview:') }}</span>
            <strong class="text-[#1E9444] dark:text-emerald-400 text-[14px] font-extrabold">{{ formatETB((availableQty || 0) * (pricePerKg || 0)) }}</strong>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="text-[15px] font-bold text-[#1E2328] dark:text-[#F0F6FC] border-b border-[#E2E4E7] dark:border-[#30363D] pb-2">{{ $t('Quality details') }}</h3>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">{{ $t('farmer.harvestDate') }}</label><input type="date" v-model="harvestDate" class="w-full px-3.5 py-2.5 bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-[13px] focus:outline-none focus:border-[#1E9444]" /></div>
          <div><label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">{{ $t('Moisture % (optional)') }}</label><input type="number" step="0.1" v-model.number="moistureContent" placeholder="11.0" class="w-full px-3.5 py-2.5 bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-[13px] focus:outline-none focus:border-[#1E9444]" /></div>
        </div>
        <div><label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">{{ $t('farmer.cropDescription') }}</label><textarea rows="4" v-model="description" placeholder="Describe crop origin, cupping notes..." class="w-full px-3.5 py-2.5 bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-[13px] min-h-[120px] focus:outline-none focus:border-[#1E9444]" /></div>
      </div>

      <div class="space-y-3">
        <h3 class="text-[15px] font-bold text-[#1E2328] dark:text-[#F0F6FC] border-b border-[#E2E4E7] dark:border-[#30363D] pb-2">{{ $t('farmer.uploadImages') }}</h3>
        <label for="fileUploadBtn" class="border-2 border-dashed border-[#E2E4E7] dark:border-[#30363D] rounded-xl p-6 text-center cursor-pointer hover:border-[#1E9444] block transition-colors bg-[#F8F9FA] dark:bg-[#161B22]">
          <input type="file" id="fileUploadBtn" multiple accept="image/*" @change="handleFileSelect" class="hidden" />
          <Camera class="w-8 h-8 text-[#9BA1AA] dark:text-[#8B949E] mx-auto mb-2" />
          <span class="text-[13px] font-bold text-[#1E9444] dark:text-emerald-400 block">{{ $t('Tap to upload produce photos') }}</span>
          <span class="text-[11px] text-[#5A6270] dark:text-[#8B949E] block mt-0.5">PNG, JPG up to 10MB · Uploaded crop photo will be displayed on the marketplace</span>
        </label>
        
        <div v-if="photoPreviews.length > 0" class="flex gap-3 overflow-x-auto pb-2">
          <div v-for="(src, i) in photoPreviews" :key="i" class="relative shrink-0">
             <img :src="src" class="w-20 h-20 object-cover rounded-lg border border-[#E2E4E7] dark:border-[#30363D]" />
             <button type="button" @click.prevent="removePhoto(i)" class="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs font-black flex items-center justify-center cursor-pointer">×</button>
          </div>
        </div>
      </div>

      <div class="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#161B22] border-t border-[#E2E4E7] dark:border-[#30363D] p-4 max-w-[480px] md:max-w-4xl mx-auto shadow-md">
        <button type="submit" :disabled="isSubmitting" class="w-full py-3.5 rounded-full bg-[#1E9444] text-white font-bold text-[15px] shadow-md hover:bg-[#0F5C2A] transition-all flex items-center justify-center gap-2 cursor-pointer">
          <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
          <span>{{ isSubmitting ? $t('Submitting...') : $t('Submit for review') }}</span>
        </button>
        <p class="text-[11px] text-[#5A6270] dark:text-[#8B949E] text-center mt-1.5 font-medium">{{ $t('An admin will verify and publish within 24h') }}</p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Camera, Sparkles, Loader2, AlertCircle } from 'lucide-vue-next'
import { useListings } from '@/composables/useListings'
import { useAuth } from '@/composables/useAuth'
import { formatETB } from '@/utils/helpers'
import { compressImageFiles } from '@/utils/imageCompressor'
import { CATEGORY_PHOTOS } from '@/utils/categoryImages'

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
const photos = ref([]) // Holds Raw File Objects
const photoPreviews = ref([]) // Holds Base64 Data URLs for preview & display
const photoDataUrls = ref([]) // Base64 data URLs for storage & instant display

const selectedCategoryImage = computed(() => CATEGORY_PHOTOS[category.value] || null)

const isCompressing = ref(false)

function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => resolve(URL.createObjectURL(file))
    reader.readAsDataURL(file)
  })
}

const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files)
  if (!files.length) return
  
  isCompressing.value = true
  try {
    const compressedFiles = await compressImageFiles(files, 1400, 1400, 0.8)
    for (const f of compressedFiles) {
      photos.value.push(f)
      const dataUrl = await readFileAsDataURL(f)
      photoPreviews.value.push(dataUrl)
      photoDataUrls.value.push(dataUrl)
    }
  } catch (e) {
    for (const f of files) {
      photos.value.push(f)
      const dataUrl = await readFileAsDataURL(f)
      photoPreviews.value.push(dataUrl)
      photoDataUrls.value.push(dataUrl)
    }
  } finally {
    isCompressing.value = false
  }
}

const removePhoto = (index) => {
  photos.value.splice(index, 1)
  photoPreviews.value.splice(index, 1)
  photoDataUrls.value.splice(index, 1)
}

const isSubmitting = ref(false)
const submitError = ref(null)

const categoryEmojis = { coffee: '☕', grains: '🌾', spices: '🌿', oilseeds: '🥜', pulses: '🫘', roots: '🧅', fruits: '🍋', vegetables: '🥬' }

const handleSubmit = async () => {
  submitError.value = null
  isSubmitting.value = true
  
  try {
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
      primaryImage: photoDataUrls.value[0] || null,
      images: photoDataUrls.value,
      rawFiles: photos.value,
      isActive: true,
      isVerified: true,
    })
    isSubmitting.value = false
    router.push('/farmer/listings')
  } catch (err) {
    isSubmitting.value = false
    submitError.value = err.message || 'Failed to post crop listing. Please verify your details.'
  }
}
</script>
