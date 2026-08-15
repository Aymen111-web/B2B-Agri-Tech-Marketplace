import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // Initialize theme from localStorage or default to 'light'
  const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('app-theme') : null
  const currentTheme = ref(savedTheme || 'light')

  /**
   * Apply current theme attribute to <html> tag and persist in localStorage.
   */
  function applyTheme(themeName) {
    currentTheme.value = themeName
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-theme', themeName)
      document.documentElement.setAttribute('data-theme', themeName)
    }
  }

  /**
   * Toggle between 'light' and 'dark' (night) modes.
   */
  function toggleTheme() {
    const nextTheme = currentTheme.value === 'light' ? 'dark' : 'light'
    applyTheme(nextTheme)
  }

  /**
   * Initialize theme on application launch.
   */
  function initTheme() {
    applyTheme(currentTheme.value)
  }

  return {
    currentTheme,
    toggleTheme,
    applyTheme,
    initTheme,
  }
})
