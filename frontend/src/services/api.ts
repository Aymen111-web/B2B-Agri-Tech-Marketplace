import { User, UserRole } from '@/types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export function getAuthToken(): string | null {
    return localStorage.getItem('agri_auth_token');
}

export function setAuthToken(token: string): void {
    localStorage.setItem('agri_auth_token', token);
}

export function clearAuthToken(): void {
    localStorage.removeItem('agri_auth_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken();
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
        'Accept': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const primaryUrl = `${API_BASE_URL}${endpoint}`;

    try {
        let response = await fetch(primaryUrl, { ...options, headers });

        // If 404 or failed on local proxy, try direct backend URL fallback
        if (response.status === 404 && API_BASE_URL === '/api') {
            const fallbackUrl = `http://127.0.0.1:8000/api${endpoint}`;
            const fallbackRes = await fetch(fallbackUrl, { ...options, headers }).catch(() => null);
            if (fallbackRes && fallbackRes.ok) {
                response = fallbackRes;
            }
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const errorMessage = data?.error || data?.message || `HTTP ${response.status}: Server request failed`;
            throw new Error(errorMessage);
        }

        return data as T;
    } catch (err: any) {
        // If primary network fetch threw an error (e.g. proxy missing), try direct backend URL
        if (API_BASE_URL === '/api') {
            try {
                const directUrl = `http://127.0.0.1:8000/api${endpoint}`;
                const directRes = await fetch(directUrl, { ...options, headers });
                const data = await directRes.json().catch(() => ({}));
                if (!directRes.ok) {
                    throw new Error(data?.error || data?.message || `HTTP ${directRes.status}: Server request failed`);
                }
                return data as T;
            } catch (fallbackErr: any) {
                throw new Error(fallbackErr.message || err.message || 'Server request failed');
            }
        }
        throw err;
    }
}

export interface LoginResponse {
    message: string;
    user: any;
    token: string;
}

export interface RegisterResponse {
    message: string;
    user: any;
    token: string;
}

export function normalizeEthiopianPhone(phone: string): string {
    const raw = phone.trim();
    const digits = raw.replace(/[^\d]/g, '');

    if (/^0[79]\d{8}$/.test(digits)) {
        return '+251' + digits.substring(1);
    } else if (/^251[79]\d{8}$/.test(digits)) {
        return '+' + digits;
    } else if (/^[79]\d{8}$/.test(digits)) {
        return '+251' + digits;
    }
    return raw;
}

export const api = {
    // Auth endpoints
    async requestOtp(phone: string): Promise<{ message: string }> {
        const normalizedPhone = normalizeEthiopianPhone(phone);
        return request<{ message: string }>('/auth/request-otp', {
            method: 'POST',
            body: JSON.stringify({ phone: normalizedPhone }),
        });
    },

    async login(phone: string, password: string): Promise<LoginResponse> {
        const normalizedPhone = normalizeEthiopianPhone(phone);
        return request<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ phone: normalizedPhone, password }),
        });
    },

    async register(data: {
        first_name: string;
        second_name: string;
        phone: string;
        password: string;
        code?: string;
        role: UserRole;
    }): Promise<RegisterResponse> {
        const normalizedData = {
            ...data,
            phone: normalizeEthiopianPhone(data.phone),
        };
        return request<RegisterResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(normalizedData),
        });
    },

    async fetchCurrentUser(): Promise<{ user: any }> {
        return request<{ user: any }>('/user');
    },

    // Profile Management Endpoints
    async updateProfile(data: FormData | Record<string, any>): Promise<{ message: string; user: any }> {
        const isFormData = data instanceof FormData;
        return request<{ message: string; user: any }>('/profile', {
            method: isFormData ? 'POST' : 'PUT',
            body: isFormData ? data : JSON.stringify(data),
        });
    },

    // Capability Applications
    async submitCapabilityApplication(data: {
        capability_type: 'farmer' | 'buyer';
        supporting_documents?: string[];
    }): Promise<any> {
        return request<any>('/capability-applications', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async fetchMyCapabilityApplications(): Promise<{ applications: any[] }> {
        return request<{ applications: any[] }>('/capability-applications/my');
    },

    // Farmer Produce Listings Endpoints
    async fetchMyListings(): Promise<{ data: any[] } | any[]> {
        return request<any>('/listings/my');
    },

    async fetchPublicListings(params?: { category_id?: number; search?: string }): Promise<any> {
        const queryStr = params ? new URLSearchParams(params as any).toString() : '';
        return request<any>(`/listings${queryStr ? `?${queryStr}` : ''}`);
    },

    async createListing(listingData: FormData | Record<string, any>): Promise<{ message: string; listing: any }> {
        const isFormData = listingData instanceof FormData;
        return request<{ message: string; listing: any }>('/listings', {
            method: 'POST',
            body: isFormData ? listingData : JSON.stringify(listingData),
        });
    },

    async updateListing(id: string | number, listingData: FormData | Record<string, any>): Promise<{ message: string; listing: any }> {
        const isFormData = listingData instanceof FormData;
        return request<{ message: string; listing: any }>(`/listings/${id}`, {
            method: isFormData ? 'POST' : 'PUT',
            body: isFormData ? listingData : JSON.stringify(listingData),
        });
    },

    async deleteListing(id: string | number): Promise<{ message: string }> {
        return request<{ message: string }>(`/listings/${id}`, {
            method: 'DELETE',
        });
    },

    // Orders & Order Fulfillments Endpoints
    async fetchMyFulfillments(): Promise<{ data: any[] } | any[]> {
        return request<any>('/fulfillments');
    },

    async updateFulfillmentStatus(id: string | number, statusAction: 'accept' | 'reject' | 'complete', note?: string): Promise<{ message: string }> {
        return request<{ message: string }>(`/fulfillments/${id}/${statusAction}`, {
            method: 'POST',
            body: JSON.stringify({ note }),
        });
    },

    async fetchMyOrders(): Promise<{ data: any[] } | any[]> {
        return request<any>('/orders');
    },

    // Payouts Endpoints
    async fetchPayoutSummary(): Promise<any> {
        return request<any>('/payouts/summary');
    },

    async fetchPayouts(): Promise<any> {
        return request<any>('/payouts');
    },

    async logout(): Promise<{ message: string }> {
        try {
            return await request<{ message: string }>('/auth/logout', { method: 'POST' });
        } finally {
            clearAuthToken();
        }
    },
};

/**
 * Normalizes backend DB User response to Frontend User interface
 */
export function mapBackendUserToFrontend(rawUser: any): User {
    let role: UserRole = 'buyer';
    const activeCapabilities: string[] = [];
    const pendingApplications: string[] = [];

    if (rawUser.is_admin || rawUser.isAdmin) {
        role = 'admin';
        activeCapabilities.push('admin', 'farmer', 'buyer');
    } else if (rawUser.capabilities && Array.isArray(rawUser.capabilities)) {
        rawUser.capabilities.forEach((c: any) => {
            const type = typeof c === 'string' ? c : c.capability_type;
            const status = typeof c === 'object' && c.status ? c.status : 'active';
            if (status === 'active' && type) {
                activeCapabilities.push(type);
            }
        });

        if (activeCapabilities.includes('farmer')) role = 'farmer';
        else if (activeCapabilities.includes('buyer')) role = 'buyer';
    }

    if (rawUser.capability_applications && Array.isArray(rawUser.capability_applications)) {
        rawUser.capability_applications.forEach((app: any) => {
            if (app.status === 'pending' && app.capability_type) {
                pendingApplications.push(app.capability_type);
            }
        });
    }

    // Default to buyer if no capabilities array present
    if (activeCapabilities.length === 0 && role !== 'admin') {
        activeCapabilities.push('buyer');
    }

    const savedRole = localStorage.getItem('agri_active_role') as UserRole;
    const activeRole = savedRole && activeCapabilities.includes(savedRole) ? savedRole : role;

    const name = rawUser.name || `${rawUser.first_name || ''} ${rawUser.second_name || ''}`.trim() || 'User';

    return {
        id: String(rawUser.id || 'usr-1'),
        name,
        email: rawUser.email || `${rawUser.phone}@agri.et`,
        phone: rawUser.phone || '',
        role: activeRole,
        activeRole,
        capabilities: activeCapabilities,
        pendingApplications,
        status: rawUser.account_status || 'verified',
        region: rawUser.region || 'Addis Ababa',
        avatar: rawUser.profile_photo_url || rawUser.profile_photo_path ? (rawUser.profile_photo_url || `http://127.0.0.1:8000/storage/${rawUser.profile_photo_path}`) : undefined,
        createdAt: rawUser.created_at ? new Date(rawUser.created_at) : new Date(),
    };
}
