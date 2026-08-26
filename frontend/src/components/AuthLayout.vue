<script setup>
import { RouterLink } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'

defineProps({
  title:    { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="auth-layout">
    <!-- Left panel — executive brand panel -->
    <aside class="auth-layout__panel" aria-hidden="true">
      <div class="auth-layout__panel-inner">
        <RouterLink to="/" class="auth-layout__brand">
          <span class="auth-layout__logo">🌿</span>
          <span class="auth-layout__name">Agri<strong>Market</strong></span>
        </RouterLink>

        <div class="auth-layout__tagline">
          Ethiopia's Premier B2B<br/>Agricultural Trade Portal
        </div>

        <div class="auth-layout__cards">
          <div class="auth-card">
            <span>🌾</span>
            <div>
              <div class="auth-card__label">Direct Wholesale Produce</div>
              <div class="auth-card__price">Grade-A Teff & Wheat</div>
            </div>
          </div>
          <div class="auth-card auth-card--offset">
            <span>☕</span>
            <div>
              <div class="auth-card__label">Verified Origin</div>
              <div class="auth-card__price">Export-Grade Sidama Coffee</div>
            </div>
          </div>
          <div class="auth-card">
            <span>🔬</span>
            <div>
              <div class="auth-card__label">Inspected Quality</div>
              <div class="auth-card__price">Guaranteed Batch Freshness</div>
            </div>
          </div>
        </div>

        <div class="auth-layout__stats">
          <div class="auth-layout__stat">
            <strong>2,400+</strong>
            <span>Verified Farmers</span>
          </div>
          <div class="auth-layout__divider"></div>
          <div class="auth-layout__stat">
            <strong>890+</strong>
            <span>Wholesale Buyers</span>
          </div>
          <div class="auth-layout__divider"></div>
          <div class="auth-layout__stat">
            <strong>9</strong>
            <span>Trade Hubs</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Right panel — form -->
    <main class="auth-layout__form">
      <div class="auth-layout__form-inner">
        <div class="auth-top-bar">
          <RouterLink to="/" class="auth-layout__back">
            ← Back to Home
          </RouterLink>
          <ThemeToggle />
        </div>

        <div class="auth-layout__header">
          <h1 class="auth-layout__title">{{ title }}</h1>
          <p v-if="subtitle" class="auth-layout__subtitle">{{ subtitle }}</p>
        </div>
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
}
@media (max-width: 768px) {
  .auth-layout { grid-template-columns: 1fr; }
  .auth-layout__panel { display: none; }
}

/* Left panel */
.auth-layout__panel {
  background: linear-gradient(160deg, #0d3d20 0%, #1a6b3c 60%, #1f7d46 100%);
  display: flex; align-items: center; justify-content: center;
  padding: 3rem 2.5rem;
  position: sticky; top: 0; height: 100vh;
}
.auth-layout__panel-inner { width: 100%; max-width: 360px; }
.auth-layout__brand {
  display: flex; align-items: center; gap: .6rem;
  font-size: 1.5rem; color: #fff; margin-bottom: 2.5rem; text-decoration: none;
}
.auth-layout__logo { font-size: 2rem; }
.auth-layout__name strong { color: var(--brand-gold); }
.auth-layout__tagline {
  color: rgba(255,255,255,.75); font-size: 1.1rem; line-height: 1.5;
  margin-bottom: 2.5rem;
}
.auth-layout__cards { display: flex; flex-direction: column; gap: .85rem; margin-bottom: 2.5rem; }
.auth-card {
  display: flex; align-items: center; gap: 1rem;
  background: rgba(255,255,255,.1); backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,.15); border-radius: 12px;
  padding: .9rem 1.1rem; font-size: 1.5rem;
  transition: transform .2s;
}
.auth-card:hover { transform: translateX(6px); }
.auth-card--offset { margin-left: 1.5rem; }
.auth-card__label { color: rgba(255,255,255,.7); font-size: .78rem; }
.auth-card__price { color: #fff; font-weight: 700; }

.auth-layout__stats {
  display: flex; align-items: center; gap: 1.25rem;
}
.auth-layout__stat { display: flex; flex-direction: column; color: rgba(255,255,255,.8); }
.auth-layout__stat strong { font-size: 1.3rem; color: #fff; font-weight: 800; }
.auth-layout__stat span  { font-size: .78rem; }
.auth-layout__divider    { width: 1px; height: 36px; background: rgba(255,255,255,.25); }

/* Right / form panel */
.auth-layout__form {
  display: flex; align-items: flex-start; justify-content: center;
  padding: 3rem 1.5rem; background: var(--surface);
  overflow-y: auto;
}
.auth-layout__form-inner { width: 100%; max-width: 440px; }
.auth-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}
.auth-layout__back {
  display: inline-block; color: var(--text-muted); font-size: .85rem;
  transition: color .2s; text-decoration: none; font-weight: 600;
}
.auth-layout__back:hover { color: var(--brand-green); }
.auth-layout__header { margin-bottom: 2rem; }
.auth-layout__title  { font-size: 1.8rem; color: var(--text-primary); margin-bottom: .4rem; font-weight: 800; }
.auth-layout__subtitle { color: var(--text-secondary); font-size: .95rem; }
</style>
