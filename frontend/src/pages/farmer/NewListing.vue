<template>
  <div class="w-full flex flex-col min-h-full bg-[#F8F9FA] dark:bg-[#0D1117] pb-28">
    <!-- Header -->
    <div class="px-4 py-3.5 bg-white dark:bg-[#161B22] border-b border-[#E2E4E7] dark:border-[#30363D] flex items-center justify-between sticky top-14 z-30 shadow-2xs">
      <div class="flex items-center gap-3">
        <button @click="$router.back()" class="w-9 h-9 rounded-xl border border-[#E2E4E7] dark:border-[#30363D] flex items-center justify-center hover:bg-[#F0F1F2] dark:hover:bg-[#21262D] transition-colors">
          <ArrowLeft class="w-5 h-5 text-[#1E2328] dark:text-[#F0F6FC]" />
        </button>
        <div>
          <h2 class="text-base font-black text-[#1E2328] dark:text-[#F0F6FC] tracking-tight">{{ $t('farmer.newListingTitle') }}</h2>
          <p class="text-[11px] text-[#5A6270] dark:text-[#8B949E]">Post new produce batch to B2B marketplace</p>
        </div>
      </div>
      <span class="px-2.5 py-1 rounded-full bg-[#EDFAF2] dark:bg-emerald-950/40 text-[#1E9444] dark:text-emerald-400 border border-[#C3EFCF] dark:border-emerald-800/60 text-[11px] font-bold flex items-center gap-1">
        <Sparkles class="w-3.5 h-3.5" /> Direct Sourcing
      </span>
    </div>

    <!-- Form Container -->
    <form @submit.prevent="handleSubmit" class="p-4 md:p-6 max-w-3xl mx-auto w-full space-y-6">
      <div v-if="submitError" class="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-2xl flex items-center gap-3 text-xs text-red-700 dark:text-red-400 font-bold shadow-2xs">
        <AlertCircle class="w-5 h-5 text-red-600 shrink-0" />
        <span>{{ $t(submitError) }}</span>
      </div>

      <!-- Section 1: Produce Media Upload -->
      <div class="bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] rounded-2xl p-5 shadow-2xs space-y-4">
        <div class="flex items-center justify-between border-b border-[#E2E4E7] dark:border-[#30363D] pb-3">
          <div>
            <h3 class="text-sm font-black text-[#1E2328] dark:text-[#F0F6FC] uppercase tracking-wider flex items-center gap-2">
              <Camera class="w-4 h-4 text-[#1E9444] dark:text-emerald-400" />
              <span>{{ $t('farmer.uploadImages') }}</span>
            </h3>
            <p class="text-[11px] text-[#5A6270] dark:text-[#8B949E] mt-0.5">High quality photos attract 3x more buyer offers</p>
          </div>
          <span class="text-xs font-bold text-[#1E9444] dark:text-emerald-400 bg-[#EDFAF2] dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-[#C3EFCF] dark:border-emerald-800/60">
            {{ photoPreviews.length }} / 5 Photos
          </span>
        </div>

        <!-- Upload Dropzone -->
        <label 
          for="fileUploadBtn" 
          :class="[
            'border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer block transition-all duration-200 bg-[#FAFBFD] dark:bg-[#0D1117]',
            photoPreviews.length >= 5 ? 'opacity-50 pointer-events-none border-gray-200 dark:border-gray-800' : 'border-[#C3EFCF] dark:border-emerald-800/60 hover:border-[#1E9444] hover:bg-[#F0FDF4] dark:hover:bg-[#161B22]'
          ]"
        >
          <input 
            type="file" 
            id="fileUploadBtn" 
            multiple 
            accept="image/*" 
            @change="handleFileSelect" 
            :disabled="photoPreviews.length >= 5"
            class="hidden" 
          />
          <div class="flex flex-col items-center">
            <div class="w-12 h-12 rounded-2xl bg-[#EDFAF2] dark:bg-emerald-950/40 border border-[#C3EFCF] dark:border-emerald-800/60 flex items-center justify-center mb-2.5">
              <UploadCloud class="w-6 h-6 text-[#1E9444] dark:text-emerald-400" />
            </div>
            <span class="text-sm font-bold text-[#1E2328] dark:text-[#F0F6FC] block">
              {{ isCompressing ? 'Compressing Produce Images...' : 'Tap or Drag produce photos here' }}
            </span>
            <span class="text-[11px] text-[#5A6270] dark:text-[#8B949E] mt-1">PNG, JPG, WebP up to 10MB per image</span>
          </div>
        </label>

        <!-- Loading State for Image Compression -->
        <div v-if="isCompressing" class="flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/60 rounded-xl text-xs text-[#0B57D0] dark:text-blue-400 font-bold animate-pulse">
          <Loader2 class="w-4 h-4 animate-spin text-[#0B57D0] dark:text-blue-400" />
          <span>Optimizing photos for fast marketplace display...</span>
        </div>

        <!-- Photo Previews Grid Deck -->
        <div v-if="photoPreviews.length > 0" class="space-y-2 pt-2">
          <span class="text-[11px] font-bold text-[#5A6270] dark:text-[#8B949E] block uppercase tracking-wider">Photo Gallery Preview</span>
          <div class="grid grid-cols-3 sm:grid-cols-5 gap-3">
            <div 
              v-for="(src, i) in photoPreviews" 
              :key="i" 
              class="relative group rounded-xl overflow-hidden border-2 border-[#E2E4E7] dark:border-[#30363D] aspect-square bg-gray-100 dark:bg-[#21262D] shadow-2xs"
            >
              <img :src="src" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              
              <!-- First Image Cover Badge -->
              <span v-if="i === 0" class="absolute top-1 left-1 bg-[#1E9444] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                <CheckCircle2 class="w-2.5 h-2.5" /> Cover
              </span>

              <!-- Remove Button -->
              <button 
                type="button" 
                @click.prevent="removePhoto(i)" 
                class="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shadow-md transition-colors"
                title="Remove image"
              >
                ×
              </button>
              
              <span class="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-bold px-1 rounded">
                #{{ i + 1 }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Crop Details -->
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
              placeholder="e.g. Washed Sidama G1 Coffee / Red Teff" 
              class="w-full px-3.5 py-2.5 bg-white dark:bg-[#0D1117] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-sm focus:outline-none focus:border-[#1E9444] font-medium" 
            />
          </div>

          <!-- Category -->
          <div>
            <label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">{{ $t('farmer.category') }} <span class="text-red-500">*</span></label>
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-xl overflow-hidden border border-[#E2E4E7] dark:border-[#30363D] bg-gray-50 dark:bg-[#21262D] flex items-center justify-center shrink-0 shadow-2xs">
                <img v-if="selectedCategoryImage" :src="selectedCategoryImage" class="w-full h-full object-cover" />
                <span v-else class="text-lg">🌾</span>
              </div>
              <select v-model="category" class="flex-1 px-3.5 py-2.5 bg-white dark:bg-[#0D1117] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-sm focus:outline-none focus:border-[#1E9444] font-medium cursor-pointer">
                <option value="coffee">☕ {{ $t('Coffee') }}</option>
                <option value="grains">🌾 {{ $t('Grains & Cereals') }}</option>
                <option value="spices">🌿 {{ $t('Spices') }}</option>
                <option value="oilseeds">🥜 {{ $t('Oilseeds') }}</option>
                <option value="pulses">🫘 {{ $t('Pulses') }}</option>
                <option value="roots">🧅 {{ $t('Roots & Tubers') }}</option>
                <option value="fruits">🍋 {{ $t('Fruits') }}</option>
                <option value="vegetables">🥬 {{ $t('Vegetables') }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <!-- Processing Method -->
          <div>
            <label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">{{ $t('Process Method') }}</label>
            <select v-model="processMethod" class="w-full px-3.5 py-2.5 bg-white dark:bg-[#0D1117] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1E9444] cursor-pointer">
              <option value="Washed">{{ $t('Washed') }}</option>
              <option value="Natural">{{ $t('Natural / Sun-dried') }}</option>
              <option value="Honey">{{ $t('Honey Processed') }}</option>
              <option value="Anaerobic">Anaerobic Fermented</option>
              <option value="N/A">N/A (Raw Fresh)</option>
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

      <!-- Section 3: Quantity & Pricing -->
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
            <label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">{{ $t('farmer.minimumOrderQuantity') }} (KG) <span class="text-red-500">*</span></label>
            <input type="number" required min="1" v-model.number="minOrderQty" class="w-full px-3.5 py-2.5 bg-white dark:bg-[#0D1117] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-sm font-bold focus:outline-none focus:border-[#1E9444]" />
          </div>
        </div>

        <div>
          <label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">{{ $t('farmer.pricePerKgETB') }} (ETB) <span class="text-red-500">*</span></label>
          <input type="number" required min="1" step="0.01" v-model.number="pricePerKg" class="w-full px-3.5 py-2.5 bg-white dark:bg-[#0D1117] border border-[#E2E4E7] dark:border-[#30363D] rounded-xl text-sm font-black text-[#1E9444] dark:text-emerald-400 focus:outline-none focus:border-[#1E9444]" />
          
          <!-- Financial Potential Live Preview Card -->
          <div class="mt-3 p-3.5 bg-[#EDFAF2] dark:bg-emerald-950/40 border border-[#C3EFCF] dark:border-emerald-800/60 rounded-xl flex items-center justify-between text-xs">
            <span class="text-[#0F5C2A] dark:text-emerald-300 font-bold flex items-center gap-1.5">
              <Sparkles class="w-4 h-4 text-[#1E9444] dark:text-emerald-400" /> 
              <span>{{ $t('Potential revenue preview:') }}</span>
            </span>
            <strong class="text-[#1E9444] dark:text-emerald-400 text-base font-black tracking-tight">
              {{ formatETB((availableQty || 0) * (pricePerKg || 0)) }}
            </strong>
          </div>
        </div>
      </div>

      <!-- Section 4: Harvest & Description -->
      <div class="bg-white dark:bg-[#161B22] border border-[#E2E4E7] dark:border-[#30363D] rounded-2xl p-5 shadow-2xs space-y-4">
        <h3 class="text-sm font-black text-[#1E2328] dark:text-[#F0F6FC] uppercase tracking-wider border-b border-[#E2E4E7] dark:border-[#30363D] pb-3 flex items-center gap-2">
          <Calendar class="w-4 h-4 text-[#1E9444] dark:text-emerald-400" />
          <span>{{ $t('Quality details') }}</span>
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">{{ $t('farmer.harvestDate') }}</label>
            <input type="date" v-model="harvestDate" class="w-full px-3.5 py-2.5 bg-white dark:bg-[#0D1117] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1E9444]" />
          </div>
          <div>
            <label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">{{ $t('Moisture % (optional)') }}</label>
            <input type="number" step="0.1" v-model.number="moistureContent" placeholder="11.0" class="w-full px-3.5 py-2.5 bg-white dark:bg-[#0D1117] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1E9444]" />
          </div>
        </div>

        <div>
          <label class="text-[12px] font-bold text-[#1E2328] dark:text-[#F0F6FC] block mb-1">{{ $t('farmer.cropDescription') }}</label>
          <textarea rows="4" v-model="description" placeholder="Describe crop origin, cupping notes, altitude, moisture grade..." class="w-full px-3.5 py-2.5 bg-white dark:bg-[#0D1117] border border-[#E2E4E7] dark:border-[#30363D] dark:text-[#F0F6FC] rounded-xl text-xs font-medium min-h-[100px] focus:outline-none focus:border-[#1E9444]" />
        </div>
      </div>

      <!-- Sticky Submit Bar -->
      <div class="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#161B22] border-t border-[#E2E4E7] dark:border-[#30363D] p-4 max-w-3xl mx-auto shadow-lg">
        <button 
          type="submit" 
          :disabled="isSubmitting || isCompressing" 
          class="w-full py-3.5 rounded-xl bg-[#1E9444] text-white font-black text-sm shadow-md hover:bg-[#0F5C2A] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
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
import { ArrowLeft, Camera, UploadCloud, Sparkles, Loader2, AlertCircle, CheckCircle2, Wheat, MapPin, Coins, Calendar } from 'lucide-vue-next'
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
const region = ref(user.value?.region || 'Amhara')
const zone = ref('Awi Zone, Injibara')
const availableQty = ref(5000)
const minOrderQty = ref(500)
const pricePerKg = ref(85)
const harvestDate = ref(new Date().toISOString().split('T')[0])
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
  
  if (photos.value.length + files.length > 5) {
    alert('Maximum 5 produce photos allowed per listing.')
  }
  
  const remainingSlots = 5 - photos.value.length
  const filesToProcess = files.slice(0, remainingSlots)

  isCompressing.value = true
  try {
    const compressedFiles = await compressImageFiles(filesToProcess, 1400, 1400, 0.8)
    for (const f of compressedFiles) {
      photos.value.push(f)
      const dataUrl = await readFileAsDataURL(f)
      photoPreviews.value.push(dataUrl)
      photoDataUrls.value.push(dataUrl)
    }
  } catch {
    for (const f of filesToProcess) {
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
      cropName: cropName.value || 'Ethiopian Agriculture Batch',
      cropEmoji: categoryEmojis[category.value] || '🌾',
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
