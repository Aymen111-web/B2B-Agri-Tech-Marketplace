<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useThemeStore } from '@/stores/theme'
import ThemeToggle from '@/components/ThemeToggle.vue'

import { getAvatarImage } from '@/utils/imageHelper'

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
const isBuyer = computed(() => activeCapabilities.value.includes('buyer'))

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
        <img src="/images/agri_placeholder.svg" class="sidebar-brand-img" alt="AgriMarket Logo" />
        <span class="brand-text">Agri<strong>Market</strong></span>
      </router-link>
    </div>

    <!-- User Profile Badge (If Logged In) -->
    <router-link v-if="authStore.isAuthenticated" to="/profile" class="sidebar__user">
      <div class="user-avatar">
        <img v-if="authStore.user?.profile_photo_url" :src="authStore.user.profile_photo_url" alt="Avatar" class="avatar-img-sm" />
        <span v-else>{{ authStore.user?.first_name?.[0] || '👤' }}</span>
      </div>
      <div class="user-info">
        <div class="user-name">
          {{ authStore.user?.first_name }} {{ authStore.user?.second_name }}
        </div>
        <div class="user-role">
          <span v-if="authStore.isAdmin" class="role-badge role-badge--admin">Admin</span>
          <template v-else>
            <span v-if="isFarmer" class="role-badge role-badge--farmer">Farmer</span>
            <span v-if="isBuyer" class="role-badge role-badge--buyer">Buyer</span>
          </template>
        </div>
      </div>
    </router-link>

    <!-- Main Navigation Links -->
    <nav class="sidebar__nav">
      <div class="nav-section-title">MAIN MENU</div>

      <router-link
        to="/dashboard"
        class="nav-item"
        :class="{ active: route.path === '/dashboard' }"
      >
        <svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span class="nav-label">Dashboard</span>
      </router-link>

      <router-link
        to="/listings"
        class="nav-item"
        :class="{ active: route.path.startsWith('/listings') }"
      >
        <svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>
        <span class="nav-label">Marketplace</span>
      </router-link>

      <router-link
        v-if="isBuyer && !authStore.isAdmin"
        to="/cart"
        class="nav-item"
        :class="{ active: route.path === '/cart' }"
      >
        <svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
        <span class="nav-label">Cart</span>
        <span v-if="cartStore.itemCount > 0" class="cart-badge">
          {{ cartStore.itemCount }}
        </span>
      </router-link>

      <router-link
        v-if="isBuyer && !authStore.isAdmin"
        to="/orders"
        class="nav-item"
        :class="{ active: route.path.startsWith('/orders') }"
      >
        <svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        <span class="nav-label">My Orders</span>
      </router-link>

      <!-- Role-Based Portals -->
      <div v-if="(isFarmer && !authStore.isAdmin) || authStore.isAdmin" class="nav-section-title mt-4">PORTALS</div>

      <template v-if="isFarmer && !authStore.isAdmin">
        <router-link
          to="/farmer/listings"
          class="nav-item"
          :class="{ active: route.path === '/farmer/listings' }"
        >
          <svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <span class="nav-label">Crop Listings</span>
        </router-link>

        <router-link
          to="/farmer/fulfillments"
          class="nav-item"
          :class="{ active: route.path === '/farmer/fulfillments' }"
        >
          <svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          <span class="nav-label">Fulfillments</span>
        </router-link>
      </template>

      <template v-if="authStore.isAdmin">
        <router-link
          to="/admin/capability-applications"
          class="nav-item"
          :class="{ active: route.path === '/admin/capability-applications' }"
        >
          <span class="nav-icon">🛡️</span>
          <span class="nav-label">Capability Approvals</span>
        </router-link>

        <router-link
          to="/admin/users"
          class="nav-item"
          :class="{ active: route.path === '/admin/users' }"
        >
          <span class="nav-icon">👥</span>
          <span class="nav-label">User Accounts & Subscriptions</span>
        </router-link>
      </template>

      <div class="nav-section-title mt-4">ACCOUNT</div>

      <router-link
        v-if="authStore.isAuthenticated"
        to="/profile"
        class="nav-item"
        :class="{ active: route.path === '/profile' }"
      >
        <span class="nav-icon">👤</span>
        <span class="nav-label">My Profile & Settings</span>
      </router-link>

      <router-link
        v-if="!authStore.isAdmin"
        to="/capabilities/apply"
        class="nav-item"
        :class="{ active: route.path === '/capabilities/apply' }"
      >
        <svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
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
        <svg class="btn-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Sign Out
      </button>
      <router-link
        v-else
        to="/login"
        class="login-btn"
      >
        Sign In
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
.sidebar-brand-img { width: 26px; height: 26px; border-radius: 6px; object-fit: cover; }
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
.user-avatar-wrap {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid var(--brand-green-border);
  flex-shrink: 0;
}
.user-avatar-img { width: 100%; height: 100%; object-fit: cover; }
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
.role-badge--farmer { background: var(--brand-green-light); color: var(--brand-green-dark); margin-right: 0.25rem; }
.role-badge--buyer  { background: #fef3c7; color: #92400e; }
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
