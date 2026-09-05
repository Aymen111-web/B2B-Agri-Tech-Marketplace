import { useState, useEffect, useCallback } from 'react';
import { User, Buyer, Farmer, UserRole } from '@/types';
import { api, setAuthToken, clearAuthToken, getAuthToken, mapBackendUserToFrontend } from '@/services/api';

const INITIAL_BUYER: Buyer = {
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
};

const INITIAL_FARMER: Farmer = {
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
};

const INITIAL_ADMIN: User = {
    id: 'admin-1',
    name: 'AgriMarket Admin',
    email: 'admin@agrimarket.et',
    phone: '+251 911 000 000',
    role: 'admin',
    status: 'verified',
    region: 'Addis Ababa',
    createdAt: new Date('2023-01-01'),
};

export function useAuth() {
    const [user, setUser] = useState<User | Buyer | Farmer | null>(() => {
        const savedUser = localStorage.getItem('agri_user_data');
        if (savedUser) {
            try { return JSON.parse(savedUser); } catch { }
        }
        const savedRole = (localStorage.getItem('agri_role') as UserRole) || 'buyer';
        if (savedRole === 'farmer') return INITIAL_FARMER;
        if (savedRole === 'admin') return INITIAL_ADMIN;
        return INITIAL_BUYER;
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const syncUser = useCallback((newUser: User | Buyer | Farmer | null) => {
        setUser(newUser);
        if (newUser) {
            localStorage.setItem('agri_user_data', JSON.stringify(newUser));
            localStorage.setItem('agri_role', newUser.role);
        } else {
            localStorage.removeItem('agri_user_data');
            localStorage.removeItem('agri_role');
        }
    }, []);

    // Check backend current user if token exists
    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            api.fetchCurrentUser()
                .then((res) => {
                    if (res && res.user) {
                        const mapped = mapBackendUserToFrontend(res.user);
                        syncUser(mapped);
                    }
                })
                .catch(() => {
                    // Token expired or invalid
                });
        }
    }, [syncUser]);

    /**
     * Secure Credential Login against REST API
     */
    const loginWithCredentials = async (phone: string, pass: string): Promise<User> => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await api.login(phone, pass);
            setAuthToken(res.token);
            const mappedUser = mapBackendUserToFrontend(res.user);
            syncUser(mappedUser);
            setIsLoading(false);
            return mappedUser;
        } catch (err: any) {
            setIsLoading(false);
            const msg = err.message || 'Login failed. Please check your credentials.';
            setError(msg);
            throw new Error(msg);
        }
    };

    /**
     * Request OTP Verification Code
     */
    const requestOtp = async (phone: string): Promise<string> => {
        try {
            const res = await api.requestOtp(phone);
            return res.message || 'Verification code sent successfully.';
        } catch (err: any) {
            throw new Error(err.message || 'Failed to send verification code.');
        }
    };

    /**
     * User Registration against REST API with OTP Code
     */
    const registerUser = async (data: {
        first_name: string;
        second_name: string;
        phone: string;
        password: string;
        code?: string;
        role: UserRole;
    }): Promise<User> => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await api.register(data);
            setAuthToken(res.token);
            const mappedUser = mapBackendUserToFrontend(res.user);
            syncUser(mappedUser);
            setIsLoading(false);
            return mappedUser;
        } catch (err: any) {
            setIsLoading(false);
            const msg = err.message || 'Registration failed. Please try again.';
            setError(msg);
            throw new Error(msg);
        }
    };

    const switchRole = useCallback((newRole: UserRole) => {
        if (!user) return;
        localStorage.setItem('agri_active_role', newRole);
        const updatedUser = { ...user, role: newRole, activeRole: newRole };
        syncUser(updatedUser);
    }, [user, syncUser]);

    /**
     * Offline/Dev Fallback Login
     */
    const login = (role: UserRole) => {
        let fallbackUser: User | Buyer | Farmer = INITIAL_BUYER;
        if (role === 'farmer') fallbackUser = INITIAL_FARMER;
        if (role === 'admin') fallbackUser = INITIAL_ADMIN;
        syncUser(fallbackUser);
    };

    const logout = async () => {
        try {
            await api.logout();
        } catch { }
        localStorage.removeItem('agri_active_role');
        clearAuthToken();
        syncUser(null);
    };

    const capabilities = user?.capabilities || [user?.role || 'buyer'];
    const hasFarmerCapability = user?.role === 'admin' || capabilities.includes('farmer');
    const hasBuyerCapability = user?.role === 'admin' || capabilities.includes('buyer');
    const pendingApplications = user?.pendingApplications || [];

    return {
        user,
        role: user?.activeRole || user?.role || 'buyer',
        capabilities,
        hasFarmerCapability,
        hasBuyerCapability,
        pendingApplications,
        isAuthenticated: !!user,
        isLoading,
        error,
        loginWithCredentials,
        requestOtp,
        registerUser,
        switchRole,
        login,
        logout,
    };
}
