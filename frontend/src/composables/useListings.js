import { ref, onMounted, watch } from 'vue'
import { api, getAuthToken } from '@/services/api'

const DEFAULT_PRODUCE = []

function mapRawListingToFrontend(item) {
    return {
        id: String(item.id),
        farmerId: String(item.farmer_id || item.farmerId || 'farmer-1'),
        farmer: item.farmer ? {
            id: String(item.farmer.id || 'farmer-1'),
            name: `${item.farmer.first_name || ''} ${item.farmer.second_name || ''}`.trim() || item.farmer.name || 'Dawit Bekele',
            email: item.farmer.email || 'farmer@agri.et',
            phone: item.farmer.phone || '+251 912 345 678',
            role: 'farmer', status: 'verified', region: item.farmer.region || 'SNNPR',
            farmSize: item.farmer.farmSize || 0, totalEarned: 0, rating: 0, reviewCount: 0, crops: [], createdAt: new Date(),
        } : { name: 'Unknown Farmer', role: 'farmer', region: 'Unknown' },
        cropName: item.title || item.cropName || 'Produce',
        cropEmoji: item.crop_emoji || item.cropEmoji || '🌾',
        category: item.category?.slug || item.category || 'grains',
        grade: item.grade || 'Grade 1',
        region: item.region || 'Sidama',
        zone: item.zone || 'Zone 1',
        process: item.process || 'Sun-dried',
        pricePerKg: Number(item.price_per_unit ?? item.pricePerKg ?? 50),
        availableQty: Number(item.quantity_available ?? item.availableQty ?? 1000),
        minOrderQty: Number(item.min_order_qty ?? item.minOrderQty ?? 100),
        harvestDate: item.harvest_date ? new Date(item.harvest_date) : new Date(),
        description: item.description || '',
        images: item.image_path ? [`http://127.0.0.1:8000/storage/${item.image_path}`] : (item.images || []),
        isActive: item.status === 'active' || item.isActive !== false,
        isVerified: true,
        createdAt: item.created_at ? new Date(item.created_at) : new Date(),
        viewCount: item.view_count || item.viewCount || 1,
    }
}

export function useListings() {
    const listings = ref([])
    const isLoading = ref(false)

    // Load from localStorage or use default produce list
    const saved = localStorage.getItem('agri_listings')
    if (saved) {
        try {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed) && parsed.length > 0) {
                listings.value = parsed.map((item) => ({
                    ...item,
                    harvestDate: new Date(item.harvestDate),
                    createdAt: new Date(item.createdAt),
                }))
            } else {
                listings.value = [...DEFAULT_PRODUCE]
            }
        } catch {
            listings.value = [...DEFAULT_PRODUCE]
        }
    } else {
        listings.value = [...DEFAULT_PRODUCE]
    }

    const refreshListings = async () => {
        isLoading.value = true
        try {
            const userData = localStorage.getItem('agri_user_data')
            const token = getAuthToken()
            let role = 'buyer'
            if (userData) {
                try {
                    const parsed = JSON.parse(userData)
                    role = parsed.activeRole || parsed.role || 'buyer'
                } catch { /* ignore */ }
            }

            const res = (token && role === 'farmer')
                ? await api.fetchMyListings()
                : await api.fetchPublicListings()

            const rawItems = Array.isArray(res) ? res : (res?.data || [])
            listings.value = rawItems.map(mapRawListingToFrontend)
        } catch {
            // Keep current listings if API fails
        } finally {
            isLoading.value = false
        }
    }

    // Persist to localStorage on change
    watch(listings, (val) => {
        localStorage.setItem('agri_listings', JSON.stringify(val))
    }, { deep: true })

    // Refresh on mount
    onMounted(() => {
        refreshListings()
    })

    const addListing = async (newListingData) => {
        const token = getAuthToken()

        if (token) {
            try {
                const formData = new FormData()
                formData.append('title', newListingData.cropName || '')
                formData.append('category_id', newListingData.category === 'coffee' ? 1 : 2)
                if (newListingData.description) formData.append('description', newListingData.description)
                formData.append('unit', 'kg')
                formData.append('price_per_unit', newListingData.pricePerKg || 0)
                formData.append('quantity_available', newListingData.availableQty || 0)
                if (newListingData.minOrderQty) formData.append('minimum_order_quantity', newListingData.minOrderQty)
                if (newListingData.harvestDate) formData.append('harvest_date', new Date(newListingData.harvestDate).toISOString().split('T')[0])
                if (newListingData.grade) formData.append('quality_grade', newListingData.grade)

                if (newListingData.images && newListingData.images.length > 0) {
                    newListingData.images.forEach((file) => {
                        if (file instanceof File || file instanceof Blob) {
                            formData.append('images[]', file)
                        }
                    })
                }

                const res = await api.createListing(formData)
                if (res?.listing) {
                    const created = mapRawListingToFrontend(res.listing)
                    listings.value = [created, ...listings.value]
                    return created
                }
            } catch {
                // Fallback to local creation
            }
        }

        const created = {
            ...newListingData,
            id: `listing-${Date.now()}`,
            createdAt: new Date(),
            viewCount: 1,
        }
        listings.value = [created, ...listings.value]
        return created
    }

    const getListingById = (id) => {
        if (!id) return null
        return listings.value.find((item) => String(item.id) === String(id))
    }

    const filterListings = (category, query) => {
        return listings.value.filter((item) => {
            const matchCat = !category || category === 'all' || item.category === category
            const matchQuery =
                !query ||
                item.cropName.toLowerCase().includes(query.toLowerCase()) ||
                item.region.toLowerCase().includes(query.toLowerCase()) ||
                item.farmer?.name?.toLowerCase().includes(query.toLowerCase()) ||
                item.grade.toLowerCase().includes(query.toLowerCase())
            return matchCat && matchQuery
        })
    }

    return {
        listings,
        isLoading,
        refreshListings,
        addListing,
        getListingById,
        filterListings,
    }
}
