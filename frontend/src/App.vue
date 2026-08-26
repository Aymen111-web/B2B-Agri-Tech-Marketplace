<script setup>
import { onMounted, computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import { useThemeStore } from '@/stores/theme'

const route = useRoute()
const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initTheme()
})

const showSidebar = computed(() => {
  return !route.meta?.hideSidebar
})
</script>

<template>
  <div class="app-layout" :class="{ 'has-sidebar': showSidebar }">
    <AppSidebar v-if="showSidebar" />

    <main class="app-content">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: var(--surface);
  color: var(--text-primary);
  transition: background 0.3s color 0.3s;
}

.app-layout.has-sidebar .app-content {
  margin-left: 260px;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .app-layout.has-sidebar .app-content {
    margin-left: 0;
  }
}
</style>
