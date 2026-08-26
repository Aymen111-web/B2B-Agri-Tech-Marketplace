<script setup>
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const stats = [
  { value: '2,400+', label: 'Verified Farmers' },
  { value: '890+',   label: 'Business Buyers' },
  { value: '14,000+', label: 'Transactions' },
  { value: '9',      label: 'Regions Covered' },
]

const features = [
  {
    icon: '🌾',
    title: 'Direct Farm Access',
    desc: 'Connect directly with verified Ethiopian farmers. No middlemen — transparent pricing on every listing.',
  },
  {
    icon: '🛡️',
    title: 'Verified Participants',
    desc: 'Every farmer and business buyer goes through an admin approval process before trading.',
  },
  {
    icon: '💳',
    title: 'Secure Payments',
    desc: 'Pay safely via Chapa — Ethiopia\'s trusted payment gateway — with full exception management.',
  },
  {
    icon: '📦',
    title: 'Order Fulfillment',
    desc: 'Track every step: from order placement to farmer acceptance, delivery, and payout.',
  },
  {
    icon: '📊',
    title: 'Market Intelligence',
    desc: 'Access price histories, category trends, and listings data to make smarter buying decisions.',
  },
  {
    icon: '🤝',
    title: 'Dispute Resolution',
    desc: 'Built-in payment exception management and admin mediation when things go wrong.',
  },
]

const crops = [
  { name: 'Coffee', emoji: '☕', desc: 'Premium highland beans' },
  { name: 'Sesame', emoji: '🌻', desc: 'Oil crop exports' },
  { name: 'Wheat', emoji: '🌾', desc: 'Bread wheat varieties' },
  { name: 'Tomatoes', emoji: '🍅', desc: 'Fresh farm vegetables' },
  { name: 'Avocado', emoji: '🥑', desc: 'Highland organic fruits' },
  { name: 'Honey', emoji: '🍯', desc: 'Pure natural honey' },
]
</script>

