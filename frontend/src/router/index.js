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

    // ── Authenticated ─────────────────────────────────
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true, title: 'Dashboard — Agri Market' },
    },
    {
      path: '/capabilities/apply',
      name: 'capability-apply',
      component: () => import('@/views/capabilities/CapabilityApplyView.vue'),
      meta: { requiresAuth: true, title: 'Apply for Capability — Agri Market' },
    },
    {
      path: '/admin/capability-applications',
      name: 'admin-capability-approval',
      component: () => import('@/views/admin/AdminCapabilityApprovalView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, title: 'Admin Capability Approvals — Agri Market' },
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

  // Admin route: redirect to dashboard if not admin
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'dashboard' }
  }

  // Guest-only route: redirect authenticated users to dashboard
  if (to.meta.guest && auth.isAuthenticated && to.name !== 'landing') {
    return { name: 'dashboard' }
  }
})

export default router
