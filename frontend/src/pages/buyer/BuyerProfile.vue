<template>
  <div class="space-y-6 max-w-4xl pb-6">
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E4E7] pb-4">
      <div>
        <h1 class="text-2xl font-black text-[#1E2328] tracking-tight">
          Buyer <span class="text-[#0B57D0]">Profile & Account</span> 👤
        </h1>
        <p class="text-xs text-[#5A6270] mt-0.5">
          Commercial procurement credentials, capital investment overview, and delivery settings.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button @click="showEditModal = true" 
          class="px-4 py-2 bg-white border border-[#E2E4E7] hover:border-[#0B57D0] text-[#1E2328] hover:text-[#0B57D0] rounded-xl text-xs font-extrabold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer">
          <Edit3 class="w-3.5 h-3.5 text-[#0B57D0]" />
          <span>Edit Profile</span>
        </button>
        <button @click="logout" 
          class="px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5 cursor-pointer">
          <LogOut class="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>

    <!-- Redesigned Identity Header Card with Photo Change & Compact Small Badges -->
    <div class="bg-white border border-[#E2E4E7] rounded-2xl p-6 shadow-2xs space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center gap-5">
        <!-- Avatar with Interactive Photo Upload Button -->
        <div class="relative group cursor-pointer" @click="triggerPhotoUpload">
          <div v-if="customPhotoUrl" 
            class="w-18 h-18 rounded-2xl overflow-hidden border-2 border-[#0B57D0] shadow-md">
            <img :src="customPhotoUrl" alt="Profile" class="w-full h-full object-cover" />
          </div>
          <div v-else 
            class="w-18 h-18 rounded-2xl bg-gradient-to-br from-[#0B57D0] via-[#09429E] to-[#1E9444] text-white flex items-center justify-center text-2xl font-black shadow-md border-2 border-amber-300">
            {{ user?.name?.[0] || 'A' }}
          </div>

          <!-- Photo Change Overlay -->
          <div class="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
            <Camera class="w-5 h-5" />
          </div>
          <button class="absolute -bottom-1 -right-1 w-6 h-6 bg-[#E69500] text-white rounded-full flex items-center justify-center shadow-md border-2 border-white">
            <Camera class="w-3 h-3" />
          </button>
        </div>

        <!-- Hidden File Input for Avatar Upload -->
        <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="handlePhotoChange" />

        <div class="space-y-1.5 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-xl font-black text-[#1E2328] tracking-tight">{{ user?.name || 'Awol Buyer' }}</h2>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck class="w-3.5 h-3.5 text-[#1E9444]" />
              <span>Verified Buyer</span>
            </span>
          </div>

          <p class="text-xs text-[#5A6270] flex items-center gap-2 font-semibold">
            <Phone class="w-3.5 h-3.5 text-[#0B57D0]" />
            <span>{{ user?.phone || '+251 918 982 161' }}</span>
            <span>•</span>
            <span class="text-[#1E2328]">{{ profileData.region }}</span>
            <span>•</span>
            <button @click="triggerPhotoUpload" class="text-[11px] font-extrabold text-[#0B57D0] hover:underline">
              Change Photo
            </button>
          </p>

          <!-- Small Compact Badges (3 Years & 4M Invested) -->
          <div class="pt-1 flex items-center gap-2 flex-wrap">
            <span class="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-blue-50 text-[#0B57D0] border border-blue-200 flex items-center gap-1">
              <Wallet class="w-3 h-3 text-[#0B57D0]" />
              <span>4M+ ETB Invested</span>
            </span>

            <span class="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-amber-50 text-[#E69500] border border-amber-200 flex items-center gap-1">
              <Clock class="w-3 h-3 text-[#E69500]" />
              <span>3 Years Member</span>
            </span>

            <span class="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-emerald-50 text-[#1E9444] border border-emerald-200 flex items-center gap-1">
              <Building2 class="w-3 h-3 text-[#1E9444]" />
              <span>34 Batches</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Commercial & Logistics Information Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white border border-[#E2E4E7] rounded-2xl p-5 shadow-2xs space-y-4">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <div class="flex items-center gap-2">
            <Building2 class="w-4 h-4 text-[#0B57D0]" />
            <h3 class="text-sm font-bold text-[#1E2328]">Commercial Sourcing Identity</h3>
          </div>
          <span class="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Verified</span>
        </div>

        <div class="space-y-3 text-xs">
          <div class="flex justify-between py-1.5 border-b border-gray-50">
            <span class="text-[#5A6270] font-semibold">Registered Full Name:</span>
            <span class="font-bold text-[#1E2328]">{{ user?.name || 'Awol Buyer' }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-gray-50">
            <span class="text-[#5A6270] font-semibold">Business / Company Name:</span>
            <span class="font-bold text-[#1E2328]">{{ profileData.businessName }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-gray-50">
            <span class="text-[#5A6270] font-semibold">Tax Identification (TIN):</span>
            <span class="font-mono font-bold text-[#1E2328]">{{ profileData.tinNumber }}</span>
          </div>
          <div class="flex justify-between py-1.5">
            <span class="text-[#5A6270] font-semibold">Primary Commercial Region:</span>
            <span class="font-bold text-[#0B57D0]">{{ profileData.region }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white border border-[#E2E4E7] rounded-2xl p-5 shadow-2xs space-y-4">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <div class="flex items-center gap-2">
            <CreditCard class="w-4 h-4 text-[#E69500]" />
            <h3 class="text-sm font-bold text-[#1E2328]">Logistics & Escrow Security</h3>
          </div>
          <span class="text-[10px] font-extrabold text-[#E69500] bg-amber-50 px-2 py-0.5 rounded-md">Chapa Active</span>
        </div>

        <div class="space-y-3 text-xs">
          <div class="flex justify-between py-1.5 border-b border-gray-50">
            <span class="text-[#5A6270] font-semibold">Default Delivery Hub:</span>
            <span class="font-bold text-[#1E2328]">{{ profileData.deliveryHub }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-gray-50">
            <span class="text-[#5A6270] font-semibold">Escrow Provider:</span>
            <span class="font-bold text-[#1E9444]">Chapa Payment Guarantee</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-gray-50">
            <span class="text-[#5A6270] font-semibold">Settlement Currency:</span>
            <span class="font-bold text-[#1E2328]">ETB (Ethiopian Birr)</span>
          </div>
          <div class="flex justify-between py-1.5">
            <span class="text-[#5A6270] font-semibold">Driver Verification:</span>
            <span class="font-bold text-[#0B57D0]">4-Digit PIN Handover</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-2xl p-6 shadow-2xl space-y-4 text-[#1E2328]">
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center gap-2">
            <Edit3 class="w-5 h-5 text-[#0B57D0]" />
            <h3 class="text-base font-bold">Edit Commercial Profile</h3>
          </div>
          <button @click="showEditModal = false" class="p-1 text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-[#1E2328] mb-1">Company / Business Name</label>
            <input type="text" v-model="profileData.businessName" 
              class="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-xs focus:outline-none focus:border-[#0B57D0]" />
          </div>

          <div>
            <label class="block font-bold text-[#1E2328] mb-1">Commercial Region</label>
            <input type="text" v-model="profileData.region" 
              class="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-xs focus:outline-none focus:border-[#0B57D0]" />
          </div>

          <div>
            <label class="block font-bold text-[#1E2328] mb-1">Default Delivery Destination Hub</label>
            <input type="text" v-model="profileData.deliveryHub" 
              class="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-xs focus:outline-none focus:border-[#0B57D0]" />
          </div>
        </div>

        <div class="flex gap-2 pt-2">
          <button @click="showEditModal = false" class="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold text-xs hover:bg-gray-50">
            Cancel
          </button>
          <button @click="saveProfile" class="flex-1 py-2.5 bg-[#0B57D0] text-white rounded-xl font-bold text-xs hover:bg-[#09429E] shadow-2xs">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ShieldCheck, Phone, Building2, CreditCard, Edit3, LogOut, Camera, Wallet, Clock, X } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { api } from '@/services/api'

const { user, logout } = useAuth()
const showEditModal = ref(false)
const fileInput = ref(null)
const customPhotoUrl = ref(null)

const profileData = reactive({
  businessName: user.value?.businessName || 'QMT Commercial Procurement Ltd',
  tinNumber: '0098471203',
  region: user.value?.region || 'Addis Ababa',
  deliveryHub: 'Kality Logistics Center Hub #4',
})

const triggerPhotoUpload = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handlePhotoChange = async (e) => {
  const file = e.target.files?.[0]
  if (file) {
    customPhotoUrl.value = URL.createObjectURL(file)
    try {
      const formData = new FormData()
      formData.append('profile_photo', file)
      await api.updateProfile(formData)
    } catch {
      // offline fallback
    }
  }
}

const saveProfile = async () => {
  try {
    await api.updateProfile({
      business_name: profileData.businessName,
      region: profileData.region,
      delivery_hub: profileData.deliveryHub,
    })
  } catch {
    // offline fallback
  }
  showEditModal.value = false
}
</script>
