import { ref, computed, onMounted } from 'vue'
import { api, setAuthToken, clearAuthToken, getAuthToken, mapBackendUserToFrontend } from '@/services/api'

const INITIAL_BUYER = {
    id: 'buyer-1',
    name: 'Alemayehu Tadesse',
    email: 'buyer@addissupply.et',
    phone: '+251 911 234 567',
    role: 'buyer',
    status: 'verified',
    region: 'Addis Ababa',
    companyName: 'Addis Supply Co.',
    businessType: 'wholesaler',
    totalOrdered: 340000,
    createdAt: new Date('2024-01-15'),
}

const INITIAL_FARMER = {
    id: 'farmer-1',
    name: 'Dawit Bekele',
    email: 'dawit@sidamafarm.et',
    phone: '+251 912 345 678',
    role: 'farmer',
    status: 'verified',
    region: 'SNNPR',
    farmSize: 14.5,
    totalEarned: 890000,
    rating: 4.9,
    reviewCount: 38,
    crops: ['Coffee', 'Teff', 'Spices'],
    createdAt: new Date('2023-11-10'),
}

const INITIAL_ADMIN = {
    id: 'admin-1',
    name: 'AgriMarket Admin',
    email: 'admin@agrimarket.et',
    phone: '+251 911 000 000',
    role: 'admin',
    status: 'verified',
    region: 'Addis Ababa',
    createdAt: new Date('2023-01-01'),
}

// Shared reactive state (singleton across app)
const user = ref(null)
const isLoading = ref(false)
const error = ref(null)
let initialized = false

function loadUserFromStorage() {
    const savedUser = localStorage.getItem('agri_user_data')
    if (savedUser) {
        try {
            return JSON.parse(savedUser)
        } catch {
            // ignore
        }
    }
    const savedRole = localStorage.getItem('agri_role') || 'buyer'
    if (savedRole === 'farmer') return { ...INITIAL_FARMER }
    if (savedRole === 'admin') return { ...INITIAL_ADMIN }
    return { ...INITIAL_BUYER }
}

function syncUser(newUser) {
    user.value = newUser
    if (newUser) {
        localStorage.setItem('agri_user_data', JSON.stringify(newUser))
        localStorage.setItem('agri_role', newUser.role)
    } else {
        localStorage.removeItem('agri_user_data')
        localStorage.removeItem('agri_role')
    }
}

export function useAuth() {
    // Initialize on first use
    if (!initialized) {
        user.value = loadUserFromStorage()
        initialized = true

        // Check backend for current user if token exists
        const token = getAuthToken()
        if (token) {
            api.fetchCurrentUser()
                .then((res) => {
                    if (res && res.user) {
                        const mapped = mapBackendUserToFrontend(res.user)
                        syncUser(mapped)
                    }
                })
                .catch(() => {
                    // Token expired or invalid - keep local state
                })
        }
    }

    const loginWithCredentials = async (phone, pass) => {
        isLoading.value = true
        error.value = null

        try {
            const res = await api.login(phone, pass)
            setAuthToken(res.token)
            const mappedUser = mapBackendUserToFrontend(res.user)
            syncUser(mappedUser)
            isLoading.value = false
            return mappedUser
        } catch (err) {
            isLoading.value = false
            const msg = err.message || 'Login failed. Please check your credentials.'
            error.value = msg
            throw new Error(msg)
        }
    }

    const requestOtp = async (phone) => {
        try {
            const res = await api.requestOtp(phone)
            return res.message || 'Verification code sent successfully.'
        } catch (err) {
            throw new Error(err.message || 'Failed to send verification code.')
        }
    }

    const registerUser = async (data) => {
        isLoading.value = true
        error.value = null

        try {
            const res = await api.register(data)
            setAuthToken(res.token)
            const mappedUser = mapBackendUserToFrontend(res.user)
            syncUser(mappedUser)
            isLoading.value = false
            return mappedUser
        } catch (err) {
            isLoading.value = false
            const msg = err.message || 'Registration failed. Please try again.'
            error.value = msg
            throw new Error(msg)
        }
    }

    const switchRole = (newRole) => {
        if (!user.value) return
        localStorage.setItem('agri_active_role', newRole)
        syncUser({ ...user.value, role: newRole, activeRole: newRole })
    }

    const login = (role) => {
        let fallbackUser = { ...INITIAL_BUYER }
        if (role === 'farmer') fallbackUser = { ...INITIAL_FARMER }
        if (role === 'admin') fallbackUser = { ...INITIAL_ADMIN }
        syncUser(fallbackUser)
    }

    const logout = async () => {
        try {
            await api.logout()
        } catch {
            // ignore
        }
        localStorage.removeItem('agri_active_role')
        clearAuthToken()
        syncUser(null)
        initialized = false
    }

    const capabilities = computed(() => user.value?.capabilities || [user.value?.role || 'buyer'])
    const hasFarmerCapability = computed(() => user.value?.role === 'admin' || capabilities.value.includes('farmer'))
    const hasBuyerCapability = computed(() => user.value?.role === 'admin' || capabilities.value.includes('buyer'))
    const pendingApplications = computed(() => user.value?.pendingApplications || [])
    const isAuthenticated = computed(() => !!user.value)
    const role = computed(() => user.value?.activeRole || user.value?.role || 'buyer')

    return {
        user,
        role,
        capabilities,
        hasFarmerCapability,
        hasBuyerCapability,
        pendingApplications,
        isAuthenticated,
        isLoading,
        error,
        loginWithCredentials,
        requestOtp,
        registerUser,
        switchRole,
        login,
        logout,
    }
}
