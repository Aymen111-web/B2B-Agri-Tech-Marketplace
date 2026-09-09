<template>
  <router-view />
  <LogoutModal />
  <NoticeModal />
</template>

<script setup>
import LogoutModal from '@/components/common/LogoutModal.vue'
import NoticeModal from '@/components/common/NoticeModal.vue'
</script>
