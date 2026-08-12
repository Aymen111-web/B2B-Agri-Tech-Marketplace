import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    // ── Public ──────────────────────────────────────────
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue'),
      meta: { guest: true, title: 'Agri Market — Ethiopian Farmers Marketplace' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guest: true, title: 'Login — Agri Market' },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { guest: true, title: 'Create Account — Agri Market' },
    },
    {
      path: '/verify-otp',
      name: 'verify-otp',
      component: () => import('@/views/auth/OtpView.vue'),
      meta: { guest: true, title: 'Verify Phone — Agri Market' },
    },

    // ── Authenticated (placeholder — will expand in future tasks) ──
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true, title: 'Dashboard — Agri Market' },
    },

    // ── Catch-all ──────────────────────────────────────
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// ── Navigation Guards ─────────────────────────────────────────────
router.beforeEach((to) => {
  // Update document title
  document.title = to.meta.title || 'Agri Market'

  const auth = useAuthStore()

  // Protected route: redirect to login if not authenticated
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' }
  }

  // Guest-only route: redirect authenticated users to dashboard
  if (to.meta.guest && auth.isAuthenticated && to.name !== 'landing') {
    return { name: 'dashboard' }
  }
})

export default router
