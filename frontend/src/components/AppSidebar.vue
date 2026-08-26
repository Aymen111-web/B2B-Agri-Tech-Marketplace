<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useThemeStore } from '@/stores/theme'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()
const themeStore = useThemeStore()

const activeCapabilities = computed(() => {
  const caps = authStore.user?.capabilities || []
  return caps.filter(c => c.status === 'active').map(c => c.capability_type)
})

const isFarmer = computed(() => activeCapabilities.value.includes('farmer'))

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': !isOpen }">
    <!-- Navigation Links -->
    <nav class="sidebar__nav">
      <div class="nav-section-title">MAIN MENU</div>

      <router-link
        to="/dashboard"
        class="nav-item"
        :class="{ active: route.path === '/dashboard' }"
      >
        <span class="nav-icon">🏠</span>
        <span class="nav-label">Dashboard</span>
      </router-link>

      <router-link
        to="/listings"
        class="nav-item"
        :class="{ active: route.path.startsWith('/listings') }"
      >
        <span class="nav-icon">🌾</span>
        <span class="nav-label">Browse Marketplace</span>
      </router-link>

      <router-link
        to="/cart"
        class="nav-item"
        :class="{ active: route.path === '/cart' }"
      >
        <span class="nav-icon">🛒</span>
        <span class="nav-label">Shopping Cart</span>
        <span v-if="cartStore.itemCount > 0" class="cart-badge">
          {{ cartStore.itemCount }}
        </span>
      </router-link>

      <router-link
        v-if="authStore.isAuthenticated"
        to="/orders"
        class="nav-item"
        :class="{ active: route.path.startsWith('/orders') }"
      >
        <span class="nav-icon">📋</span>
        <span class="nav-label">My Orders</span>
      </router-link>

      <!-- Role-Based Portals -->
      <div v-if="isFarmer || authStore.isAdmin" class="nav-section-title mt-4">PORTALS</div>

      <template v-if="isFarmer">
        <router-link
          to="/farmer/listings"
          class="nav-item"
          :class="{ active: route.path === '/farmer/listings' }"
        >
          <span class="nav-icon">🌾</span>
          <span class="nav-label">My Crop Listings</span>
        </router-link>

        <router-link
          to="/farmer/fulfillments"
          class="nav-item"
          :class="{ active: route.path === '/farmer/fulfillments' }"
        >
          <span class="nav-icon">🚜</span>
          <span class="nav-label">Fulfillment Orders</span>
        </router-link>
      </template>

      <router-link
        v-if="authStore.isAdmin"
        to="/admin/capability-applications"
        class="nav-item"
        :class="{ active: route.path.startsWith('/admin') }"
      >
        <span class="nav-icon">🛡️</span>
        <span class="nav-label">Admin Governance</span>
      </router-link>

      <div class="nav-section-title mt-4">ACCOUNT & SETTINGS</div>

      <router-link
        to="/capabilities/apply"
        class="nav-item"
        :class="{ active: route.path === '/capabilities/apply' }"
      >
        <span class="nav-icon">📜</span>
        <span class="nav-label">Capabilities</span>
      </router-link>
    </nav>

    <!-- Bottom Actions: Theme Switcher & Logout -->
    <div class="sidebar__footer">
      <div class="theme-box">
        <span class="theme-label">Theme Mode:</span>
        <button
          @click="themeStore.toggleTheme()"
          class="theme-toggle-btn"
          id="theme-toggle-btn"
        >
          <span v-if="themeStore.currentTheme === 'light'" class="theme-icon">☀️ Light</span>
          <span v-else class="theme-icon">🌙 Night</span>
        </button>
      </div>

      <button
        v-if="authStore.isAuthenticated"
        @click="handleLogout"
        class="logout-btn"
      >
        <span class="btn-icon">🚪</span> Sign Out
      </button>
      <router-link
        v-else
        to="/login"
        class="login-btn"
      >
        🔐 Sign In
      </router-link>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 250px;
  height: calc(100vh - 60px);
  position: fixed;
  top: 60px;
  left: 0;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  z-index: 200;
  transition: transform 0.25s ease, width 0.25s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.02);
}

.sidebar--collapsed {
  transform: translateX(-100%);
}

/* Nav Links */
.sidebar__nav {
  flex: 1;
  padding: 1.25rem 0.85rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-section-title {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  padding: 0.6rem 0.75rem 0.25rem;
  text-transform: uppercase;
}
.mt-4 { margin-top: 1rem; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-sm);
  color: var(--sidebar-text);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: var(--sidebar-item-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--brand-blue-light);
  color: var(--sidebar-text-active);
  font-weight: 700;
  border-left-color: var(--brand-blue);
}

.nav-icon { font-size: 1.1rem; }
.nav-label { flex: 1; }

.cart-badge {
  background: var(--brand-blue);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
}

/* Footer / Theme Switcher */
.sidebar__footer {
  padding: 1rem;
  border-top: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--surface-alt);
}

.theme-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface-card);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--sidebar-border);
}

.theme-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.theme-toggle-btn {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  color: var(--text-primary);
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-toggle-btn:hover {
  border-color: var(--brand-blue);
  color: var(--brand-blue);
}

.logout-btn, .login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.6rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
}

.logout-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--error);
}

.logout-btn:hover {
  background: var(--error-bg);
}

.login-btn {
  background: var(--brand-blue);
  color: #fff;
  border: none;
}

.login-btn:hover {
  background: var(--brand-blue-dark);
}
</style>

