<template>
  <div class="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
    <!-- Settings Modal -->
    <div v-if="isSettingsOpen" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white text-[#1E2328] rounded-2xl p-6 shadow-2xl space-y-5">
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center gap-2">
            <Settings class="w-5 h-5 text-[#1E9444]" />
            <h3 class="text-lg font-bold">{{ t('accountSettings') }}</h3>
          </div>
          <button @click="isSettingsOpen = false" class="p-1 rounded-lg hover:bg-gray-100 text-gray-500">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="space-y-4 text-xs">
          <div class="p-3 bg-[#F8F9FA] rounded-xl space-y-1">
            <span class="font-bold block text-[#1E2328]">{{ t('profileName') }}</span>
            <span class="text-[#5A6270]">{{ user?.name || 'User' }}</span>
          </div>
          <div class="p-3 bg-[#F8F9FA] rounded-xl space-y-1">
            <span class="font-bold block text-[#1E2328]">{{ t('phoneNumber') }}</span>
            <span class="text-[#5A6270]">{{ user?.phone || 'Not provided' }}</span>
          </div>
          <div class="p-3 bg-[#F8F9FA] rounded-xl flex items-center justify-between">
            <div>
              <span class="font-bold block text-[#1E2328]">{{ t('smsNotifications') }}</span>
              <span class="text-[#5A6270]">{{ t('smsAlertsDesc') }}</span>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">{{ t('enabled') }}</span>
          </div>
        </div>
        <button @click="isSettingsOpen = false" class="w-full py-2.5 rounded-xl bg-[#1E9444] text-white font-bold text-xs hover:bg-[#0F5C2A]">
          {{ t('saveCloseSettings') }}
        </button>
      </div>
    </div>

    <!-- Top Navigation Header -->
    <header :class="['sticky top-0 z-40 px-4 py-3 border-b flex items-center justify-between shadow-xs transition-colors',
      isFarmerTheme ? 'bg-[#062E15] text-white border-[#1E9444]/30' : 'bg-white/95 backdrop-blur-md text-[#1E2328] border-[#E2E4E7]']">
      <div class="flex items-center gap-3">
        <button @click="isSidebarOpen = !isSidebarOpen" aria-label="Toggle Side Navigation"
          :class="['hidden md:flex items-center justify-center p-2 rounded-lg transition-colors',
            isFarmerTheme ? 'hover:bg-[#0F5C2A] text-white' : 'hover:bg-[#F0F1F2] text-[#1E2328]']">
          <X v-if="isSidebarOpen" class="w-5 h-5 stroke-[2.5]" />
          <Menu v-else class="w-5 h-5 stroke-[2.5]" />
        </button>
        <div @click="goHome" class="flex items-center gap-2 cursor-pointer">
          <QelemMedaLogo :size="34" className="shrink-0" />
        </div>
      </div>

      <!-- Right: Profile dropdown -->
      <div class="flex items-center gap-3 relative" ref="dropdownRef">
        <LanguageToggle :variant="isFarmerTheme ? 'farmer' : 'default'" />
        <ThemeToggle />

        <!-- Profile Trigger -->
        <button @click="isProfileMenuOpen = !isProfileMenuOpen"
          :class="['flex items-center gap-3 px-3 py-1.5 rounded-2xl border transition-all duration-200 shadow-xs cursor-pointer',
            isFarmerTheme ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white' : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-[#1E2328]']">
          <div class="w-8 h-8 rounded-full bg-[#1E9444] text-white flex items-center justify-center text-xs font-extrabold shadow-sm border border-white/30 shrink-0">
            {{ user?.name?.[0] || 'U' }}
          </div>
          <div class="text-left leading-tight hidden sm:block">
            <span class="text-[13px] font-extrabold block tracking-tight">{{ user?.name || 'User' }}</span>
            <span :class="['text-[10px] font-semibold block capitalize', isFarmerTheme ? 'text-[#C3EFCF]' : 'text-[#5A6270]']">
              {{ roleTitle }}
            </span>
          </div>
          <ChevronDown :class="['w-4 h-4 transition-transform duration-200 shrink-0', isProfileMenuOpen ? 'rotate-180 text-[#1E9444]' : 'opacity-70']" />
        </button>

        <!-- Dropdown Popover -->
        <Transition name="slide">
          <div v-if="isProfileMenuOpen" class="absolute right-0 top-full mt-2 w-64 bg-white border border-[#E2E4E7] shadow-2xl rounded-2xl p-2 z-50 text-[#1E2328]">
            <div class="absolute -top-1.5 right-6 w-3 h-3 bg-white border-t border-l border-[#E2E4E7] rotate-45" />
            <div class="p-3 bg-gradient-to-r from-[#EDFAF2] to-emerald-50 rounded-xl mb-1.5 border border-[#C3EFCF]">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-full bg-[#1E9444] text-white flex items-center justify-center text-sm font-bold shadow-xs">
                  {{ user?.name?.[0] || 'U' }}
                </div>
                <div class="overflow-hidden">
                  <h4 class="text-xs font-extrabold text-[#0F5C2A] truncate">{{ user?.name || 'User' }}</h4>
                  <p class="text-[10px] text-[#5A6270] truncate">{{ user?.phone || user?.email || t('activeMember') }}</p>
                </div>
              </div>
              <div class="mt-2 pt-2 border-t border-[#C3EFCF] flex items-center justify-between text-[10px]">
                <span class="font-bold text-[#0F5C2A] uppercase">{{ t(user?.role === 'farmer' ? 'Farmer' : user?.role === 'admin' ? 'Admin' : 'Buyer') }}</span>
                <span class="flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle2 class="w-3 h-3 text-[#1E9444]" /> {{ t('verified') }}
                </span>
              </div>
            </div>

            <div class="space-y-1 text-xs">
              <button @click="goToProfile" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F0F1F2] transition-colors font-bold text-[#1E2328]">
                <User class="w-4 h-4 text-[#1E9444]" />
                <span>{{ isAdmin ? t('adminDashboard') : t('profile') }}</span>
              </button>

              <template v-if="!isAdmin">
                <button v-if="hasFarmerCapability && hasBuyerCapability" @click="handleRoleSwitchDropdown"
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#EDFAF2] transition-colors font-bold text-[#0F5C2A]">
                  <ArrowLeftRight class="w-4 h-4 text-[#1E9444]" />
                  <div class="text-left flex-1 flex items-center justify-between">
                    <span>{{ t('switchCapability') }}</span>
                    <span class="px-1.5 py-0.5 bg-[#1E9444] text-white rounded-md text-[9px] font-extrabold capitalize">
                      {{ user?.role === 'farmer' ? t('Buyer') : t('Farmer') }}
                    </span>
                  </div>
                </button>
                <button v-else @click="isProfileMenuOpen = false; $router.push('/apply')"
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F0F1F2] transition-colors font-bold text-[#1E2328]">
                  <ShieldCheck class="w-4 h-4 text-[#1E9444]" />
                  <div class="text-left flex-1 flex items-center justify-between">
                    <span>{{ t('updateCapability') }}</span>
                    <span v-if="pendingApplications.length > 0" class="px-1.5 py-0.5 bg-[#1E9444] text-white rounded-md text-[9px] font-extrabold">Pending</span>
                  </div>
                </button>
              </template>

              <div class="border-t border-gray-100 my-1" />
              <button @click="handleLogout" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors font-bold">
                <LogOut class="w-4 h-4 text-red-600" />
                <span>{{ t('logout') }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </header>

    <div class="flex-1 flex relative">
      <!-- Desktop Sidebar -->
      <aside :class="['hidden md:flex flex-col border-r fixed inset-y-0 left-0 pt-16 z-30 transition-all duration-300 ease-in-out',
        isSidebarOpen ? 'w-64' : 'w-20',
        isFarmerTheme ? 'bg-[#062E15] border-[#1E9444]/30 text-white' : 'bg-white border-[#E2E4E7] text-[#1E2328]']">
        <nav class="p-3 flex-1 space-y-1.5 overflow-y-auto">
          <template v-for="(item, index) in navItems" :key="item.path">
            <div v-if="showCategoryHeader(item, index)" class="pt-3 pb-1 px-3 text-[10px] font-extrabold text-[#9BA1AA] tracking-wider uppercase">
              {{ t(item.category) }}
            </div>
            <button @click="$router.push(item.path)" :title="!isSidebarOpen ? t(item.label) : undefined"
              :class="['w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all group',
                isNavActive(item) ? (isFarmerTheme ? 'bg-[#1E9444] text-white shadow-xs font-bold' : 'bg-[#EDFAF2] text-[#0F5C2A] shadow-2xs font-bold border-l-3 border-[#1E9444]')
                  : (isFarmerTheme ? 'text-[#C3EFCF] hover:bg-[#0F5C2A] hover:text-white' : 'text-[#1E2328] hover:bg-[#F0F1F2]'),
                !isSidebarOpen ? 'justify-center px-0' : '']">
              <div class="flex items-center gap-3 overflow-hidden">
                <component :is="item.icon"
                  :class="['w-4 h-4 shrink-0', isNavActive(item) ? (isFarmerTheme ? 'text-white' : 'text-[#1E9444]') : 'text-[#5A6270] group-hover:text-[#1E2328]']" />
                <span v-if="isSidebarOpen" class="truncate">{{ t(item.label) }}</span>
              </div>
              <div v-if="isSidebarOpen" class="flex items-center gap-1.5 shrink-0">
                <span v-if="item.badge" class="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#E69500] text-white shadow-2xs">
                  {{ item.badge }}
                </span>
                <ChevronRight :class="['w-3.5 h-3.5 shrink-0', isNavActive(item) ? (isFarmerTheme ? 'text-white' : 'text-[#1E9444]') : 'text-gray-400 opacity-60 group-hover:opacity-100']" />
              </div>
              <span v-else-if="item.badge" class="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#E69500]" />
            </button>
          </template>
        </nav>

        <div v-if="isSidebarOpen" class="p-3 border-t border-gray-200/50 m-3 rounded-xl bg-gray-50/60 text-xs">
          <div class="flex items-center gap-2">
            <User class="w-3.5 h-3.5 text-[#1E9444]" />
            <span class="font-bold text-[#1E2328] capitalize">{{ t(user?.role === 'farmer' ? 'Farmer' : user?.role === 'admin' ? 'Admin' : 'Buyer') }} {{ t('Mode Active') }}</span>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main :class="['flex-1 w-full pb-20 md:pb-8 transition-all duration-300 ease-in-out', isSidebarOpen ? 'md:ml-64' : 'md:ml-20']">
        <div class="max-w-7xl mx-auto p-4 md:p-6">
          <router-view />
        </div>
      </main>
    </div>

    <!-- Mobile Bottom Navigation -->
    <nav class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E4E7] py-2 px-4 flex items-center justify-around md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <button v-for="item in navItems" :key="item.path" @click="$router.push(item.path)"
        :class="['flex flex-col items-center gap-0.5 text-center min-w-[56px] py-1 transition-colors relative',
          isNavActive(item) ? 'text-[#1E9444]' : 'text-[#9BA1AA] hover:text-[#5A6270]']">
        <div class="relative">
          <component :is="item.icon" :class="['w-5 h-5', isNavActive(item) ? 'stroke-[2.5]' : 'stroke-[1.75]']" />
          <span v-if="item.badge" class="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 min-w-[16px] h-[16px] text-[9px] font-black bg-[#E69500] text-white rounded-full flex items-center justify-center border border-white shadow-2xs">
            {{ item.badge }}
          </span>
        </div>
        <span :class="['text-[11px]', isNavActive(item) ? 'font-bold' : 'font-medium']">{{ t(item.label) }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu, X, LogOut, User, ArrowLeftRight, ChevronDown, ChevronRight, Settings, ShieldCheck, CheckCircle2 } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import QelemMedaLogo from '@/components/common/QelemMedaLogo.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import LanguageToggle from '@/components/common/LanguageToggle.vue'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  navItems: { type: Array, required: true },
  theme: { type: String, default: 'light' },
})

