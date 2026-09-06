<template>
  <ResponsiveLayout :navItems="navItems" theme="light" />
</template>

<script setup>
import { Home, Store, ShoppingCart, User } from 'lucide-vue-next'
import ResponsiveLayout from './ResponsiveLayout.vue'

const navItems = [
  { path: '/buyer', label: 'Dashboard', icon: Home },
  { path: '/buyer/marketplace', label: 'Marketplace', icon: Store },
  { path: '/buyer/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/buyer/profile', label: 'Profile', icon: User },
]
</script>