<template>
  <div class="landing">

    <!-- ── Navbar ──────────────────────────────────────── -->
    <nav class="navbar">
      <div class="navbar__inner">
        <RouterLink to="/" class="navbar__brand">
          <span class="navbar__logo">🌿</span>
          <span class="navbar__name">Agri<strong>Market</strong></span>
        </RouterLink>

        <div class="navbar__actions">
          <RouterLink v-if="!auth.isAuthenticated" to="/login" class="btn btn--ghost">
            Sign In
          </RouterLink>
          <RouterLink v-if="!auth.isAuthenticated" to="/register" class="btn btn--primary">
            Get Started
          </RouterLink>
          <RouterLink v-else to="/dashboard" class="btn btn--primary">
            Go to Dashboard
          </RouterLink>
        </div>
      </div>
    </nav>

    <!-- ── Hero ───────────────────────────────────────── -->
    <section class="hero">
      <div class="hero__bg-pattern" aria-hidden="true"></div>
      <div class="hero__content">
        <div class="hero__badge">🇪🇹 Ethiopia's B2B Agricultural Marketplace</div>
        <h1 class="hero__title">
          Connect Farmers<br/>
          <span class="hero__title-accent">Directly to Business</span>
        </h1>
        <p class="hero__subtitle">
          The trusted platform linking verified Ethiopian farmers with business buyers.
          Transparent pricing, secure payments, and full order management — all in one place.
        </p>
        <div class="hero__cta">
          <RouterLink to="/register" class="btn btn--primary btn--lg" id="hero-cta-register">
            Start Trading Today
          </RouterLink>
          <RouterLink to="/login" class="btn btn--outline btn--lg" id="hero-cta-login">
            Sign In
          </RouterLink>
        </div>
      </div>
      <div class="hero__visual" aria-hidden="true">
        <div class="hero__card hero__card--1">
          <span class="hero__card-icon">🌾</span>
          <div>
            <div class="hero__card-label">Wheat — Grade A</div>
            <div class="hero__card-price">ETB 48/kg</div>
          </div>
          <div class="hero__card-badge">Active</div>
        </div>
        <div class="hero__card hero__card--2">
          <span class="hero__card-icon">☕</span>
          <div>
            <div class="hero__card-label">Sidama Coffee — Washed</div>
            <div class="hero__card-price">ETB 320/kg</div>
          </div>
          <div class="hero__card-badge">Active</div>
        </div>
        <div class="hero__card hero__card--3">
          <span class="hero__card-icon">🫘</span>
          <div>
            <div class="hero__card-label">White Sesame — Export</div>
            <div class="hero__card-price">ETB 95/kg</div>
          </div>
          <div class="hero__card-badge">Active</div>
        </div>
        </div>
    </section>

    <!-- ── Stats ──────────────────────────────────────── -->
    <section class="stats">
      <div class="stats__inner">
        <div v-for="stat in stats" :key="stat.label" class="stat">
          <div class="stat__value">{{ stat.value }}</div>
          <div class="stat__label">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- ── Features ───────────────────────────────────── -->
    <section class="features" id="features">
      <div class="section-container">
        <div class="section-header">
          <div class="section-badge">Why Agri Market</div>
          <h2 class="section-title">Built for Ethiopian Agriculture</h2>
          <p class="section-subtitle">
            Every feature is designed around the real needs of Ethiopian farmers and business buyers.
          </p>
        </div>
        <div class="features__grid">
          <div v-for="feature in features" :key="feature.title" class="feature-card">
            <div class="feature-card__icon">{{ feature.icon }}</div>
            <h3 class="feature-card__title">{{ feature.title }}</h3>
            <p class="feature-card__desc">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Crops ──────────────────────────────────────── -->
    <section class="crops" id="crops">
      <div class="section-container">
        <div class="section-header">
          <div class="section-badge">What's Trading</div>
          <h2 class="section-title">Popular Categories</h2>
          <p class="section-subtitle">
            From highland wheat to premium coffee — find the produce your business needs.
          </p>
        </div>
        <div class="crops__grid">
          <div v-for="crop in crops" :key="crop.name" class="crop-card">
            <div class="crop-card__emoji">{{ crop.emoji }}</div>
            <div class="crop-card__name">{{ crop.name }}</div>
            <div class="crop-card__desc">{{ crop.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── How it Works ───────────────────────────────── -->
    <section class="how" id="how">
      <div class="section-container">
        <div class="section-header">
          <div class="section-badge">How It Works</div>
          <h2 class="section-title">Simple. Transparent. Secure.</h2>
        </div>
        <div class="how__steps">
          <div class="how__step">
            <div class="how__step-num">01</div>
            <h3 class="how__step-title">Create your account</h3>
            <p class="how__step-desc">Register with your phone number and verify with a one-time code.</p>
          </div>
          <div class="how__connector" aria-hidden="true">→</div>
          <div class="how__step">
            <div class="how__step-num">02</div>
            <h3 class="how__step-title">Apply for a capability</h3>
            <p class="how__step-desc">Apply as a Farmer or Business Buyer and get reviewed by our admin team.</p>
          </div>
          <div class="how__connector" aria-hidden="true">→</div>
          <div class="how__step">
            <div class="how__step-num">03</div>
            <h3 class="how__step-title">Start trading</h3>
            <p class="how__step-desc">List your produce or fill your cart, then pay securely through Chapa.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── CTA Banner ─────────────────────────────────── -->
    <section class="cta-banner">
      <div class="cta-banner__inner">
        <h2 class="cta-banner__title">Ready to Join Ethiopia's Agri Network?</h2>
        <p class="cta-banner__sub">Registration is free. Start browsing listings immediately after signing up.</p>
        <div class="cta-banner__actions">
          <RouterLink to="/register" class="btn btn--white btn--lg" id="footer-cta-register">
            Create Free Account
          </RouterLink>
          <RouterLink to="/login" class="btn btn--outline-white btn--lg" id="footer-cta-login">
            Sign In
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ── Footer ─────────────────────────────────────── -->
    <footer class="footer">
      <div class="footer__inner">
        <div class="footer__brand">
          <span class="navbar__logo">🌿</span>
          <span class="navbar__name">Agri<strong>Market</strong></span>
        </div>
        <p class="footer__copy">© {{ new Date().getFullYear() }} Agri Market — Ethiopian Farmers B2B Marketplace</p>
      </div>
    </footer>

  </div>
</template>

<style scoped>
/* ── Layout ───────────────────────────────── */
.landing { display: flex; flex-direction: column; min-height: 100vh; }

/* ── Navbar ───────────────────────────────── */
.navbar {
  position: sticky; top: 0; z-index: 50;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: 0 1.5rem;
}
.navbar__inner {
  max-width: 1200px; margin: 0 auto;
  height: 60px; display: flex; align-items: center; justify-content: space-between;
}
.navbar__brand { display: flex; align-items: center; gap: .5rem; font-size: 1.15rem; font-weight: 700; text-decoration: none; }
.navbar__logo  { font-size: 1.4rem; }
.navbar__name  { color: var(--text-primary); }
.navbar__name strong { color: var(--brand-green); }
.navbar__actions { display: flex; gap: .6rem; align-items: center; }

/* ── Hero ─────────────────────────────────── */
.hero {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%);
  padding: 4.5rem 1.5rem 4rem;
  display: flex; align-items: center; justify-content: center; gap: 3.5rem;
  flex-wrap: wrap;
}
.hero__bg-pattern {
  position: absolute; inset: 0;
  background-image: radial-gradient(circle at 20% 80%, rgba(255,255,255,.05) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(245,158,11,.1) 0%, transparent 50%);
  pointer-events: none;
}
.hero__content { max-width: 540px; position: relative; z-index: 1; }
.hero__badge {
  display: inline-block;
  background: rgba(255,255,255,.12); color: rgba(255,255,255,.95);
  padding: 0.3rem 0.85rem; border-radius: var(--radius-full); font-size: 0.8125rem; font-weight: 600;
  margin-bottom: 1.25rem; backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,.2);
}
.hero__title {
  font-size: clamp(2rem, 4.5vw, 3rem);
  color: #fff; line-height: 1.15; margin-bottom: 1rem;
}
.hero__title-accent { color: var(--brand-gold); }
.hero__subtitle { color: rgba(255,255,255,.85); font-size: 1rem; line-height: 1.65; margin-bottom: 2rem; }
.hero__cta { display: flex; gap: 0.85rem; flex-wrap: wrap; }

