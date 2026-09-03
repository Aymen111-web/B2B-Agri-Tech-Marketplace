<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  title:    { type: String, default: '' },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="auth-page">
    <!-- Ambient Background Glows -->
    <div class="auth-bg-blob auth-bg-blob--1" aria-hidden="true"></div>
    <div class="auth-bg-blob auth-bg-blob--2" aria-hidden="true"></div>

    <div class="auth-container">
      <!-- Header / Brand -->
      <header class="auth-brand">
        <RouterLink to="/" class="auth-brand__logo-link">
          <img src="/images/agri_placeholder.svg" class="auth-brand-img" alt="AgriMarket" />
          <span class="auth-brand__text">Agri<strong>Market</strong></span>
        </RouterLink>
        <p class="auth-brand__subtitle">Ethiopia's B2B Agricultural Marketplace</p>
      </header>

      <!-- Main Card -->
      <main class="auth-card">
        <!-- Section Title & Subtitle -->
        <div v-if="title" class="auth-card__header">
          <h1 class="auth-card__title">{{ title }}</h1>
          <p v-if="subtitle" class="auth-card__subtitle">{{ subtitle }}</p>
        </div>

        <!-- Form Slot -->
        <div class="auth-card__body">
          <slot />
        </div>
      </main>

      <!-- Back to Home Footer Link -->
      <footer class="auth-footer">
        <RouterLink to="/" class="auth-footer__back" id="auth-back-home">
          ← Back to Marketplace Home
        </RouterLink>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background-color: var(--background, #f8faf9);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

/* Background Ambient Glows */
.auth-bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.25;
  pointer-events: none;
  z-index: 0;
}
.auth-bg-blob--1 {
  width: 450px;
  height: 450px;
  background: #1a6b3c;
  top: -100px;
  left: -100px;
}
.auth-bg-blob--2 {
  width: 400px;
  height: 400px;
  background: #d97706;
  bottom: -80px;
  right: -80px;
}

.auth-container {
  width: 100%;
  max-width: 440px;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Header / Brand */
.auth-brand {
  text-align: center;
}
.auth-brand__logo-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-primary, #1e293b);
  text-decoration: none;
  transition: transform 0.2s ease;
}
.auth-brand__logo-link:hover {
  transform: translateY(-1px);
}
.auth-brand__icon {
  font-size: 1.8rem;
}
.auth-brand-img { width: 32px; height: 32px; border-radius: 6px; object-fit: cover; }
.auth-brand__text strong {
  color: var(--brand-green, #1a6b3c);
}
.auth-brand__subtitle {
  margin-top: 0.25rem;
  font-size: 0.88rem;
  color: var(--text-muted, #64748b);
}

/* Card */
.auth-card {
  background: var(--surface, #ffffff);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03);
  padding: 2rem 1.75rem;
  transition: box-shadow 0.2s ease;
}

/* Header inside card */
.auth-card__header {
  margin-bottom: 1.5rem;
  text-align: center;
}
.auth-card__title {
  font-size: 1.45rem;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
  margin-bottom: 0.25rem;
}
.auth-card__subtitle {
  font-size: 0.88rem;
  color: var(--text-muted, #64748b);
}

/* Footer link */
.auth-footer {
  text-align: center;
}
.auth-footer__back {
  font-size: 0.85rem;
  color: var(--text-muted, #64748b);
  text-decoration: none;
  transition: color 0.2s ease;
}
.auth-footer__back:hover {
  color: var(--brand-green, #1a6b3c);
}
</style>
