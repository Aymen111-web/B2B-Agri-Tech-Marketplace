<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div style="min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2rem; text-align:center;">
    <div style="font-size:3rem; margin-bottom:1rem;">🌿</div>
    <h1 style="font-size:1.5rem; color:var(--text-primary); margin-bottom:.5rem;">Page not found</h1>
    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">This page doesn't exist.</p>
    <RouterLink to="/" style="color:var(--brand-green); font-weight:600;">← Back to Home</RouterLink>
  </div>
</template>