.hero__visual {
  position: relative; width: 300px; flex-shrink: 0; display: flex; flex-direction: column; gap: 0.85rem;
}
.hero__card {
  background: rgba(255,255,255,.12); backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,.2); border-radius: var(--radius-md);
  padding: 0.85rem 1.15rem;
  display: flex; align-items: center; gap: 0.85rem;
  transition: transform .25s ease;
}
.hero__card:hover { transform: translateX(4px); }
.hero__card--1 { margin-left: 0; }
.hero__card--2 { margin-left: 1.25rem; }
.hero__card--3 { margin-left: .5rem; }
.hero__card-icon   { font-size: 1.5rem; }
.hero__card-label  { color: rgba(255,255,255,.8); font-size: .75rem; }
.hero__card-price  { color: #fff; font-weight: 700; font-size: 0.95rem; }
.hero__card-badge  {
  margin-left: auto; background: var(--brand-green); color: #fff;
  font-size: .6875rem; font-weight: 700; padding: .15rem .5rem;
  border-radius: var(--radius-full);
}

/* ── Stats ────────────────────────────────── */
.stats { background: #047857; padding: 1.75rem 1.5rem; }
.stats__inner {
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 1rem;
}
.stat { text-align: center; }
.stat__value { font-size: 1.75rem; font-weight: 800; color: #fff; line-height: 1; }
.stat__label { font-size: .8125rem; color: rgba(255,255,255,.8); margin-top: .25rem; }

/* ── Section shared ───────────────────────── */
.section-container { max-width: 1200px; margin: 0 auto; padding: 4rem 1.5rem; }
.section-header    { text-align: center; margin-bottom: 2.75rem; }
.section-badge {
  display: inline-block;
  background: var(--brand-green-light); color: var(--brand-green-dark);
  padding: 0.25rem 0.8rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700;
  margin-bottom: 0.6rem; border: 1px solid var(--brand-green-border);
}
.section-title    { font-size: clamp(1.5rem, 3.5vw, 2.1rem); color: var(--text-primary); margin-bottom: 0.5rem; }
.section-subtitle { color: var(--text-secondary); font-size: 0.95rem; max-width: 520px; margin: 0 auto; }

/* ── Features ─────────────────────────────── */
.features { background: var(--surface-alt); }
.features__grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem;
}
.feature-card {
  background: var(--surface-card); border-radius: var(--radius-md);
  padding: 1.5rem; border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  transition: transform .2s, box-shadow .2s;
}
.feature-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: rgba(16, 185, 129, 0.3); }
.feature-card__icon  {
  width: 44px; height: 44px; border-radius: var(--radius-sm);
  background: var(--surface-alt); display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; margin-bottom: 1rem; border: 1px solid var(--border-subtle);
}
.feature-card__title { font-size: 1.05rem; color: var(--text-primary); margin-bottom: .35rem; font-weight: 700; }
.feature-card__desc  { color: var(--text-secondary); font-size: .875rem; line-height: 1.55; }

/* ── Crops ────────────────────────────────── */
.crops__grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;
}
.crop-card {
  background: var(--surface-card); border: 1px solid var(--border); border-radius: var(--radius-md);
  padding: 1.35rem 1rem; text-align: center;
  box-shadow: var(--shadow-xs);
  transition: transform .2s, box-shadow .2s;
  cursor: default;
}
.crop-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--brand-green); }
.crop-card__emoji { font-size: 2rem; margin-bottom: .5rem; }
.crop-card__name  { font-weight: 700; color: var(--text-primary); margin-bottom: .2rem; font-size: 0.95rem; }
.crop-card__desc  { font-size: .8125rem; color: var(--text-muted); }

