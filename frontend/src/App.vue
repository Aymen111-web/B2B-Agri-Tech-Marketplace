<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import AppTopHeader from '@/components/AppTopHeader.vue'
import { useThemeStore } from '@/stores/theme'

const route = useRoute()
const themeStore = useThemeStore()
const sidebarOpen = ref(true)

onMounted(() => {
  themeStore.initTheme()
})

const showSidebar = computed(() => {
  return !route.meta?.hideSidebar
})

function handleToggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}
</script>

<template>
  <div class="app-layout" :class="{ 'has-sidebar': showSidebar && sidebarOpen }">
    <AppTopHeader
      v-if="showSidebar"
      :sidebarOpen="sidebarOpen"
      @toggle-sidebar="handleToggleSidebar"
    />

    <div class="app-body">
      <AppSidebar v-if="showSidebar" :isOpen="sidebarOpen" />

      <main class="app-content">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: var(--surface);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  transition: background 0.3s, color 0.3s;
}

.app-body {
  display: flex;
  flex: 1;
  position: relative;
}

.app-content {
  flex: 1;
  min-height: calc(100vh - 60px);
  transition: margin-left 0.25s ease;
  margin-left: 0;
}

.app-layout.has-sidebar .app-content {
  margin-left: 250px;
}

@media (max-width: 768px) {
  .app-layout.has-sidebar .app-content {
    margin-left: 0;
  }
}
</style>

