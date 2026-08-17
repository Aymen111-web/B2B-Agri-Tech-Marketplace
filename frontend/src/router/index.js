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
      meta: { guest: true, hideSidebar: true, title: 'Agri Market — Ethiopian Farmers Marketplace' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guest: true, hideSidebar: true, title: 'Login — Agri Market' },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { guest: true, hideSidebar: true, title: 'Create Account — Agri Market' },
    },
    {
      path: '/verify-otp',
      name: 'verify-otp',
      component: () => import('@/views/auth/OtpView.vue'),
      meta: { guest: true, hideSidebar: true, title: 'Verify Phone — Agri Market' },
    },

    // ── Public Marketplace ────────────────────────────────
    {
      path: '/listings',
      name: 'listings',
      component: () => import('@/views/listings/ListingsView.vue'),
      meta: { title: 'Produce Marketplace — Agri Market' },
    },
    {
      path: '/listings/:id',
      name: 'listing-detail',
      component: () => import('@/views/listings/ListingDetailView.vue'),
      meta: { title: 'Produce Details — Agri Market' },
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/cart/CartView.vue'),
      meta: { requiresAuth: true, title: 'Your Produce Cart — Agri Market' },
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/checkout/CheckoutView.vue'),
      meta: { requiresAuth: true, title: 'Order Checkout — Agri Market' },
    },
    {
      path: '/orders',
      name: 'orders-list',
      component: () => import('@/views/orders/OrdersListView.vue'),
      meta: { requiresAuth: true, title: 'My Produce Orders — Agri Market' },
    },
    {
      path: '/orders/:id',
      name: 'order-detail',
      component: () => import('@/views/orders/OrderDetailView.vue'),
      meta: { requiresAuth: true, title: 'Order Confirmation — Agri Market' },
    },

    // ── Authenticated ─────────────────────────────────
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true, title: 'Dashboard — Agri Market' },
    },
    {
      path: '/farmer/listings',
      name: 'farmer-listings',
      component: () => import('@/views/farmer/FarmerListingsView.vue'),
      meta: { requiresAuth: true, requiresFarmer: true, title: 'Farmer Produce Portal — Agri Market' },
    },
    {
      path: '/farmer/fulfillments',
      name: 'farmer-fulfillments',
      component: () => import('@/views/farmer/FarmerFulfillmentsView.vue'),
      meta: { requiresAuth: true, requiresFarmer: true, title: 'Farmer Fulfillment Portal — Agri Market' },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/profile/ProfileView.vue'),
      meta: { requiresAuth: true, title: 'My Profile — Agri Market' },
    },
    {
      path: '/capabilities/apply',
      name: 'capability-apply',
      component: () => import('@/views/capabilities/CapabilityApplyView.vue'),
      meta: { requiresAuth: true, title: 'Apply for Capability — Agri Market' },
    },
    {
      path: '/admin',
      redirect: '/admin/capability-applications',
    },
    {
      path: '/admin/dashboard',
      redirect: '/admin/capability-applications',
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

  // Farmer route: redirect to capability apply if no active farmer capability
  if (to.meta.requiresFarmer) {
    const hasFarmer = auth.user?.capabilities?.some(c => c.capability_type === 'farmer' && c.status === 'active')
    if (!hasFarmer && !auth.isAdmin) {
      return { name: 'capability-apply' }
    }
  }

  // Guest-only route: redirect authenticated users to dashboard
  if (to.meta.guest && auth.isAuthenticated && to.name !== 'landing') {
    return { name: 'dashboard' }
  }
})

export default router
