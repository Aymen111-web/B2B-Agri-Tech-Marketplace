<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  sidebarOpen: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['toggle-sidebar'])

const router = useRouter()
const authStore = useAuthStore()
const searchQuery = ref('')
const isFullscreen = ref(false)

function toggleSidebar() {
  emit('toggle-sidebar')
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      isFullscreen.value = false
    }
  }
}
</script>

<template>
  <header class="app-top-header">
    <div class="header-left">
      <button
        class="icon-btn sidebar-toggle-btn"
        @click="toggleSidebar"
        title="Toggle Sidebar"
        aria-label="Toggle Sidebar"
      >
        <span class="hamburger-icon">☰</span>
      </button>

      <router-link to="/dashboard" class="header-brand">
        <span class="brand-title">Admin Panel</span>
        <span class="brand-sub">Qelem Meda Technologies</span>
      </router-link>
    </div>

    <!-- Search Bar (Centered) -->
    <div class="header-search-wrap">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Searching..."
          class="search-input"
        />
      </div>
    </div>

    <!-- Header Actions (Right) -->
    <div class="header-right">
      <button class="icon-btn" @click="toggleFullscreen" title="Full Screen">
        <span>⛶</span>
      </button>

      <button class="icon-btn" title="Language">
        <span>🌐</span>
      </button>

      <button class="icon-btn" title="Settings">
        <span>⚙️</span>
      </button>

      <div class="notification-badge-wrap" title="Notifications">
        <button class="icon-btn">
          <span>🔔</span>
        </button>
        <span class="badge-count">3</span>
      </div>

      <!-- User Profile Header Pill -->
      <div class="user-header-pill" v-if="authStore.isAuthenticated">
        <div class="user-avatar-head">
          {{ authStore.user?.first_name?.[0] || '👤' }}
        </div>
        <div class="user-meta">
          <span class="user-name">
            {{ authStore.user?.first_name || 'Super' }} {{ authStore.user?.second_name || 'Admin' }}
          </span>
          <span class="user-role-label">
            {{ authStore.isAdmin ? 'Super Admin' : (authStore.user?.capabilities?.[0]?.capability_type || 'User') }}
          </span>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-top-header {
  height: 60px;
  background: var(--topbar-bg);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
  box-shadow: 0 2px 8px rgba(11, 79, 156, 0.25);
  position: sticky;
  top: 0;
  z-index: 300;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sidebar-toggle-btn {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
}
.sidebar-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.hamburger-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.header-brand {
  display: flex;
  flex-direction: column;
  color: #ffffff;
  text-decoration: none;
}
.brand-title {
  font-size: 1.15rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.01em;
}
.brand-sub {
  font-size: 0.68rem;
  opacity: 0.8;
  font-weight: 500;
}

/* Centered Search Pill */
.header-search-wrap {
  flex: 1;
  max-width: 380px;
  margin: 0 1.5rem;
}

.search-box {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-pill);
  display: flex;
  align-items: center;
  padding: 0.35rem 0.85rem;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
}

.search-icon {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-right: 0.5rem;
}

.search-input {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 0.85rem;
  width: 100%;
  outline: none;
  font-weight: 500;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

/* Header Right Actions */
.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon-btn {
  background: transparent;
  border: none;
  color: #ffffff;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.18);
}

.notification-badge-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.badge-count {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #f59e0b;
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 900;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.user-header-pill {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-left: 0.5rem;
  padding: 0.25rem 0.6rem 0.25rem 0.25rem;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.user-avatar-head {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ffffff;
  color: var(--brand-blue);
  font-weight: 800;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.user-name {
  font-size: 0.825rem;
  font-weight: 800;
  color: #ffffff;
}

.user-role-label {
  font-size: 0.68rem;
  opacity: 0.8;
  font-weight: 500;
}
</style>
