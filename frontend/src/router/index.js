import { createRouter, createWebHistory } from 'vue-router'
import { getAuthToken } from '@/services/api'

// Layouts
import BuyerLayout from '@/components/layout/BuyerLayout.vue'
import FarmerLayout from '@/components/layout/FarmerLayout.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'

// Auth Pages
import Login from '@/pages/auth/Login.vue'
import Register from '@/pages/auth/Register.vue'
import CapabilityApplication from '@/pages/auth/CapabilityApplication.vue'

// Buyer Pages
import BuyerHome from '@/pages/buyer/Home.vue'
import Marketplace from '@/pages/buyer/Marketplace.vue'
import ListingDetail from '@/pages/buyer/ListingDetail.vue'
import Checkout from '@/pages/buyer/Checkout.vue'
import BuyerOrders from '@/pages/buyer/Orders.vue'
import BuyerProfile from '@/pages/buyer/BuyerProfile.vue'
import Cart from '@/pages/buyer/Cart.vue'
import PaymentSuccess from '@/pages/buyer/PaymentSuccess.vue'

// Farmer Pages
import FarmerDashboard from '@/pages/farmer/Dashboard.vue'
import MyListings from '@/pages/farmer/MyListings.vue'
import NewListing from '@/pages/farmer/NewListing.vue'
import EditListing from '@/pages/farmer/EditListing.vue'
import FarmerOrders from '@/pages/farmer/FarmerOrders.vue'
import FarmerProfile from '@/pages/farmer/FarmerProfile.vue'

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard.vue'
import ApplicationReview from '@/pages/admin/ApplicationReview.vue'
import ListingModeration from '@/pages/admin/ListingModeration.vue'
import OrderManagement from '@/pages/admin/OrderManagement.vue'
import DisputeCenter from '@/pages/admin/DisputeCenter.vue'
import UserManagement from '@/pages/admin/UserManagement.vue'

function getUserRole() {
    try {
        const userData = localStorage.getItem('agri_user_data')
        if (userData) {
            const user = JSON.parse(userData)
            return user.activeRole || user.role || 'buyer'
        }
    } catch { /* ignore */ }
    return localStorage.getItem('agri_role') || 'buyer'
}

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'Login', component: Login },
    { path: '/register', name: 'Register', component: Register },
    { path: '/apply', name: 'CapabilityApplication', component: CapabilityApplication },
    { path: '/payment/success', name: 'PaymentSuccess', component: PaymentSuccess },
    {
        path: '/buyer',
        component: BuyerLayout,
        meta: { requiresAuth: true, allowedRoles: ['buyer'] },
        children: [
            { path: '', name: 'BuyerHome', component: BuyerHome },
            { path: 'marketplace', name: 'Marketplace', component: Marketplace },
            { path: 'listing/:id', name: 'ListingDetail', component: ListingDetail },
            { path: 'cart', name: 'BuyerCart', component: Cart },
            { path: 'checkout', name: 'Checkout', component: Checkout },
            { path: 'checkout/:id', name: 'CheckoutListing', component: Checkout },
            { path: 'payment-success', name: 'BuyerPaymentSuccess', component: PaymentSuccess },
            { path: 'orders', name: 'BuyerOrders', component: BuyerOrders },
            { path: 'profile', name: 'BuyerProfile', component: BuyerProfile },
        ],
    },
    {
        path: '/farmer',
        component: FarmerLayout,
        meta: { requiresAuth: true, allowedRoles: ['farmer'] },
        children: [
            { path: '', name: 'FarmerDashboard', component: FarmerDashboard },
            { path: 'listings', name: 'MyListings', component: MyListings },
            { path: 'listings/new', name: 'NewListing', component: NewListing },
            { path: 'listings/edit/:id', name: 'EditListing', component: EditListing },
            { path: 'orders', name: 'FarmerOrders', component: FarmerOrders },
            { path: 'profile', name: 'FarmerProfile', component: FarmerProfile },
        ],
    },
    {
        path: '/admin',
        component: AdminLayout,
        meta: { requiresAuth: true, allowedRoles: ['admin'] },
        children: [
            { path: '', name: 'AdminDashboard', component: AdminDashboard },
            { path: 'applications', name: 'ApplicationReview', component: ApplicationReview },
            { path: 'listings', name: 'ListingModeration', component: ListingModeration },
            { path: 'orders', name: 'OrderManagement', component: OrderManagement },
            { path: 'disputes', name: 'DisputeCenter', component: DisputeCenter },
            { path: 'users', name: 'UserManagement', component: UserManagement },
        ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Navigation guard
router.beforeEach((to, from, next) => {
    const token = getAuthToken()
    const userData = localStorage.getItem('agri_user_data')

    if (to.meta.requiresAuth) {
        if (!token && !userData) {
            return next('/login')
        }

        const userRole = getUserRole()
        const allowed = to.meta.allowedRoles

        if (allowed && !allowed.includes(userRole)) {
            if (userRole === 'farmer') return next('/farmer')
            if (userRole === 'admin') return next('/admin')
            return next('/buyer')
        }
    }

    next()
})

export default router