/* ── How It Works ─────────────────────────── */
.how { background: var(--surface-alt); }
.how__steps {
  display: flex; align-items: flex-start; gap: 1.25rem;
  justify-content: center; flex-wrap: wrap;
}
.how__step {
  max-width: 260px; text-align: center; padding: 1.5rem 1.25rem;
  background: var(--surface-card); border-radius: var(--radius-md); border: 1px solid var(--border);
  box-shadow: var(--shadow-xs);
  flex: 1; min-width: 200px;
}
.how__step-num {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--brand-green); color: #fff;
  font-size: 0.9rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1rem;
}
.how__step-title { font-size: 0.95rem; color: var(--text-primary); margin-bottom: .35rem; font-weight: 700; }
.how__step-desc  { color: var(--text-secondary); font-size: .85rem; line-height: 1.55; }
.how__connector  { color: var(--brand-green); font-size: 1.5rem; margin-top: 3rem; display: none; }
@media (min-width: 900px) { .how__connector { display: block; } }

/* ── CTA Banner ───────────────────────────── */
.cta-banner {
  background: linear-gradient(135deg, #047857 0%, #064e3b 100%);
  padding: 4rem 1.5rem;
}
.cta-banner__inner { max-width: 650px; margin: 0 auto; text-align: center; }
.cta-banner__title { font-size: clamp(1.5rem, 3.5vw, 2.1rem); color: #fff; margin-bottom: 0.75rem; font-weight: 700; }
.cta-banner__sub   { color: rgba(255,255,255,.8); font-size: 0.95rem; margin-bottom: 2rem; }
.cta-banner__actions { display: flex; gap: 0.85rem; justify-content: center; flex-wrap: wrap; }

/* ── Footer ───────────────────────────────── */
.footer { background: #06170e; padding: 1.75rem 1.5rem; }
.footer__inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
}
.footer__brand { display: flex; align-items: center; gap: .5rem; font-size: 1.05rem; color: #fff; font-weight: 700; }
.footer__brand .navbar__name strong { color: var(--brand-gold); }
.footer__copy  { color: rgba(255,255,255,.5); font-size: .8125rem; }
</style>
