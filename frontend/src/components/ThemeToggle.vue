<script setup>
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>

<template>
  <button
    type="button"
    class="theme-btn"
    @click="themeStore.toggleTheme()"
    :title="themeStore.currentTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'"
  >
    <span v-if="themeStore.currentTheme === 'light'" class="theme-label">
      <span class="theme-icon">☀️</span> Light
    </span>
    <span v-else class="theme-label">
      <span class="theme-icon">🌙</span> Dark
    </span>
  </button>
</template>

<style scoped>
.theme-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-xs);
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  font-size: 0.78125rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
}

.theme-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
}

.theme-label {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.theme-icon {
  font-size: 0.85rem;
  line-height: 1;
}

/* Light Theme in Sidebar */
:global([data-theme='light']) .sidebar .theme-btn {
  background: var(--surface-alt);
  color: var(--text-primary);
  border: 1px solid var(--border);
}
:global([data-theme='light']) .sidebar .theme-btn:hover {
  background: var(--border-subtle);
  border-color: var(--brand-green);
}
</style>
