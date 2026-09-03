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
      <span class="theme-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
      </span> Light
    </span>
    <span v-else class="theme-label">
      <span class="theme-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
      </span> Dark
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
