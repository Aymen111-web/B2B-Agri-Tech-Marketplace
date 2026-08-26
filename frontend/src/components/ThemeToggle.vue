<script setup>
import { useThemeStore } from '@/stores/theme'

defineProps({
  compact: { type: Boolean, default: false }
})

const themeStore = useThemeStore()
</script>

<template>
  <div class="theme-switcher" :class="{ 'theme-switcher--compact': compact }">
    <button
      type="button"
      class="switch-btn"
      :class="{ active: themeStore.currentTheme === 'light' }"
      @click="themeStore.applyTheme('light')"
      title="Switch to Light Mode"
      aria-label="Light Mode"
    >
      <span class="switch-icon">☀️</span>
      <span v-if="!compact" class="switch-label">Light</span>
    </button>
    <button
      type="button"
      class="switch-btn"
      :class="{ active: themeStore.currentTheme === 'dark' }"
      @click="themeStore.applyTheme('dark')"
      title="Switch to Dark / Night Mode"
      aria-label="Dark Mode"
    >
      <span class="switch-icon">🌙</span>
      <span v-if="!compact" class="switch-label">Night</span>
    </button>
  </div>
</template>

<style scoped>
.theme-switcher {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: rgba(0, 0, 0, 0.25);
  padding: 3px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  user-select: none;
}

.switch-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-full);
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.switch-btn:hover {
  color: #ffffff;
}

.switch-btn.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

.switch-icon {
  font-size: 0.85rem;
  line-height: 1;
}

.switch-label {
  font-size: 0.72rem;
  letter-spacing: 0.02em;
}

/* Compact mode */
.theme-switcher--compact .switch-btn {
  padding: 0.25rem 0.45rem;
}

/* Light background override (e.g. inside light sidebar) */
:global([data-theme='light']) .sidebar .theme-switcher {
  background: var(--surface-alt);
  border-color: var(--border);
}
:global([data-theme='light']) .sidebar .switch-btn {
  color: var(--text-secondary);
}
:global([data-theme='light']) .sidebar .switch-btn.active {
  background: var(--brand-green);
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
}
</style>
