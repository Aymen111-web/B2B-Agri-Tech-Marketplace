<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useThemeStore } from '@/stores/theme'
import ThemeToggle from '@/components/ThemeToggle.vue'

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
  <aside class="sidebar">
    <!-- Brand Logo -->
    <div class="sidebar__brand">
      <router-link to="/" class="brand-link">
        <span class="brand-icon">🌿</span>
        <span class="brand-text">Agri<strong>Market</strong></span>
      </router-link>
    </div>

    <!-- User Profile Badge (If Logged In) -->
    <div v-if="authStore.isAuthenticated" class="sidebar__user">
      <div class="user-avatar">
        {{ authStore.user?.first_name?.[0] || '👤' }}
      </div>
      <div class="user-info">
        <div class="user-name">
          {{ authStore.user?.first_name }} {{ authStore.user?.second_name }}
        </div>
        <div class="user-role">
          <span v-if="authStore.isAdmin" class="role-badge role-badge--admin">Admin</span>
          <span v-else-if="isFarmer" class="role-badge role-badge--farmer">Farmer</span>
          <span v-else class="role-badge">Buyer</span>
        </div>
      </div>
    </div>

    <!-- Main Navigation Links -->
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
        <span class="nav-label">Marketplace</span>
      </router-link>

      <router-link
        to="/cart"
        class="nav-item"
        :class="{ active: route.path === '/cart' }"
      >
        <span class="nav-icon">🛒</span>
        <span class="nav-label">Cart</span>
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
          <span class="nav-label">Crop Listings</span>
        </router-link>

        <router-link
          to="/farmer/fulfillments"
          class="nav-item"
          :class="{ active: route.path === '/farmer/fulfillments' }"
        >
          <span class="nav-icon">🚜</span>
          <span class="nav-label">Fulfillments</span>
        </router-link>
      </template>

      <router-link
        v-if="authStore.isAdmin"
        to="/admin/capability-applications"
        class="nav-item"
        :class="{ active: route.path.startsWith('/admin') }"
      >
        <span class="nav-icon">🛡️</span>
        <span class="nav-label">Approvals</span>
      </router-link>

      <div class="nav-section-title mt-4">ACCOUNT</div>

      <router-link
        to="/capabilities/apply"
        class="nav-item"
        :class="{ active: route.path === '/capabilities/apply' }"
      >
        <span class="nav-icon">📜</span>
        <span class="nav-label">Capabilities</span>
      </router-link>
    </nav>

    <!-- Bottom Actions: Logout -->
    <div class="sidebar__footer">
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
  width: 260px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  z-index: 200;
  transition: background 0.3s, border-color 0.3s;
}

.sidebar__brand {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid var(--sidebar-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}
.brand-icon { font-size: 1.4rem; }
.brand-text {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
}
.brand-text strong { color: var(--brand-green); }

/* User Card */
.sidebar__user {
  padding: 0.85rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background: var(--surface-alt);
  border-bottom: 1px solid var(--sidebar-border);
}
.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--brand-green);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}
.user-info { flex: 1; overflow: hidden; }
.user-name {
  font-size: 0.825rem;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-role { margin-top: 0.1rem; }
.role-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  background: var(--border);
  color: var(--text-secondary);
}
.role-badge--farmer { background: var(--brand-green-light); color: var(--brand-green-dark); }
.role-badge--admin  { background: var(--brand-gold-light); color: #92400e; }

/* Nav Links */
.sidebar__nav {
  flex: 1;
  padding: 1rem 0.85rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.nav-section-title {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  padding: 0.4rem 0.65rem 0.2rem;
}
.mt-4 { margin-top: 0.85rem; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.65rem;
  border-radius: var(--radius-xs);
  color: var(--sidebar-text);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.825rem;
  transition: all 0.15s ease;
}
.nav-item:hover {
  background: var(--sidebar-item-hover);
  color: var(--text-primary);
}
.nav-item.active {
  background: var(--brand-green-light);
  color: var(--sidebar-text-active);
  font-weight: 700;
}

.nav-icon { font-size: 1rem; }
.nav-label { flex: 1; }

.cart-badge {
  background: var(--brand-green);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.08rem 0.4rem;
  border-radius: var(--radius-full);
}

/* Footer / Logout */
.sidebar__footer {
  padding: 0.85rem 1rem;
  border-top: 1px solid var(--sidebar-border);
}

.logout-btn, .login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  border-radius: var(--radius-xs);
  font-size: 0.825rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease;
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
  background: var(--brand-green);
  color: #fff;
  border: none;
}
.login-btn:hover {
  background: var(--brand-green-dark);
}
</style>
