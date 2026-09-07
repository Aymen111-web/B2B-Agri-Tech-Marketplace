<template>
  <div class="min-h-screen bg-[#F8F9FA] text-[#1E2328] font-sans flex flex-col selection:bg-[#1E9444] selection:text-white">
    <!-- NAVBAR -->
    <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E4E7] shadow-2xs transition-all">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-3 group">
          <QelemMedaLogo :size="40" variant="full" />
        </router-link>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center gap-8 text-xs font-bold text-[#5A6270]">
          <router-link to="/" class="hover:text-[#1E9444] transition-colors text-[#1E9444]">Home</router-link>
          <a href="#how-it-works" class="hover:text-[#1E9444] transition-colors">How It Works</a>
          <a href="#about" class="hover:text-[#1E9444] transition-colors">About Us</a>
        </nav>

        <!-- Right Action Buttons -->
        <div class="flex items-center gap-3">
          <template v-if="isAuthenticated">
            <button 
              @click="goToDashboard" 
              class="px-4 py-2.5 rounded-xl bg-[#EDFAF2] text-[#0F5C2A] border border-[#C3EFCF] hover:bg-[#D8F6E0] text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <User class="w-4 h-4 text-[#1E9444]" />
              <span>Go to Dashboard</span>
            </button>
          </template>

          <template v-else>
            <router-link 
              to="/login" 
              class="px-4 py-2.5 rounded-xl border border-[#E2E4E7] hover:border-[#1E9444] text-[#1E2328] hover:text-[#1E9444] text-xs font-extrabold transition-all cursor-pointer bg-white"
            >
              Login
            </router-link>

            <router-link 
              to="/marketplace" 
              class="px-5 py-2.5 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white text-xs font-black transition-all shadow-xs hover:shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Store class="w-4 h-4 stroke-[2.5]" />
              <span>Explore Marketplace</span>
            </router-link>
          </template>
        </div>
      </div>
    </header>

    <!-- HERO SECTION -->
    <section class="relative bg-gradient-to-b from-[#062E15] via-[#0F5C2A] to-[#062E15] text-white overflow-hidden py-16 lg:py-24">
      <!-- Decorative Background Glows -->
      <div class="absolute -top-20 -right-20 w-96 h-96 bg-[#E69500]/20 rounded-full blur-3xl pointer-events-none" />
      <div class="absolute -bottom-20 -left-20 w-96 h-96 bg-[#0B57D0]/20 rounded-full blur-3xl pointer-events-none" />

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <!-- Left Column: Copy & CTAs -->
          <div class="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#C3EFCF] text-xs font-extrabold">
              <Sparkles class="w-3.5 h-3.5 text-[#E69500]" />
              <span>Ethiopia's Premier B2B Agriculture Marketplace</span>
            </div>

            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Connecting Ethiopian Farmers with <span class="text-[#E69500]">Growing Businesses</span>
            </h1>

            <p class="text-sm sm:text-base text-[#C3EFCF] font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Source quality agricultural products directly from Ethiopian farmers and cooperatives through one trusted marketplace. Discover verified produce, transparent pricing, and direct market access for processors, exporters, and wholesalers.
            </p>

            <!-- Value Bullets -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-left max-w-xl mx-auto lg:mx-0 text-xs text-white/90 font-semibold">
              <div class="flex items-center gap-2">
                <CheckCircle2 class="w-4 h-4 text-[#E69500] shrink-0" />
                <span>Direct Farmer Trade</span>
              </div>
              <div class="flex items-center gap-2">
                <CheckCircle2 class="w-4 h-4 text-[#E69500] shrink-0" />
                <span>Verified Crop Grades</span>
              </div>
              <div class="flex items-center gap-2">
                <CheckCircle2 class="w-4 h-4 text-[#E69500] shrink-0" />
                <span>Escrow Payment</span>
              </div>
            </div>

            <!-- Primary CTAs -->
            <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-4">
              <router-link 
                to="/marketplace" 
                class="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#E69500] hover:bg-[#D48900] text-black font-black text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Store class="w-4 h-4 stroke-[2.5]" />
                <span>Explore Marketplace</span>
              </router-link>

              <router-link 
                to="/login" 
                class="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn class="w-4 h-4 text-[#C3EFCF]" />
                <span>Login to Portal</span>
              </router-link>
            </div>
          </div>

          <!-- Right Column: Crop Showcase Cards Grid -->
          <div class="lg:col-span-5 relative">
            <div class="grid grid-cols-2 gap-3 sm:gap-4">
              
              <!-- Teff Card -->
              <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white hover:bg-white/15 transition-all shadow-lg space-y-2">
                <div class="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-3xl">🌾</div>
                <div>
                  <h4 class="text-sm font-black text-white">Amber & White Teff</h4>
                  <p class="text-[11px] text-[#C3EFCF]">Gojjam & Shoa Regions</p>
                </div>
                <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E69500] text-black">Grade A Pure</span>
              </div>

              <!-- Coffee Card -->
              <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white hover:bg-white/15 transition-all shadow-lg space-y-2 translate-y-3">
                <div class="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-3xl">☕</div>
                <div>
                  <h4 class="text-sm font-black text-white">Sidama Washed Coffee</h4>
                  <p class="text-[11px] text-[#C3EFCF]">SNNPR Specialty Union</p>
                </div>
                <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-black">Export Grade 1</span>
              </div>

              <!-- Sesame Card -->
              <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white hover:bg-white/15 transition-all shadow-lg space-y-2 -translate-y-3">
                <div class="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-400/30 flex items-center justify-center text-3xl">🌱</div>
                <div>
                  <h4 class="text-sm font-black text-white">Humera White Sesame</h4>
                  <p class="text-[11px] text-[#C3EFCF]">Tigray & Amhara Co-ops</p>
                </div>
                <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-400 text-black">99% Purity</span>
              </div>

              <!-- Spices / Wheat Card -->
              <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white hover:bg-white/15 transition-all shadow-lg space-y-2">
                <div class="w-12 h-12 rounded-xl bg-red-500/20 border border-red-400/30 flex items-center justify-center text-3xl">🌶️</div>
                <div>
                  <h4 class="text-sm font-black text-white">Bale Durum Wheat</h4>
                  <p class="text-[11px] text-[#C3EFCF]">Oromia Grains Union</p>
                </div>
                <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-400 text-black">High Protein</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- TRUST / VALUE SECTION -->
    <section class="py-16 bg-white border-b border-[#E2E4E7]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span class="text-xs font-black text-[#1E9444] uppercase tracking-wider bg-[#EDFAF2] px-3.5 py-1 rounded-full border border-[#C3EFCF]">
            Built for Ethiopian Agriculture
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-[#1E2328] tracking-tight">
            Empowering Farmers. Streamlining Business Sourcing.
          </h2>
          <p class="text-xs sm:text-sm text-[#5A6270] leading-relaxed">
            Our platform connects smallholder farmers, primary cooperatives, and regional unions with commercial buyers through transparent digital trading.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <!-- Farmer Value Box -->
          <div class="bg-[#F8F9FA] border border-[#E2E4E7] rounded-3xl p-8 space-y-6 hover:border-[#1E9444] transition-all shadow-2xs relative overflow-hidden group">
            <div class="w-12 h-12 rounded-2xl bg-[#EDFAF2] text-[#1E9444] border border-[#C3EFCF] flex items-center justify-center font-bold text-xl shrink-0">
              <Tractor class="w-6 h-6 stroke-[2.2]" />
            </div>

            <div class="space-y-2">
              <h3 class="text-xl font-black text-[#1E2328]">For Farmers & Cooperatives</h3>
              <p class="text-xs text-[#5A6270] leading-relaxed">
                Expand market access beyond local middlemen. List verified produce directly to verified commercial buyers across Ethiopia with secure escrow protection.
              </p>
            </div>

            <ul class="space-y-3 text-xs text-[#1E2328] font-bold">
              <li class="flex items-center gap-2.5">
                <div class="w-5 h-5 rounded-full bg-[#1E9444] text-white flex items-center justify-center text-[10px]">✓</div>
                <span>Reach more business buyers nationwide</span>
              </li>
              <li class="flex items-center gap-2.5">
                <div class="w-5 h-5 rounded-full bg-[#1E9444] text-white flex items-center justify-center text-[10px]">✓</div>
                <span>Showcase agricultural crop grades & origin</span>
              </li>
              <li class="flex items-center gap-2.5">
                <div class="w-5 h-5 rounded-full bg-[#1E9444] text-white flex items-center justify-center text-[10px]">✓</div>
                <span>Direct payout disbursement to CBE & Telebirr</span>
              </li>
            </ul>

            <div class="pt-2">
              <router-link to="/register?role=farmer" class="inline-flex items-center gap-2 text-xs font-black text-[#1E9444] hover:text-[#0F5C2A]">
                <span>Register as Farmer / Co-op</span>
                <ArrowRight class="w-4 h-4" />
              </router-link>
            </div>
          </div>

          <!-- Buyer Value Box -->
          <div class="bg-[#F8F9FA] border border-[#E2E4E7] rounded-3xl p-8 space-y-6 hover:border-[#0B57D0] transition-all shadow-2xs relative overflow-hidden group">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B57D0] border border-blue-200 flex items-center justify-center font-bold text-xl shrink-0">
              <Building2 class="w-6 h-6 stroke-[2.2]" />
            </div>

            <div class="space-y-2">
              <h3 class="text-xl font-black text-[#1E2328]">For Commercial Buyers & Exporters</h3>
              <p class="text-xs text-[#5A6270] leading-relaxed">
                Source high-grade coffee, teff, sesame, and grains directly from primary origin. Benefit from transparent bulk pricing, sample inspection, and Chapa Escrow security.
              </p>
            </div>

            <ul class="space-y-3 text-xs text-[#1E2328] font-bold">
              <li class="flex items-center gap-2.5">
                <div class="w-5 h-5 rounded-full bg-[#0B57D0] text-white flex items-center justify-center text-[10px]">✓</div>
                <span>Discover verified Ethiopian produce listings</span>
              </li>
              <li class="flex items-center gap-2.5">
                <div class="w-5 h-5 rounded-full bg-[#0B57D0] text-white flex items-center justify-center text-[10px]">✓</div>
                <span>Transparent price per kg & minimum order quantities</span>
              </li>
              <li class="flex items-center gap-2.5">
                <div class="w-5 h-5 rounded-full bg-[#0B57D0] text-white flex items-center justify-center text-[10px]">✓</div>
                <span>Create a Buyer account to complete purchases</span>
              </li>
            </ul>

            <div class="pt-2">
              <router-link to="/register?role=buyer" class="inline-flex items-center gap-2 text-xs font-black text-[#0B57D0] hover:text-[#0842A0]">
                <span>Register as Commercial Buyer</span>
                <ArrowRight class="w-4 h-4" />
              </router-link>
            </div>
          </div>

        </div>
      </div>
    </section>



    <!-- HOW IT WORKS SECTION -->
    <section id="how-it-works" class="py-16 bg-white border-y border-[#E2E4E7]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div class="text-center max-w-2xl mx-auto space-y-2">
          <span class="text-xs font-black text-[#1E9444] uppercase tracking-wider">Simple Process</span>
          <h2 class="text-2xl sm:text-3xl font-black text-[#1E2328] tracking-tight">How the Marketplace Works</h2>
          <p class="text-xs sm:text-sm text-[#5A6270]">Three simple steps to source produce or sell your harvest directly</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <!-- Step 1 -->
          <div class="bg-[#F8F9FA] border border-[#E2E4E7] rounded-3xl p-6 text-center space-y-4 relative">
            <div class="w-12 h-12 rounded-2xl bg-[#062E15] text-[#E69500] font-black text-xl flex items-center justify-center mx-auto shadow-xs">
              1
            </div>
            <h3 class="text-lg font-black text-[#1E2328]">Discover</h3>
            <p class="text-xs text-[#5A6270] leading-relaxed">
              Browse verified agricultural produce from farmers and cooperatives across regional Ethiopia.
            </p>
          </div>

          <!-- Step 2 -->
          <div class="bg-[#F8F9FA] border border-[#E2E4E7] rounded-3xl p-6 text-center space-y-4 relative">
            <div class="w-12 h-12 rounded-2xl bg-[#062E15] text-[#E69500] font-black text-xl flex items-center justify-center mx-auto shadow-xs">
              2
            </div>
            <h3 class="text-lg font-black text-[#1E2328]">Connect</h3>
            <p class="text-xs text-[#5A6270] leading-relaxed">
              Explore detailed crop information, quality grades, regional origins, and clear pricing per kg.
            </p>
          </div>

          <!-- Step 3 -->
          <div class="bg-[#F8F9FA] border border-[#E2E4E7] rounded-3xl p-6 text-center space-y-4 relative">
            <div class="w-12 h-12 rounded-2xl bg-[#062E15] text-[#E69500] font-black text-xl flex items-center justify-center mx-auto shadow-xs">
              3
            </div>
            <h3 class="text-lg font-black text-[#1E2328]">Buy</h3>
            <p class="text-xs text-[#5A6270] leading-relaxed">
              Register as a Buyer and complete purchases securely with Chapa Escrow payment protection.
            </p>
          </div>

        </div>

      </div>
    </section>

    <!-- FINAL CALL TO ACTION SECTION -->
    <section class="py-20 bg-gradient-to-r from-[#062E15] via-[#0F5C2A] to-[#062E15] text-white relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-80 h-80 bg-[#E69500]/20 rounded-full blur-3xl pointer-events-none" />
      
      <div class="max-w-4xl mx-auto text-center px-4 sm:px-6 relative z-10 space-y-6">
        <h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Ready to source agricultural products?
        </h2>
        <p class="text-sm text-[#C3EFCF] max-w-xl mx-auto leading-relaxed">
          Explore the marketplace and discover products from Ethiopian farmers and suppliers. Create your Buyer account to start placing orders directly.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <router-link 
            to="/marketplace" 
            class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#E69500] hover:bg-[#D48900] text-black font-black text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <Store class="w-4 h-4 stroke-[2.5]" />
            <span>Explore Marketplace</span>
          </router-link>

          <router-link 
            to="/register?role=buyer" 
            class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus class="w-4 h-4 text-[#C3EFCF]" />
            <span>Register as Buyer</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer id="about" class="bg-[#041D0D] text-white border-t border-emerald-900/40 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <!-- Col 1: Platform Info -->
          <div class="space-y-3 md:col-span-2">
            <QelemMedaLogo :size="36" variant="full" />
            <p class="text-xs text-[#C3EFCF] leading-relaxed max-w-md pt-2">
              QMT AgriGate is Ethiopia's premier B2B agricultural marketplace connecting smallholder farmers, primary unions, and commercial buyers through transparent digital trade and escrow technology.
            </p>
          </div>

          <!-- Col 2: Quick Links -->
          <div class="space-y-2 text-xs">
            <h4 class="font-extrabold text-[#E69500] uppercase tracking-wider">Quick Navigation</h4>
            <ul class="space-y-2 text-[#C3EFCF]">
              <li><router-link to="/marketplace" class="hover:text-white transition-colors">Agricultural Marketplace</router-link></li>
              <li><router-link to="/login" class="hover:text-white transition-colors">Account Login</router-link></li>
              <li><router-link to="/register?role=buyer" class="hover:text-white transition-colors">Register as Buyer</router-link></li>
              <li><router-link to="/register?role=farmer" class="hover:text-white transition-colors">Register as Farmer</router-link></li>
            </ul>
          </div>

          <!-- Col 3: Contact & Location -->
          <div class="space-y-2 text-xs">
            <h4 class="font-extrabold text-[#E69500] uppercase tracking-wider">Contact & Support</h4>
            <p class="text-[#C3EFCF]">Addis Ababa, Ethiopia</p>
            <p class="text-[#C3EFCF] font-mono">+251 911 234 567</p>
            <p class="text-[#C3EFCF]">support@qelemeda.et</p>
          </div>

        </div>

        <div class="border-t border-emerald-900/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#C3EFCF]">
          <p>© 2026 Qelem Meda Technologies (QMT). All rights reserved.</p>
          <p class="flex items-center gap-1 font-semibold">
            <ShieldCheck class="w-3.5 h-3.5 text-[#E69500]" />
            <span>Escrow Protected & Verified Marketplace</span>
          </p>
        </div>

      </div>
    </footer>

    <!-- BUYING RESTRICTION MODAL -->
    <BuyerAuthModal :isOpen="showAuthModal" @close="showAuthModal = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Store, User, LogIn, Sparkles, CheckCircle2, Tractor, 
  Building2, ArrowRight, UserPlus, ShieldCheck 
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import QelemMedaLogo from '@/components/common/QelemMedaLogo.vue'
import BuyerAuthModal from '@/components/shared/BuyerAuthModal.vue'

const router = useRouter()
const { isAuthenticated, user } = useAuth()

const showAuthModal = ref(false)

function goToDashboard() {
  if (user.value?.role === 'farmer') router.push('/farmer')
  else if (user.value?.role === 'admin') router.push('/admin')
  else router.push('/buyer')
}
</script>