const route = useRoute()
const router = useRouter()
const { user, logout, hasFarmerCapability, hasBuyerCapability, switchRole, pendingApplications } = useAuth()
const { t } = useLanguage()

const isSidebarOpen = ref(true)
const isProfileMenuOpen = ref(false)
const isSettingsOpen = ref(false)
const dropdownRef = ref(null)

const isFarmerTheme = computed(() => props.theme === 'farmerDark' || user.value?.role === 'farmer' || route.path.startsWith('/farmer'))
const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.is_admin)

const roleTitle = computed(() => {
  if (user.value?.role === 'admin') return 'Platform Administrator'
  if (user.value?.role === 'farmer') return 'Farmer Producer'
  if (user.value?.role === 'buyer') return 'Commercial Buyer'
  return 'Marketplace Member'
})

const isNavActive = (item) => {
  if (item.path === props.navItems[0]?.path) {
    return route.path === item.path
  }
  return route.path.startsWith(item.path)
}

const showCategoryHeader = (item, index) => {
  return isSidebarOpen.value && item.category && (index === 0 || props.navItems[index - 1].category !== item.category)
}

const goHome = () => {
  if (isAdmin.value) {
    router.push('/admin')
  } else {
    router.push(user.value?.role === 'farmer' ? '/farmer' : '/buyer')
  }
}

const goToProfile = () => {
  isProfileMenuOpen.value = false
  if (isAdmin.value) {
    router.push('/admin')
  } else {
    router.push(user.value?.role === 'farmer' ? '/farmer/profile' : '/buyer/profile')
  }
}

const handleRoleSwitch = () => {
  const nextRole = user.value?.role === 'farmer' ? 'buyer' : 'farmer'
  switchRole(nextRole)
  router.push(nextRole === 'farmer' ? '/farmer' : '/buyer')
}

const handleRoleSwitchDropdown = () => {
  isProfileMenuOpen.value = false
  handleRoleSwitch()
}

const handleLogout = () => {
  isProfileMenuOpen.value = false
  logout()
  router.push('/login')
}

// Close dropdown on click outside
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isProfileMenuOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))
</script>
